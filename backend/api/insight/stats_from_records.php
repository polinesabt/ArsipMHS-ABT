<?php
/**
 * Chart stats aggregated from menu_*_records (source of truth).
 * Only records with deleted_at IS NULL and included_in_chart = 1 are included.
 */
require_once __DIR__ . '/../achievements/classification_helper.php';

function getChartMeta(PDO $pdo, string $section): array {
    $stmt = $pdo->prepare('SELECT last_synced_at, synced_by FROM chart_sync_log WHERE menu_section = ?');
    $stmt->execute([$section]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    $lastSyncedAt = $row ? ($row['last_synced_at'] ?? null) : null;
    $calculation = 'Agregasi dari data snapshot (tanpa mengubah data master).';
    if ($section === 'job_relevance') {
        $calculation = 'Dari jawaban Form Evaluasi Lulusan (kesesuaian bidang kerja), dikelompokkan menurut tahun mulai bekerja dari data karir.';
    }
    $sourceTable = ($section === 'seminar_kegiatan') ? 'menu_publications_records' : ('menu_' . $section . '_records');
    return [
        'source' => $sourceTable,
        'last_synced_at' => $lastSyncedAt,
        'calculation' => $calculation,
    ];
}

function getVisibleRecordWhere(string $alias = ''): string {
    $prefix = $alias !== '' ? ($alias . '.') : '';
    return " WHERE {$prefix}deleted_at IS NULL
             AND {$prefix}included_in_chart = 1
             AND NOT EXISTS (
                 SELECT 1
                 FROM students s_recycle
                 WHERE s_recycle.nim = {$prefix}snapshot_nim
                   AND s_recycle.deleted_at IS NOT NULL
             )";
}

function getStudyPeriodFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    $stmt = $pdo->query("SELECT payload, tahun_pelaporan FROM menu_study_period_records {$where}");
    $diterimaByYear = [];
    $lulusByYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $tahunMasuk = isset($payload['tahun_masuk']) ? (int)$payload['tahun_masuk'] : null;
        $tahunLulus = isset($payload['tahun_lulus']) ? (int)$payload['tahun_lulus'] : null;
        if ($tahunMasuk !== null && (!$yearFilter || $tahunMasuk === $yearFilter)) {
            $diterimaByYear[$tahunMasuk] = ($diterimaByYear[$tahunMasuk] ?? 0) + 1;
        }
        if ($tahunLulus !== null && (!$yearFilter || $tahunLulus === $yearFilter)) {
            $lulusByYear[$tahunLulus] = ($lulusByYear[$tahunLulus] ?? 0) + 1;
        }
    }
    $allYears = array_unique(array_merge(array_keys($diterimaByYear), array_keys($lulusByYear)));
    sort($allYears);
    $byYear = [];
    foreach ($allYears as $y) {
        $byYear[] = ['year' => $y, 'diterima' => $diterimaByYear[$y] ?? 0, 'lulus' => $lulusByYear[$y] ?? 0];
    }
    $totalDiterima = array_sum($diterimaByYear);
    $totalLulus = array_sum($lulusByYear);
    return ['by_year' => $byYear, 'total_diterima' => $totalDiterima, 'total_lulus' => $totalLulus];
}

function getWaitingTimeFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload, tahun_pelaporan FROM menu_waiting_time_records $where");
    $byYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $y = (int)$row['tahun_pelaporan'];
        if (!isset($byYear[$y])) $byYear[$y] = ['year' => $y, 'lessThan3Months' => 0, 'between3And6Months' => 0, 'moreThan6Months' => 0];
        $bucket = $payload['bucket'] ?? 'moreThan6Months';
        if (isset($byYear[$y][$bucket])) $byYear[$y][$bucket]++;
    }
    ksort($byYear);
    $by_year = array_values($byYear);
    $total = 0;
    foreach ($by_year as $r) { $total += $r['lessThan3Months'] + $r['between3And6Months'] + $r['moreThan6Months']; }
    return ['by_year' => $by_year, 'total' => $total];
}

function getJobRelevanceFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload FROM menu_job_relevance_records $where");
    $map = ['sangat_relevan' => 'Sangat Relevan', 'relevan' => 'Relevan', 'cukup_relevan' => 'Cukup Relevan', 'kurang_relevan' => 'Kurang Relevan', 'tidak_relevan' => 'Tidak Relevan'];
    $counts = array_fill_keys(array_keys($map), 0);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $key = $payload['relevansi_kompetensi'] ?? '';
        if (isset($counts[$key])) $counts[$key]++;
    }
    $byRelevance = [];
    foreach ($map as $k => $label) {
        if ($counts[$k] > 0) $byRelevance[] = ['label' => $label, 'key' => $k, 'count' => $counts[$k]];
    }
    $relevan = ($counts['sangat_relevan'] ?? 0) + ($counts['relevan'] ?? 0);
    $tidakRelevan = ($counts['cukup_relevan'] ?? 0) + ($counts['kurang_relevan'] ?? 0) + ($counts['tidak_relevan'] ?? 0);
    $byRelevance2 = [];
    if ($relevan > 0) $byRelevance2[] = ['label' => 'Relevan', 'count' => $relevan];
    if ($tidakRelevan > 0) $byRelevance2[] = ['label' => 'Tidak Relevan', 'count' => $tidakRelevan];
    $total = array_sum($counts);
    return ['by_relevance' => $byRelevance, 'by_relevance_2' => $byRelevance2, 'total' => $total, 'relevan' => $relevan, 'tidak_relevan' => $tidakRelevan];
}

function getWorkCoverageFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload, tahun_pelaporan FROM menu_work_coverage_records $where");
    $labels = ['working' => 'Bekerja', 'entrepreneur' => 'Wirausaha', 'further_study' => 'Studi Lanjut', 'job_seeking' => 'Mencari Kerja'];
    $byScopeCounts = array_fill_keys(array_keys($labels), 0);
    $byYear = [];
    $byYearByStatus = [
        'working' => [],
        'entrepreneur' => [],
    ];
    $totalByStatus = [
        'working' => 0,
        'entrepreneur' => 0,
    ];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $status = $payload['career_status'] ?? '';
        if (isset($byScopeCounts[$status])) $byScopeCounts[$status]++;
        if (!isset($byYearByStatus[$status])) continue;
        $totalByStatus[$status]++;
        $y = (int)$row['tahun_pelaporan'];
        if (!isset($byYear[$y])) $byYear[$y] = ['year' => $y, 'local' => 0, 'national' => 0, 'multinational' => 0];
        if (!isset($byYearByStatus[$status][$y])) $byYearByStatus[$status][$y] = ['year' => $y, 'local' => 0, 'national' => 0, 'multinational' => 0];
        $workScope = isset($payload['work_scope']) ? (string)$payload['work_scope'] : 'national';
        if ($workScope === 'local' || $workScope === 'regional') {
            $byYear[$y]['local']++;
            $byYearByStatus[$status][$y]['local']++;
        } elseif ($workScope === 'multinational' || $workScope === 'internasional' || $workScope === 'international') {
            $byYear[$y]['multinational']++;
            $byYearByStatus[$status][$y]['multinational']++;
        } else {
            $byYear[$y]['national']++;
            $byYearByStatus[$status][$y]['national']++;
        }
    }
    $byScope = [];
    foreach ($labels as $key => $label) {
        if ($byScopeCounts[$key] > 0) $byScope[] = ['label' => $label, 'key' => $key, 'count' => $byScopeCounts[$key]];
    }
    ksort($byYear);
    foreach (['working', 'entrepreneur'] as $statusKey) {
        ksort($byYearByStatus[$statusKey]);
    }
    $by_year = array_values($byYear);
    $by_year_by_status = [
        'working' => array_values($byYearByStatus['working']),
        'entrepreneur' => array_values($byYearByStatus['entrepreneur']),
    ];
    $total = array_sum($byScopeCounts);
    return [
        'by_scope' => $byScope,
        'by_year' => $by_year,
        'by_year_by_status' => $by_year_by_status,
        'total' => $total,
        'total_by_status' => $totalByStatus,
    ];
}

function getUserSatisfactionFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT id FROM menu_user_satisfaction_records $where");
    $responseIds = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $responseIds[] = $row['id'];
    if (count($responseIds) === 0) {
        $aspectStmt = $pdo->query("SELECT id, name, sort_order FROM evaluation_aspects WHERE is_active = 1 ORDER BY sort_order");
        $aspects = [];
        while ($r = $aspectStmt->fetch(PDO::FETCH_ASSOC)) $aspects[] = ['aspect_name' => $r['name'], 'avg_score' => 0, 'response_count' => 0];
        return ['aspects' => $aspects, 'likert' => [], 'overall_avg' => 0, 'total_responses' => 0];
    }
    $placeholders = implode(',', array_fill(0, count($responseIds), '?'));
    $stmt2 = $pdo->prepare("
        SELECT a.id, a.name, a.sort_order, AVG(rr.score) AS avg_score, COUNT(DISTINCT rr.response_id) AS response_count
        FROM evaluation_aspects a
        LEFT JOIN evaluation_response_ratings rr ON rr.aspect_id = a.id AND rr.response_id IN ($placeholders)
        WHERE a.is_active = 1
        GROUP BY a.id, a.name, a.sort_order ORDER BY a.sort_order
    ");
    $stmt2->execute($responseIds);
    $aspects = [];
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        $avg = $row['avg_score'] !== null ? round((float)$row['avg_score'], 2) : 0;
        $aspects[] = ['aspect_name' => $row['name'], 'avg_score' => $avg, 'response_count' => (int)$row['response_count']];
    }
    $stmt3 = $pdo->prepare("
        SELECT a.name, rr.score, COUNT(*) AS cnt
        FROM evaluation_aspects a
        JOIN evaluation_response_ratings rr ON rr.aspect_id = a.id AND rr.response_id IN ($placeholders)
        WHERE a.is_active = 1
        GROUP BY a.name, rr.score ORDER BY a.sort_order, rr.score
    ");
    $stmt3->execute($responseIds);
    $likertByAspect = [];
    while ($row = $stmt3->fetch(PDO::FETCH_ASSOC)) {
        $name = $row['name'];
        if (!isset($likertByAspect[$name])) $likertByAspect[$name] = ['indicator' => $name, 'veryGood' => 0, 'good' => 0, 'fair' => 0, 'poor' => 0];
        $score = (int)$row['score'];
        $cnt = (int)$row['cnt'];
        if ($score >= 5) $likertByAspect[$name]['veryGood'] += $cnt;
        elseif ($score >= 4) $likertByAspect[$name]['good'] += $cnt;
        elseif ($score >= 3) $likertByAspect[$name]['fair'] += $cnt;
        else $likertByAspect[$name]['poor'] += $cnt;
    }
    $likert = array_values($likertByAspect);
    $totalResponses = count($responseIds);
    $withScore = array_filter($aspects, function ($a) { return $a['response_count'] > 0; });
    $overall = count($withScore) ? round(array_sum(array_column($withScore, 'avg_score')) / count($withScore), 2) : 0;
    return ['aspects' => $aspects, 'likert' => $likert, 'overall_avg' => $overall, 'total_responses' => $totalResponses];
}

function normalizeDisseminationTabFilter($tabFilter): string {
    $tab = $tabFilter !== null ? (string)$tabFilter : 'all';
    if (!in_array($tab, ['all', 'jurnal', 'seminar', 'pagelaran'], true)) {
        throw new InvalidArgumentException('Tab publications tidak valid.');
    }
    return $tab;
}

function normalizeDisseminationPerolehanFromPayload(array $payload): string {
    $candidateKeys = ['jenis_perolehan', 'jenisPerolehan', 'perolehan', 'acquisition_type', 'acquisitionType'];
    foreach ($candidateKeys as $key) {
        if (!array_key_exists($key, $payload) || !is_string($payload[$key])) {
            continue;
        }
        $value = strtolower(trim($payload[$key]));
        if ($value === 'mandiri') {
            return 'mandiri';
        }
        if (in_array($value, ['kolaborasi_dosen', 'kolaborasi-dosen', 'kolaborasi dosen', 'kolaborasi dengan dosen', 'dosen'], true)) {
            return 'kolaborasi_dosen';
        }
    }

    $text = strtolower(trim(implode(' ', [
        (string)($payload['title'] ?? ''),
        (string)($payload['description'] ?? ''),
        (string)($payload['penyelenggara'] ?? ''),
    ])));
    if (
        $text !== ''
        && (strpos($text, 'dosen') !== false || strpos($text, 'pembimbing') !== false || strpos($text, 'co-author') !== false || strpos($text, 'co author') !== false)
    ) {
        return 'kolaborasi_dosen';
    }

    return 'mandiri';
}

function normalizeStrictSeminarPerolehanFromPayload(array $payload): ?string {
    $candidateKeys = ['jenis_perolehan', 'jenisPerolehan', 'perolehan', 'acquisition_type', 'acquisitionType'];
    foreach ($candidateKeys as $key) {
        if (!array_key_exists($key, $payload) || !is_string($payload[$key])) {
            continue;
        }
        $value = strtolower(trim($payload[$key]));
        if ($value === 'mandiri') {
            return 'mandiri';
        }
        if (in_array($value, ['kolaborasi_dosen', 'kolaborasi-dosen', 'kolaborasi dosen', 'kolaborasi dengan dosen', 'dosen'], true)) {
            return 'kolaborasi_dosen';
        }
    }
    return null;
}

