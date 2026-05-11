<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['template_id'])) {
        throw new Exception('ID template diperlukan');
    }

    $templateId = trim((string)$input['template_id']);

    $check = $pdo->prepare("SELECT id FROM satisfaction_form_templates WHERE id = ? AND deleted_at IS NULL LIMIT 1");
    $check->execute([$templateId]);
    if (!$check->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }

    $pdo->beginTransaction();
    $pdo->exec("UPDATE satisfaction_form_templates SET is_active = 0 WHERE deleted_at IS NULL");
    $stmt = $pdo->prepare("UPDATE satisfaction_form_templates SET is_active = 1 WHERE id = ? AND deleted_at IS NULL");
    $stmt->execute([$templateId]);
    $pdo->commit();

    if ($stmt->rowCount() === 0) {
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Template aktif diperbarui',
        'active_template_id' => $templateId,
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
