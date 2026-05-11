<?php
/**
 * Sync helpers: master data -> menu_*_records
 * Used by sync.php. Requires $pdo and uses Asia/Jakarta (set in config/database.php).
 */
require_once __DIR__ . '/../achievements/classification_helper.php';
require_once __DIR__ . '/../achievements/store_helper.php';

function normalizeDisseminationAcquisitionTypeValue($value): ?string {
    if (!is_string($value)) {
        return null;
    }

    $normalized = strtolower(trim($value));
    if ($normalized === '') {
        return null;
    }

    if (in_array($normalized, ['mandiri', 'self', 'individu', 'individual'], true)) {
        return 'mandiri';
    }

    if (in_array($normalized, [
        'kolaborasi_dosen',
        'kolaborasi-dosen',
        'kolaborasi dosen',
        'kolaborasi dengan dosen',
        'dosen',
        'lecturer_collaboration',
        'collaboration_lecturer',
        'kolaborasi',
    ], true)) {
        return 'kolaborasi_dosen';
    }

    return null;
}

function normalizeJournalLevelToken($value): ?string {
    if (!is_string($value)) {
        return null;
    }
    $normalized = strtolower(trim($value));
    if ($normalized === '') {
        return null;
    }
    $token = preg_replace('/\s+/', '_', str_replace('-', '_', $normalized)) ?? $normalized;

    if (in_array($token, ['national_non_accredited', 'nasional_tidak_terakreditasi'], true)) {
        return 'national_non_accredited';
    }
    if (in_array($token, ['national_accredited', 'nasional_terakreditasi'], true)) {
        return 'national_accredited';
    }
    if (in_array($token, ['international', 'internasional'], true)) {
        return 'international';
    }
    if (in_array($token, ['reputable_international', 'internasional_bereputasi', 'international_reputable'], true)) {
        return 'reputable_international';
    }
    return null;
}

function inferDisseminationAcquisitionType(array $achievement): string {
    $candidateKeys = [
        'jenis_perolehan',
        'jenisPerolehan',
        'perolehan',
        'acquisition_type',
        'acquisitionType',
    ];

    foreach ($candidateKeys as $key) {
        if (!array_key_exists($key, $achievement)) {
            continue;
        }
        $normalized = normalizeDisseminationAcquisitionTypeValue($achievement[$key]);
        if ($normalized !== null) {
            return $normalized;
        }
    }

    $textSources = [
        (string)($achievement['title'] ?? ''),
        (string)($achievement['description'] ?? ''),
        (string)($achievement['penyelenggara'] ?? ''),
        (string)($achievement['penulis'] ?? ''),
        (string)($achievement['peran_penulis'] ?? ''),
    ];
    $text = strtolower(trim(implode(' ', $textSources)));
    if ($text !== '') {
        if (
            strpos($text, 'dosen') !== false
            || strpos($text, 'pembimbing') !== false
            || strpos($text, 'co-author') !== false
            || strpos($text, 'co author') !== false
            || strpos($text, 'coauthor') !== false
        ) {
            return 'kolaborasi_dosen';
        }
    }

    return 'mandiri';
}

function resolveDisseminationAcquisitionAndLecturer(array $achievement): array {
    $jenisPerolehan = inferDisseminationAcquisitionType($achievement);
    $namaDosenRaw = trim((string)($achievement['nama_dosen'] ?? ($achievement['peran_penulis'] ?? '')));

    if ($namaDosenRaw !== '') {
        $jenisPerolehan = 'kolaborasi_dosen';
    }

    $namaDosen = $jenisPerolehan === 'kolaborasi_dosen'
        ? ($namaDosenRaw !== '' ? $namaDosenRaw : '-')
        : '-';

    return [
        'jenis_perolehan' => $jenisPerolehan,
        'nama_dosen' => $namaDosen,
    ];
}

