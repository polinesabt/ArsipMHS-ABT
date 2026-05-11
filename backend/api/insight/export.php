<?php
/**
 * Export data chart (dari menu_*_records, hanya yang aktif di chart).
 * GET ?section=...&format=csv&year=...
 * Auth: admin. Log ke export_logs.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

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

function respondError(int $status, string $message): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $message,
    ]);
    exit;
}

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? '';

    $section = isset($_GET['section']) ? trim((string)$_GET['section']) : '';
    $format = isset($_GET['format']) ? strtolower(trim((string)$_GET['format'])) : 'csv';
    $year = isset($_GET['year']) ? (int)$_GET['year'] : null;
    $tab = isset($_GET['tab']) ? strtolower(trim((string)$_GET['tab'])) : '';

    if ($section === '' || !isset($sectionToTable[$section])) {
        respondError(400, 'Parameter section tidak valid.');
    }
    if (!in_array($format, ['csv', 'xlsx', 'pdf'], true)) {
        respondError(400, 'Format harus csv, xlsx, atau pdf.');
    }
    if ($section === 'work_coverage' && $tab !== '' && !in_array($tab, ['working', 'entrepreneur'], true)) {
        respondError(400, 'Parameter tab tidak valid untuk section work_coverage.');
    }

    $table = $sectionToTable[$section];
    $where = " WHERE deleted_at IS NULL
               AND included_in_chart = 1
               AND NOT EXISTS (
                    SELECT 1
                    FROM students s_recycle
                    WHERE s_recycle.nim = {$table}.snapshot_nim
                      AND s_recycle.deleted_at IS NOT NULL
               )";
    $params = [];
    if ($section === 'seminar_kegiatan') {
        $seminarValidExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.is_valid_publication_seminar')), ''))";
        $seminarTitleExpr = "TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.judul_publikasi')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.title')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.judul')),
            ''
        ))";
        $seminarLevelExpr = "LOWER(REPLACE(REPLACE(TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.level_seminar')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.levelSeminar')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.level_diseminasi')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.levelDiseminasi')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.tingkat')),
            ''
        )), '-', '_'), ' ', '_'))";
        $seminarAcquisitionExpr = "LOWER(REPLACE(REPLACE(TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.jenis_perolehan')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.jenisPerolehan')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.perolehan')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.acquisition_type')),
            JSON_UNQUOTE(JSON_EXTRACT(payload, '$.acquisitionType')),
            ''
        )), '-', '_'), ' ', '_'))";
        $where .= " AND LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.category')), '')) = 'event_participation'";
        $where .= " AND (LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.subcategory')), '')) <> 'competition')";
        $where .= " AND (LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.subcategory')), '')) NOT IN ('expo', 'exhibition', 'pameran', 'pagelaran', 'presentasi', 'presentation', 'conference'))";
        $where .= " AND (
            {$seminarValidExpr} IN ('1','true','yes')
            OR (
                {$seminarTitleExpr} <> ''
                AND {$seminarLevelExpr} IN (
                    'local', 'lokal', 'regional', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt',
                    'national', 'nasional',
                    'international', 'internasional'
                )
                AND {$seminarAcquisitionExpr} IN (
                    'mandiri',
                    'kolaborasi_dosen',
                    'kolaborasi_dengan_dosen',
                    'dosen'
                )
            )
        )";
    }
    if ($year !== null && $year > 1900 && $year < 2100) {
        $where .= ' AND tahun_pelaporan = ?';
        $params[] = $year;
    }
    if ($section === 'work_coverage') {
        $careerStatusExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(payload, '$.career_status')), ''))";
        if ($tab === 'working' || $tab === 'entrepreneur') {
            $where .= " AND {$careerStatusExpr} = ?";
            $params[] = $tab;
        } else {
            $where .= " AND {$careerStatusExpr} IN ('working', 'entrepreneur')";
        }
    }

    $stmt = $pdo->prepare("SELECT id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, included_in_chart, created_at, updated_at FROM {$table} {$where} ORDER BY updated_at DESC");
    $stmt->execute($params);

    $rows = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['payload'] = $row['payload'];
        $rows[] = $row;
    }

    $filters = ['year' => $year];
    if ($section === 'work_coverage') {
        $filters['tab'] = $tab !== '' ? $tab : null;
    }
    $logId = bin2hex(random_bytes(18));
    $insLog = $pdo->prepare('INSERT INTO export_logs (id, admin_id, menu_section, format, filters, exported_at) VALUES (?, ?, ?, ?, ?, NOW())');
    $insLog->execute([$logId, $adminId, $section, $format, json_encode($filters)]);

    if ($format === 'csv') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="export-' . $section . '-' . date('Y-m-d-His') . '.csv"');
        $out = fopen('php://output', 'w');
        fprintf($out, "\xEF\xBB\xBF");
        fputcsv($out, ['id', 'source_table', 'source_id', 'snapshot_nim', 'snapshot_nama', 'tahun_pelaporan', 'payload', 'included_in_chart', 'created_at', 'updated_at']);
        foreach ($rows as $r) {
            fputcsv($out, [
                $r['id'],
                $r['source_table'],
                $r['source_id'],
                $r['snapshot_nim'],
                $r['snapshot_nama'],
                $r['tahun_pelaporan'],
                $r['payload'],
                $r['included_in_chart'],
                $r['created_at'],
                $r['updated_at'],
            ]);
        }
        fclose($out);
        exit;
    }

    if ($format === 'xlsx' || $format === 'pdf') {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Export ' . $format . ' untuk section ini silakan gunakan export dari halaman (client-side). Data telah dicatat di export_logs.',
            'records_count' => count($rows),
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
