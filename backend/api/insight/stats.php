<?php
/**
 * Dashboard Insight - Data dari menu_*_records (source of truth untuk chart)
 * GET ?section=study_period|waiting_time|job_relevance|work_coverage|user_satisfaction|publications|active_students|student_products|research_outputs
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/stats_from_records.php';
require_once __DIR__ . '/sync_helpers.php';

function resolveInsightTabForSection(string $section, string $rawTab): ?string {
    if ($rawTab === '') {
        return null;
    }

    if ($section === 'publications') {
        $allowed = ['jurnal', 'seminar', 'pagelaran'];
        if (!in_array($rawTab, $allowed, true)) {
            throw new Exception('Parameter tab tidak valid untuk section publications.');
        }
        return $rawTab;
    }

    if ($section === 'seminar_kegiatan') {
        return null;
    }

    if ($section === 'research_outputs') {
        $allowed = ['haki', 'technology', 'other'];
        if (!in_array($rawTab, $allowed, true)) {
            throw new Exception('Parameter tab tidak valid untuk section research_outputs.');
        }
        return $rawTab;
    }

    throw new Exception('Parameter tab tidak berlaku untuk section ini.');
}

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? null;

    $section = isset($_GET['section']) ? trim((string)$_GET['section']) : '';
    if ($section !== '') {
        ensureSectionSynced($pdo, $section, $adminId);
    }
    $year = isset($_GET['year']) ? (int)$_GET['year'] : null;
    $yearFilter = ($year !== null && $year > 1900 && $year < 2100) ? $year : null;
    $tabRaw = isset($_GET['tab']) ? trim((string)$_GET['tab']) : '';
    $tabFilter = resolveInsightTabForSection($section, $tabRaw);

    $data = null;
    $meta = null;

    switch ($section) {
        case 'study_period':
            $data = getStudyPeriodFromRecords($pdo, $yearFilter);
            break;
        case 'waiting_time':
            $data = getWaitingTimeFromRecords($pdo, $yearFilter);
            break;
        case 'job_relevance':
            $data = getJobRelevanceFromRecords($pdo, $yearFilter);
            break;
        case 'work_coverage':
            $data = getWorkCoverageFromRecords($pdo, $yearFilter);
            break;
        case 'user_satisfaction':
            $data = getUserSatisfactionFromRecords($pdo, $yearFilter);
            break;
        case 'publications':
            $data = getPublicationsFromRecords($pdo, $yearFilter, $tabFilter);
            break;
        case 'seminar_kegiatan':
            $data = getPublicationsFromRecords($pdo, $yearFilter, 'seminar');
            break;
        case 'active_students':
            $data = getActiveStudentsFromRecords($pdo, $yearFilter);
            break;
        case 'student_products':
            $data = getStudentProductsFromRecords($pdo, $yearFilter);
            break;
        case 'research_outputs':
            $data = getResearchOutputsFromRecords($pdo, $yearFilter, $tabFilter);
            break;
        default:
            throw new Exception('Section tidak valid. Gunakan: study_period, waiting_time, job_relevance, work_coverage, user_satisfaction, publications, seminar_kegiatan, active_students, student_products, research_outputs');
    }

    $meta = getChartMeta($pdo, $section);

    echo json_encode([
        'success' => true,
        'data' => $data,
        'section' => $section,
        'meta' => $meta,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}

function getStudyPeriod(PDO $pdo, $yearFilter) {
    $whereM = $yearFilter ? ' WHERE deleted_at IS NULL AND tahun_masuk = ' . (int)$yearFilter : ' WHERE deleted_at IS NULL';
    $whereL = $yearFilter ? ' AND tahun_lulus = ' . (int)$yearFilter : '';
    $stmt = $pdo->query("SELECT tahun_masuk AS year, COUNT(*) AS diterima FROM students $whereM GROUP BY tahun_masuk ORDER BY year");
    $diterimaByYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $diterimaByYear[(int)$row['year']] = (int)$row['diterima'];
    $stmt = $pdo->query("SELECT tahun_lulus AS year, COUNT(*) AS lulus FROM students WHERE deleted_at IS NULL AND tahun_lulus IS NOT NULL $whereL GROUP BY tahun_lulus ORDER BY year");
    $lulusByYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) $lulusByYear[(int)$row['year']] = (int)$row['lulus'];
    $allYears = array_unique(array_merge(array_keys($diterimaByYear), array_keys($lulusByYear)));
    sort($allYears);
    $byYear = [];
    foreach ($allYears as $y) {
        $byYear[] = ['year' => $y, 'diterima' => $diterimaByYear[$y] ?? 0, 'lulus' => $lulusByYear[$y] ?? 0];
    }
    $totalDiterima = (int)$pdo->query("SELECT COUNT(*) FROM students WHERE deleted_at IS NULL" . ($yearFilter ? " AND tahun_masuk = " . (int)$yearFilter : ""))->fetchColumn();
    $totalLulus = (int)$pdo->query("SELECT COUNT(*) FROM students WHERE deleted_at IS NULL AND tahun_lulus IS NOT NULL" . ($yearFilter ? " AND tahun_lulus = " . (int)$yearFilter : ""))->fetchColumn();
    return ['by_year' => $byYear, 'total_diterima' => $totalDiterima, 'total_lulus' => $totalLulus];
}

function getWaitingTime(PDO $pdo, $yearFilter) {
    $where = " WHERE s.tahun_lulus IS NOT NULL AND (t.employment_data IS NOT NULL OR t.entrepreneurship_data IS NOT NULL)";
    if ($yearFilter) $where .= " AND s.tahun_lulus = " . (int)$yearFilter;
    $stmt = $pdo->query("
        SELECT t.id, t.career_status, t.employment_data, t.entrepreneurship_data, s.tahun_lulus
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL
        $where
    ");
    $byYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunLulus = (int)$row['tahun_lulus'];
        $tahunMulai = null;
        $bulanMulai = 1;
        $json = $row['career_status'] === 'working' ? $row['employment_data'] : $row['entrepreneurship_data'];
        if ($json) {
            $dec = json_decode($json, true);
            if (isset($dec['tahun_mulai_kerja'])) {
                $tahunMulai = (int)$dec['tahun_mulai_kerja'];
                $b = isset($dec['bulan_mulai_kerja']) ? (int)$dec['bulan_mulai_kerja'] : 1;
                $bulanMulai = ($b >= 1 && $b <= 12) ? $b : 1;
            } elseif (isset($dec['tahun_mulai_usaha'])) {
                $tahunMulai = (int)$dec['tahun_mulai_usaha'];
                $b = isset($dec['bulan_mulai_usaha']) ? (int)$dec['bulan_mulai_usaha'] : 1;
                $bulanMulai = ($b >= 1 && $b <= 12) ? $b : 1;
            }
        }
        if ($tahunMulai === null) continue;
        $bulanLulus = 6;
        $totalBulanMulai = $tahunMulai * 12 + $bulanMulai;
        $totalBulanLulus = $tahunLulus * 12 + $bulanLulus;
        $bulan = $totalBulanMulai - $totalBulanLulus;
        if (!isset($byYear[$tahunLulus])) $byYear[$tahunLulus] = ['year' => $tahunLulus, 'lessThan3Months' => 0, 'between3And6Months' => 0, 'moreThan6Months' => 0];
        if ($bulan < 3) $byYear[$tahunLulus]['lessThan3Months']++;
        elseif ($bulan < 6) $byYear[$tahunLulus]['between3And6Months']++;
        else $byYear[$tahunLulus]['moreThan6Months']++;
    }
    ksort($byYear);
    $by_year = array_values($byYear);
    $total = 0;
    foreach ($by_year as $r) { $total += $r['lessThan3Months'] + $r['between3And6Months'] + $r['moreThan6Months']; }
    return ['by_year' => $by_year, 'total' => $total];
}

function getJobRelevance(PDO $pdo, $yearFilter) {
    $join = " JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL";
    if ($yearFilter) {
        $join .= " AND s.tahun_lulus = " . (int)$yearFilter;
    }
    $stmt = $pdo->query("
        SELECT t.career_status, t.employment_data, t.entrepreneurship_data FROM tracer_study t $join
    ");
    $map = ['sangat_relevan' => 'Sangat Relevan', 'relevan' => 'Relevan', 'cukup_relevan' => 'Cukup Relevan', 'kurang_relevan' => 'Kurang Relevan', 'tidak_relevan' => 'Tidak Relevan'];
    $counts = array_fill_keys(array_keys($map), 0);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $json = $row['career_status'] === 'working' ? $row['employment_data'] : $row['entrepreneurship_data'];
        if (!$json) continue;
        $dec = json_decode($json, true);
        $key = $dec['relevansi_kompetensi'] ?? '';
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

function getWorkCoverage(PDO $pdo, $yearFilter) {
    $labels = ['working' => 'Bekerja', 'entrepreneur' => 'Wirausaha', 'further_study' => 'Studi Lanjut', 'job_seeking' => 'Mencari Kerja'];
    $stmt = $pdo->query("
        SELECT t.career_status, COUNT(*) AS cnt
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL
        GROUP BY t.career_status
    ");
    $byScope = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $byScope[] = ['label' => $labels[$row['career_status']] ?? $row['career_status'], 'key' => $row['career_status'], 'count' => (int)$row['cnt']];
    }
    $whereYear = $yearFilter ? " AND s.tahun_lulus = " . (int)$yearFilter : "";
    $stmt2 = $pdo->query("
        SELECT s.tahun_lulus AS year, COUNT(*) AS cnt
        FROM tracer_study t JOIN students s ON s.id = t.student_id
        WHERE s.deleted_at IS NULL AND s.tahun_lulus IS NOT NULL $whereYear
        GROUP BY s.tahun_lulus ORDER BY year
    ");
    $by_year = [];
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        $y = (int)$row['year'];
        $cnt = (int)$row['cnt'];
        $by_year[] = ['year' => $y, 'local' => 0, 'national' => $cnt, 'multinational' => 0];
    }
    $total = array_sum(array_column($byScope, 'count'));
    return ['by_scope' => $byScope, 'by_year' => $by_year, 'total' => $total];
}

function getUserSatisfaction(PDO $pdo, $yearFilter) {
    $responseFilter = "
        SELECT r.id
        FROM evaluation_responses r
        JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
    ";
    if ($yearFilter) {
        $responseFilter .= " WHERE r.submitted_at >= '" . (int)$yearFilter . "-01-01' AND r.submitted_at < '" . ((int)$yearFilter + 1) . "-01-01'";
    }

    $stmt = $pdo->query("
        SELECT a.id, a.name, AVG(rr.score) AS avg_score, COUNT(DISTINCT rr.response_id) AS response_count
        FROM evaluation_aspects a
        LEFT JOIN evaluation_response_ratings rr ON rr.aspect_id = a.id AND rr.response_id IN ({$responseFilter})
        WHERE a.is_active = 1
        GROUP BY a.id, a.name ORDER BY a.sort_order
    ");
    $aspects = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $avg = $row['avg_score'] !== null ? round((float)$row['avg_score'], 2) : 0;
        $aspects[] = ['aspect_name' => $row['name'], 'avg_score' => $avg, 'response_count' => (int)$row['response_count']];
    }
    $stmt2 = $pdo->query("
        SELECT a.id, a.name, rr.score, COUNT(*) AS cnt
        FROM evaluation_aspects a
        LEFT JOIN evaluation_response_ratings rr ON rr.aspect_id = a.id AND rr.response_id IN ({$responseFilter})
        WHERE a.is_active = 1 AND rr.score IS NOT NULL
        GROUP BY a.id, a.name, rr.score ORDER BY a.sort_order, rr.score
    ");
    $likertByAspect = [];
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
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
    $totalResponses = (int)$pdo->query("SELECT COUNT(*) FROM ({$responseFilter}) x")->fetchColumn();
    $overall = 0;
    $withScore = array_filter($aspects, function ($a) { return $a['response_count'] > 0; });
    if (count($withScore)) $overall = round(array_sum(array_column($withScore, 'avg_score')) / count($withScore), 2);
    return ['aspects' => $aspects, 'likert' => $likert, 'overall_avg' => $overall, 'total_responses' => $totalResponses];
}

function getPublications(PDO $pdo, $yearFilter) {
    $where = " WHERE a.category = 'scientific_work'";
    if ($yearFilter) $where .= " AND YEAR(a.tanggal) = " . (int)$yearFilter;
    $stmt = $pdo->query("
        SELECT YEAR(a.tanggal) AS year, COUNT(*) AS count
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where}
        GROUP BY YEAR(a.tanggal)
        ORDER BY year
    ");
    $journalsByYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $c = (int)$row['count'];
        $journalsByYear[] = [
            'year' => (int)$row['year'],
            'nationalNonAccredited' => $c,
            'nationalAccredited' => 0,
            'international' => 0,
            'reputableInternational' => 0,
        ];
    }
    $where2 = " WHERE a.category = 'event_participation'";
    if ($yearFilter) $where2 .= " AND YEAR(a.tanggal) = " . (int)$yearFilter;
    $stmt2 = $pdo->query("
        SELECT YEAR(a.tanggal) AS year, a.subcategory, COUNT(*) AS count
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where2}
        GROUP BY YEAR(a.tanggal), a.subcategory
        ORDER BY year
    ");
    $seminarRows = [];
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) $seminarRows[] = $row;
    $seminarByYear = [];
    foreach ($seminarRows as $r) {
        $y = (int)$r['year'];
        if (!isset($seminarByYear[$y])) $seminarByYear[$y] = ['year' => $y, 'localSeminars' => 0, 'nationalSeminars' => 0, 'internationalSeminars' => 0, 'exhibitions' => 0];
        $cnt = (int)$r['count'];
        $sub = $r['subcategory'] ?? '';
        if ($sub === 'seminar') $seminarByYear[$y]['nationalSeminars'] += $cnt;
        else $seminarByYear[$y]['localSeminars'] += $cnt;
    }
    $seminarsByYear = array_values($seminarByYear);
    $totalJournals = (int)$pdo->query("
        SELECT COUNT(*)
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where}
    ")->fetchColumn();
    $totalSeminars = (int)$pdo->query("
        SELECT COUNT(*)
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where2}
    ")->fetchColumn();
    return ['journals' => ['by_year' => $journalsByYear, 'total' => $totalJournals], 'seminars' => ['by_year' => $seminarsByYear, 'total' => $totalSeminars]];
}

function getActiveStudents(PDO $pdo, $yearFilter) {
    $where = " WHERE status = 'active' AND deleted_at IS NULL";
    if ($yearFilter) $where .= " AND tahun_masuk = " . (int)$yearFilter;
    $stmt = $pdo->query("SELECT tahun_masuk AS year, COUNT(*) AS count FROM students $where GROUP BY tahun_masuk ORDER BY year");
    $byYear = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $c = (int)$row['count'];
        $byYear[] = ['year' => (int)$row['year'], 'oddSemester' => $c, 'evenSemester' => 0, 'pdDikti' => 0];
    }
    $total = (int)$pdo->query("SELECT COUNT(*) FROM students $where")->fetchColumn();
    return ['by_year' => $byYear, 'total' => $total];
}

function getStudentProducts(PDO $pdo, $yearFilter) {
    $categories = ['makanan_minuman' => 'Makanan & Minuman', 'fashion_lifestyle' => 'Fashion & Lifestyle', 'teknologi_bisnis' => 'Teknologi Bisnis Terapan', 'pendidikan' => 'Pendidikan', 'investasi_keuangan' => 'Investasi & Keuangan', 'transportasi_logistik' => 'Transportasi & Logistik', 'pariwisata' => 'Pariwisata', 'jasa_profesional' => 'Jasa Profesional', 'layanan_digital' => 'Layanan Digital', 'waralaba' => 'Waralaba', 'bisnis_hijau' => 'Bisnis Hijau'];
    $where = " WHERE a.category = 'applied_academic'";
    if ($yearFilter) $where .= " AND YEAR(a.tanggal) = " . (int)$yearFilter;
    $stmt = $pdo->query("
        SELECT a.subcategory, COUNT(*) AS count
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where}
        GROUP BY a.subcategory
    ");
    $counts = array_fill_keys(array_keys($categories), 0);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sub = $row['subcategory'];
        $c = (int)$row['count'];
        if ($sub === 'course_portfolio') $counts['pendidikan'] += $c;
        elseif ($sub === 'internship') $counts['layanan_digital'] += $c;
        elseif (isset($counts[$sub])) $counts[$sub] += $c;
    }
    $byCategory = [];
    foreach ($categories as $key => $label) {
        $byCategory[] = ['label' => $label, 'key' => $key, 'count' => $counts[$key] ?? 0];
    }
    $total = array_sum(array_column($byCategory, 'count'));
    return ['by_category' => $byCategory, 'total' => $total];
}

function getResearchOutputs(PDO $pdo, $yearFilter) {
    $where = " WHERE a.category = 'intellectual_property'";
    if ($yearFilter) $where .= " AND YEAR(a.tanggal) = " . (int)$yearFilter;
    $hakiLabels = ['copyright' => 'Hak Cipta', 'trademark' => 'Merek Dagang', 'industrial_design' => 'Desain Industri', 'simple_patent' => 'Paten Sederhana', 'patent' => 'Paten', 'trade_secret' => 'Rahasia Dagang', 'geographical_indication' => 'Indikasi Geografis', 'circuit_layout' => 'Desain Tata Letak Sirkuit'];
    $stmt = $pdo->query("
        SELECT a.subcategory, COUNT(*) AS count
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where}
        GROUP BY a.subcategory
    ");
    $hakiCounts = array_fill_keys(array_keys($hakiLabels), 0);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sub = $row['subcategory'];
        if (isset($hakiCounts[$sub])) $hakiCounts[$sub] = (int)$row['count'];
        else $hakiCounts['copyright'] += (int)$row['count'];
    }
    $intellectualProperty = [];
    foreach ($hakiLabels as $key => $name) {
        $intellectualProperty[] = ['name' => $name, 'key' => $key, 'count' => $hakiCounts[$key] ?? 0];
    }
    $where2 = " WHERE a.category = 'scientific_work'";
    if ($yearFilter) $where2 .= " AND YEAR(a.tanggal) = " . (int)$yearFilter;
    $totalScientific = (int)$pdo->query("
        SELECT COUNT(*)
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        {$where2}
    ")->fetchColumn();
    $otherLabels = ['Konsulting & Mentoring', 'Bab Buku', 'Rekayasa Sosial', 'Produk Terstandarisasi', 'Buku ISBN', 'Produk Tersertifikasi'];
    $other = [];
    foreach ($otherLabels as $i => $name) {
        $other[] = ['name' => $name, 'count' => $i === 1 ? $totalScientific : 0];
    }
    $totalHaki = array_sum(array_column($intellectualProperty, 'count'));
    $totalOther = array_sum(array_column($other, 'count'));
    return [
        'intellectual_property' => $intellectualProperty,
        'technology' => ['softwareDevelopment' => 0, 'products' => 0],
        'other' => $other,
        'total' => $totalHaki + $totalOther,
    ];
}
