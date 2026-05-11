<?php
/**
 * Ganti akun admin lama (username: admin) dengan akun baru AdminABT.
 * Hanya untuk production / satu kali jalan.
 *
 * Usage (dari root project):
 *   php backend/scripts/replace-admin-account.php
 *
 * Pastikan .env production sudah benar (DB_HOST, DB_NAME, DB_USER, DB_PASS).
 */

require_once __DIR__ . '/../config/database.php';

const NEW_USERNAME = 'AdminABT';
const NEW_PASSWORD = 'PoliABT*2026';
const NEW_NAMA = 'Administrator ABT';
const NEW_ADMIN_ID = 'admin-abt-001';

$oldUsername = 'admin';

echo "=== Replace Admin Account ===\n";

try {
    $pdo->beginTransaction();

    $getOld = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $getOld->execute([$oldUsername]);
    $oldRow = $getOld->fetch(PDO::FETCH_ASSOC);
    $oldId = $oldRow['id'] ?? null;

    $hash = password_hash(NEW_PASSWORD, PASSWORD_BCRYPT);
    if ($hash === false) {
        throw new RuntimeException('Gagal generate password hash.');
    }

    if ($oldId !== null) {
        echo "Menemukan akun lama: username={$oldUsername}, id={$oldId}\n";
        echo "Memperbarui referensi ke admin baru...\n";

        $tables = [
            'evaluations' => ['created_by', 'closed_by', 'deleted_by'],
            'evaluation_invitations' => ['created_by'],
            'prestasi_import_logs' => ['uploaded_by'],
            'record_change_logs' => ['admin_id'],
            'export_logs' => ['admin_id'],
            'students' => ['deleted_by'],
        ];

        foreach ($tables as $table => $cols) {
            foreach ($cols as $col) {
                try {
                    $stmt = $pdo->prepare("UPDATE {$table} SET {$col} = ? WHERE {$col} = ?");
                    $stmt->execute([NEW_ADMIN_ID, $oldId]);
                    if ($stmt->rowCount() > 0) {
                        echo "  - {$table}.{$col}: " . $stmt->rowCount() . " baris diperbarui\n";
                    }
                } catch (Throwable $e) {
                    if (strpos($e->getMessage(), 'Unknown column') !== false) {
                        continue;
                    }
                    throw $e;
                }
            }
        }

        $delAdmins = $pdo->prepare('DELETE FROM admins WHERE id = ?');
        $delAdmins->execute([$oldId]);
        $delUser = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $delUser->execute([$oldId]);
        echo "Akun lama dihapus.\n";
    } else {
        echo "Akun '{$oldUsername}' tidak ditemukan (akan hanya menambah admin baru).\n";
    }

    $insUser = $pdo->prepare("
        INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active)
        VALUES (?, ?, ?, ?, 'admin', NOW(), TRUE)
        ON DUPLICATE KEY UPDATE
            password_hash = VALUES(password_hash),
            nama = VALUES(nama),
            is_active = VALUES(is_active)
    ");
    $insUser->execute([NEW_ADMIN_ID, NEW_USERNAME, $hash, NEW_NAMA]);

    $insAdmin = $pdo->prepare('INSERT IGNORE INTO admins (id, created_at) VALUES (?, NOW())');
    $insAdmin->execute([NEW_ADMIN_ID]);

    $pdo->commit();
    echo "Selesai. Akun baru: username=" . NEW_USERNAME . ", id=" . NEW_ADMIN_ID . "\n";
    echo "Silakan login dengan password yang telah Anda set (PoliABT*2026).\n";
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