function normalizeSeminarPublicationLevelToken($value): ?string {
    if (!is_string($value)) {
        return null;
    }

    $normalized = strtolower(trim($value));
    if ($normalized === '') {
        return null;
    }

    $token = preg_replace('/\s+/', '_', str_replace('-', '_', $normalized)) ?? $normalized;
    if (in_array($token, ['local', 'lokal', 'regional', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
        return 'local';
    }
    if (in_array($token, ['national', 'nasional'], true)) {
        return 'national';
    }
    if (in_array($token, ['international', 'internasional'], true)) {
        return 'international';
    }

    return null;
}

function resolveSeminarPublicationContext(array $achievement): array {
    $judulPublikasi = trim((string)($achievement['judul_publikasi'] ?? ($achievement['title'] ?? '')));
    $levelSeminar = normalizeSeminarPublicationLevelToken($achievement['level_seminar'] ?? null);
    if ($levelSeminar === null) {
        $levelSeminar = normalizeSeminarPublicationLevelToken($achievement['tingkat'] ?? null);
    }

    $jenisPerolehan = normalizeDisseminationAcquisitionTypeValue($achievement['jenis_perolehan'] ?? null);
    $namaDosen = trim((string)($achievement['nama_dosen'] ?? ($achievement['peran_penulis'] ?? '')));
    if ($jenisPerolehan === 'kolaborasi_dosen' && $namaDosen === '') {
        $namaDosen = '-';
    }

    $isValid = $judulPublikasi !== ''
        && $levelSeminar !== null
        && in_array($jenisPerolehan, ['mandiri', 'kolaborasi_dosen'], true);

    $tanggalPublikasi = trim((string)($achievement['tanggal_publikasi'] ?? ($achievement['tanggal'] ?? '')));
    if ($tanggalPublikasi === '') {
        $tanggalPublikasi = null;
    }

    $namaSeminarKonferensi = trim((string)($achievement['nama_seminar_konferensi'] ?? ''));
    if ($namaSeminarKonferensi === '') {
        $namaSeminarKonferensi = null;
    }

    $urlPublikasi = trim((string)($achievement['url_publikasi'] ?? ''));
    if ($urlPublikasi === '') {
        $urlPublikasi = null;
    }

    $penulis = trim((string)($achievement['penulis'] ?? ''));
    if ($penulis === '') {
        $penulis = null;
    }

    return [
        'judul_publikasi' => $judulPublikasi,
        'level_seminar' => $levelSeminar,
        'jenis_perolehan' => $jenisPerolehan,
        'nama_dosen' => $namaDosen !== '' ? $namaDosen : null,
        'tanggal_publikasi' => $tanggalPublikasi,
        'nama_seminar_konferensi' => $namaSeminarKonferensi,
        'url_publikasi' => $urlPublikasi,
        'penulis' => $penulis,
        'is_valid_publication_seminar' => $isValid,
    ];
}

function isScientificPresentationSubcategory(string $subcategory): bool {
    return in_array($subcategory, ['conference', 'presentasi', 'presentation', 'oral_presentation', 'poster_presentation'], true);
}

function isShowcasePresentationSubcategory(string $subcategory): bool {
    return in_array($subcategory, ['expo', 'exhibition', 'pameran', 'pagelaran', 'presentasi', 'presentation', 'conference'], true);
}

function resolveDisseminationType(string $category, string $subcategory): string {
    $cat = strtolower(trim($category));
    $sub = strtolower(trim($subcategory));

    if ($cat === 'scientific_work') {
        return isScientificPresentationSubcategory($sub) ? 'pagelaran' : 'jurnal';
    }

    if ($cat === 'event_participation') {
        if ($sub === 'competition') {
            return '';
        }
        return isShowcasePresentationSubcategory($sub) ? 'pagelaran' : 'seminar';
    }

    return '';
}

function normalizeStudentProductCategoryKey(string $subcategory): string {
    $sub = strtolower(trim($subcategory));
    if ($sub === 'course_portfolio') {
        return 'pendidikan';
    }
    if ($sub === 'internship') {
        return 'layanan_digital';
    }

    $allowed = [
        'makanan_minuman',
        'fashion_lifestyle',
        'teknologi_bisnis',
        'pendidikan',
        'investasi_keuangan',
        'transportasi_logistik',
        'pariwisata',
        'jasa_profesional',
        'layanan_digital',
        'waralaba',
        'bisnis_hijau',
    ];

    if (in_array($sub, $allowed, true)) {
        return $sub;
    }

    return 'makanan_minuman';
}

function containsAnyKeyword(string $haystack, array $keywords): bool {
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

function resolveDisseminationLevel(string $type, ?string $tingkat, array $context = []): string {
    if ($type === 'jurnal') {
        $explicit = normalizeJournalLevelToken($context['peringkat'] ?? null)
            ?? normalizeJournalLevelToken($context['level_jurnal'] ?? null)
            ?? normalizeJournalLevelToken($context['level_diseminasi'] ?? null);
        if ($explicit !== null) {
            return $explicit;
        }
    }

    $normalizedTingkat = strtolower(trim((string)$tingkat));
    $normalizedTingkat = preg_replace('/\s+/', '_', str_replace('-', '_', $normalizedTingkat)) ?? $normalizedTingkat;

    if ($type === 'jurnal') {
        if (in_array($normalizedTingkat, ['national_non_accredited', 'nasional_tidak_terakreditasi'], true)) {
            return 'national_non_accredited';
        }
        if (in_array($normalizedTingkat, ['national_accredited', 'nasional_terakreditasi'], true)) {
            return 'national_accredited';
        }
        if (in_array($normalizedTingkat, ['reputable_international', 'internasional_bereputasi', 'international_reputable'], true)) {
            return 'reputable_international';
        }
        if (in_array($normalizedTingkat, ['international', 'internasional'], true)) {
            return 'international';
        }
    }

    if (in_array($normalizedTingkat, ['internasional', 'international'], true)) {
        $normalizedTingkat = 'internasional';
    } elseif (in_array($normalizedTingkat, ['nasional', 'national'], true)) {
        $normalizedTingkat = 'nasional';
    } elseif (in_array($normalizedTingkat, ['regional', 'wilayah', 'lokal', 'local', 'perguruan tinggi', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
        $normalizedTingkat = 'wilayah';
    } else {
        $normalizedTingkat = 'wilayah';
    }

    $text = strtolower(trim(implode(' ', [
        (string)($context['title'] ?? ''),
        (string)($context['description'] ?? ''),
        (string)($context['penyelenggara'] ?? ''),
        (string)($context['subcategory'] ?? ''),
    ])));

    if ($type === 'jurnal') {
        if ($normalizedTingkat === 'internasional') {
            if (containsAnyKeyword($text, ['bereputasi', 'scopus', 'web of science', 'wos', 'q1', 'q2', 'q3', 'q4'])) {
                return 'reputable_international';
            }
            return 'international';
        }

        if ($normalizedTingkat === 'nasional') {
            if (containsAnyKeyword($text, ['terakreditasi', 'akreditasi', 'sinta'])) {
                return 'national_accredited';
            }
            return 'national_non_accredited';
        }

        return 'national_non_accredited';
    }

    if ($type === 'seminar') {
        if ($normalizedTingkat === 'internasional') {
            return 'international';
        }
        if ($normalizedTingkat === 'nasional') {
            return 'national';
        }
        return 'local';
    }

    if ($type === 'pagelaran') {
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

function getStudentSnapshot(PDO $pdo, string $studentId): array {
    $stmt = $pdo->prepare('SELECT nim, nama, prodi, jurusan FROM students WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$studentId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        return ['nim' => '', 'nama' => '', 'prodi' => '', 'fakultas' => ''];
    }
    return [
        'nim' => (string)$row['nim'],
        'nama' => (string)$row['nama'],
        'prodi' => (string)$row['prodi'],
        'fakultas' => (string)($row['jurusan'] ?? ''),
    ];
}

function upsertChartRecord(PDO $pdo, string $table, array $row): void {
    $id = $row['id'];
    $sourceTable = $row['source_table'];
    $sourceId = $row['source_id'];
    $snapshotNim = $row['snapshot_nim'];
    $snapshotNama = $row['snapshot_nama'];
    $snapshotProdi = $row['snapshot_prodi'];
    $snapshotFakultas = $row['snapshot_fakultas'];
    $tahunPelaporan = (int)$row['tahun_pelaporan'];
    $payloadJson = $row['payload_json'];
    $includedInChart = isset($row['included_in_chart']) ? ((int)$row['included_in_chart'] ? 1 : 0) : 1;

    $sql = "INSERT INTO {$table} (id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, included_in_chart, deleted_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NOW())
            ON DUPLICATE KEY UPDATE
            snapshot_nim = VALUES(snapshot_nim), snapshot_nama = VALUES(snapshot_nama), snapshot_prodi = VALUES(snapshot_prodi),
            snapshot_fakultas = VALUES(snapshot_fakultas), tahun_pelaporan = VALUES(tahun_pelaporan), payload = VALUES(payload),
            included_in_chart = included_in_chart, deleted_at = deleted_at, updated_at = NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id, $sourceTable, $sourceId, $snapshotNim, $snapshotNama, $snapshotProdi, $snapshotFakultas, $tahunPelaporan, $payloadJson, $includedInChart]);
}

function updateChartSyncLog(PDO $pdo, string $menuSection, ?string $adminId = null): void {
    $stmt = $pdo->prepare('INSERT INTO chart_sync_log (menu_section, last_synced_at, synced_by, updated_at) VALUES (?, NOW(), ?, NOW())
                          ON DUPLICATE KEY UPDATE last_synced_at = NOW(), synced_by = ?, updated_at = NOW()');
    $stmt->execute([$menuSection, $adminId, $adminId]);
}

/** Section -> table name for menu_*_records */
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

function resolveResearchOutputGroupBySubtype(string $subcategory): string {
    $normalizedSubtype = normalizeResearchOutputSubcategory($subcategory);
    if (in_array($normalizedSubtype, researchOutputHakiSubcategories(), true)) {
        return 'haki';
    }
    if (in_array($normalizedSubtype, researchOutputBookSubcategories(), true)) {
        return 'other';
    }
    if (in_array($normalizedSubtype, researchOutputTechnologySubcategories(), true)) {
        return 'technology';
    }
    return 'technology';
}

/**
 * Rules for chart sections derived from achievements table.
 * `categories = null` means always relevant.
 */
function getAchievementDerivedSectionRules(): array {
    return [
        'student_achievements' => [
            'table' => 'menu_student_achievements_records',
            'categories' => null,
        ],
        'publications' => [
            'table' => 'menu_publications_records',
            'categories' => ['scientific_work', 'event_participation'],
        ],
        'student_products' => [
            'table' => 'menu_student_products_records',
            'categories' => ['applied_academic'],
        ],
        'research_outputs' => [
            'table' => 'menu_research_outputs_records',
            'categories' => ['research_output'],
        ],
    ];
}

function isAchievementRelevantForSection(string $section, string $category): bool {
    $rules = getAchievementDerivedSectionRules();
    if (!isset($rules[$section])) {
        return false;
    }
    $allowedCategories = $rules[$section]['categories'];
    if ($allowedCategories === null) {
        return true;
    }
    return in_array($category, $allowedCategories, true);
}

function buildAchievementPayloadForSection(string $section, array $achievement, int $year): array {
    $achievementType = normalizeAchievementType((string)($achievement['achievement_type'] ?? deriveAchievementTypeFromCategory(
        (string)($achievement['category'] ?? ''),
        (string)($achievement['subcategory'] ?? '')
    )));

    if ($section === 'student_achievements') {
        return [
            'category' => $achievement['category'] ?? '',
            'subcategory' => $achievement['subcategory'] ?? '',
            'achievement_type' => $achievementType,
            'tingkat' => $achievement['tingkat'] ?? null,
            'tanggal' => $achievement['tanggal'] ?? null,
            'year' => $year,
            'title' => $achievement['title'] ?? '',
        ];
    }
    if ($section === 'publications') {
        $category = (string)($achievement['category'] ?? '');
        $subcategory = (string)($achievement['subcategory'] ?? '');
        $disseminationType = resolveDisseminationType($category, $subcategory);
        $tingkat = isset($achievement['tingkat']) ? (string)$achievement['tingkat'] : null;
        $acquisition = resolveDisseminationAcquisitionAndLecturer($achievement);
        $seminarContext = $disseminationType === 'seminar'
            ? resolveSeminarPublicationContext($achievement)
            : null;
        return [
            'category' => $category,
            'subcategory' => $subcategory,
            'achievement_type' => $achievementType,
            'tingkat' => $tingkat,
            'jenis_perolehan' => $seminarContext['jenis_perolehan'] ?? $acquisition['jenis_perolehan'],
            'nama_dosen' => $seminarContext['nama_dosen'] ?? $acquisition['nama_dosen'],
            'jenis_diseminasi' => $disseminationType,
            'level_diseminasi' => resolveDisseminationLevel($disseminationType, $tingkat, $achievement),
            'title' => $seminarContext['judul_publikasi'] ?? ($achievement['title'] ?? ''),
            'judul_publikasi' => $seminarContext['judul_publikasi'] ?? null,
            'level_seminar' => $seminarContext['level_seminar'] ?? null,
            'tanggal_publikasi' => $seminarContext['tanggal_publikasi'] ?? null,
            'nama_seminar_konferensi' => $seminarContext['nama_seminar_konferensi'] ?? null,
            'url_publikasi' => $seminarContext['url_publikasi'] ?? null,
            'penulis' => $seminarContext['penulis'] ?? (isset($achievement['penulis']) ? (string)$achievement['penulis'] : null),
            'is_valid_publication_seminar' => $disseminationType === 'seminar'
                ? (bool)($seminarContext['is_valid_publication_seminar'] ?? false)
                : true,
            'description' => $achievement['description'] ?? null,
            'tanggal' => $achievement['tanggal'] ?? null,
            'year' => $year,
        ];
    }
    if ($section === 'student_products') {
        $subcategory = (string)($achievement['subcategory'] ?? '');
        $title = isset($achievement['title']) ? (string)$achievement['title'] : '';
        $tanggal = isset($achievement['tanggal']) ? (string)$achievement['tanggal'] : null;
        $lokasi = isset($achievement['lokasi']) ? (string)$achievement['lokasi'] : null;
        $mitraAdopsi = isset($achievement['penyelenggara']) ? (string)$achievement['penyelenggara'] : null;
        $description = isset($achievement['description']) ? (string)$achievement['description'] : null;
        return [
            'category' => $achievement['category'] ?? 'applied_academic',
            'subcategory' => $subcategory,
            'kategori_produk' => normalizeStudentProductCategoryKey($subcategory),
            'achievement_type' => $achievementType,
            'title' => $title,
            'nama_produk' => $title,
            'tanggal' => $tanggal,
            'tanggal_adopsi' => $tanggal,
            'lokasi' => $lokasi,
            'mitra_adopsi' => $mitraAdopsi,
            'penyelenggara' => $mitraAdopsi,
            'description' => $description,
            'deskripsi' => $description,
            'year' => $year,
        ];
    }
    if ($section === 'research_outputs') {
        $subcategory = (string)($achievement['subcategory'] ?? '');
        $group = resolveResearchOutputGroupBySubtype($subcategory);
        return [
            'category' => $achievement['category'] ?? '',
            'subcategory' => $subcategory,
            'group' => $group,
            'achievement_type' => $achievementType,
            'title' => $achievement['title'] ?? '',
            'description' => $achievement['description'] ?? null,
            'tanggal' => $achievement['tanggal'] ?? null,
            'year' => $year,
        ];
    }
    return [];
}

function getAchievementWithStudentSnapshotFromBaseTables(PDO $pdo, string $achievementId): ?array {
    $found = achievement_store_find_record($pdo, $achievementId);
    if (!$found || !isset($found['row']) || !is_array($found['row'])) {
        return null;
    }

    $row = $found['row'];
    $studentId = trim((string)($row['id_mahasiswa'] ?? ''));
    $snapshot = $studentId !== ''
        ? getStudentSnapshot($pdo, $studentId)
        : ['nim' => '', 'nama' => '', 'prodi' => '', 'fakultas' => ''];

    $namaDosen = trim((string)($row['nama_dosen'] ?? ''));
    if ($namaDosen === '') {
        $namaDosen = trim((string)($row['peran_penulis'] ?? ''));
    }

    return [
        'id' => $achievementId,
        'student_id' => $studentId !== '' ? $studentId : null,
        'category' => $row['category'] ?? null,
        'subcategory' => $row['subcategory'] ?? null,
        'achievement_type' => $row['achievement_type'] ?? null,
        'tanggal' => $row['tanggal'] ?? null,
        'tingkat' => $row['tingkat'] ?? null,
        'title' => $row['title'] ?? null,
        'description' => $row['description'] ?? null,
        'penyelenggara' => $row['penyelenggara'] ?? null,
        'peringkat' => $row['peringkat'] ?? null,
        'jenis_perolehan' => $row['jenis_perolehan'] ?? null,
        'nama_dosen' => $namaDosen !== '' ? $namaDosen : null,
        'penulis' => isset($row['penulis']) ? trim((string)$row['penulis']) : null,
        'judul_publikasi' => $row['judul_publikasi'] ?? null,
        'level_seminar' => $row['level_seminar'] ?? null,
        'tanggal_publikasi' => $row['tanggal_publikasi'] ?? null,
        'nama_seminar_konferensi' => $row['nama_seminar_konferensi'] ?? null,
        'url_publikasi' => $row['url_publikasi'] ?? ($row['url'] ?? null),
        'peran_penulis' => $row['peran_penulis'] ?? null,
        'snapshot_nim' => (string)($snapshot['nim'] ?? ''),
        'snapshot_nama' => (string)($snapshot['nama'] ?? ''),
        'snapshot_prodi' => (string)($snapshot['prodi'] ?? ''),
        'snapshot_fakultas' => (string)($snapshot['fakultas'] ?? ''),
    ];
}

function getAchievementWithStudentSnapshot(PDO $pdo, string $achievementId): ?array {
    try {
        $stmt = $pdo->prepare("
            SELECT
                a.id,
                a.student_id,
                a.category,
                a.subcategory,
                a.achievement_type,
                a.tanggal,
                a.tingkat,
                a.title,
                a.description,
                a.penyelenggara,
                a.peringkat,
                ps.jenis_perolehan,
                COALESCE(ps.nama_dosen, pp.peran_penulis) AS nama_dosen,
                COALESCE(ps.penulis, pp.penulis) AS penulis,
                ps.judul_publikasi,
                ps.level_seminar,
                ps.tanggal_publikasi,
                ps.nama_seminar_konferensi,
                COALESCE(ps.url_publikasi, pp.url) AS url_publikasi,
                pp.peran_penulis,
                s.nim AS snapshot_nim,
                s.nama AS snapshot_nama,
                s.prodi AS snapshot_prodi,
                s.jurusan AS snapshot_fakultas
            FROM achievements a
            LEFT JOIN prestasi_publikasi pp ON pp.id_publikasi = a.id
            LEFT JOIN prestasi_seminar ps ON ps.id_seminar = a.id
            LEFT JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
            WHERE a.id = ?
            LIMIT 1
        ");
        $stmt->execute([$achievementId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }
    } catch (PDOException $e) {
        // Fallback untuk lingkungan dengan VIEW `achievements` legacy yang belum kompatibel.
    }

    return getAchievementWithStudentSnapshotFromBaseTables($pdo, $achievementId);
}

function softDeleteAchievementRecordFromTable(PDO $pdo, string $table, string $achievementId): int {
    $stmt = $pdo->prepare("UPDATE {$table} SET deleted_at = NOW(), updated_at = NOW() WHERE source_table = 'achievements' AND source_id = ? AND deleted_at IS NULL");
    $stmt->execute([$achievementId]);
    return (int)$stmt->rowCount();
}

/**
 * Sync one achievement into all derived chart-record sections.
 * Hidden rows remain hidden (deleted_at and included_in_chart are preserved on duplicate).
 */
function syncAchievementDerivedRecords(PDO $pdo, string $achievementId): array {
    $achievement = getAchievementWithStudentSnapshot($pdo, $achievementId);
    if (!$achievement) {
        throw new Exception('Achievement tidak ditemukan untuk sinkronisasi chart.');
    }

    $category = (string)($achievement['category'] ?? '');
    $tanggal = (string)($achievement['tanggal'] ?? '');
    $parsedDate = $tanggal !== '' ? strtotime($tanggal) : false;
    $year = $parsedDate !== false ? (int)date('Y', $parsedDate) : (int)date('Y');

    $snapshot = [
        'nim' => (string)($achievement['snapshot_nim'] ?? ''),
        'nama' => (string)($achievement['snapshot_nama'] ?? ''),
        'prodi' => (string)($achievement['snapshot_prodi'] ?? ''),
        'fakultas' => (string)($achievement['snapshot_fakultas'] ?? ''),
    ];
    if ($snapshot['nim'] === '' || $snapshot['nama'] === '') {
        $snapshot = getStudentSnapshot($pdo, (string)$achievement['student_id']);
    }

    $rules = getAchievementDerivedSectionRules();
    $sections = [];

    foreach ($rules as $section => $rule) {
        $table = $rule['table'];
        $isRelevant = isAchievementRelevantForSection($section, $category);
        $upserted = 0;
        $softDeleted = 0;

        if ($isRelevant) {
            $payload = buildAchievementPayloadForSection($section, $achievement, $year);
            upsertChartRecord($pdo, $table, [
                'id' => $achievementId,
                'source_table' => 'achievements',
                'source_id' => $achievementId,
                'snapshot_nim' => $snapshot['nim'],
                'snapshot_nama' => $snapshot['nama'],
                'snapshot_prodi' => $snapshot['prodi'],
                'snapshot_fakultas' => $snapshot['fakultas'],
                'tahun_pelaporan' => $year,
                'payload_json' => json_encode($payload),
            ]);
            $upserted = 1;
        } else {
            $softDeleted = softDeleteAchievementRecordFromTable($pdo, $table, $achievementId);
        }

        updateChartSyncLog($pdo, $section, null);
        $sections[$section] = [
            'relevant' => $isRelevant,
            'upserted' => $upserted,
            'soft_deleted' => $softDeleted,
        ];
    }

    return [
        'achievement_id' => $achievementId,
        'sections' => $sections,
    ];
}

/**
 * Soft delete one achievement from all derived chart-record sections.
 */
function softDeleteAchievementDerivedRecords(PDO $pdo, string $achievementId): array {
    $rules = getAchievementDerivedSectionRules();
    $sections = [];

    foreach ($rules as $section => $rule) {
        $table = $rule['table'];
        $softDeleted = softDeleteAchievementRecordFromTable($pdo, $table, $achievementId);
        updateChartSyncLog($pdo, $section, null);
        $sections[$section] = [
            'relevant' => false,
            'upserted' => 0,
            'soft_deleted' => $softDeleted,
        ];
    }

    return [
        'achievement_id' => $achievementId,
        'sections' => $sections,
    ];
}

/** Jika tabel section benar-benar kosong (belum pernah sync), jalankan sync lalu isi chart_sync_log.
 *  Kecuali waiting_time: selalu sync agar data karir baru/ubah (termasuk dari input sebelum auto-sync) ikut masuk.
 */
function ensureSectionSynced(PDO $pdo, string $section, ?string $adminId = null): void {
    $map = $GLOBALS['chart_section_to_table'] ?? [];
    if (!isset($map[$section])) {
        return;
    }
    $table = $map[$section];
    $stmt = $pdo->query("SELECT COUNT(*) FROM {$table}");
    $count = (int) $stmt->fetchColumn();
    $alwaysSyncSections = ['waiting_time'];
    if ($count > 0 && !in_array($section, $alwaysSyncSections, true)) {
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

function syncStudyPeriod(PDO $pdo): int {
    $stmt = $pdo->query('SELECT id, nim, nama, prodi, jurusan, tahun_masuk, tahun_lulus FROM students WHERE deleted_at IS NULL');
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)($row['tahun_lulus'] ?? $row['tahun_masuk']);
        $payload = [
            'tahun_masuk' => (int)$row['tahun_masuk'],
            'tahun_lulus' => $row['tahun_lulus'] !== null ? (int)$row['tahun_lulus'] : null,
        ];
        upsertChartRecord($pdo, 'menu_study_period_records', [
            'id' => $row['id'],
            'source_table' => 'students',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncWaitingTime(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT t.id, t.student_id, t.career_status, t.employment_data, t.entrepreneurship_data, s.nim, s.nama, s.prodi, s.jurusan, s.tahun_lulus
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL
        WHERE s.tahun_lulus IS NOT NULL AND (t.employment_data IS NOT NULL OR t.entrepreneurship_data IS NOT NULL)
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $json = $row['career_status'] === 'working' ? $row['employment_data'] : $row['entrepreneurship_data'];
        $tahunMulai = null;
        $bulanMulai = 1;
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
        $tahunLulus = (int)$row['tahun_lulus'];
        $bulanLulus = 6; // Asumsi bulan wisuda Juni jika hanya tahun yang tersedia
        $totalBulanMulai = $tahunMulai * 12 + $bulanMulai;
        $totalBulanLulus = $tahunLulus * 12 + $bulanLulus;
        $bulan = $totalBulanMulai - $totalBulanLulus;
        // Klasifikasi waktu tunggu lulusan: <3 bulan, 3–6 bulan, >6 bulan (algoritma penetapan waktu tunggu)
        $bucket = $bulan < 3 ? 'lessThan3Months' : ($bulan < 6 ? 'between3And6Months' : 'moreThan6Months');
        $payload = [
            'tahun_lulus' => (int)$row['tahun_lulus'],
            'bucket' => $bucket,
            'tahun_mulai_kerja' => $tahunMulai,
        ];
        upsertChartRecord($pdo, 'menu_waiting_time_records', [
            'id' => $row['id'],
            'source_table' => 'tracer_study',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => (int)$row['tahun_lulus'],
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

/**
 * Sync job_relevance from Evaluasi Lulusan (major_job_match) + tahun mulai bekerja dari data karir.
 * Satu record per mahasiswa (response terbaru); tahun_pelaporan = tahun mulai kerja dari tracer_study, fallback tahun_lulus.
 */
function syncJobRelevance(PDO $pdo): int {
    $pdo->exec("DELETE FROM menu_job_relevance_records WHERE source_table = 'tracer_study'");

    $stmt = $pdo->query("
        SELECT r.id AS response_id, r.student_id, r.major_job_match, r.submitted_at,
               s.nim, s.nama, s.prodi, s.jurusan, s.tahun_lulus,
               t.career_status, t.employment_data, t.entrepreneurship_data
        FROM evaluation_responses r
        JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
        LEFT JOIN tracer_study t ON t.student_id = r.student_id
        ORDER BY r.student_id, r.submitted_at DESC
    ");
    $latestByStudent = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sid = $row['student_id'];
        if (isset($latestByStudent[$sid])) continue;
        $latestByStudent[$sid] = $row;
    }

    $count = 0;
    foreach ($latestByStudent as $row) {
        $tahunPelaporan = null;
        if (!empty($row['employment_data']) || !empty($row['entrepreneurship_data'])) {
            $json = $row['career_status'] === 'working' ? $row['employment_data'] : $row['entrepreneurship_data'];
            if ($json) {
                $dec = json_decode($json, true);
                if ($row['career_status'] === 'working' && isset($dec['tahun_mulai_kerja'])) {
                    $tahunPelaporan = (int)$dec['tahun_mulai_kerja'];
                } elseif (($row['career_status'] ?? '') === 'entrepreneur' && isset($dec['tahun_mulai_usaha'])) {
                    $tahunPelaporan = (int)$dec['tahun_mulai_usaha'];
                }
            }
        }
        if ($tahunPelaporan === null) {
            $tahunPelaporan = $row['tahun_lulus'] !== null ? (int)$row['tahun_lulus'] : (int)date('Y');
        }
        $match = strtolower(trim((string)($row['major_job_match'] ?? '')));
        $relevansi = ($match === 'ya') ? 'relevan' : 'tidak_relevan';
        $payload = ['relevansi_kompetensi' => $relevansi, 'source' => 'evaluation'];
        upsertChartRecord($pdo, 'menu_job_relevance_records', [
            'id' => $row['response_id'],
            'source_table' => 'evaluation_responses',
            'source_id' => $row['response_id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncWorkCoverage(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT t.id, t.student_id, t.career_status, t.employment_data, t.entrepreneurship_data, s.nim, s.nama, s.prodi, s.jurusan, s.tahun_lulus
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunLulus = $row['tahun_lulus'] !== null ? (int)$row['tahun_lulus'] : (int)date('Y');
        $payload = ['career_status' => $row['career_status'], 'tahun_lulus' => $row['tahun_lulus']];
        $workScope = null;
        if (!empty($row['employment_data'])) {
            $emp = json_decode($row['employment_data'], true);
            if (isset($emp['work_scope']) && $emp['work_scope'] !== '') {
                $workScope = $emp['work_scope'];
            }
        }
        if ($workScope === null && !empty($row['entrepreneurship_data'])) {
            $ent = json_decode($row['entrepreneurship_data'], true);
            if (isset($ent['work_scope']) && $ent['work_scope'] !== '') {
                $workScope = $ent['work_scope'];
            }
        }
        if ($workScope !== null) {
            $payload['work_scope'] = $workScope;
        }
        upsertChartRecord($pdo, 'menu_work_coverage_records', [
            'id' => $row['id'],
            'source_table' => 'tracer_study',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunLulus,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncUserSatisfaction(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT r.id, r.student_id, r.evaluation_id, r.submitted_at, s.nim, s.nama, s.prodi, s.jurusan
        FROM evaluation_responses r
        JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
        JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
        WHERE r.submitted_at IS NOT NULL
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)date('Y', strtotime($row['submitted_at']));
        $payload = [
            'evaluation_id' => $row['evaluation_id'],
            'submitted_at' => $row['submitted_at'],
        ];
        upsertChartRecord($pdo, 'menu_user_satisfaction_records', [
            'id' => $row['id'],
            'source_table' => 'evaluation_responses',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncPublications(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT 
            a.id,
            a.student_id,
            a.category,
            a.subcategory,
            a.achievement_type,
            a.tingkat,
            a.peringkat,
            a.tanggal,
            a.title,
            a.description,
            a.penyelenggara,
            p.peran_penulis,
            ps.jenis_perolehan,
            COALESCE(ps.nama_dosen, p.peran_penulis) AS nama_dosen,
            COALESCE(ps.penulis, p.penulis) AS penulis,
            ps.judul_publikasi,
            ps.level_seminar,
            ps.tanggal_publikasi,
            ps.nama_seminar_konferensi,
            COALESCE(ps.url_publikasi, p.url) AS url_publikasi,
            s.nim,
            s.nama,
            s.prodi,
            s.jurusan
        FROM achievements a
        LEFT JOIN prestasi_publikasi p ON p.id_publikasi = a.id
        LEFT JOIN prestasi_seminar ps ON ps.id_seminar = a.id
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        WHERE a.category IN ('scientific_work', 'event_participation')
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)date('Y', strtotime($row['tanggal']));
        $category = (string)($row['category'] ?? '');
        $subcategory = (string)($row['subcategory'] ?? '');
        $disseminationType = resolveDisseminationType($category, $subcategory);
        $tingkat = isset($row['tingkat']) ? (string)$row['tingkat'] : null;
        $acquisition = resolveDisseminationAcquisitionAndLecturer($row);
        $seminarContext = $disseminationType === 'seminar'
            ? resolveSeminarPublicationContext($row)
            : null;
        $payload = [
            'category' => $category,
            'subcategory' => $subcategory,
            'achievement_type' => normalizeAchievementType((string)($row['achievement_type'] ?? deriveAchievementTypeFromCategory((string)$row['category'], (string)$row['subcategory']))),
            'tingkat' => $tingkat,
            'jenis_perolehan' => $seminarContext['jenis_perolehan'] ?? $acquisition['jenis_perolehan'],
            'nama_dosen' => $seminarContext['nama_dosen'] ?? $acquisition['nama_dosen'],
            'jenis_diseminasi' => $disseminationType,
            'level_diseminasi' => resolveDisseminationLevel($disseminationType, $tingkat, $row),
            'title' => $seminarContext['judul_publikasi'] ?? ($row['title'] ?? ''),
            'judul_publikasi' => $seminarContext['judul_publikasi'] ?? null,
            'level_seminar' => $seminarContext['level_seminar'] ?? null,
            'tanggal_publikasi' => $seminarContext['tanggal_publikasi'] ?? null,
            'nama_seminar_konferensi' => $seminarContext['nama_seminar_konferensi'] ?? null,
            'url_publikasi' => $seminarContext['url_publikasi'] ?? null,
            'penulis' => $seminarContext['penulis'] ?? (isset($row['penulis']) ? (string)$row['penulis'] : null),
            'is_valid_publication_seminar' => $disseminationType === 'seminar'
                ? (bool)($seminarContext['is_valid_publication_seminar'] ?? false)
                : true,
            'description' => $row['description'] ?? null,
            'tanggal' => $row['tanggal'],
            'year' => $tahunPelaporan,
        ];
        upsertChartRecord($pdo, 'menu_publications_records', [
            'id' => $row['id'],
            'source_table' => 'achievements',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncActiveStudents(PDO $pdo): int {
    $stmt = $pdo->query("SELECT id, nim, nama, prodi, jurusan, tahun_masuk FROM students WHERE status = 'active' AND deleted_at IS NULL");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $payload = ['tahun_masuk' => (int)$row['tahun_masuk']];
        upsertChartRecord($pdo, 'menu_active_students_records', [
            'id' => $row['id'],
            'source_table' => 'students',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => (int)$row['tahun_masuk'],
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncStudentProducts(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT a.id, a.student_id, a.category, a.subcategory, a.achievement_type, a.tanggal, a.title, s.nim, s.nama, s.prodi, s.jurusan
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        WHERE a.category = 'applied_academic'
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)date('Y', strtotime($row['tanggal']));
        $subcategory = (string)($row['subcategory'] ?? '');
        $title = isset($row['title']) ? (string)$row['title'] : '';
        $tanggal = isset($row['tanggal']) ? (string)$row['tanggal'] : null;
        $payload = [
            'category' => $row['category'] ?? 'applied_academic',
            'subcategory' => $subcategory,
            'kategori_produk' => normalizeStudentProductCategoryKey($subcategory),
            'achievement_type' => normalizeAchievementType((string)($row['achievement_type'] ?? deriveAchievementTypeFromCategory((string)$row['category'], (string)$row['subcategory']))),
            'title' => $title,
            'nama_produk' => $title,
            'tanggal' => $tanggal,
            'tanggal_adopsi' => $tanggal,
            'year' => $tahunPelaporan,
        ];
        upsertChartRecord($pdo, 'menu_student_products_records', [
            'id' => $row['id'],
            'source_table' => 'achievements',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function ensureResearchOutputBackfillLogTable(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS research_output_backfill_log (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            source_table VARCHAR(64) NOT NULL,
            source_achievement_id VARCHAR(64) NOT NULL,
            source_category VARCHAR(64) NOT NULL,
            source_subcategory VARCHAR(64) NULL,
            target_achievement_id VARCHAR(64) NULL,
            status ENUM('inserted','skipped_existing','unmapped','failed') NOT NULL,
            note VARCHAR(255) NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_research_output_backfill_source (source_table, source_achievement_id),
            INDEX idx_research_output_backfill_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
}

function fetchResearchOutputBackfillProcessedMap(PDO $pdo): array {
    $result = [];
    $stmt = $pdo->query('SELECT source_table, source_achievement_id FROM research_output_backfill_log');
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $sourceTable = trim((string)($row['source_table'] ?? ''));
        $sourceId = trim((string)($row['source_achievement_id'] ?? ''));
        if ($sourceTable === '' || $sourceId === '') {
            continue;
        }
        $result[$sourceTable . '|' . $sourceId] = true;
    }
    return $result;
}

function logResearchOutputBackfill(PDO $pdo, array $payload): void {
    $stmt = $pdo->prepare("
        INSERT INTO research_output_backfill_log (
            source_table,
            source_achievement_id,
            source_category,
            source_subcategory,
            target_achievement_id,
            status,
            note,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->execute([
        $payload['source_table'] ?? '',
        $payload['source_achievement_id'] ?? '',
        $payload['source_category'] ?? '',
        $payload['source_subcategory'] ?? null,
        $payload['target_achievement_id'] ?? null,
        $payload['status'] ?? 'failed',
        $payload['note'] ?? null,
    ]);
}

function findExistingResearchOutputRecordId(PDO $pdo, string $studentId, string $subcategory, string $title): ?string {
    if ($studentId === '' || $subcategory === '' || $title === '') {
        return null;
    }
    $stmt = $pdo->prepare("
        SELECT id_kekayaan_intelektual
        FROM prestasi_kekayaan_intelektual
        WHERE id_mahasiswa = ?
          AND category = 'research_output'
          AND subcategory = ?
          AND judul_ki_norm = ?
        LIMIT 1
    ");
    $stmt->execute([$studentId, $subcategory, achievement_store_normalize_text($title)]);
    $value = $stmt->fetchColumn();
    return $value !== false ? (string)$value : null;
}

function insertResearchOutputBackfillRecord(PDO $pdo, array $row, string $subcategory, string $sourceTable): array {
    $studentId = trim((string)($row['student_id'] ?? $row['id_mahasiswa'] ?? ''));
    $title = trim((string)($row['title'] ?? ''));
    $description = isset($row['description']) ? trim((string)$row['description']) : null;
    $tanggal = trim((string)($row['tanggal'] ?? ''));
    if ($tanggal === '') {
        $tanggal = date('Y-m-d');
    }
    $achievementType = normalizeAchievementType((string)($row['achievement_type'] ?? deriveAchievementTypeFromCategory('research_output', $subcategory)));

    $existingId = findExistingResearchOutputRecordId($pdo, $studentId, $subcategory, $title);
    if ($existingId !== null) {
        return [
            'status' => 'skipped_existing',
            'target_id' => $existingId,
            'note' => 'Record research_output sudah ada.',
        ];
    }

    $id = bin2hex(random_bytes(18));
    $hakiEnumMap = [
        'trademark' => 'merek',
        'patent' => 'paten',
        'simple_patent' => 'paten',
        'industrial_design' => 'desain_industri',
        'copyright' => 'hak_cipta',
        'trade_secret' => 'rahasia_dagang',
    ];
    $isHakiSubtype = in_array($subcategory, researchOutputHakiSubcategories(), true);
    $tahunPengajuan = (int)date('Y', strtotime($tanggal));

    $stmt = $pdo->prepare("
        INSERT INTO prestasi_kekayaan_intelektual (
            id_kekayaan_intelektual,
            id_mahasiswa,
            source_import_log_id,
            title,
            description,
            tanggal,
            lokasi,
            penyelenggara,
            tingkat,
            peringkat,
            category,
            subcategory,
            achievement_type,
            verified,
            judul_ki,
            judul_ki_norm,
            jenis_ki,
            status_ki,
            pemegang,
            nomor_pendaftaran,
            nomor_sertifikat,
            tahun_pengajuan,
            tahun_terbit,
            tanggal_pengajuan,
            tanggal_terbit,
            deskripsi,
            created_at,
            updated_at
        ) VALUES (
            ?, ?, NULL, ?, ?, ?, ?, ?, NULL, NULL,
            'research_output', ?, ?, 0,
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
            NOW(), NOW()
        )
    ");

    try {
        $stmt->execute([
            $id,
            $studentId,
            $title,
            $description,
            $tanggal,
            $row['lokasi'] ?? null,
            $row['penyelenggara'] ?? null,
            $subcategory,
            $achievementType,
            $title,
            achievement_store_normalize_text($title),
            $hakiEnumMap[$subcategory] ?? null,
            $isHakiSubtype ? (trim((string)($row['status_ki'] ?? '')) !== '' ? (string)$row['status_ki'] : 'pending') : null,
            $row['pemegang'] ?? ($row['penyelenggara'] ?? null),
            $row['nomor_pendaftaran'] ?? null,
            $row['nomor_sertifikat'] ?? null,
            $row['tahun_pengajuan'] ?? $tahunPengajuan,
            $row['tahun_terbit'] ?? null,
            $row['tanggal_pengajuan'] ?? $tanggal,
            $row['tanggal_terbit'] ?? null,
            $description,
        ]);
    } catch (PDOException $e) {
        if ((string)$e->getCode() !== '23000') {
            throw $e;
        }
        $fallbackExistingId = findExistingResearchOutputRecordId($pdo, $studentId, $subcategory, $title);
        return [
            'status' => 'skipped_existing',
            'target_id' => $fallbackExistingId,
            'note' => 'Record research_output sudah ada (constraint).',
        ];
    }

    return [
        'status' => 'inserted',
        'target_id' => $id,
        'note' => $sourceTable === 'prestasi_publikasi'
            ? 'Backfill buku scientific_work -> research_output.'
            : 'Backfill intellectual_property -> research_output.',
    ];
}

function backfillResearchOutputLegacyData(PDO $pdo): void {
    ensureResearchOutputBackfillLogTable($pdo);
    $processedMap = fetchResearchOutputBackfillProcessedMap($pdo);

    $hakiRowsStmt = $pdo->query("
        SELECT
            p.id_kekayaan_intelektual AS source_id,
            p.id_mahasiswa AS student_id,
            p.category,
            p.subcategory,
            p.achievement_type,
            p.title,
            p.description,
            p.tanggal,
            p.lokasi,
            p.penyelenggara,
            p.status_ki,
            p.pemegang,
            p.nomor_pendaftaran,
            p.nomor_sertifikat,
            p.tahun_pengajuan,
            p.tahun_terbit,
            p.tanggal_pengajuan,
            p.tanggal_terbit
        FROM prestasi_kekayaan_intelektual p
        WHERE p.category = 'intellectual_property'
    ");
    while ($row = $hakiRowsStmt->fetch(PDO::FETCH_ASSOC)) {
        $sourceId = trim((string)($row['source_id'] ?? ''));
        $sourceKey = 'prestasi_kekayaan_intelektual|' . $sourceId;
        if ($sourceId === '' || isset($processedMap[$sourceKey])) {
            continue;
        }

        $normalizedSubtype = normalizeResearchOutputSubcategory((string)($row['subcategory'] ?? ''));
        if (!in_array($normalizedSubtype, researchOutputHakiSubcategories(), true)) {
            logResearchOutputBackfill($pdo, [
                'source_table' => 'prestasi_kekayaan_intelektual',
                'source_achievement_id' => $sourceId,
                'source_category' => 'intellectual_property',
                'source_subcategory' => $row['subcategory'] ?? null,
                'status' => 'unmapped',
                'note' => 'Subtype legacy intellectual_property tidak dipetakan.',
            ]);
            $processedMap[$sourceKey] = true;
            continue;
        }

        try {
            $result = insertResearchOutputBackfillRecord($pdo, $row, $normalizedSubtype, 'prestasi_kekayaan_intelektual');
            logResearchOutputBackfill($pdo, [
                'source_table' => 'prestasi_kekayaan_intelektual',
                'source_achievement_id' => $sourceId,
                'source_category' => 'intellectual_property',
                'source_subcategory' => $row['subcategory'] ?? null,
                'target_achievement_id' => $result['target_id'] ?? null,
                'status' => $result['status'] ?? 'failed',
                'note' => $result['note'] ?? null,
            ]);
        } catch (Throwable $e) {
            logResearchOutputBackfill($pdo, [
                'source_table' => 'prestasi_kekayaan_intelektual',
                'source_achievement_id' => $sourceId,
                'source_category' => 'intellectual_property',
                'source_subcategory' => $row['subcategory'] ?? null,
                'status' => 'failed',
                'note' => substr($e->getMessage(), 0, 255),
            ]);
        }
        $processedMap[$sourceKey] = true;
    }

    $bookRowsStmt = $pdo->query("
        SELECT
            p.id_publikasi AS source_id,
            p.id_mahasiswa AS student_id,
            p.category,
            p.subcategory,
            p.achievement_type,
            p.title,
            p.description,
            p.tanggal,
            p.lokasi,
            p.penyelenggara,
            p.jenis_publikasi
        FROM prestasi_publikasi p
        WHERE p.category = 'scientific_work'
          AND LOWER(COALESCE(p.jenis_publikasi, '')) IN ('buku', 'isbn_book', 'book_chapter', 'bab_buku')
    ");
    while ($row = $bookRowsStmt->fetch(PDO::FETCH_ASSOC)) {
        $sourceId = trim((string)($row['source_id'] ?? ''));
        $sourceKey = 'prestasi_publikasi|' . $sourceId;
        if ($sourceId === '' || isset($processedMap[$sourceKey])) {
            continue;
        }

        $jenisPublikasi = strtolower(trim((string)($row['jenis_publikasi'] ?? '')));
        $bookSubtype = in_array($jenisPublikasi, ['book_chapter', 'bab_buku'], true) ? 'book_chapter' : 'isbn_book';

        try {
            $result = insertResearchOutputBackfillRecord($pdo, $row, $bookSubtype, 'prestasi_publikasi');
            logResearchOutputBackfill($pdo, [
                'source_table' => 'prestasi_publikasi',
                'source_achievement_id' => $sourceId,
                'source_category' => 'scientific_work',
                'source_subcategory' => $row['subcategory'] ?? null,
                'target_achievement_id' => $result['target_id'] ?? null,
                'status' => $result['status'] ?? 'failed',
                'note' => $result['note'] ?? null,
            ]);
        } catch (Throwable $e) {
            logResearchOutputBackfill($pdo, [
                'source_table' => 'prestasi_publikasi',
                'source_achievement_id' => $sourceId,
                'source_category' => 'scientific_work',
                'source_subcategory' => $row['subcategory'] ?? null,
                'status' => 'failed',
                'note' => substr($e->getMessage(), 0, 255),
            ]);
        }
        $processedMap[$sourceKey] = true;
    }
}

function syncResearchOutputs(PDO $pdo): int {
    backfillResearchOutputLegacyData($pdo);

    $stmt = $pdo->query("
        SELECT a.id, a.student_id, a.category, a.subcategory, a.achievement_type, a.tanggal, a.title, a.description, s.nim, s.nama, s.prodi, s.jurusan
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
        WHERE a.category = 'research_output'
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)date('Y', strtotime($row['tanggal']));
        $subcategory = (string)($row['subcategory'] ?? '');
        $payload = [
            'category' => $row['category'],
            'subcategory' => $subcategory,
            'group' => resolveResearchOutputGroupBySubtype($subcategory),
            'achievement_type' => normalizeAchievementType((string)($row['achievement_type'] ?? deriveAchievementTypeFromCategory((string)$row['category'], $subcategory))),
            'title' => $row['title'] ?? '',
            'description' => $row['description'] ?? null,
            'tanggal' => $row['tanggal'],
            'year' => $tahunPelaporan,
        ];
        upsertChartRecord($pdo, 'menu_research_outputs_records', [
            'id' => $row['id'],
            'source_table' => 'achievements',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}

function syncStudentAchievements(PDO $pdo): int {
    $stmt = $pdo->query("
        SELECT a.id, a.student_id, a.category, a.subcategory, a.achievement_type, a.tanggal, a.tingkat, a.title, s.nim, s.nama, s.prodi, s.jurusan
        FROM achievements a
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
    ");
    $count = 0;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $tahunPelaporan = (int)date('Y', strtotime($row['tanggal']));
        $payload = [
            'category' => $row['category'],
            'subcategory' => $row['subcategory'],
            'achievement_type' => normalizeAchievementType((string)($row['achievement_type'] ?? deriveAchievementTypeFromCategory((string)$row['category'], (string)$row['subcategory']))),
            'tingkat' => $row['tingkat'] ?? null,
            'tanggal' => $row['tanggal'],
            'year' => $tahunPelaporan,
            'title' => $row['title'] ?? '',
        ];
        upsertChartRecord($pdo, 'menu_student_achievements_records', [
            'id' => $row['id'],
            'source_table' => 'achievements',
            'source_id' => $row['id'],
            'snapshot_nim' => $row['nim'],
            'snapshot_nama' => $row['nama'],
            'snapshot_prodi' => $row['prodi'],
            'snapshot_fakultas' => $row['jurusan'] ?? '',
            'tahun_pelaporan' => $tahunPelaporan,
            'payload_json' => json_encode($payload),
        ]);
        $count++;
    }
    return $count;
}
