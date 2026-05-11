<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('admin');
    $adminId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        throw new Exception('ID template diperlukan');
    }

    $id = trim((string)$input['id']);

    $check = $pdo->prepare("SELECT is_default FROM satisfaction_form_templates WHERE id = ? AND deleted_at IS NULL LIMIT 1");
    $check->execute([$id]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }
    if (!empty($row['is_default'])) {
        throw new Exception('Template utama tidak dapat dihapus');
    }

    $stmt = $pdo->prepare("
        UPDATE satisfaction_form_templates
        SET deleted_at = NOW(), deleted_by = ?
        WHERE id = ? AND deleted_at IS NULL
    ");
    $stmt->execute([$adminId, $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Template dipindahkan ke Recycle Bin',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
