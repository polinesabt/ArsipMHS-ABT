<?php
/**
 * Prestasi Mahasiswa - Chart data dari menu_student_achievements_records (source of truth)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../insight/stats_from_records.php';
require_once __DIR__ . '/../insight/sync_helpers.php';

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? null;
    ensureSectionSynced($pdo, 'student_achievements', $adminId);

    $year = isset($_GET['year']) ? (int)$_GET['year'] : null;
    $yearFilter = ($year !== null && $year > 1900 && $year < 2100) ? $year : null;
    $tab = isset($_GET['tab']) ? trim((string)$_GET['tab']) : '';
    if ($tab === 'non_academic') {
        $tab = 'nonAcademic';
    }
    if ($tab !== '' && !in_array($tab, ['all', 'academic', 'nonAcademic'], true)) {
        throw new Exception('Parameter tab tidak valid. Gunakan all, academic, atau nonAcademic.');
    }
    if ($tab === '') {
        $tab = 'all';
    }

    $data = getStudentAchievementsFromRecords($pdo, $yearFilter, $tab);
    $meta = getChartMeta($pdo, 'student_achievements');

    echo json_encode([
        'success' => true,
        'data' => $data,
        'meta' => $meta,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
