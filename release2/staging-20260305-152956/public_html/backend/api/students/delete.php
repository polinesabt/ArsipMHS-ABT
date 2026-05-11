<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
    ]);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/recycle_helpers.php';

try {
    $auth = requireAuth('admin');
    $adminId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }
    
    $student_id = trim((string)$input['id']);
    if ($student_id === '') {
        throw new Exception('id tidak boleh kosong');
    }
    
    $pdo->beginTransaction();
    student_recycle_soft_delete($pdo, $student_id, $adminId);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Mahasiswa dipindahkan ke Recycle Bin'
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
