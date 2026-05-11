<?php
require_once __DIR__ . '/../../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../store_helper.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/category_definitions.php';
require_once __DIR__ . '/../../insight/sync_helpers.php';

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;

try {
    $auth = requireAuth('admin');
    prestasi_import_require_spreadsheet();

    $kategori = isset($_POST['kategori']) ? trim((string)$_POST['kategori']) : '';
    $definition = prestasi_import_resolve_definition($kategori);
    if (!$definition) {
        throw new Exception('Kategori import tidak valid.');
    }

    $config = achievement_store_configs()[$definition['config_key']] ?? null;
    if (!$config) {
        throw new Exception('Konfigurasi kategori tidak ditemukan.');
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File Excel wajib diunggah.');
    }

    $file = $_FILES['file'];
    $fileName = (string)($file['name'] ?? '');
    $size = (int)($file['size'] ?? 0);
    if ($size <= 0 || $size > MAX_IMPORT_FILE_SIZE) {
        throw new Exception('Ukuran file tidak valid atau melebihi 10MB.');
    }
    if (!str_ends_with(strtolower($fileName), '.xlsx')) {
        throw new Exception('Hanya file .xlsx yang didukung.');
    }

    $logId = bin2hex(random_bytes(18));
    $uploadedBy = trim((string)($auth['sub'] ?? ''));
    $logStmt = $pdo->prepare('INSERT INTO prestasi_import_logs (id, module, kategori, uploaded_by, file_name, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
    $logStmt->execute([$logId, 'prestasi', $definition['key'], $uploadedBy, $fileName, 'processing']);

    $reader = new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
    $reader->setReadDataOnly(true);
    $spreadsheet = $reader->load($file['tmp_name']);
    $worksheet = $spreadsheet->getSheet(0);

    $hasMetaSheet = false;
    $templateVersion = '';
    $metaKategori = '';
    foreach ($spreadsheet->getWorksheetIterator() as $ws) {
        if ($ws->getTitle() !== '_meta') {
            continue;
        }

        $hasMetaSheet = true;
        $metaHighestRow = min(50, (int)$ws->getHighestRow());
        for ($metaRow = 1; $metaRow <= $metaHighestRow; $metaRow++) {
            $metaKey = strtolower(trim((string)$ws->getCell('A' . $metaRow)->getCalculatedValue()));
            $metaValue = trim((string)$ws->getCell('B' . $metaRow)->getCalculatedValue());
            if ($metaKey === 'template_version') {
                $templateVersion = $metaValue;
            } elseif ($metaKey === 'kategori') {
                $metaKategori = $metaValue;
            }
        }
        break;
    }

    $templateVersionNormalized = strtolower(trim((string)$templateVersion));
    if (str_starts_with($templateVersionNormalized, 'v')) {
        $templateVersionNormalized = substr($templateVersionNormalized, 1);
    }
    if (is_numeric($templateVersionNormalized)) {
        $templateVersionNormalized = rtrim(rtrim((string)((float)$templateVersionNormalized), '0'), '.');
    }
    $isTemplateV2 = ($templateVersionNormalized === '2' || $templateVersionNormalized === '2.0' || str_starts_with($templateVersionNormalized, '2.'));

    if (!$hasMetaSheet || !$isTemplateV2) {
        throw new Exception('Template lama tidak didukung, silakan download template terbaru');
    }
    if ($metaKategori !== '' && strtolower($metaKategori) !== strtolower($definition['key'])) {
        throw new Exception('Template tidak sesuai kategori yang dipilih.');
    }

    $highestColumn = $worksheet->getHighestDataColumn();
    $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);
    $sheetHighestRow = max(1, (int)$worksheet->getHighestRow());
    $headerScanLimit = min(100, $sheetHighestRow);

    $expectedHeaders = [
        'nim' => ['nim'],
        'nama' => ['nama'],
    ];
    foreach ($definition['fields'] as $field) {
        $expectedHeaders[(string)$field['key']] = array_values(array_filter(array_unique([
            prestasi_import_normalize_header(prestasi_import_field_display_label($field)),
            prestasi_import_normalize_header((string)($field['label'] ?? '')),
            prestasi_import_normalize_header((string)($field['key'] ?? '')),
        ])));
    }

    $headerRow = null;
    $headerMap = [];
    for ($candidateRow = 1; $candidateRow <= $headerScanLimit; $candidateRow++) {
        $candidateMap = [];
        for ($col = 1; $col <= $highestColumnIndex; $col++) {
            $cellRef = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col) . $candidateRow;
            $rawHeader = trim((string)$worksheet->getCell($cellRef)->getCalculatedValue());
            if ($rawHeader === '') continue;
            $normalized = prestasi_import_normalize_header($rawHeader);
            if ($normalized !== '' && !isset($candidateMap[$normalized])) {
                $candidateMap[$normalized] = $col;
            }
        }

        if (count($candidateMap) === 0) {
            continue;
        }

        $resolvedMap = [];
        $isComplete = true;
        foreach ($expectedHeaders as $expectedKey => $tokens) {
            $matchedColumn = null;
            foreach ($tokens as $token) {
                if ($token !== '' && isset($candidateMap[$token])) {
                    $matchedColumn = (int)$candidateMap[$token];
                    break;
                }
            }

            if ($matchedColumn === null) {
                $isComplete = false;
                break;
            }
            $resolvedMap[$expectedKey] = $matchedColumn;
        }

        if ($isComplete) {
            $headerRow = $candidateRow;
            $headerMap = $resolvedMap;
            break;
        }
    }

    if ($headerRow === null) {
        throw new Exception('Header template tidak sesuai format baru. Silakan download template terbaru.');
    }

    $dataStartRow = $headerRow + 1;

    // Determine effective last row by actual non-empty cell values in mapped columns.
    $highestRow = $headerRow;
    for ($rowNumber = $dataStartRow; $rowNumber <= $sheetHighestRow; $rowNumber++) {
        $hasAnyValue = false;
        foreach ($headerMap as $colIdx) {
            $cellRef = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex((int)$colIdx) . $rowNumber;
            $value = $worksheet->getCell($cellRef)->getCalculatedValue();
            if (!prestasi_import_is_empty($value)) {
                $hasAnyValue = true;
                break;
            }
        }
        if ($hasAnyValue) {
            $highestRow = $rowNumber;
        }
    }

    $studentStmt = $pdo->query('SELECT id, nim FROM students WHERE deleted_at IS NULL');
    $studentsByNim = [];
    while ($student = $studentStmt->fetch(PDO::FETCH_ASSOC)) {
        $studentsByNim[trim((string)$student['nim'])] = (string)$student['id'];
    }

    $totalRows = max(0, $highestRow - $headerRow);
    $validRows = [];
    $validCount = 0;
    $emptyCount = 0;
    $failedCount = 0;
    $duplicateCount = 0;
    $dedupeSet = [];

    $buildDedupKey = static function (string $categoryKey, string $studentId, array $row): string {
        switch ($categoryKey) {
            case 'publikasi':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_karya'] ?? '')),
                    strtolower(trim((string)($row['jenis_publikasi'] ?? ''))),
                    (string)($row['tahun_terbit'] ?? ''),
                    achievement_store_normalize_text((string)($row['nama_jurnal_konferensi'] ?? '')),
                ]);
            case 'jurnal':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_jurnal'] ?? '')),
                    strtolower(trim((string)($row['level_jurnal'] ?? ''))),
                    strtolower(trim((string)($row['jenis_perolehan'] ?? ''))),
                    (string)($row['tahun_publikasi'] ?? ''),
                ]);
            case 'portofolio':
                $mataKuliahRaw = strtolower(trim((string)($row['mata_kuliah'] ?? '')));
                $mataKuliahNorm = $mataKuliahRaw === 'other'
                    ? achievement_store_normalize_text((string)($row['mata_kuliah_lainnya'] ?? ''))
                    : achievement_store_normalize_text((string)($row['mata_kuliah'] ?? ''));
                return implode('|', [
                    $studentId,
                    $mataKuliahNorm,
                    achievement_store_normalize_text((string)($row['judul_proyek'] ?? '')),
                    strtolower(trim((string)($row['semester'] ?? ''))),
                    (string)($row['tahun'] ?? ''),
                ]);
            case 'lomba':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_lomba'] ?? '')),
                    strtolower(trim((string)($row['tingkat'] ?? ''))),
                    (string)($row['tahun'] ?? ''),
                ]);
            case 'kekayaan_intelektual':
                if (!prestasi_import_is_empty($row['nomor_pendaftaran'] ?? null)) {
                    return 'np|' . strtolower(trim((string)$row['nomor_pendaftaran']));
                }
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_ki'] ?? '')),
                    strtolower(trim((string)($row['jenis_ki'] ?? ''))),
                    (string)($row['tahun_pengajuan'] ?? ''),
                ]);
            case 'research_output_hki':
            case 'research_output_technology':
            case 'research_output_books':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_luaran'] ?? '')),
                    normalizeResearchOutputSubcategory((string)($row['subtype'] ?? '')),
                    prestasi_import_date($row['tanggal_luaran'] ?? null) ?? '',
                ]);
            case 'magang':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_perusahaan'] ?? '')),
                    achievement_store_normalize_text((string)($row['posisi'] ?? '')),
                    prestasi_import_date($row['tanggal_mulai'] ?? null) ?? '',
                ]);
            case 'produk_mahasiswa':
                $kategoriProdukRaw = strtolower(trim((string)($row['kategori_produk'] ?? '')));
                $kategoriDedupe = $kategoriProdukRaw === 'lainnya'
                    ? achievement_store_normalize_text((string)($row['kategori_produk_lainnya'] ?? ''))
                    : $kategoriProdukRaw;
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_produk'] ?? '')),
                    $kategoriDedupe,
                    prestasi_import_date($row['tanggal_adopsi'] ?? null) ?? '',
                ]);
            case 'wirausaha':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_usaha'] ?? '')),
                    achievement_store_normalize_text((string)($row['lokasi'] ?? '')),
                    (string)($row['tahun_mulai'] ?? ''),
                ]);
            case 'pengembangan_diri':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_program'] ?? '')),
                    strtolower(trim((string)($row['jenis_aktivitas'] ?? ''))),
                    prestasi_import_date($row['tanggal_mulai'] ?? null) ?? '',
                ]);
            case 'organisasi':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['nama_organisasi'] ?? '')),
                    achievement_store_normalize_text((string)($row['jabatan'] ?? '')),
                    prestasi_import_date($row['tanggal_mulai'] ?? null) ?? '',
                ]);
            case 'pagelaran':
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_kegiatan'] ?? '')),
                    strtolower(trim((string)($row['jenis_kegiatan'] ?? ''))),
                    strtolower(trim((string)($row['level_kegiatan'] ?? ''))),
                    prestasi_import_date($row['tanggal_kegiatan'] ?? null) ?? '',
                ]);
            case 'seminar':
            default:
                return implode('|', [
                    $studentId,
                    achievement_store_normalize_text((string)($row['judul_publikasi'] ?? '')),
                    strtolower(trim((string)($row['level_seminar'] ?? ''))),
                    strtolower(trim((string)($row['jenis_perolehan'] ?? ''))),
                    prestasi_import_date($row['tanggal_publikasi'] ?? null) ?? '',
                ]);
        }
    };

    for ($rowNumber = $dataStartRow; $rowNumber <= $highestRow; $rowNumber++) {
        $row = [];
        $nimRaw = '';

        foreach ($headerMap as $headerKey => $colIdx) {
            $cellRef = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex((int)$colIdx) . $rowNumber;
            $value = $worksheet->getCell($cellRef)->getCalculatedValue();
            $row[$headerKey] = is_string($value) ? trim($value) : $value;
            if ($headerKey === 'nim') {
                $nimRaw = trim((string)$row[$headerKey]);
            }
        }

        $hasCategoryData = false;
        foreach ($definition['fields'] as $field) {
            $key = (string)$field['key'];
            if (!prestasi_import_is_empty($row[$key] ?? null)) {
                $hasCategoryData = true;
                break;
            }
        }

        if ($nimRaw === '' && !$hasCategoryData) {
            $emptyCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, null, 'skipped_empty', 'Baris kosong di-skip.');
            continue;
        }

        if ($nimRaw === '' && $hasCategoryData) {
            $failedCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, null, 'error', 'NIM kosong tetapi kolom kategori terisi.', $row);
            continue;
        }

        if (!$hasCategoryData) {
            $emptyCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nimRaw, 'skipped_empty', 'Tidak ada data kategori terisi.');
            continue;
        }

        $studentId = $studentsByNim[$nimRaw] ?? null;
        if ($studentId === null) {
            $failedCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nimRaw, 'error', 'NIM tidak ditemukan di data mahasiswa.', $row);
            continue;
        }

        $missingField = null;
        foreach ($definition['fields'] as $field) {
            $key = (string)$field['key'];
            if (($field['required'] ?? false) && prestasi_import_is_empty($row[$key] ?? null)) {
                $missingField = prestasi_import_field_label($field);
                break;
            }
        }

        if ($missingField !== null) {
            $failedCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nimRaw, 'error', 'Kolom wajib kosong: ' . $missingField, $row);
            continue;
        }

        $validationMessage = prestasi_import_validate_row($definition['key'], $row);
        if ($validationMessage !== null) {
            $failedCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nimRaw, 'error', $validationMessage, $row);
            continue;
        }

        $dedupeKey = $buildDedupKey($definition['key'], $studentId, $row);
        if (isset($dedupeSet[$dedupeKey])) {
            $duplicateCount++;
            prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nimRaw, 'duplicate', 'Duplikat dalam file import.', $row);
            continue;
        }
        $dedupeSet[$dedupeKey] = true;

        $validRows[] = [
            'row_number' => $rowNumber,
            'nim' => $nimRaw,
            'student_id' => $studentId,
            'row' => $row,
        ];
        $validCount++;
    }

    $successCount = 0;
    $affectedStudents = [];

    if (count($validRows) > 0) {
        $batchSize = 500;
        $batchProcessed = 0;
        $processedRows = 0;
        $totalValidRows = count($validRows);

        $pdo->beginTransaction();
        try {
            foreach ($validRows as $item) {
                $row = $item['row'];
                $studentId = $item['student_id'];
                $rowNumber = (int)$item['row_number'];
                $nim = (string)$item['nim'];
                $id = bin2hex(random_bytes(18));

                $jenisKiMap = [
                    'hak_cipta' => 'copyright',
                    'merek' => 'trademark',
                    'desain_industri' => 'industrial_design',
                    'paten' => 'patent',
                    'rahasia_dagang' => 'trade_secret',
                ];

                $payload = [
                    'student_id' => $studentId,
                    'source_import_log_id' => $logId,
                    'verified' => false,
                ];

                switch ($definition['key']) {
                    case 'publikasi':
                        $tahunTerbit = prestasi_import_year($row['tahun_terbit'] ?? null);
                        $tanggalTerbit = $tahunTerbit ? sprintf('%04d-01-01', $tahunTerbit) : date('Y-m-d');
                        $jenisPublikasi = strtolower(trim((string)($row['jenis_publikasi'] ?? '')));
                        $levelJurnal = prestasi_import_normalize_journal_level($row['level_jurnal'] ?? null);
                        $jenisPerolehanPublikasi = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null) ?? 'mandiri';
                        $namaDosenPublikasi = trim((string)($row['nama_dosen'] ?? ''));
                        $tingkatPublikasi = in_array($levelJurnal, ['international', 'reputable_international'], true) ? 'internasional' : 'nasional';
                        $payload += [
                            'category' => 'scientific_work',
                            'subcategory' => 'journal_publication',
                            'achievement_type' => 'academic',
                            'title' => trim((string)$row['judul_karya']),
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalTerbit,
                            'lokasi' => null,
                            'penyelenggara' => $row['nama_jurnal_konferensi'] ?? null,
                            'tingkat' => $tingkatPublikasi,
                            'peringkat' => $levelJurnal,
                            'jenis_perolehan' => $jenisPerolehanPublikasi,
                            'nama_dosen' => $jenisPerolehanPublikasi === 'kolaborasi_dosen'
                                ? ($namaDosenPublikasi !== '' ? $namaDosenPublikasi : null)
                                : null,
                            'judul' => trim((string)$row['judul_karya']),
                            'jenis_publikasi' => $jenisPublikasi,
                            'penulis' => $row['penulis'] ?? '-',
                            'peran_penulis' => $jenisPerolehanPublikasi === 'kolaborasi_dosen'
                                ? ($namaDosenPublikasi !== '' ? $namaDosenPublikasi : null)
                                : null,
                            'nama_jurnal_konferensi' => $row['nama_jurnal_konferensi'] ?? null,
                            'url' => $row['url'] ?? null,
                            'tahun_terbit' => $tahunTerbit,
                            'tanggal_terbit' => $tanggalTerbit,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'jurnal':
                        $tahunPublikasi = prestasi_import_year($row['tahun_publikasi'] ?? null);
                        $tanggalPublikasiJurnal = $tahunPublikasi ? sprintf('%04d-01-01', $tahunPublikasi) : date('Y-m-d');
                        $judulJurnal = trim((string)($row['judul_jurnal'] ?? ''));
                        $levelJurnal = prestasi_import_normalize_journal_level($row['level_jurnal'] ?? null) ?? 'national_non_accredited';
                        $jenisPerolehanJurnal = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null) ?? 'mandiri';
                        $namaDosenJurnal = trim((string)($row['nama_dosen'] ?? ''));
                        $tingkatJurnal = in_array($levelJurnal, ['international', 'reputable_international'], true)
                            ? 'internasional'
                            : 'nasional';
                        $payload += [
                            'category' => 'scientific_work',
                            'subcategory' => 'journal_publication',
                            'achievement_type' => 'academic',
                            'title' => $judulJurnal,
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalPublikasiJurnal,
                            'lokasi' => null,
                            'penyelenggara' => $row['nama_jurnal_konferensi'] ?? null,
                            'tingkat' => $tingkatJurnal,
                            'peringkat' => $levelJurnal,
                            'judul' => $judulJurnal,
                            'jenis_publikasi' => 'artikel_jurnal',
                            'penulis' => $row['penulis'] ?? '-',
                            'peran_penulis' => $jenisPerolehanJurnal === 'kolaborasi_dosen'
                                ? ($namaDosenJurnal !== '' ? $namaDosenJurnal : null)
                                : null,
                            'nama_jurnal_konferensi' => $row['nama_jurnal_konferensi'] ?? null,
                            'url' => $row['url_publikasi'] ?? null,
                            'tahun_terbit' => $tahunPublikasi,
                            'tanggal_terbit' => $tanggalPublikasiJurnal,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'portofolio':
                        $tahun = prestasi_import_year($row['tahun'] ?? null);
                        $mataKuliah = strtolower(trim((string)$row['mata_kuliah']));
                        $tanggalPortofolio = $tahun ? sprintf('%04d-01-01', $tahun) : date('Y-m-d');
                        $payload += [
                            'category' => 'applied_academic',
                            'subcategory' => 'course_portfolio',
                            'achievement_type' => 'academic',
                            'title' => trim((string)$row['judul_proyek']),
                            'description' => $row['deskripsi_proyek'] ?? null,
                            'tanggal' => $tanggalPortofolio,
                            'lokasi' => null,
                            'penyelenggara' => $mataKuliah,
                            'judul_proyek' => trim((string)$row['judul_proyek']),
                            'mata_kuliah_kode' => $mataKuliah,
                            'mata_kuliah_custom' => $row['mata_kuliah_lainnya'] ?? null,
                            'tahun' => $tahun,
                            'semester' => strtolower(trim((string)$row['semester'])),
                            'deskripsi_proyek' => $row['deskripsi_proyek'] ?? null,
                            'output' => null,
                            'url_proyek' => null,
                            'nilai' => null,
                        ];
                        break;

                    case 'lomba':
                        $tahunLomba = prestasi_import_year($row['tahun'] ?? null);
                        $tanggalMulai = $tahunLomba ? sprintf('%04d-01-01', $tahunLomba) : date('Y-m-d');
                        $payload += [
                            'category' => 'event_participation',
                            'subcategory' => 'competition',
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['nama_lomba']),
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalMulai,
                            'lokasi' => null,
                            'penyelenggara' => $row['penyelenggara'] ?? null,
                            'tingkat' => strtolower(trim((string)$row['tingkat'])),
                            'peringkat' => $row['peringkat'] ?? null,
                            'nama_lomba' => trim((string)$row['nama_lomba']),
                            'peran' => strtolower(trim((string)$row['peran'])),
                            'bidang' => null,
                            'tanggal_mulai' => $tanggalMulai,
                            'tanggal_selesai' => null,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'kekayaan_intelektual':
                        $jenisKi = strtolower(trim((string)$row['jenis_ki']));
                        $subCategory = $jenisKiMap[$jenisKi] ?? 'patent';
                        $tahunPengajuan = prestasi_import_year($row['tahun_pengajuan'] ?? null);
                        $tanggalPengajuan = $tahunPengajuan ? sprintf('%04d-01-01', $tahunPengajuan) : date('Y-m-d');
                        $payload += [
                            'category' => 'intellectual_property',
                            'subcategory' => $subCategory,
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['judul_ki']),
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalPengajuan,
                            'lokasi' => null,
                            'penyelenggara' => $row['pemegang'] ?? null,
                            'judul_ki' => trim((string)$row['judul_ki']),
                            'jenis_ki' => $jenisKi,
                            'status_ki' => strtolower(trim((string)$row['status'])),
                            'pemegang' => $row['pemegang'] ?? null,
                            'nomor_pendaftaran' => $row['nomor_pendaftaran'] ?? null,
                            'nomor_sertifikat' => null,
                            'tahun_pengajuan' => $tahunPengajuan,
                            'tahun_terbit' => null,
                            'tanggal_pengajuan' => $tanggalPengajuan,
                            'tanggal_terbit' => null,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'research_output_hki':
                    case 'research_output_technology':
                    case 'research_output_books':
                        $researchSubtype = normalizeResearchOutputSubcategory((string)($row['subtype'] ?? ''));
                        $tanggalLuaran = prestasi_import_date($row['tanggal_luaran'] ?? null) ?? date('Y-m-d');
                        $jenisPerolehanLuaran = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null) ?? 'mandiri';
                        $namaDosenLuaran = trim((string)($row['nama_dosen'] ?? ''));
                        $isHakiSubtype = in_array($researchSubtype, researchOutputHakiSubcategories(), true);
                        $jenisKiLuaranMap = [
                            'trademark' => 'merek',
                            'patent' => 'paten',
                            'simple_patent' => 'paten',
                            'industrial_design' => 'desain_industri',
                            'copyright' => 'hak_cipta',
                            'trade_secret' => 'rahasia_dagang',
                        ];
                        $titleLuaran = trim((string)($row['judul_luaran'] ?? ''));
                        $payload += [
                            'category' => 'research_output',
                            'subcategory' => $researchSubtype,
                            'achievement_type' => deriveAchievementTypeFromCategory('research_output', $researchSubtype),
                            'title' => $titleLuaran,
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalLuaran,
                            'lokasi' => null,
                            'penyelenggara' => null,
                            'jenis_perolehan' => $jenisPerolehanLuaran,
                            'nama_dosen' => $jenisPerolehanLuaran === 'kolaborasi_dosen'
                                ? ($namaDosenLuaran !== '' ? $namaDosenLuaran : null)
                                : null,
                            'url_publikasi' => $row['url_publikasi'] ?? null,
                            'judul_ki' => $titleLuaran,
                            'jenis_ki' => $jenisKiLuaranMap[$researchSubtype] ?? null,
                            'status_ki' => $isHakiSubtype ? 'pending' : null,
                            'pemegang' => null,
                            'nomor_pendaftaran' => null,
                            'nomor_sertifikat' => null,
                            'tahun_pengajuan' => (int)date('Y', strtotime($tanggalLuaran)),
                            'tanggal_pengajuan' => $tanggalLuaran,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'magang':
                        $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null) ?? date('Y-m-d');
                        $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
                        $payload += [
                            'category' => 'applied_academic',
                            'subcategory' => 'internship',
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['posisi']),
                            'description' => $row['deskripsi_tugas'] ?? null,
                            'tanggal' => $tanggalMulai,
                            'lokasi' => $row['lokasi'] ?? null,
                            'penyelenggara' => $row['nama_perusahaan'] ?? null,
                            'nama_perusahaan' => $row['nama_perusahaan'] ?? null,
                            'posisi' => $row['posisi'] ?? null,
                            'industri' => $row['industri'] ?? null,
                            'tanggal_mulai' => $tanggalMulai,
                            'tanggal_selesai' => $tanggalSelesai,
                            'sedang_berjalan' => $tanggalSelesai === null,
                            'deskripsi_tugas' => $row['deskripsi_tugas'] ?? null,
                        ];
                        break;

                    case 'produk_mahasiswa':
                        $tanggalAdopsi = prestasi_import_date($row['tanggal_adopsi'] ?? null) ?? date('Y-m-d');
                        $kategoriProdukRaw = strtolower(trim((string)($row['kategori_produk'] ?? '')));
                        $kategoriProduk = in_array($kategoriProdukRaw, prestasi_import_product_categories(), true)
                            ? $kategoriProdukRaw
                            : 'makanan_minuman';
                        $kategoriProdukLainnya = trim((string)($row['kategori_produk_lainnya'] ?? ''));
                        $deskripsiProduk = trim((string)($row['deskripsi'] ?? ''));
                        if ($kategoriProdukRaw === 'lainnya' && $kategoriProdukLainnya !== '') {
                            $deskripsiProduk = 'Kategori Produk (Lainnya): ' . $kategoriProdukLainnya
                                . ($deskripsiProduk !== '' ? ("\n" . $deskripsiProduk) : '');
                        }
                        $payload += [
                            'category' => 'applied_academic',
                            'subcategory' => $kategoriProduk,
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['nama_produk']),
                            'description' => $deskripsiProduk !== '' ? $deskripsiProduk : null,
                            'tanggal' => $tanggalAdopsi,
                            'lokasi' => $row['lokasi'] ?? null,
                            'penyelenggara' => $row['mitra_adopsi'] ?? null,
                            'tingkat' => 'lokal',
                            'nama_produk' => trim((string)$row['nama_produk']),
                            'kategori_produk' => $kategoriProduk,
                            'mitra_adopsi' => $row['mitra_adopsi'] ?? null,
                            'tanggal_adopsi' => $tanggalAdopsi,
                            'deskripsi' => $deskripsiProduk !== '' ? $deskripsiProduk : null,
                        ];
                        break;

                    case 'wirausaha':
                        $tahunMulai = prestasi_import_year($row['tahun_mulai'] ?? null);
                        $payload += [
                            'category' => 'entrepreneurship',
                            'subcategory' => 'active_business',
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['nama_usaha']),
                            'description' => $row['deskripsi_usaha'] ?? null,
                            'tanggal' => $tahunMulai ? sprintf('%04d-01-01', $tahunMulai) : date('Y-m-d'),
                            'lokasi' => $row['lokasi'] ?? null,
                            'penyelenggara' => $row['nama_usaha'] ?? null,
                            'nama_usaha' => $row['nama_usaha'] ?? null,
                            'jenis_usaha' => $row['bidang_usaha'] ?? null,
                            'peran' => null,
                            'tahun_mulai' => $tahunMulai,
                            'masih_aktif' => true,
                            'tahun_selesai' => null,
                            'deskripsi_usaha' => $row['deskripsi_usaha'] ?? null,
                            'jumlah_karyawan' => null,
                            'omzet_per_bulan' => null,
                        ];
                        break;

                    case 'pengembangan_diri':
                        $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null) ?? date('Y-m-d');
                        $jenisAktivitas = strtolower(trim((string)($row['jenis_aktivitas'] ?? '')));
                        $subCategoryMap = [
                            'pertukaran_mahasiswa' => 'student_exchange',
                            'beasiswa' => 'certification',
                            'volunteer' => 'volunteer',
                            'pelatihan' => 'workshop',
                            'lainnya' => 'workshop',
                        ];
                        $payload += [
                            'category' => 'self_development',
                            'subcategory' => $subCategoryMap[$jenisAktivitas] ?? 'workshop',
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['nama_program']),
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalMulai,
                            'lokasi' => $row['lokasi'] ?? null,
                            'penyelenggara' => $row['penyelenggara'] ?? null,
                            'nama_program' => $row['nama_program'] ?? null,
                            'jenis_program' => $jenisAktivitas,
                            'peran_mahasiswa' => null,
                            'negara' => $row['negara'] ?? null,
                            'tanggal_mulai' => $tanggalMulai,
                            'tanggal_selesai' => prestasi_import_date($row['tanggal_selesai'] ?? null),
                            'sedang_berjalan' => prestasi_import_is_empty($row['tanggal_selesai'] ?? null),
                            'output' => $row['output'] ?? null,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'organisasi':
                        $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null) ?? date('Y-m-d');
                        $masihAktifRaw = strtolower(trim((string)($row['masih_aktif'] ?? 'ya')));
                        $payload += [
                            'category' => 'self_development',
                            'subcategory' => 'volunteer',
                            'achievement_type' => 'non_academic',
                            'title' => trim((string)$row['nama_organisasi']),
                            'description' => $row['deskripsi'] ?? ($row['jabatan'] ?? null),
                            'tanggal' => $tanggalMulai,
                            'lokasi' => null,
                            'penyelenggara' => $row['nama_organisasi'] ?? null,
                            'nama_organisasi' => $row['nama_organisasi'] ?? null,
                            'jenis_organisasi' => strtolower(trim((string)$row['jenis_organisasi'])),
                            'jabatan' => $row['jabatan'] ?? null,
                            'tanggal_mulai' => $tanggalMulai,
                            'tanggal_selesai' => prestasi_import_date($row['tanggal_selesai'] ?? null),
                            'masih_aktif' => $masihAktifRaw !== 'tidak',
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'pagelaran':
                        $tanggalKegiatan = prestasi_import_date($row['tanggal_kegiatan'] ?? null) ?? date('Y-m-d');
                        $judulKegiatan = trim((string)($row['judul_kegiatan'] ?? ''));
                        $jenisKegiatan = prestasi_import_normalize_pagelaran_subcategory($row['jenis_kegiatan'] ?? null) ?? 'presentasi';
                        $levelKegiatan = prestasi_import_normalize_pagelaran_level($row['level_kegiatan'] ?? null) ?? 'local';
                        $levelSeminarKegiatan = $levelKegiatan === 'international'
                            ? 'international'
                            : ($levelKegiatan === 'national' ? 'national' : 'local');
                        $tingkatKegiatan = $levelKegiatan === 'international'
                            ? 'internasional'
                            : ($levelKegiatan === 'national' ? 'nasional' : 'lokal');
                        $payload += [
                            'category' => 'event_participation',
                            'subcategory' => $jenisKegiatan,
                            'achievement_type' => 'non_academic',
                            'title' => $judulKegiatan,
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalKegiatan,
                            'lokasi' => null,
                            'penyelenggara' => $row['mitra_kegiatan'] ?? null,
                            'tingkat' => $tingkatKegiatan,
                            'judul_publikasi' => $judulKegiatan,
                            'level_seminar' => $levelSeminarKegiatan,
                            'jenis_perolehan' => 'mandiri',
                            'nama_dosen' => null,
                            'penulis' => $row['penulis'] ?? null,
                            'nama_seminar_konferensi' => $row['nama_acara_konferensi'] ?? null,
                            'url_publikasi' => $row['url_publikasi'] ?? null,
                            'tanggal_publikasi' => $tanggalKegiatan,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;

                    case 'seminar':
                    default:
                        $tanggalPublikasi = prestasi_import_date($row['tanggal_publikasi'] ?? null) ?? date('Y-m-d');
                        $judulPublikasi = trim((string)($row['judul_publikasi'] ?? ''));
                        $levelSeminar = prestasi_import_normalize_seminar_level($row['level_seminar'] ?? null) ?? 'local';
                        $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null) ?? 'mandiri';
                        $namaDosen = trim((string)($row['nama_dosen'] ?? ''));
                        $tingkatSeminar = $levelSeminar === 'international'
                            ? 'internasional'
                            : ($levelSeminar === 'national' ? 'nasional' : 'lokal');
                        $payload += [
                            'category' => 'event_participation',
                            'subcategory' => 'seminar',
                            'achievement_type' => 'non_academic',
                            'title' => $judulPublikasi,
                            'description' => $row['deskripsi'] ?? null,
                            'tanggal' => $tanggalPublikasi,
                            'lokasi' => null,
                            'penyelenggara' => $row['penyelenggara'] ?? ($row['nama_seminar_konferensi'] ?? null),
                            'tingkat' => $tingkatSeminar,
                            'judul_publikasi' => $judulPublikasi,
                            'level_seminar' => $levelSeminar,
                            'jenis_perolehan' => $jenisPerolehan,
                            'nama_dosen' => $jenisPerolehan === 'kolaborasi_dosen' ? ($namaDosen !== '' ? $namaDosen : null) : null,
                            'penulis' => $row['penulis'] ?? null,
                            'nama_seminar_konferensi' => $row['nama_seminar_konferensi'] ?? null,
                            'url_publikasi' => $row['url_publikasi'] ?? null,
                            'tanggal_publikasi' => $tanggalPublikasi,
                            'deskripsi' => $row['deskripsi'] ?? null,
                        ];
                        break;
                }

                $commonData = achievement_store_build_common_data($payload, [], $config);
                $specificData = achievement_store_build_specific_data($config['key'], $payload, $commonData);

                try {
                    achievement_store_insert($pdo, $config, $id, $commonData, $specificData);
                    syncAchievementDerivedRecords($pdo, $id);
                    $successCount++;
                    $affectedStudents[$studentId] = true;
                    prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nim, 'inserted', 'Data berhasil diinsert.', $row);
                } catch (PDOException $pdoEx) {
                    $sqlState = (string)$pdoEx->getCode();
                    if ($sqlState === '23000') {
                        $duplicateCount++;
                        prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nim, 'duplicate', 'Duplikat terhadap constraint database.', $row);
                        continue;
                    }
                    $failedCount++;
                    prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nim, 'error', 'Gagal insert: ' . $pdoEx->getMessage(), $row);
                } catch (Exception $innerEx) {
                    $failedCount++;
                    prestasi_import_insert_log_detail($pdo, $logId, $rowNumber, $nim, 'error', 'Gagal insert: ' . $innerEx->getMessage(), $row);
                }

                $batchProcessed++;
                $processedRows++;
                if ($batchProcessed >= $batchSize && $processedRows < $totalValidRows) {
                    $pdo->commit();
                    $pdo->beginTransaction();
                    $batchProcessed = 0;
                }
            }

            if ($pdo->inTransaction()) {
                $pdo->commit();
            }
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }
    }

    $updateLogStmt = $pdo->prepare('UPDATE prestasi_import_logs SET total_rows = ?, valid_rows = ?, success_rows = ?, failed_rows = ?, duplicate_rows = ?, empty_rows = ?, affected_students = ?, status = ?, finished_at = NOW() WHERE id = ?');
    $updateLogStmt->execute([
        $totalRows,
        $validCount,
        $successCount,
        $failedCount,
        $duplicateCount,
        $emptyCount,
        count($affectedStudents),
        'completed',
        $logId,
    ]);

    echo json_encode([
        'success' => true,
        'data' => [
            'import_log_id' => $logId,
            'kategori' => $definition['key'],
            'total_rows' => $totalRows,
            'valid_rows' => $validCount,
            'empty_rows' => $emptyCount,
            'error_rows' => $failedCount,
            'duplicate_rows' => $duplicateCount,
            'success_rows' => $successCount,
            'affected_students' => count($affectedStudents),
        ],
        'message' => 'Import prestasi selesai diproses.',
    ]);
} catch (Exception $e) {
    if (isset($logId) && isset($pdo) && $pdo instanceof PDO) {
        $failUpdate = $pdo->prepare('UPDATE prestasi_import_logs SET status = ?, finished_at = NOW(), failed_rows = failed_rows + 1 WHERE id = ?');
        $failUpdate->execute(['failed', $logId]);
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
