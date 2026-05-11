<?php
/**
 * Insight Intelligence Engine (rule-based, no external AI API)
 */

require_once __DIR__ . '/stats_from_records.php';

if (!defined('INTELLIGENCE_STALE_SYNC_DAYS')) {
    define('INTELLIGENCE_STALE_SYNC_DAYS', 14);
}

function intel_round(?float $value, int $precision = 2): ?float {
    return $value === null ? null : round($value, $precision);
}

function intel_seed_index(string $seed, int $mod): int {
    if ($mod <= 0) return 0;
    $hash = (int) sprintf('%u', crc32($seed));
    return $hash % $mod;
}

function intel_scope_count(array $byScope, string $key): int {
    foreach ($byScope as $row) {
        if (($row['key'] ?? '') === $key) return (int)($row['count'] ?? 0);
    }
    return 0;
}

function intel_waiting_lt6(array $waitingData): array {
    $lt6 = 0;
    $total = 0;
    foreach (($waitingData['by_year'] ?? []) as $row) {
        $less = (int)($row['lessThan3Months'] ?? 0);
        $mid = (int)($row['between3And6Months'] ?? 0);
        $more = (int)($row['moreThan6Months'] ?? 0);
        $lt6 += ($less + $mid);
        $total += ($less + $mid + $more);
    }
    $rate = $total > 0 ? (($lt6 / $total) * 100.0) : 0.0;
    return [
        'count' => $lt6,
        'total' => $total,
        'rate' => intel_round($rate, 2) ?? 0.0,
    ];
}

function intel_delta(?float $current, ?float $previous): ?float {
    if ($current === null || $previous === null) return null;
    if (abs($previous) < 0.000001) return null;
    return intel_round((($current - $previous) / abs($previous)) * 100.0, 2);
}

function intel_direction(?float $delta): string {
    if ($delta === null) return 'flat';
    if ($delta >= 0.1) return 'up';
    if ($delta <= -0.1) return 'down';
    return 'flat';
}

function intel_severity_rank(string $severity): int {
    if ($severity === 'critical') return 3;
    if ($severity === 'warning') return 2;
    return 1;
}

function intel_severity_max(string $a, string $b): string {
    return intel_severity_rank($a) >= intel_severity_rank($b) ? $a : $b;
}

function intel_metric_title(string $metricKey): string {
    $map = [
        'employability_rate' => 'Keterserapan Kerja',
        'entrepreneurship_rate' => 'Tren Kewirausahaan',
        'waiting_time_lt_6m_rate' => 'Kecepatan Serapan (< 6 Bulan)',
        'satisfaction_overall' => 'Kepuasan Pengguna Lulusan',
        'data_quality' => 'Kualitas Data Insight',
    ];
    return $map[$metricKey] ?? $metricKey;
}

function intel_metric_severity(string $metricKey, float $value, ?float $delta): string {
    $severity = 'info';
    if ($metricKey === 'employability_rate') {
        if ($value < 50) $severity = 'critical';
        elseif ($value < 70) $severity = 'warning';
    } elseif ($metricKey === 'entrepreneurship_rate') {
        if ($value < 5) $severity = 'critical';
        elseif ($value < 10) $severity = 'warning';
    } elseif ($metricKey === 'waiting_time_lt_6m_rate') {
        if ($value < 25) $severity = 'critical';
        elseif ($value < 40) $severity = 'warning';
    } elseif ($metricKey === 'satisfaction_overall') {
        if ($value < 3.5) $severity = 'critical';
        elseif ($value < 4.0) $severity = 'warning';
    }
    if ($delta !== null && $delta <= -10.0) {
        $severity = intel_severity_max($severity, 'warning');
    }
    return $severity;
}

function intel_disclaimer_options(): array {
    return [
        'Interpretasi ini bersifat indikatif karena ukuran sampel belum memadai.',
        'Kesimpulan sementara perlu dibaca hati-hati mengingat kelengkapan data belum optimal.',
        'Akurasi analisis dapat meningkat setelah cakupan respons dan sinkronisasi data diperluas.',
    ];
}

