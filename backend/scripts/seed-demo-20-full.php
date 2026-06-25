<?php
/**
 * Seed demo lengkap: 20 akun mahasiswa, 1 akun admin, tracer, prestasi,
 * evaluasi kepuasan, dan statistik mahasiswa aktif.
 *
 * Run from project root:
 *   C:\xampp\php\php.exe backend\scripts\seed-demo-20-full.php
 */

require_once __DIR__ . '/../config/database.php';

$studentPasswordHash = '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG'; // student123
$adminPasswordHash = '$2y$10$hrLNnB/vm3jGnUZNl5KpMOZ4F00A2siE/1C0q26JfCt58ER3QSiJq'; // admin123

function normText(string $value): string
{
    return strtolower(trim(preg_replace('/\s+/', ' ', $value)));
}

function runStmt(PDO $pdo, string $sql, array $params = []): void
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
}

$students = [
    ['demo-s01', 'demo-u01', '20210031', 'Alya Prameswari', 2021, 2025, 'alumni'],
    ['demo-s02', 'demo-u02', '20210032', 'Bagas Kurniawan', 2021, 2025, 'alumni'],
    ['demo-s03', 'demo-u03', '20210033', 'Celine Maharani', 2021, 2025, 'alumni'],
    ['demo-s04', 'demo-u04', '20210034', 'Dimas Saputra', 2021, 2025, 'alumni'],
    ['demo-s05', 'demo-u05', '20210035', 'Elvira Oktaviani', 2021, 2025, 'alumni'],
    ['demo-s06', 'demo-u06', '20210036', 'Farhan Aditya', 2021, 2025, 'alumni'],
    ['demo-s07', 'demo-u07', '20210037', 'Gendis Amalia', 2021, 2025, 'alumni'],
    ['demo-s08', 'demo-u08', '20210038', 'Hafiz Ramadhan', 2021, 2025, 'alumni'],
    ['demo-s09', 'demo-u09', '20210039', 'Intan Puspita', 2021, 2025, 'alumni'],
    ['demo-s10', 'demo-u10', '20210040', 'Jihan Larasati', 2021, 2025, 'alumni'],
    ['demo-s11', 'demo-u11', '20220041', 'Kevin Wicaksono', 2022, 2026, 'alumni'],
    ['demo-s12', 'demo-u12', '20220042', 'Laras Nirmala', 2022, 2026, 'alumni'],
    ['demo-s13', 'demo-u13', '20220043', 'Mikael Santoso', 2022, 2026, 'alumni'],
    ['demo-s14', 'demo-u14', '20220044', 'Nadia Rahma', 2022, 2026, 'alumni'],
    ['demo-s15', 'demo-u15', '20230045', 'Owen Pratama', 2023, null, 'active'],
    ['demo-s16', 'demo-u16', '20230046', 'Putri Wulandari', 2023, null, 'active'],
    ['demo-s17', 'demo-u17', '20230047', 'Rafi Maulana', 2023, null, 'active'],
    ['demo-s18', 'demo-u18', '20240048', 'Salsa Fitriani', 2024, null, 'active'],
    ['demo-s19', 'demo-u19', '20240049', 'Tegar Firmansyah', 2024, null, 'active'],
    ['demo-s20', 'demo-u20', '20240050', 'Vania Safitri', 2024, null, 'active'],
];

$studentIds = array_column($students, 0);
$userIds = array_column($students, 1);
$nimList = array_column($students, 2);

