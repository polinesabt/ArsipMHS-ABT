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
 * - student_name=<nama> (mode records/students, opsional)
 * - thumbnail_limit (mode students)
 * - achievement_category=<kategori> (khusus student_achievements)
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

function appendCommonFilters(string $alias, ?int $year, string $studentNim, string $studentName, array &$params): string {
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
    if ($studentName !== '') {
        $where .= " AND {$prefix}snapshot_nama LIKE ?";
        $params[] = '%' . $studentName . '%';
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

function validStudentAchievementCategoryFilters(): array {
    return [
        'publikasi',
        'portofolio',
        'lomba',
        'kekayaan_intelektual',
        'research_output_hki',
        'research_output_technology',
        'research_output_books',
        'magang',
        'produk_mahasiswa',
        'wirausaha',
        'pengembangan_diri',
        'organisasi',
        'seminar',
    ];
}

function appendAchievementCategoryFilter(string $section, string $achievementCategory, string $alias, array &$params): string {
    if ($achievementCategory === '' || $section !== 'student_achievements') {
        return '';
    }

    $prefix = $alias !== '' ? ($alias . '.') : '';
    $payloadExpr = $prefix . 'payload';
    $categoryExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.category')), ''))";
    $subcategoryExpr = "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT({$payloadExpr}, '$.subcategory')), ''))";

    if ($achievementCategory === 'publikasi') {
        return " AND {$categoryExpr} = 'scientific_work'";
    }
    if ($achievementCategory === 'portofolio') {
        return " AND {$categoryExpr} = 'applied_academic' AND {$subcategoryExpr} = 'course_portfolio'";
    }
    if ($achievementCategory === 'lomba') {
        return " AND {$categoryExpr} = 'event_participation' AND {$subcategoryExpr} = 'competition'";
    }
    if ($achievementCategory === 'kekayaan_intelektual') {
        return " AND {$categoryExpr} = 'intellectual_property'";
    }
    if ($achievementCategory === 'research_output_hki') {
        $hakiSubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputHakiSubcategories())) . "')";
        return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$hakiSubtypesSql}";
    }
    if ($achievementCategory === 'research_output_technology') {
        $technologySubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputTechnologySubcategories())) . "')";
        return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$technologySubtypesSql}";
    }
    if ($achievementCategory === 'research_output_books') {
        $bookSubtypesSql = "('" . implode("','", array_map('addslashes', researchOutputBookSubcategories())) . "')";
        return " AND {$categoryExpr} = 'research_output' AND {$subcategoryExpr} IN {$bookSubtypesSql}";
    }
    if ($achievementCategory === 'magang') {
        return " AND {$categoryExpr} = 'applied_academic' AND {$subcategoryExpr} = 'internship'";
    }
    if ($achievementCategory === 'produk_mahasiswa') {
        return " AND {$categoryExpr} = 'applied_academic' AND {$subcategoryExpr} NOT IN ('internship', 'course_portfolio')";
    }
    if ($achievementCategory === 'wirausaha') {
        return " AND {$categoryExpr} = 'entrepreneurship'";
    }
    if ($achievementCategory === 'pengembangan_diri') {
        return " AND {$categoryExpr} = 'self_development' AND {$subcategoryExpr} <> 'volunteer'";
    }
    if ($achievementCategory === 'organisasi') {
        return " AND {$categoryExpr} = 'self_development' AND {$subcategoryExpr} = 'volunteer'";
    }
    if ($achievementCategory === 'seminar') {
        return " AND {$categoryExpr} = 'event_participation' AND {$subcategoryExpr} <> 'competition'";
    }

    return '';
}

function achievementAttachmentSources(): array {
    static $sources = null;
    if ($sources !== null) {
        return $sources;
    }

    $sources = [];
    foreach (achievement_store_configs() as $config) {
        $table = (string)($config['attachment_table'] ?? '');
        $foreignKey = (string)($config['attachment_fk'] ?? '');
        if ($table === '' || $foreignKey === '') {
            continue;
        }

        $cacheKey = $table . '|' . $foreignKey;
        if (isset($sources[$cacheKey])) {
            continue;
        }

        $sources[$cacheKey] = [
            'table' => $table,
            'foreign_key' => $foreignKey,
        ];
    }

    return array_values($sources);
}

