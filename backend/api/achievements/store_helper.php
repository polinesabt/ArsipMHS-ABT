<?php

require_once __DIR__ . '/classification_helper.php';

if (!class_exists('AchievementDuplicateException')) {
    class AchievementDuplicateException extends Exception {}
}

function achievement_store_product_subcategory_keys(): array {
    return [
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
}

function achievement_store_is_product_subcategory(string $subcategory): bool {
    return in_array(strtolower(trim($subcategory)), achievement_store_product_subcategory_keys(), true);
}

function achievement_store_configs(): array {
    static $configs = null;
    if ($configs !== null) {
        return $configs;
    }

    $configs = [
        'publikasi' => [
            'key' => 'publikasi',
            'table' => 'prestasi_publikasi',
            'id_col' => 'id_publikasi',
            'attachment_table' => 'prestasi_publikasi_attachments',
            'attachment_fk' => 'id_publikasi',
            'legacy_category' => 'scientific_work',
            'legacy_subcategory' => 'journal_publication',
            'import_category' => 'publikasi',
            'achievement_type_default' => 'academic',
            'specific_columns' => [
                'judul', 'judul_norm', 'jenis_publikasi', 'penulis', 'peran_penulis',
                'nama_jurnal_konferensi', 'nama_jurnal_konferensi_norm', 'penerbit',
                'doi', 'url', 'tahun_terbit', 'tanggal_terbit', 'deskripsi',
            ],
        ],
        'portofolio' => [
            'key' => 'portofolio',
            'table' => 'prestasi_portofolio',
            'id_col' => 'id_portofolio',
            'attachment_table' => 'prestasi_portofolio_attachments',
            'attachment_fk' => 'id_portofolio',
            'legacy_category' => 'applied_academic',
            'legacy_subcategory' => 'course_portfolio',
            'import_category' => 'portofolio',
            'achievement_type_default' => 'academic',
            'specific_columns' => [
                'judul_proyek', 'judul_proyek_norm', 'mata_kuliah_kode', 'mata_kuliah_custom',
                'mata_kuliah_norm', 'tahun', 'semester', 'deskripsi_proyek', 'output',
                'url_proyek', 'nilai',
            ],
        ],
        'lomba' => [
            'key' => 'lomba',
            'table' => 'prestasi_lomba',
            'id_col' => 'id_lomba',
            'attachment_table' => 'prestasi_lomba_attachments',
            'attachment_fk' => 'id_lomba',
            'legacy_category' => 'event_participation',
            'legacy_subcategory' => 'competition',
            'import_category' => 'lomba',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_lomba', 'nama_lomba_norm', 'penyelenggara_norm', 'peran', 'bidang',
                'tanggal_mulai', 'tanggal_selesai', 'deskripsi',
            ],
        ],
        'kekayaan_intelektual' => [
            'key' => 'kekayaan_intelektual',
            'table' => 'prestasi_kekayaan_intelektual',
            'id_col' => 'id_kekayaan_intelektual',
            'attachment_table' => 'prestasi_kekayaan_intelektual_attachments',
            'attachment_fk' => 'id_kekayaan_intelektual',
            'legacy_category' => 'intellectual_property',
            'legacy_subcategory' => 'patent',
            'import_category' => 'kekayaan_intelektual',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'judul_ki', 'judul_ki_norm', 'jenis_ki', 'status_ki', 'pemegang',
                'nomor_pendaftaran', 'nomor_sertifikat', 'tahun_pengajuan', 'tahun_terbit',
                'tanggal_pengajuan', 'tanggal_terbit', 'deskripsi',
            ],
        ],
        'research_output' => [
            'key' => 'research_output',
            'table' => 'prestasi_kekayaan_intelektual',
            'id_col' => 'id_kekayaan_intelektual',
            'attachment_table' => 'prestasi_kekayaan_intelektual_attachments',
            'attachment_fk' => 'id_kekayaan_intelektual',
            'legacy_category' => 'research_output',
            'legacy_subcategory' => 'patent',
            'import_category' => 'research_output',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'judul_ki', 'judul_ki_norm', 'jenis_ki', 'status_ki', 'pemegang',
                'nomor_pendaftaran', 'nomor_sertifikat', 'tahun_pengajuan', 'tahun_terbit',
                'tanggal_pengajuan', 'tanggal_terbit', 'deskripsi',
                'jenis_perolehan', 'nama_dosen', 'url_publikasi',
            ],
        ],
        'magang' => [
            'key' => 'magang',
            'table' => 'prestasi_magang',
            'id_col' => 'id_magang',
            'attachment_table' => 'prestasi_magang_attachments',
            'attachment_fk' => 'id_magang',
            'legacy_category' => 'applied_academic',
            'legacy_subcategory' => 'internship',
            'import_category' => 'magang',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_perusahaan', 'nama_perusahaan_norm', 'posisi', 'posisi_norm',
                'industri', 'tanggal_mulai', 'tanggal_selesai', 'sedang_berjalan',
                'deskripsi_tugas',
            ],
        ],
        'produk_mahasiswa' => [
            'key' => 'produk_mahasiswa',
            'table' => 'prestasi_produk_mahasiswa',
            'id_col' => 'id_produk_mahasiswa',
            'attachment_table' => 'prestasi_produk_mahasiswa_attachments',
            'attachment_fk' => 'id_produk_mahasiswa',
            'legacy_category' => 'applied_academic',
            'legacy_subcategory' => 'makanan_minuman',
            'import_category' => 'produk_mahasiswa',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_produk', 'nama_produk_norm', 'kategori_produk',
                'link_produk',
            ],
        ],
        'wirausaha' => [
            'key' => 'wirausaha',
            'table' => 'prestasi_wirausaha',
            'id_col' => 'id_wirausaha',
            'attachment_table' => 'prestasi_wirausaha_attachments',
            'attachment_fk' => 'id_wirausaha',
            'legacy_category' => 'entrepreneurship',
            'legacy_subcategory' => 'active_business',
            'import_category' => 'wirausaha',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_usaha', 'nama_usaha_norm', 'jenis_usaha', 'peran',
                'lokasi_norm', 'tahun_mulai', 'masih_aktif', 'tahun_selesai',
                'deskripsi_usaha', 'jumlah_karyawan', 'omzet_per_bulan',
            ],
        ],
        'pengembangan_diri' => [
            'key' => 'pengembangan_diri',
            'table' => 'prestasi_pengembangan_diri',
            'id_col' => 'id_pengembangan_diri',
            'attachment_table' => 'prestasi_pengembangan_diri_attachments',
            'attachment_fk' => 'id_pengembangan_diri',
            'legacy_category' => 'self_development',
            'legacy_subcategory' => 'workshop',
            'import_category' => 'pengembangan_diri',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_program', 'nama_program_norm', 'jenis_program', 'peran_mahasiswa',
                'negara', 'tanggal_mulai', 'tanggal_selesai', 'sedang_berjalan',
                'output', 'deskripsi',
            ],
        ],
        'organisasi' => [
            'key' => 'organisasi',
            'table' => 'prestasi_organisasi',
            'id_col' => 'id_organisasi',
            'attachment_table' => 'prestasi_organisasi_attachments',
            'attachment_fk' => 'id_organisasi',
            'legacy_category' => 'self_development',
            'legacy_subcategory' => 'volunteer',
            'import_category' => 'organisasi',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_organisasi', 'nama_organisasi_norm', 'jenis_organisasi', 'jabatan',
                'jabatan_norm', 'tanggal_mulai', 'tanggal_selesai', 'masih_aktif',
                'deskripsi',
            ],
        ],
        'seminar' => [
            'key' => 'seminar',
            'table' => 'prestasi_seminar',
            'id_col' => 'id_seminar',
            'attachment_table' => 'prestasi_seminar_attachments',
            'attachment_fk' => 'id_seminar',
            'legacy_category' => 'event_participation',
            'legacy_subcategory' => 'seminar',
            'import_category' => 'seminar',
            'achievement_type_default' => 'non_academic',
            'specific_columns' => [
                'nama_seminar', 'nama_seminar_norm', 'penyelenggara_norm',
                'judul_publikasi', 'judul_publikasi_norm', 'level_seminar',
                'jenis_perolehan', 'nama_dosen', 'penulis',
                'nama_seminar_konferensi', 'nama_seminar_konferensi_norm',
                'url_publikasi', 'tanggal_publikasi', 'deskripsi',
            ],
        ],
    ];

    return $configs;
}

