<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

function generate_uuid4(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $payload = requireAuth('developer');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payload JSON tidak valid']);
        exit();
    }

    $username = trim((string)($input['username'] ?? ''));
    $nama = trim((string)($input['nama'] ?? ''));
    $password = (string)($input['password'] ?? '');
    $canEditDosen = isset($input['can_edit_dosen']) ? (bool)$input['can_edit_dosen'] : true;
    $canEditMahasiswa = isset($input['can_edit_mahasiswa']) ? (bool)$input['can_edit_mahasiswa'] : true;

    // Validation
    if ($username === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username wajib diisi']);
        exit();
    }

    if (strlen($username) < 3) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username minimal 3 karakter']);
        exit();
    }

    if (!preg_match('/^[a-zA-Z0-9_.-]+$/', $username)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username hanya boleh mengandung huruf, angka, titik, strip, dan underscore']);
        exit();
    }

    if ($nama === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nama lengkap wajib diisi']);
        exit();
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Password minimal 6 karakter']);
        exit();
    }

    // Check username uniqueness
    $stmtCheck = $pdo->prepare('SELECT id, is_active FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) LIMIT 1');
    $stmtCheck->execute([$username]);
    $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($existing) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Username "' . $username . '" sudah digunakan. Silakan gunakan username lain.']);
        exit();
    }

    $newId = generate_uuid4();
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $pdo->beginTransaction();

    // 1. Insert into users
    $stmtUser = $pdo->prepare('
        INSERT INTO users (id, username, password_hash, nama, role, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW())
    ');
    $stmtUser->execute([
        $newId,
        $username,
        $passwordHash,
        $nama,
        'admin',
    ]);

    // 2. Insert into admins
    $stmtAdmin = $pdo->prepare('
        INSERT INTO admins (id, created_at, can_edit_dosen, can_edit_mahasiswa)
        VALUES (?, NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE 
            can_edit_dosen = VALUES(can_edit_dosen),
            can_edit_mahasiswa = VALUES(can_edit_mahasiswa)
    ');
    $stmtAdmin->execute([
        $newId,
        $canEditDosen ? 1 : 0,
        $canEditMahasiswa ? 1 : 0,
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Akun Admin berhasil dibuat',
        'data' => [
            'id' => $newId,
            'username' => $username,
            'nama' => $nama,
            'role' => 'admin',
            'is_active' => true,
            'created_at' => date('Y-m-d H:i:s'),
            'last_login' => null,
            'can_edit_dosen' => $canEditDosen,
            'can_edit_mahasiswa' => $canEditMahasiswa,
        ],
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
