<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/../insight/sync_helpers.php';
require_once __DIR__ . '/store_helper.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (
        !$input ||
        !isset($input['student_id']) ||
        !isset($input['title']) ||
        !isset($input['category']) ||
        !isset($input['subcategory'])
    ) {
        throw new Exception('student_id, title, category, dan subcategory diperlukan');
    }

    $studentId = sanitizeInput($input['student_id'], 'string');
    $title = sanitizeInput($input['title'], 'string');
    $category = sanitizeInput($input['category'], 'string');
    $subcategory = sanitizeInput($input['subcategory'], 'string');

    if ($studentId === '' || $title === '' || $category === '' || $subcategory === '') {
        throw new Exception('Title, category, subcategory, dan student_id tidak boleh kosong');
    }

    $config = achievement_store_resolve_from_legacy($category, $subcategory);
    if (!$config) {
        throw new Exception('Kategori atau subkategori prestasi tidak dikenali');
    }

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $studentStmt->execute([$studentId]);
    if (!$studentStmt->fetch(PDO::FETCH_ASSOC)) {
        throw new Exception('student_id tidak valid (mahasiswa tidak ditemukan)');
    }

    $commonInput = $input;
    $commonInput['student_id'] = $studentId;
    $commonInput['title'] = $title;
    $commonInput['category'] = $category;
    $commonInput['subcategory'] = $subcategory;

    $commonData = achievement_store_build_common_data($commonInput, [], $config);
    $specificData = achievement_store_build_specific_data($config['key'], $input, $commonData);

    $id = bin2hex(random_bytes(18));
    $chartSync = null;

    $pdo->beginTransaction();
    try {
        achievement_store_insert($pdo, $config, $id, $commonData, $specificData);

        $createdData = achievement_store_fetch_view_row($pdo, $id);
        $chartSync = syncAchievementDerivedRecords($pdo, $id);

        $pdo->commit();
    } catch (Exception $inner) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $inner;
    }

    echo json_encode([
        'success' => true,
        'id' => $id,
        'data' => $createdData ?: null,
        'chart_sync' => $chartSync,
        'message' => 'Achievement berhasil ditambahkan',
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
