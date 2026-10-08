<?php
/** Aggregate the historical workbook without creating survey invitations. */
function loadImportedSatisfaction(PDO $pdo): array {
    $result = ['available' => false, 'respondents' => 0, 'rating_count' => 0, 'aspects' => []];
    $tables = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN ('import_kepuasan_pengguna', 'import_kepuasan_penilaian')")
        ->fetchAll(PDO::FETCH_COLUMN);
    if (count($tables) !== 2) {
        return $result;
    }
    $result['available'] = true;

    // Workbook headings differ from the survey in two places, including
    // the original "Integritasi" spelling. Map to stable survey codes.
    $indicators = [
        'Etika' => ['etika', 'Etika'],
        'Kemampuan pada Bidang Utama' => ['kompetensi_utama', 'Keahlian pada bidang ilmu (kompetensi utama)'],
        'Kemampuan Berbahasa Asing' => ['bahasa_asing', 'Kemampuan berbahasa asing'],
        'Penggunaan Teknologi Informasi' => ['teknologi_informasi', 'Penggunaan teknologi informasi'],
        'Kemampuan Berkomunikasi' => ['komunikasi', 'Kemampuan berkomunikasi'],
        'Kerjasama' => ['kerjasama', 'Kerjasama'],
        'Pengembangan Diri' => ['pengembangan_diri', 'Pengembangan diri'],
        'Loyalitas terhadap Tujuan Perusahaan' => ['loyalitas_tujuan', 'Loyalitas terhadap tujuan perusahaan'],
        'Integritasi Diri dalam Pergaulan di Perusahaan' => ['integritas_pergaulan', 'Integritas diri dalam pergaulan di perusahaan'],
        'Kemampuan Mengelola Waktu Kerja' => ['manajemen_waktu', 'Kemampuan mengelola waktu kerja'],
    ];
    $scoreKeys = [1 => 'tidak_baik', 2 => 'kurang_baik', 3 => 'cukup_baik', 4 => 'baik', 5 => 'sangat_baik'];
    $placeholders = implode(',', array_fill(0, count($indicators), '?'));
    $where = "FROM import_kepuasan_penilaian p
        JOIN import_kepuasan_pengguna r ON r.id = p.record_id
        WHERE r.kategori = 'bekerja' AND p.skor BETWEEN 1 AND 5
          AND p.indikator IN ($placeholders)";
    $params = array_keys($indicators);
    $statement = $pdo->prepare("SELECT p.indikator, p.skor, COUNT(*) AS total $where GROUP BY p.indikator, p.skor");
    $statement->execute($params);
    $counts = [];
    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        // Case-insensitive SQL collations may return a differently cased label.
        $heading = null;
        foreach ($indicators as $candidate => $definition) {
            if (strcasecmp($candidate, trim($row['indikator'])) === 0) {
                $heading = $candidate;
                break;
            }
        }
        if ($heading === null) {
            continue;
        }
        $score = (int)$row['skor'];
        $counts[$heading][$scoreKeys[$score]] = ($counts[$heading][$scoreKeys[$score]] ?? 0) + (int)$row['total'];
    }
    $order = 0;
    foreach ($indicators as $heading => [$code, $name]) {
        $order++;
        if (!isset($counts[$heading])) {
            continue;
        }
        $aspect = [
            'aspect_id' => 'import-' . $code,
            'aspect_code' => $code,
            'aspect_name' => $name,
            'sort_order' => $order,
        ];
        foreach ($scoreKeys as $key) {
            $aspect[$key] = $counts[$heading][$key] ?? 0;
        }
        $aspect['total'] = array_sum($counts[$heading]);
        $result['rating_count'] += $aspect['total'];
        $result['aspects'][] = $aspect;
    }
    $statement = $pdo->prepare("SELECT COUNT(DISTINCT p.record_id) $where");
    $statement->execute($params);
    $result['respondents'] = (int)$statement->fetchColumn();
    return $result;
}

/** Add imported counts to existing codes, or retain their own indicator row. */
function mergeImportedSatisfactionDistribution(array $distribution, array $importedAspects): array {
    $positions = [];
    foreach ($distribution as $index => $aspect) {
        $positions[$aspect['aspect_code']] = $index;
    }
    foreach ($importedAspects as $aspect) {
        $code = $aspect['aspect_code'];
        if (!isset($positions[$code])) {
            $positions[$code] = count($distribution);
            $distribution[] = $aspect;
            continue;
        }
        $index = $positions[$code];
        foreach (['sangat_baik', 'baik', 'cukup_baik', 'kurang_baik', 'tidak_baik', 'total'] as $key) {
            $distribution[$index][$key] += $aspect[$key];
        }
    }
    usort($distribution, static function (array $a, array $b): int {
        return $a['sort_order'] <=> $b['sort_order'];
    });
    return $distribution;
}
