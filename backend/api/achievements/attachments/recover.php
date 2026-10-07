<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../../../config/access.php';
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
    $auth = requireAuth();
    requireProductionWrite($auth);
    $actorId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid.');
    }

    $attachmentId = trim((string)($input['id'] ?? $input['attachment_id'] ?? ''));
    if ($attachmentId === '') {
        throw new Exception('id/attachment_id diperlukan.');
    }

    $existing = attachment_recycle_find($pdo, $attachmentId);
    if (!$existing || !empty($existing['student_deleted_at'])) {
        throw new Exception('Lampiran tidak ditemukan.');
    }
    requireStudentWriteAccess($pdo, $auth, (string)$existing['student_id']);

    $pdo->beginTransaction();
    $record = attachment_recycle_restore($pdo, $attachmentId, $actorId);
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => $record,
        'message' => 'Lampiran berhasil dipulihkan.',
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(api_exception_status($e));
    echo json_encode([
        'success' => false,
        'error' => api_public_error($e),
    ]);
}