function intel_templates(string $metricKey, string $severity, string $direction, string $tone): array {
    $tone = in_array($tone, ['formal', 'ringkas', 'aksi'], true) ? $tone : 'formal';

    if ($metricKey === 'employability_rate') {
        if ($direction === 'down' && $severity !== 'info') {
            $formal = [
                'Terlihat penurunan keterserapan kerja dibanding periode sebelumnya, sehingga intervensi karier perlu dipercepat.',
                'Tren terbaru menunjukkan pelemahan serapan lulusan; penguatan kemitraan industri menjadi prioritas.',
                'Penurunan indikator employability memberi sinyal perlunya evaluasi strategi penempatan kerja alumni.',
            ];
            $ringkas = [
                'Keterserapan kerja menurun dibanding periode sebelumnya dan perlu respons cepat.',
                'Serapan lulusan melemah; kemitraan industri perlu diperkuat.',
                'Indikator employability turun dan membutuhkan evaluasi strategi penempatan.',
            ];
            $aksi = [
                'Keterserapan kerja menurun; percepat intervensi karier pada periode berjalan.',
                'Serapan lulusan melemah; prioritaskan perluasan mitra industri dan job matching.',
                'Indikator employability turun; lakukan evaluasi taktis program penempatan alumni.',
            ];
        } elseif ($severity === 'info') {
            $formal = [
                'Tingkat keterserapan kerja berada pada level kuat dan menunjukkan transisi lulusan ke dunia kerja berjalan efektif.',
                'Proporsi alumni bekerja saat ini mengindikasikan kesiapan lulusan yang baik terhadap kebutuhan pasar.',
                'Capaian keterserapan kerja mencerminkan performa program studi yang konsisten pada aspek employability.',
            ];
            $ringkas = [
                'Keterserapan kerja berada di level kuat.',
                'Proporsi alumni bekerja menunjukkan kesiapan lulusan yang baik.',
                'Capaian employability terjaga secara konsisten.',
            ];
            $aksi = [
                'Keterserapan kerja sudah kuat; pertahankan dengan pipeline kemitraan industri yang stabil.',
                'Capaian employability baik; lanjutkan strategi penempatan dan pemantauan kualitas mitra.',
                'Transisi lulusan efektif; scale-up praktik yang sudah terbukti berhasil.',
            ];
        } else {
            $formal = [
                'Keterserapan kerja masih berada pada level menengah dan membutuhkan penguatan program transisi karier.',
                'Serapan lulusan belum optimal; ruang perbaikan masih terbuka pada sisi penempatan kerja.',
                'Indikator employability menunjukkan kebutuhan intervensi yang lebih terarah.',
            ];
            $ringkas = [
                'Keterserapan kerja masih menengah dan perlu penguatan.',
                'Serapan lulusan belum optimal.',
                'Employability perlu intervensi yang lebih terarah.',
            ];
            $aksi = [
                'Keterserapan kerja menengah; tingkatkan program transisi karier dalam jangka pendek.',
                'Serapan belum optimal; fokuskan intervensi pada penempatan kerja dan kemitraan.',
                'Employability perlu dorongan; tetapkan target dan eksekusi program per kuartal.',
            ];
        }
        return $tone === 'ringkas' ? $ringkas : ($tone === 'aksi' ? $aksi : $formal);
    }

    if ($metricKey === 'entrepreneurship_rate' && $severity !== 'info') {
        $formal = [
            'Porsi alumni berwirausaha masih terbatas, menandakan ekosistem inkubasi perlu diperkuat.',
            'Kontribusi jalur wirausaha belum dominan; dukungan mentoring bisnis dapat ditingkatkan.',
            'Indikator kewirausahaan masih rendah dan memerlukan dorongan program yang lebih terarah.',
        ];
        $ringkas = [
            'Porsi alumni wirausaha masih rendah.',
            'Jalur wirausaha belum dominan dan butuh dukungan lebih kuat.',
            'Indikator kewirausahaan perlu didorong secara terarah.',
        ];
        $aksi = [
            'Porsi wirausaha rendah; aktifkan program inkubasi dan mentoring bisnis secara intensif.',
            'Jalur wirausaha belum dominan; prioritaskan coaching, akses pasar, dan pendampingan.',
            'Kewirausahaan perlu dorongan; tetapkan target output startup/alumni bisnis.',
        ];
        return $tone === 'ringkas' ? $ringkas : ($tone === 'aksi' ? $aksi : $formal);
    }

    if ($metricKey === 'data_quality') {
        $formal = [
            'Kualitas data perlu ditingkatkan agar interpretasi indikator menjadi lebih andal.',
            'Kelengkapan dan kesegaran data masih memengaruhi tingkat keyakinan analisis.',
            'Mutu data saat ini memerlukan perhatian agar keputusan berbasis insight lebih akurat.',
        ];
        $ringkas = [
            'Kualitas data perlu ditingkatkan.',
            'Kelengkapan data masih memengaruhi akurasi analisis.',
            'Mutu data belum optimal untuk keputusan berisiko tinggi.',
        ];
        $aksi = [
            'Perbaiki kualitas data segera agar insight lebih andal.',
            'Tingkatkan kelengkapan dan sinkronisasi data pada section prioritas.',
            'Fokus pada perbaikan mutu data sebagai fondasi keputusan berbasis indikator.',
        ];
        return $tone === 'ringkas' ? $ringkas : ($tone === 'aksi' ? $aksi : $formal);
    }

    $formal = [
        'Indikator menunjukkan kondisi yang perlu dimonitor secara berkala.',
        'Temuan saat ini relevan sebagai dasar evaluasi periodik.',
        'Nilai indikator mengarah pada kebutuhan tindak lanjut terukur.',
    ];
    $ringkas = [
        'Indikator ini perlu dipantau berkala.',
        'Temuan ini penting untuk evaluasi periodik.',
        'Nilai indikator butuh tindak lanjut terukur.',
    ];
    $aksi = [
        'Pantau indikator ini secara rutin dan tetapkan tindak lanjut.',
        'Gunakan temuan ini sebagai dasar aksi perbaikan periodik.',
        'Tetapkan eksekusi tindak lanjut berbasis nilai indikator saat ini.',
    ];
    return $tone === 'ringkas' ? $ringkas : ($tone === 'aksi' ? $aksi : $formal);
}

