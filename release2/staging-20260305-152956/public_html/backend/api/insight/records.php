<?php
/**
 * Daftar record pembentuk chart (untuk Advanced Settings).
 *
 * Modes:
 * - default/records: list per record
 * - students: list per mahasiswa (khusus section berbasis lampiran)
 *
 * Query:
 * - section (required)
 * - view=records|students
 * - year
 * - page
 * - per_page
 * - include_attachments=1 (mode records)
 * - student_nim=<nim> (mode records, opsional)
 * - thumbnail_limit (mode students)
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/sync_helpers.php';

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

$attachmentSections = ['student_achievements', 'publications', 'seminar_kegiatan', 'student_products', 'research_outputs'];

function respondError(int $status, string $message): void {
    http_response_code($status);
    echo json_encode([
        'success' => false,
        'error' => $message,
    ]);
    exit;
}

function appendCommonFilters(string $alias, ?int $year, string $studentNim, array &$params): string {
    $prefix = $alias !== '' ? ($alias . '.') : '';
    $where = " WHERE {$prefix}deleted_at IS NULL
               AND NOT EXISTS (
                   SELECT 1
                   FROM students s_recycle
                   WHERE s_recycle.nim = {$prefix}snapshot_nim
                     AND s_recycle.deleted_at IS NOT NULL
               )";
    if ($year !== null && $year > 1900 && $year < 2100) {
        $where .= " AND {$prefix}tahun_pelaporan = ?";
        $params[] = $year;
    }
    if ($studentNim !== '') {
        $where .= " AND {$prefix}snapshot_nim = ?";
        $params[] = $studentNim;
    }
    return $where;
}

function resolveTabForSection(string $section, string $rawTab): string {
    if ($rawTab === '') {
        return $section === 'seminar_kegiatan' ? 'seminar' : '';
    }

    if ($section === 'student_achievements') {
        if ($rawTab === 'non_academic') {
            $rawTab = 'nonAcademic';
        }
        $allowed = ['all', 'academic', 'nonAcademic'];
        if (!in_array($rawTab, $allowed, true)) {
            respondError(400, 'Parameter tab tidak valid untuk section student_achievements.');
        }
        return $rawTab;
    }

    if ($section === 'publications') {
        $allowed = ['jurnal', 'seminar', 'pagelaran'];
        if (!in_array($rawTab, $allowed, true)) {
            respondError(400, 'Parameter tab tidak valid untuk section publications.');
        }
        return $rawTab;
    }

    if ($section === 'seminar_kegiatan') {
        return 'seminar';
    }

    if ($section === 'research_outputs') {
        $allowed = ['haki', 'technology', 'other'];
        if (!in_array($rawTab, $allowed, true)) {
            respondError(400, 'Parameter tab tidak valid untuk section research_outputs.');
        }
        return $rawTab;
    }

    if ($section === 'work_coverage') {
        $allowed = ['working', 'entrepreneur'];
        if (!in_array($rawTab, $allowed, true)) {
            respondError(400, 'Parameter tab tidak valid untuk section work_coverage.');
        }
        return $rawTab;
    }

    respondError(400, 'Parameter tab tidak berlaku untuk section ini.');
}

function appendTabFilter(string $section, string $tab, string $alias, array &$params): string {
    if ($tab === 'all') {
        return '';
    }

    if ($tab === '' && $section !== 'work_coverage') {
        return '';
    }

    $prefix = $alias !== '' ? ($alias . '.') : '';
    $payloadExpr = $prefix . 'payload';
    $categoryExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.category')), ''))";
    $typeExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.achievement_type')), ''))";
    $subcategoryExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.subcategory')), ''))";
    $careerStatusExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.career_status')), ''))";

    if ($section === 'student_achievements') {
        if ($tab === 'academic') {
            $params[] = 'academic';
            return " AND {$typeExpr} = ?";
        }
        if ($tab === 'nonAcademic') {
            $params[] = 'academic';
            return " AND {$typeExpr} <> ?";
        }
        return '';
    }

    if ($section === 'publications' || $section === 'seminar_kegiatan') {
        $scientificPresentationSubcategories = "('conference', 'presentasi', 'presentation', 'oral_presentation', 'poster_presentation')";
        $showcaseSubcategories = "('expo', 'exhibition', 'pameran', 'pagelaran', 'presentasi', 'presentation', 'conference')";
        $seminarValidExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.is_valid_publication_seminar')), ''))";
        $seminarTitleExpr = "TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.judul_publikasi')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.title')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.judul')),
            ''
        ))";
        $seminarLevelExpr = "LOWER(REPLACE(REPLACE(TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.level_seminar')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.levelSeminar')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.level_diseminasi')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.levelDiseminasi')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.tingkat')),
            ''
        )), '-', '_'), ' ', '_'))";
        $seminarAcquisitionExpr = "LOWER(REPLACE(REPLACE(TRIM(COALESCE(
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.jenis_perolehan')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.jenisPerolehan')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.perolehan')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.acquisition_type')),
            JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.acquisitionType')),
            ''
        )), '-', '_'), ' ', '_'))";
        $seminarStrictFallbackExpr = "(
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
        )";
        if ($tab === 'jurnal') {
            $params[] = 'scientific_work';
            return " AND {$categoryExpr} = ? AND {$subcategoryExpr} NOT IN {$scientificPresentationSubcategories}";
        }
        if ($tab === 'seminar') {
            $params[] = 'event_participation';
            return " AND {$categoryExpr} = ? AND {$subcategoryExpr} <> 'competition' AND {$subcategoryExpr} NOT IN {$showcaseSubcategories} AND (
                {$seminarValidExpr} IN ('1','true','yes')
                OR {$seminarStrictFallbackExpr}
            )";
        }
        if ($tab === 'pagelaran') {
            $params[] = 'scientific_work';
            $params[] = 'event_participation';
            return " AND (({$categoryExpr} = ? AND {$subcategoryExpr} IN {$scientificPresentationSubcategories}) OR ({$categoryExpr} = ? AND {$subcategoryExpr} IN {$showcaseSubcategories}))";
        }
        return '';
    }

    if ($section === 'research_outputs') {
        $hakiSubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputHakiSubcategories())) . "')";
        $technologySubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputTechnologySubcategories())) . "')";
        $otherSubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputBookSubcategories())) . "')";
        if ($tab === 'haki') {
            return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$hakiSubtypesSql}";
        }
        if ($tab === 'other') {
            return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$otherSubtypesSql}";
        }
        if ($tab === 'technology') {
            return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$technologySubtypesSql}";
        }
        return '';
    }

    if ($section === 'work_coverage') {
        if ($tab === 'working' || $tab === 'entrepreneur') {
            $params[] = $tab;
            return " AND {$careerStatusExpr} = ?";
        }
        return " AND {$careerStatusExpr} IN ('working', 'entrepreneur')";
    }

    return '';
}

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? null;

    $section = isset($_GET['section']) ? trim((string)$_GET['section']) : '';
    $view = isset($_GET['view']) ? trim((string)$_GET['view']) : 'records';
    $year = isset($_GET['year']) ? (int)$_GET['year'] : null;
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;
    $studentNim = isset($_GET['student_nim']) ? trim((string)$_GET['student_nim']) : '';
    $thumbnailLimit = isset($_GET['thumbnail_limit']) ? max(1, min(12, (int)$_GET['thumbnail_limit'])) : 6;
    $tabRaw = isset($_GET['tab']) ? trim((string)$_GET['tab']) : '';

    if ($section === '' || !isset($sectionToTable[$section])) {
        respondError(400, 'Parameter section tidak valid.');
    }

    if ($view === '') {
        $view = 'records';
    }
    if ($view !== 'records' && $view !== 'students') {
        respondError(400, 'Parameter view tidak valid. Gunakan "records" atau "students".');
    }

    $tab = resolveTabForSection($section, $tabRaw);

    $isAttachmentSection = in_array($section, $attachmentSections, true);
    if ($view === 'students' && !$isAttachmentSection) {
        respondError(400, 'Mode view=students hanya tersedia untuk section dengan lampiran.');
    }

    ensureSectionSynced($pdo, $section, $adminId);

    $table = $sectionToTable[$section];
    $stmtMeta = $pdo->prepare('SELECT last_synced_at FROM chart_sync_log WHERE menu_section = ?');
    $stmtMeta->execute([$section]);
    $metaRow = $stmtMeta->fetch(PDO::FETCH_ASSOC);
    $lastSyncedAt = $metaRow['last_synced_at'] ?? null;

    if ($view === 'students') {
        $countParams = [];
        $where = appendCommonFilters('r', $year, $studentNim, $countParams);
        $where .= appendTabFilter($section, $tab, 'r', $countParams);
        $where .= " AND r.included_in_chart = 1
                    AND EXISTS (
                        SELECT 1
                        FROM achievement_attachments aa
                        WHERE aa.achievement_id = r.source_id
                    )";

        $countSql = "SELECT COUNT(*) FROM (
                        SELECT r.snapshot_nim
                        FROM {$table} r
                        {$where}
                        GROUP BY r.snapshot_nim
                    ) x";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $total = (int)$countStmt->fetchColumn();

        $offset = ($page - 1) * $perPage;
        $listSql = "SELECT
                        r.snapshot_nim,
                        MAX(r.snapshot_nama) AS snapshot_nama,
                        MAX(r.snapshot_prodi) AS snapshot_prodi,
                        MAX(r.snapshot_fakultas) AS snapshot_fakultas,
                        COUNT(DISTINCT r.id) AS total_records,
                        COUNT(DISTINCT aa.id) AS total_attachments,
                        MAX(r.updated_at) AS latest_updated_at
                    FROM {$table} r
                    INNER JOIN achievement_attachments aa ON aa.achievement_id = r.source_id
                    {$where}
                    GROUP BY r.snapshot_nim
                    ORDER BY latest_updated_at DESC, snapshot_nama ASC
                    LIMIT " . (int)$perPage . " OFFSET " . (int)$offset;

        $listStmt = $pdo->prepare($listSql);
        $listStmt->execute($countParams);
        $students = [];
        $nims = [];

        while ($row = $listStmt->fetch(PDO::FETCH_ASSOC)) {
            $nim = (string)$row['snapshot_nim'];
            $nims[] = $nim;
            $students[$nim] = [
                'snapshot_nim' => $nim,
                'snapshot_nama' => (string)($row['snapshot_nama'] ?? ''),
                'snapshot_prodi' => (string)($row['snapshot_prodi'] ?? ''),
                'snapshot_fakultas' => (string)($row['snapshot_fakultas'] ?? ''),
                'total_records' => (int)($row['total_records'] ?? 0),
                'total_attachments' => (int)($row['total_attachments'] ?? 0),
                'latest_updated_at' => $row['latest_updated_at'] ?? null,
                'preview_attachments' => [],
            ];
        }

        if (count($nims) > 0) {
            $previewParams = [];
            $previewWhere = appendCommonFilters('r', $year, $studentNim, $previewParams);
            $previewWhere .= appendTabFilter($section, $tab, 'r', $previewParams);
            $previewWhere .= " AND r.included_in_chart = 1";

            $nimPlaceholders = implode(',', array_fill(0, count($nims), '?'));
            $previewSql = "SELECT
                              r.snapshot_nim,
                              aa.id,
                              aa.achievement_id,
                              aa.file_name,
                              aa.file_type,
                              aa.file_path,
                              aa.uploaded_at
                           FROM {$table} r
                           INNER JOIN achievement_attachments aa ON aa.achievement_id = r.source_id
                           {$previewWhere}
                           AND r.snapshot_nim IN ({$nimPlaceholders})
                           ORDER BY r.snapshot_nim ASC, aa.uploaded_at DESC, aa.id DESC";
            foreach ($nims as $nim) {
                $previewParams[] = $nim;
            }
            $previewStmt = $pdo->prepare($previewSql);
            $previewStmt->execute($previewParams);

            $previewCounts = [];
            while ($att = $previewStmt->fetch(PDO::FETCH_ASSOC)) {
                $nim = (string)$att['snapshot_nim'];
                if (!isset($students[$nim])) {
                    continue;
                }
                if (!isset($previewCounts[$nim])) {
                    $previewCounts[$nim] = 0;
                }
                if ($previewCounts[$nim] >= $thumbnailLimit) {
                    continue;
                }

                $students[$nim]['preview_attachments'][] = [
                    'id' => $att['id'],
                    'achievement_id' => $att['achievement_id'],
                    'file_name' => $att['file_name'],
                    'file_type' => $att['file_type'],
                    'file_path' => $att['file_path'],
                ];
                $previewCounts[$nim]++;
            }
        }

        $studentRows = [];
        foreach ($nims as $nim) {
            if (isset($students[$nim])) {
                $studentRows[] = $students[$nim];
            }
        }

        echo json_encode([
            'success' => true,
            'data' => [
                'section' => $section,
                'students' => $studentRows,
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'last_synced_at' => $lastSyncedAt,
            ],
        ]);
        exit;
    }

    $params = [];
    $where = appendCommonFilters('', $year, $studentNim, $params);
    $where .= appendTabFilter($section, $tab, '', $params);

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM {$table} {$where}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $perPage;
    $order = ' ORDER BY updated_at DESC, id ASC LIMIT ' . (int)$perPage . ' OFFSET ' . (int)$offset;
    $stmt = $pdo->prepare("SELECT id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, included_in_chart, created_at, updated_at FROM {$table} {$where} {$order}");
    $stmt->execute($params);
    $rows = [];
    $includeAttachments = isset($_GET['include_attachments']) && $isAttachmentSection;
    $sourceIds = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $row['payload'] = json_decode($row['payload'], true) ?: [];
        $row['attachments'] = [];
        if ($includeAttachments && ($row['source_table'] ?? '') === 'achievements') {
            $sourceIds[] = $row['source_id'];
        }
        $rows[] = $row;
    }

    if ($includeAttachments && count($sourceIds) > 0) {
        $placeholders = implode(',', array_fill(0, count($sourceIds), '?'));
        $attStmt = $pdo->prepare("SELECT id, achievement_id, file_name, file_type, file_size, file_path FROM achievement_attachments WHERE achievement_id IN ({$placeholders}) ORDER BY uploaded_at ASC");
        $attStmt->execute($sourceIds);
        $byAchievement = [];
        while ($a = $attStmt->fetch(PDO::FETCH_ASSOC)) {
            $aid = $a['achievement_id'];
            if (!isset($byAchievement[$aid])) {
                $byAchievement[$aid] = [];
            }
            $byAchievement[$aid][] = [
                'id' => $a['id'],
                'file_name' => $a['file_name'],
                'file_type' => $a['file_type'],
                'file_path' => $a['file_path'],
            ];
        }
        foreach ($rows as &$r) {
            if (isset($r['source_id'], $byAchievement[$r['source_id']])) {
                $r['attachments'] = $byAchievement[$r['source_id']];
            }
        }
        unset($r);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'section' => $section,
            'records' => $rows,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'last_synced_at' => $lastSyncedAt,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
