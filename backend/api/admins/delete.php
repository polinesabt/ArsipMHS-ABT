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
    $method = $_SERVER['REQUEST_METHOD'] ?? '';
    if ($method !== 'POST' && $method !== 'DELETE') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $payload = requireAuth('developer');

    $input = json_decode(file_get_contents('php://input'), true);
    $adminId = '';
    if (is_array($input) && !empty($input['id'])) {
        $adminId = trim((string)$input['id']);
    } elseif (!empty($_GET['id'])) {
        $adminId = trim((string)$_GET['id']);
    }

    if ($adminId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID admin wajib diisi']);
        exit();
    }

    // Check if target exists and is an admin
    $stmtUser = $pdo->prepare('SELECT id, username, nama, role FROM users WHERE id = ? LIMIT 1');
    $stmtUser->execute([$adminId]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Akun tidak ditemukan']);
        exit();
    }

    if ($user['role'] !== 'admin') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Hanya akun admin yang dapat dihapus dari panel ini']);
        exit();
    }

    // Prevent deleting if it's the current user (in case a developer token matched)
    if (($payload['sub'] ?? '') === $adminId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Tidak dapat menghapus akun Anda sendiri']);
        exit();
    }

    // Find another admin or fallback to reassign restrictive foreign keys if necessary
    $stmtOther = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' AND id != ? AND is_active = 1 LIMIT 1");
    $stmtOther->execute([$adminId]);
    $otherAdmin = $stmtOther->fetch(PDO::FETCH_ASSOC);
    $fallbackAdminId = $otherAdmin ? $otherAdmin['id'] : null;

    $pdo->beginTransaction();

    // Reassign known restrictive foreign keys if another admin exists
    if ($fallbackAdminId) {
        // Evaluations created_by
        try {
            $stmtRemap = $pdo->prepare("UPDATE evaluations SET created_by = ? WHERE created_by = ?");
            $stmtRemap->execute([$fallbackAdminId, $adminId]);
        } catch (Throwable $ignore) {}

        // Prestasi files uploaded_by
        try {
            $stmtRemap = $pdo->prepare("UPDATE prestasi_files SET uploaded_by = ? WHERE uploaded_by = ?");
            $stmtRemap->execute([$fallbackAdminId, $adminId]);
        } catch (Throwable $ignore) {}
    }

    // Delete from admins table
    try {
        $stmtDelAdmin = $pdo->prepare("DELETE FROM admins WHERE id = ?");
        $stmtDelAdmin->execute([$adminId]);
    } catch (Throwable $ignore) {}

    // Attempt hard delete from users table; fallback to deactivation if restricted
    $hardDeleted = false;
    try {
        $stmtDelUser = $pdo->prepare("DELETE FROM users WHERE id = ? AND role = 'admin'");
        $stmtDelUser->execute([$adminId]);
        $hardDeleted = true;
    } catch (Throwable $e) {
        // Fallback: Deactivate user
        $stmtDeactivate = $pdo->prepare("UPDATE users SET is_active = 0 WHERE id = ?");
        $stmtDeactivate->execute([$adminId]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Akun admin "' . ($user['nama'] ?: $user['username']) . '" berhasil dihapus',
        'data' => [
            'id' => $adminId,
            'username' => $user['username'],
            'hard_deleted' => $hardDeleted,
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
