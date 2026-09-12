<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function backfill_uuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

$created = 0;
$linked = 0;
$conflicts = [];

$rows = $pdo->query("SELECT id, nidn, nama, user_id FROM dosen WHERE deleted_at IS NULL ORDER BY nama")->fetchAll(PDO::FETCH_ASSOC);

foreach ($rows as $row) {
    if (!empty($row['user_id'])) {
        $linked++;
        continue;
    }

    $nidn = trim((string)$row['nidn']);
    $stmt = $pdo->prepare('SELECT id, role FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1');
    $stmt->execute([$nidn]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        if (($existing['role'] ?? '') === 'dosen') {
            try {
                $link = $pdo->prepare('UPDATE dosen SET user_id = ? WHERE id = ? AND user_id IS NULL');
                $link->execute([$existing['id'], $row['id']]);
                $linked += $link->rowCount();
            } catch (Throwable $error) {
                $conflicts[] = sprintf('%s (%s): %s', $nidn, $row['nama'], $error->getMessage());
                error_log('DOSEN_BACKFILL_CONFLICT ' . end($conflicts));
            }
        } else {
            $conflicts[] = sprintf('%s (%s) dipakai role %s', $nidn, $row['nama'], $existing['role']);
            error_log('DOSEN_BACKFILL_CONFLICT ' . end($conflicts));
        }
        continue;
    }

    $pdo->beginTransaction();
    try {
        $userId = backfill_uuid();
        $insert = $pdo->prepare('INSERT INTO users (id, username, password_hash, nama, role, is_active) VALUES (?, ?, ?, ?, ?, 1)');
        $insert->execute([$userId, $nidn, password_hash($nidn, PASSWORD_BCRYPT), $row['nama'], 'dosen']);
        $link = $pdo->prepare('UPDATE dosen SET user_id = ? WHERE id = ?');
        $link->execute([$userId, $row['id']]);
        $pdo->commit();
        $created++;
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $conflicts[] = sprintf('%s (%s): %s', $nidn, $row['nama'], $error->getMessage());
        error_log('DOSEN_BACKFILL_CONFLICT ' . end($conflicts));
    }
}

echo "Akun dibuat: {$created}\n";
echo "Akun sudah/berhasil ditautkan: {$linked}\n";
echo 'Konflik: ' . count($conflicts) . "\n";
foreach ($conflicts as $conflict) {
    echo "- {$conflict}\n";
}
echo json_encode(['created'=>$created, 'linked'=>$linked, 'conflicts'=>$conflicts], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";

exit(count($conflicts) > 0 ? 2 : 0);
