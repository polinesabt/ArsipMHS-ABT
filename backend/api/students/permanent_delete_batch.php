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
    $deletedCount = 0;
    $results = [];
    foreach ($ids as $studentId) {
        $result = student_recycle_permanent_delete($pdo, $studentId, $adminId);
        $results[] = $result;
        $deletedCount++;
    }
    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => ['deleted_count' => $deletedCount, 'results' => $results],
        'message' => $deletedCount === 1
            ? '1 akun mahasiswa berhasil dihapus permanen'
            : "$deletedCount akun mahasiswa berhasil dihapus permanen",
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
