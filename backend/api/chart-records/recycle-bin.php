<?php
/**
 * List soft-deleted chart records (Recycle Bin).
 * GET ?section=... (optional, filter by section) | ?page=1&per_page=20
 * Auth: admin only
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json');

$sectionToTable = [
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

$sectionLabels = [
    'study_period' => 'Masa Studi',
    'waiting_time' => 'Waktu Tunggu',
    'job_relevance' => 'Relevansi Pekerjaan',
    'work_coverage' => 'Cakupan Kerja',
    'user_satisfaction' => 'Kepuasan Pengguna',
    'publications' => 'Diseminasi Ilmiah Mahasiswa',
    'seminar_kegiatan' => 'Diseminasi Ilmiah Mahasiswa',
    'active_students' => 'Mahasiswa Aktif',
    'student_products' => 'Produk Mahasiswa',
    'research_outputs' => 'Luaran Penelitian',
    'student_achievements' => 'Prestasi Mahasiswa',
];

try {
    requireAuth('admin');

    $section = isset($_GET['section']) ? trim((string)$_GET['section']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;

    $sections = $section !== '' && isset($sectionToTable[$section])
        ? [$section]
        : array_keys($sectionToTable);

    $allRows = [];
    foreach ($sections as $sec) {
        $table = $sectionToTable[$sec];
        $stmt = $pdo->prepare("SELECT id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, deleted_at FROM {$table} WHERE deleted_at IS NOT NULL");
        $stmt->execute();
        while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $r['payload'] = json_decode($r['payload'], true) ?: [];
            $r['menu_section'] = $sec;
            $r['section_label'] = $sectionLabels[$sec] ?? $sec;
            $allRows[] = $r;
        }
    }

    usort($allRows, function ($a, $b) {
        return strcmp($b['deleted_at'] ?? '', $a['deleted_at'] ?? '');
    });

    $total = count($allRows);
    $offset = ($page - 1) * $perPage;
    $rows = array_slice($allRows, $offset, $perPage);

    echo json_encode([
        'success' => true,
        'data' => [
            'records' => $rows,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
