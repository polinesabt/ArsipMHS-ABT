-- =====================================================================
-- Seed Demo Chart: 10 Mahasiswa (7 Bekerja + 3 Aktif) + Prestasi
-- =====================================================================
-- Untuk melihat chart di dashboard insight:
-- - 7 mahasiswa alumni yang BEKERJA (tracer_study career_status = working)
-- - 3 mahasiswa AKTIF (status active, tahun_lulus NULL)
-- - Setiap mahasiswa punya minimal 1 prestasi
--
-- Jalankan setelah install.sql (database arsipmhs sudah ada).
-- Password login mahasiswa: student123
--
-- PENTING: Jika Anda sudah pernah menjalankan seed-10-mahasiswa.sql,
-- script ini akan MENGHAPUS data seed lama (m1-m10) lalu mengisi ulang
-- dengan komposisi 7 bekerja + 3 aktif. Jangan jalankan di production
-- yang sudah berisi data penting.
-- =====================================================================

USE arsipmhs;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Hash untuk password "student123"
SET @pwd_student = '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG';

-- =====================================================================
-- 1. USERS (10 mahasiswa) - REPLACE agar bisa dijalankan ulang
-- =====================================================================
REPLACE INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
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
-- 2. STUDENTS: 7 alumni + 3 mahasiswa aktif
-- =====================================================================
-- m1-m7: alumni (tahun_lulus 2024) → nanti isi tracer "bekerja"
-- m8-m10: status active, tahun_lulus NULL (mahasiswa aktif)
REPLACE INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('m1', '20200010', 'Andi Wijaya', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'andi.wijaya@gmail.com', '081234560001', 'u-m1', TRUE, NOW(), NOW()),
('m2', '20200011', 'Bella Kusuma', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'bella.kusuma@gmail.com', '081234560002', 'u-m2', TRUE, NOW(), NOW()),
('m3', '20200012', 'Cahyo Pratama', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'cahyo.pratama@gmail.com', '081234560003', 'u-m3', TRUE, NOW(), NOW()),
('m4', '20200013', 'Dina Marlina', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'dina.marlina@gmail.com', '081234560004', 'u-m4', TRUE, NOW(), NOW()),
('m5', '20200014', 'Eka Saputra', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'eka.saputra@gmail.com', '081234560005', 'u-m5', TRUE, NOW(), NOW()),
('m6', '20200015', 'Fajar Nugroho', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'fajar.nugroho@gmail.com', '081234560006', 'u-m6', TRUE, NOW(), NOW()),
('m7', '20200016', 'Gita Dewi', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'gita.dewi@gmail.com', '081234560007', 'u-m7', TRUE, NOW(), NOW()),
('m8', '20200017', 'Hendra Kurniawan', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2022, NULL, 'hendra.kurniawan@gmail.com', '081234560008', 'u-m8', TRUE, NOW(), NOW()),
('m9', '20200018', 'Indah Permata', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2022, NULL, 'indah.permata@gmail.com', '081234560009', 'u-m9', TRUE, NOW(), NOW()),
('m10', '20200019', 'Joko Susilo', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, NULL, 'joko.susilo@gmail.com', '081234560010', 'u-m10', TRUE, NOW(), NOW());

