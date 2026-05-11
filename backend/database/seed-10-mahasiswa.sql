-- =====================================================================
-- Seed 10 Mahasiswa + Tracer (bekerja / wirausaha / bekerja sambil wirausaha)
-- + Prestasi per mahasiswa (kategori sesuai tabel achievements)
-- =====================================================================
-- Jalankan setelah install.sql (database arsipmhs sudah ada).
-- Password mahasiswa: student123
-- =====================================================================

USE arsipmhs;

SET NAMES utf8mb4;

-- Hash untuk password "student123"
SET @pwd_student = '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG';

-- =====================================================================
-- 1. USERS (10 mahasiswa)
-- =====================================================================
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('u-m1', '20200010', @pwd_student, 'Andi Wijaya', 'student', NOW(), TRUE),
('u-m2', '20200011', @pwd_student, 'Bella Kusuma', 'student', NOW(), TRUE),
('u-m3', '20200012', @pwd_student, 'Cahyo Pratama', 'student', NOW(), TRUE),
('u-m4', '20200013', @pwd_student, 'Dina Marlina', 'student', NOW(), TRUE),
('u-m5', '20200014', @pwd_student, 'Eka Saputra', 'student', NOW(), TRUE),
('u-m6', '20200015', @pwd_student, 'Fajar Nugroho', 'student', NOW(), TRUE),
('u-m7', '20200016', @pwd_student, 'Gita Dewi', 'student', NOW(), TRUE),
('u-m8', '20200017', @pwd_student, 'Hendra Kurniawan', 'student', NOW(), TRUE),
('u-m9', '20200018', @pwd_student, 'Indah Permata', 'student', NOW(), TRUE),
('u-m10', '20200019', @pwd_student, 'Joko Susilo', 'student', NOW(), TRUE);

-- =====================================================================
-- 2. STUDENTS (10 alumni)
-- =====================================================================
INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('m1', '20200010', 'Andi Wijaya', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'andi.wijaya@gmail.com', '081234560001', 'u-m1', TRUE, NOW(), NOW()),
('m2', '20200011', 'Bella Kusuma', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'bella.kusuma@gmail.com', '081234560002', 'u-m2', TRUE, NOW(), NOW()),
('m3', '20200012', 'Cahyo Pratama', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'cahyo.pratama@gmail.com', '081234560003', 'u-m3', TRUE, NOW(), NOW()),
('m4', '20200013', 'Dina Marlina', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'dina.marlina@gmail.com', '081234560004', 'u-m4', TRUE, NOW(), NOW()),
('m5', '20200014', 'Eka Saputra', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'eka.saputra@gmail.com', '081234560005', 'u-m5', TRUE, NOW(), NOW()),
('m6', '20200015', 'Fajar Nugroho', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'fajar.nugroho@gmail.com', '081234560006', 'u-m6', TRUE, NOW(), NOW()),
('m7', '20200016', 'Gita Dewi', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'gita.dewi@gmail.com', '081234560007', 'u-m7', TRUE, NOW(), NOW()),
('m8', '20200017', 'Hendra Kurniawan', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'hendra.kurniawan@gmail.com', '081234560008', 'u-m8', TRUE, NOW(), NOW()),
('m9', '20200018', 'Indah Permata', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'indah.permata@gmail.com', '081234560009', 'u-m9', TRUE, NOW(), NOW()),
('m10', '20200019', 'Joko Susilo', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'joko.susilo@gmail.com', '081234560010', 'u-m10', TRUE, NOW(), NOW());

