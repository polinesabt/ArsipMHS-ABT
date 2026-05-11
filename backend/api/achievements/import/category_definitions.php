<?php

require_once __DIR__ . '/../store_helper.php';

function prestasi_import_normalize_header(string $value): string {
    $value = mb_strtolower(trim($value), 'UTF-8');
    $value = str_replace(['*', '.', '/', '-', '(', ')', ':'], ' ', $value);
    $value = preg_replace('/\s+/u', ' ', $value) ?? $value;
    $value = str_replace(' ', '_', trim($value));

    $aliases = [
        'mitra_adopsi_jika_ada' => 'mitra_adopsi',
        'kategori_produk_lain' => 'kategori_produk_lainnya',
        'nama_mata_kuliah_lainnya' => 'mata_kuliah_lainnya',
        'output_prestasi' => 'output',
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

function prestasi_import_bool_strict($value): ?bool {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if (in_array($normalized, ['1', 'true', 'yes', 'ya', 'y', 'on'], true)) return true;
    if (in_array($normalized, ['0', 'false', 'no', 'tidak', 'n', 'off'], true)) return false;
    return null;
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

function prestasi_import_product_categories_with_other(): array {
    return array_merge(prestasi_import_product_categories(), ['lainnya']);
}

function prestasi_import_normalize_journal_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $allowed = [
        'national_non_accredited',
        'national_accredited',
        'international',
        'reputable_international',
    ];
    return in_array($normalized, $allowed, true) ? $normalized : null;
}

function prestasi_import_normalize_seminar_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    return in_array($normalized, ['local', 'national', 'international'], true) ? $normalized : null;
}

function prestasi_import_normalize_pagelaran_level($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    return in_array($normalized, ['local', 'national', 'international'], true) ? $normalized : null;
}

function prestasi_import_normalize_jenis_perolehan($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    if ($normalized === 'mandiri') return 'mandiri';
    if ($normalized === 'kolaborasi_dosen') return 'kolaborasi_dosen';
    return null;
}

function prestasi_import_normalize_pagelaran_subcategory($value): ?string {
    if ($value === null) return null;
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return null;
    $allowed = [
        'conference',
        'presentasi',
        'oral_presentation',
        'poster_presentation',
        'expo',
        'pameran',
        'pagelaran',
    ];
    return in_array($normalized, $allowed, true) ? $normalized : null;
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

function prestasi_import_field_label(array $field): string {
    return trim((string)($field['label'] ?? $field['key'] ?? ''));
}

function prestasi_import_field_display_label(array $field): string {
    $label = prestasi_import_field_label($field);
    $required = (bool)($field['required'] ?? false);
    if ($required && !str_ends_with($label, '*')) {
        return $label . '*';
    }
    return $label;
}

function prestasi_import_field_option_values(array $field): array {
    $values = [];
    foreach (($field['options'] ?? []) as $option) {
        if (is_array($option)) {
            $value = isset($option['value']) ? trim((string)$option['value']) : '';
            if ($value !== '') $values[] = $value;
            continue;
        }
        $value = trim((string)$option);
        if ($value !== '') $values[] = $value;
    }
    return $values;
}

function prestasi_import_is_valid_select_value($value, array $options): bool {
    $normalized = strtolower(trim((string)$value));
    if ($normalized === '') return false;
    foreach ($options as $option) {
        if ($normalized === strtolower(trim((string)$option))) {
            return true;
        }
    }
    return false;
}

function prestasi_import_definitions(): array {
    $jenisPublikasiOptions = ['artikel_jurnal', 'prosiding', 'buku', 'book_chapter', 'lainnya'];
    $journalLevelOptions = ['national_non_accredited', 'national_accredited', 'international', 'reputable_international'];
    $jenisPerolehanOptions = ['mandiri', 'kolaborasi_dosen'];
    $mataKuliahOptions = ['kwu', 'ecommerce', 'msdm_ocai', 'other'];
    $semesterOptions = ['ganjil', 'genap'];
    $lombaTingkatOptions = ['lokal', 'regional', 'nasional', 'internasional'];
    $lombaPeranOptions = ['peserta', 'juara'];
    $jenisKiOptions = ['hak_cipta', 'paten', 'merek', 'desain_industri'];
    $statusKiOptions = ['pending', 'terdaftar', 'granted'];
    $pengembanganJenisAktivitasOptions = ['pertukaran_mahasiswa', 'beasiswa', 'volunteer', 'pelatihan', 'lainnya'];
    $jenisOrganisasiOptions = ['kampus', 'luar_kampus'];
    $masihAktifOptions = ['ya', 'tidak'];
    $seminarLevelOptions = ['local', 'national', 'international'];
    $pagelaranJenisOptions = ['conference', 'presentasi', 'oral_presentation', 'poster_presentation', 'pagelaran', 'pameran', 'expo'];
    $productCategoryOptions = prestasi_import_product_categories_with_other();

    return [
        'publikasi' => [
            'label' => 'Karya Ilmiah & Publikasi',
            'config_key' => 'publikasi',
            'fields' => [
                ['key' => 'judul_karya', 'label' => 'Judul Karya', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_publikasi', 'label' => 'Jenis Publikasi', 'type' => 'select', 'required' => true, 'options' => $jenisPublikasiOptions],
                ['key' => 'level_jurnal', 'label' => 'Level Jurnal', 'type' => 'select', 'required' => false, 'options' => $journalLevelOptions],
                ['key' => 'penulis', 'label' => 'Penulis', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'nama_jurnal_konferensi', 'label' => 'Nama Jurnal/Konferensi', 'type' => 'text', 'required' => false],
                ['key' => 'tahun_terbit', 'label' => 'Tahun Terbit', 'type' => 'number', 'required' => true],
                ['key' => 'url', 'label' => 'URL Publikasi', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'jurnal' => [
            'label' => 'Jurnal',
            'config_key' => 'publikasi',
            'fields' => [
                ['key' => 'judul_jurnal', 'label' => 'Judul Jurnal', 'type' => 'text', 'required' => true],
                ['key' => 'level_jurnal', 'label' => 'Level Jurnal', 'type' => 'select', 'required' => true, 'options' => $journalLevelOptions],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'tahun_publikasi', 'label' => 'Tahun Publikasi', 'type' => 'number', 'required' => true],
                ['key' => 'nama_jurnal_konferensi', 'label' => 'Nama Jurnal/Konferensi', 'type' => 'text', 'required' => false],
                ['key' => 'penulis', 'label' => 'Penulis', 'type' => 'text', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'portofolio' => [
            'label' => 'Portofolio Praktikum Kelas',
            'config_key' => 'portofolio',
            'fields' => [
                ['key' => 'judul_proyek', 'label' => 'Judul Proyek', 'type' => 'text', 'required' => true],
                ['key' => 'mata_kuliah', 'label' => 'Mata Kuliah', 'type' => 'select', 'required' => true, 'options' => $mataKuliahOptions],
                ['key' => 'mata_kuliah_lainnya', 'label' => 'Mata Kuliah Lainnya', 'type' => 'text', 'required' => false],
                ['key' => 'tahun', 'label' => 'Tahun', 'type' => 'number', 'required' => true],
                ['key' => 'semester', 'label' => 'Semester', 'type' => 'select', 'required' => true, 'options' => $semesterOptions],
                ['key' => 'deskripsi_proyek', 'label' => 'Deskripsi Proyek', 'type' => 'text', 'required' => true],
            ],
        ],
        'lomba' => [
            'label' => 'Lomba',
            'config_key' => 'lomba',
            'fields' => [
                ['key' => 'nama_lomba', 'label' => 'Nama Lomba', 'type' => 'text', 'required' => true],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara', 'type' => 'text', 'required' => true],
                ['key' => 'tingkat', 'label' => 'Tingkat', 'type' => 'select', 'required' => true, 'options' => $lombaTingkatOptions],
                ['key' => 'peran', 'label' => 'Peran', 'type' => 'select', 'required' => true, 'options' => $lombaPeranOptions],
                ['key' => 'peringkat', 'label' => 'Peringkat', 'type' => 'text', 'required' => false],
                ['key' => 'tahun', 'label' => 'Tahun', 'type' => 'number', 'required' => true],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'kekayaan_intelektual' => [
            'label' => 'Kekayaan Intelektual',
            'config_key' => 'kekayaan_intelektual',
            'fields' => [
                ['key' => 'judul_ki', 'label' => 'Judul KI', 'type' => 'text', 'required' => true],
                ['key' => 'pemegang', 'label' => 'Pemegang', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_ki', 'label' => 'Jenis KI', 'type' => 'select', 'required' => true, 'options' => $jenisKiOptions],
                ['key' => 'status', 'label' => 'Status', 'type' => 'select', 'required' => true, 'options' => $statusKiOptions],
                ['key' => 'nomor_pendaftaran', 'label' => 'Nomor Pendaftaran', 'type' => 'text', 'required' => false],
                ['key' => 'tahun_pengajuan', 'label' => 'Tahun Pengajuan', 'type' => 'number', 'required' => true],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'research_output_hki' => [
            'label' => 'Luaran Penelitian - HKI',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Luaran', 'type' => 'text', 'required' => true],
                ['key' => 'subtype', 'label' => 'Jenis Luaran', 'type' => 'select', 'required' => true, 'options' => prestasi_import_research_output_haki_subtypes()],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran', 'type' => 'date', 'required' => true],
                ['key' => 'url_publikasi', 'label' => 'URL Luaran', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'research_output_technology' => [
            'label' => 'Luaran Penelitian - Teknologi',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Luaran', 'type' => 'text', 'required' => true],
                ['key' => 'subtype', 'label' => 'Jenis Luaran', 'type' => 'select', 'required' => true, 'options' => prestasi_import_research_output_technology_subtypes()],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran', 'type' => 'date', 'required' => true],
                ['key' => 'url_publikasi', 'label' => 'URL Luaran', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'research_output_books' => [
            'label' => 'Luaran Penelitian - Buku',
            'config_key' => 'research_output',
            'fields' => [
                ['key' => 'judul_luaran', 'label' => 'Judul Luaran', 'type' => 'text', 'required' => true],
                ['key' => 'subtype', 'label' => 'Jenis Luaran', 'type' => 'select', 'required' => true, 'options' => prestasi_import_research_output_book_subtypes()],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_luaran', 'label' => 'Tanggal Luaran', 'type' => 'date', 'required' => true],
                ['key' => 'url_publikasi', 'label' => 'URL Luaran', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'magang' => [
            'label' => 'Pengalaman Magang',
            'config_key' => 'magang',
            'fields' => [
                ['key' => 'nama_perusahaan', 'label' => 'Nama Perusahaan', 'type' => 'text', 'required' => true],
                ['key' => 'posisi', 'label' => 'Posisi', 'type' => 'text', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'type' => 'text', 'required' => true],
                ['key' => 'industri', 'label' => 'Industri', 'type' => 'text', 'required' => true],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai', 'type' => 'date', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'type' => 'date', 'required' => false],
                ['key' => 'deskripsi_tugas', 'label' => 'Deskripsi Tugas', 'type' => 'text', 'required' => false],
            ],
        ],
        'produk_mahasiswa' => [
            'label' => 'Produk Mahasiswa',
            'config_key' => 'produk_mahasiswa',
            'fields' => [
                ['key' => 'nama_produk', 'label' => 'Nama Produk', 'type' => 'text', 'required' => true],
                ['key' => 'kategori_produk', 'label' => 'Kategori Produk', 'type' => 'select', 'required' => true, 'options' => $productCategoryOptions],
                ['key' => 'kategori_produk_lainnya', 'label' => 'Kategori Produk Lainnya', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_adopsi', 'label' => 'Tanggal Adopsi', 'type' => 'date', 'required' => true],
                ['key' => 'mitra_adopsi', 'label' => 'Mitra Adopsi', 'type' => 'text', 'required' => false],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'wirausaha' => [
            'label' => 'Pengalaman Wirausaha',
            'config_key' => 'wirausaha',
            'fields' => [
                ['key' => 'nama_usaha', 'label' => 'Nama Usaha', 'type' => 'text', 'required' => true],
                ['key' => 'bidang_usaha', 'label' => 'Bidang Usaha', 'type' => 'text', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'type' => 'text', 'required' => true],
                ['key' => 'tahun_mulai', 'label' => 'Tahun Mulai', 'type' => 'number', 'required' => true],
                ['key' => 'deskripsi_usaha', 'label' => 'Deskripsi Usaha', 'type' => 'text', 'required' => true],
            ],
        ],
        'pengembangan_diri' => [
            'label' => 'Program Pengembangan Diri',
            'config_key' => 'pengembangan_diri',
            'fields' => [
                ['key' => 'nama_program', 'label' => 'Nama Program', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_aktivitas', 'label' => 'Jenis Aktivitas', 'type' => 'select', 'required' => true, 'options' => $pengembanganJenisAktivitasOptions],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara', 'type' => 'text', 'required' => true],
                ['key' => 'lokasi', 'label' => 'Lokasi', 'type' => 'text', 'required' => false],
                ['key' => 'negara', 'label' => 'Negara', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai', 'type' => 'date', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'type' => 'date', 'required' => false],
                ['key' => 'output', 'label' => 'Output', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'organisasi' => [
            'label' => 'Organisasi & Kepemimpinan',
            'config_key' => 'organisasi',
            'fields' => [
                ['key' => 'nama_organisasi', 'label' => 'Nama Organisasi', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_organisasi', 'label' => 'Jenis Organisasi', 'type' => 'select', 'required' => true, 'options' => $jenisOrganisasiOptions],
                ['key' => 'jabatan', 'label' => 'Jabatan', 'type' => 'text', 'required' => true],
                ['key' => 'masih_aktif', 'label' => 'Masih Aktif', 'type' => 'select', 'required' => true, 'options' => $masihAktifOptions],
                ['key' => 'tanggal_mulai', 'label' => 'Tanggal Mulai', 'type' => 'date', 'required' => true],
                ['key' => 'tanggal_selesai', 'label' => 'Tanggal Selesai', 'type' => 'date', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'seminar' => [
            'label' => 'Publikasi di Seminar',
            'config_key' => 'seminar',
            'fields' => [
                ['key' => 'judul_publikasi', 'label' => 'Judul Publikasi', 'type' => 'text', 'required' => true],
                ['key' => 'level_seminar', 'label' => 'Level Seminar', 'type' => 'select', 'required' => true, 'options' => $seminarLevelOptions],
                ['key' => 'jenis_perolehan', 'label' => 'Jenis Perolehan', 'type' => 'select', 'required' => true, 'options' => $jenisPerolehanOptions],
                ['key' => 'nama_dosen', 'label' => 'Nama Dosen', 'type' => 'text', 'required' => false],
                ['key' => 'tanggal_publikasi', 'label' => 'Tanggal Publikasi', 'type' => 'date', 'required' => true],
                ['key' => 'penulis', 'label' => 'Penulis', 'type' => 'text', 'required' => false],
                ['key' => 'nama_seminar_konferensi', 'label' => 'Nama Seminar/Konferensi', 'type' => 'text', 'required' => false],
                ['key' => 'penyelenggara', 'label' => 'Penyelenggara', 'type' => 'text', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
            ],
        ],
        'pagelaran' => [
            'label' => 'Pagelaran / Presentasi',
            'config_key' => 'seminar',
            'fields' => [
                ['key' => 'judul_kegiatan', 'label' => 'Judul Kegiatan', 'type' => 'text', 'required' => true],
                ['key' => 'jenis_kegiatan', 'label' => 'Jenis Kegiatan', 'type' => 'select', 'required' => true, 'options' => $pagelaranJenisOptions],
                ['key' => 'level_kegiatan', 'label' => 'Level Kegiatan', 'type' => 'select', 'required' => true, 'options' => $seminarLevelOptions],
                ['key' => 'tanggal_kegiatan', 'label' => 'Tanggal Kegiatan', 'type' => 'date', 'required' => true],
                ['key' => 'penulis', 'label' => 'Penulis', 'type' => 'text', 'required' => false],
                ['key' => 'nama_acara_konferensi', 'label' => 'Nama Acara/Konferensi', 'type' => 'text', 'required' => false],
                ['key' => 'mitra_kegiatan', 'label' => 'Mitra Kegiatan', 'type' => 'text', 'required' => false],
                ['key' => 'url_publikasi', 'label' => 'URL Publikasi', 'type' => 'text', 'required' => false],
                ['key' => 'deskripsi', 'label' => 'Deskripsi', 'type' => 'text', 'required' => false],
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

function prestasi_import_validate_field_types(array $definition, array $row): ?string {
    foreach ($definition['fields'] as $field) {
        $key = (string)$field['key'];
        $label = prestasi_import_field_label($field);
        $value = $row[$key] ?? null;
        $type = strtolower(trim((string)($field['type'] ?? 'text')));

        if (($field['required'] ?? false) && prestasi_import_is_empty($value)) {
            return 'Kolom wajib kosong: ' . $label;
        }

        if (prestasi_import_is_empty($value)) {
            continue;
        }

        if ($type === 'number' && prestasi_import_year($value) === null) {
            return $label . ' tidak valid (1900-2100).';
        }

        if ($type === 'date' && prestasi_import_date($value) === null) {
            return $label . ' tidak valid. Gunakan format tanggal yang benar.';
        }

        if ($type === 'select') {
            $options = prestasi_import_field_option_values($field);
            if (!prestasi_import_is_valid_select_value($value, $options)) {
                return $label . ' tidak valid. Gunakan salah satu nilai canonical dari dropdown.';
            }
        }

        if ($type === 'boolean' && prestasi_import_bool_strict($value) === null) {
            return $label . ' harus bernilai ya/tidak.';
        }
    }

    return null;
}

function prestasi_import_validate_row(string $categoryKey, array $row): ?string {
    $definition = prestasi_import_resolve_definition($categoryKey);
    if (!$definition) return 'Kategori import tidak dikenali.';

    $genericError = prestasi_import_validate_field_types($definition, $row);
    if ($genericError !== null) return $genericError;

    switch ($categoryKey) {
        case 'publikasi': {
            $jenisPublikasi = strtolower(trim((string)($row['jenis_publikasi'] ?? '')));
            if ($jenisPublikasi === 'artikel_jurnal' && prestasi_import_is_empty($row['level_jurnal'] ?? null)) {
                return 'Level jurnal wajib diisi jika jenis_publikasi = artikel_jurnal.';
            }

            $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehan === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis_perolehan = kolaborasi_dosen.';
            }

            if (!prestasi_import_is_empty($row['url'] ?? null) && filter_var((string)$row['url'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi tidak valid.';
            }

            return null;
        }

        case 'jurnal': {
            $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehan === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis_perolehan = kolaborasi_dosen.';
            }

            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi jurnal tidak valid.';
            }

            return null;
        }

        case 'portofolio': {
            $mataKuliah = strtolower(trim((string)($row['mata_kuliah'] ?? '')));
            if ($mataKuliah === 'other' && prestasi_import_is_empty($row['mata_kuliah_lainnya'] ?? null)) {
                return 'Mata kuliah lainnya wajib diisi jika mata_kuliah = other.';
            }
            return null;
        }

        case 'lomba':
            return null;

        case 'kekayaan_intelektual':
            return null;

        case 'research_output_hki':
        case 'research_output_technology':
        case 'research_output_books': {
            $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehan === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis_perolehan = kolaborasi_dosen.';
            }
            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL luaran penelitian tidak valid.';
            }
            return null;
        }

        case 'magang': {
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($tanggalMulai !== null && $tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) {
                return 'Tanggal selesai magang tidak boleh sebelum tanggal mulai.';
            }
            return null;
        }

        case 'produk_mahasiswa': {
            $kategoriProduk = strtolower(trim((string)($row['kategori_produk'] ?? '')));
            if ($kategoriProduk === 'lainnya' && prestasi_import_is_empty($row['kategori_produk_lainnya'] ?? null)) {
                return 'Kategori produk lainnya wajib diisi jika kategori_produk = lainnya.';
            }
            return null;
        }

        case 'wirausaha':
            return null;

        case 'pengembangan_diri': {
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);
            if ($tanggalMulai !== null && $tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) {
                return 'Tanggal selesai tidak boleh sebelum tanggal mulai.';
            }
            return null;
        }

        case 'organisasi': {
            $masihAktif = strtolower(trim((string)($row['masih_aktif'] ?? '')));
            $tanggalMulai = prestasi_import_date($row['tanggal_mulai'] ?? null);
            $tanggalSelesai = prestasi_import_date($row['tanggal_selesai'] ?? null);

            if ($masihAktif === 'tidak' && $tanggalSelesai === null) {
                return 'Tanggal selesai wajib diisi jika masih_aktif = tidak.';
            }

            if ($tanggalMulai !== null && $tanggalSelesai !== null && strtotime($tanggalSelesai) < strtotime($tanggalMulai)) {
                return 'Tanggal selesai organisasi tidak boleh sebelum tanggal mulai.';
            }

            return null;
        }

        case 'seminar': {
            $jenisPerolehan = prestasi_import_normalize_jenis_perolehan($row['jenis_perolehan'] ?? null);
            if ($jenisPerolehan === 'kolaborasi_dosen' && prestasi_import_is_empty($row['nama_dosen'] ?? null)) {
                return 'Nama dosen wajib diisi jika jenis_perolehan = kolaborasi_dosen.';
            }

            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi seminar tidak valid.';
            }

            return null;
        }

        case 'pagelaran':
            if (!prestasi_import_is_empty($row['url_publikasi'] ?? null) && filter_var((string)$row['url_publikasi'], FILTER_VALIDATE_URL) === false) {
                return 'URL publikasi pagelaran tidak valid.';
            }
            return null;
    }

    return 'Kategori import tidak dikenali.';
}
