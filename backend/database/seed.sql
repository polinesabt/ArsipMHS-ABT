-- =====================================================================
-- Arsip Mahasiswa Prodi ABT - Seed Data
-- Initial data for testing and demo purposes
-- =====================================================================
-- Password hashes: All demo accounts use bcrypt-hashed passwords
-- Admin: "admin123" -> $2y$10$... (bcrypt)
-- Students: "student123" -> $2y$10$... (bcrypt)
-- NOTE: These are DEMO hashes. In production, use proper bcrypt hashing
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- ADMIN USERS
-- =====================================================================

INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('admin-001', 'admin', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Administrator ARSIP MAHASISWA ABT', 'admin', '2024-01-01 08:00:00', TRUE);

INSERT INTO admins (id, created_at) VALUES
('admin-001', '2024-01-01 08:00:00');

-- =====================================================================
-- STUDENT USERS & PROFILES
-- =====================================================================

-- ALUMNI (dapat akses tracer study & achievements)
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('user-s1', 's1', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Ahmad Rizki Pratama', 'student', '2023-08-15 10:00:00', TRUE),
('user-s2', 's2', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Siti Nurhaliza', 'student', '2023-08-16 10:00:00', TRUE),
('user-s3', 's3', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Budi Santoso', 'student', '2024-08-17 10:00:00', TRUE),
('user-s4', 's4', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Dewi Lestari', 'student', '2024-08-18 10:00:00', TRUE);

INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('s1', '20190001', 'Ahmad Rizki Pratama', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2019, 2023, 'ahmad.rizki@gmail.com', '081234567890', 'user-s1', TRUE, '2019-08-15 08:00:00', '2024-03-15 10:00:00'),
('s2', '20190002', 'Siti Nurhaliza', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2019, 2023, 'siti.nurhaliza@gmail.com', '081234567891', 'user-s2', TRUE, '2019-08-15 08:00:00', '2024-02-20 10:00:00'),
('s3', '20200001', 'Budi Santoso', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'budi.santoso@gmail.com', '081234567892', 'user-s3', TRUE, '2020-08-15 08:00:00', '2024-06-15 10:00:00'),
('s4', '20200002', 'Dewi Lestari', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'alumni', 2020, 2024, 'dewi.lestari@gmail.com', '081234567893', 'user-s4', TRUE, '2020-08-15 08:00:00', '2024-07-10 10:00:00');

-- ACTIVE STUDENTS (dapat akses achievements, no tracer study)
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('user-s5', 's5', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Eko Prasetyo', 'student', '2021-08-15 10:00:00', TRUE),
('user-s6', 's6', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Fitri Handayani', 'student', '2021-08-16 10:00:00', TRUE),
('user-s7', 's7', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Gunawan Wibowo', 'student', '2022-08-17 10:00:00', TRUE);

INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('s5', '20210001', 'Eko Prasetyo', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, NULL, 'eko.prasetyo@student.polines.ac.id', '081234567894', 'user-s5', TRUE, '2021-08-15 08:00:00', '2024-09-01 10:00:00'),
('s6', '20210002', 'Fitri Handayani', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, NULL, 'fitri.handayani@student.polines.ac.id', '081234567895', 'user-s6', TRUE, '2021-08-15 08:00:00', '2024-09-01 10:00:00'),
('s7', '20220001', 'Gunawan Wibowo', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2022, NULL, 'gunawan.wibowo@student.polines.ac.id', '081234567896', 'user-s7', TRUE, '2022-08-15 08:00:00', '2024-09-01 10:00:00');

-- ON LEAVE STUDENTS
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('user-s8', 's8', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Hana Safira', 'student', '2022-08-18 10:00:00', TRUE);

INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('s8', '20220002', 'Hana Safira', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'on_leave', 2022, NULL, 'hana.safira@student.polines.ac.id', '081234567897', 'user-s8', TRUE, '2022-08-15 08:00:00', '2024-06-01 10:00:00');

-- DROPOUT STUDENTS
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('user-s13', 's13', '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG', 'Rudi Hermawan', 'student', '2020-08-19 10:00:00', TRUE);

INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('s13', '20200005', 'Rudi Hermawan', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'dropout', 2020, NULL, 'rudi.hermawan@gmail.com', '081234567912', 'user-s13', TRUE, '2020-08-15 08:00:00', '2023-03-01 10:00:00');

-- =====================================================================
-- TRACER STUDY DATA (Alumni Only)
-- =====================================================================

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, employment_data, bersedia_dihubungi, saran_komentar, created_at, updated_at) VALUES
('t1', 's1', 'ahmad.rizki@gmail.com', '081234567890', '@ahmadrizki', 'linkedin.com/in/ahmadrizki', 'working', 2024, 
  JSON_OBJECT(
    'nama_perusahaan', 'PT Maju Jaya Indonesia',
    'lokasi_perusahaan', 'Jakarta',
    'bidang_industri', 'Teknologi',
    'jabatan', 'Business Analyst',
    'tahun_mulai_kerja', 2023,
    'masih_aktif_kerja', TRUE,
    'relevansi_kompetensi', 'sangat_relevan'
  ), TRUE, 'Program rekrutmen alumni sangat membantu karir saya', '2024-02-01 09:00:00', '2024-02-01 09:00:00');

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, entrepreneurship_data, bersedia_dihubungi, saran_komentar, created_at, updated_at) VALUES
('t2', 's2', 'siti.nurhaliza@gmail.com', '081234567891', '@sitinh', 'linkedin.com/in/sitinh', 'entrepreneur', 2024,
  JSON_OBJECT(
    'nama_usaha', 'Toko Online Batik Nusantara',
    'jenis_usaha', 'E-commerce',
    'lokasi_usaha', 'Semarang',
    'tahun_mulai_usaha', 2023,
    'punya_karyawan', TRUE,
    'jumlah_karyawan', 5,
    'usaha_aktif', TRUE,
    'relevansi_kompetensi', 'relevan',
    'sosial_media_usaha', '["@batik_nusantara", "@toko_batik_online"]'
  ), TRUE, 'Entrepreneurship course di kampus sangat membantu startup saya', '2024-01-15 10:30:00', '2024-01-15 10:30:00');

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, further_study_data, bersedia_dihubungi, saran_komentar, created_at, updated_at) VALUES
('t3', 's3', 'budi.santoso@gmail.com', '081234567892', '@budis', 'linkedin.com/in/budis', 'further_study', 2024,
  JSON_OBJECT(
    'nama_kampus', 'Universitas Indonesia',
    'program_studi', 'Manajemen Bisnis',
    'jenjang', 'S2',
    'lokasi_kampus', 'Jakarta',
    'tahun_mulai_studi', 2024,
    'masih_aktif_studi', TRUE,
    'relevansi_kompetensi', 'sangat_relevan'
  ), TRUE, 'Pendidikan berkelanjutan membuka peluang karir lebih luas', '2024-01-20 11:00:00', '2024-01-20 11:00:00');

INSERT INTO tracer_study (id, student_id, email, no_hp, media_sosial, linkedin, career_status, tahun_pengisian, job_seeking_data, bersedia_dihubungi, saran_komentar, created_at, updated_at) VALUES
('t4', 's4', 'dewi.lestari@gmail.com', '081234567893', '@dewil', 'linkedin.com/in/dewil', 'job_seeking', 2024,
  JSON_OBJECT(
    'lokasi_tujuan', 'Bandung',
    'bidang_diincar', 'Finance & Accounting',
    'lama_mencari', 3
  ), TRUE, 'Ingin mencari pekerjaan di bidang keuangan dengan perusahaan multinasional', '2024-02-10 14:00:00', '2024-02-10 14:00:00');

-- =====================================================================
-- ACHIEVEMENTS DATA
-- =====================================================================

-- Ahmad Rizki's Achievements
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('ach-001', 's1', 'event_participation', 'competition', 'Lomba Debat Ekonomi Nasional', 'Kompetisi debat ekonomi tingkat nasional dengan peserta dari 50+ universitas', '2023-06-15', 'Jakarta', 'Universitas Indonesia', 'nasional', 'Juara 2', TRUE, '2023-06-15 10:00:00', '2023-06-15 10:00:00'),
('ach-002', 's1', 'event_participation', 'seminar', 'Seminar Digital Marketing 4.0', 'Pelatihan intensif digital marketing bersertifikasi Google', '2023-08-20', 'Jakarta', 'Google Indonesia', 'nasional', NULL, TRUE, '2023-08-20 10:00:00', '2023-08-20 10:00:00'),
('ach-003', 's1', 'scientific_work', 'journal_publication', 'Analisis Pengaruh Digital Marketing terhadap UMKM di Era Pandemi', 'Publikasi di Jurnal Bisnis dan Manajemen Indonesia', '2023-09-01', 'Online', 'Jurnal Bisnis Indonesia', 'nasional', NULL, TRUE, '2023-09-01 10:00:00', '2023-09-01 10:00:00');

-- Siti Nurhaliza's Achievements
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('ach-004', 's2', 'event_participation', 'seminar', 'Workshop Kewirausahaan Mahasiswa', 'Berbagi pengalaman membangun startup kepada mahasiswa baru', '2024-02-10', 'Semarang', 'Polines', 'lokal', NULL, TRUE, '2024-02-10 10:00:00', '2024-02-10 10:00:00'),
('ach-005', 's2', 'entrepreneurship', 'active_business', 'Toko Online Batik Nusantara', 'E-commerce business specializing in batik products', '2023-03-01', 'Semarang', 'Pribadi', 'regional', NULL, FALSE, '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- Budi Santoso's Achievements
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('ach-006', 's3', 'event_participation', 'competition', 'Business Plan Competition', 'Kompetisi rencana bisnis tingkat regional Jawa Tengah', '2023-10-05', 'Semarang', 'Bank Indonesia', 'regional', 'Finalis', TRUE, '2023-10-05 10:00:00', '2023-10-05 10:00:00');

-- Eko Prasetyo's Achievements (Active Student)
INSERT INTO achievements (id, student_id, category, subcategory, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at) VALUES
('ach-007', 's5', 'self_development', 'certification', 'Google Analytics Certification', 'Professional Google Analytics Certification', '2024-03-15', 'Online', 'Google', 'internasional', NULL, FALSE, '2024-03-15 10:00:00', '2024-03-15 10:00:00'),
('ach-008', 's5', 'event_participation', 'workshop', 'Digital Marketing Workshop', 'Workshop tentang strategi digital marketing modern', '2024-04-20', 'Semarang', 'Polines', 'lokal', NULL, FALSE, '2024-04-20 10:00:00', '2024-04-20 10:00:00');

-- =====================================================================
-- EVALUATION ASPECTS (Graduate Satisfaction Survey)
-- =====================================================================

INSERT INTO evaluation_aspects (id, code, name, sort_order, is_active, created_at, updated_at) VALUES
('asp-001', 'etika', 'Etika', 1, TRUE, NOW(), NOW()),
('asp-002', 'kompetensi_utama', 'Keahlian pada bidang ilmu (kompetensi utama)', 2, TRUE, NOW(), NOW()),
('asp-003', 'bahasa_asing', 'Kemampuan berbahasa asing', 3, TRUE, NOW(), NOW()),
('asp-004', 'teknologi_informasi', 'Penggunaan teknologi informasi', 4, TRUE, NOW(), NOW()),
('asp-005', 'komunikasi', 'Kemampuan berkomunikasi', 5, TRUE, NOW(), NOW()),
('asp-006', 'kerjasama', 'Kerjasama', 6, TRUE, NOW(), NOW()),
('asp-007', 'pengembangan_diri', 'Pengembangan diri', 7, TRUE, NOW(), NOW()),
('asp-008', 'loyalitas_tujuan', 'Loyalitas terhadap tujuan perusahaan', 8, TRUE, NOW(), NOW()),
('asp-009', 'integritas_pergaulan', 'Integritas diri dalam pergaulan di perusahaan', 9, TRUE, NOW(), NOW()),
('asp-010', 'manajemen_waktu', 'Kemampuan mengelola waktu kerja', 10, TRUE, NOW(), NOW());

-- =====================================================================
-- END OF SEED DATA
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 1;
