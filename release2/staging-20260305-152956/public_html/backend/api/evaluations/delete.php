<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/recycle_helpers.php';

try {
    $auth = requireAuth('admin');
    $adminId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        throw new Exception('ID evaluasi diperlukan');
    }

    $id = trim((string)$input['id']);

    $pdo->beginTransaction();
    evaluation_recycle_soft_delete($pdo, $id, $adminId);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Riwayat evaluasi dipindahkan ke Recycle Bin',
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
?>
