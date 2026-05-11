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

    if (!$input || !isset($input['ids']) || !is_array($input['ids'])) {
        throw new Exception('ids (array) diperlukan');
    }

    $ids = array_values(array_unique(array_filter(array_map(static function ($value) {
        return trim((string)$value);
    }, $input['ids']))));
    if (empty($ids)) {
        throw new Exception('Minimal satu id mahasiswa diperlukan');
    }

    $pdo->beginTransaction();

    $count = 0;
    foreach ($ids as $studentId) {
        student_recycle_soft_delete($pdo, $studentId, $adminId);
        $count++;
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => $count === 1
            ? '1 mahasiswa dipindahkan ke Recycle Bin'
            : "$count mahasiswa dipindahkan ke Recycle Bin",
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