function buildAchievementAttachmentExistsSql(PDO $pdo, string $achievementIdExpr): string {
    $existsClauses = [];

    foreach (achievementAttachmentSources() as $index => $source) {
        $table = $source['table'];
        $foreignKey = $source['foreign_key'];
        $alias = 'aa_exists_' . $index;
        $conditions = ["{$alias}.{$foreignKey} = {$achievementIdExpr}"];
        $columns = achievement_store_table_columns($pdo, $table);
        if (isset($columns['deleted_at'])) {
            $conditions[] = "{$alias}.deleted_at IS NULL";
        }

        $existsClauses[] = 'EXISTS (SELECT 1 FROM ' . $table . ' ' . $alias . ' WHERE ' . implode(' AND ', $conditions) . ')';
    }

    if (count($existsClauses) === 0) {
        return '0 = 1';
    }

    return '(' . implode(' OR ', $existsClauses) . ')';
}

function fetchAchievementAttachmentsByIds(PDO $pdo, array $achievementIds): array {
    $achievementIds = array_values(array_unique(array_filter(array_map(static function ($value) {
        return trim((string)$value);
    }, $achievementIds), static function ($value) {
        return $value !== '';
    })));

    if (count($achievementIds) === 0) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($achievementIds), '?'));
    $attachmentsByAchievement = [];

    foreach (achievementAttachmentSources() as $source) {
        $table = $source['table'];
        $foreignKey = $source['foreign_key'];
        $columns = achievement_store_table_columns($pdo, $table);
        $whereParts = ["{$foreignKey} IN ({$placeholders})"];
        if (isset($columns['deleted_at'])) {
            $whereParts[] = 'deleted_at IS NULL';
        }

        $sql = "SELECT id, {$foreignKey} AS achievement_id, file_name, file_type, file_size, file_path, uploaded_at
                FROM {$table}
                WHERE " . implode(' AND ', $whereParts);
        $stmt = $pdo->prepare($sql);
        $stmt->execute($achievementIds);

        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $achievementId = trim((string)($row['achievement_id'] ?? ''));
            if ($achievementId === '') {
                continue;
            }
            if (!isset($attachmentsByAchievement[$achievementId])) {
                $attachmentsByAchievement[$achievementId] = [];
            }
            $attachmentsByAchievement[$achievementId][] = [
                'id' => $row['id'],
                'achievement_id' => $achievementId,
                'file_name' => $row['file_name'],
                'file_type' => $row['file_type'],
                'file_size' => isset($row['file_size']) ? (int)$row['file_size'] : null,
                'file_path' => $row['file_path'],
                'uploaded_at' => $row['uploaded_at'] ?? null,
            ];
        }
    }

    foreach ($attachmentsByAchievement as &$items) {
        usort($items, static function (array $left, array $right): int {
            $leftUploadedAt = (string)($left['uploaded_at'] ?? '');
            $rightUploadedAt = (string)($right['uploaded_at'] ?? '');
            if ($leftUploadedAt === $rightUploadedAt) {
                return strcmp((string)($left['id'] ?? ''), (string)($right['id'] ?? ''));
            }
            return strcmp($leftUploadedAt, $rightUploadedAt);
        });
    }
    unset($items);

    return $attachmentsByAchievement;
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
    $studentName = isset($_GET['student_name']) ? trim((string)$_GET['student_name']) : '';
    $thumbnailLimit = isset($_GET['thumbnail_limit']) ? max(1, min(12, (int)$_GET['thumbnail_limit'])) : 6;
    $tabRaw = isset($_GET['tab']) ? trim((string)$_GET['tab']) : '';
    $achievementCategoryRaw = isset($_GET['achievement_category']) ? strtolower(trim((string)$_GET['achievement_category'])) : '';

    if ($section === '' || !isset($sectionToTable[$section])) {
        respondError(400, 'Parameter section tidak valid.');
    }

    if ($view === '') {
        $view = 'records';
    }
    if ($view !== 'records' && $view !== 'students') {
        respondError(400, 'Parameter view tidak valid. Gunakan "records" atau "students".');
    }

    if ($achievementCategoryRaw !== '' && $section !== 'student_achievements') {
        respondError(400, 'Parameter achievement_category hanya berlaku untuk section student_achievements.');
    }
    if ($achievementCategoryRaw !== '' && !in_array($achievementCategoryRaw, validStudentAchievementCategoryFilters(), true)) {
        respondError(400, 'Parameter achievement_category tidak valid untuk section student_achievements.');
    }

    $tab = resolveTabForSection($section, $tabRaw);
    $achievementCategory = $achievementCategoryRaw;

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
        $where = appendCommonFilters('r', $year, $studentNim, $studentName, $countParams);
        $where .= appendTabFilter($section, $tab, 'r', $countParams);
        $where .= appendAchievementCategoryFilter($section, $achievementCategory, 'r', $countParams);
        $attachmentExistsSql = buildAchievementAttachmentExistsSql($pdo, 'r.source_id');
        $where .= " AND r.included_in_chart = 1
                    AND r.source_table = 'achievements'
                    AND {$attachmentExistsSql}";

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
                        MAX(r.updated_at) AS latest_updated_at
                    FROM {$table} r
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
                'total_attachments' => 0,
                'latest_updated_at' => $row['latest_updated_at'] ?? null,
                'preview_attachments' => [],
            ];
        }

        if (count($nims) > 0) {
            $sourceParams = [];
            $sourceWhere = appendCommonFilters('r', $year, $studentNim, $studentName, $sourceParams);
            $sourceWhere .= appendTabFilter($section, $tab, 'r', $sourceParams);
            $sourceWhere .= appendAchievementCategoryFilter($section, $achievementCategory, 'r', $sourceParams);
            $sourceWhere .= " AND r.included_in_chart = 1
                              AND r.source_table = 'achievements'";

            $nimPlaceholders = implode(',', array_fill(0, count($nims), '?'));
            $sourceSql = "SELECT DISTINCT r.snapshot_nim, r.source_id
                          FROM {$table} r
                          {$sourceWhere}
                          AND r.snapshot_nim IN ({$nimPlaceholders})";
            foreach ($nims as $nim) {
                $sourceParams[] = $nim;
            }
            $sourceStmt = $pdo->prepare($sourceSql);
            $sourceStmt->execute($sourceParams);

            $sourceIds = [];
            $sourceIdsByStudent = [];
            while ($row = $sourceStmt->fetch(PDO::FETCH_ASSOC)) {
                $nim = (string)($row['snapshot_nim'] ?? '');
                $sourceId = trim((string)($row['source_id'] ?? ''));
                if ($nim === '' || $sourceId === '' || !isset($students[$nim])) {
                    continue;
                }

                if (!isset($sourceIdsByStudent[$nim])) {
                    $sourceIdsByStudent[$nim] = [];
                }
                if (in_array($sourceId, $sourceIdsByStudent[$nim], true)) {
                    continue;
                }

                $sourceIdsByStudent[$nim][] = $sourceId;
                $sourceIds[] = $sourceId;
            }

            $attachmentsByAchievement = fetchAchievementAttachmentsByIds($pdo, $sourceIds);
            foreach ($nims as $nim) {
                $studentAttachments = [];
                foreach ($sourceIdsByStudent[$nim] ?? [] as $sourceId) {
                    foreach ($attachmentsByAchievement[$sourceId] ?? [] as $attachment) {
                        $studentAttachments[] = $attachment;
                    }
                }

                usort($studentAttachments, static function (array $left, array $right): int {
                    $leftUploadedAt = (string)($left['uploaded_at'] ?? '');
                    $rightUploadedAt = (string)($right['uploaded_at'] ?? '');
                    if ($leftUploadedAt === $rightUploadedAt) {
                        return strcmp((string)($right['id'] ?? ''), (string)($left['id'] ?? ''));
                    }
                    return strcmp($rightUploadedAt, $leftUploadedAt);
                });

                $students[$nim]['total_attachments'] = count($studentAttachments);
                $students[$nim]['preview_attachments'] = array_map(static function (array $attachment): array {
                    return [
                        'id' => $attachment['id'],
                        'achievement_id' => $attachment['achievement_id'],
                        'file_name' => $attachment['file_name'],
                        'file_type' => $attachment['file_type'],
                        'file_path' => $attachment['file_path'],
                    ];
                }, array_slice($studentAttachments, 0, $thumbnailLimit));
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
    $where = appendCommonFilters('', $year, $studentNim, $studentName, $params);
    $where .= appendTabFilter($section, $tab, '', $params);
    $where .= appendAchievementCategoryFilter($section, $achievementCategory, '', $params);

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
        $byAchievement = fetchAchievementAttachmentsByIds($pdo, $sourceIds);
        foreach ($rows as &$r) {
            if (isset($r['source_id'], $byAchievement[$r['source_id']])) {
                $r['attachments'] = array_map(static function (array $attachment): array {
                    return [
                        'id' => $attachment['id'],
                        'file_name' => $attachment['file_name'],
                        'file_type' => $attachment['file_type'],
                        'file_path' => $attachment['file_path'],
                    ];
                }, $byAchievement[$r['source_id']]);
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
