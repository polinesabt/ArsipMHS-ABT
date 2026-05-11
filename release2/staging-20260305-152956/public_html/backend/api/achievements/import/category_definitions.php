<?php

require_once __DIR__ . '/../store_helper.php';

function prestasi_import_normalize_header(string $value): string {
    $value = mb_strtolower(trim($value), 'UTF-8');
    $value = str_replace(['*', '.', '/', '-', '(', ')'], ' ', $value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;
    $value = str_replace(' ', '_', trim($value));

    $aliases = [
        'nomor_hp' => 'nomor',
        'tanggal_mulai_' => 'tanggal_mulai',
        'tanggal_selesai_' => 'tanggal_selesai',
        'nama_jurnal_konferensi' => 'nama_jurnal_konferensi',
        'mitra_kegiatan_jika_ada' => 'mitra_kegiatan',
    ];

    return $aliases[$value] ?? $value;
}

function prestasi_import_is_empty($value): bool {
    if ($value === null) return true;
    if (is_string($value)) return trim($value) === '';
    return false;
}

function prestasi_import_bool($value, bool $default = false): bool {
    if (is_bool($value)) return $value;
    if ($value === null) return $default;
    $normalized = strtolower(trim((string)$value));
    if (in_array($normalized, ['1', 'true', 'yes', 'ya', 'y', 'on'], true)) return true;
    if (in_array($normalized, ['0', 'false', 'no', 'tidak', 'n', 'off'], true)) return false;
    return $default;
}

function prestasi_import_date($value): ?string {
    return achievement_store_normalize_date($value);
}

function prestasi_import_year($value): ?int {
    if ($value === null || trim((string)$value) === '') return null;
    $year = (int)$value;
    if ($year < 1900 || $year > 2100) return null;
    return $year;
}

function prestasi_import_product_categories(): array {
    return achievement_store_product_subcategory_keys();
}

function prestasi_import_normalize_journal_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $normalized = str_replace(['-', ' '], '_', $normalized);
    $map = [
        'nasional_tidak_terakreditasi' => 'national_non_accredited',
        'national_non_accredited' => 'national_non_accredited',
        'nasional_non_terakreditasi' => 'national_non_accredited',
        'nasional_terakreditasi' => 'national_accredited',
        'national_accredited' => 'national_accredited',
        'internasional' => 'international',
        'international' => 'international',
        'internasional_bereputasi' => 'reputable_international',
        'international_reputable' => 'reputable_international',
        'reputable_international' => 'reputable_international',
    ];
    return $map[$normalized] ?? null;
}

function prestasi_import_normalize_seminar_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $normalized = str_replace(['-', ' '], '_', $normalized);

    if (in_array($normalized, ['local', 'lokal', 'regional', 'wilayah', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
        return 'local';
    }
    if (in_array($normalized, ['national', 'nasional'], true)) {
        return 'national';
    }
    if (in_array($normalized, ['international', 'internasional'], true)) {
        return 'international';
    }
    return null;
}

function prestasi_import_normalize_pagelaran_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $normalized = str_replace(['-', ' '], '_', $normalized);

    if (in_array($normalized, ['regional', 'wilayah', 'local', 'lokal', 'perguruan_tinggi', 'kampus', 'pt'], true)) {
        return 'regional';
    }
    if (in_array($normalized, ['national', 'nasional'], true)) {
        return 'national';
    }
    if (in_array($normalized, ['international', 'internasional'], true)) {
        return 'international';
    }
    return null;
}

function prestasi_import_normalize_jenis_perolehan($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $normalized = str_replace(['-', ' '], '_', $normalized);
    if ($normalized === 'mandiri') return 'mandiri';
    if (in_array($normalized, ['kolaborasi_dosen', 'kolaborasi', 'bersama_dosen'], true)) return 'kolaborasi_dosen';
    return null;
}

function prestasi_import_normalize_pagelaran_subcategory($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $normalized = str_replace(['-', ' '], '_', $normalized);

    $map = [
        'conference' => 'conference',
        'presentasi' => 'presentasi',
        'presentation' => 'presentation',
        'oral_presentation' => 'oral_presentation',
        'poster_presentation' => 'poster_presentation',
        'expo' => 'expo',
        'exhibition' => 'exhibition',
        'pameran' => 'pameran',
        'pagelaran' => 'pagelaran',
    ];

    return $map[$normalized] ?? null;
}

function prestasi_import_research_output_haki_subtypes(): array {
    return researchOutputHakiSubcategories();
}

