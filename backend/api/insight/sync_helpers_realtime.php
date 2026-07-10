<?php
/**
 * Minimal sync_helpers override untuk fix real-time sync
 * File ini harus di-include SEBELUM sync_helpers.php original
 */

// Define alwaysSyncSections secara global
if (!isset($GLOBALS['chart_section_to_table'])) {
    $GLOBALS['chart_section_to_table'] = [
        'study_period' => 'menu_study_period_records',
        'waiting_time' => 'menu_waiting_time_records',
        'job_relevance' => 'menu_job_relevance_records',
        'work_coverage' => 'menu_work_coverage_records',
        'user_satisfaction' => 'menu_user_satisfaction_records',
        'publications' => 'menu_publications_records',
        'seminar_kegiatan' => 'menu_publications_records',
        'active_students' => 'menu_active_students_records',
        'student_products' => 'menu_student_products_records',
        'research_outputs' => 'menu_research_outputs_records',
        'student_achievements' => 'menu_student_achievements_records',
    ];
}

function ensureSectionSyncedRealTime(PDO $pdo, string $section, ?string $adminId = null): void {
    $map = $GLOBALS['chart_section_to_table'] ?? [];
    if (!isset($map[$section])) {
        return;
    }
    
    $table = $map[$section];
    $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
    $count = (int) $stmt->fetchColumn();
    
    // Sections that always sync: waiting_time dan work_coverage
    $alwaysSyncSections = ['waiting_time', 'work_coverage'];
    
    if ($count > 0 && !in_array($section, $alwaysSyncSections, true)) {
        return;
    }
    
    // Load original sync_helpers if not loaded
    if (!function_exists('syncWorkCoverage')) {
        require_once __DIR__ . '/sync_helpers.php';
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
    
    if (!isset($syncFns[$section])) {
        return;
    }
    
    $fn = $syncFns[$section];
    if (function_exists($fn)) {
        $fn($pdo);
        if (function_exists('updateChartSyncLog')) {
            updateChartSyncLog($pdo, $section, $adminId);
        }
    }
}
?>