function intel_value_sentence(string $metricKey, float $currentValue): string {
    if ($metricKey === 'satisfaction_overall') {
        return 'Skor saat ini ' . number_format($currentValue, 2, '.', '') . '/5.';
    }
    if ($metricKey === 'data_quality') {
        return 'Skor kelengkapan data saat ini ' . number_format($currentValue, 1, '.', '') . '%.';
    }
    return 'Nilai saat ini ' . number_format($currentValue, 2, '.', '') . '%.';
}

function intel_select_interpretation(
    string $metricKey,
    string $severity,
    string $direction,
    string $tone,
    bool $lowQuality,
    float $currentValue,
    string $seedBase,
    int $index,
    ?string &$lastTemplateId
): array {
    $templates = intel_templates($metricKey, $severity, $direction, $tone);
    if (count($templates) === 0) {
        $templates = ['Indikator menunjukkan kondisi yang perlu dimonitor secara berkala.'];
    }

    $records = [];
    foreach ($templates as $idx => $text) {
        $records[] = [
            'id' => $metricKey . '-' . $tone . '-tpl-' . ($idx + 1),
            'text' => trim($text . ' ' . intel_value_sentence($metricKey, $currentValue)),
        ];
    }

    $start = intel_seed_index($seedBase . '|' . $metricKey . '|' . $index . '|' . $tone, count($records));
    $ordered = array_merge(array_slice($records, $start), array_slice($records, 0, $start));
    if (count($ordered) > 1 && $lastTemplateId !== null && $ordered[0]['id'] === $lastTemplateId) {
        $ordered = array_merge(array_slice($ordered, 1), array_slice($ordered, 0, 1));
    }

    $primary = $ordered[0];
    $alternatives = [];
    for ($i = 1; $i < count($ordered) && count($alternatives) < 4; $i++) {
        $alternatives[] = $ordered[$i]['text'];
    }

    // Pastikan minimal 3 alternatif agar konsisten untuk ekspor/report.
    if (count($alternatives) < 3) {
        $fallbackCandidates = [
            'Interpretasi alternatif: ' . $primary['text'],
            'Sudut pandang lain: ' . $primary['text'],
            'Rumusan alternatif: ' . $primary['text'],
            'Versi narasi lain: ' . $primary['text'],
        ];
        foreach ($fallbackCandidates as $fallback) {
            if (count($alternatives) >= 3) break;
            if (in_array($fallback, $alternatives, true)) continue;
            $alternatives[] = $fallback;
        }
    }

    if ($lowQuality) {
        $disclaimerOptions = intel_disclaimer_options();
        $discIdx = intel_seed_index($seedBase . '|disc|' . $metricKey . '|' . $index, count($disclaimerOptions));
        $disclaimer = $disclaimerOptions[$discIdx];
        $primary['text'] = rtrim($primary['text']) . ' ' . $disclaimer;
        foreach ($alternatives as $idx => $alt) {
            $alternatives[$idx] = rtrim($alt) . ' ' . $disclaimer;
        }
    }

    $lastTemplateId = $primary['id'];
    return [
        'primary' => $primary['text'],
        'alternatives' => $alternatives,
        'template_id' => $primary['id'],
        'tone' => $tone,
    ];
}

