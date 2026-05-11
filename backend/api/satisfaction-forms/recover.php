<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        throw new Exception('ID template diperlukan');
    }

    $id = trim((string)$input['id']);

    $stmt = $pdo->prepare("
        UPDATE satisfaction_form_templates
        SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NOT NULL
    ");
    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan di Recycle Bin']);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Template berhasil dipulihkan',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