-- =====================================================================
-- 3. TRACER STUDY
-- =====================================================================
-- m1, m2, m3, m4 = bekerja (working)
-- m5, m6, m7 = wirausaha (entrepreneur)
-- m8, m9 = bekerja sambil wirausaha (working + catatan usaha sampingan di ringkasan)
-- m10 = job_seeking (sedang mencari kerja)

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, employment_data, bersedia_dihubungi, created_at, updated_at) VALUES
('t-m1', 'm1', 'andi.wijaya@gmail.com', '081234560001', '@andiwijaya', 'linkedin.com/in/andiwijaya', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Bank Mandiri', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Perbankan', 'jabatan', 'Staff Operasional', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW()),
('t-m2', 'm2', 'bella.kusuma@gmail.com', '081234560002', '@bellakusuma', 'linkedin.com/in/bellakusuma', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Telkom Indonesia', 'lokasi_perusahaan', 'Bandung', 'bidang_industri', 'Telekomunikasi', 'jabatan', 'Customer Service', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW()),
('t-m3', 'm3', 'cahyo.pratama@gmail.com', '081234560003', '@cahyopratama', 'linkedin.com/in/cahyopratama', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Astra International', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Otomotif', 'jabatan', 'Admin Sales', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW()),
('t-m4', 'm4', 'dina.marlina@gmail.com', '081234560004', '@dinamarlina', 'linkedin.com/in/dinamarlina', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Unilever Indonesia', 'lokasi_perusahaan', 'Tangerang', 'bidang_industri', 'FMCG', 'jabatan', 'Marketing Support', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW());

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, entrepreneurship_data, bersedia_dihubungi, created_at, updated_at) VALUES
('t-m5', 'm5', 'eka.saputra@gmail.com', '081234560005', '@ekasaputra', 'linkedin.com/in/ekasaputra', 'entrepreneur', 2024,
  JSON_OBJECT('nama_usaha', 'Warung Makan Sejahtera', 'jenis_usaha', 'Kuliner', 'lokasi_usaha', 'Semarang', 'tahun_mulai_usaha', 2023, 'punya_karyawan', TRUE, 'jumlah_karyawan', 4, 'usaha_aktif', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW()),
('t-m6', 'm6', 'fajar.nugroho@gmail.com', '081234560006', '@fajarnugroho', 'linkedin.com/in/fajarnugroho', 'entrepreneur', 2024,
  JSON_OBJECT('nama_usaha', 'Toko Elektronik Fajar', 'jenis_usaha', 'Retail', 'lokasi_usaha', 'Semarang', 'tahun_mulai_usaha', 2024, 'punya_karyawan', TRUE, 'jumlah_karyawan', 2, 'usaha_aktif', TRUE, 'relevansi_kompetensi', 'cukup_relevan'), TRUE, NOW(), NOW()),
('t-m7', 'm7', 'gita.dewi@gmail.com', '081234560007', '@gitadewi', 'linkedin.com/in/gitadewi', 'entrepreneur', 2024,
  JSON_OBJECT('nama_usaha', 'Studio Foto Gita', 'jenis_usaha', 'Jasa', 'lokasi_usaha', 'Salatiga', 'tahun_mulai_usaha', 2023, 'punya_karyawan', FALSE, 'usaha_aktif', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW());

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, employment_data, ringkasan_karir, bersedia_dihubungi, created_at, updated_at) VALUES
('t-m8', 'm8', 'hendra.kurniawan@gmail.com', '081234560008', '@hendrakurniawan', 'linkedin.com/in/hendrakurniawan', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Sumber Alfaria Trijaya', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Retail', 'jabatan', 'Supervisor', 'tahun_mulai_kerja', 2023, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'),
  'Bekerja full time di Alfamart; sambil mengembangkan usaha jasa titip online di Semarang.', TRUE, NOW(), NOW()),
('t-m9', 'm9', 'indah.permata@gmail.com', '081234560009', '@indahpermata', 'linkedin.com/in/indahpermata', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'Dinas Perdagangan Kota Semarang', 'lokasi_perusahaan', 'Semarang', 'bidang_industri', 'Pemerintahan', 'jabatan', 'Staf Administrasi', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'),
  'PNS; di luar jam kerja mengelola toko online kerajinan tangan.', TRUE, NOW(), NOW());

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, job_seeking_data, bersedia_dihubungi, created_at, updated_at) VALUES
('t-m10', 'm10', 'joko.susilo@gmail.com', '081234560010', '@jokosusilo', 'linkedin.com/in/jokosusilo', 'job_seeking', 2024,
  JSON_OBJECT('lokasi_tujuan', 'Semarang', 'bidang_diincar', 'HRD & Administrasi', 'lama_mencari', 2), TRUE, NOW(), NOW());

-- =====================================================================
-- 4. ACHIEVEMENTS (prestasi per mahasiswa, kategori sesuai DB)
-- =====================================================================
-- Kategori di DB: event_participation, scientific_work, intellectual_property,
-- applied_academic, entrepreneurship, self_development
-- Subkategori: competition, seminar, journal_publication, patent, internship,
-- course_portfolio, active_business, workshop, volunteer

-- Andi Wijaya (bekerja) - lomba, seminar, magang
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m1-1', 'm1', 'event_participation', 'competition', 'Lomba Debat Bisnis Regional', 'Kompetisi debat bisnis tingkat Jawa Tengah', '2023-05-10', 'Semarang', 'Unika Soegijapranata', 'regional', 'Juara 3', TRUE, NOW(), NOW()),
('a-m1-2', 'm1', 'event_participation', 'seminar', 'Seminar Manajemen Keuangan', 'Pelatihan manajemen keuangan untuk mahasiswa', '2023-09-12', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m1-3', 'm1', 'applied_academic', 'internship', 'Magang PT Bank Mandiri', 'Magang divisi operasional selama 3 bulan', '2023-07-01', 'Jakarta', 'PT Bank Mandiri', 'nasional', NULL, TRUE, NOW(), NOW());

-- Bella Kusuma (bekerja) - seminar, publikasi
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m2-1', 'm2', 'event_participation', 'seminar', 'Webinar Digital Marketing', 'Peserta webinar nasional digital marketing', '2023-08-20', 'Online', 'Kemendikbud', 'nasional', NULL, TRUE, NOW(), NOW()),
('a-m2-2', 'm2', 'scientific_work', 'journal_publication', 'Pengaruh Media Sosial terhadap Keputusan Pembelian', 'Artikel di Jurnal Ilmiah Manajemen', '2024-01-15', 'Online', 'Jurnal UGM', 'nasional', NULL, TRUE, NOW(), NOW());

-- Cahyo Pratama (bekerja) - lomba, organisasi
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m3-1', 'm3', 'event_participation', 'competition', 'Business Case Competition', 'Juara 2 tingkat politeknik', '2023-11-05', 'Semarang', 'Polines', 'lokal', 'Juara 2', TRUE, NOW(), NOW()),
('a-m3-2', 'm3', 'self_development', 'volunteer', 'Ketua HIMA ABT 2022/2023', 'Kepemimpinan organisasi kemahasiswaan', '2022-09-01', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW());

-- Dina Marlina (bekerja) - pengembangan, portofolio
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m4-1', 'm4', 'self_development', 'workshop', 'Workshop Excel untuk Analisis Data', 'Sertifikasi workshop Excel tingkat lanjut', '2023-06-18', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m4-2', 'm4', 'applied_academic', 'course_portfolio', 'Proyek Analisis Pasar FMCG', 'Portofolio proyek mata kuliah Manajemen Pemasaran', '2023-12-01', 'Semarang', 'Polines', 'lokal', NULL, FALSE, NOW(), NOW());

-- Eka Saputra (wirausaha) - wirausaha, seminar
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m5-1', 'm5', 'entrepreneurship', 'active_business', 'Warung Makan Sejahtera', 'Usaha kuliner yang didirikan sejak 2023', '2023-03-01', 'Semarang', 'Pribadi', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m5-2', 'm5', 'event_participation', 'seminar', 'Seminar Kewirausahaan Polines', 'Peserta seminar kewirausahaan mahasiswa', '2022-10-12', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW());