function intel_confidence_score(int $sampleSize, int $minSample, float $completeness, bool $staleRelated): int {
    if ($sampleSize <= 0) return 15;
    $sampleFactor = max(0.0, min(1.0, $sampleSize / max(1, $minSample)));
    $qualityFactor = max(0.0, min(1.0, $completeness / 100.0));
    $staleFactor = $staleRelated ? 0.75 : 1.0;
    $score = 100.0 * (0.45 * $sampleFactor + 0.35 * $qualityFactor + 0.20 * $staleFactor);
    return (int) round(max(15.0, min(99.0, $score)));
}

function intel_section_label(string $section): string {
    $labels = [
        'study_period' => 'Masa Studi',
        'waiting_time' => 'Waktu Tunggu',
        'work_coverage' => 'Cakupan Kerja',
        'user_satisfaction' => 'Kepuasan Pengguna',
        'publications' => 'Diseminasi Ilmiah',
        'active_students' => 'Mahasiswa Aktif',
        'student_products' => 'Produk Mahasiswa',
        'research_outputs' => 'Luaran Riset',
        'student_achievements' => 'Prestasi Mahasiswa',
    ];
    return $labels[$section] ?? $section;
}

function intel_count_missing_payload_field(PDO $pdo, string $table, string $jsonPath, ?int $yearFilter, string $extraWhere = ''): array {
    $where = getVisibleRecordWhere('r');
    if ($yearFilter !== null) {
        $where .= ' AND r.tahun_pelaporan = ' . (int)$yearFilter;
    }
    if ($extraWhere !== '') {
        $where .= ' AND (' . $extraWhere . ')';
    }

    $fieldExpr = "TRIM(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.payload, '{$jsonPath}')), ''))";
    $totalSql = "SELECT COUNT(*) FROM {$table} r {$where}";
    $missingSql = "SELECT COUNT(*) FROM {$table} r {$where} AND {$fieldExpr} = ''";

    return [
        'total' => (int)$pdo->query($totalSql)->fetchColumn(),
        'missing' => (int)$pdo->query($missingSql)->fetchColumn(),
    ];
}

