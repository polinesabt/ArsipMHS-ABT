<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

function dosen_uuid(): string
{
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function dosen_json_response(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function dosen_request_json(): array
{
    $input = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($input)) {
        dosen_json_response(400, ['success' => false, 'error' => 'Payload JSON tidak valid.']);
    }
    return $input;
}

function dosen_normalize_text(mixed $value): string
{
    $value = preg_replace('/\s+/u', ' ', trim((string)$value));
    return mb_strtolower($value ?? '');
}

function dosen_profile_from_row(array $row): array
{
    $qualifications = json_decode((string)($row['pendidikan_pasca_sarjana'] ?? '[]'), true);
    if (!is_array($qualifications)) {
        $qualifications = [];
    }
    $peran = trim((string)($input['peran'] ?? 'Akademisi'));
    if (!in_array($peran, ['Akademisi', 'Praktisi'], true)) {
        throw new InvalidArgumentException('Peran dosen harus Akademisi atau Praktisi.');
    }
    return [
        'id' => (string)$row['id'],
        'userId' => isset($row['user_id']) ? (string)$row['user_id'] : null,
        'nidn' => (string)$row['nidn'],
        'nama' => (string)$row['nama'],
        'statusDosen' => (string)$row['status_dosen'],
        'jabatan' => (string)$row['jabatan'],
        'institusi' => (string)$row['institusi'],
        'pendidikanPascaSarjana' => array_values($qualifications),
        'bidangKeahlian' => (string)($row['bidang_keahlian'] ?? ''),
        'sertifikatPendidik' => (string)($row['sertifikat_pendidik'] ?? ''),
        'sertifikatKompetensi' => (string)($row['sertifikat_kompetensi'] ?? ''),
        'peran' => (string)($row['peran'] ?? 'Akademisi'),
        'email' => (string)($row['email'] ?? ''),
        'telepon' => (string)($row['telepon'] ?? ''),
    ];
}

function dosen_find_by_nidn(PDO $pdo, string $nidn, bool $includeDeleted = false): ?array
{
    $sql = 'SELECT * FROM dosen WHERE nidn = ?';
    if (!$includeDeleted) {
        $sql .= ' AND deleted_at IS NULL';
    }
    $sql .= ' LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$nidn]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function dosen_find_for_user(PDO $pdo, string $userId): ?array
{
    $stmt = $pdo->prepare('SELECT * FROM dosen WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function dosen_require_active_auth(PDO $pdo): array
{
    $auth = requireAuth('dosen');
    $stmt = $pdo->prepare('SELECT u.id FROM users u JOIN dosen d ON d.user_id = u.id WHERE u.id = ? AND u.role = \'dosen\' AND u.is_active = 1 AND d.deleted_at IS NULL LIMIT 1');
    $stmt->execute([(string)($auth['sub'] ?? '')]);
    if (!$stmt->fetchColumn()) {
        dosen_json_response(403, ['success' => false, 'error' => 'Akun dosen tidak aktif.']);
    }
    return $auth;
}

function dosen_validate_profile(array $input): array
{
    $validQualifications = [
        'Magister (S2)',
        'Doktor (S3)',
        'Magister Terapan (S2 Terapan)',
        'Doktor Terapan (S3 Terapan)',
        'Spesialis (Sp-1)',
    ];
    $nidn = trim((string)($input['nidn'] ?? ''));
    $nama = trim((string)($input['nama'] ?? ''));
    $status = trim((string)($input['statusDosen'] ?? $input['status_dosen'] ?? ''));
    $jabatan = trim((string)($input['jabatan'] ?? ''));
    $institusi = trim((string)($input['institusi'] ?? ''));
    if ($nidn === '' || mb_strlen($nidn) > 20 || !preg_match('/^[A-Za-z0-9.\/-]+$/', $nidn)) {
        throw new InvalidArgumentException('NIDN/NIDK wajib diisi dan hanya boleh berisi huruf, angka, titik, garis miring, atau tanda hubung.');
    }
    if ($nama === '' || mb_strlen($nama) > 150) {
        throw new InvalidArgumentException('Nama dosen wajib diisi dan maksimal 150 karakter.');
    }
    if (!in_array($status, ['Tetap', 'Tidak Tetap'], true)) {
        throw new InvalidArgumentException('Status dosen harus Tetap atau Tidak Tetap.');
    }
    if ($jabatan === '' || mb_strlen($jabatan) > 100) {
        throw new InvalidArgumentException('Jabatan wajib diisi dan maksimal 100 karakter.');
    }
    if ($institusi === '' || mb_strlen($institusi) > 150) {
        throw new InvalidArgumentException('Institusi wajib diisi dan maksimal 150 karakter.');
    }
    $qualifications = $input['pendidikanPascaSarjana'] ?? $input['pendidikan_pasca_sarjana'] ?? [];
    if (!is_array($qualifications)) {
        throw new InvalidArgumentException('Kualifikasi pascasarjana harus berupa daftar.');
    }
    $qualifications = array_values(array_unique(array_filter(array_map('trim', $qualifications))));
    foreach ($qualifications as $qualification) {
        if (!in_array($qualification, $validQualifications, true)) {
            throw new InvalidArgumentException('Kualifikasi pascasarjana tidak valid: ' . $qualification);
        }
    }
    $bidangKeahlian = trim((string)($input['bidangKeahlian'] ?? $input['bidang_keahlian'] ?? ''));
    $sertifikatPendidik = trim((string)($input['sertifikatPendidik'] ?? $input['sertifikat_pendidik'] ?? ''));
    $sertifikatKompetensi = trim((string)($input['sertifikatKompetensi'] ?? $input['sertifikat_kompetensi'] ?? ''));
    $email = trim((string)($input['email'] ?? ''));
    $telepon = trim((string)($input['telepon'] ?? ''));
    if (mb_strlen($bidangKeahlian) > 255) throw new InvalidArgumentException('Bidang keahlian maksimal 255 karakter.');
    if (mb_strlen($sertifikatPendidik) > 100) throw new InvalidArgumentException('Sertifikat pendidik maksimal 100 karakter.');
    if ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 100)) throw new InvalidArgumentException('Format email tidak valid atau melebihi 100 karakter.');
    if (mb_strlen($telepon) > 30) throw new InvalidArgumentException('Nomor telepon maksimal 30 karakter.');
    return [
        'nidn' => $nidn,
        'nama' => $nama,
        'status_dosen' => $status,
        'jabatan' => $jabatan,
        'institusi' => $institusi,
        'pendidikan_pasca_sarjana' => json_encode($qualifications, JSON_UNESCAPED_UNICODE),
        'bidang_keahlian' => $bidangKeahlian,
        'sertifikat_pendidik' => $sertifikatPendidik,
        'sertifikat_kompetensi' => $sertifikatKompetensi,
        'peran' => $peran,
        'email' => $email ?: null,
        'telepon' => $telepon ?: null,
    ];
}

function dosen_issue_tokens(array $user): array
{
    $payload = ['sub' => $user['id'], 'username' => $user['username'], 'role' => 'dosen'];
    $token = auth_generate_token($payload);
    return [
        'token' => $token,
        'jwt' => $token,
        'refreshToken' => auth_generate_token($payload, JWT_REFRESH_EXPIRATION),
    ];
}

function dosen_create_account(PDO $pdo, string $dosenId, string $nidn, string $nama): string
{
    $stmt = $pdo->prepare('SELECT id FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1');
    $stmt->execute([$nidn]);
    if ($stmt->fetchColumn()) {
        throw new RuntimeException('Username NIDN/NIDK sudah dipakai akun lain.');
    }
    $userId = dosen_uuid();
    $insert = $pdo->prepare('INSERT INTO users (id, username, password_hash, nama, role, is_active) VALUES (?, ?, ?, ?, ?, 1)');
    $insert->execute([$userId, $nidn, password_hash($nidn, PASSWORD_BCRYPT), $nama, 'dosen']);
    $link = $pdo->prepare('UPDATE dosen SET user_id = ? WHERE id = ?');
    $link->execute([$userId, $dosenId]);
    return $userId;
}