function achievement_store_common_columns(): array {
    return [
        'id_mahasiswa',
        'source_import_log_id',
        'title',
        'description',
        'tanggal',
        'lokasi',
        'penyelenggara',
        'tingkat',
        'peringkat',
        'category',
        'subcategory',
        'achievement_type',
        'verified',
    ];
}

function achievement_store_normalize_text(?string $value): string {
    $str = trim((string)$value);
    if ($str === '') return '';
    $str = mb_strtolower($str, 'UTF-8');
    $str = preg_replace('/\s+/u', ' ', $str) ?? $str;
    return trim($str);
}

function achievement_store_normalize_bool($value, bool $default = false): bool {
    if (is_bool($value)) return $value;
    if ($value === null) return $default;
    $normalized = strtolower(trim((string)$value));
    if (in_array($normalized, ['1', 'true', 'yes', 'ya', 'y', 'on'], true)) return true;
    if (in_array($normalized, ['0', 'false', 'no', 'tidak', 'n', 'off'], true)) return false;
    return $default;
}

function achievement_store_normalize_date($value): ?string {
    if ($value === null) return null;
    $raw = trim((string)$value);
    if ($raw === '') return null;
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $raw) === 1) {
        return $raw;
    }
    $timestamp = strtotime($raw);
    if ($timestamp === false) return null;
    return date('Y-m-d', $timestamp);
}