function intel_data_quality(PDO $pdo, ?int $yearFilter, int $minSample, int $totalAlumni): array {
    $checks = [
        [
            'field' => 'Cakupan kerja (work_scope)',
            'table' => 'menu_work_coverage_records',
            'path' => '$.work_scope',
            'extra' => "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(r.payload, '$.career_status')), '')) IN ('working','entrepreneur')",
        ],
        [
            'field' => 'Bucket waktu tunggu',
            'table' => 'menu_waiting_time_records',
            'path' => '$.bucket',
            'extra' => '',
        ],
        [
            'field' => 'Level diseminasi publikasi',
            'table' => 'menu_publications_records',
            'path' => '$.level_diseminasi',
            'extra' => '',
        ],
        [
            'field' => 'Tingkat prestasi',
            'table' => 'menu_student_achievements_records',
            'path' => '$.tingkat',
            'extra' => '',
        ],
    ];

    $fillRates = [];
    $missingTop = [];
    foreach ($checks as $check) {
        $res = intel_count_missing_payload_field($pdo, $check['table'], $check['path'], $yearFilter, $check['extra']);
        $total = (int)$res['total'];
        $missing = (int)$res['missing'];
        if ($total > 0) $fillRates[] = (($total - $missing) / $total);
        if ($missing > 0) {
            $missingTop[] = [
                'field' => $check['field'],
                'count' => $missing,
            ];
        }
    }

    usort($missingTop, static function (array $a, array $b): int {
        return (int)$b['count'] <=> (int)$a['count'];
    });
    $missingTop = array_slice($missingTop, 0, 5);

    $completeness = 100.0;
    if (count($fillRates) > 0) {
        $completeness = (array_sum($fillRates) / count($fillRates)) * 100.0;
    }
    $completeness = intel_round($completeness, 2) ?? 100.0;

    $trackedSections = [
        'work_coverage', 'waiting_time', 'user_satisfaction', 'publications',
        'student_achievements', 'study_period', 'active_students', 'student_products', 'research_outputs',
    ];
    $staleSections = [];
    foreach ($trackedSections as $section) {
        $meta = getChartMeta($pdo, $section);
        $lastSynced = $meta['last_synced_at'] ?? null;
        if (!$lastSynced) {
            $staleSections[] = intel_section_label($section);
            continue;
        }
        $timestamp = strtotime((string)$lastSynced);
        if ($timestamp === false || ((time() - $timestamp) / 86400) > INTELLIGENCE_STALE_SYNC_DAYS) {
            $staleSections[] = intel_section_label($section);
        }
    }

    $sampleWarning = $totalAlumni < $minSample;
    $lowQuality = $sampleWarning || $completeness < 70 || count($staleSections) > 0;

    return [
        'completeness_score' => $completeness,
        'stale_sections' => $staleSections,
        'missing_fields_top' => $missingTop,
        'sample_warning' => $sampleWarning,
        'sample_size' => $totalAlumni,
        'min_sample' => $minSample,
        'low_quality' => $lowQuality,
    ];
}

function intel_build_recommendations(array $findings, array $dataQuality): array {
    $priorityRank = ['low' => 1, 'medium' => 2, 'high' => 3];
    $result = [];
    $seen = [];

    foreach ($findings as $finding) {
        $metricKey = (string)($finding['metric_key'] ?? '');
        $severity = (string)($finding['severity'] ?? 'info');
        $priority = $severity === 'critical' ? 'high' : ($severity === 'warning' ? 'medium' : 'low');

        $action = '';
        $rationale = '';
        if ($metricKey === 'employability_rate') {
            $action = $severity === 'info'
                ? 'Pertahankan model penempatan kerja yang efektif dan dokumentasikan praktik terbaik.'
                : 'Perkuat kemitraan industri aktif dan jalankan job matching terjadwal untuk cohort prioritas.';
            $rationale = $severity === 'info'
                ? 'Capaian employability sudah baik dan perlu dijaga konsistensinya.'
                : 'Indikator employability belum stabil dan membutuhkan akselerasi penempatan lulusan.';
        } elseif ($metricKey === 'entrepreneurship_rate') {
            $action = $severity === 'info'
                ? 'Scale-up program kewirausahaan berbasis capaian alumni yang sudah terbukti.'
                : 'Aktifkan program inkubasi bisnis, mentoring, dan akses jejaring pasar untuk alumni.';
            $rationale = $severity === 'info'
                ? 'Tren kewirausahaan positif dapat menjadi diferensiasi lulusan.'
                : 'Kontribusi jalur wirausaha masih rendah sehingga perlu intervensi terarah.';
        } elseif ($metricKey === 'waiting_time_lt_6m_rate') {
            $action = 'Percepat transisi kerja melalui career bootcamp, simulasi interview, dan kanal lowongan prioritas.';
            $rationale = 'Masa tunggu kerja perlu ditekan agar serapan lulusan terjadi lebih cepat.';
        } elseif ($metricKey === 'satisfaction_overall') {
            $action = 'Prioritaskan perbaikan aspek layanan dengan skor terendah dan lakukan evaluasi berkala.';
            $rationale = 'Skor kepuasan pengguna harus dijaga untuk mendukung mutu lulusan.';
        } elseif ($metricKey === 'data_quality') {
            $priority = (bool)($dataQuality['sample_warning'] ?? false) ? 'high' : 'medium';
            $action = 'Tingkatkan kelengkapan input tracer serta sinkronisasi section yang belum mutakhir.';
            $rationale = 'Kualitas data menentukan tingkat kepercayaan terhadap seluruh insight.';
        }

        if ($action === '' || isset($seen[$action])) continue;
        $seen[$action] = true;

        $result[] = [
            'id' => 'rec-' . (string)($finding['id'] ?? uniqid('', true)),
            'priority' => $priority,
            'action' => $action,
            'rationale' => $rationale,
            'related_finding_ids' => [(string)($finding['id'] ?? '')],
        ];
    }

    if (count($result) === 0) {
        $result[] = [
            'id' => 'rec-maintain-1',
            'priority' => 'low',
            'action' => 'Pertahankan proses monitoring indikator utama dan review triwulanan.',
            'rationale' => 'Tidak ada sinyal kritis saat ini, namun konsistensi monitoring tetap diperlukan.',
            'related_finding_ids' => [],
        ];
    }

    usort($result, static function (array $a, array $b) use ($priorityRank): int {
        return ($priorityRank[$b['priority']] ?? 0) <=> ($priorityRank[$a['priority']] ?? 0);
    });

    return $result;
}

