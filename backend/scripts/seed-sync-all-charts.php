<?php
/**
 * Sinkronisasi semua section chart: master data -> menu_*_records
 * Untuk pengisian awal setelah seed (seed-10-mahasiswa + seed-evaluasi-dan-aktif).
 *
 * Usage (CLI):
 *   php backend/scripts/seed-sync-all-charts.php
 *
 * Pastikan sudah dijalankan:
 * - install.sql
 * - Migrasi: 2026-02-20-create-chart-records-tables.sql, 2026-02-21-add-chart-record-visibility.sql
 * - Migrasi: 2026-02-24-student-soft-delete-recycle-bin.sql (kolom students.deleted_at)
 * - seed-10-mahasiswa.sql
 * - seed-evaluasi-dan-aktif.sql
 */

if (php_sapi_name() !== 'cli') {
    echo "Jalankan dari CLI: php backend/scripts/seed-sync-all-charts.php\n";
    exit(1);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../api/insight/sync_helpers.php';

$sections = [
    'study_period'       => 'syncStudyPeriod',
    'waiting_time'       => 'syncWaitingTime',
    'job_relevance'      => 'syncJobRelevance',
    'work_coverage'      => 'syncWorkCoverage',
    'user_satisfaction'  => 'syncUserSatisfaction',
    'publications'       => 'syncPublications',
    'active_students'    => 'syncActiveStudents',
    'student_products'   => 'syncStudentProducts',
    'research_outputs'   => 'syncResearchOutputs',
    'student_achievements' => 'syncStudentAchievements',
];

$results = [];
$ok = true;

foreach ($sections as $section => $fn) {
    if (!function_exists($fn)) {
        $results[$section] = ['error' => "Function {$fn} not found"];
        $ok = false;
        continue;
    }
    try {
        $count = (int) $fn($pdo);
        updateChartSyncLog($pdo, $section, null);
        $results[$section] = ['records_synced' => $count];
    } catch (Throwable $e) {
        $results[$section] = ['error' => $e->getMessage()];
        $ok = false;
    }
}

echo json_encode([
    'success' => $ok,
    'message' => $ok ? 'Semua section chart berhasil disinkronisasi.' : 'Beberapa section gagal; periksa error di bawah.',
    'data' => $results,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";

exit($ok ? 0 : 1);