function achievement_store_resolve_from_legacy(string $category, string $subcategory): ?array {
    $categoryValue = strtolower(trim($category));
    $subcategoryValue = strtolower(trim($subcategory));
    $eventParticipationSeminarLikeSubcategories = [
        'seminar',
        'conference',
        'presentasi',
        'presentation',
        'oral_presentation',
        'poster_presentation',
        'expo',
        'exhibition',
        'pameran',
        'pagelaran',
    ];

    if ($categoryValue === 'scientific_work') return achievement_store_configs()['publikasi'];
    if ($categoryValue === 'event_participation' && $subcategoryValue === 'competition') return achievement_store_configs()['lomba'];
    if ($categoryValue === 'event_participation' && in_array($subcategoryValue, $eventParticipationSeminarLikeSubcategories, true)) return achievement_store_configs()['seminar'];
    if ($categoryValue === 'intellectual_property') return achievement_store_configs()['kekayaan_intelektual'];
    if ($categoryValue === 'research_output') {
        $normalizedSubtype = normalizeResearchOutputSubcategory($subcategoryValue);
        if (!isResearchOutputSubcategory($normalizedSubtype)) {
            return null;
        }
        return achievement_store_configs()['research_output'];
    }
    if ($categoryValue === 'applied_academic' && $subcategoryValue === 'internship') return achievement_store_configs()['magang'];
    if ($categoryValue === 'applied_academic' && $subcategoryValue === 'course_portfolio') return achievement_store_configs()['portofolio'];
    if ($categoryValue === 'applied_academic' && achievement_store_is_product_subcategory($subcategoryValue)) return achievement_store_configs()['produk_mahasiswa'];
    if ($categoryValue === 'applied_academic') return achievement_store_configs()['produk_mahasiswa'];
    if ($categoryValue === 'entrepreneurship') return achievement_store_configs()['wirausaha'];
    if ($categoryValue === 'self_development' && $subcategoryValue === 'volunteer') return achievement_store_configs()['organisasi'];
    if ($categoryValue === 'self_development') return achievement_store_configs()['pengembangan_diri'];

    return null;
}

function achievement_store_resolve_from_import_category(string $kategori): ?array {
    $value = strtolower(trim($kategori));
    $aliases = [
        'karya_ilmiah_publikasi' => 'publikasi',
        'kekayaan-intelektual' => 'kekayaan_intelektual',
        'haki' => 'kekayaan_intelektual',
        'luaran_penelitian' => 'research_output',
        'research-output' => 'research_output',
        'research_output_hki' => 'research_output',
        'research_output_technology' => 'research_output',
        'research_output_books' => 'research_output',
        'pengembangan' => 'pengembangan_diri',
        'produk-mahasiswa' => 'produk_mahasiswa',
        'produk' => 'produk_mahasiswa',
    ];

    $normalized = $aliases[$value] ?? $value;
    foreach (achievement_store_configs() as $config) {
        if ($config['import_category'] === $normalized || $config['key'] === $normalized) {
            return $config;
        }
    }

    return null;
}

function achievement_store_find_record(PDO $pdo, string $achievementId): ?array {
    $achievementId = trim($achievementId);
    if ($achievementId === '') return null;

    $resolvedByCategory = static function (array $row): ?array {
        $rowCategory = (string)($row['category'] ?? '');
        $rowSubcategory = (string)($row['subcategory'] ?? '');
        return achievement_store_resolve_from_legacy($rowCategory, $rowSubcategory);
    };

    foreach (achievement_store_configs() as $config) {
        $sql = sprintf('SELECT * FROM %s WHERE %s = ? LIMIT 1', $config['table'], $config['id_col']);
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$achievementId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $resolvedConfig = $resolvedByCategory($row);
            if ($resolvedConfig && ($resolvedConfig['key'] ?? null) !== $config['key']) {
                continue;
            }
            $row['id'] = $row[$config['id_col']] ?? $achievementId;
            $row['student_id'] = $row['id_mahasiswa'] ?? null;
            return [
                'config' => $config,
                'row' => $row,
            ];
        }
    }

    return null;
}

function achievement_store_find_attachment(PDO $pdo, string $attachmentId): ?array {
    $attachmentId = trim($attachmentId);
    if ($attachmentId === '') return null;

    foreach (achievement_store_configs() as $config) {
        $sql = sprintf('SELECT * FROM %s WHERE id = ? LIMIT 1', $config['attachment_table']);
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$attachmentId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['achievement_id'] = $row[$config['attachment_fk']] ?? null;
            return [
                'config' => $config,
                'row' => $row,
            ];
        }
    }

    return null;
}

function achievement_store_build_common_data(array $input, array $fallback = [], ?array $config = null): array {
    $category = isset($input['category']) ? trim((string)$input['category']) : (string)($fallback['category'] ?? ($config['legacy_category'] ?? ''));
    $subcategory = isset($input['subcategory']) ? trim((string)$input['subcategory']) : (string)($fallback['subcategory'] ?? ($config['legacy_subcategory'] ?? ''));
    if (strtolower($category) === 'research_output') {
        $subcategory = normalizeResearchOutputSubcategory($subcategory);
    }
    $tanggal = achievement_store_normalize_date($input['tanggal'] ?? ($fallback['tanggal'] ?? date('Y-m-d')));

    return [
        'id_mahasiswa' => trim((string)($input['student_id'] ?? $input['id_mahasiswa'] ?? $fallback['id_mahasiswa'] ?? $fallback['student_id'] ?? '')),
        'source_import_log_id' => $input['source_import_log_id'] ?? ($fallback['source_import_log_id'] ?? null),
        'title' => trim((string)($input['title'] ?? $fallback['title'] ?? '')),
        'description' => isset($input['description']) ? trim((string)$input['description']) : ($fallback['description'] ?? null),
        'tanggal' => $tanggal ?? date('Y-m-d'),
        'lokasi' => isset($input['lokasi']) ? trim((string)$input['lokasi']) : ($fallback['lokasi'] ?? null),
        'penyelenggara' => isset($input['penyelenggara']) ? trim((string)$input['penyelenggara']) : ($fallback['penyelenggara'] ?? null),
        'tingkat' => isset($input['tingkat']) ? trim((string)$input['tingkat']) : ($fallback['tingkat'] ?? null),
        'peringkat' => isset($input['peringkat']) ? trim((string)$input['peringkat']) : ($fallback['peringkat'] ?? null),
        'category' => $category,
        'subcategory' => $subcategory,
        'achievement_type' => trim((string)($input['achievement_type'] ?? $fallback['achievement_type'] ?? deriveAchievementTypeFromCategory($category, $subcategory))),
        'verified' => achievement_store_normalize_bool($input['verified'] ?? ($fallback['verified'] ?? false)),
    ];
}