-- Fajar Nugroho (wirausaha) - lomba wirausaha, magang
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m6-1', 'm6', 'event_participation', 'competition', 'Lomba Wirausaha Muda', 'Finalis lomba wirausaha tingkat regional', '2023-07-22', 'Semarang', 'Kadin Jateng', 'regional', 'Finalis', TRUE, NOW(), NOW()),
('a-m6-2', 'm6', 'applied_academic', 'internship', 'Magang di Toko Elektronik', 'Magang penjualan dan stok barang', '2022-08-01', 'Semarang', 'Toko Elektronik Fajar', 'lokal', NULL, TRUE, NOW(), NOW());

-- Gita Dewi (wirausaha) - portofolio, pengembangan
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m7-1', 'm7', 'applied_academic', 'course_portfolio', 'Portofolio Fotografi Komersial', 'Kumpulan hasil pemotretan produk dan event', '2023-09-10', 'Salatiga', 'Pribadi', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m7-2', 'm7', 'self_development', 'workshop', 'Workshop Fotografi Dasar', 'Pelatihan fotografi untuk pemula', '2022-11-05', 'Semarang', 'Komunitas Fotografi', 'lokal', NULL, FALSE, NOW(), NOW());

-- Hendra Kurniawan (bekerja sambil wirausaha) - organisasi, seminar
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m8-1', 'm8', 'self_development', 'volunteer', 'Bendahara BEM Polines', 'Pengurus BEM periode 2022/2023', '2022-09-01', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m8-2', 'm8', 'event_participation', 'seminar', 'Seminar Jasa Titip Online', 'Pemateri tamu sharing bisnis jastip', '2024-02-14', 'Semarang', 'Polines', 'lokal', NULL, TRUE, NOW(), NOW());