try {
    $pdo->beginTransaction();

    $inStudents = implode(',', array_fill(0, count($studentIds), '?'));
    $inUsers = implode(',', array_fill(0, count($userIds), '?'));

    foreach ([
        'menu_student_achievements_records',
        'menu_study_period_records',
        'menu_waiting_time_records',
        'menu_job_relevance_records',
        'menu_work_coverage_records',
        'menu_user_satisfaction_records',
        'menu_publications_records',
        'menu_active_students_records',
        'menu_student_products_records',
        'menu_research_outputs_records',
    ] as $table) {
        runStmt($pdo, "DELETE FROM {$table} WHERE source_id IN ({$inStudents}) OR id LIKE 'demo-%'", $studentIds);
    }

    runStmt($pdo, "DELETE r FROM evaluation_response_ratings r JOIN evaluation_responses er ON er.id = r.response_id WHERE er.id LIKE 'demo-er-%'");
    runStmt($pdo, "DELETE FROM evaluation_responses WHERE id LIKE 'demo-er-%'");
    runStmt($pdo, "DELETE FROM evaluation_invitations WHERE id LIKE 'demo-inv-%'");
    runStmt($pdo, "DELETE FROM evaluations WHERE id = 'demo-eval-2026'");
    runStmt($pdo, "DELETE FROM tracer_study WHERE student_id IN ({$inStudents})", $studentIds);

    foreach ([
        'prestasi_lomba',
        'prestasi_seminar',
        'prestasi_publikasi',
        'prestasi_kekayaan_intelektual',
        'prestasi_magang',
        'prestasi_portofolio',
        'prestasi_wirausaha',
        'prestasi_pengembangan_diri',
        'prestasi_organisasi',
        'prestasi_produk_mahasiswa',
    ] as $table) {
        runStmt($pdo, "DELETE FROM {$table} WHERE id_mahasiswa IN ({$inStudents})", $studentIds);
    }

    runStmt($pdo, "DELETE FROM students WHERE id IN ({$inStudents})", $studentIds);
    runStmt($pdo, "DELETE FROM users WHERE id IN ({$inUsers})", $userIds);

    runStmt(
        $pdo,
        "INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active)
         VALUES ('admin-demo-001', 'admin_demo', ?, 'Admin Demo Arsip Mahasiswa', 'admin', NOW(), TRUE)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), nama = VALUES(nama), role = 'admin', is_active = TRUE",
        [$adminPasswordHash]
    );
    runStmt(
        $pdo,
        "INSERT INTO admins (id, created_at)
         VALUES ('admin-demo-001', NOW())
         ON DUPLICATE KEY UPDATE created_at = created_at"
    );

    $insertUser = $pdo->prepare(
        "INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active)
         VALUES (?, ?, ?, ?, 'student', NOW(), TRUE)"
    );
    $insertStudent = $pdo->prepare(
        "INSERT INTO students (id, nim, nama, jurusan, prodi, status, status_mode, tahun_masuk, tahun_lulus, email, no_hp, alamat, user_id, has_credentials, created_at, updated_at)
         VALUES (?, ?, ?, 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', ?, 'manual', ?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())"
    );

    foreach ($students as $i => [$studentId, $userId, $nim, $name, $tahunMasuk, $tahunLulus, $status]) {
        $email = strtolower(str_replace(' ', '.', $name)) . '@demo.arsipmhs.local';
        $phone = '08123' . str_pad((string) (450000 + $i), 7, '0', STR_PAD_LEFT);
        $alamat = 'Jl. Demo Kampus No. ' . ($i + 1) . ', Semarang';
        $insertUser->execute([$userId, $nim, $studentPasswordHash, $name]);
        $insertStudent->execute([$studentId, $nim, $name, $status, $tahunMasuk, $tahunLulus, $email, $phone, $alamat, $userId]);
    }

    $careerStatuses = ['working', 'working', 'entrepreneur', 'working', 'job_seeking', 'further_study', 'working', 'entrepreneur', 'working', 'working', 'entrepreneur', 'working', 'further_study', 'job_seeking'];
    $insertTracer = $pdo->prepare(
        "INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, employment_data, job_seeking_data, entrepreneurship_data, further_study_data, ringkasan_karir, bersedia_dihubungi, saran_komentar, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 2026, ?, ?, ?, ?, ?, TRUE, ?, NOW(), NOW())"
    );

    foreach (array_slice($students, 0, 14) as $i => [$studentId, , , $name]) {
        $status = $careerStatuses[$i];
        $email = strtolower(str_replace(' ', '.', $name)) . '@demo.arsipmhs.local';
        $phone = '08123' . str_pad((string) (450000 + $i), 7, '0', STR_PAD_LEFT);
        $employment = $jobSeeking = $entrepreneurship = $furtherStudy = null;
        if ($status === 'working') {
            $employment = json_encode([
                'nama_perusahaan' => ['PT Nusantara Retail', 'Bank Jateng', 'CV Digital Niaga'][$i % 3],
                'lokasi_perusahaan' => ['Semarang', 'Jakarta', 'Bandung'][$i % 3],
                'bidang_industri' => ['Retail', 'Perbankan', 'Teknologi'][$i % 3],
                'jabatan' => ['Admin Operasional', 'Customer Relation', 'Marketing Analyst'][$i % 3],
                'tahun_mulai_kerja' => 2026,
                'masih_aktif_kerja' => true,
                'relevansi_kompetensi' => ['sangat_relevan', 'relevan', 'cukup_relevan'][$i % 3],
            ], JSON_UNESCAPED_UNICODE);
        } elseif ($status === 'entrepreneur') {
            $entrepreneurship = json_encode([
                'nama_usaha' => ['Kopi Keliling ABT', 'Studio Konten Mahasiswa', 'Snackbox Semarang'][$i % 3],
                'jenis_usaha' => ['Kuliner', 'Jasa Digital', 'Makanan Ringan'][$i % 3],
                'lokasi_usaha' => 'Semarang',
                'tahun_mulai_usaha' => 2025,
                'punya_karyawan' => true,
                'jumlah_karyawan' => 2 + ($i % 4),
                'usaha_aktif' => true,
                'relevansi_kompetensi' => 'relevan',
            ], JSON_UNESCAPED_UNICODE);
        } elseif ($status === 'further_study') {
            $furtherStudy = json_encode([
                'nama_kampus' => ['Universitas Diponegoro', 'Universitas Negeri Semarang'][$i % 2],
                'jenjang' => 'S1',
                'program_studi' => 'Manajemen',
                'tahun_mulai' => 2026,
            ], JSON_UNESCAPED_UNICODE);
        } else {
            $jobSeeking = json_encode([
                'lokasi_tujuan' => 'Semarang',
                'bidang_diincar' => 'Administrasi Bisnis',
                'lama_mencari' => 3 + $i,
            ], JSON_UNESCAPED_UNICODE);
        }

        $insertTracer->execute([
            'demo-tr-' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT),
            $studentId,
            $email,
            $phone,
            '@' . strtolower(explode(' ', $name)[0]) . 'demo',
            'linkedin.com/in/' . strtolower(str_replace(' ', '-', $name)),
            $status,
            $employment,
            $jobSeeking,
            $entrepreneurship,
            $furtherStudy,
            'Data dummy untuk menampilkan variasi status karier alumni.',
            'Saran demo: tingkatkan jejaring industri dan bimbingan karier.',
        ]);
    }

    $achievementRows = [
        ['lomba', 'demo-ach-01', 'demo-s01', 'Lomba Business Plan Nasional', 'Juara 2 business plan mahasiswa', '2025-04-12', 'Jakarta', 'Kemdikbud', 'nasional', 'Juara 2'],
        ['seminar', 'demo-ach-02', 'demo-s02', 'Seminar Digital Marketing', 'Peserta seminar nasional', '2025-05-18', 'Online', 'Asosiasi Digital Indonesia', 'nasional', null],
        ['publikasi', 'demo-ach-03', 'demo-s03', 'Analisis Loyalitas Pelanggan UMKM', 'Artikel jurnal manajemen terapan', '2025-06-20', 'Online', 'Jurnal Bisnis Terapan', 'nasional', null],
        ['ki', 'demo-ach-04', 'demo-s04', 'Hak Cipta Modul Administrasi Digital', 'Pencatatan hak cipta karya mahasiswa', '2025-07-10', 'Semarang', 'DJKI', 'nasional', null],
        ['magang', 'demo-ach-05', 'demo-s05', 'Magang PT Logistik Nusantara', 'Magang operasional logistik', '2025-01-10', 'Semarang', 'PT Logistik Nusantara', 'regional', null],
        ['portofolio', 'demo-ach-06', 'demo-s06', 'Dashboard Penjualan UMKM', 'Portofolio mata kuliah analisis bisnis', '2025-02-14', 'Semarang', 'Polines', 'lokal', null],
        ['wirausaha', 'demo-ach-07', 'demo-s07', 'Usaha Kopi Keliling ABT', 'Bisnis minuman mahasiswa aktif', '2025-03-01', 'Semarang', 'Pribadi', 'lokal', null],
        ['pengembangan', 'demo-ach-08', 'demo-s08', 'Pelatihan Excel Advanced', 'Sertifikasi spreadsheet bisnis', '2025-08-11', 'Semarang', 'BLK Semarang', 'regional', null],
        ['organisasi', 'demo-ach-09', 'demo-s09', 'Bendahara HIMA ABT', 'Aktif di organisasi kampus', '2025-09-01', 'Semarang', 'HIMA ABT', 'lokal', null],
        ['produk', 'demo-ach-10', 'demo-s10', 'Snackbox Sehat Mahasiswa', 'Produk makanan ringan untuk event kampus', '2025-10-05', 'Semarang', 'Tim Mahasiswa', 'lokal', null],
        ['lomba', 'demo-ach-11', 'demo-s11', 'Kompetisi Sales Pitch Regional', 'Finalis sales pitch regional', '2026-02-18', 'Yogyakarta', 'Kadin DIY', 'regional', 'Finalis'],
        ['seminar', 'demo-ach-12', 'demo-s12', 'Konferensi Manajemen Terapan', 'Pemakalah konferensi nasional', '2026-03-09', 'Yogyakarta', 'Forum ABT Indonesia', 'nasional', null],
        ['publikasi', 'demo-ach-13', 'demo-s13', 'Model Promosi Produk Lokal', 'Prosiding konferensi mahasiswa', '2026-04-16', 'Surabaya', 'Forum Riset Mahasiswa', 'nasional', null],
        ['ki', 'demo-ach-14', 'demo-s14', 'Merek Dagang Kopi Karsa', 'Pendaftaran merek dagang bisnis mahasiswa', '2026-05-12', 'Semarang', 'DJKI', 'nasional', null],
        ['magang', 'demo-ach-15', 'demo-s15', 'Magang Bank Jateng', 'Magang layanan nasabah', '2026-01-15', 'Semarang', 'Bank Jateng', 'regional', null],
        ['portofolio', 'demo-ach-16', 'demo-s16', 'Riset Kepuasan Pelanggan', 'Portofolio riset pemasaran', '2026-02-20', 'Semarang', 'Polines', 'lokal', null],
        ['wirausaha', 'demo-ach-17', 'demo-s17', 'Studio Konten Mahasiswa', 'Usaha jasa desain konten', '2026-03-22', 'Semarang', 'Pribadi', 'lokal', null],
        ['pengembangan', 'demo-ach-18', 'demo-s18', 'Workshop Public Speaking', 'Pelatihan komunikasi bisnis', '2026-04-25', 'Semarang', 'Polines', 'lokal', null],
        ['organisasi', 'demo-ach-19', 'demo-s19', 'Koordinator Volunteer Expo', 'Volunteer expo kewirausahaan', '2026-05-15', 'Semarang', 'Pemkot Semarang', 'regional', null],
        ['produk', 'demo-ach-20', 'demo-s20', 'Aplikasi Katalog UMKM', 'Produk digital katalog UMKM lokal', '2026-06-01', 'Semarang', 'Tim Mahasiswa', 'lokal', null],
    ];

    foreach ($achievementRows as [$type, $id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank]) {
        if ($type === 'lomba') {
            runStmt($pdo, "INSERT INTO prestasi_lomba (id_lomba, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_lomba, nama_lomba_norm, penyelenggara_norm, peran, bidang, tanggal_mulai, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'event_participation', 'competition', 'non_academic', TRUE, ?, ?, ?, ?, 'Bisnis', ?, ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), normText($org), $rank ? 'juara' : 'peserta', $date, $desc]);
        } elseif ($type === 'seminar') {
            runStmt($pdo, "INSERT INTO prestasi_seminar (id_seminar, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_seminar, nama_seminar_norm, penyelenggara_norm, peran_seminar, mode_seminar, tanggal_seminar, deskripsi, judul_publikasi, judul_publikasi_norm, level_seminar, jenis_perolehan, nama_seminar_konferensi, nama_seminar_konferensi_norm, tanggal_publikasi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'event_participation', 'seminar', 'non_academic', TRUE, ?, ?, ?, ?, 'offline', ?, ?, ?, ?, ?, 'mandiri', ?, ?, ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), normText($org), str_contains(strtolower($title), 'konferensi') ? 'pembicara' : 'peserta', $date, $desc, $title, normText($title), $level === 'internasional' ? 'international' : ($level === 'nasional' ? 'national' : 'local'), $title, normText($title), $date]);
        } elseif ($type === 'publikasi') {
            runStmt($pdo, "INSERT INTO prestasi_publikasi (id_publikasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, judul, judul_norm, jenis_publikasi, penulis, peran_penulis, nama_jurnal_konferensi, nama_jurnal_konferensi_norm, penerbit, tahun_terbit, tanggal_terbit, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scientific_work', 'journal_publication', 'academic', TRUE, ?, ?, ?, ?, 'Penulis 1', ?, ?, ?, YEAR(?), ?, ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), str_contains(strtolower($desc), 'prosiding') ? 'prosiding' : 'artikel_jurnal', 'Mahasiswa Demo', $org, normText($org), $org, $date, $date, $desc]);
        } elseif ($type === 'ki') {
            runStmt($pdo, "INSERT INTO prestasi_kekayaan_intelektual (id_kekayaan_intelektual, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, judul_ki, judul_ki_norm, jenis_ki, status_ki, pemegang, nomor_pendaftaran, tahun_pengajuan, tahun_terbit, tanggal_pengajuan, tanggal_terbit, deskripsi, jenis_perolehan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'intellectual_property', 'patent', 'non_academic', TRUE, ?, ?, ?, 'terdaftar', 'Mahasiswa Demo', ?, YEAR(?), YEAR(?), ?, ?, ?, 'mandiri')", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), str_contains(strtolower($title), 'merek') ? 'merek' : 'hak_cipta', 'REG-' . strtoupper($id), $date, $date, $date, $date, $desc]);
        } elseif ($type === 'magang') {
            runStmt($pdo, "INSERT INTO prestasi_magang (id_magang, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_perusahaan, nama_perusahaan_norm, posisi, posisi_norm, industri, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi_tugas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied_academic', 'internship', 'non_academic', TRUE, ?, ?, 'Staf Administrasi', 'staf administrasi', 'Bisnis dan Layanan', ?, DATE_ADD(?, INTERVAL 60 DAY), FALSE, ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $org, normText($org), $date, $date, $desc]);
        } elseif ($type === 'portofolio') {
            runStmt($pdo, "INSERT INTO prestasi_portofolio (id_portofolio, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, judul_proyek, judul_proyek_norm, mata_kuliah_custom, mata_kuliah_norm, tahun, semester, deskripsi_proyek, output, url_proyek, nilai) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied_academic', 'course_portfolio', 'academic', TRUE, ?, ?, 'Manajemen Pemasaran', 'manajemen pemasaran', YEAR(?), 'genap', ?, 'Dashboard dan laporan analisis', 'https://example.com/demo-portofolio', 'A')", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), $date, $desc]);
        } elseif ($type === 'wirausaha') {
            runStmt($pdo, "INSERT INTO prestasi_wirausaha (id_wirausaha, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_usaha, nama_usaha_norm, jenis_usaha, peran, lokasi_norm, tahun_mulai, masih_aktif, deskripsi_usaha, jumlah_karyawan, omzet_per_bulan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'entrepreneurship', 'active_business', 'non_academic', TRUE, ?, ?, 'Jasa dan Produk Kreatif', 'Founder', ?, YEAR(?), TRUE, ?, 3, 'Rp5.000.000 - Rp10.000.000')", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), normText($loc), $date, $desc]);
        } elseif ($type === 'pengembangan') {
            runStmt($pdo, "INSERT INTO prestasi_pengembangan_diri (id_pengembangan_diri, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_program, nama_program_norm, jenis_program, peran_mahasiswa, negara, tanggal_mulai, tanggal_selesai, sedang_berjalan, output, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'self_development', 'workshop', 'non_academic', TRUE, ?, ?, 'pelatihan', 'Peserta', 'Indonesia', ?, DATE_ADD(?, INTERVAL 2 DAY), FALSE, 'Sertifikat', ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $title, normText($title), $date, $date, $desc]);
        } elseif ($type === 'organisasi') {
            runStmt($pdo, "INSERT INTO prestasi_organisasi (id_organisasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_organisasi, nama_organisasi_norm, jenis_organisasi, jabatan, jabatan_norm, tanggal_mulai, tanggal_selesai, masih_aktif, deskripsi) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'self_development', 'volunteer', 'non_academic', TRUE, ?, ?, 'kampus', 'Koordinator', 'koordinator', ?, DATE_ADD(?, INTERVAL 90 DAY), FALSE, ?)", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, $org, normText($org), $date, $date, $desc]);
        } elseif ($type === 'produk') {
            runStmt($pdo, "INSERT INTO prestasi_produk_mahasiswa (id_produk_mahasiswa, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_produk, nama_produk_norm, kategori_produk, link_produk) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied_academic', ?, 'non_academic', TRUE, ?, ?, ?, 'https://example.com/produk-demo')", [$id, $studentId, $title, $desc, $date, $loc, $org, $level, $rank, str_contains(strtolower($title), 'aplikasi') ? 'aplikasi' : 'makanan_minuman', $title, normText($title), str_contains(strtolower($title), 'aplikasi') ? 'aplikasi' : 'makanan_minuman']);
        }
    }

    runStmt($pdo, "INSERT INTO evaluations (id, title, short_message, status, start_at, end_at, reminder_enabled, reminder_interval_days, created_by, created_at, updated_at) VALUES ('demo-eval-2026', 'Survey Kepuasan Pengguna Lulusan Demo 2026', 'Mohon isi penilaian terhadap lulusan ABT.', 'active', '2026-01-01 08:00:00', '2026-12-31 23:59:59', TRUE, 7, 'admin-demo-001', NOW(), NOW())");

    $aspects = $pdo->query("SELECT id FROM evaluation_aspects WHERE is_active = 1 ORDER BY sort_order")->fetchAll(PDO::FETCH_COLUMN);
    $insertInvitation = $pdo->prepare("INSERT INTO evaluation_invitations (id, evaluation_id, student_id, user_id, access_token, first_sent_at, last_sent_at, send_count, submitted_at, created_by, created_at, updated_at) VALUES (?, 'demo-eval-2026', ?, ?, ?, NOW(), NOW(), 1, NOW(), 'admin-demo-001', NOW(), NOW())");
    $insertResponse = $pdo->prepare("INSERT INTO evaluation_responses (id, evaluation_id, invitation_id, student_id, company_name, company_address, employee_name, graduation_year, study_program, current_work_division, major_job_match, submitted_at, created_at) VALUES (?, 'demo-eval-2026', ?, ?, ?, ?, ?, ?, 'Administrasi Bisnis Terapan', ?, ?, NOW(), NOW())");
    $insertRating = $pdo->prepare("INSERT INTO evaluation_response_ratings (id, response_id, aspect_id, score, created_at) VALUES (?, ?, ?, ?, NOW())");

    foreach (array_slice($students, 0, 12) as $i => [$studentId, $userId, , $name, , $tahunLulus]) {
        $invId = 'demo-inv-' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT);
        $respId = 'demo-er-' . str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT);
        $insertInvitation->execute([$invId, $studentId, $userId, 'demo-token-' . ($i + 1)]);
        $insertResponse->execute([
            $respId,
            $invId,
            $studentId,
            ['PT Nusantara Retail', 'Bank Jateng', 'CV Digital Niaga'][$i % 3],
            'Jl. Industri Demo No. ' . ($i + 10) . ', Semarang',
            ['Rina HRD', 'Agus Supervisor', 'Maya Manager'][$i % 3],
            $tahunLulus,
            ['Operasional', 'Layanan Pelanggan', 'Pemasaran'][$i % 3],
            $i % 4 === 0 ? 'tidak' : 'ya',
        ]);
        foreach ($aspects as $j => $aspectId) {
            $score = 3 + (($i + $j) % 3);
            $insertRating->execute(['demo-rate-' . ($i + 1) . '-' . ($j + 1), $respId, $aspectId, $score]);
        }
    }

    foreach ([
        [2023, 'ganjil', 65, 58],
        [2023, 'genap', 68, 61],
        [2024, 'ganjil', 72, 66],
        [2024, 'genap', 75, 69],
        [2025, 'ganjil', 78, 70],
        [2025, 'genap', 80, 72],
        [2026, 'ganjil', 82, 74],
        [2026, 'genap', 84, 76],
    ] as [$tahun, $semester, $pdDikti, $aktif]) {
        runStmt(
            $pdo,
            "INSERT INTO active_students_semester_stats (tahun, semester, pd_dikti, aktif, created_at, updated_at)
             VALUES (?, ?, ?, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE pd_dikti = VALUES(pd_dikti), aktif = VALUES(aktif), updated_at = NOW()",
            [$tahun, $semester, $pdDikti, $aktif]
        );
    }

    $pdo->commit();
    echo "OK: 20 akun mahasiswa demo, 1 admin demo, tracer, prestasi, evaluasi, dan statistik semester berhasil dibuat.\n";
    echo "Login admin: admin_demo / admin123\n";
    echo "Login mahasiswa: NIM 20210031-20240050 / student123\n";
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    fwrite(STDERR, "ERROR: " . $e->getMessage() . "\n");
    exit(1);
}
