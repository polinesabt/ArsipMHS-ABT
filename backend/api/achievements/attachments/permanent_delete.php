<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/recycle_helpers.php';

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
    ]);
    exit;
}

try {
    $auth = requireAuth('admin');
    $adminId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid.');
    }

    $attachmentId = trim((string)($input['id'] ?? $input['attachment_id'] ?? ''));
    if ($attachmentId === '') {
        throw new Exception('id/attachment_id diperlukan.');
    }

    $pdo->beginTransaction();
    $payload = attachment_recycle_permanent_delete($pdo, $attachmentId, $adminId, true);
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => $payload,
        'message' => 'Lampiran berhasil dihapus permanen.',
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