-- Indah Permata (bekerja sambil wirausaha) - publikasi, lomba
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m9-1', 'm9', 'scientific_work', 'journal_publication', 'Strategi Pemasaran Kerajinan Tangan Lokal', 'Artikel jurnal ilmiah manajemen', '2024-01-20', 'Online', 'Jurnal Unnes', 'nasional', NULL, TRUE, NOW(), NOW()),
('a-m9-2', 'm9', 'event_participation', 'competition', 'Lomba Karya Tulis Ilmiah', 'Juara 1 LKTI tingkat prodi', '2023-04-08', 'Semarang', 'Polines', 'lokal', 'Juara 1', TRUE, NOW(), NOW());

-- Tambahan pagelaran/presentasi untuk Diseminasi Ilmiah Mahasiswa (tab Pagelaran/Presentasi)
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m2-3', 'm2', 'event_participation', 'conference', 'Presentasi Konferensi Manajemen Terapan', 'Presentasi hasil studi kasus bisnis digital pada konferensi nasional', '2025-03-18', 'Yogyakarta', 'Forum Dosen ABT Indonesia', 'nasional', NULL, TRUE, NOW(), NOW()),
('a-m6-3', 'm6', 'event_participation', 'expo', 'Pameran Produk Inovasi Mahasiswa', 'Menampilkan prototipe produk layanan digital pada expo kampus', '2025-08-10', 'Semarang', 'Politeknik Negeri Semarang', 'regional', NULL, TRUE, NOW(), NOW()),
('a-m8-3', 'm8', 'event_participation', 'pagelaran', 'Pagelaran Presentasi Riset UMKM', 'Sesi presentasi terbuka hasil riset pendampingan UMKM', '2026-01-22', 'Semarang', 'Dinas Koperasi Kota Semarang', 'nasional', NULL, TRUE, NOW(), NOW());

-- Joko Susilo (sedang mencari kerja) - magang, pengembangan
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('a-m10-1', 'm10', 'applied_academic', 'internship', 'Magang HRD PT Sumber Jaya', 'Magang divisi rekrutmen 2 bulan', '2023-10-01', 'Semarang', 'PT Sumber Jaya', 'lokal', NULL, TRUE, NOW(), NOW()),
('a-m10-2', 'm10', 'self_development', 'workshop', 'Pelatihan MS Office untuk Administrasi', 'Sertifikasi pelatihan administrasi perkantoran', '2023-08-15', 'Semarang', 'BLK Semarang', 'lokal', NULL, TRUE, NOW(), NOW());

-- =====================================================================
-- Selesai. Login mahasiswa: NIM (contoh 20200010) / password: student123
-- =====================================================================
