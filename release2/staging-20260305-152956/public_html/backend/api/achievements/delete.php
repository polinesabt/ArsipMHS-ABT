<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../insight/sync_helpers.php';
require_once __DIR__ . '/store_helper.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }

    $achievementId = trim((string)$input['id']);
    if ($achievementId === '') {
        throw new Exception('id tidak boleh kosong');
    }

    $found = achievement_store_find_record($pdo, $achievementId);
    if (!$found) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Achievement tidak ditemukan',
        ]);
        exit();
    }

    $config = $found['config'];
    $chartSync = null;

    $pdo->beginTransaction();
    try {
        $deleted = achievement_store_delete($pdo, $config, $achievementId);
        if (!$deleted) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Achievement tidak ditemukan',
            ]);
            exit();
        }

        $chartSync = softDeleteAchievementDerivedRecords($pdo, $achievementId);
        $pdo->commit();
    } catch (Exception $inner) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $inner;
    }

    echo json_encode([
        'success' => true,
        'chart_sync' => $chartSync,
        'message' => 'Achievement berhasil dihapus',
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