function normalizeStrictSeminarLevelTokenFromPayload(array $payload): ?string {
    $candidateKeys = ['level_seminar', 'levelSeminar', 'level_diseminasi', 'levelDiseminasi', 'tingkat'];
    foreach ($candidateKeys as $key) {
        if (!array_key_exists($key, $payload) || !is_string($payload[$key])) {
            continue;
        }
        $value = strtolower(trim($payload[$key]));
        if ($value === '') {
            continue;
        }
        $token = preg_replace('/\s+/', '_', str_replace('-', '_', $value)) ?? $value;
        if (in_array($token, ['local', 'lokal', 'regional', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
            return 'local';
        }
        if (in_array($token, ['national', 'nasional'], true)) {
            return 'national';
        }
        if (in_array($token, ['international', 'internasional'], true)) {
            return 'international';
        }
    }
    return null;
}

function parseBooleanLike($value): ?bool {
    if (is_bool($value)) {
        return $value;
    }
    if (is_int($value)) {
        return $value === 1;
    }
    if (!is_string($value)) {
        return null;
    }
    $normalized = strtolower(trim($value));
    if (in_array($normalized, ['1', 'true', 'yes', 'ya'], true)) return true;
    if (in_array($normalized, ['0', 'false', 'no', 'tidak'], true)) return false;
    return null;
}

function isValidSeminarPublicationPayload(array $payload): bool {
    if (array_key_exists('is_valid_publication_seminar', $payload)) {
        $parsed = parseBooleanLike($payload['is_valid_publication_seminar']);
        if ($parsed !== null) {
            return $parsed;
        }
    }

    $judul = trim((string)($payload['judul_publikasi'] ?? ($payload['title'] ?? ($payload['judul'] ?? ''))));
    if ($judul === '') {
        return false;
    }

    if (normalizeStrictSeminarLevelTokenFromPayload($payload) === null) {
        return false;
    }

    if (normalizeStrictSeminarPerolehanFromPayload($payload) === null) {
        return false;
    }

    return true;
}

function statsContainsAnyKeyword(string $haystack, array $keywords): bool {
    if ($haystack === '') {
        return false;
    }
    foreach ($keywords as $keyword) {
        if (strpos($haystack, $keyword) !== false) {
            return true;
        }
    }
    return false;
}

function isStatsScientificPresentationSubcategory(string $subcategory): bool {
    return in_array($subcategory, ['conference', 'presentasi', 'presentation', 'oral_presentation', 'poster_presentation'], true);
}

function isStatsShowcasePresentationSubcategory(string $subcategory): bool {
    return in_array($subcategory, ['expo', 'exhibition', 'pameran', 'pagelaran', 'presentasi', 'presentation', 'conference'], true);
}

function resolveDisseminationTabFromPayload(array $payload): string {
    $explicitType = strtolower(trim((string)($payload['jenis_diseminasi'] ?? '')));
    if (in_array($explicitType, ['jurnal', 'seminar', 'pagelaran'], true)) {
        return $explicitType;
    }

    $category = strtolower(trim((string)($payload['category'] ?? '')));
    $subcategory = strtolower(trim((string)($payload['subcategory'] ?? '')));

    if ($category === 'scientific_work') {
        return isStatsScientificPresentationSubcategory($subcategory) ? 'pagelaran' : 'jurnal';
    }
    if ($category === 'event_participation') {
        if ($subcategory === 'competition') {
            return '';
        }
        return isStatsShowcasePresentationSubcategory($subcategory) ? 'pagelaran' : 'seminar';
    }

    return '';
}

function resolveDisseminationLevelFromPayload(string $tab, array $payload): string {
    $explicitLevel = strtolower(trim((string)($payload['level_diseminasi'] ?? '')));
    if ($explicitLevel === '' && $tab === 'seminar') {
        $explicitLevel = strtolower(trim((string)($payload['level_seminar'] ?? ($payload['levelSeminar'] ?? ''))));
    }
    $allowedByTab = [
        'jurnal' => ['national_non_accredited', 'national_accredited', 'international', 'reputable_international'],
        'seminar' => ['local', 'national', 'international'],
        'pagelaran' => ['regional', 'national', 'international'],
    ];
    if (isset($allowedByTab[$tab]) && in_array($explicitLevel, $allowedByTab[$tab], true)) {
        return $explicitLevel;
    }

    $tingkatRaw = strtolower(trim((string)($payload['tingkat'] ?? '')));
    if (in_array($tingkatRaw, ['internasional', 'international'], true)) {
        $normalizedTingkat = 'internasional';
    } elseif (in_array($tingkatRaw, ['nasional', 'national'], true)) {
        $normalizedTingkat = 'nasional';
    } elseif (in_array($tingkatRaw, ['regional', 'wilayah', 'lokal', 'local', 'perguruan tinggi', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
        $normalizedTingkat = 'wilayah';
    } else {
        $normalizedTingkat = 'wilayah';
    }

    $text = strtolower(trim(implode(' ', [
        (string)($payload['title'] ?? ''),
        (string)($payload['description'] ?? ''),
        (string)($payload['penyelenggara'] ?? ''),
        (string)($payload['subcategory'] ?? ''),
    ])));

    if ($tab === 'jurnal') {
        if ($normalizedTingkat === 'internasional') {
            if (statsContainsAnyKeyword($text, ['bereputasi', 'scopus', 'web of science', 'wos', 'q1', 'q2', 'q3', 'q4'])) {
                return 'reputable_international';
            }
            return 'international';
        }
        if ($normalizedTingkat === 'nasional') {
            if (statsContainsAnyKeyword($text, ['terakreditasi', 'akreditasi', 'sinta'])) {
                return 'national_accredited';
            }
            return 'national_non_accredited';
        }
        return 'national_non_accredited';
    }

    if ($tab === 'seminar') {
        if ($normalizedTingkat === 'internasional') {
            return 'international';
        }
        if ($normalizedTingkat === 'nasional') {
            return 'national';
        }
        return 'local';
    }

    if ($tab === 'pagelaran') {
        if ($normalizedTingkat === 'internasional') {
            return 'international';
        }
        if ($normalizedTingkat === 'nasional') {
            return 'national';
        }
        return 'regional';
    }

    return '';
}

function sumDisseminationTabTotal(array $byYear, array $keys): int {
    $total = 0;
    foreach ($byYear as $row) {
        foreach ($keys as $key) {
            $total += (int)($row[$key] ?? 0);
        }
    }
    return $total;
}

function getPublicationsFromRecords(PDO $pdo, $yearFilter, $tabFilter = null) {
    $tab = normalizeDisseminationTabFilter($tabFilter);

    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload, tahun_pelaporan FROM menu_publications_records $where");

    $jurnalByYear = [];
    $seminarByYear = [];
    $pagelaranByYear = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $year = (int)$row['tahun_pelaporan'];

        $dataTab = resolveDisseminationTabFromPayload($payload);
        if ($dataTab === '') {
            continue;
        }
        if ($tab !== 'all' && $tab !== $dataTab) {
            continue;
        }

        if ($dataTab === 'seminar' && !isValidSeminarPublicationPayload($payload)) {
            continue;
        }

        $perolehan = normalizeDisseminationPerolehanFromPayload($payload);
        $level = resolveDisseminationLevelFromPayload($dataTab, $payload);
        $prefix = $perolehan === 'kolaborasi_dosen' ? 'kolaborasi' : 'mandiri';

        if ($dataTab === 'jurnal') {
            if (!isset($jurnalByYear[$year])) {
                $jurnalByYear[$year] = [
                    'year' => $year,
                    'mandiriNationalNonAccredited' => 0,
                    'mandiriNationalAccredited' => 0,
                    'mandiriInternational' => 0,
                    'mandiriReputableInternational' => 0,
                    'kolaborasiNationalNonAccredited' => 0,
                    'kolaborasiNationalAccredited' => 0,
                    'kolaborasiInternational' => 0,
                    'kolaborasiReputableInternational' => 0,
                ];
            }

            $suffixMap = [
                'national_non_accredited' => 'NationalNonAccredited',
                'national_accredited' => 'NationalAccredited',
                'international' => 'International',
                'reputable_international' => 'ReputableInternational',
            ];
            $suffix = $suffixMap[$level] ?? 'NationalNonAccredited';
            $key = $prefix . $suffix;
            $jurnalByYear[$year][$key] = (int)($jurnalByYear[$year][$key] ?? 0) + 1;
            continue;
        }

        if ($dataTab === 'seminar') {
            if (!isset($seminarByYear[$year])) {
                $seminarByYear[$year] = [
                    'year' => $year,
                    'mandiriLocal' => 0,
                    'mandiriNational' => 0,
                    'mandiriInternational' => 0,
                    'kolaborasiLocal' => 0,
                    'kolaborasiNational' => 0,
                    'kolaborasiInternational' => 0,
                ];
            }

            $suffixMap = [
                'local' => 'Local',
                'national' => 'National',
                'international' => 'International',
            ];
            $suffix = $suffixMap[$level] ?? 'Local';
            $key = $prefix . $suffix;
            $seminarByYear[$year][$key] = (int)($seminarByYear[$year][$key] ?? 0) + 1;
            continue;
        }

        if ($dataTab === 'pagelaran') {
            if (!isset($pagelaranByYear[$year])) {
                $pagelaranByYear[$year] = [
                    'year' => $year,
                    'mandiriRegional' => 0,
                    'mandiriNational' => 0,
                    'mandiriInternational' => 0,
                    'kolaborasiRegional' => 0,
                    'kolaborasiNational' => 0,
                    'kolaborasiInternational' => 0,
                ];
            }

            $suffixMap = [
                'regional' => 'Regional',
                'national' => 'National',
                'international' => 'International',
            ];
            $suffix = $suffixMap[$level] ?? 'Regional';
            $key = $prefix . $suffix;
            $pagelaranByYear[$year][$key] = (int)($pagelaranByYear[$year][$key] ?? 0) + 1;
        }
    }

    ksort($jurnalByYear);
    ksort($seminarByYear);
    ksort($pagelaranByYear);

    $result = [
        'jurnal' => [
            'by_year' => array_values($jurnalByYear),
            'total' => sumDisseminationTabTotal($jurnalByYear, [
                'mandiriNationalNonAccredited',
                'mandiriNationalAccredited',
                'mandiriInternational',
                'mandiriReputableInternational',
                'kolaborasiNationalNonAccredited',
                'kolaborasiNationalAccredited',
                'kolaborasiInternational',
                'kolaborasiReputableInternational',
            ]),
        ],
        'seminar' => [
            'by_year' => array_values($seminarByYear),
            'total' => sumDisseminationTabTotal($seminarByYear, [
                'mandiriLocal',
                'mandiriNational',
                'mandiriInternational',
                'kolaborasiLocal',
                'kolaborasiNational',
                'kolaborasiInternational',
            ]),
        ],
        'pagelaran' => [
            'by_year' => array_values($pagelaranByYear),
            'total' => sumDisseminationTabTotal($pagelaranByYear, [
                'mandiriRegional',
                'mandiriNational',
                'mandiriInternational',
                'kolaborasiRegional',
                'kolaborasiNational',
                'kolaborasiInternational',
            ]),
        ],
    ];

    // Backward compatibility untuk klien lama.
    $result['journals'] = $result['jurnal'];
    $result['seminars'] = $result['seminar'];
    $result['performances'] = $result['pagelaran'];

    return $result;
}

/**
 * Mahasiswa Aktif: data hanya dari input manual (active_students_semester_stats).
 * Tidak lagi membaca menu_active_students_records.
 */
function getActiveStudentsFromRecords(PDO $pdo, $yearFilter) {
    $statsByYear = [];
    try {
        $sqlStats = "SELECT tahun, semester, pd_dikti, aktif FROM active_students_semester_stats";
        if ($yearFilter) {
            $stmtStats = $pdo->prepare($sqlStats . " WHERE tahun = ?");
            $stmtStats->execute([$yearFilter]);
        } else {
            $stmtStats = $pdo->query($sqlStats);
        }
        if ($stmtStats) {
            while ($row = $stmtStats->fetch(PDO::FETCH_ASSOC)) {
                $y = (int)$row['tahun'];
                if (!isset($statsByYear[$y])) $statsByYear[$y] = ['genap' => ['pd_dikti' => 0, 'aktif' => 0], 'ganjil' => ['pd_dikti' => 0, 'aktif' => 0]];
                $sem = $row['semester'] === 'genap' ? 'genap' : 'ganjil';
                $aktif = isset($row['aktif']) && $row['aktif'] !== null ? (int)$row['aktif'] : 0;
                $statsByYear[$y][$sem] = ['pd_dikti' => (int)$row['pd_dikti'], 'aktif' => $aktif];
            }
        }
    } catch (Throwable $e) {
        // Table may not exist yet
    }

    $years = array_keys($statsByYear);
    sort($years);
    if ($yearFilter) $years = array_values(array_filter($years, fn($y) => $y === $yearFilter));

    $byYear = [];
    foreach ($years as $y) {
        $genap = $statsByYear[$y]['genap'] ?? ['pd_dikti' => 0, 'aktif' => 0];
        $ganjil = $statsByYear[$y]['ganjil'] ?? ['pd_dikti' => 0, 'aktif' => 0];
        $byYear[] = [
            'year' => $y,
            'genap_aktif' => $genap['aktif'],
            'genap_pd_dikti' => $genap['pd_dikti'],
            'ganjil_aktif' => $ganjil['aktif'],
            'ganjil_pd_dikti' => $ganjil['pd_dikti'],
        ];
    }

    $total = 0;
    foreach ($byYear as $v) $total += $v['genap_aktif'] + $v['ganjil_aktif'];

    return ['by_year' => $byYear, 'total' => $total];
}

function getStudentProductsFromRecords(PDO $pdo, $yearFilter) {
    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload FROM menu_student_products_records $where");
    $categories = ['makanan_minuman' => 'Makanan & Minuman', 'fashion_lifestyle' => 'Fashion & Lifestyle', 'teknologi_bisnis' => 'Teknologi Bisnis Terapan', 'pendidikan' => 'Pendidikan', 'investasi_keuangan' => 'Investasi & Keuangan', 'transportasi_logistik' => 'Transportasi & Logistik', 'pariwisata' => 'Pariwisata', 'jasa_profesional' => 'Jasa Profesional', 'layanan_digital' => 'Layanan Digital', 'waralaba' => 'Waralaba', 'bisnis_hijau' => 'Bisnis Hijau'];
    $counts = array_fill_keys(array_keys($categories), 0);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $sub = $payload['subcategory'] ?? '';
        if ($sub === 'course_portfolio') $counts['pendidikan']++;
        elseif ($sub === 'internship') $counts['layanan_digital']++;
        elseif (isset($counts[$sub])) $counts[$sub]++;
    }
    $byCategory = [];
    foreach ($categories as $key => $label) {
        $byCategory[] = ['label' => $label, 'key' => $key, 'count' => $counts[$key] ?? 0];
    }
    $total = array_sum($counts);
    return ['by_category' => $byCategory, 'total' => $total];
}

function getResearchOutputsFromRecords(PDO $pdo, $yearFilter, $tabFilter = null) {
    $tab = $tabFilter !== null ? (string)$tabFilter : 'all';
    if (!in_array($tab, ['all', 'haki', 'technology', 'other'], true)) {
        throw new InvalidArgumentException('Tab research outputs tidak valid.');
    }

    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload FROM menu_research_outputs_records $where");
    $hakiLabels = [
        'trademark' => 'Merek',
        'patent' => 'Paten',
        'simple_patent' => 'Paten Sederhana',
        'industrial_design' => 'Desain Industri',
        'copyright' => 'Hak Cipta',
        'geographical_indication' => 'Indikasi Geografis',
        'trade_secret' => 'Rahasia Dagang',
        'circuit_layout' => 'Desain Tata Letak Sirkuit Terpadu',
    ];
    $technologyLabels = [
        'software_development' => 'Pengembangan Software',
        'technology_product' => 'Produk Teknologi Tepat Guna',
        'standardized_product' => 'Produk Terstandarisasi',
        'certified_product' => 'Produk Tersertifikasi',
        'social_engineering' => 'Rekayasa Sosial',
        'consulting_mentoring' => 'Konsultasi/Pendampingan',
    ];
    $otherLabels = [
        'isbn_book' => 'Buku ber-ISBN',
        'book_chapter' => 'Book Chapter',
    ];

    $hakiCounts = array_fill_keys(array_keys($hakiLabels), 0);
    $technologyCounts = array_fill_keys(array_keys($technologyLabels), 0);
    $otherCounts = array_fill_keys(array_keys($otherLabels), 0);

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $subcategory = normalizeResearchOutputSubcategory((string)($payload['subcategory'] ?? ''));
        if (!isResearchOutputSubcategory($subcategory)) {
            continue;
        }

        if (in_array($subcategory, researchOutputHakiSubcategories(), true)) {
            if ($tab === 'technology' || $tab === 'other') {
                continue;
            }
            if (isset($hakiCounts[$subcategory])) {
                $hakiCounts[$subcategory]++;
            }
            continue;
        }

        if (in_array($subcategory, researchOutputBookSubcategories(), true)) {
            if ($tab === 'haki' || $tab === 'technology') {
                continue;
            }
            if (isset($otherCounts[$subcategory])) {
                $otherCounts[$subcategory]++;
            }
            continue;
        }

        if ($tab === 'haki' || $tab === 'other') {
            continue;
        }
        if (isset($technologyCounts[$subcategory])) {
            $technologyCounts[$subcategory]++;
        }
    }

    $intellectualProperty = [];
    foreach ($hakiLabels as $key => $name) {
        $intellectualProperty[] = ['name' => $name, 'key' => $key, 'count' => (int)($hakiCounts[$key] ?? 0)];
    }

    $other = [];
    foreach ($otherLabels as $key => $name) {
        $other[] = ['name' => $name, 'key' => $key, 'count' => (int)($otherCounts[$key] ?? 0)];
    }

    $technologyBreakdown = [];
    foreach ($technologyLabels as $key => $name) {
        $technologyBreakdown[] = ['name' => $name, 'key' => $key, 'count' => (int)($technologyCounts[$key] ?? 0)];
    }

    $softwareCount = (int)($technologyCounts['software_development'] ?? 0);
    $technologyProductCount = 0;
    foreach ($technologyCounts as $key => $count) {
        if ($key === 'software_development') {
            continue;
        }
        $technologyProductCount += (int)$count;
    }

    $totalHaki = array_sum($hakiCounts);
    $totalTechnology = array_sum($technologyCounts);
    $totalOther = array_sum($otherCounts);

    return [
        'intellectual_property' => $intellectualProperty,
        'technology' => [
            'softwareDevelopment' => $softwareCount,
            'products' => $technologyProductCount,
            'breakdown' => $technologyBreakdown,
        ],
        'other' => $other,
        'total' => $totalHaki + $totalTechnology + $totalOther,
    ];
}

function getStudentAchievementsFromRecords(PDO $pdo, $yearFilter, $tabFilter = null) {
    $tab = $tabFilter !== null ? (string)$tabFilter : 'all';
    if ($tab === 'non_academic') {
        $tab = 'nonAcademic';
    }
    if (!in_array($tab, ['all', 'academic', 'nonAcademic'], true)) {
        throw new InvalidArgumentException('Tab student achievements tidak valid.');
    }

    $where = getVisibleRecordWhere();
    if ($yearFilter) $where .= ' AND tahun_pelaporan = ' . (int)$yearFilter;
    $stmt = $pdo->query("SELECT payload FROM menu_student_achievements_records $where");
    $byCategory = [];
    $byYear = [];
    $byType = ['academic' => 0, 'non_academic' => 0];
    $academicBreakdown = ['local' => 0, 'national' => 0, 'international' => 0];
    $nonAcademicBreakdown = ['local' => 0, 'national' => 0, 'international' => 0];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = json_decode($row['payload'], true) ?: [];
        $cat = (string)($payload['category'] ?? '');
        $sub = (string)($payload['subcategory'] ?? '');
        $tingkat = (string)($payload['tingkat'] ?? 'lokal');
        $y = isset($payload['year']) ? (int)$payload['year'] : 0;
        $achievementType = normalizeAchievementType((string)($payload['achievement_type'] ?? deriveAchievementTypeFromCategory($cat, $sub)));
        if ($tab === 'academic' && $achievementType !== 'academic') {
            continue;
        }
        if ($tab === 'nonAcademic' && $achievementType === 'academic') {
            continue;
        }

        if ($cat !== '') {
            $byCategory[$cat] = ($byCategory[$cat] ?? 0) + 1;
        }
        if ($y > 0) {
            $byYear[$y] = ($byYear[$y] ?? 0) + 1;
        }

        $byType[$achievementType] = ($byType[$achievementType] ?? 0) + 1;
        $isAcademic = $achievementType === 'academic';

        if ($tingkat === 'internasional') {
            if ($isAcademic) $academicBreakdown['international']++; else $nonAcademicBreakdown['international']++;
        } elseif ($tingkat === 'nasional') {
            if ($isAcademic) $academicBreakdown['national']++; else $nonAcademicBreakdown['national']++;
        } else {
            if ($isAcademic) $academicBreakdown['local']++; else $nonAcademicBreakdown['local']++;
        }
    }
    $labels = [
        'lomba' => 'Lomba', 'seminar' => 'Publikasi di Seminar', 'publikasi' => 'Publikasi', 'haki' => 'HAKI', 'magang' => 'Magang',
        'portofolio' => 'Portofolio', 'wirausaha' => 'Wirausaha', 'pengembangan' => 'Pengembangan Diri', 'organisasi' => 'Organisasi',
        'self_development' => 'Pengembangan Diri', 'event_participation' => 'Partisipasi Event',
        'scientific_work' => 'Karya Ilmiah', 'intellectual_property' => 'Kekayaan Intelektual', 'applied_academic' => 'Produk Terapan',
    ];
    $byCategoryArr = [];
    foreach ($byCategory as $category => $count) {
        $byCategoryArr[] = [
            'category' => $category,
            'label' => $labels[$category] ?? ucfirst(str_replace('_', ' ', $category)),
            'count' => $count,
        ];
    }
    usort($byCategoryArr, function ($a, $b) { return $b['count'] - $a['count']; });
    $years = array_keys($byYear);
    sort($years);
    $byYearArr = [];
    foreach ($years as $y) {
        $byYearArr[] = ['year' => $y, 'count' => $byYear[$y]];
    }

    $byTypeArr = [
        ['type' => 'academic', 'label' => 'Akademik', 'count' => (int)($byType['academic'] ?? 0)],
        ['type' => 'non_academic', 'label' => 'Non Akademik', 'count' => (int)($byType['non_academic'] ?? 0)],
    ];

    $total = array_sum($byCategory);
    return [
        'by_category' => $byCategoryArr,
        'by_type' => $byTypeArr,
        'by_year' => array_values($byYearArr),
        'total' => $total,
        'filter_year' => $yearFilter,
        'academic_breakdown' => $academicBreakdown,
        'non_academic_breakdown' => $nonAcademicBreakdown,
    ];
}