function buildInsightIntelligencePayload(PDO $pdo, array $options): array {
    $yearFilter = array_key_exists('year_filter', $options) ? $options['year_filter'] : null;
    $yearLabel = $options['year_label'] ?? 'all';
    $comparePrev = isset($options['compare_prev']) ? (bool)$options['compare_prev'] : true;
    $tone = in_array(($options['tone'] ?? 'formal'), ['formal', 'ringkas', 'aksi'], true) ? (string)$options['tone'] : 'formal';
    $variantSeed = trim((string)($options['variant_seed'] ?? ''));
    $minSample = max(1, (int)($options['min_sample'] ?? 10));
    $seedBase = $variantSeed !== '' ? $variantSeed : (string)microtime(true);

    $workCoverage = getWorkCoverageFromRecords($pdo, $yearFilter);
    $waitingTime = getWaitingTimeFromRecords($pdo, $yearFilter);
    $userSatisfaction = getUserSatisfactionFromRecords($pdo, $yearFilter);

    $totalAlumni = (int)($workCoverage['total'] ?? 0);
    $workingCount = intel_scope_count($workCoverage['by_scope'] ?? [], 'working');
    $entrepreneurCount = intel_scope_count($workCoverage['by_scope'] ?? [], 'entrepreneur');

    $employabilityRate = $totalAlumni > 0 ? intel_round(($workingCount / $totalAlumni) * 100.0, 2) : 0.0;
    $entrepreneurshipRate = $totalAlumni > 0 ? intel_round(($entrepreneurCount / $totalAlumni) * 100.0, 2) : 0.0;
    $waitingLt6 = intel_waiting_lt6($waitingTime);
    $satisfactionOverall = intel_round((float)($userSatisfaction['overall_avg'] ?? 0.0), 2) ?? 0.0;
    $totalResponses = (int)($userSatisfaction['total_responses'] ?? 0);

    $previousYear = null;
    $previousMetrics = [
        'employability_rate' => null,
        'entrepreneurship_rate' => null,
        'waiting_time_lt_6m_rate' => null,
        'satisfaction_overall' => null,
    ];

    if ($comparePrev && is_int($yearFilter)) {
        $previousYear = (int)$yearFilter - 1;
        if ($previousYear >= 1900) {
            $prevWork = getWorkCoverageFromRecords($pdo, $previousYear);
            $prevWaiting = getWaitingTimeFromRecords($pdo, $previousYear);
            $prevSat = getUserSatisfactionFromRecords($pdo, $previousYear);
            $prevTotal = (int)($prevWork['total'] ?? 0);
            $prevWorking = intel_scope_count($prevWork['by_scope'] ?? [], 'working');
            $prevEntrepreneur = intel_scope_count($prevWork['by_scope'] ?? [], 'entrepreneur');
            $prevWaitingLt6 = intel_waiting_lt6($prevWaiting);
            $previousMetrics = [
                'employability_rate' => $prevTotal > 0 ? intel_round(($prevWorking / $prevTotal) * 100.0, 2) : 0.0,
                'entrepreneurship_rate' => $prevTotal > 0 ? intel_round(($prevEntrepreneur / $prevTotal) * 100.0, 2) : 0.0,
                'waiting_time_lt_6m_rate' => (float)$prevWaitingLt6['rate'],
                'satisfaction_overall' => intel_round((float)($prevSat['overall_avg'] ?? 0.0), 2) ?? 0.0,
            ];
        }
    }

    $currentMetrics = [
        'employability_rate' => (float)$employabilityRate,
        'entrepreneurship_rate' => (float)$entrepreneurshipRate,
        'waiting_time_lt_6m_rate' => (float)$waitingLt6['rate'],
        'satisfaction_overall' => (float)$satisfactionOverall,
    ];

    $changeLog = [];
    foreach ($currentMetrics as $metricKey => $currentValue) {
        $previousValue = is_numeric($previousMetrics[$metricKey]) ? (float)$previousMetrics[$metricKey] : null;
        $deltaPct = intel_delta($currentValue, $previousValue);
        $changeLog[] = [
            'metric_key' => $metricKey,
            'current' => $currentValue,
            'previous' => $previousValue,
            'delta_pct' => $deltaPct,
            'direction' => intel_direction($deltaPct),
        ];
    }

    $dataQuality = intel_data_quality($pdo, is_int($yearFilter) ? $yearFilter : null, $minSample, $totalAlumni);
    $lowQuality = (bool)($dataQuality['low_quality'] ?? false);

    $metricSectionMap = [
        'employability_rate' => 'Cakupan Kerja',
        'entrepreneurship_rate' => 'Cakupan Kerja',
        'waiting_time_lt_6m_rate' => 'Waktu Tunggu',
        'satisfaction_overall' => 'Kepuasan Pengguna',
    ];

    $findings = [];
    $lastTemplateId = null;
    $index = 0;
    foreach ($currentMetrics as $metricKey => $currentValue) {
        $change = null;
        foreach ($changeLog as $row) {
            if (($row['metric_key'] ?? '') === $metricKey) {
                $change = $row;
                break;
            }
        }
        $deltaPct = $change['delta_pct'] ?? null;
        $direction = $change['direction'] ?? 'flat';
        $severity = intel_metric_severity($metricKey, (float)$currentValue, $deltaPct);

        $sectionLabel = $metricSectionMap[$metricKey] ?? '';
        $staleRelated = in_array($sectionLabel, $dataQuality['stale_sections'] ?? [], true);
        $sampleSize = $metricKey === 'satisfaction_overall' ? $totalResponses : $totalAlumni;
        if ($metricKey === 'waiting_time_lt_6m_rate') $sampleSize = (int)$waitingLt6['total'];

        $interpretation = intel_select_interpretation(
            $metricKey,
            $severity,
            $direction,
            $tone,
            $lowQuality,
            (float)$currentValue,
            $seedBase,
            $index,
            $lastTemplateId
        );
        $index++;

        $evidence = [];
        if ($metricKey === 'employability_rate') {
            $evidence[] = 'Alumni bekerja: ' . $workingCount . ' dari ' . $totalAlumni . ' (' . number_format((float)$currentValue, 2, '.', '') . '%).';
        } elseif ($metricKey === 'entrepreneurship_rate') {
            $evidence[] = 'Alumni wirausaha: ' . $entrepreneurCount . ' dari ' . $totalAlumni . ' (' . number_format((float)$currentValue, 2, '.', '') . '%).';
        } elseif ($metricKey === 'waiting_time_lt_6m_rate') {
            $evidence[] = 'Serapan < 6 bulan: ' . (int)$waitingLt6['count'] . ' dari ' . (int)$waitingLt6['total'] . ' (' . number_format((float)$currentValue, 2, '.', '') . '%).';
        } elseif ($metricKey === 'satisfaction_overall') {
            $evidence[] = 'Skor kepuasan rata-rata: ' . number_format((float)$currentValue, 2, '.', '') . '/5 dari ' . $totalResponses . ' respons.';
        }
        if ($previousYear !== null && $deltaPct !== null) {
            $sign = $deltaPct > 0 ? '+' : '';
            $evidence[] = 'Perubahan vs ' . $previousYear . ': ' . $sign . number_format((float)$deltaPct, 2, '.', '') . '%.';
        }

        $findings[] = [
            'id' => 'finding-' . $metricKey,
            'title' => intel_metric_title($metricKey),
            'summary' => $interpretation['primary'],
            'severity' => $severity,
            'metric_key' => $metricKey,
            'current_value' => $currentValue,
            'baseline_value' => $change['previous'] ?? null,
            'delta_pct' => $deltaPct,
            'confidence_score' => intel_confidence_score($sampleSize, $minSample, (float)($dataQuality['completeness_score'] ?? 100.0), $staleRelated),
            'evidence' => $evidence,
            'interpretation' => $interpretation,
        ];
    }

    if ($lowQuality) {
        $qualitySeverity = ((float)$dataQuality['completeness_score'] < 50 || count($dataQuality['stale_sections']) >= 3 || (bool)$dataQuality['sample_warning'])
            ? 'critical'
            : 'warning';
        $qualityInterp = intel_select_interpretation('data_quality', $qualitySeverity, 'flat', $tone, true, (float)($dataQuality['completeness_score'] ?? 0.0), $seedBase, $index, $lastTemplateId);
        $qualityEvidence = [
            'Skor kelengkapan data: ' . number_format((float)($dataQuality['completeness_score'] ?? 0.0), 2, '.', '') . '%.',
            'Section stale: ' . (count($dataQuality['stale_sections']) > 0 ? implode(', ', $dataQuality['stale_sections']) : 'Tidak ada') . '.',
        ];
        if (!empty($dataQuality['missing_fields_top'])) {
            $top = $dataQuality['missing_fields_top'][0];
            $qualityEvidence[] = 'Field paling sering kosong: ' . $top['field'] . ' (' . (int)$top['count'] . ' data).';
        }
        $findings[] = [
            'id' => 'finding-data-quality',
            'title' => intel_metric_title('data_quality'),
            'summary' => $qualityInterp['primary'],
            'severity' => $qualitySeverity,
            'metric_key' => 'data_quality',
            'current_value' => (float)($dataQuality['completeness_score'] ?? 0.0),
            'baseline_value' => null,
            'delta_pct' => null,
            'confidence_score' => intel_confidence_score($totalAlumni, $minSample, (float)($dataQuality['completeness_score'] ?? 0.0), count($dataQuality['stale_sections']) > 0),
            'evidence' => $qualityEvidence,
            'interpretation' => $qualityInterp,
        ];
    }

    usort($findings, static function (array $a, array $b): int {
        $sa = intel_severity_rank((string)($a['severity'] ?? 'info'));
        $sb = intel_severity_rank((string)($b['severity'] ?? 'info'));
        if ($sa !== $sb) return $sb <=> $sa;
        return abs((float)($b['delta_pct'] ?? 0)) <=> abs((float)($a['delta_pct'] ?? 0));
    });

    return [
        'generated_at' => date('c'),
        'filters' => [
            'year' => $yearLabel,
            'compare_prev' => $comparePrev,
            'tone' => $tone,
            'variant_seed' => $variantSeed !== '' ? $variantSeed : null,
            'previous_year' => $previousYear,
            'min_sample' => $minSample,
        ],
        'kpi_summary' => [
            'employability_rate' => (float)$employabilityRate,
            'entrepreneurship_rate' => (float)$entrepreneurshipRate,
            'waiting_time_lt_6m_rate' => (float)$waitingLt6['rate'],
            'satisfaction_overall' => (float)$satisfactionOverall,
            'total_alumni_analyzed' => $totalAlumni,
            'total_working' => $workingCount,
            'total_entrepreneur' => $entrepreneurCount,
            'waiting_time_total' => (int)$waitingLt6['total'],
            'waiting_time_lt_6m_count' => (int)$waitingLt6['count'],
            'total_responses' => $totalResponses,
        ],
        'findings' => $findings,
        'recommendations' => intel_build_recommendations($findings, $dataQuality),
        'data_quality' => [
            'completeness_score' => (float)($dataQuality['completeness_score'] ?? 0.0),
            'stale_sections' => $dataQuality['stale_sections'] ?? [],
            'missing_fields_top' => $dataQuality['missing_fields_top'] ?? [],
            'sample_warning' => (bool)($dataQuality['sample_warning'] ?? false),
            'sample_size' => (int)($dataQuality['sample_size'] ?? 0),
            'min_sample' => (int)($dataQuality['min_sample'] ?? $minSample),
        ],
        'change_log' => $changeLog,
    ];
}
