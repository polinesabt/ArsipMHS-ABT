<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/recycle_helpers.php';

try {
    $auth = requireAuth('admin');
    $adminId = (string)($auth['sub'] ?? '');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['ids']) || !is_array($input['ids'])) {
        throw new Exception('ids (array) diperlukan');
    }

    $ids = array_values(array_unique(array_filter(array_map(static function ($value) {
        return trim((string)$value);
    }, $input['ids']))));
    if (count($ids) === 0) {
        throw new Exception('Minimal satu id mahasiswa diperlukan');
    }

    $pdo->beginTransaction();
    $restoredCount = 0;
    foreach ($ids as $studentId) {
        student_recycle_restore($pdo, $studentId, $adminId);
        $restoredCount++;
    }
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => ['restored_count' => $restoredCount],
        'message' => $restoredCount === 1
            ? '1 akun mahasiswa berhasil dipulihkan'
            : "$restoredCount akun mahasiswa berhasil dipulihkan",
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
?>