function achievement_store_build_specific_data(string $key, array $input, array $common): array {
    $title = trim((string)($input['title'] ?? $common['title'] ?? ''));
    $description = isset($input['description']) ? trim((string)$input['description']) : ($common['description'] ?? null);
    $tanggal = achievement_store_normalize_date($input['tanggal'] ?? ($common['tanggal'] ?? null));
    $lokasi = trim((string)($input['lokasi'] ?? $common['lokasi'] ?? ''));
    $penyelenggara = trim((string)($input['penyelenggara'] ?? $common['penyelenggara'] ?? ''));
    $peringkat = trim((string)($input['peringkat'] ?? $common['peringkat'] ?? ''));

    switch ($key) {
        case 'publikasi':
            $judul = trim((string)($input['judul'] ?? $title));
            $namaJurnal = trim((string)($input['nama_jurnal_konferensi'] ?? $input['namaJurnal'] ?? $penyelenggara));
            return [
                'judul' => $judul,
                'judul_norm' => achievement_store_normalize_text($judul),
                'jenis_publikasi' => $input['jenis_publikasi'] ?? $input['jenisPublikasi'] ?? 'artikel_jurnal',
                'penulis' => $input['penulis'] ?? '-',
                'peran_penulis' => $input['peran_penulis'] ?? ($input['peranPenulis'] ?? null),
                'nama_jurnal_konferensi' => $namaJurnal,
                'nama_jurnal_konferensi_norm' => achievement_store_normalize_text($namaJurnal),
                'penerbit' => $input['penerbit'] ?? ($penyelenggara !== '' ? $penyelenggara : null),
                'doi' => $input['doi'] ?? null,
                'url' => $input['url'] ?? null,
                'tahun_terbit' => isset($input['tahun_terbit']) ? (int)$input['tahun_terbit'] : (isset($input['tahun']) ? (int)$input['tahun'] : ($tanggal ? (int)date('Y', strtotime($tanggal)) : null)),
                'tanggal_terbit' => achievement_store_normalize_date($input['tanggal_terbit'] ?? ($input['tanggalTerbit'] ?? $tanggal)),
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];

        case 'portofolio':
            $judulProyek = trim((string)($input['judul_proyek'] ?? $input['judulProyek'] ?? $title));
            $mataKuliahKode = trim((string)($input['mata_kuliah_kode'] ?? $input['mataKuliah'] ?? 'other'));
            $mataKuliahCustom = $input['mata_kuliah_custom'] ?? ($input['mataKuliahCustom'] ?? null);
            $mataKuliahNorm = $mataKuliahKode === 'other'
                ? achievement_store_normalize_text((string)$mataKuliahCustom)
                : achievement_store_normalize_text($mataKuliahKode);
            return [
                'judul_proyek' => $judulProyek,
                'judul_proyek_norm' => achievement_store_normalize_text($judulProyek),
                'mata_kuliah_kode' => $mataKuliahKode,
                'mata_kuliah_custom' => $mataKuliahCustom,
                'mata_kuliah_norm' => $mataKuliahNorm,
                'tahun' => isset($input['tahun']) ? (int)$input['tahun'] : ($tanggal ? (int)date('Y', strtotime($tanggal)) : null),
                'semester' => $input['semester'] ?? 'ganjil',
                'deskripsi_proyek' => $input['deskripsi_proyek'] ?? ($input['deskripsiProyek'] ?? $description),
                'output' => $input['output'] ?? null,
                'url_proyek' => $input['url_proyek'] ?? ($input['urlProyek'] ?? null),
                'nilai' => $input['nilai'] ?? null,
            ];

        case 'lomba':
            $namaLomba = trim((string)($input['nama_lomba'] ?? $input['namaLomba'] ?? $title));
            $tanggalMulai = achievement_store_normalize_date($input['tanggal_mulai'] ?? ($input['tanggalMulai'] ?? $tanggal));
            return [
                'nama_lomba' => $namaLomba,
                'nama_lomba_norm' => achievement_store_normalize_text($namaLomba),
                'penyelenggara_norm' => achievement_store_normalize_text($penyelenggara),
                'peran' => $input['peran'] ?? ($peringkat !== '' ? 'juara' : 'peserta'),
                'bidang' => $input['bidang'] ?? null,
                'tanggal_mulai' => $tanggalMulai,
                'tanggal_selesai' => achievement_store_normalize_date($input['tanggal_selesai'] ?? ($input['tanggalSelesai'] ?? null)),
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];

        case 'kekayaan_intelektual':
            $judulKi = trim((string)($input['judul_ki'] ?? $input['judul'] ?? $title));
            $tanggalPengajuan = achievement_store_normalize_date($input['tanggal_pengajuan'] ?? ($input['tanggalPengajuan'] ?? $tanggal));
            return [
                'judul_ki' => $judulKi,
                'judul_ki_norm' => achievement_store_normalize_text($judulKi),
                'jenis_ki' => $input['jenis_ki'] ?? ($input['jenisHaki'] ?? 'paten'),
                'status_ki' => $input['status_ki'] ?? ($input['status'] ?? 'pending'),
                'pemegang' => $input['pemegang'] ?? ($penyelenggara !== '' ? $penyelenggara : '-'),
                'nomor_pendaftaran' => $input['nomor_pendaftaran'] ?? ($input['nomorPendaftaran'] ?? null),
                'nomor_sertifikat' => $input['nomor_sertifikat'] ?? ($input['nomorSertifikat'] ?? null),
                'tahun_pengajuan' => isset($input['tahun_pengajuan']) ? (int)$input['tahun_pengajuan'] : (isset($input['tahunPengajuan']) ? (int)$input['tahunPengajuan'] : ($tanggalPengajuan ? (int)date('Y', strtotime($tanggalPengajuan)) : null)),
                'tahun_terbit' => isset($input['tahun_terbit']) ? (int)$input['tahun_terbit'] : (isset($input['tahunTerbit']) ? (int)$input['tahunTerbit'] : null),
                'tanggal_pengajuan' => $tanggalPengajuan,
                'tanggal_terbit' => achievement_store_normalize_date($input['tanggal_terbit'] ?? ($input['tanggalTerbit'] ?? null)),
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];

        case 'research_output':
            $normalizedSubtype = normalizeResearchOutputSubcategory((string)($common['subcategory'] ?? ($input['subcategory'] ?? '')));
            if (!isResearchOutputSubcategory($normalizedSubtype)) {
                $normalizedSubtype = 'patent';
            }

            $judulLuaran = trim((string)($input['judul_ki'] ?? $input['judul_luaran'] ?? $input['judul'] ?? $title));
            $tanggalLuaran = achievement_store_normalize_date(
                $input['tanggal_pengajuan']
                ?? $input['tanggal_luaran']
                ?? $input['tanggal']
                ?? ($common['tanggal'] ?? null)
            );
            $tahunLuaran = isset($input['tahun_pengajuan'])
                ? (int)$input['tahun_pengajuan']
                : (isset($input['tahun_luaran'])
                    ? (int)$input['tahun_luaran']
                    : ($tanggalLuaran ? (int)date('Y', strtotime($tanggalLuaran)) : null));

            $hakiJenisMap = [
                'trademark' => 'merek',
                'patent' => 'paten',
                'simple_patent' => 'paten',
                'industrial_design' => 'desain_industri',
                'copyright' => 'hak_cipta',
                'trade_secret' => 'rahasia_dagang',
            ];
            $hakiStatusDefault = in_array($normalizedSubtype, researchOutputHakiSubcategories(), true) ? 'pending' : null;
            $jenisPerolehanRaw = strtolower(trim((string)($input['jenis_perolehan'] ?? ($input['jenisPerolehan'] ?? 'mandiri'))));
            if (!in_array($jenisPerolehanRaw, ['mandiri', 'kolaborasi_dosen'], true)) {
                $jenisPerolehanRaw = 'mandiri';
            }
            $namaDosenRaw = trim((string)($input['nama_dosen'] ?? ($input['namaDosen'] ?? '')));
            $urlPublikasiRaw = trim((string)($input['url_publikasi'] ?? ($input['urlPublikasi'] ?? '')));

            return [
                'judul_ki' => $judulLuaran,
                'judul_ki_norm' => achievement_store_normalize_text($judulLuaran),
                'jenis_ki' => $hakiJenisMap[$normalizedSubtype] ?? null,
                'status_ki' => $input['status_ki'] ?? ($input['status'] ?? $hakiStatusDefault),
                'pemegang' => $input['pemegang'] ?? ($penyelenggara !== '' ? $penyelenggara : null),
                'nomor_pendaftaran' => $input['nomor_pendaftaran'] ?? ($input['nomorPendaftaran'] ?? null),
                'nomor_sertifikat' => $input['nomor_sertifikat'] ?? ($input['nomorSertifikat'] ?? null),
                'tahun_pengajuan' => $tahunLuaran,
                'tahun_terbit' => isset($input['tahun_terbit']) ? (int)$input['tahun_terbit'] : null,
                'tanggal_pengajuan' => $tanggalLuaran,
                'tanggal_terbit' => achievement_store_normalize_date($input['tanggal_terbit'] ?? null),
                'deskripsi' => $input['deskripsi'] ?? $description,
                'jenis_perolehan' => $jenisPerolehanRaw,
                'nama_dosen' => $jenisPerolehanRaw === 'kolaborasi_dosen' && $namaDosenRaw !== '' ? $namaDosenRaw : null,
                'url_publikasi' => $urlPublikasiRaw !== '' ? $urlPublikasiRaw : null,
            ];

        case 'magang':
            $namaPerusahaan = trim((string)($input['nama_perusahaan'] ?? $input['namaPerusahaan'] ?? ($penyelenggara !== '' ? $penyelenggara : $title)));
            $posisi = trim((string)($input['posisi'] ?? $title));
            $sedangBerjalan = achievement_store_normalize_bool($input['sedang_berjalan'] ?? ($input['sedangBerjalan'] ?? false));
            return [
                'nama_perusahaan' => $namaPerusahaan,
                'nama_perusahaan_norm' => achievement_store_normalize_text($namaPerusahaan),
                'posisi' => $posisi,
                'posisi_norm' => achievement_store_normalize_text($posisi),
                'industri' => $input['industri'] ?? ($description ?? ''),
                'tanggal_mulai' => achievement_store_normalize_date($input['tanggal_mulai'] ?? ($input['tanggalMulai'] ?? $tanggal)),
                'tanggal_selesai' => achievement_store_normalize_date($input['tanggal_selesai'] ?? ($input['tanggalSelesai'] ?? null)),
                'sedang_berjalan' => $sedangBerjalan,
                'deskripsi_tugas' => $input['deskripsi_tugas'] ?? ($input['deskripsiTugas'] ?? $description),
            ];

        case 'produk_mahasiswa':
            $namaProduk = trim((string)($input['nama_produk'] ?? $input['namaProduk'] ?? $title));
            $kategoriProduk = strtolower(trim((string)($input['kategori_produk'] ?? $input['kategoriProduk'] ?? ($common['subcategory'] ?? ''))));
            if (!achievement_store_is_product_subcategory($kategoriProduk)) {
                $kategoriProduk = 'makanan_minuman';
            }
            $linkProduk = isset($input['link_produk'])
                ? trim((string)$input['link_produk'])
                : (isset($input['linkProduk']) ? trim((string)$input['linkProduk']) : '');
            return [
                'nama_produk' => $namaProduk,
                'nama_produk_norm' => achievement_store_normalize_text($namaProduk),
                'kategori_produk' => $kategoriProduk,
                'link_produk' => $linkProduk !== '' ? $linkProduk : null,
            ];

        case 'wirausaha':
            $namaUsaha = trim((string)($input['nama_usaha'] ?? $input['namaUsaha'] ?? $title));
            $lokasiUsaha = trim((string)($input['lokasi'] ?? $common['lokasi'] ?? ''));
            return [
                'nama_usaha' => $namaUsaha,
                'nama_usaha_norm' => achievement_store_normalize_text($namaUsaha),
                'jenis_usaha' => $input['jenis_usaha'] ?? ($input['jenisUsaha'] ?? ($description ?? '')),
                'peran' => $input['peran'] ?? null,
                'lokasi_norm' => achievement_store_normalize_text($lokasiUsaha),
                'tahun_mulai' => isset($input['tahun_mulai']) ? (int)$input['tahun_mulai'] : (isset($input['tahunMulai']) ? (int)$input['tahunMulai'] : ($tanggal ? (int)date('Y', strtotime($tanggal)) : null)),
                'masih_aktif' => achievement_store_normalize_bool($input['masih_aktif'] ?? ($input['masihAktif'] ?? true), true),
                'tahun_selesai' => isset($input['tahun_selesai']) ? (int)$input['tahun_selesai'] : (isset($input['tahunSelesai']) ? (int)$input['tahunSelesai'] : null),
                'deskripsi_usaha' => $input['deskripsi_usaha'] ?? ($input['deskripsiUsaha'] ?? $description),
                'jumlah_karyawan' => isset($input['jumlah_karyawan']) ? (int)$input['jumlah_karyawan'] : null,
                'omzet_per_bulan' => $input['omzet_per_bulan'] ?? null,
            ];

        case 'pengembangan_diri':
            $namaProgram = trim((string)($input['nama_program'] ?? ($input['namaProgram'] ?? $title)));
            return [
                'nama_program' => $namaProgram,
                'nama_program_norm' => achievement_store_normalize_text($namaProgram),
                'jenis_program' => $input['jenis_program'] ?? ($input['jenisProgram'] ?? 'pelatihan'),
                'peran_mahasiswa' => $input['peran_mahasiswa'] ?? ($input['peranMahasiswa'] ?? null),
                'negara' => $input['negara'] ?? null,
                'tanggal_mulai' => achievement_store_normalize_date($input['tanggal_mulai'] ?? ($input['tanggalMulai'] ?? $tanggal)),
                'tanggal_selesai' => achievement_store_normalize_date($input['tanggal_selesai'] ?? ($input['tanggalSelesai'] ?? null)),
                'sedang_berjalan' => achievement_store_normalize_bool($input['sedang_berjalan'] ?? ($input['sedangBerjalan'] ?? false)),
                'output' => $input['output'] ?? null,
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];

        case 'organisasi':
            $namaOrganisasi = trim((string)($input['nama_organisasi'] ?? ($input['namaOrganisasi'] ?? $title)));
            $jabatan = trim((string)($input['jabatan'] ?? ($description ?? 'Anggota')));
            return [
                'nama_organisasi' => $namaOrganisasi,
                'nama_organisasi_norm' => achievement_store_normalize_text($namaOrganisasi),
                'jenis_organisasi' => $input['jenis_organisasi'] ?? ($input['jenisOrganisasi'] ?? 'kampus'),
                'jabatan' => $jabatan,
                'jabatan_norm' => achievement_store_normalize_text($jabatan),
                'tanggal_mulai' => achievement_store_normalize_date($input['tanggal_mulai'] ?? ($input['tanggalMulai'] ?? $tanggal)),
                'tanggal_selesai' => achievement_store_normalize_date($input['tanggal_selesai'] ?? ($input['tanggalSelesai'] ?? null)),
                'masih_aktif' => achievement_store_normalize_bool($input['masih_aktif'] ?? ($input['masihAktif'] ?? true), true),
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];

        case 'seminar':
        default:
            $judulPublikasi = trim((string)($input['judul_publikasi'] ?? ($input['judulPublikasi'] ?? $title)));
            $levelSeminarRaw = strtolower(trim((string)($input['level_seminar'] ?? ($input['levelSeminar'] ?? ''))));
            if ($levelSeminarRaw === '' && isset($input['tingkat'])) {
                $tingkatSeminar = strtolower(trim((string)$input['tingkat']));
                if (in_array($tingkatSeminar, ['lokal', 'regional', 'local', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
                    $levelSeminarRaw = 'local';
                } elseif (in_array($tingkatSeminar, ['nasional', 'national'], true)) {
                    $levelSeminarRaw = 'national';
                } elseif (in_array($tingkatSeminar, ['internasional', 'international'], true)) {
                    $levelSeminarRaw = 'international';
                }
            }
            if (!in_array($levelSeminarRaw, ['local', 'national', 'international'], true)) {
                $levelSeminarRaw = null;
            }

            $jenisPerolehan = strtolower(trim((string)($input['jenis_perolehan'] ?? ($input['jenisPerolehan'] ?? ''))));
            if (!in_array($jenisPerolehan, ['mandiri', 'kolaborasi_dosen'], true)) {
                $jenisPerolehan = null;
            }

            $namaDosen = trim((string)($input['nama_dosen'] ?? ($input['namaDosen'] ?? '')));
            if ($jenisPerolehan !== 'kolaborasi_dosen') {
                $namaDosen = '';
            }

            $namaSeminarKonferensi = trim((string)($input['nama_seminar_konferensi'] ?? ($input['namaSeminarKonferensi'] ?? ($input['nama_seminar'] ?? ($input['namaSeminar'] ?? '')))));
            $namaSeminar = $namaSeminarKonferensi !== '' ? $namaSeminarKonferensi : $judulPublikasi;
            return [
                'nama_seminar' => $namaSeminar,
                'nama_seminar_norm' => achievement_store_normalize_text($namaSeminar),
                'penyelenggara_norm' => achievement_store_normalize_text($penyelenggara),
                'judul_publikasi' => $judulPublikasi,
                'judul_publikasi_norm' => achievement_store_normalize_text($judulPublikasi),
                'level_seminar' => $levelSeminarRaw,
                'jenis_perolehan' => $jenisPerolehan,
                'nama_dosen' => $namaDosen !== '' ? $namaDosen : null,
                'penulis' => isset($input['penulis']) ? trim((string)$input['penulis']) : null,
                'nama_seminar_konferensi' => $namaSeminarKonferensi !== '' ? $namaSeminarKonferensi : null,
                'nama_seminar_konferensi_norm' => achievement_store_normalize_text($namaSeminarKonferensi),
                'url_publikasi' => isset($input['url_publikasi']) ? trim((string)$input['url_publikasi']) : (isset($input['urlPublikasi']) ? trim((string)$input['urlPublikasi']) : null),
                'tanggal_publikasi' => achievement_store_normalize_date($input['tanggal_publikasi'] ?? ($input['tanggalPublikasi'] ?? $tanggal)),
                'deskripsi' => $input['deskripsi'] ?? $description,
            ];
    }
}

function achievement_store_table_columns(PDO $pdo, string $table): array {
    static $cache = [];
    if (isset($cache[$table])) {
        return $cache[$table];
    }

    $stmt = $pdo->prepare('
        SELECT COLUMN_NAME
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
    ');
    $stmt->execute([$table]);

    $columns = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $name = (string)($row['COLUMN_NAME'] ?? '');
        if ($name === '') continue;
        $columns[$name] = true;
    }

    $cache[$table] = $columns;
    return $columns;
}

function achievement_store_filter_existing_columns(PDO $pdo, string $table, array $columns): array {
    $available = achievement_store_table_columns($pdo, $table);
    return array_values(array_filter($columns, static function ($column) use ($available) {
        return isset($available[$column]);
    }));
}

function achievement_store_duplicate_message(array $config): string {
    if (($config['key'] ?? '') === 'lomba') {
        return 'Prestasi lomba yang sama sudah ada untuk mahasiswa ini. Jika lombanya berbeda, ubah salah satu pembeda seperti penyelenggara, tingkat, atau tahun.';
    }

    return 'Data prestasi yang sama sudah ada.';
}

function achievement_store_is_duplicate_exception(PDOException $e): bool {
    if ((string)$e->getCode() === '23000') {
        return true;
    }

    $info = $e->errorInfo ?? [];
    return isset($info[0]) && (string)$info[0] === '23000';
}

function achievement_store_assert_no_duplicate(PDO $pdo, array $config, array $commonData, array $specificData, ?string $excludeId = null): void {
    if (($config['key'] ?? '') !== 'lomba') {
        return;
    }

    $studentId = trim((string)($commonData['id_mahasiswa'] ?? ''));
    $namaLombaNorm = trim((string)($specificData['nama_lomba_norm'] ?? ''));
    $tingkat = $commonData['tingkat'] ?? null;
    $tanggalMulai = $specificData['tanggal_mulai'] ?? null;
    $penyelenggaraNorm = trim((string)($specificData['penyelenggara_norm'] ?? achievement_store_normalize_text((string)($commonData['penyelenggara'] ?? ''))));

    if ($studentId === '' || $namaLombaNorm === '' || $tanggalMulai === null) {
        return;
    }

    $availableColumns = achievement_store_table_columns($pdo, $config['table']);
    $penyelenggaraExpr = isset($availableColumns['penyelenggara_norm'])
        ? 'COALESCE(penyelenggara_norm, \'\')'
        : 'LOWER(TRIM(COALESCE(penyelenggara, \'\')))';

    $sql = sprintf(
        'SELECT %s FROM %s WHERE id_mahasiswa = ? AND nama_lomba_norm = ? AND tingkat <=> ? AND tanggal_mulai <=> ? AND %s = ?',
        $config['id_col'],
        $config['table'],
        $penyelenggaraExpr
    );
    $values = [$studentId, $namaLombaNorm, $tingkat, $tanggalMulai, $penyelenggaraNorm];

    if ($excludeId !== null && $excludeId !== '') {
        $sql .= sprintf(' AND %s <> ?', $config['id_col']);
        $values[] = $excludeId;
    }

    $sql .= ' LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);

    if ($stmt->fetch(PDO::FETCH_ASSOC)) {
        throw new AchievementDuplicateException(achievement_store_duplicate_message($config));
    }
}

function achievement_store_insert(PDO $pdo, array $config, string $id, array $commonData, array $specificData): void {
    achievement_store_assert_no_duplicate($pdo, $config, $commonData, $specificData);

    $commonColumns = achievement_store_filter_existing_columns($pdo, $config['table'], achievement_store_common_columns());
    $specificColumns = achievement_store_filter_existing_columns($pdo, $config['table'], $config['specific_columns']);
    $columns = array_merge([$config['id_col']], $commonColumns, $specificColumns);
    $placeholders = implode(',', array_fill(0, count($columns), '?'));
    $sql = sprintf(
        'INSERT INTO %s (%s, created_at, updated_at) VALUES (%s, NOW(), NOW())',
        $config['table'],
        implode(', ', $columns),
        $placeholders
    );

    $values = [$id];
    foreach ($commonColumns as $column) {
        $values[] = $commonData[$column] ?? null;
    }
    foreach ($specificColumns as $column) {
        $values[] = $specificData[$column] ?? null;
    }

    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute($values);
    } catch (PDOException $e) {
        if (achievement_store_is_duplicate_exception($e)) {
            throw new AchievementDuplicateException(achievement_store_duplicate_message($config));
        }
        throw $e;
    }
}

function achievement_store_update(PDO $pdo, array $config, string $id, array $commonData, array $specificData): void {
    achievement_store_assert_no_duplicate($pdo, $config, $commonData, $specificData, $id);

    $commonColumns = achievement_store_filter_existing_columns($pdo, $config['table'], achievement_store_common_columns());
    $specificColumns = achievement_store_filter_existing_columns($pdo, $config['table'], $config['specific_columns']);
    $setColumns = array_merge($commonColumns, $specificColumns);

    if (count($setColumns) > 0) {
        $setSql = implode(', ', array_map(static function ($column) {
            return $column . ' = ?';
        }, $setColumns));
        $sql = sprintf(
            'UPDATE %s SET %s, updated_at = NOW() WHERE %s = ?',
            $config['table'],
            $setSql,
            $config['id_col']
        );
    } else {
        $sql = sprintf(
            'UPDATE %s SET updated_at = NOW() WHERE %s = ?',
            $config['table'],
            $config['id_col']
        );
    }

    $values = [];
    foreach ($commonColumns as $column) {
        $values[] = $commonData[$column] ?? null;
    }
    foreach ($specificColumns as $column) {
        $values[] = $specificData[$column] ?? null;
    }
    $values[] = $id;

    $stmt = $pdo->prepare($sql);
    try {
        $stmt->execute($values);
    } catch (PDOException $e) {
        if (achievement_store_is_duplicate_exception($e)) {
            throw new AchievementDuplicateException(achievement_store_duplicate_message($config));
        }
        throw $e;
    }
}

function achievement_store_delete(PDO $pdo, array $config, string $id): bool {
    $sql = sprintf('DELETE FROM %s WHERE %s = ?', $config['table'], $config['id_col']);
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    return $stmt->rowCount() > 0;
}

function achievement_store_fetch_view_row(PDO $pdo, string $id): ?array {
    try {
        $stmt = $pdo->prepare('SELECT * FROM achievements WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return $row;
        }
    } catch (PDOException $e) {
        // View "achievements" mungkin belum ada di production (migrasi belum dijalankan)
        // Fallback: baca dari tabel prestasi_* via find_record
    }
    $found = achievement_store_find_record($pdo, $id);
    if (!$found) {
        return null;
    }
    $row = $found['row'];
    $config = $found['config'];
    return [
        'id' => $row[$config['id_col']] ?? $id,
        'student_id' => $row['id_mahasiswa'] ?? null,
        'category' => $row['category'] ?? null,
        'subcategory' => $row['subcategory'] ?? null,
        'achievement_type' => $row['achievement_type'] ?? null,
        'title' => $row['title'] ?? null,
        'description' => $row['description'] ?? null,
        'tanggal' => $row['tanggal'] ?? null,
        'lokasi' => $row['lokasi'] ?? null,
        'penyelenggara' => $row['penyelenggara'] ?? null,
        'tingkat' => $row['tingkat'] ?? null,
        'peringkat' => $row['peringkat'] ?? null,
        'jenis_perolehan' => $row['jenis_perolehan'] ?? null,
        'nama_dosen' => $row['nama_dosen'] ?? null,
        'url_publikasi' => $row['url_publikasi'] ?? null,
        'link_produk' => $row['link_produk'] ?? null,
        'verified' => !empty($row['verified']),
        'created_at' => $row['created_at'] ?? null,
        'updated_at' => $row['updated_at'] ?? null,
    ];
}

function achievement_store_available_import_categories(): array {
    $result = [];
    foreach (achievement_store_configs() as $config) {
        $result[] = $config['import_category'];
    }
    return $result;
}
