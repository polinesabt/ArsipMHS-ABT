<?php
/**
 * Sync master data -> menu_*_records (chart source of truth)
 * POST section=study_period|waiting_time|...|student_achievements|all
 * section=all: sync semua section sekaligus (untuk demo/seed).
 * Auth: admin only
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/sync_helpers.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? '';

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $section = isset($input['section']) ? trim((string)$input['section']) : (isset($_POST['section']) ? trim((string)$_POST['section']) : '');

    if ($section === '') {
        throw new Exception('Parameter section wajib diisi.');
    }

    $syncFns = [
        'study_period' => 'syncStudyPeriod',
        'waiting_time' => 'syncWaitingTime',
        'job_relevance' => 'syncJobRelevance',
        'work_coverage' => 'syncWorkCoverage',
        'user_satisfaction' => 'syncUserSatisfaction',
        'publications' => 'syncPublications',
        'seminar_kegiatan' => 'syncPublications',
        'active_students' => 'syncActiveStudents',
        'student_products' => 'syncStudentProducts',
        'research_outputs' => 'syncResearchOutputs',
        'student_achievements' => 'syncStudentAchievements',
    ];

    if ($section === 'all') {
        $results = [];
        foreach ($syncFns as $sec => $fnName) {
            $fn = $syncFns[$sec];
            $count = $fn($pdo);
            updateChartSyncLog($pdo, $sec, $adminId);
            $results[$sec] = $count;
        }
        echo json_encode([
            'success' => true,
            'data' => [
                'section' => 'all',
                'records_synced' => array_sum($results),
                'by_section' => $results,
                'message' => 'Sinkronisasi semua section berhasil.',
            ],
        ]);
        exit;
    }

    if (!isset($syncFns[$section])) {
        throw new Exception('Section tidak valid: ' . $section);
    }

    $fn = $syncFns[$section];
    $count = $fn($pdo);
    updateChartSyncLog($pdo, $section, $adminId);

    echo json_encode([
        'success' => true,
        'data' => [
            'section' => $section,
            'records_synced' => $count,
            'message' => 'Sinkronisasi berhasil.',
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
