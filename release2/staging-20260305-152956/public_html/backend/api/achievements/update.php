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
        throw new Exception('Achievement tidak ditemukan');
    }

    $currentConfig = $found['config'];
    $existingRow = $found['row'];

    $finalCategory = isset($input['category'])
        ? trim((string)$input['category'])
        : trim((string)($existingRow['category'] ?? $currentConfig['legacy_category']));
    $finalSubcategory = isset($input['subcategory'])
        ? trim((string)$input['subcategory'])
        : trim((string)($existingRow['subcategory'] ?? $currentConfig['legacy_subcategory']));

    $targetConfig = achievement_store_resolve_from_legacy($finalCategory, $finalSubcategory);
    if (!$targetConfig) {
        throw new Exception('Kategori atau subkategori prestasi tidak dikenali');
    }

    $mergedInput = array_merge($existingRow, $input);
    $mergedInput['student_id'] = $input['student_id'] ?? ($existingRow['id_mahasiswa'] ?? ($existingRow['student_id'] ?? ''));
    $mergedInput['category'] = $finalCategory;
    $mergedInput['subcategory'] = $finalSubcategory;

    $commonData = achievement_store_build_common_data($mergedInput, $existingRow, $targetConfig);
    $specificData = achievement_store_build_specific_data($targetConfig['key'], $mergedInput, $commonData);

    if (($commonData['title'] ?? '') === '') {
        throw new Exception('title tidak boleh kosong');
    }
    if (($commonData['id_mahasiswa'] ?? '') === '') {
        throw new Exception('student_id tidak valid');
    }

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $studentStmt->execute([$commonData['id_mahasiswa']]);
    if (!$studentStmt->fetch(PDO::FETCH_ASSOC)) {
        throw new Exception('student_id tidak ditemukan');
    }

    $chartSync = null;
    $pdo->beginTransaction();
    try {
        if ($currentConfig['table'] === $targetConfig['table']) {
            achievement_store_update($pdo, $targetConfig, $achievementId, $commonData, $specificData);
        } else {
            achievement_store_insert($pdo, $targetConfig, $achievementId, $commonData, $specificData);
            achievement_store_delete($pdo, $currentConfig, $achievementId);
        }

        $updated = achievement_store_fetch_view_row($pdo, $achievementId);
        $chartSync = syncAchievementDerivedRecords($pdo, $achievementId);

        $pdo->commit();
    } catch (Exception $inner) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $inner;
    }

    echo json_encode([
        'success' => true,
        'data' => $updated,
        'chart_sync' => $chartSync,
        'message' => 'Achievement berhasil diperbarui',
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
