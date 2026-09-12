-- =====================================================================
-- ARSIP MAHASISWA & DOSEN PRODI ABT - POLITEKNIK NEGERI SEMARANG
-- MASTER DATABASE SCHEMA (FULL STRUCTURE, ZERO DATA / TANPA ISI)
-- =====================================================================
-- File ini berisi seluruh struktur database (69 Tabel + 4 View) tanpa data,
-- menggunakan metode IF NOT EXISTS dan idempotent column synchronization.
-- Tujuan: Menjamin 100% keselarasan struktur antara Development & Production.
--
-- Data yang ikut terpindah HANYA akun demo resmi:
--   Username : demo
--   Password : demo123
--
-- Panduan Penggunaan:
-- 1. Melalui phpMyAdmin:
--    Pilih/klik database target di panel kiri, buka tab 'Import', pilih file ini, lalu klik 'Go' / 'Kirim'.
-- 2. Melalui Terminal / CLI:
--    mysql -u [username] -p [nama_database] < database_full_structure.sql
-- =====================================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Konfigurasi koneksi & nonaktifkan foreign key checks selama pembuatan
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- BAGIAN 1: AUTENTIKASI, PENGGUNA & PROFIL MAHASISWA
-- =====================================================================

-- Tabel: users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `username` varchar(50) NOT NULL COMMENT 'Login username (admin or NIM)',
  `password_hash` varchar(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `nama` varchar(150) NOT NULL,
  `role` enum('admin','student','developer','dosen','tendik','demo') NOT NULL DEFAULT 'student',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Account creation date',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Last login timestamp',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Account status',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_role` (`role`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Unified authentication table for admins and students';

-- Tabel: admins
CREATE TABLE IF NOT EXISTS `admins` (
  `id` varchar(36) NOT NULL COMMENT 'FK to users.id',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Admin creation date',
  `can_edit_dosen` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Permission to edit dosen data',
  `can_edit_mahasiswa` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Permission to edit mahasiswa data',
  PRIMARY KEY (`id`),
  CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin role mapping';

-- Tabel: students
CREATE TABLE IF NOT EXISTS `students` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `nim` varchar(20) NOT NULL COMMENT 'Student ID number',
  `nama` varchar(100) NOT NULL COMMENT 'Full name',
  `jurusan` varchar(50) NOT NULL DEFAULT 'Administrasi Bisnis' COMMENT 'Department',
  `prodi` varchar(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan' COMMENT 'Study Program',
  `status` enum('active','on_leave','dropout','alumni') NOT NULL DEFAULT 'active' COMMENT 'Student status',
  `status_mode` enum('manual','auto') NOT NULL DEFAULT 'auto' COMMENT 'manual=use status; auto=compute active/alumni from tahun_masuk/tahun_lulus',
  `tahun_masuk` int(11) NOT NULL COMMENT 'Year of enrollment',
  `tahun_lulus` int(11) DEFAULT NULL COMMENT 'Year of graduation (NULL if not alumni)',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email address',
  `login_email` varchar(100) DEFAULT NULL COMMENT 'Verified email for optional login',
  `pending_login_email` varchar(100) DEFAULT NULL COMMENT 'Pending email waiting for verification',
  `is_email_login_enabled` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Email login activation status',
  `email_verified_at` timestamp NULL DEFAULT NULL COMMENT 'Email login verification timestamp',
  `email_verification_token_hash` char(64) DEFAULT NULL COMMENT 'SHA-256 hash of verification token',
  `email_verification_expires_at` datetime DEFAULT NULL COMMENT 'Verification token expiry timestamp',
  `email_verification_sent_at` datetime DEFAULT NULL COMMENT 'Last verification email sent timestamp',
  `email_verification_otp_hash` char(64) DEFAULT NULL COMMENT 'SHA-256 hash of 6-digit OTP for email verification',
  `no_hp` varchar(20) DEFAULT NULL COMMENT 'Phone number',
  `alamat` text DEFAULT NULL COMMENT 'Address',
  `user_id` varchar(36) DEFAULT NULL COMMENT 'FK to users table',
  `has_credentials` tinyint(1) DEFAULT 0 COMMENT 'Has login account',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Last login',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Record creation',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nim` (`nim`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `login_email` (`login_email`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_nim` (`nim`),
  KEY `idx_status` (`status`),
  KEY `idx_tahun_lulus` (`tahun_lulus`),
  KEY `idx_email` (`email`),
  KEY `idx_login_email` (`login_email`),
  KEY `idx_pending_login_email` (`pending_login_email`),
  KEY `idx_email_verification_token_hash` (`email_verification_token_hash`),
  KEY `idx_email_verification_otp_hash` (`email_verification_otp_hash`),
  KEY `idx_status_tahun` (`status`,`tahun_lulus`),
  KEY `idx_students_status_tahun` (`status`,`tahun_lulus`),
  KEY `idx_deleted_at` (`deleted_at`),
  KEY `idx_deleted_by` (`deleted_by`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `check_tahun_lulus` CHECK (`tahun_lulus` is null or `tahun_lulus` >= `tahun_masuk`),
  CONSTRAINT `check_tahun_masuk` CHECK (`tahun_masuk` > 1900 and `tahun_masuk` < 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Central student profile hub';

-- Tabel: tracer_study
CREATE TABLE IF NOT EXISTS `tracer_study` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `student_id` varchar(36) NOT NULL COMMENT 'FK to students (UNIQUE - one per student)',
  `email` varchar(100) NOT NULL COMMENT 'Contact email',
  `no_hp` varchar(20) NOT NULL COMMENT 'Phone number',
  `media_sosial` varchar(255) DEFAULT NULL COMMENT 'Social media handle',
  `linkedin` varchar(255) DEFAULT NULL COMMENT 'LinkedIn URL',
  `career_status` enum('working','job_seeking','entrepreneur','further_study') NOT NULL COMMENT 'Career status',
  `tahun_pengisian` int(11) NOT NULL COMMENT 'Year of submission',
  `employment_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Employment details (career_status = working)' CHECK (json_valid(`employment_data`)),
  `job_seeking_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Job seeking details (career_status = job_seeking)' CHECK (json_valid(`job_seeking_data`)),
  `entrepreneurship_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Business details (career_status = entrepreneur)' CHECK (json_valid(`entrepreneurship_data`)),
  `further_study_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Further study details (career_status = further_study)' CHECK (json_valid(`further_study_data`)),
  `ringkasan_karir` text DEFAULT NULL COMMENT 'Career summary',
  `bersedia_dihubungi` tinyint(1) DEFAULT 0 COMMENT 'Willing to be contacted',
  `saran_komentar` text DEFAULT NULL COMMENT 'Suggestions/comments',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Submission date',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_career_status` (`career_status`),
  KEY `idx_tahun_pengisian` (`tahun_pengisian`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_tracer_tahun` (`tahun_pengisian`),
  CONSTRAINT `tracer_study_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alumni career tracking (tracer study)';

-- =====================================================================
-- BAGIAN 2: PORTAL DOSEN & TENAGA KEPENDIDIKAN (TRIDHARMA)
-- =====================================================================

-- Tabel: dosen
CREATE TABLE IF NOT EXISTS `dosen` (
  `id` varchar(36) NOT NULL COMMENT 'UUID / Unique ID',
  `user_id` varchar(36) DEFAULT NULL,
  `nidn` varchar(20) NOT NULL COMMENT 'Nomor Induk Dosen Nasional / NIDK',
  `nama` varchar(150) NOT NULL COMMENT 'Nama Lengkap beserta Gelar Akademik',
  `status_dosen` enum('Tetap','Tidak Tetap') NOT NULL DEFAULT 'Tetap' COMMENT 'Status Kepegawaian',
  `jabatan` varchar(100) NOT NULL DEFAULT 'Asisten Ahli' COMMENT 'Jabatan Fungsional Akademik',
  `peran` enum('Akademisi','Praktisi') NOT NULL DEFAULT 'Akademisi' COMMENT 'Kategori Peran Dosen',
  `institusi` varchar(150) NOT NULL DEFAULT 'Politeknik Negeri Semarang' COMMENT 'Institusi Induk',
  `pendidikan_pasca_sarjana` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array JSON jenjang pascasarjana' CHECK (json_valid(`pendidikan_pasca_sarjana`)),
  `bidang_keahlian` varchar(255) DEFAULT NULL COMMENT 'Fokus Bidang Keahlian / Kepakaran',
  `sertifikat_pendidik` varchar(100) DEFAULT '-' COMMENT 'Nomor Sertifikat Pendidik Profesional',
  `sertifikat_kompetensi` text DEFAULT NULL COMMENT 'Daftar Sertifikat Kompetensi / Profesi',
  `email` varchar(100) DEFAULT NULL COMMENT 'Email resmi / dinas',
  `telepon` varchar(30) DEFAULT NULL COMMENT 'Nomor Telepon / WhatsApp',
  `avatar_color` varchar(50) DEFAULT 'from-blue-600 to-indigo-600' COMMENT 'Gradien Warna Avatar UI',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Waktu dipindahkan ke arsip sistem (Soft Delete)',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin yang menghapus data',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nidn` (`nidn`),
  UNIQUE KEY `uk_dosen_user_id` (`user_id`),
  KEY `idx_dosen_nidn` (`nidn`),
  KEY `idx_dosen_nama` (`nama`),
  KEY `idx_dosen_status` (`status_dosen`),
  KEY `idx_dosen_deleted` (`deleted_at`),
  CONSTRAINT `fk_dosen_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Data Dosen (SSOT)';

-- Tabel: dosen_archives
CREATE TABLE IF NOT EXISTS `dosen_archives` (
  `id` varchar(50) NOT NULL,
  `nidn` varchar(20) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `payload_json` longtext NOT NULL COMMENT 'Seluruh data dosen & riwayat tridharma dalam JSON',
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL COMMENT 'deleted_at + 20 days (auto-purge threshold)',
  PRIMARY KEY (`id`),
  KEY `idx_arch_nidn` (`nidn`),
  KEY `idx_arch_nama` (`nama`),
  KEY `idx_arch_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Arsip Dosen Soft Delete 20 Hari';

-- Tabel: dosen_pengajaran_matkul
CREATE TABLE IF NOT EXISTS `dosen_pengajaran_matkul` (
  `id` varchar(50) NOT NULL COMMENT 'UUID / String ID',
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `tipe_ps` enum('PS_ABT','PS_LAIN') NOT NULL DEFAULT 'PS_ABT' COMMENT 'Tipe Program Studi',
  `kode_matkul` varchar(30) DEFAULT NULL COMMENT 'Kode Mata Kuliah',
  `nama_matkul` varchar(150) NOT NULL COMMENT 'Nama Mata Kuliah',
  `sks` int(11) NOT NULL DEFAULT 3 COMMENT 'Bobot SKS',
  `prodi_lain` varchar(150) DEFAULT NULL COMMENT 'Nama Prodi Lain (khusus PS_LAIN)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_matkul_dosen` (`dosen_id`),
  KEY `idx_matkul_tipe` (`tipe_ps`),
  CONSTRAINT `dosen_pengajaran_matkul_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mata Kuliah Pengajaran Dosen';

-- Tabel: dosen_pengajaran_bahan_ajar
CREATE TABLE IF NOT EXISTS `dosen_pengajaran_bahan_ajar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `judul_bahan_ajar` varchar(255) NOT NULL COMMENT 'Judul Buku Ajar / Modul / Diktat',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_bahan_ajar_dosen` (`dosen_id`),
  CONSTRAINT `dosen_pengajaran_bahan_ajar_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bahan Ajar Dosen';

-- Tabel: dosen_pengajaran_bimbingan
CREATE TABLE IF NOT EXISTS `dosen_pengajaran_bimbingan` (
  `id` varchar(36) NOT NULL,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `ps_abt_ps` int(11) NOT NULL DEFAULT 0 COMMENT 'PS ABT - Mahasiswa TS',
  `ps_abt_ps1` int(11) NOT NULL DEFAULT 0 COMMENT 'PS ABT - Mahasiswa TS-1',
  `ps_abt_ps2` int(11) NOT NULL DEFAULT 0 COMMENT 'PS ABT - Mahasiswa TS-2',
  `ps_lain_ps` int(11) NOT NULL DEFAULT 0 COMMENT 'PS Lain - Mahasiswa TS',
  `ps_lain_ps1` int(11) NOT NULL DEFAULT 0 COMMENT 'PS Lain - Mahasiswa TS-1',
  `ps_lain_ps2` int(11) NOT NULL DEFAULT 0 COMMENT 'PS Lain - Mahasiswa TS-2',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bimbingan_dosen` (`dosen_id`),
  CONSTRAINT `dosen_pengajaran_bimbingan_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Data Bimbingan Mahasiswa';

-- Tabel: dosen_penelitian
CREATE TABLE IF NOT EXISTS `dosen_penelitian` (
  `id` varchar(50) NOT NULL,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `judul` text NOT NULL COMMENT 'Judul Penelitian',
  `kerjasama_instansi` varchar(255) NOT NULL DEFAULT 'Mandiri / Internal PT' COMMENT 'Mitra / Kerjasama Instansi',
  `tahun` varchar(10) NOT NULL COMMENT 'Tahun Riset',
  `skema` varchar(100) DEFAULT NULL COMMENT 'Skema Hibah Riset',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_penelitian_dosen` (`dosen_id`),
  KEY `idx_penelitian_tahun` (`tahun`),
  CONSTRAINT `dosen_penelitian_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat Penelitian Dosen';

-- Tabel: dosen_pengabdian
CREATE TABLE IF NOT EXISTS `dosen_pengabdian` (
  `id` varchar(50) NOT NULL,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `nama_kegiatan` text NOT NULL COMMENT 'Nama Kegiatan PKM',
  `kerjasama_instansi` varchar(255) NOT NULL DEFAULT 'Mandiri / Kelompok Masyarakat' COMMENT 'Mitra PKM',
  `tahun` varchar(10) NOT NULL COMMENT 'Tahun Pelaksanaan PKM',
  `skema` varchar(100) DEFAULT NULL COMMENT 'Skema PKM',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_pengabdian_dosen` (`dosen_id`),
  KEY `idx_pengabdian_tahun` (`tahun`),
  CONSTRAINT `dosen_pengabdian_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Riwayat PKM Dosen';

-- Tabel: dosen_rekognisi
CREATE TABLE IF NOT EXISTS `dosen_rekognisi` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `bidang` enum('Pengajaran','Penelitian','Pengabdian','Umum') NOT NULL DEFAULT 'Umum',
  `deskripsi` varchar(255) NOT NULL COMMENT 'Deskripsi Rekognisi / Asesor / Reviewer / Narasumber',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_rekognisi_dosen` (`dosen_id`),
  CONSTRAINT `dosen_rekognisi_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rekognisi & Kepakaran Dosen';

-- Tabel: dosen_waktu_mengajar
CREATE TABLE IF NOT EXISTS `dosen_waktu_mengajar` (
  `id` varchar(36) NOT NULL,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `tahun_akademik` varchar(20) NOT NULL DEFAULT '2024/2025' COMMENT 'Tahun Ajaran',
  `pendidikan_ps_abt` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS di PS ABT',
  `pendidikan_ps_lain` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS di PS Lain Internal PT',
  `pendidikan_pt_lain` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS di PT Lain Eksternal',
  `penelitian` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS Penelitian',
  `pkm` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS PKM',
  `tugas_tambahan` decimal(4,1) NOT NULL DEFAULT 0.0 COMMENT 'SKS Tugas Tambahan',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ewmp_dosen_tahun` (`dosen_id`,`tahun_akademik`),
  KEY `idx_ewmp_dosen` (`dosen_id`),
  CONSTRAINT `dosen_waktu_mengajar_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Ekuivalensi Waktu Mengajar Penuh (EWMP)';

-- Tabel: dosen_luaran_penelitian_pkm
CREATE TABLE IF NOT EXISTS `dosen_luaran_penelitian_pkm` (
  `id` varchar(50) NOT NULL,
  `dosen_id` varchar(36) NOT NULL COMMENT 'FK ke dosen.id',
  `kategori` enum('Penelitian','PKM') NOT NULL DEFAULT 'Penelitian' COMMENT 'Kategori Luaran',
  `judul_luaran` text NOT NULL COMMENT 'Judul Karya Luaran',
  `tahun` varchar(10) NOT NULL COMMENT 'Tahun Pelaksanaan / Publikasi',
  `sumber_pendanaan` enum('Perguruan Tinggi / Mandiri','Lembaga Dalam Negeri (di luar Perguruan Tinggi)','Lembaga Luar Negeri') NOT NULL DEFAULT 'Perguruan Tinggi / Mandiri' COMMENT 'Sumber Dana',
  `jenis_publikasi` enum('Jurnal Nasional Tidak Terakreditasi','Jurnal Nasional Terakreditasi','Jurnal Internasional','Jurnal Internasional Bereputasi','Seminar Wilayah, Lokal, Perguruan Tinggi','Seminar Nasional','Seminar Internasional','Tulisan di Media Massa Nasional','Tulisan di Media Massa Internasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional') NOT NULL COMMENT '12 Jenis Publikasi LKPS Akreditasi',
  `url_luaran` varchar(255) DEFAULT NULL COMMENT 'Tautan URL Publikasi',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_luaran_dosen` (`dosen_id`),
  KEY `idx_luaran_kategori` (`kategori`),
  KEY `idx_luaran_tahun` (`tahun`),
  KEY `idx_luaran_jenis` (`jenis_publikasi`),
  CONSTRAINT `dosen_luaran_penelitian_pkm_ibfk_1` FOREIGN KEY (`dosen_id`) REFERENCES `dosen` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Luaran Penelitian dan PKM Dosen';

-- Tabel: tenaga_kependidikan
CREATE TABLE IF NOT EXISTS `tenaga_kependidikan` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `nip` varchar(30) NOT NULL COMMENT 'Nomor Induk NIP / NITK / NIDK / NIPPPK',
  `nama` varchar(150) NOT NULL COMMENT 'Nama Lengkap Tendik',
  `status` enum('Tetap','Tidak Tetap') NOT NULL DEFAULT 'Tetap',
  `jabatan` varchar(150) NOT NULL COMMENT 'Jabatan & Golongan',
  `golongan` varchar(100) DEFAULT NULL,
  `pendidikan_d3` varchar(150) DEFAULT '-' COMMENT 'Jurusan D3',
  `pendidikan_s1` varchar(150) DEFAULT '-' COMMENT 'Jurusan S1/D4',
  `pendidikan_s2` varchar(150) DEFAULT '-' COMMENT 'Jurusan S2',
  `pendidikan_s3` varchar(150) DEFAULT '-' COMMENT 'Jurusan S3',
  `sertifikat_kompetensi` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Array JSON Sertifikat Kompetensi' CHECK (json_valid(`sertifikat_kompetensi`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nip` (`nip`),
  UNIQUE KEY `uk_tendik_user_id` (`user_id`),
  KEY `idx_tendik_nip` (`nip`),
  KEY `idx_tendik_nama` (`nama`),
  KEY `idx_tendik_status` (`status`),
  CONSTRAINT `fk_tendik_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master Data Tenaga Kependidikan';

-- Tabel: dosen_import_logs
CREATE TABLE IF NOT EXISTS `dosen_import_logs` (
  `id` varchar(36) NOT NULL,
  `module` enum('pengelolaan','pengajaran','penelitian','pengabdian','waktu_mengajar','tendik','luaran') NOT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `total_rows` int(11) NOT NULL DEFAULT 0,
  `success_rows` int(11) NOT NULL DEFAULT 0,
  `skipped_rows` int(11) NOT NULL DEFAULT 0,
  `failed_rows` int(11) NOT NULL DEFAULT 0,
  `affected_dosen` int(11) NOT NULL DEFAULT 0,
  `status` enum('processing','completed','completed_with_errors','failed') NOT NULL DEFAULT 'processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_dosen_import_module_created` (`module`,`created_at`),
  KEY `idx_dosen_import_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_dosen_import_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: dosen_import_log_details
CREATE TABLE IF NOT EXISTS `dosen_import_log_details` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `import_log_id` varchar(36) NOT NULL,
  `row_number` int(11) NOT NULL,
  `identity_raw` varchar(100) DEFAULT NULL,
  `status` enum('inserted','skipped','error') NOT NULL,
  `message` text NOT NULL,
  `raw_payload_json` longtext DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_dosen_import_detail_log` (`import_log_id`),
  KEY `idx_dosen_import_detail_status` (`status`),
  CONSTRAINT `fk_dosen_import_detail_log` FOREIGN KEY (`import_log_id`) REFERENCES `dosen_import_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- BAGIAN 3: PRESTASI MAHASISWA (SINGLE SOURCE OF TRUTH - SSOT)
-- =====================================================================

-- Tabel: prestasi_publikasi
CREATE TABLE IF NOT EXISTS `prestasi_publikasi` (
  `id_publikasi` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'scientific_work',
  `subcategory` varchar(50) NOT NULL DEFAULT 'journal_publication',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'academic',
  `verified` tinyint(1) DEFAULT 0,
  `judul` varchar(255) DEFAULT NULL,
  `judul_norm` varchar(255) NOT NULL DEFAULT '',
  `jenis_publikasi` enum('artikel_jurnal','prosiding','buku','book_chapter','lainnya') DEFAULT NULL,
  `penulis` text DEFAULT NULL,
  `peran_penulis` varchar(100) DEFAULT NULL,
  `nama_jurnal_konferensi` varchar(255) DEFAULT NULL,
  `nama_jurnal_konferensi_norm` varchar(255) NOT NULL DEFAULT '',
  `penerbit` varchar(255) DEFAULT NULL,
  `doi` varchar(255) DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  `tahun_terbit` int(11) DEFAULT NULL,
  `tanggal_terbit` date DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_publikasi`),
  UNIQUE KEY `uq_prestasi_publikasi` (`id_mahasiswa`,`judul_norm`,`jenis_publikasi`,`tahun_terbit`,`nama_jurnal_konferensi_norm`),
  KEY `idx_prestasi_publikasi_student` (`id_mahasiswa`),
  KEY `idx_prestasi_publikasi_date` (`tanggal`),
  KEY `idx_prestasi_publikasi_category` (`category`,`subcategory`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_publikasi_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_publikasi_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_publikasi_attachments
CREATE TABLE IF NOT EXISTS `prestasi_publikasi_attachments` (
  `id` varchar(36) NOT NULL,
  `id_publikasi` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_publikasi_att_fk` (`id_publikasi`),
  CONSTRAINT `prestasi_publikasi_attachments_ibfk_1` FOREIGN KEY (`id_publikasi`) REFERENCES `prestasi_publikasi` (`id_publikasi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_portofolio
CREATE TABLE IF NOT EXISTS `prestasi_portofolio` (
  `id_portofolio` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'applied_academic',
  `subcategory` varchar(50) NOT NULL DEFAULT 'course_portfolio',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'academic',
  `verified` tinyint(1) DEFAULT 0,
  `judul_proyek` varchar(255) DEFAULT NULL,
  `judul_proyek_norm` varchar(255) NOT NULL DEFAULT '',
  `mata_kuliah_kode` varchar(50) DEFAULT NULL,
  `mata_kuliah_custom` varchar(255) DEFAULT NULL,
  `mata_kuliah_norm` varchar(255) NOT NULL DEFAULT '',
  `tahun` int(11) DEFAULT NULL,
  `semester` enum('ganjil','genap') DEFAULT NULL,
  `deskripsi_proyek` text DEFAULT NULL,
  `output` varchar(500) DEFAULT NULL,
  `url_proyek` varchar(500) DEFAULT NULL,
  `nilai` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_portofolio`),
  UNIQUE KEY `uq_prestasi_portofolio` (`id_mahasiswa`,`mata_kuliah_norm`,`judul_proyek_norm`,`semester`,`tahun`),
  KEY `idx_prestasi_portofolio_student` (`id_mahasiswa`),
  KEY `idx_prestasi_portofolio_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_portofolio_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_portofolio_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_portofolio_attachments
CREATE TABLE IF NOT EXISTS `prestasi_portofolio_attachments` (
  `id` varchar(36) NOT NULL,
  `id_portofolio` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_portofolio_att_fk` (`id_portofolio`),
  CONSTRAINT `prestasi_portofolio_attachments_ibfk_1` FOREIGN KEY (`id_portofolio`) REFERENCES `prestasi_portofolio` (`id_portofolio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_lomba
CREATE TABLE IF NOT EXISTS `prestasi_lomba` (
  `id_lomba` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'event_participation',
  `subcategory` varchar(50) NOT NULL DEFAULT 'competition',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_lomba` varchar(255) DEFAULT NULL,
  `nama_lomba_norm` varchar(255) NOT NULL DEFAULT '',
  `penyelenggara_norm` varchar(255) NOT NULL DEFAULT '',
  `peran` enum('peserta','juara') DEFAULT NULL,
  `bidang` varchar(255) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_lomba`),
  UNIQUE KEY `uq_prestasi_lomba` (`id_mahasiswa`,`nama_lomba_norm`,`tingkat`,`tanggal_mulai`,`penyelenggara_norm`),
  KEY `idx_prestasi_lomba_student` (`id_mahasiswa`),
  KEY `idx_prestasi_lomba_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_lomba_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_lomba_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_lomba_attachments
CREATE TABLE IF NOT EXISTS `prestasi_lomba_attachments` (
  `id` varchar(36) NOT NULL,
  `id_lomba` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_lomba_att_fk` (`id_lomba`),
  CONSTRAINT `prestasi_lomba_attachments_ibfk_1` FOREIGN KEY (`id_lomba`) REFERENCES `prestasi_lomba` (`id_lomba`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_kekayaan_intelektual
CREATE TABLE IF NOT EXISTS `prestasi_kekayaan_intelektual` (
  `id_kekayaan_intelektual` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'intellectual_property',
  `subcategory` varchar(50) NOT NULL DEFAULT 'patent',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `judul_ki` varchar(255) DEFAULT NULL,
  `judul_ki_norm` varchar(255) NOT NULL DEFAULT '',
  `jenis_ki` enum('hak_cipta','paten','merek','desain_industri','rahasia_dagang') DEFAULT NULL,
  `status_ki` enum('terdaftar','granted','pending','ditolak') DEFAULT NULL,
  `pemegang` varchar(255) DEFAULT NULL,
  `nomor_pendaftaran` varchar(255) DEFAULT NULL,
  `nomor_sertifikat` varchar(255) DEFAULT NULL,
  `tahun_pengajuan` int(11) DEFAULT NULL,
  `tahun_terbit` int(11) DEFAULT NULL,
  `tanggal_pengajuan` date DEFAULT NULL,
  `tanggal_terbit` date DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `jenis_perolehan` enum('mandiri','kolaborasi_dosen') DEFAULT NULL,
  `nama_dosen` varchar(255) DEFAULT NULL,
  `url_publikasi` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_kekayaan_intelektual`),
  UNIQUE KEY `uq_prestasi_ki_nomor_pendaftaran` (`nomor_pendaftaran`),
  UNIQUE KEY `uq_prestasi_ki_nomor_sertifikat` (`nomor_sertifikat`),
  UNIQUE KEY `uq_prestasi_ki_fallback` (`id_mahasiswa`,`judul_ki_norm`,`jenis_ki`,`tahun_pengajuan`),
  KEY `idx_prestasi_ki_student` (`id_mahasiswa`),
  KEY `idx_prestasi_ki_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_kekayaan_intelektual_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_kekayaan_intelektual_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_kekayaan_intelektual_attachments
CREATE TABLE IF NOT EXISTS `prestasi_kekayaan_intelektual_attachments` (
  `id` varchar(36) NOT NULL,
  `id_kekayaan_intelektual` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_ki_att_fk` (`id_kekayaan_intelektual`),
  CONSTRAINT `prestasi_kekayaan_intelektual_attachments_ibfk_1` FOREIGN KEY (`id_kekayaan_intelektual`) REFERENCES `prestasi_kekayaan_intelektual` (`id_kekayaan_intelektual`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_magang
CREATE TABLE IF NOT EXISTS `prestasi_magang` (
  `id_magang` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'applied_academic',
  `subcategory` varchar(50) NOT NULL DEFAULT 'internship',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_perusahaan` varchar(255) DEFAULT NULL,
  `nama_perusahaan_norm` varchar(255) NOT NULL DEFAULT '',
  `posisi` varchar(255) DEFAULT NULL,
  `posisi_norm` varchar(255) NOT NULL DEFAULT '',
  `industri` varchar(255) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `sedang_berjalan` tinyint(1) DEFAULT 0,
  `deskripsi_tugas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_magang`),
  UNIQUE KEY `uq_prestasi_magang` (`id_mahasiswa`,`nama_perusahaan_norm`,`posisi_norm`,`tanggal_mulai`),
  KEY `idx_prestasi_magang_student` (`id_mahasiswa`),
  KEY `idx_prestasi_magang_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_magang_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_magang_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_magang_attachments
CREATE TABLE IF NOT EXISTS `prestasi_magang_attachments` (
  `id` varchar(36) NOT NULL,
  `id_magang` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_magang_att_fk` (`id_magang`),
  CONSTRAINT `prestasi_magang_attachments_ibfk_1` FOREIGN KEY (`id_magang`) REFERENCES `prestasi_magang` (`id_magang`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_produk_mahasiswa
CREATE TABLE IF NOT EXISTS `prestasi_produk_mahasiswa` (
  `id_produk_mahasiswa` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'applied_academic',
  `subcategory` varchar(50) NOT NULL DEFAULT 'makanan_minuman',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_produk` varchar(255) DEFAULT NULL,
  `nama_produk_norm` varchar(255) NOT NULL DEFAULT '',
  `kategori_produk` varchar(50) NOT NULL DEFAULT 'makanan_minuman',
  `link_produk` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_produk_mahasiswa`),
  UNIQUE KEY `uq_prestasi_produk_mahasiswa` (`id_mahasiswa`,`nama_produk_norm`,`kategori_produk`,`tanggal`),
  KEY `idx_prestasi_produk_mahasiswa_student` (`id_mahasiswa`),
  KEY `idx_prestasi_produk_mahasiswa_date` (`tanggal`),
  KEY `idx_prestasi_produk_mahasiswa_category` (`category`,`subcategory`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_produk_mahasiswa_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_produk_mahasiswa_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_produk_mahasiswa_attachments
CREATE TABLE IF NOT EXISTS `prestasi_produk_mahasiswa_attachments` (
  `id` varchar(36) NOT NULL,
  `id_produk_mahasiswa` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_produk_mahasiswa_att_fk` (`id_produk_mahasiswa`),
  KEY `idx_prestasi_produk_mahasiswa_att_deleted_at` (`deleted_at`),
  KEY `idx_prestasi_produk_mahasiswa_att_deleted_by` (`deleted_by`),
  CONSTRAINT `prestasi_produk_mahasiswa_attachments_ibfk_1` FOREIGN KEY (`id_produk_mahasiswa`) REFERENCES `prestasi_produk_mahasiswa` (`id_produk_mahasiswa`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_produk_mahasiswa_attachments_ibfk_2` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_wirausaha
CREATE TABLE IF NOT EXISTS `prestasi_wirausaha` (
  `id_wirausaha` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'entrepreneurship',
  `subcategory` varchar(50) NOT NULL DEFAULT 'active_business',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_usaha` varchar(255) DEFAULT NULL,
  `nama_usaha_norm` varchar(255) NOT NULL DEFAULT '',
  `jenis_usaha` varchar(255) DEFAULT NULL,
  `peran` varchar(255) DEFAULT NULL,
  `lokasi_norm` varchar(255) NOT NULL DEFAULT '',
  `tahun_mulai` int(11) DEFAULT NULL,
  `masih_aktif` tinyint(1) DEFAULT 1,
  `tahun_selesai` int(11) DEFAULT NULL,
  `deskripsi_usaha` text DEFAULT NULL,
  `jumlah_karyawan` int(11) DEFAULT NULL,
  `omzet_per_bulan` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_wirausaha`),
  UNIQUE KEY `uq_prestasi_wirausaha` (`id_mahasiswa`,`nama_usaha_norm`,`lokasi_norm`,`tahun_mulai`),
  KEY `idx_prestasi_wirausaha_student` (`id_mahasiswa`),
  KEY `idx_prestasi_wirausaha_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_wirausaha_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_wirausaha_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_wirausaha_attachments
CREATE TABLE IF NOT EXISTS `prestasi_wirausaha_attachments` (
  `id` varchar(36) NOT NULL,
  `id_wirausaha` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_wirausaha_att_fk` (`id_wirausaha`),
  CONSTRAINT `prestasi_wirausaha_attachments_ibfk_1` FOREIGN KEY (`id_wirausaha`) REFERENCES `prestasi_wirausaha` (`id_wirausaha`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_pengembangan_diri
CREATE TABLE IF NOT EXISTS `prestasi_pengembangan_diri` (
  `id_pengembangan_diri` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'self_development',
  `subcategory` varchar(50) NOT NULL DEFAULT 'workshop',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_program` varchar(255) DEFAULT NULL,
  `nama_program_norm` varchar(255) NOT NULL DEFAULT '',
  `jenis_program` enum('pertukaran_mahasiswa','beasiswa','volunteer','pelatihan','lainnya') DEFAULT NULL,
  `peran_mahasiswa` varchar(255) DEFAULT NULL,
  `negara` varchar(255) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `sedang_berjalan` tinyint(1) DEFAULT 0,
  `output` varchar(500) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_pengembangan_diri`),
  UNIQUE KEY `uq_prestasi_pengembangan` (`id_mahasiswa`,`nama_program_norm`,`jenis_program`,`tanggal_mulai`),
  KEY `idx_prestasi_pengembangan_student` (`id_mahasiswa`),
  KEY `idx_prestasi_pengembangan_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_pengembangan_diri_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_pengembangan_diri_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_pengembangan_diri_attachments
CREATE TABLE IF NOT EXISTS `prestasi_pengembangan_diri_attachments` (
  `id` varchar(36) NOT NULL,
  `id_pengembangan_diri` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_pengembangan_att_fk` (`id_pengembangan_diri`),
  CONSTRAINT `prestasi_pengembangan_diri_attachments_ibfk_1` FOREIGN KEY (`id_pengembangan_diri`) REFERENCES `prestasi_pengembangan_diri` (`id_pengembangan_diri`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_organisasi
CREATE TABLE IF NOT EXISTS `prestasi_organisasi` (
  `id_organisasi` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'self_development',
  `subcategory` varchar(50) NOT NULL DEFAULT 'volunteer',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_organisasi` varchar(255) DEFAULT NULL,
  `nama_organisasi_norm` varchar(255) NOT NULL DEFAULT '',
  `jenis_organisasi` enum('kampus','luar_kampus') DEFAULT NULL,
  `jabatan` varchar(255) DEFAULT NULL,
  `jabatan_norm` varchar(255) NOT NULL DEFAULT '',
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `masih_aktif` tinyint(1) DEFAULT 1,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_organisasi`),
  UNIQUE KEY `uq_prestasi_organisasi` (`id_mahasiswa`,`nama_organisasi_norm`,`jabatan_norm`,`tanggal_mulai`),
  KEY `idx_prestasi_organisasi_student` (`id_mahasiswa`),
  KEY `idx_prestasi_organisasi_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_organisasi_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_organisasi_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_organisasi_attachments
CREATE TABLE IF NOT EXISTS `prestasi_organisasi_attachments` (
  `id` varchar(36) NOT NULL,
  `id_organisasi` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_organisasi_att_fk` (`id_organisasi`),
  CONSTRAINT `prestasi_organisasi_attachments_ibfk_1` FOREIGN KEY (`id_organisasi`) REFERENCES `prestasi_organisasi` (`id_organisasi`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_seminar
CREATE TABLE IF NOT EXISTS `prestasi_seminar` (
  `id_seminar` varchar(36) NOT NULL,
  `id_mahasiswa` varchar(36) NOT NULL,
  `source_import_log_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `lokasi` varchar(255) DEFAULT NULL,
  `penyelenggara` varchar(255) DEFAULT NULL,
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL,
  `peringkat` varchar(100) DEFAULT NULL,
  `category` varchar(50) NOT NULL DEFAULT 'event_participation',
  `subcategory` varchar(50) NOT NULL DEFAULT 'seminar',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic',
  `verified` tinyint(1) DEFAULT 0,
  `nama_seminar` varchar(255) DEFAULT NULL,
  `judul_publikasi` varchar(255) DEFAULT NULL,
  `judul_publikasi_norm` varchar(255) NOT NULL DEFAULT '',
  `level_seminar` enum('local','national','international') DEFAULT NULL,
  `jenis_perolehan` enum('mandiri','kolaborasi_dosen') DEFAULT NULL,
  `nama_dosen` varchar(255) DEFAULT NULL,
  `penulis` text DEFAULT NULL,
  `nama_seminar_konferensi` varchar(255) DEFAULT NULL,
  `nama_seminar_konferensi_norm` varchar(255) NOT NULL DEFAULT '',
  `url_publikasi` varchar(500) DEFAULT NULL,
  `tanggal_publikasi` date DEFAULT NULL,
  `nama_seminar_norm` varchar(255) NOT NULL DEFAULT '',
  `penyelenggara_norm` varchar(255) NOT NULL DEFAULT '',
  `peran_seminar` enum('peserta','pembicara') DEFAULT NULL,
  `mode_seminar` enum('online','offline') DEFAULT NULL,
  `tanggal_seminar` date DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_seminar`),
  UNIQUE KEY `uq_prestasi_seminar_publication` (`id_mahasiswa`,`judul_publikasi_norm`,`level_seminar`,`jenis_perolehan`,`tanggal_publikasi`),
  KEY `idx_prestasi_seminar_student` (`id_mahasiswa`),
  KEY `idx_prestasi_seminar_date` (`tanggal`),
  KEY `source_import_log_id` (`source_import_log_id`),
  CONSTRAINT `prestasi_seminar_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestasi_seminar_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_seminar_attachments
CREATE TABLE IF NOT EXISTS `prestasi_seminar_attachments` (
  `id` varchar(36) NOT NULL,
  `id_seminar` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_seminar_att_fk` (`id_seminar`),
  CONSTRAINT `prestasi_seminar_attachments_ibfk_1` FOREIGN KEY (`id_seminar`) REFERENCES `prestasi_seminar` (`id_seminar`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_audit_logs
CREATE TABLE IF NOT EXISTS `prestasi_audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_user_id` varchar(36) DEFAULT NULL,
  `actor_username` varchar(50) DEFAULT NULL,
  `actor_role` varchar(20) DEFAULT NULL,
  `action` enum('create','update','delete','import','export','login','other') NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `before_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_payload`)),
  `after_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_payload`)),
  `diff_summary` varchar(500) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_audit_logs_actor` (`actor_user_id`),
  KEY `idx_prestasi_audit_logs_entity` (`entity_type`,`entity_id`),
  KEY `idx_prestasi_audit_logs_action` (`action`),
  KEY `idx_prestasi_audit_logs_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_import_logs
CREATE TABLE IF NOT EXISTS `prestasi_import_logs` (
  `id` varchar(36) NOT NULL,
  `module` varchar(50) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `total_rows` int(11) NOT NULL DEFAULT 0,
  `valid_rows` int(11) NOT NULL DEFAULT 0,
  `success_rows` int(11) NOT NULL DEFAULT 0,
  `failed_rows` int(11) NOT NULL DEFAULT 0,
  `duplicate_rows` int(11) NOT NULL DEFAULT 0,
  `empty_rows` int(11) NOT NULL DEFAULT 0,
  `affected_students` int(11) NOT NULL DEFAULT 0,
  `status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_import_logs_kategori` (`kategori`),
  KEY `idx_prestasi_import_logs_created_at` (`created_at`),
  KEY `idx_prestasi_import_logs_uploaded_by` (`uploaded_by`),
  CONSTRAINT `prestasi_import_logs_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_import_log_details
CREATE TABLE IF NOT EXISTS `prestasi_import_log_details` (
  `id` varchar(36) NOT NULL,
  `import_log_id` varchar(36) NOT NULL,
  `row_number` int(11) NOT NULL,
  `nim_raw` varchar(50) DEFAULT NULL,
  `status` enum('error','duplicate','skipped_empty','inserted') NOT NULL,
  `message` varchar(500) DEFAULT NULL,
  `raw_payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_payload_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_prestasi_import_log_details_import_log_id` (`import_log_id`),
  KEY `idx_prestasi_import_log_details_status` (`status`),
  CONSTRAINT `prestasi_import_log_details_ibfk_1` FOREIGN KEY (`import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: prestasi_migration_skipped_logs
CREATE TABLE IF NOT EXISTS `prestasi_migration_skipped_logs` (
  `id` varchar(36) NOT NULL,
  `legacy_achievement_id` varchar(36) NOT NULL,
  `legacy_category` varchar(50) DEFAULT NULL,
  `legacy_subcategory` varchar(50) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prestasi_migration_skipped_legacy_id` (`legacy_achievement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- BAGIAN 4: EVALUASI LULUSAN & FORM SURVEY KEPUASAN
-- =====================================================================

-- Tabel: evaluations
CREATE TABLE IF NOT EXISTS `evaluations` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `title` varchar(255) NOT NULL COMMENT 'Evaluation title',
  `short_message` varchar(500) DEFAULT NULL COMMENT 'Short notification message',
  `status` enum('active','closed') NOT NULL DEFAULT 'active' COMMENT 'Evaluation lifecycle status',
  `start_at` datetime NOT NULL COMMENT 'Evaluation start date-time',
  `end_at` datetime DEFAULT NULL COMMENT 'Evaluation end date-time',
  `reminder_enabled` tinyint(1) DEFAULT 1 COMMENT 'Enable automatic reminder',
  `reminder_interval_days` int(11) NOT NULL DEFAULT 7 COMMENT 'Auto reminder interval in days',
  `created_by` varchar(36) NOT NULL COMMENT 'FK to users (admin creator)',
  `closed_by` varchar(36) DEFAULT NULL COMMENT 'FK to users (admin closer)',
  `closed_at` timestamp NULL DEFAULT NULL COMMENT 'Closed timestamp',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin/system actor id that moved evaluation to Recycle Bin',
  PRIMARY KEY (`id`),
  KEY `closed_by` (`closed_by`),
  KEY `idx_evaluations_status` (`status`),
  KEY `idx_evaluations_period` (`start_at`,`end_at`),
  KEY `idx_evaluations_creator` (`created_by`),
  KEY `idx_evaluations_deleted_at` (`deleted_at`),
  KEY `idx_evaluations_deleted_by` (`deleted_by`),
  CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `check_evaluation_period` CHECK (`end_at` is null or `end_at` >= `start_at`),
  CONSTRAINT `check_reminder_days` CHECK (`reminder_interval_days` >= 1 and `reminder_interval_days` <= 365)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Graduate evaluation campaigns';

-- Tabel: evaluation_aspects
CREATE TABLE IF NOT EXISTS `evaluation_aspects` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `code` varchar(50) NOT NULL COMMENT 'Stable aspect code',
  `name` varchar(255) NOT NULL COMMENT 'Aspect display label',
  `sort_order` int(11) NOT NULL COMMENT 'Display order',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Aspect active flag',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_aspects_active_order` (`is_active`,`sort_order`),
  CONSTRAINT `check_aspect_sort_order` CHECK (`sort_order` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master list of evaluation aspects';

-- Tabel: evaluation_invitations
CREATE TABLE IF NOT EXISTS `evaluation_invitations` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `evaluation_id` varchar(36) NOT NULL COMMENT 'FK to evaluations',
  `student_id` varchar(36) NOT NULL COMMENT 'FK to students (alumni target)',
  `user_id` varchar(36) DEFAULT NULL COMMENT 'FK to users (student account)',
  `access_token` varchar(128) NOT NULL COMMENT 'Secure survey access token',
  `first_sent_at` timestamp NULL DEFAULT NULL COMMENT 'First invitation sent timestamp',
  `last_sent_at` timestamp NULL DEFAULT NULL COMMENT 'Latest invitation/reminder sent timestamp',
  `send_count` int(11) NOT NULL DEFAULT 0 COMMENT 'How many times invitation/reminder sent',
  `submitted_at` timestamp NULL DEFAULT NULL COMMENT 'Survey submission timestamp',
  `created_by` varchar(36) DEFAULT NULL COMMENT 'FK to users (admin sender/creator)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `access_token` (`access_token`),
  UNIQUE KEY `unique_evaluation_student` (`evaluation_id`,`student_id`),
  KEY `created_by` (`created_by`),
  KEY `idx_invitations_evaluation` (`evaluation_id`),
  KEY `idx_invitations_student` (`student_id`),
  KEY `idx_invitations_user_id` (`user_id`),
  KEY `idx_invitations_submitted` (`submitted_at`),
  KEY `idx_invitations_reminder_due` (`submitted_at`,`last_sent_at`),
  KEY `idx_invitations_eval_submission` (`evaluation_id`,`submitted_at`),
  CONSTRAINT `evaluation_invitations_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluation_invitations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluation_invitations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `check_send_count` CHECK (`send_count` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Invitation mapping between evaluation and alumni';

-- Tabel: evaluation_responses
CREATE TABLE IF NOT EXISTS `evaluation_responses` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `evaluation_id` varchar(36) NOT NULL COMMENT 'FK to evaluations',
  `invitation_id` varchar(36) NOT NULL COMMENT 'FK to evaluation_invitations',
  `student_id` varchar(36) NOT NULL COMMENT 'FK to students',
  `company_name` varchar(255) NOT NULL COMMENT 'Company name',
  `company_address` text NOT NULL COMMENT 'Company address',
  `employee_name` varchar(255) NOT NULL COMMENT 'Employee being evaluated',
  `graduation_year` int(11) NOT NULL COMMENT 'Graduation year of employee',
  `study_program` varchar(150) NOT NULL COMMENT 'Study program',
  `current_work_division` varchar(255) NOT NULL COMMENT 'Current work division/field',
  `major_job_match` enum('ya','tidak') NOT NULL COMMENT 'Is major relevant to current work',
  `attachment_path` varchar(512) DEFAULT NULL COMMENT 'Relative path: satisfaction_attachments/...',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Response submission timestamp',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_response_invitation` (`invitation_id`),
  UNIQUE KEY `unique_response_evaluation_student` (`evaluation_id`,`student_id`),
  KEY `idx_responses_evaluation` (`evaluation_id`),
  KEY `idx_responses_student` (`student_id`),
  KEY `idx_responses_match` (`major_job_match`),
  KEY `idx_responses_submitted` (`submitted_at`),
  KEY `idx_responses_eval_match` (`evaluation_id`,`major_job_match`),
  CONSTRAINT `evaluation_responses_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluation_responses_ibfk_2` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`),
  CONSTRAINT `evaluation_responses_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Survey response header data';

-- Tabel: evaluation_response_ratings
CREATE TABLE IF NOT EXISTS `evaluation_response_ratings` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `response_id` varchar(36) NOT NULL COMMENT 'FK to evaluation_responses',
  `aspect_id` varchar(36) NOT NULL COMMENT 'FK to evaluation_aspects',
  `score` tinyint(3) unsigned NOT NULL COMMENT 'Rating score: 1-5',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_response_aspect` (`response_id`,`aspect_id`),
  KEY `idx_ratings_aspect` (`aspect_id`),
  KEY `idx_ratings_score` (`score`),
  KEY `idx_ratings_aspect_score` (`aspect_id`,`score`),
  CONSTRAINT `evaluation_response_ratings_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `evaluation_responses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `evaluation_response_ratings_ibfk_2` FOREIGN KEY (`aspect_id`) REFERENCES `evaluation_aspects` (`id`),
  CONSTRAINT `check_rating_score` CHECK (`score` >= 1 and `score` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-aspect rating values for each response';

-- Tabel: evaluation_token_blacklist
CREATE TABLE IF NOT EXISTS `evaluation_token_blacklist` (
  `token` varchar(128) NOT NULL COMMENT 'Superseded access_token',
  `evaluation_id` varchar(36) NOT NULL COMMENT 'FK to evaluations',
  `invalidated_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When token was replaced by resend',
  PRIMARY KEY (`token`),
  KEY `idx_blacklist_evaluation` (`evaluation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens invalidated when admin resends evaluation link';

-- Tabel: satisfaction_form_templates
CREATE TABLE IF NOT EXISTS `satisfaction_form_templates` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `title` varchar(255) NOT NULL COMMENT 'Template display name',
  `definition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Sections and items: type, required, options, scale_min/max, etc.' CHECK (json_valid(`definition`)),
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Default template; only one row should be true; cannot delete/edit from UI',
  `is_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Template currently used for surveys; only one row should be true',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete for recycle bin',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin user id that moved to recycle bin',
  PRIMARY KEY (`id`),
  KEY `idx_satisfaction_templates_deleted` (`deleted_at`),
  KEY `idx_satisfaction_templates_default` (`is_default`),
  KEY `idx_satisfaction_templates_active` (`is_active`),
  KEY `idx_satisfaction_templates_updated` (`updated_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom user satisfaction form templates';

-- Tabel: satisfaction_form_responses
CREATE TABLE IF NOT EXISTS `satisfaction_form_responses` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `invitation_id` varchar(36) NOT NULL COMMENT 'FK evaluation_invitations',
  `template_id` varchar(36) NOT NULL COMMENT 'FK satisfaction_form_templates (snapshot of form used)',
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Section/item id to value or file reference' CHECK (json_valid(`answers`)),
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_satisfaction_response_invitation` (`invitation_id`),
  KEY `idx_satisfaction_responses_template` (`template_id`),
  KEY `idx_satisfaction_responses_submitted` (`submitted_at`),
  CONSTRAINT `satisfaction_form_responses_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `satisfaction_form_responses_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `satisfaction_form_templates` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom form responses per invitation';

-- =====================================================================
-- BAGIAN 5: NOTIFIKASI & STATISTIK REKAP / CHART RECORDS
-- =====================================================================

-- Tabel: student_notifications
CREATE TABLE IF NOT EXISTS `student_notifications` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `student_id` varchar(36) NOT NULL COMMENT 'FK to students',
  `evaluation_id` varchar(36) DEFAULT NULL COMMENT 'FK to evaluations (nullable)',
  `invitation_id` varchar(36) DEFAULT NULL COMMENT 'FK to evaluation_invitations (nullable)',
  `type` enum('invitation','reminder') NOT NULL COMMENT 'Notification type',
  `title` varchar(255) NOT NULL COMMENT 'Notification title',
  `message` varchar(500) NOT NULL COMMENT 'Notification message',
  `link_path` varchar(500) NOT NULL COMMENT 'Frontend route/path with token',
  `is_read` tinyint(1) DEFAULT 0 COMMENT 'Read status',
  `read_at` timestamp NULL DEFAULT NULL COMMENT 'Read timestamp',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  PRIMARY KEY (`id`),
  KEY `invitation_id` (`invitation_id`),
  KEY `idx_notifications_student` (`student_id`),
  KEY `idx_notifications_read` (`student_id`,`is_read`),
  KEY `idx_notifications_created` (`created_at`),
  KEY `idx_notifications_evaluation` (`evaluation_id`),
  CONSTRAINT `student_notifications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_notifications_ibfk_2` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `student_notifications_ibfk_3` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification storage for students';

-- Tabel: active_students_semester_stats
CREATE TABLE IF NOT EXISTS `active_students_semester_stats` (
  `tahun` int(11) NOT NULL,
  `semester` enum('genap','ganjil') NOT NULL,
  `pd_dikti` int(11) NOT NULL DEFAULT 0,
  `aktif` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`tahun`,`semester`),
  KEY `idx_tahun` (`tahun`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: chart_records
CREATE TABLE IF NOT EXISTS `chart_records` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `section` varchar(100) NOT NULL COMMENT 'Section identifier e.g. study_period, waiting_time',
  `sub_section` varchar(100) DEFAULT NULL COMMENT 'Sub-section grouping',
  `year` int(11) NOT NULL COMMENT 'Target academic/calendar year',
  `prodi` varchar(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan',
  `category` varchar(100) NOT NULL COMMENT 'Category label',
  `value_number` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Numerical value for chart',
  `value_text` varchar(255) DEFAULT NULL COMMENT 'Formatted display text',
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Detailed breakdown in JSON format' CHECK (json_valid(`metadata_json`)),
  `is_visible` tinyint(1) NOT NULL DEFAULT 1 COMMENT 'Toggle chart visibility on public portal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_chart_section_year` (`section`,`year`),
  KEY `idx_chart_prodi` (`prodi`),
  KEY `idx_chart_visibility` (`is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Aggregated analytical chart records';

-- Tabel: chart_sync_log
CREATE TABLE IF NOT EXISTS `chart_sync_log` (
  `menu_section` varchar(80) NOT NULL COMMENT 'e.g. student_achievements, study_period',
  `last_synced_at` timestamp NULL DEFAULT NULL COMMENT 'Last sync from master (Asia/Jakarta)',
  `synced_by` varchar(36) DEFAULT NULL COMMENT 'FK users.id',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`menu_section`),
  KEY `idx_last_synced` (`last_synced_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Last sync time per dashboard section';

-- Tabel: export_logs
CREATE TABLE IF NOT EXISTS `export_logs` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `admin_id` varchar(36) NOT NULL COMMENT 'FK users.id',
  `menu_section` varchar(80) NOT NULL,
  `format` enum('csv','xlsx','pdf') NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'e.g. {"year": 2024}' CHECK (json_valid(`filters`)),
  `exported_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Asia/Jakarta',
  PRIMARY KEY (`id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_menu_section` (`menu_section`),
  KEY `idx_exported_at` (`exported_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Export audit log';

-- Tabel: menu_active_students_records
CREATE TABLE IF NOT EXISTS `menu_active_students_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'students',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_job_relevance_records
CREATE TABLE IF NOT EXISTS `menu_job_relevance_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'tracer_study',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_publications_records
CREATE TABLE IF NOT EXISTS `menu_publications_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'achievements',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_research_outputs_records
CREATE TABLE IF NOT EXISTS `menu_research_outputs_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'achievements',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_student_achievements_records
CREATE TABLE IF NOT EXISTS `menu_student_achievements_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'achievements',
  `source_id` varchar(36) NOT NULL COMMENT 'achievements.id',
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL COMMENT 'Year for reporting',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Chart/export data snapshot' CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_snapshot_nim` (`snapshot_nim`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_student_products_records
CREATE TABLE IF NOT EXISTS `menu_student_products_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'achievements',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_study_period_records
CREATE TABLE IF NOT EXISTS `menu_study_period_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'students',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_user_satisfaction_records
CREATE TABLE IF NOT EXISTS `menu_user_satisfaction_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'evaluation_responses',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_waiting_time_records
CREATE TABLE IF NOT EXISTS `menu_waiting_time_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'tracer_study',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: menu_work_coverage_records
CREATE TABLE IF NOT EXISTS `menu_work_coverage_records` (
  `id` varchar(36) NOT NULL,
  `source_table` varchar(64) NOT NULL DEFAULT 'tracer_study',
  `source_id` varchar(36) NOT NULL,
  `snapshot_nim` varchar(20) NOT NULL,
  `snapshot_nama` varchar(100) NOT NULL,
  `snapshot_prodi` varchar(100) NOT NULL,
  `snapshot_fakultas` varchar(100) NOT NULL,
  `tahun_pelaporan` int(11) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`payload`)),
  `included_in_chart` tinyint(1) NOT NULL DEFAULT 1,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  KEY `idx_deleted` (`deleted_at`),
  KEY `idx_tahun` (`tahun_pelaporan`),
  KEY `idx_included_in_chart` (`included_in_chart`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- BAGIAN 6: SISTEM, PENGATURAN, LOG & RECYCLE BIN
-- =====================================================================

-- Tabel: record_change_logs
CREATE TABLE IF NOT EXISTS `record_change_logs` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `menu_section` varchar(80) NOT NULL COMMENT 'Section id',
  `record_id` varchar(36) NOT NULL COMMENT 'PK of menu_*_records row',
  `action` enum('created','updated','deleted') NOT NULL,
  `admin_id` varchar(36) NOT NULL COMMENT 'FK users.id',
  `changed_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'Asia/Jakarta',
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Snapshot before change' CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Snapshot after change' CHECK (json_valid(`new_data`)),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_menu_section` (`menu_section`),
  KEY `idx_record` (`menu_section`,`record_id`),
  KEY `idx_admin` (`admin_id`),
  KEY `idx_changed_at` (`changed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for chart record changes';

-- Tabel: recycle_bin
CREATE TABLE IF NOT EXISTS `recycle_bin` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `entity_type` enum('student','achievement','tracer_study','evaluation','chart_record','dosen') NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `entity_identifier` varchar(100) NOT NULL COMMENT 'NIM, Judul, atau Nama entitas',
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Snapshot data lengkap entitas saat dihapus' CHECK (json_valid(`payload`)),
  `deleted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'ID admin yang menghapus',
  `expires_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00' COMMENT 'Batas waktu auto-purge (default 20/30 hari)',
  PRIMARY KEY (`id`),
  KEY `idx_recycle_entity` (`entity_type`,`entity_id`),
  KEY `idx_recycle_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Universal soft delete recycle bin';

-- Tabel: research_output_backfill_log
CREATE TABLE IF NOT EXISTS `research_output_backfill_log` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `source_table` varchar(64) NOT NULL,
  `source_achievement_id` varchar(64) NOT NULL,
  `source_category` varchar(64) NOT NULL,
  `source_subcategory` varchar(64) DEFAULT NULL,
  `target_achievement_id` varchar(64) DEFAULT NULL,
  `status` enum('inserted','skipped_existing','unmapped','failed') NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_research_output_backfill_source` (`source_table`,`source_achievement_id`),
  KEY `idx_research_output_backfill_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: system_error_logs
CREATE TABLE IF NOT EXISTS `system_error_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `username` varchar(100) DEFAULT NULL,
  `role` enum('student','admin','developer','demo','guest') NOT NULL DEFAULT 'guest',
  `feature_name` varchar(100) NOT NULL,
  `error_message` text NOT NULL,
  `stack_trace` text DEFAULT NULL,
  `url` text DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_error_logs_created_at` (`created_at`),
  KEY `idx_error_logs_role` (`role`),
  KEY `idx_error_logs_feature` (`feature_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: system_settings
CREATE TABLE IF NOT EXISTS `system_settings` (
  `key_name` varchar(100) NOT NULL,
  `value_text` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- BAGIAN 7: SINKRONISASI KOLOM IDEMPOTEN (UNTUK TABEL LAMA DI PRODUCTION)
-- Bagian ini memastikan bahwa jika tabel sudah pernah dibuat sebelumnya di
-- production (versi lama), kolom-kolom baru akan otomatis ditambahkan
-- tanpa menghapus data yang sudah ada.
-- =====================================================================

ALTER TABLE `users` MODIFY COLUMN `role` ENUM('admin', 'student', 'developer', 'dosen', 'tendik', 'demo') NOT NULL DEFAULT 'student';
ALTER TABLE `users` MODIFY COLUMN `nama` VARCHAR(150) NOT NULL;
SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'can_edit_dosen');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `admins` ADD COLUMN `can_edit_dosen` TINYINT(1) NOT NULL DEFAULT 1 COMMENT \'Permission to edit dosen data\'', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'can_edit_mahasiswa');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `admins` ADD COLUMN `can_edit_mahasiswa` TINYINT(1) NOT NULL DEFAULT 1 COMMENT \'Permission to edit mahasiswa data\'', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dosen' AND COLUMN_NAME = 'user_id');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `dosen` ADD COLUMN `user_id` VARCHAR(36) NULL AFTER `id`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenaga_kependidikan' AND COLUMN_NAME = 'golongan');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `tenaga_kependidikan` ADD COLUMN `golongan` VARCHAR(100) NULL AFTER `jabatan`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'status_mode');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `status_mode` ENUM(\'manual\', \'auto\') NOT NULL DEFAULT \'auto\' AFTER `status`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'login_email');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `login_email` VARCHAR(100) NULL UNIQUE AFTER `email`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'pending_login_email');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `pending_login_email` VARCHAR(100) NULL AFTER `login_email`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'is_email_login_enabled');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `is_email_login_enabled` BOOLEAN NOT NULL DEFAULT FALSE AFTER `pending_login_email`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email_verified_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `email_verified_at` TIMESTAMP NULL AFTER `is_email_login_enabled`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email_verification_token_hash');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `email_verification_token_hash` CHAR(64) NULL AFTER `email_verified_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email_verification_expires_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `email_verification_expires_at` DATETIME NULL AFTER `email_verification_token_hash`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email_verification_sent_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `email_verification_sent_at` DATETIME NULL AFTER `email_verification_expires_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'email_verification_otp_hash');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `email_verification_otp_hash` CHAR(64) NULL AFTER `email_verification_sent_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `updated_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'students' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `students` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracer_study' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `tracer_study` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `updated_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tracer_study' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `tracer_study` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluations' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `evaluations` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `updated_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluations' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `evaluations` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_invitations' AND COLUMN_NAME = 'user_id');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `evaluation_invitations` ADD COLUMN `user_id` VARCHAR(36) NULL AFTER `student_id`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_responses' AND COLUMN_NAME = 'attachment_path');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `evaluation_responses` ADD COLUMN `attachment_path` VARCHAR(512) NULL COMMENT \'Relative path: satisfaction_attachments/...\' AFTER `major_job_match`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'chart_records' AND COLUMN_NAME = 'is_visible');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `chart_records` ADD COLUMN `is_visible` TINYINT(1) NOT NULL DEFAULT 1 AFTER `metadata_json`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_publikasi_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_publikasi_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_publikasi_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_publikasi_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_portofolio_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_portofolio_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_portofolio_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_portofolio_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_lomba_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_lomba_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_lomba_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_lomba_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_kekayaan_intelektual_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_kekayaan_intelektual_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_kekayaan_intelektual_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_kekayaan_intelektual_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_magang_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_magang_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_magang_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_magang_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_produk_mahasiswa_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_produk_mahasiswa_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_produk_mahasiswa_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_produk_mahasiswa_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_wirausaha_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_wirausaha_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_wirausaha_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_wirausaha_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_pengembangan_diri_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_pengembangan_diri_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_pengembangan_diri_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_pengembangan_diri_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_organisasi_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_organisasi_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_organisasi_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_organisasi_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_seminar_attachments' AND COLUMN_NAME = 'deleted_at');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_seminar_attachments` ADD COLUMN `deleted_at` TIMESTAMP NULL AFTER `uploaded_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'prestasi_seminar_attachments' AND COLUMN_NAME = 'deleted_by');
SET @query := IF(@col_exist = 0, 'ALTER TABLE `prestasi_seminar_attachments` ADD COLUMN `deleted_by` VARCHAR(36) NULL AFTER `deleted_at`', 'SELECT 1');
PREPARE stmt FROM @query; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =====================================================================
-- BAGIAN 8: VIEW DATABASE (CREATE OR REPLACE VIEW)
-- =====================================================================

-- View: achievements
CREATE OR REPLACE VIEW `achievements` AS select `p`.`id_publikasi` AS `id`,`p`.`id_mahasiswa` AS `student_id`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_publikasi` `p` union all select `p`.`id_portofolio` AS `id_portofolio`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_portofolio` `p` union all select `p`.`id_lomba` AS `id_lomba`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_lomba` `p` union all select `p`.`id_kekayaan_intelektual` AS `id_kekayaan_intelektual`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_kekayaan_intelektual` `p` union all select `p`.`id_magang` AS `id_magang`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_magang` `p` union all select `p`.`id_produk_mahasiswa` AS `id_produk_mahasiswa`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_produk_mahasiswa` `p` union all select `p`.`id_wirausaha` AS `id_wirausaha`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_wirausaha` `p` union all select `p`.`id_pengembangan_diri` AS `id_pengembangan_diri`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_pengembangan_diri` `p` union all select `p`.`id_organisasi` AS `id_organisasi`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_organisasi` `p` union all select `p`.`id_seminar` AS `id_seminar`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_seminar` `p`;

-- View: achievement_attachments
CREATE OR REPLACE VIEW `achievement_attachments` AS select `a`.`id` AS `id`,`a`.`id_publikasi` AS `achievement_id`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_publikasi_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_portofolio` AS `id_portofolio`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_portofolio_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_lomba` AS `id_lomba`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_lomba_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_kekayaan_intelektual` AS `id_kekayaan_intelektual`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_kekayaan_intelektual_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_magang` AS `id_magang`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_magang_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_produk_mahasiswa` AS `id_produk_mahasiswa`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_produk_mahasiswa_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_wirausaha` AS `id_wirausaha`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_wirausaha_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_pengembangan_diri` AS `id_pengembangan_diri`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_pengembangan_diri_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_organisasi` AS `id_organisasi`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_organisasi_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_seminar` AS `id_seminar`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_seminar_attachments` `a` where `a`.`deleted_at` is null;

-- View: v_alumni_overview
CREATE OR REPLACE VIEW `v_alumni_overview` AS select `s`.`id` AS `id`,`s`.`nim` AS `nim`,`s`.`nama` AS `nama`,`s`.`tahun_lulus` AS `tahun_lulus`,`s`.`email` AS `email`,`s`.`no_hp` AS `no_hp`,`t`.`career_status` AS `career_status`,`t`.`tahun_pengisian` AS `tahun_pengisian`,(select count(0) from `prestasi_publikasi` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_portofolio` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_lomba` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_kekayaan_intelektual` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_magang` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_produk_mahasiswa` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_wirausaha` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_pengembangan_diri` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_organisasi` `p` where `p`.`id_mahasiswa` = `s`.`id`) + (select count(0) from `prestasi_seminar` `p` where `p`.`id_mahasiswa` = `s`.`id`) AS `total_achievements` from (`students` `s` left join `tracer_study` `t` on(`s`.`id` = `t`.`student_id` and `t`.`deleted_at` is null)) where `s`.`deleted_at` is null and case when `s`.`status_mode` = 'manual' then `s`.`status` when `s`.`status_mode` = 'auto' then case when `s`.`tahun_lulus` is not null and `s`.`tahun_lulus` <= year(curdate()) then 'alumni' when `s`.`tahun_lulus` is null and year(curdate()) >= `s`.`tahun_masuk` + 4 then 'alumni' else 'active' end else `s`.`status` end = 'alumni' group by `s`.`id`,`s`.`nim`,`s`.`nama`,`s`.`tahun_lulus`,`s`.`email`,`s`.`no_hp`,`t`.`career_status`,`t`.`tahun_pengisian`;

-- View: v_student_achievements_summary
CREATE OR REPLACE VIEW `v_student_achievements_summary` AS select `s`.`id` AS `id`,`s`.`nim` AS `nim`,`s`.`nama` AS `nama`,`s`.`status` AS `status`,count(`a`.`id`) AS `total_achievements`,count(distinct `a`.`category`) AS `total_categories`,count(case when `a`.`verified` = 1 then 1 end) AS `verified_achievements`,max(`a`.`tanggal`) AS `latest_achievement_date` from (`students` `s` left join `achievements` `a` on(`s`.`id` = `a`.`student_id`)) where `s`.`deleted_at` is null group by `s`.`id`,`s`.`nim`,`s`.`nama`,`s`.`status`;

-- =====================================================================
-- BAGIAN 9: AKUN DEMO RESMI (SATU-SATUNYA DATA YANG IKUT TERPINDAH)
-- Username: demo
-- Password: demo123
-- Role    : demo (Read-only session di backend, simulasi lokal di frontend)
-- =====================================================================

INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `created_at`, `last_login`, `is_active`)
VALUES (
  'demo-mode-001',
  'demo',
  '$2y$10$6tdCjwyx/vrrIvXwj9VVx.IoAICFUr44un7sBY77Kv/xheNROATVq',
  'Demo Mode',
  'demo',
  NOW(),
  NULL,
  1
)
ON DUPLICATE KEY UPDATE
  `password_hash` = VALUES(`password_hash`),
  `nama` = VALUES(`nama`),
  `role` = VALUES(`role`),
  `is_active` = 1;

SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- =====================================================================
-- SELESAI: SEMUA STRUKTUR DATABASE (69 TABEL + 4 VIEW) BERHASIL DISIAPKAN
-- =====================================================================