<?php
/**
 * Fixed version of ensureSectionSynced untuk real-time sync
 * Include file ini SEBELUM sync_helpers.php dipanggil
 */

if (!function_exists('ensureSectionSyncedFixed')) {
    function ensureSectionSyncedFixed(PDO $pdo, string $section, ?string $adminId = null): void {
        $map = $GLOBALS['chart_section_to_table'] ?? [];
        if (!isset($map[$section])) {
            return;
        }
        
        $table = $map[$section];
        $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
        $count = (int) $stmt->fetchColumn();
        
        // Sections that always sync
        $alwaysSyncSections = ['waiting_time', 'work_coverage'];
        
        $needsSync = ($count === 0 || in_array($section, $alwaysSyncSections, true));
        
        // Additional check: if data source is newer than last sync
        if (!$needsSync && in_array($section, ['work_coverage', 'job_relevance', 'user_satisfaction'], true)) {
            $syncLogStmt = $pdo->prepare('SELECT last_synced_at FROM chart_sync_log WHERE menu_section = ?');
            $syncLogStmt->execute([$section]);
            $lastSyncedAt = $syncLogStmt->fetchColumn();
            
            if ($lastSyncedAt) {
                $sourceTable = ($section === 'work_coverage') ? 'tracer_study' : 'students';
                $tracerStmt = $pdo->query("SELECT MAX(IF(updated_at IS NOT NULL, updated_at, created_at)) as max_time FROM $sourceTable");
                $maxTracerTime = $tracerStmt->fetchColumn();
                if ($maxTracerTime && strtotime($maxTracerTime) > strtotime($lastSyncedAt)) {
                    $needsSync = true;
                }
            } else {
                $needsSync = true;
            }
        }
        
        if (!$needsSync) {
            return;
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
        $fn($pdo);
        updateChartSyncLog($pdo, $section, $adminId);
    }
}
?>