-- =====================================================================
-- 3. TRACER STUDY (hanya 7 alumni yang BEKERJA)
-- =====================================================================
REPLACE INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, employment_data, bersedia_dihubungi, created_at, updated_at) VALUES
('t-m1', 'm1', 'andi.wijaya@gmail.com', '081234560001', '@andiwijaya', 'linkedin.com/in/andiwijaya', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Bank Mandiri', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Perbankan', 'jabatan', 'Staff Operasional', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW()),
('t-m2', 'm2', 'bella.kusuma@gmail.com', '081234560002', '@bellakusuma', 'linkedin.com/in/bellakusuma', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Telkom Indonesia', 'lokasi_perusahaan', 'Bandung', 'bidang_industri', 'Telekomunikasi', 'jabatan', 'Customer Service', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW()),
('t-m3', 'm3', 'cahyo.pratama@gmail.com', '081234560003', '@cahyopratama', 'linkedin.com/in/cahyopratama', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Astra International', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Otomotif', 'jabatan', 'Admin Sales', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW()),
('t-m4', 'm4', 'dina.marlina@gmail.com', '081234560004', '@dinamarlina', 'linkedin.com/in/dinamarlina', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Unilever Indonesia', 'lokasi_perusahaan', 'Tangerang', 'bidang_industri', 'FMCG', 'jabatan', 'Marketing Support', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW()),
('t-m5', 'm5', 'eka.saputra@gmail.com', '081234560005', '@ekasaputra', 'linkedin.com/in/ekasaputra', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Sumber Alfaria Trijaya', 'lokasi_perusahaan', 'Jakarta', 'bidang_industri', 'Retail', 'jabatan', 'Supervisor', 'tahun_mulai_kerja', 2023, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW()),
('t-m6', 'm6', 'fajar.nugroho@gmail.com', '081234560006', '@fajarnugroho', 'linkedin.com/in/fajarnugroho', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'Dinas Perdagangan Kota Semarang', 'lokasi_perusahaan', 'Semarang', 'bidang_industri', 'Pemerintahan', 'jabatan', 'Staf Administrasi', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'relevan'), TRUE, NOW(), NOW()),
('t-m7', 'm7', 'gita.dewi@gmail.com', '081234560007', '@gitadewi', 'linkedin.com/in/gitadewi', 'working', 2024,
  JSON_OBJECT('nama_perusahaan', 'PT Bank BCA', 'lokasi_perusahaan', 'Semarang', 'bidang_industri', 'Perbankan', 'jabatan', 'Teller', 'tahun_mulai_kerja', 2024, 'masih_aktif_kerja', TRUE, 'relevansi_kompetensi', 'sangat_relevan'), TRUE, NOW(), NOW());

-- =====================================================================
-- 4. PRESTASI (insert ke tabel prestasi_* — view achievements baca dari sini)
-- =====================================================================
-- Hapus prestasi lama untuk mahasiswa seed (supaya bisa dijalankan ulang)
DELETE FROM prestasi_seminar WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_lomba WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_publikasi WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_magang WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_produk_mahasiswa WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_portofolio WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_wirausaha WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_pengembangan_diri WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');
DELETE FROM prestasi_organisasi WHERE id_mahasiswa IN ('m1','m2','m3','m4','m5','m6','m7','m8','m9','m10');

-- Lomba (event_participation + competition)
INSERT INTO prestasi_lomba (id_lomba, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_lomba, nama_lomba_norm, peran, tanggal_mulai, deskripsi) VALUES
('a-m1-1', 'm1', 'Lomba Debat Bisnis Regional', 'Kompetisi debat bisnis tingkat Jawa Tengah', '2023-05-10', 'Semarang', 'Unika Soegijapranata', 'regional', 'Juara 3', 'event_participation', 'competition', 'non_academic', TRUE, 'Lomba Debat Bisnis Regional', 'lomba debat bisnis regional', 'juara', '2023-05-10', 'Kompetisi debat bisnis tingkat Jawa Tengah'),
('a-m3-1', 'm3', 'Business Case Competition', 'Juara 2 tingkat politeknik', '2023-11-05', 'Semarang', 'Polines', 'lokal', 'Juara 2', 'event_participation', 'competition', 'non_academic', TRUE, 'Business Case Competition', 'business case competition', 'juara', '2023-11-05', 'Juara 2 tingkat politeknik'),
('a-m6-1', 'm6', 'Lomba Wirausaha Muda', 'Finalis lomba wirausaha tingkat regional', '2023-07-22', 'Semarang', 'Kadin Jateng', 'regional', 'Finalis', 'event_participation', 'competition', 'non_academic', TRUE, 'Lomba Wirausaha Muda', 'lomba wirausaha muda', 'peserta', '2023-07-22', 'Finalis lomba wirausaha tingkat regional'),
('a-m9-2', 'm9', 'Lomba Karya Tulis Ilmiah', 'Juara 1 LKTI tingkat prodi', '2023-04-08', 'Semarang', 'Polines', 'lokal', 'Juara 1', 'event_participation', 'competition', 'non_academic', TRUE, 'Lomba Karya Tulis Ilmiah', 'lomba karya tulis ilmiah', 'juara', '2023-04-08', 'Juara 1 LKTI tingkat prodi');

-- Seminar (event_participation + seminar)
INSERT INTO prestasi_seminar (id_seminar, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_seminar, nama_seminar_norm, penyelenggara_norm, peran_seminar, mode_seminar, tanggal_seminar, deskripsi) VALUES
('a-m1-2', 'm1', 'Seminar Manajemen Keuangan', 'Pelatihan manajemen keuangan untuk mahasiswa', '2023-09-12', 'Semarang', 'Polines', 'lokal', NULL, 'event_participation', 'seminar', 'non_academic', TRUE, 'Seminar Manajemen Keuangan', 'seminar manajemen keuangan', 'polines', 'peserta', 'offline', '2023-09-12', 'Pelatihan manajemen keuangan untuk mahasiswa'),
('a-m2-1', 'm2', 'Webinar Digital Marketing', 'Peserta webinar nasional digital marketing', '2023-08-20', 'Online', 'Kemendikbud', 'nasional', NULL, 'event_participation', 'seminar', 'non_academic', TRUE, 'Webinar Digital Marketing', 'webinar digital marketing', 'kemendikbud', 'peserta', 'online', '2023-08-20', 'Peserta webinar nasional digital marketing'),
('a-m5-2', 'm5', 'Seminar Kewirausahaan Polines', 'Peserta seminar kewirausahaan mahasiswa', '2022-10-12', 'Semarang', 'Polines', 'lokal', NULL, 'event_participation', 'seminar', 'non_academic', TRUE, 'Seminar Kewirausahaan Polines', 'seminar kewirausahaan polines', 'polines', 'peserta', 'offline', '2022-10-12', 'Peserta seminar kewirausahaan mahasiswa'),
('a-m8-2', 'm8', 'Seminar Jasa Titip Online', 'Pemateri tamu sharing bisnis jastip', '2024-02-14', 'Semarang', 'Polines', 'lokal', NULL, 'event_participation', 'seminar', 'non_academic', TRUE, 'Seminar Jasa Titip Online', 'seminar jasa titip online', 'polines', 'pembicara', 'offline', '2024-02-14', 'Pemateri tamu sharing bisnis jastip'),
('a-m2-3', 'm2', 'Presentasi Konferensi Manajemen Terapan', 'Presentasi hasil studi kasus bisnis digital pada konferensi nasional', '2025-03-18', 'Yogyakarta', 'Forum Dosen ABT Indonesia', 'nasional', NULL, 'event_participation', 'conference', 'non_academic', TRUE, 'Konferensi Manajemen Terapan 2025', 'konferensi manajemen terapan 2025', 'forum dosen abt indonesia', 'pembicara', 'offline', '2025-03-18', 'Presentasi hasil studi kasus bisnis digital pada konferensi nasional'),
('a-m6-3', 'm6', 'Pameran Produk Inovasi Mahasiswa', 'Menampilkan prototipe produk layanan digital pada expo kampus', '2025-08-10', 'Semarang', 'Politeknik Negeri Semarang', 'regional', NULL, 'event_participation', 'expo', 'non_academic', TRUE, 'ABT Innovation Expo 2025', 'abt innovation expo 2025', 'politeknik negeri semarang', 'peserta', 'offline', '2025-08-10', 'Menampilkan prototipe produk layanan digital pada expo kampus'),
('a-m8-3', 'm8', 'Pagelaran Presentasi Riset UMKM', 'Sesi presentasi terbuka hasil riset pendampingan UMKM', '2026-01-22', 'Semarang', 'Dinas Koperasi Kota Semarang', 'nasional', NULL, 'event_participation', 'pagelaran', 'non_academic', TRUE, 'Pagelaran Riset UMKM 2026', 'pagelaran riset umkm 2026', 'dinas koperasi kota semarang', 'pembicara', 'offline', '2026-01-22', 'Sesi presentasi terbuka hasil riset pendampingan UMKM');

-- Publikasi (scientific_work + journal_publication)
INSERT INTO prestasi_publikasi (id_publikasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, judul, judul_norm, jenis_publikasi, nama_jurnal_konferensi, nama_jurnal_konferensi_norm, penerbit, tahun_terbit, tanggal_terbit, deskripsi) VALUES
('a-m2-2', 'm2', 'Pengaruh Media Sosial terhadap Keputusan Pembelian', 'Artikel di Jurnal Ilmiah Manajemen', '2024-01-15', 'Online', 'Jurnal UGM', 'nasional', NULL, 'scientific_work', 'journal_publication', 'academic', TRUE, 'Pengaruh Media Sosial terhadap Keputusan Pembelian', 'pengaruh media sosial terhadap keputusan pembelian', 'artikel_jurnal', 'Jurnal UGM', 'jurnal ugm', 'Jurnal UGM', 2024, '2024-01-15', 'Artikel di Jurnal Ilmiah Manajemen'),
('a-m9-1', 'm9', 'Strategi Pemasaran Kerajinan Tangan Lokal', 'Artikel jurnal ilmiah manajemen', '2024-01-20', 'Online', 'Jurnal Unnes', 'nasional', NULL, 'scientific_work', 'journal_publication', 'academic', TRUE, 'Strategi Pemasaran Kerajinan Tangan Lokal', 'strategi pemasaran kerajinan tangan lokal', 'artikel_jurnal', 'Jurnal Unnes', 'jurnal unnes', 'Jurnal Unnes', 2024, '2024-01-20', 'Artikel jurnal ilmiah manajemen');

-- Magang (applied_academic + internship)
INSERT INTO prestasi_magang (id_magang, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_perusahaan, nama_perusahaan_norm, posisi, posisi_norm, industri, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi_tugas) VALUES
('a-m1-3', 'm1', 'Magang PT Bank Mandiri', 'Magang divisi operasional selama 3 bulan', '2023-07-01', 'Jakarta', 'PT Bank Mandiri', 'nasional', NULL, 'applied_academic', 'internship', 'non_academic', TRUE, 'PT Bank Mandiri', 'pt bank mandiri', 'Operasional', 'operasional', 'Perbankan', '2023-07-01', NULL, FALSE, 'Magang divisi operasional selama 3 bulan'),
('a-m6-2', 'm6', 'Magang di Toko Elektronik', 'Magang penjualan dan stok barang', '2022-08-01', 'Semarang', 'Toko Elektronik Fajar', 'lokal', NULL, 'applied_academic', 'internship', 'non_academic', TRUE, 'Toko Elektronik Fajar', 'toko elektronik fajar', 'Penjualan', 'penjualan', 'Retail', '2022-08-01', NULL, FALSE, 'Magang penjualan dan stok barang'),
('a-m10-1', 'm10', 'Magang HRD PT Sumber Jaya', 'Magang divisi rekrutmen 2 bulan', '2023-10-01', 'Semarang', 'PT Sumber Jaya', 'lokal', NULL, 'applied_academic', 'internship', 'non_academic', TRUE, 'PT Sumber Jaya', 'pt sumber jaya', 'Rekrutmen', 'rekrutmen', 'Umum', '2023-10-01', NULL, FALSE, 'Magang divisi rekrutmen 2 bulan');

-- Portofolio (applied_academic + course_portfolio)
INSERT INTO prestasi_portofolio (id_portofolio, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, judul_proyek, judul_proyek_norm, mata_kuliah_norm, tahun, semester, deskripsi_proyek) VALUES
('a-m4-2', 'm4', 'Proyek Analisis Pasar FMCG', 'Portofolio proyek mata kuliah Manajemen Pemasaran', '2023-12-01', 'Semarang', 'Polines', 'lokal', NULL, 'applied_academic', 'course_portfolio', 'academic', TRUE, 'Proyek Analisis Pasar FMCG', 'proyek analisis pasar fmcg', 'manajemen pemasaran', 2023, 'ganjil', 'Portofolio proyek mata kuliah Manajemen Pemasaran'),
('a-m7-1', 'm7', 'Portofolio Fotografi Komersial', 'Kumpulan hasil pemotretan produk dan event', '2023-09-10', 'Salatiga', 'Pribadi', 'lokal', NULL, 'applied_academic', 'course_portfolio', 'academic', TRUE, 'Portofolio Fotografi Komersial', 'portofolio fotografi komersial', 'fotografi', 2023, 'ganjil', 'Kumpulan hasil pemotretan produk dan event');

-- Produk Mahasiswa (applied_academic + canonical key)
INSERT INTO prestasi_produk_mahasiswa (id_produk_mahasiswa, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_produk, nama_produk_norm, kategori_produk) VALUES
('a-m9-p1', 'm9', 'Aplikasi Arsip UMKM', 'Produk layanan digital mahasiswa yang diadopsi oleh UMKM lokal.', '2024-09-01', 'Semarang', 'Dinas Koperasi Kota Semarang', 'lokal', NULL, 'applied_academic', 'layanan_digital', 'non_academic', TRUE, 'Aplikasi Arsip UMKM', 'aplikasi arsip umkm', 'layanan_digital');

-- Wirausaha (entrepreneurship + active_business)
INSERT INTO prestasi_wirausaha (id_wirausaha, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_usaha, nama_usaha_norm, jenis_usaha, lokasi_norm, tahun_mulai, masih_aktif, deskripsi_usaha) VALUES
('a-m5-1', 'm5', 'Warung Makan Sejahtera', 'Usaha kuliner yang didirikan sejak 2023', '2023-03-01', 'Semarang', 'Pribadi', 'lokal', NULL, 'entrepreneurship', 'active_business', 'non_academic', TRUE, 'Warung Makan Sejahtera', 'warung makan sejahtera', 'Kuliner', 'semarang', 2023, TRUE, 'Usaha kuliner yang didirikan sejak 2023');

-- Pengembangan diri (self_development + workshop)
INSERT INTO prestasi_pengembangan_diri (id_pengembangan_diri, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_program, nama_program_norm, jenis_program, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi) VALUES
('a-m4-1', 'm4', 'Workshop Excel untuk Analisis Data', 'Sertifikasi workshop Excel tingkat lanjut', '2023-06-18', 'Semarang', 'Polines', 'lokal', NULL, 'self_development', 'workshop', 'non_academic', TRUE, 'Workshop Excel untuk Analisis Data', 'workshop excel untuk analisis data', 'pelatihan', '2023-06-18', NULL, FALSE, 'Sertifikasi workshop Excel tingkat lanjut'),
('a-m7-2', 'm7', 'Workshop Fotografi Dasar', 'Pelatihan fotografi untuk pemula', '2022-11-05', 'Semarang', 'Komunitas Fotografi', 'lokal', NULL, 'self_development', 'workshop', 'non_academic', TRUE, 'Workshop Fotografi Dasar', 'workshop fotografi dasar', 'pelatihan', '2022-11-05', NULL, FALSE, 'Pelatihan fotografi untuk pemula'),
('a-m10-2', 'm10', 'Pelatihan MS Office untuk Administrasi', 'Sertifikasi pelatihan administrasi perkantoran', '2023-08-15', 'Semarang', 'BLK Semarang', 'lokal', NULL, 'self_development', 'workshop', 'non_academic', TRUE, 'Pelatihan MS Office untuk Administrasi', 'pelatihan ms office untuk administrasi', 'pelatihan', '2023-08-15', NULL, FALSE, 'Sertifikasi pelatihan administrasi perkantoran');

-- Organisasi (self_development + volunteer)
INSERT INTO prestasi_organisasi (id_organisasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, category, subcategory, achievement_type, verified, nama_organisasi, nama_organisasi_norm, jenis_organisasi, jabatan, jabatan_norm, tanggal_mulai, tanggal_selesai, masih_aktif, deskripsi) VALUES
('a-m3-2', 'm3', 'Ketua HIMA ABT 2022/2023', 'Kepemimpinan organisasi kemahasiswaan', '2022-09-01', 'Semarang', 'Polines', 'lokal', NULL, 'self_development', 'volunteer', 'non_academic', TRUE, 'HIMA ABT', 'hima abt', 'kampus', 'Ketua', 'ketua', '2022-09-01', NULL, TRUE, 'Kepemimpinan organisasi kemahasiswaan'),
('a-m8-1', 'm8', 'Bendahara BEM Polines', 'Pengurus BEM periode 2022/2023', '2022-09-01', 'Semarang', 'Polines', 'lokal', NULL, 'self_development', 'volunteer', 'non_academic', TRUE, 'BEM Polines', 'bem polines', 'kampus', 'Bendahara', 'bendahara', '2022-09-01', NULL, TRUE, 'Pengurus BEM periode 2022/2023');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Selesai.
-- Ringkasan: 7 alumni bekerja (tracer working), 3 mahasiswa aktif.
-- Semua 10 punya prestasi. Login: NIM (20200010–20200019) / password: student123
-- =====================================================================
