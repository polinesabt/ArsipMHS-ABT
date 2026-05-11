<?php
/**
 * Delete single achievement attachment.
 * DELETE or POST with body: {"attachment_id": "..."}
 * Auth: admin atau student pemilik achievement.
 */
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../store_helper.php';
require_once __DIR__ . '/recycle_helpers.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? '';
if ($method !== 'DELETE' && $method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

function attachment_delete_fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message,
    ]);
    exit;
}

try {
    $auth = requireAuth(null);
    $userId = $auth['sub'] ?? '';
    $role = $auth['role'] ?? '';

    $attachmentId = '';
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $attachmentId = isset($input['attachment_id']) ? trim((string)$input['attachment_id']) : '';
    } else {
        $attachmentId = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
    }
    if ($attachmentId === '') {
        attachment_delete_fail(400, 'attachment_id atau parameter id wajib diisi.');
    }

    $record = attachment_recycle_find($pdo, $attachmentId);
    if (!$record) {
        attachment_delete_fail(404, 'Lampiran tidak ditemukan.');
    }
    if (!empty($record['student_deleted_at'])) {
        attachment_delete_fail(404, 'Lampiran tidak ditemukan.');
    }

    if ($role === 'student') {
        $stmtUser = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND id = ? AND deleted_at IS NULL');
        $stmtUser->execute([$userId, (string)($record['student_id'] ?? '')]);
        if (!$stmtUser->fetch()) {
            attachment_delete_fail(403, 'Akses ditolak.');
        }
    } elseif ($role !== 'admin') {
        attachment_delete_fail(403, 'Akses ditolak.');
    }

    $pdo->beginTransaction();
    attachment_recycle_soft_delete($pdo, $attachmentId, (string)$userId);
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Lampiran dipindahkan ke Recycle Bin.',
        'attachment_id' => $attachmentId,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
