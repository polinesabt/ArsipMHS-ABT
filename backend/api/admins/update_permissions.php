<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $payload = requireAuth('developer');
    requireProductionWrite($payload);

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID admin wajib diisi']);
        exit();
    }

    $adminId = trim((string)$input['id']);

    // Check if admin user exists
    $stmtUser = $pdo->prepare('SELECT id, username, nama FROM users WHERE id = ? AND role = ? LIMIT 1');
    $stmtUser->execute([$adminId, 'admin']);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Akun admin tidak ditemukan']);
        exit();
    }

    // Fetch existing permissions to support partial updates
    $stmtAdmin = $pdo->prepare('SELECT can_edit_dosen, can_edit_mahasiswa FROM admins WHERE id = ? LIMIT 1');
    $stmtAdmin->execute([$adminId]);
    $existingAdmin = $stmtAdmin->fetch(PDO::FETCH_ASSOC);

    $currentCanEditDosen = $existingAdmin ? (bool)$existingAdmin['can_edit_dosen'] : true;
    $currentCanEditMahasiswa = $existingAdmin ? (bool)$existingAdmin['can_edit_mahasiswa'] : true;

    $newCanEditDosen = isset($input['can_edit_dosen']) ? (bool)$input['can_edit_dosen'] : $currentCanEditDosen;
    $newCanEditMahasiswa = isset($input['can_edit_mahasiswa']) ? (bool)$input['can_edit_mahasiswa'] : $currentCanEditMahasiswa;

    // Upsert into admins
    $stmtUpdate = $pdo->prepare('
        INSERT INTO admins (id, created_at, can_edit_dosen, can_edit_mahasiswa)
        VALUES (?, NOW(), ?, ?)
        ON DUPLICATE KEY UPDATE
            can_edit_dosen = VALUES(can_edit_dosen),
            can_edit_mahasiswa = VALUES(can_edit_mahasiswa)
    ');
    $stmtUpdate->execute([
        $adminId,
        $newCanEditDosen ? 1 : 0,
        $newCanEditMahasiswa ? 1 : 0,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Hak akses admin berhasil diperbarui',
        'data' => [
            'id' => $adminId,
            'username' => $user['username'],
            'nama' => $user['nama'],
            'can_edit_dosen' => $newCanEditDosen,
            'can_edit_mahasiswa' => $newCanEditMahasiswa,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