function prestasi_import_research_output_technology_subtypes(): array {
    return researchOutputTechnologySubcategories();
}

function prestasi_import_research_output_book_subtypes(): array {
    return researchOutputBookSubcategories();
}

function prestasi_import_definitions(): array {
    return [
        'publikasi' => [
            'label' => 'Karya Ilmiah & Publikasi',
            'config_key' => 'publikasi',
            'fields' => [
                ['key' => 'judul_karya', 'label' => 'Judul Karya*', 'required' => true],
                ['key' => 'jenis_publikasi', 'label' => 'Jenis Publikasi*', 'required' => true],
                ['key' => 'penulis', 'label' => 'Penulis*', 'required' => true],
                ['key' => 'peran_penulis', 'label' => 'Peran Penulis', 'required' => false],
                ['key' => 'nama_jurnal_konferensi', 'label' => 'Nama Jurnal/Konferensi', 'required' => false],
                ['key' => 'penerbit', 'label' => 'Penerbit', 'required' => false],
                ['key' => 'doi', 'label' => 'DOI', 'required' => false],
                ['key' => 'url', 'label' => 'URL', 'required' => false],
                ['key' => 'tahun_terbit', 'label' => 'Tahun Terbit*', 'required' => true],
                ['key' => 'tanggal_terbit', 'label' => 'Tanggal Terbit', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'jurnal' => [
            'label' => 'Jurnal',
            'config_key' => 'publikasi',
            'fields' => [
                ['key' => 'judul_jurnal', 'label' => 'Judul Jurnal*', 'required' => true],
                ['key' => 'level_jurnal', 'label' => 'Level Jurnal*', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan*', 'required' => true],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'required' => false],
                ['key' => 'tahun_publikasi', 'label' => 'Tahun Publikasi*', 'required' => true],
                ['key' => 'nama_jurnal_konferensi', 'label' => 'Nama Jurnal/Konferensi', 'required' => false],
                ['key' => 'penulis', 'label' => 'Penulis', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'portofolio' => [
            'label' => 'Portofolio Praktikum Kelas',
            'config_key' => 'portofolio',
            'fields' => [
                ['key' => 'judul_proyek', 'label' => 'Judul Proyek*', 'required' => true],
                ['key' => 'mata_kuliah', 'label' => 'Mata Kuliah*', 'required' => true],
                ['key' => 'mata_kuliah_lainnya', 'label' => 'Mata Kuliah Lainnya', 'required' => false],
                ['key' => 'tahun', 'label' => 'Tahun*', 'required' => true],
                ['key' => 'semester', 'label' => 'Semester*', 'required' => true],
                ['key' => 'deskripsi_proyek', 'label' => 'Deskripsi Proyek*', 'required' => true],
                ['key' => 'output', 'label' => 'Output', 'required' => false],
                ['key' => 'url_proyek', 'label' => 'URL Proyek', 'required' => false],
                ['key' => 'nilai', 'label' => 'Nilai', 'required' => false],
            ],
        ],
        'lomba' => [
            'label' => 'Lomba',
            'config_key' => 'lomba',
            'fields' => [
                ['key' => 'nama_lomba', 'label' => 'Nama Lomba*', 'required' => true],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara*', 'required' => true],
                ['key' => 'tingkat', 'label' => 'Tingkat*', 'required' => true],
                ['key' => 'peran', 'label' => 'Peran*', 'required' => true],
                ['key' => 'peringkat', 'label' => 'Peringkat', 'required' => false],
                ['key' => 'bidang', 'label' => 'Bidang', 'required' => false],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai*', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'required' => false],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'kekayaan_intelektual' => [
            'label' => 'Kekayaan Intelektual',
            'config_key' => 'kekayaan_intelektual',
            'fields' => [
                ['key' => 'judul_ki', 'label' => 'Judul KI*', 'required' => true],
                ['key' => 'jenis_ki', 'label' => 'Jenis KI*', 'required' => true],
                ['key' => 'status', 'label' => 'Status*', 'required' => true],
                ['key' => 'pemegang', 'label' => 'Pemegang*', 'required' => true],
                ['key' => 'nomor_pendaftaran', 'label' => 'Nomor Pendaftaran', 'required' => false],
                ['key' => 'nomor_sertifikat', 'label' => 'Nomor Sertifikat', 'required' => false],
                ['key' => 'tahun_pengajuan', 'label' => 'Tahun Pengajuan*', 'required' => true],
                ['key' => 'tahun_terbit', 'label' => 'Tahun Terbit', 'required' => false],
                ['key' => 'tanggal_pengajuan', 'label' => 'Tanggal Pengajuan', 'required' => false],
                ['key' => 'tanggal_terbit', 'label' => 'Tanggal Terbit', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'research_output_hki' => [
            'label' => 'Luaran Penelitian - HKI',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Luaran*', 'required' => true],
                ['key' => 'subtype', 'label' => 'Subtype HKI*', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan*', 'required' => true],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'required' => false],
                ['key' => 'status', 'label' => 'Status', 'required' => false],
                ['key' => 'pemegang', 'label' => 'Pemegang', 'required' => false],
                ['key' => 'nomor_pendaftaran', 'label' => 'Nomor Pendaftaran', 'required' => false],
                ['key' => 'nomor_sertifikat', 'label' => 'Nomor Sertifikat', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran*', 'required' => true],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'research_output_technology' => [
            'label' => 'Luaran Penelitian - Teknologi',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Luaran*', 'required' => true],
                ['key' => 'subtype', 'label' => 'Subtype Teknologi*', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan*', 'required' => true],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran*', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'required' => false],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara/Mitra', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'research_output_books' => [
            'label' => 'Luaran Penelitian - Buku',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Buku/Chapter*', 'required' => true],
                ['key' => 'subtype', 'label' => 'Jenis Buku*', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan*', 'required' => true],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'required' => false],
                ['key' => 'penulis', 'label' => 'Penulis', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran*', 'required' => true],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'magang' => [
            'label' => 'Pengalaman Magang',
            'config_key' => 'magang',
            'fields' => [
                ['key' => 'nama_perusahaan', 'label' => 'Nama Perusahaan*', 'required' => true],
                ['key' => 'posisi', 'label' => 'Posisi*', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi*', 'required' => true],
                ['key' => 'industri', 'label' => 'Industri*', 'required' => true],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai*', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'required' => false],
                ['key' => 'sedang_berjalan', 'label' => 'Sedang Berjalan*', 'required' => true],
                ['key' => 'deskripsi_tugas', 'label' => 'Deskripsi Tugas', 'required' => false],
            ],
        ],
        'produk_mahasiswa' => [
            'label' => 'Produk Mahasiswa',
            'config_key' => 'produk_mahasiswa',
            'fields' => [
                ['key' => 'nama_produk', 'label' => 'Nama Produk*', 'required' => true],
                ['key' => 'kategori_produk', 'label' => 'Kategori Produk*', 'required' => true],
                ['key' => 'tanggal_adopsi', 'label' => 'Tanggal Adopsi*', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'required' => false],
                ['key' => 'mitra_adopsi', 'label' => 'Mitra Adopsi', 'required' => false],
                ['key' => 'tingkat', 'label' => 'Tingkat', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'wirausaha' => [
            'label' => 'Pengalaman Wirausaha',
            'config_key' => 'wirausaha',
            'fields' => [
                ['key' => 'nama_usaha', 'label' => 'Nama Usaha*', 'required' => true],
                ['key' => 'bidang_usaha', 'label' => 'Bidang Usaha*', 'required' => true],
                ['key' => 'peran', 'label' => 'Peran', 'required' => false],
                ['key' => 'lokasi', 'label' => 'Lokasi*', 'required' => true],
                ['key' => 'tahun_mulai', 'label' => 'Tahun Mulai*', 'required' => true],
                ['key' => 'masih_aktif', 'label' => 'Masih Aktif*', 'required' => true],
                ['key' => 'tahun_selesai', 'label' => 'Tahun Selesai', 'required' => false],
                ['key' => 'deskripsi_usaha', 'label' => 'Deskripsi Usaha*', 'required' => true],
                ['key' => 'jumlah_karyawan', 'label' => 'Jumlah Karyawan', 'required' => false],
                ['key' => 'omzet_bulan', 'label' => 'Omzet/Bulan', 'required' => false],
            ],
        ],
        'pengembangan_diri' => [
            'label' => 'Program Pengembangan Diri',
            'config_key' => 'pengembangan_diri',
            'fields' => [
                ['key' => 'nama_program', 'label' => 'Nama Program*', 'required' => true],
                ['key' => 'jenis_aktivitas', 'label' => 'Jenis Aktivitas*', 'required' => true],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara*', 'required' => true],
                ['key' => 'peran_mahasiswa', 'label' => 'Peran Mahasiswa', 'required' => false],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'required' => false],
                ['key' => 'negara', 'label' => 'Negara', 'required' => false],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai*', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'required' => false],
                ['key' => 'sedang_berjalan', 'label' => 'Sedang Berjalan*', 'required' => true],
                ['key' => 'output', 'label' => 'Output/Prestasi', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'organisasi' => [
            'label' => 'Organisasi & Kepemimpinan',
            'config_key' => 'organisasi',
            'fields' => [
                ['key' => 'nama_organisasi', 'label' => 'Nama Organisasi*', 'required' => true],
                ['key' => 'jenis_organisasi', 'label' => 'Jenis Organisasi*', 'required' => true],
                ['key' => 'jabatan', 'label' => 'Jabatan*', 'required' => true],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai*', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'required' => false],
                ['key' => 'masih_aktif', 'label' => 'Masih Aktif*', 'required' => true],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'seminar' => [
            'label' => 'Publikasi di Seminar',
            'config_key' => 'seminar',
            'fields' => [
                ['key' => 'judul_publikasi', 'label' => 'Judul Publikasi*', 'required' => true],
                ['key' => 'level_seminar', 'label' => 'Level Seminar*', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan*', 'required' => true],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'required' => false],
                ['key' => 'tanggal_publikasi', 'label' => 'Tanggal Publikasi*', 'required' => true],
                ['key' => 'penulis', 'label' => 'Penulis', 'required' => false],
                ['key' => 'nama_seminar_konferensi', 'label' => 'Nama Seminar/Konferensi', 'required' => false],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
        'pagelaran' => [
            'label' => 'Pagelaran / Presentasi',
            'config_key' => 'seminar',
            'fields' => [
                ['key' => 'judul_kegiatan', 'label' => 'Judul Kegiatan*', 'required' => true],
                ['key' => 'jenis_kegiatan', 'label' => 'Jenis Kegiatan*', 'required' => true],
                ['key' => 'level_kegiatan', 'label' => 'Level Kegiatan*', 'required' => true],
                ['key' => 'tanggal_kegiatan', 'label' => 'Tanggal Kegiatan*', 'required' => true],
                ['key' => 'mitra_kegiatan', 'label' => 'Mitra Kegiatan', 'required' => false],
                ['key' => 'nama_acara_konferensi', 'label' => 'Nama Acara/Konferensi', 'required' => false],
                ['key' => 'penulis', 'label' => 'Penulis', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'required' => false],
            ],
        ],
    ];
}

function prestasi_import_resolve_definition(string $kategori): ?array {
    $normalized = strtolower(trim($kategori));
    $aliases = [
        'haki' => 'kekayaan_intelektual',
        'pengembangan' => 'pengembangan_diri',
        'karya_ilmiah' => 'publikasi',
        'artikel_jurnal' => 'jurnal',
        'produk' => 'produk_mahasiswa',
        'produk-mahasiswa' => 'produk_mahasiswa',
        'presentasi' => 'pagelaran',
        'pagelaran_presentasi' => 'pagelaran',
        'luaran_penelitian_hki' => 'research_output_hki',
        'luaran_penelitian_teknologi' => 'research_output_technology',
        'luaran_penelitian_buku' => 'research_output_books',
        'research_output_hki' => 'research_output_hki',
        'research_output_technology' => 'research_output_technology',
        'research_output_books' => 'research_output_books',
    ];
    $key = $aliases[$normalized] ?? $normalized;

    $defs = prestasi_import_definitions();
    if (!isset($defs[$key])) {
        return null;
    }

    $defs[$key]['key'] = $key;
    return $defs[$key];
}

function prestasi_import_validate_row(string $categoryKey, array $row): ?string {
    switch ($categoryKey) {
        case 'publikasi':
            if (prestasi_import_year($row['tahun_terbit'] ?? null) === null) return 'Tahun terbit tidak valid (1900-2100).';
            if (!prestasi_import_is_empty($row['url'] ?? null) && filter_var((string)$row['url'], FILTER_VALIDATE_URL) === false) return 'URL publikasi tidak valid.';
            if (!prestasi_import_is_empty($row['doi'] ?? null) && strlen(trim((string)$row['doi'])) < 4) return 'DOI tidak valid.';
            return null;

        case 'jurnal':
            if (prestasi_import_year($row['tahun_publikasi'] ?? null) === null) return 'Tahun publikasi jurnal tidak valid (1900-2100).';
            if (prestasi_import_normalize_journal_level($row['level_jurnal'] ?? null) === null) {
                return 'Level jurnal tidak valid.';
            }
            $jenisPerolehanJurnal = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehanJurnal === null) return 'Jenis perolehan jurnal harus mandiri atau kolaborasi_dosen.';
            if ($jenisPerolehanJurnal === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis perolehan = kolaborasi_dosen.';
            }
            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi jurnal tidak valid.';
            }
            return null;

        case 'portofolio':
            $semester = strtolower(trim((string)($row['semester'] ?? '')));
            if (!in_array($semester, ['ganjil', 'genap'], true)) return 'Semester harus ganjil atau genap.';
            if (prestasi_import_year($row['tahun'] ?? null) === null) return 'Tahun tidak valid (1900-2100).';
            $mataKuliah = strtolower(trim((string)($row['mata_kuliah'] ?? '')));
            if ($mataKuliah === 'other' && prestasi_import_is_empty($row['mata_kuliah_lainnya'] ?? null)) return 'Mata Kuliah Lainnya wajib jika Mata Kuliah = other.';
            return null;

        case 'lomba':
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            if ($tanggalMulai === null) return 'Tanggal mulai lomba tidak valid.';
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) return 'Tanggal selesai lomba tidak boleh sebelum tanggal mulai.';
            $peran = strtolower(trim((string)($row['peran'] ?? '')));
            if ($peran === 'juara' && prestasi_import_is_empty($row['peringkat'] ?? null)) return 'Peringkat wajib jika peran juara.';
            return null;

        case 'kekayaan_intelektual':
            $status = strtolower(trim((string)($row['status'] ?? '')));
            if (!in_array($status, ['terdaftar', 'granted', 'pending', 'ditolak'], true)) return 'Status KI tidak valid.';
            if (prestasi_import_year($row['tahun_pengajuan'] ?? null) === null) return 'Tahun pengajuan tidak valid.';
            if ($status === 'granted' && prestasi_import_is_empty($row['nomor_sertifikat'] ?? null)) return 'Nomor sertifikat wajib jika status granted.';
            if (!prestasi_import_is_empty($row['tahun_terbit'] ?? null) && prestasi_import_year($row['tahun_terbit']) === null) return 'Tahun terbit KI tidak valid.';
            return null;

        case 'research_output_hki':
            $subtypeHki = normalizeResearchOutputSubcategory((string)($row['subtype'] ?? ''));
            if (!in_array($subtypeHki, prestasi_import_research_output_haki_subtypes(), true)) {
                return 'Subtype HKI tidak valid untuk template HKI.';
            }
            $jenisPerolehanHki = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehanHki === null) return 'Jenis perolehan harus mandiri atau kolaborasi_dosen.';
            if ($jenisPerolehanHki === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis perolehan = kolaborasi_dosen.';
            }
            if (prestasi_import_date($row['tanggal_luaran'] ?? null) === null) return 'Tanggal luaran tidak valid.';
            return null;

        case 'research_output_technology':
            $subtypeTechnology = normalizeResearchOutputSubcategory((string)($row['subtype'] ?? ''));
            if (!in_array($subtypeTechnology, prestasi_import_research_output_technology_subtypes(), true)) {
                return 'Subtype teknologi tidak valid untuk template Teknologi Tepat Guna.';
            }
            $jenisPerolehanTechnology = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehanTechnology === null) return 'Jenis perolehan harus mandiri atau kolaborasi_dosen.';
            if ($jenisPerolehanTechnology === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis perolehan = kolaborasi_dosen.';
            }
            if (prestasi_import_date($row['tanggal_luaran'] ?? null) === null) return 'Tanggal luaran tidak valid.';
            return null;

        case 'research_output_books':
            $subtypeBooks = normalizeResearchOutputSubcategory((string)($row['subtype'] ?? ''));
            if (!in_array($subtypeBooks, prestasi_import_research_output_book_subtypes(), true)) {
                return 'Jenis buku tidak valid untuk template Buku.';
            }
            $jenisPerolehanBooks = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehanBooks === null) return 'Jenis perolehan harus mandiri atau kolaborasi_dosen.';
            if ($jenisPerolehanBooks === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis perolehan = kolaborasi_dosen.';
            }
            if (prestasi_import_date($row['tanggal_luaran'] ?? null) === null) return 'Tanggal luaran tidak valid.';
            return null;

        case 'magang':
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            if ($tanggalMulai === null) return 'Tanggal mulai magang tidak valid.';
            $sedangBerjalan = prestasi_import_bool($row['sedang_berjalan'] ?? null);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($sedangBerjalan && $tanggalSelesai !== null) return 'Tanggal selesai harus kosong jika sedang berjalan = YA.';
            if (!$sedangBerjalan && $tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) return 'Tanggal selesai magang tidak boleh sebelum tanggal mulai.';
            return null;

        case 'produk_mahasiswa':
            $tanggalAdopsi = prestasi_import_date($row['tanggal_adopsi'] ?? null);
            if ($tanggalAdopsi === null) return 'Tanggal adopsi produk tidak valid.';
            $kategoriProduk = strtolower(trim((string)($row['kategori_produk'] ?? '')));
            if (!in_array($kategoriProduk, prestasi_import_product_categories(), true)) {
                return 'Kategori produk tidak valid. Gunakan key kategori canonical.';
            }
            $tingkat = strtolower(trim((string)($row['tingkat'] ?? '')));
            if ($tingkat !== '' && !in_array($tingkat, ['lokal', 'regional', 'nasional', 'internasional'], true)) {
                return 'Tingkat produk harus lokal, regional, nasional, atau internasional.';
            }
            return null;

        case 'wirausaha':
            $tahunMulai = prestasi_import_year($row['tahun_mulai'] ?? null);
            if ($tahunMulai === null) return 'Tahun mulai usaha tidak valid.';
            $masihAktif = prestasi_import_bool($row['masih_aktif'] ?? null, true);
            $tahunSelesai = prestasi_import_year($row['tahun_selesai'] ?? null);
            if ($masihAktif && $tahunSelesai !== null) return 'Tahun selesai harus kosong jika masih aktif = YA.';
            if (!$masihAktif && $tahunSelesai !== null && $tahunSelesai < $tahunMulai) return 'Tahun selesai tidak boleh lebih kecil dari tahun mulai.';
            return null;

        case 'pengembangan_diri':
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            if ($tanggalMulai === null) return 'Tanggal mulai program tidak valid.';
            $sedangBerjalan = prestasi_import_bool($row['sedang_berjalan'] ?? null);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($sedangBerjalan && $tanggalSelesai !== null) return 'Tanggal selesai harus kosong jika sedang berjalan = YA.';
            if (!$sedangBerjalan && $tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
            return null;

        case 'organisasi':
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            if ($tanggalMulai === null) return 'Tanggal mulai organisasi tidak valid.';
            $masihAktif = prestasi_import_bool($row['masih_aktif'] ?? null, true);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($masihAktif && $tanggalSelesai !== null) return 'Tanggal selesai harus kosong jika masih aktif = YA.';
            if (!$masihAktif && $tanggalSelesai === null) return 'Tanggal selesai wajib jika masih aktif = TIDAK.';
            if ($tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) return 'Tanggal selesai organisasi tidak boleh sebelum tanggal mulai.';
            return null;

        case 'seminar':
            $tanggal = prestasi_import_date($row['tanggal_publikasi'] ?? null);
            if ($tanggal === null) return 'Tanggal publikasi seminar tidak valid.';
            $level = prestasi_import_normalize_seminar_level($row['level_seminar'] ?? null);
            if ($level === null) {
                return 'Level seminar harus local, national, atau international.';
            }
            $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehan === null) {
                return 'Jenis perolehan seminar harus mandiri atau kolaborasi_dosen.';
            }
            if ($jenisPerolehan === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis perolehan = kolaborasi_dosen.';
            }
            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi seminar tidak valid.';
            }
            return null;

        case 'pagelaran':
            $tanggalKegiatan = prestasi_import_date($row['tanggal_kegiatan'] ?? null);
            if ($tanggalKegiatan === null) return 'Tanggal kegiatan pagelaran/presentasi tidak valid.';
            if (prestasi_import_normalize_pagelaran_subcategory($row['jenis_kegiatan'] ?? null) === null) {
                return 'Jenis kegiatan pagelaran/presentasi tidak dikenali.';
            }
            if (prestasi_import_normalize_pagelaran_level($row['level_kegiatan'] ?? null) === null) {
                return 'Level kegiatan pagelaran/presentasi tidak valid.';
            }
            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi pagelaran/presentasi tidak valid.';
            }
            return null;
    }

    return 'Kategori import tidak dikenali.';
}
