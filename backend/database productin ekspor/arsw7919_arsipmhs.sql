-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Waktu pembuatan: 15 Mar 2026 pada 22.33
-- Versi server: 10.11.16-MariaDB-cll-lve
-- Versi PHP: 8.4.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `arsw7919_arsipmhs`
--

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `achievements`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `achievements` (
`id` varchar(36)
,`student_id` varchar(36)
,`category` varchar(50)
,`subcategory` varchar(50)
,`achievement_type` varchar(12)
,`title` varchar(255)
,`description` mediumtext
,`tanggal` date
,`lokasi` varchar(255)
,`penyelenggara` varchar(255)
,`tingkat` varchar(13)
,`peringkat` varchar(100)
,`verified` tinyint(4)
,`created_at` timestamp /* mariadb-5.3 */
,`updated_at` timestamp /* mariadb-5.3 */
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `achievements_legacy_backup_20260306155721`
--

CREATE TABLE `achievements_legacy_backup_20260306155721` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `student_id` varchar(36) NOT NULL COMMENT 'FK to students',
  `category` varchar(50) NOT NULL COMMENT 'Achievement category',
  `subcategory` varchar(50) NOT NULL COMMENT 'Achievement subcategory',
  `achievement_type` enum('academic','non_academic') NOT NULL DEFAULT 'non_academic' COMMENT 'Derived achievement classification',
  `title` varchar(255) NOT NULL COMMENT 'Achievement title',
  `description` text DEFAULT NULL COMMENT 'Detailed description',
  `tanggal` date NOT NULL COMMENT 'Achievement date',
  `lokasi` varchar(255) DEFAULT NULL COMMENT 'Location',
  `penyelenggara` varchar(255) DEFAULT NULL COMMENT 'Organizer/institution',
  `tingkat` enum('lokal','regional','nasional','internasional') DEFAULT NULL COMMENT 'Achievement level',
  `peringkat` varchar(100) DEFAULT NULL COMMENT 'Ranking/award (e.g., Juara 1, Finalist)',
  `verified` tinyint(1) DEFAULT 0 COMMENT 'Admin verified',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Record creation',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Non-academic achievements';

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `achievement_attachments`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `achievement_attachments` (
`id` varchar(36)
,`achievement_id` varchar(36)
,`file_name` varchar(255)
,`file_type` varchar(50)
,`file_size` int(11)
,`file_path` varchar(500)
,`uploaded_at` timestamp /* mariadb-5.3 */
);

-- --------------------------------------------------------

--
-- Struktur dari tabel `achievement_attachments_legacy_backup_20260306155721`
--

CREATE TABLE `achievement_attachments_legacy_backup_20260306155721` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `achievement_id` varchar(36) NOT NULL COMMENT 'FK to achievements',
  `file_name` varchar(255) NOT NULL COMMENT 'Original filename',
  `file_type` varchar(50) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
  `file_size` int(11) NOT NULL COMMENT 'File size in bytes',
  `file_path` varchar(500) NOT NULL COMMENT 'URL or server path to file',
  `uploaded_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Upload timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin/system actor id that moved attachment to Recycle Bin'
) ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `active_students_semester_stats`
--

CREATE TABLE `active_students_semester_stats` (
  `tahun` int(11) NOT NULL,
  `semester` enum('genap','ganjil') NOT NULL,
  `pd_dikti` int(11) NOT NULL DEFAULT 0 COMMENT 'Jumlah terdaftar PD-Dikti semester ini',
  `aktif` int(11) DEFAULT NULL COMMENT 'Jumlah mahasiswa aktif; NULL = hitung dari records',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `admins`
--

CREATE TABLE `admins` (
  `id` varchar(36) NOT NULL COMMENT 'FK to users.id',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Admin creation date'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin role mapping';

--
-- Dumping data untuk tabel `admins`
--

INSERT INTO `admins` (`id`, `created_at`) VALUES
('admin-abt-001', '2026-03-06 09:10:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `chart_sync_log`
--

CREATE TABLE `chart_sync_log` (
  `menu_section` varchar(80) NOT NULL COMMENT 'e.g. student_achievements, study_period',
  `last_synced_at` timestamp NULL DEFAULT NULL COMMENT 'Last sync from master (Asia/Jakarta)',
  `synced_by` varchar(36) DEFAULT NULL COMMENT 'FK users.id',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Last sync time per dashboard section';

--
-- Dumping data untuk tabel `chart_sync_log`
--

INSERT INTO `chart_sync_log` (`menu_section`, `last_synced_at`, `synced_by`, `created_at`, `updated_at`) VALUES
('active_students', '2026-03-06 09:24:26', 'admin-001', '2026-03-06 09:00:03', '2026-03-06 09:24:26'),
('publications', '2026-03-14 19:42:47', NULL, '2026-03-06 09:00:03', '2026-03-14 19:42:47'),
('research_outputs', '2026-03-14 20:01:09', 'admin-abt-001', '2026-03-06 09:00:03', '2026-03-14 20:01:09'),
('student_achievements', '2026-03-14 19:42:47', NULL, '2026-03-06 09:00:03', '2026-03-14 19:42:47'),
('student_products', '2026-03-14 19:42:47', NULL, '2026-03-06 09:00:03', '2026-03-14 19:42:47'),
('study_period', '2026-03-06 09:24:26', 'admin-001', '2026-03-06 09:00:03', '2026-03-06 09:24:26'),
('waiting_time', '2026-03-14 19:48:43', 'admin-abt-001', '2026-03-06 09:00:03', '2026-03-14 19:48:43'),
('work_coverage', '2026-03-15 07:33:55', 'admin-abt-001', '2026-03-06 09:00:03', '2026-03-15 07:33:55');

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluations`
--

CREATE TABLE `evaluations` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp',
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin/system actor id that moved evaluation to Recycle Bin'
) ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluation_aspects`
--

CREATE TABLE `evaluation_aspects` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `code` varchar(50) NOT NULL COMMENT 'Stable aspect code',
  `name` varchar(255) NOT NULL COMMENT 'Aspect display label',
  `sort_order` int(11) NOT NULL COMMENT 'Display order',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Aspect active flag',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp'
) ;

--
-- Dumping data untuk tabel `evaluation_aspects`
--

INSERT INTO `evaluation_aspects` (`id`, `code`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
('asp-001', 'etika', 'Etika', 1, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-002', 'kompetensi_utama', 'Keahlian pada bidang ilmu (kompetensi utama)', 2, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-003', 'bahasa_asing', 'Kemampuan berbahasa asing', 3, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-004', 'teknologi_informasi', 'Penggunaan teknologi informasi', 4, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-005', 'komunikasi', 'Kemampuan berkomunikasi', 5, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-006', 'kerjasama', 'Kerjasama', 6, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-007', 'pengembangan_diri', 'Pengembangan diri', 7, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-008', 'loyalitas_tujuan', 'Loyalitas terhadap tujuan perusahaan', 8, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-009', 'integritas_pergaulan', 'Integritas diri dalam pergaulan di perusahaan', 9, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21'),
('asp-010', 'manajemen_waktu', 'Kemampuan mengelola waktu kerja', 10, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluation_invitations`
--

CREATE TABLE `evaluation_invitations` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update timestamp'
) ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluation_responses`
--

CREATE TABLE `evaluation_responses` (
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
  `submitted_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Response submission timestamp',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Survey response header data';

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluation_response_ratings`
--

CREATE TABLE `evaluation_response_ratings` (
  `id` varchar(36) NOT NULL COMMENT 'UUID-like id',
  `response_id` varchar(36) NOT NULL COMMENT 'FK to evaluation_responses',
  `aspect_id` varchar(36) NOT NULL COMMENT 'FK to evaluation_aspects',
  `score` tinyint(3) UNSIGNED NOT NULL COMMENT 'Rating score: 1-5',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp'
) ;

-- --------------------------------------------------------

--
-- Struktur dari tabel `evaluation_token_blacklist`
--

CREATE TABLE `evaluation_token_blacklist` (
  `token` varchar(128) NOT NULL COMMENT 'Superseded access_token',
  `evaluation_id` varchar(36) NOT NULL COMMENT 'FK to evaluations',
  `invalidated_at` timestamp NOT NULL DEFAULT current_timestamp() COMMENT 'When token was replaced by resend'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens invalidated when admin resends evaluation link';

-- --------------------------------------------------------

--
-- Struktur dari tabel `export_logs`
--

CREATE TABLE `export_logs` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `admin_id` varchar(36) NOT NULL COMMENT 'FK users.id',
  `menu_section` varchar(80) NOT NULL,
  `format` enum('csv','xlsx','pdf') NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'e.g. {"year": 2024}' CHECK (json_valid(`filters`)),
  `exported_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Asia/Jakarta'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Export audit log';

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_active_students_records`
--

CREATE TABLE `menu_active_students_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menu_active_students_records`
--

INSERT INTO `menu_active_students_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('003da7d7fa7205b44d926b8fbf31e78747af', 'students', '003da7d7fa7205b44d926b8fbf31e78747af', '4.52.21.0.30', 'VIA OKTAFIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('01b057f17c3f11beec30e04171756d6e44b6', 'students', '01b057f17c3f11beec30e04171756d6e44b6', '4.52.20.0.25', 'SALSA AYU AZIZAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('01ef195987b6e544b4c75c5977d9da069f0d', 'students', '01ef195987b6e544b4c75c5977d9da069f0d', '4.52.20.1.16', 'NABILA NUR HALIZA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('042164db015bdd12a31d46284a579c9dfc8b', 'students', '042164db015bdd12a31d46284a579c9dfc8b', '4.52.20.1.19', 'NURUL CHASANATIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('046147ef4986d6d5d058a80f259d7a236606', 'students', '046147ef4986d6d5d058a80f259d7a236606', '4.52.19.0.15', 'IVA SALMA RAMADHANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0500f97f9d0ec4df20ee471998c24a7c91b5', 'students', '0500f97f9d0ec4df20ee471998c24a7c91b5', '4.52.25.1.09', 'DYAH AYU SURYORATRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('072eb1c753f07d7bc2bfc309e6a7d36cd324', 'students', '072eb1c753f07d7bc2bfc309e6a7d36cd324', '4.52.21.1.16', 'JULIATHA NABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('098da1e1846cb162baaccc4fefaa100f5768', 'students', '098da1e1846cb162baaccc4fefaa100f5768', '4.52.20.1.18', 'NELY FALAHATI SIYAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('09a0d7c79054d82dd5490c5421b42656ce63', 'students', '09a0d7c79054d82dd5490c5421b42656ce63', '4.52.21.1.08', 'DEKSA ALENIA ISNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('09ed011e1ca2bfe3dfd62a34d32fef2a98ac', 'students', '09ed011e1ca2bfe3dfd62a34d32fef2a98ac', '4.52.23.8.11', 'TSURAYA DIANETA DEVI ASAWIMANDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0a37791e154af6e9330d6de2c7df4c9eb192', 'students', '0a37791e154af6e9330d6de2c7df4c9eb192', '4.52.21.0.01', 'ABELIA RAHMA PRATIWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0acba23f6deaca46e6c3046fc358fe05fdd0', 'students', '0acba23f6deaca46e6c3046fc358fe05fdd0', '4.52.20.0.26', 'SALSABILA TIARA WIDYASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0c036e5e21e212a5127b62a7f883e2b0326b', 'students', '0c036e5e21e212a5127b62a7f883e2b0326b', '4.52.21.2.13', 'FAJAR MU\'MININ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0caa1788191a71ae13a6867d4645011ac53c', 'students', '0caa1788191a71ae13a6867d4645011ac53c', '4.52.20.1.20', 'RAHMA MAULINA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0cdeb89a48f1ee37289b6a2c7fab239ee9e2', 'students', '0cdeb89a48f1ee37289b6a2c7fab239ee9e2', '4.52.19.0.23', 'PRISMA DINDA ZASMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0da5bac192c69bb43398f3118da55a299576', 'students', '0da5bac192c69bb43398f3118da55a299576', '4.52.21.1.25', 'SAFIRA EKA FARIHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0dd96138b3b39a51e86d52be10f46aae1a3a', 'students', '0dd96138b3b39a51e86d52be10f46aae1a3a', '4.52.25.2.08', 'FADILAH AISYAH RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0ea178aacfa3b80105828ee44df1552f9e04', 'students', '0ea178aacfa3b80105828ee44df1552f9e04', '4.52.25.3.06', 'DIANA NURUL AINI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0f238004f161e0ad1abca141e54c13ad5795', 'students', '0f238004f161e0ad1abca141e54c13ad5795', '4.52.19.0.19', 'MUHAMMAD NAUFAL ARIF', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0f33510e0800aeb67f00fc185253b786dcf9', 'students', '0f33510e0800aeb67f00fc185253b786dcf9', '4.52.20.0.04', 'AQILA FITRI NUR KAMILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('101b39b15af5a49b72d1e607ad12c982ee30', 'students', '101b39b15af5a49b72d1e607ad12c982ee30', '4.52.20.1.02', 'ANGGRE FARHANNA JULIASANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('10b1c577897b45b18a3c46ba5aa5fcdb27e9', 'students', '10b1c577897b45b18a3c46ba5aa5fcdb27e9', '4.52.21.0.24', 'RIFDA ARDELIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('10cc142fa1ea032c48ed5d7704f29388cadc', 'students', '10cc142fa1ea032c48ed5d7704f29388cadc', '4.52.21.1.09', 'DIYAH AYU WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('17770c9721a4f4dccf875f7771b011f96fb4', 'students', '17770c9721a4f4dccf875f7771b011f96fb4', '4.52.25.0.01', 'ADIL SHERLYNA MELODI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('188d70f36ee6d464be612ce0c0bb3df06466', 'students', '188d70f36ee6d464be612ce0c0bb3df06466', '4.52.19.0.13', 'HANINA AMILA HUSNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('18c375036c52e93e25c5a823f25c8a372599', 'students', '18c375036c52e93e25c5a823f25c8a372599', '4.52.25.3.07', 'DINDA ISLAMI PASHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('19704b9d821cec1bc92ac7a561c67ba72886', 'students', '19704b9d821cec1bc92ac7a561c67ba72886', '4.52.20.0.29', 'VHIELA EKA PRAMITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('19af2f159fd0e7b28ddf5cc700b32b103eb8', 'students', '19af2f159fd0e7b28ddf5cc700b32b103eb8', '4.52.19.0.07', 'DIAH PUSPITA ANGGRAENI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1b0a06c4b8e586830fd48c483c000c662130', 'students', '1b0a06c4b8e586830fd48c483c000c662130', '4.52.21.0.19', 'NAJLA DEBI HABSARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1b9f37d7aaa59ca7d4ed0604027cb98736d5', 'students', '1b9f37d7aaa59ca7d4ed0604027cb98736d5', '4.52.25.2.12', 'KHOFIFATUL MAULANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1bca372eab5ab0697fa79943cc2b411d7c01', 'students', '1bca372eab5ab0697fa79943cc2b411d7c01', '4.52.25.3.11', 'HANUM ALIFFIA NUHAYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1c2ae505d51ef31b1c546b1011464e5745b7', 'students', '1c2ae505d51ef31b1c546b1011464e5745b7', '4.52.25.2.28', 'ZAHRA SALSABILA MAHDIYYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1cbbf30cb76aa72da75c6f808bfd0bf7fcda', 'students', '1cbbf30cb76aa72da75c6f808bfd0bf7fcda', '4.52.25.1.03', 'ANDINI EKA APRILIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1dc24a81835f7cb29ea3b8563d231752725b', 'students', '1dc24a81835f7cb29ea3b8563d231752725b', '4.52.21.1.07', 'BINTANG TITIS SATRIO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1df8fbfd0a23a1b0200b3d860423a9f012db', 'students', '1df8fbfd0a23a1b0200b3d860423a9f012db', '4.52.21.1.20', 'NOFITA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1e406ad065261aa023b781cb424af3adc9fd', 'students', '1e406ad065261aa023b781cb424af3adc9fd', '4.52.21.0.22', 'RAFI WILLY FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1f45989687e63395e2d6ad69c95b9894a413', 'students', '1f45989687e63395e2d6ad69c95b9894a413', '4.52.25.2.20', 'NOVELIA AGNIMAYA WIBOWO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2142109d7db8f73062a43ddabbb61931bfe3', 'students', '2142109d7db8f73062a43ddabbb61931bfe3', '4.52.25.3.18', 'NAJWA DINDA SEKAR ORCHITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('21b39b042ee5b48610bb4733e185324f8075', 'students', '21b39b042ee5b48610bb4733e185324f8075', '4.52.25.1.01', 'AISHA DAHAYU LAKSMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('21c28c6392c85c7617e1a0f090223b8e48b8', 'students', '21c28c6392c85c7617e1a0f090223b8e48b8', '4.52.19.0.08', 'DIDIN DARMAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('221bf8fbf5e1ccf02b63ca49098dbf58880a', 'students', '221bf8fbf5e1ccf02b63ca49098dbf58880a', '4.52.23.8.09', 'SEMUEL DENI KOROWA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('22209cf42a970d639016b70a4f4e6d66c704', 'students', '22209cf42a970d639016b70a4f4e6d66c704', '4.52.21.1.11', 'ENDAH NOER OCTAVIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2237a7efc239b3bafec1994795dae520ee1f', 'students', '2237a7efc239b3bafec1994795dae520ee1f', '4.52.25.1.08', 'DESTI MUSDALIFAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23bf399b4e5a0e409f870615c92a3de617e5', 'students', '23bf399b4e5a0e409f870615c92a3de617e5', '4.52.19.0.03', 'AUDRINA RAHMA AGUSTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23d7c7483feefa59fddade92c882f393a542', 'students', '23d7c7483feefa59fddade92c882f393a542', '4.52.25.1.29', 'ZYAHWA NOVIA SUKMA PRATIWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23f14b175d027f09b7e1bd386655f4a89329', 'students', '23f14b175d027f09b7e1bd386655f4a89329', '4.52.25.0.10', 'DZAKIA IMEL PUTRI FERDIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('281452bc2f38e43488c26c9e6ae34c2ec2cb', 'students', '281452bc2f38e43488c26c9e6ae34c2ec2cb', '4.52.20.1.08', 'ESTI RISHMA YULIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('290662834fa5625cc219e95ea3a71d40ba2f', 'students', '290662834fa5625cc219e95ea3a71d40ba2f', '4.52.21.0.26', 'SALMA AYA SOFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('29c65e619548b6cb9ff2b762fde79902fce4', 'students', '29c65e619548b6cb9ff2b762fde79902fce4', '4.52.20.0.21', 'NUR IMAM NAZIHAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2b7c323cacb1986984ff9ca7d3578df94ae1', 'students', '2b7c323cacb1986984ff9ca7d3578df94ae1', '4.52.20.1.27', 'SRI WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2bbe14f0a51d5a407761322b20ade9c9a79d', 'students', '2bbe14f0a51d5a407761322b20ade9c9a79d', '4.52.25.2.13', 'LUTFIA FAISYA AYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2cbaf1833f05fcb322c6cd35ab628712716f', 'students', '2cbaf1833f05fcb322c6cd35ab628712716f', '4.52.23.8.12', 'YOHANA YUSTIN WANDADAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2dd44ad64ab8a5736807530cba2c258ef929', 'students', '2dd44ad64ab8a5736807530cba2c258ef929', '4.52.20.0.16', 'MILATI PUJA KESUMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2e75f50ea4b9fed247e31ca1b2f5dcd2c8e0', 'students', '2e75f50ea4b9fed247e31ca1b2f5dcd2c8e0', '4.52.25.1.18', 'MUHAMMAD RIZKI RAMANDHIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2ea14c1244bd566dff94e9d5104307354788', 'students', '2ea14c1244bd566dff94e9d5104307354788', '4.52.25.1.07', 'DAVINA AURA DIOLITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('309361e4da6ebfb3f20f2b3b36d89c585287', 'students', '309361e4da6ebfb3f20f2b3b36d89c585287', '4.52.25.0.02', 'AFIFA TIARA RAHMADHANTY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3094b030d312128c982ce2bb3f0f7ed4f039', 'students', '3094b030d312128c982ce2bb3f0f7ed4f039', '4.52.19.0.18', 'MAUDIRA DWI SAFITRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('313784400d13ba34415046e26632c55f5fe6', 'students', '313784400d13ba34415046e26632c55f5fe6', '4.52.25.0.23', 'RIZQATUL JANNAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('33be31321e002e24460aab1e297db7d685c5', 'students', '33be31321e002e24460aab1e297db7d685c5', '4.52.25.2.06', 'DEWI ARRAHMAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('34f6faf63a0817b534eb0c281e839310e916', 'students', '34f6faf63a0817b534eb0c281e839310e916', '4.52.19.0.09', 'DIVA EGIDIA PERMATA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('360d188bd84427e7c7473bc108290cca3aed', 'students', '360d188bd84427e7c7473bc108290cca3aed', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3655995a6e791bbef362e88b925a8dbb6d16', 'students', '3655995a6e791bbef362e88b925a8dbb6d16', '4.52.20.1.23', 'RIZKY TRI FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('38bf659b7dd24692443bc35a111153356105', 'students', '38bf659b7dd24692443bc35a111153356105', '4.52.25.3.28', 'ZAFIRA RAHMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3c41934ff666bff2649995c95a8d5e3b82f4', 'students', '3c41934ff666bff2649995c95a8d5e3b82f4', '4.52.19.1.22', 'NURHASANAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3cb539456a4848fb084e6bd88c4a58ae8d05', 'students', '3cb539456a4848fb084e6bd88c4a58ae8d05', '4.52.19.0.24', 'RASYA KHANSA JAUZA AZHAAR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3dff91b79e4472cf670ac994dcafbe05160a', 'students', '3dff91b79e4472cf670ac994dcafbe05160a', '4.52.21.1.22', 'NURUL FATAKHILLAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3efa3bbc1a138e7b7b26d27eed910dd422cb', 'students', '3efa3bbc1a138e7b7b26d27eed910dd422cb', '4.52.21.0.27', 'SETIAWAN WIBOWO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3f43ebaf88dd37cc9ce03e211b381fd095d6', 'students', '3f43ebaf88dd37cc9ce03e211b381fd095d6', '4.52.25.1.11', 'FATIHA RAKA CHAIRUL FIQRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3f81402e0d588eb20d4d9dd83780ee0e1f1c', 'students', '3f81402e0d588eb20d4d9dd83780ee0e1f1c', '4.52.25.1.05', 'ATHAR KHAIZURAN RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3fb49f13c177d81b83b578cd2003a6f2a517', 'students', '3fb49f13c177d81b83b578cd2003a6f2a517', '4.52.25.0.05', 'ARLYNNISA SALSABYLA PANJAITAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('41bcf392128ab31c074537bcf2668b732cc0', 'students', '41bcf392128ab31c074537bcf2668b732cc0', '4.52.19.1.16', 'LUTHFIYA ISTIQOMAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4353d04a9cea1dec78b66a7c25277b1e7a3d', 'students', '4353d04a9cea1dec78b66a7c25277b1e7a3d', '4.52.20.0.23', 'RAKA SETIA DINATA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('43a8619acbe1bc7ce7bf13ef56a41da3fc74', 'students', '43a8619acbe1bc7ce7bf13ef56a41da3fc74', '4.52.21.2.24', 'REDITE CAHYO PERMADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('43aacbc7c75005dda2442d914ee6da969aa4', 'students', '43aacbc7c75005dda2442d914ee6da969aa4', '4.52.19.0.20', 'NADYA AURIGA RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('445c0cd09e47f3f893a0ed5ab27f64d73773', 'students', '445c0cd09e47f3f893a0ed5ab27f64d73773', '4.52.25.2.02', 'ANNISA RAMADHANI ASMARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('44d4dcbf47c40222d37704fc22a9a41e8ba4', 'students', '44d4dcbf47c40222d37704fc22a9a41e8ba4', '4.52.25.2.07', 'ERFIZZA CHAIRINA LATANSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('45b10e8213b0dcd14f4220db8d6579ab9a08', 'students', '45b10e8213b0dcd14f4220db8d6579ab9a08', '4.52.19.1.19', 'MUHAMMAD DAFFA EL HAQ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('48283e21ee804e25c38412ae3aeae9c5e678', 'students', '48283e21ee804e25c38412ae3aeae9c5e678', '4.52.21.2.15', 'HAIDAR FARUQI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('482e52763d6311ad43c18e819b501653cba2', 'students', '482e52763d6311ad43c18e819b501653cba2', '4.52.20.0.18', 'MUHAMMAD FARHAN ARIO PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4a58cb6f3ab1f00d83bf47df96f49b4cc27b', 'students', '4a58cb6f3ab1f00d83bf47df96f49b4cc27b', '4.52.20.1.13', 'M. RIKI FAUZI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4aea3b423c2d3dcd5e11ba9f556cbe8be1b4', 'students', '4aea3b423c2d3dcd5e11ba9f556cbe8be1b4', '4.52.21.0.15', 'GABRIEL MARINDA ALVERA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4b98fd31d17247da0d7927f40f0f694b4756', 'students', '4b98fd31d17247da0d7927f40f0f694b4756', '4.52.21.2.28', 'SAVINA UMI LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4bdcdea18df895c7d617363101129f2e8450', 'students', '4bdcdea18df895c7d617363101129f2e8450', '4.52.19.1.15', 'KHANSA ATALLAH AUFANISWARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4cce5c9e75390ea9de787c9aa0d1d8e3c895', 'students', '4cce5c9e75390ea9de787c9aa0d1d8e3c895', '4.52.21.1.01', 'AHMAD FADHOL IBAWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4de4e2e887d4f3e90720484977256629d156', 'students', '4de4e2e887d4f3e90720484977256629d156', '4.52.20.1.10', 'FICRYNA SHULCHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4df6178940e2836c17a295526f36b1850fde', 'students', '4df6178940e2836c17a295526f36b1850fde', '4.52.20.1.12', 'LINTANG SWARESKA SARASWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4e7f0f558c12d10aa243d3ca79b636f97ba0', 'students', '4e7f0f558c12d10aa243d3ca79b636f97ba0', '4.52.20.0.28', 'TALITHA DWI WIRASTUTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4f23a887e77e23cbbea0e5ef55bc7769e79b', 'students', '4f23a887e77e23cbbea0e5ef55bc7769e79b', '4.52.20.0.08', 'ERLANGGA PUTRA WIJAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('50ba95539c1dabd077300b2d04f0a64f3d65', 'students', '50ba95539c1dabd077300b2d04f0a64f3d65', '4.52.25.2.05', 'DESTRI RAHMA SINTA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('515603ec92998b19246c2136ab3867e3bfc7', 'students', '515603ec92998b19246c2136ab3867e3bfc7', '4.52.20.1.29', 'YUANITA AMALIA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('525e2ae887ce7e8eab2003585e73c2e25912', 'students', '525e2ae887ce7e8eab2003585e73c2e25912', '4.52.19.1.20', 'NABILA FIRDA ALFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5271818e247c627b22a6288058d95976a783', 'students', '5271818e247c627b22a6288058d95976a783', '4.52.19.0.17', 'LATIFATU ZAKIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5291bc834e51af8c41d39ac5e524290491dc', 'students', '5291bc834e51af8c41d39ac5e524290491dc', '4.52.25.2.09', 'FANDY ADITYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('529fc33388f338dec8363c442676fc99cf22', 'students', '529fc33388f338dec8363c442676fc99cf22', '4.52.20.0.11', 'FADILLA DWI RAHAYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('52d3681943ce6fa6fc5bd547bff45c78713f', 'students', '52d3681943ce6fa6fc5bd547bff45c78713f', '4.52.21.1.21', 'NUR KHASANAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('53667feb06b20509a92dd3b0d90d27a458e3', 'students', '53667feb06b20509a92dd3b0d90d27a458e3', '4.52.21.0.20', 'NANA SOVIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('53723f0676969ac955f9c96bfc0a21e67d60', 'students', '53723f0676969ac955f9c96bfc0a21e67d60', '4.52.25.0.11', 'FAUZI IZZI ITSAR ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('539b70b0bc6e652a73b318edf0413e652bce', 'students', '539b70b0bc6e652a73b318edf0413e652bce', '4.52.25.0.28', 'VIO ANTHAREZA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5507dcf6d6a78ce39cbc690cf4600f5d6646', 'students', '5507dcf6d6a78ce39cbc690cf4600f5d6646', '4.52.20.0.20', 'NAILA DIVA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('551e8f6f02658105e21956a0a62de947290c', 'students', '551e8f6f02658105e21956a0a62de947290c', '4.52.19.0.22', 'NISRINA AYU SEPTIANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('55c0a23dc270d290682a65e61b8d755f302c', 'students', '55c0a23dc270d290682a65e61b8d755f302c', '4.52.20.0.09', 'ERLYAN FERDIANNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('56b2b9a62f800ceb85ca241baf4cee3d1260', 'students', '56b2b9a62f800ceb85ca241baf4cee3d1260', '4.52.18.1.12', 'INDIE DELIMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2018, '{\"tahun_masuk\":2018}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5835e296d1ecd15c4be9022181cc0788af3e', 'students', '5835e296d1ecd15c4be9022181cc0788af3e', '4.52.21.1.18', 'MUHAMMAD FACHRUR HIDAYAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('58b1d15cde462eb6f8a2713afd96421b6fd8', 'students', '58b1d15cde462eb6f8a2713afd96421b6fd8', '4.52.25.0.14', 'JILTERIZA MAYLAFAYZA DESTYA HADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('591e8a8155a1c58ff3ff663a91ddd0aedc6e', 'students', '591e8a8155a1c58ff3ff663a91ddd0aedc6e', '4.52.20.1.21', 'RAMA TAUFIQURROHMAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5986df87156cacd99ef6ac5dea84400f3c4f', 'students', '5986df87156cacd99ef6ac5dea84400f3c4f', '4.52.21.1.06', 'BETY PUJI RAHAYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ad31c6908702df08a5e7506aa065efd9618', 'students', '5ad31c6908702df08a5e7506aa065efd9618', '4.52.19.0.14', 'HESTI ELI TRIASMORO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5adf0071bf160c34ff04f3282bcd41a04c91', 'students', '5adf0071bf160c34ff04f3282bcd41a04c91', '4.52.21.0.25', 'RINDANG RIZKIDEWA FAJARAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5bb7b973e42002907630f37cac6b6d69274a', 'students', '5bb7b973e42002907630f37cac6b6d69274a', '4.52.25.2.01', 'ALIFIA MAHARANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5c12e523c99c34a70e22e97b591b60f54371', 'students', '5c12e523c99c34a70e22e97b591b60f54371', '4.52.19.0.02', 'ANNE OKTANAFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ca46ea2bf48ad08a093981c9994d6b826ef', 'students', '5ca46ea2bf48ad08a093981c9994d6b826ef', '4.52.25.1.10', 'ELFRIEDA GRACE NATALIE', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5cf2db78b73106f4ee68ad839b83986e3a91', 'students', '5cf2db78b73106f4ee68ad839b83986e3a91', '4.52.25.1.24', 'SALMA NADIYA FENANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5e1aff6f31bf4cee1abc304574eb282bf4cd', 'students', '5e1aff6f31bf4cee1abc304574eb282bf4cd', '4.52.19.0.12', 'FERDIANSYAH NAUFAL RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ecc2ab483b3bce40b1ed24a174619f84f6d', 'students', '5ecc2ab483b3bce40b1ed24a174619f84f6d', '4.52.21.1.02', 'ALIF RAFLY PRADITHIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ef0cef33e04a9603f5de83158075a9120d3', 'students', '5ef0cef33e04a9603f5de83158075a9120d3', '4.52.20.1.11', 'KALISTA KUNTI PRAMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5f27c1accffa6ecde47acbdc8f373b68520f', 'students', '5f27c1accffa6ecde47acbdc8f373b68520f', '4.52.25.0.22', 'RAIHANI ZULFA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6068d2534c4501ceb550cefec837a72520b2', 'students', '6068d2534c4501ceb550cefec837a72520b2', '4.52.25.2.04', 'AULIA NAZUWA YULIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('607dd90a64d383304b98bd41d8cc47a127f3', 'students', '607dd90a64d383304b98bd41d8cc47a127f3', '4.52.25.1.20', 'NAUFAL DZAKI ARDHIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('61f375392b3e6cb2c806e5041458a7640670', 'students', '61f375392b3e6cb2c806e5041458a7640670', '4.52.21.2.21', 'PAULINA KARTIKA AJENG LARASATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('622ffa11ee1cfdc9668e7e4de11359824b30', 'students', '622ffa11ee1cfdc9668e7e4de11359824b30', '4.52.20.0.30', 'YUDHA ESA PRIBADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('64afefd8fe156eb8d79c087c3f30418e496c', 'students', '64afefd8fe156eb8d79c087c3f30418e496c', '4.52.19.1.17', 'MARETA MARGAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('64e76435bb26eed1ec5af4a891e1bb598ace', 'students', '64e76435bb26eed1ec5af4a891e1bb598ace', '4.52.25.3.16', 'MUHAMMAD HAKIM MAULANA HALBA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('656f34a5b1f1bb9ce493fd7966b1d36e90b5', 'students', '656f34a5b1f1bb9ce493fd7966b1d36e90b5', '4.52.19.1.09', 'ERICHA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('674760a9ec2f5c87a8350c6f95958f07e16a', 'students', '674760a9ec2f5c87a8350c6f95958f07e16a', '4.52.25.1.04', 'ANGGI LAUDIYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('67575183f10d0d500ac6afbc22d0db667e0a', 'students', '67575183f10d0d500ac6afbc22d0db667e0a', '4.52.25.1.27', 'TALITHA NAFISA RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6872fe7e9ca8c321513b3c5db6a208cdec40', 'students', '6872fe7e9ca8c321513b3c5db6a208cdec40', '4.52.25.0.29', 'ZIDNII SURYA SABRANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('688242b2399969fee180c8f059443a5c44cd', 'students', '688242b2399969fee180c8f059443a5c44cd', '4.52.25.2.25', 'TARA LATIFAH TAUFIQA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('68e6ba31f87851f9821434adf03764befc87', 'students', '68e6ba31f87851f9821434adf03764befc87', '4.52.19.0.11', 'FEBRY KOMALA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('69317fbce0902ef6012fb17881abdeb013bf', 'students', '69317fbce0902ef6012fb17881abdeb013bf', '4.52.19.1.27', 'SYIFA FADILAH ARIYANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6bdc298a03c0dbacf359a628892e73aa0466', 'students', '6bdc298a03c0dbacf359a628892e73aa0466', '4.52.25.3.08', 'EUGENIUS JESSEYRO FAREL ARDANA PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6c5445047c96d0a61fbf9eeb241eac70e15e', 'students', '6c5445047c96d0a61fbf9eeb241eac70e15e', '4.52.19.0.16', 'JULIA ANGGUN PRAVITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6de60a284a66f721ea44950ff7e7331d7cef', 'students', '6de60a284a66f721ea44950ff7e7331d7cef', '4.52.21.2.20', 'NURBIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6f7e05bcddad07ef178b4873bde430a2f5d7', 'students', '6f7e05bcddad07ef178b4873bde430a2f5d7', '4.52.25.1.13', 'HAFSHAH AULIA AZ ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6fa6ccefc13a5074d913933e34b5a9e25204', 'students', '6fa6ccefc13a5074d913933e34b5a9e25204', '4.52.20.0.06', 'ATHAYA AURELLIA RIFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6fcd2599645a33ca32de7ac29763a126dd68', 'students', '6fcd2599645a33ca32de7ac29763a126dd68', '4.52.21.1.04', 'ARIELLA PUTRI WIDY AYUDITHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('70ad246bdf93291f2fbedb09edeb38aa2029', 'students', '70ad246bdf93291f2fbedb09edeb38aa2029', '4.52.20.1.28', 'TARA AYUNINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('71515584569fb5e50abefe27c2e6b23b4abc', 'students', '71515584569fb5e50abefe27c2e6b23b4abc', '4.52.25.2.14', 'MAQFIRRAH LAILY RAMADHANIA FAISAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7476eb30c82032ac1994977ba375631ac609', 'students', '7476eb30c82032ac1994977ba375631ac609', '4.52.21.2.30', 'ZAKKY AL MUBARAK', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('757f8cc2bfc347d4bf4d3341426175c198b2', 'students', '757f8cc2bfc347d4bf4d3341426175c198b2', '4.52.25.2.11', 'KALYCA ZAHRA AZALIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('75e23d523ed908fe745bb255daf48126a57e', 'students', '75e23d523ed908fe745bb255daf48126a57e', '4.52.20.0.07', 'DEANDRA AURORA PRADIPTA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('76266e35ddc8daf68968093ab3840ed5fd32', 'students', '76266e35ddc8daf68968093ab3840ed5fd32', '4.52.19.1.30', 'VICKA AZIZIAH MAULANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('76c494e146b3916e9ab33c5d8615749cc79c', 'students', '76c494e146b3916e9ab33c5d8615749cc79c', '4.52.25.3.17', 'NADHIFA AMANDA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('779347cc85e72e8d334347ec3c78bd94f6cf', 'students', '779347cc85e72e8d334347ec3c78bd94f6cf', '4.52.25.3.02', 'ALYSHA JASMINE YULIANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('784c0fabdeaaaa0acd3e3cf790df2b6c4f2e', 'students', '784c0fabdeaaaa0acd3e3cf790df2b6c4f2e', '4.52.25.1.25', 'SHOFIYATUR RUHANIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('794a44596044ec4425e94de44f884c367120', 'students', '794a44596044ec4425e94de44f884c367120', '4.52.21.2.14', 'FARAH HUSNA PRAMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('79e27a30e005bea5851cf5d3b6a95d92e27c', 'students', '79e27a30e005bea5851cf5d3b6a95d92e27c', '4.52.25.3.05', 'AZZAHRA PUTRI NURHIDAYAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7a93b304d457de12fb08300e1ba391e7d599', 'students', '7a93b304d457de12fb08300e1ba391e7d599', '4.52.19.0.27', 'SALSABILLA ALTEZA PRAMESWARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7b59b4af6821e777db73e457890354cf99f5', 'students', '7b59b4af6821e777db73e457890354cf99f5', '4.52.19.1.13', 'INAS SALMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7c5435578ad4f1bd96292bd0402a6c8266de', 'students', '7c5435578ad4f1bd96292bd0402a6c8266de', '4.52.25.2.17', 'MUHAMMAD YUDHISTIRA KHAIRIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7c690d99945d50761194bb830b90e0d56770', 'students', '7c690d99945d50761194bb830b90e0d56770', '4.52.25.1.06', 'CINTA LISTIA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7e04f872a05180f45ca77f02c5dc551cc24c', 'students', '7e04f872a05180f45ca77f02c5dc551cc24c', '4.52.19.0.10', 'ERDIAN DWI RACHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7eea370881f9d6353e1e3dbea0a29ab497e8', 'students', '7eea370881f9d6353e1e3dbea0a29ab497e8', '4.52.19.0.30', 'SUTIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('80965fbdab75f13869f034efe1367153fd46', 'students', '80965fbdab75f13869f034efe1367153fd46', '4.52.25.3.15', 'MUHAMMAD AZHAR RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('80abf8023ddd2c8f77f45980703084928562', 'students', '80abf8023ddd2c8f77f45980703084928562', '4.52.25.2.21', 'PUTRI NUR NABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('81655187b41ee89c8acf40bc994ca3ddd833', 'students', '81655187b41ee89c8acf40bc994ca3ddd833', '4.52.21.0.10', 'DIVIA CAHYA BULAN RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('83b5c4bfc37258642c903c5c419c58135ae2', 'students', '83b5c4bfc37258642c903c5c419c58135ae2', '4.52.25.3.03', 'ASTI MARLINA FEBRIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('85da1612b75cc7c381d1cc12a0868080bcf3', 'students', '85da1612b75cc7c381d1cc12a0868080bcf3', '4.52.23.8.08', 'REGHINA NURALISYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8604364403de2b6f4e7fdc017acc13ef9cc1', 'students', '8604364403de2b6f4e7fdc017acc13ef9cc1', '4.52.21.0.18', 'MODESTA DHEA MARSHEILLA SAVIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('86f5fbe54a77680d085d95f5d18ff7470536', 'students', '86f5fbe54a77680d085d95f5d18ff7470536', '4.52.20.0.12', 'LAKSAMANA MUQSITHU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87a856efedc0080606e96f91d7977f2f5003', 'students', '87a856efedc0080606e96f91d7977f2f5003', '4.52.20.0.22', 'RACHMADIAN NURWULAN FITRIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87ccf34b080baa0a3d722d5bb3335c49318c', 'students', '87ccf34b080baa0a3d722d5bb3335c49318c', '4.52.20.0.14', 'LUTFI RIDHOWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87da855432b8a38f6599563fd10f925e14a6', 'students', '87da855432b8a38f6599563fd10f925e14a6', '4.52.21.1.12', 'FADILA BERLIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('88c6e621aa070879b0dd70935a7539c1caa0', 'students', '88c6e621aa070879b0dd70935a7539c1caa0', '4.52.25.3.04', 'AZKA ZULIDA RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('890150304b390253b1eee29b47fc6e56af5f', 'students', '890150304b390253b1eee29b47fc6e56af5f', '4.52.21.1.23', 'RAHMA FATHIMATUZ ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8af7feab66dfafe3582e82ef5edf78323c9f', 'students', '8af7feab66dfafe3582e82ef5edf78323c9f', '4.52.25.0.18', 'NAJWAN ZAAKIY RAFATA HERMAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8b184351e1c5a6f4f54288d3e660b8a9a48b', 'students', '8b184351e1c5a6f4f54288d3e660b8a9a48b', '4.52.19.1.05', 'ASTI KHOERUNISA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8c0a8e7278e00a4c6366a12ea212f50af639', 'students', '8c0a8e7278e00a4c6366a12ea212f50af639', '4.52.21.2.29', 'ULYA AMRINA ROSYADA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8c4f84f9f7a2a50c4797f028f2188fd4aabf', 'students', '8c4f84f9f7a2a50c4797f028f2188fd4aabf', '4.52.25.0.25', 'SHELLOMITA DEVINA PRASTICA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8d255ba2a98375b9e9b6dbb0efda90fe26b9', 'students', '8d255ba2a98375b9e9b6dbb0efda90fe26b9', '4.52.25.3.12', 'KUN ASHRI RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8d552a500a42bb233355dfd56375dc7d6d10', 'students', '8d552a500a42bb233355dfd56375dc7d6d10', '4.52.21.0.06', 'AZZAM ALHAFHIZD', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8d5bca3c835456496c227129732982bd7ae7', 'students', '8d5bca3c835456496c227129732982bd7ae7', '4.52.23.8.07', 'PUTRA HOFNI BUANG KARUAPI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8eb9fa5350989550275382b57f6d80bfcff5', 'students', '8eb9fa5350989550275382b57f6d80bfcff5', '4.52.20.1.15', 'MICHELLA DENINTA SULISTYO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8efb30b3c52026e0d9c35dd84214c852ca0c', 'students', '8efb30b3c52026e0d9c35dd84214c852ca0c', '4.52.25.3.09', 'FATIMAH NUR JANNATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('904ff18404fd9e86462c373322c3444b9171', 'students', '904ff18404fd9e86462c373322c3444b9171', '4.52.25.2.10', 'HANNA LAA TAHZAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('90e5f740abaa25740c2eb4b277554670c9cc', 'students', '90e5f740abaa25740c2eb4b277554670c9cc', '4.52.20.0.05', 'ARDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('92a6f58e9bd8c45be3f82b12241ebd138094', 'students', '92a6f58e9bd8c45be3f82b12241ebd138094', '4.52.21.2.18', 'MEILINA DYAH SETYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('92c4ac55345063c8392d6110d6555a0e8c0d', 'students', '92c4ac55345063c8392d6110d6555a0e8c0d', '4.52.25.0.13', 'GABRIELLE NATALIE WIJAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('93dd0095d8410167da9ab4bb4c7a56b29fae', 'students', '93dd0095d8410167da9ab4bb4c7a56b29fae', '4.52.19.1.23', 'PUTRI SEKARLANGIT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('93e80dd6b7eb89d4056d3ac82c2020213165', 'students', '93e80dd6b7eb89d4056d3ac82c2020213165', '4.52.20.1.26', 'SINTA BELA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('94047b792f7683892086af5477fb74d01d48', 'students', '94047b792f7683892086af5477fb74d01d48', '4.52.25.1.26', 'SYAHLA GRISELDA RISANDRIYAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('94773b87d2a5bce7ba86095d3bd257f15c56', 'students', '94773b87d2a5bce7ba86095d3bd257f15c56', '4.52.25.2.15', 'MARTASYA CAHYANING MUKTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('950839c3297aff0c65849a2a98ccfe511b03', 'students', '950839c3297aff0c65849a2a98ccfe511b03', '4.52.21.0.17', 'MIRZA DZAKI KAMAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26');
INSERT INTO `menu_active_students_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('957746a7a39334cfae09b368aff30179f009', 'students', '957746a7a39334cfae09b368aff30179f009', '4.52.25.2.24', 'SEFANYA MISA EGRINA S KEMBAREN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('96a7eb0f0b1d8abdf90083d482c7fec0cc7c', 'students', '96a7eb0f0b1d8abdf90083d482c7fec0cc7c', '4.52.20.0.15', 'MAYDISTA LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('97793e6174717ee08cbc78edceb14dd7baf4', 'students', '97793e6174717ee08cbc78edceb14dd7baf4', '4.52.25.1.28', 'TASYA LATIFA ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('99bec0bbb9b65c0fb6804a54b6f5396789be', 'students', '99bec0bbb9b65c0fb6804a54b6f5396789be', '4.52.25.0.07', 'CHELSEA AULIA RAMADHANI PUSPO HAPSARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('99f2d2709f09965142760c9b5d240d0a4faa', 'students', '99f2d2709f09965142760c9b5d240d0a4faa', '4.52.21.0.11', 'ELSA MAHARANI KUMAAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a20182e693a156c56995df05020766eb62c', 'students', '9a20182e693a156c56995df05020766eb62c', '4.52.21.0.14', 'FARSYA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a582c8b4b52954a4d95d48eac52c68cc633', 'students', '9a582c8b4b52954a4d95d48eac52c68cc633', '4.52.19.0.29', 'SHINTA SUGIARTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a68846ce979d1bd5c351817cb899ad435b0', 'students', '9a68846ce979d1bd5c351817cb899ad435b0', '4.52.25.3.01', 'ADELIA AYU SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a81afa5d7e05a31f4de6c251ef07e95e54e', 'students', '9a81afa5d7e05a31f4de6c251ef07e95e54e', '4.52.25.3.25', 'SEVIA SENTRA HATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a87ccf8b88c20883cb04699d3d87c932093', 'students', '9a87ccf8b88c20883cb04699d3d87c932093', '4.52.25.0.26', 'STEFANE JOY LOVTIANDRO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9aab5d951118a2a96539e8678e763c4edf0c', 'students', '9aab5d951118a2a96539e8678e763c4edf0c', '4.52.19.1.18', 'MOHAMAD WIRA YUDA SAWEGA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9ac63b0b7dc5a133d15423b48637e095cd80', 'students', '9ac63b0b7dc5a133d15423b48637e095cd80', '4.52.19.1.25', 'SHELVIA CHETRIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9c47172769005bad86a254532b741d1a1737', 'students', '9c47172769005bad86a254532b741d1a1737', '4.52.21.1.30', 'ZALFA LARASATI FADILLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9caa0be42087abf642e127604a95bf2a6666', 'students', '9caa0be42087abf642e127604a95bf2a6666', '4.52.20.1.17', 'NABILA RAHMASARY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9d3c0b083e3b15843919a5cfbd7510552712', 'students', '9d3c0b083e3b15843919a5cfbd7510552712', '4.52.21.0.28', 'SRI WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9d4b6a88fcfb4e162b4f3afe03aa1104c853', 'students', '9d4b6a88fcfb4e162b4f3afe03aa1104c853', '4.52.21.0.02', 'ADINDA HEMAS RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9f6abf469a91eb1958916a41c32f1851dc2c', 'students', '9f6abf469a91eb1958916a41c32f1851dc2c', '4.52.21.2.06', 'AVERIL PRAMUDITA PRIADANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9f927b1678f043e65942ede96b03c630887b', 'students', '9f927b1678f043e65942ede96b03c630887b', '4.52.25.2.23', 'SAVIRA YULIA INDRIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9fb0608ecadb8485298fb9c397cd7519e645', 'students', '9fb0608ecadb8485298fb9c397cd7519e645', '4.52.19.1.06', 'ASYIFANI LUTHFIYYAH ANNASYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a059e45e68d895d20668b180be081a31f120', 'students', 'a059e45e68d895d20668b180be081a31f120', '4.52.21.2.17', 'LULUK PUTRI LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a0a2b4841b4a6864179c6de00c225f63e57d', 'students', 'a0a2b4841b4a6864179c6de00c225f63e57d', '4.52.25.2.16', 'MOSES SURYA PRAKOSO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a1a4c9d0d4190e71a933e869c3b9be05763c', 'students', 'a1a4c9d0d4190e71a933e869c3b9be05763c', '4.52.21.1.27', 'SOFIAH LAILA RAHMANIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a20ecd3f5bdcc37fc64af24a628b4781faee', 'students', 'a20ecd3f5bdcc37fc64af24a628b4781faee', '4.52.25.3.10', 'FIRDA AULIA PAZA UTAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a41209242f17cb720a5c4f97d6929f771b6a', 'students', 'a41209242f17cb720a5c4f97d6929f771b6a', '4.52.25.2.18', 'NADILA ARIVIANA TRI ANTIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a47f757c1c43c783191f57e58925ee20e684', 'students', 'a47f757c1c43c783191f57e58925ee20e684', '4.52.20.0.24', 'RATNA SETIYAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a49fafcdfcf2836dcf151050346791db3f19', 'students', 'a49fafcdfcf2836dcf151050346791db3f19', '4.52.19.0.25', 'RIEGGA RHEZA FERDIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a4b8e63b7cdcf7e50ca41748b5b8c8d04317', 'students', 'a4b8e63b7cdcf7e50ca41748b5b8c8d04317', '4.52.20.1.25', 'SALMA PUTRI KHANSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a54f01125f6c20fe2ebf73ea4cf3388d7cb0', 'students', 'a54f01125f6c20fe2ebf73ea4cf3388d7cb0', '4.52.25.3.23', 'RIO HENDARTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a6223abf1e0de740922b2d97155dd54b1458', 'students', 'a6223abf1e0de740922b2d97155dd54b1458', '4.52.20.0.02', 'ADZIMA QALSUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a69de929464423f4dd3902d9d78d9122b24a', 'students', 'a69de929464423f4dd3902d9d78d9122b24a', '4.52.25.0.16', 'MUHAMMAD DWI RIZKI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a7681a1392183d931569c397f530d6421e96', 'students', 'a7681a1392183d931569c397f530d6421e96', '4.52.25.0.09', 'DIANDRA ASYLA PUTRI ZAHIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a9000ee755ef6a121727ef93f811d663e640', 'students', 'a9000ee755ef6a121727ef93f811d663e640', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a94793722eba0d837e767e459c5bcf71f691', 'students', 'a94793722eba0d837e767e459c5bcf71f691', '4.52.19.1.28', 'TRIYAMAH SOLIHATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a96a8bf440a39255fe83cdb41f4271e4e373', 'students', 'a96a8bf440a39255fe83cdb41f4271e4e373', '4.52.21.1.17', 'M. FAHRUR RIZKI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('aad2131c222d316ad506c1575bd48c41eb37', 'students', 'aad2131c222d316ad506c1575bd48c41eb37', '4.52.25.2.27', 'WAHENDRA JAYA PRAYITNO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ada57d6df5da9fe7559c2677f06f3adefef0', 'students', 'ada57d6df5da9fe7559c2677f06f3adefef0', '4.52.23.8.04', 'HARDI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ae582392b5f0ba4c78e5d5960f338c258c8a', 'students', 'ae582392b5f0ba4c78e5d5960f338c258c8a', '4.52.25.3.27', 'SUCI AULIA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ae7d0c7104569dfdc831374449d941adccd7', 'students', 'ae7d0c7104569dfdc831374449d941adccd7', '4.52.25.3.26', 'SOFYA ANGEL KEYSYA DEWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af01c1708a409cb69d21e0dc57fd2c15382e', 'students', 'af01c1708a409cb69d21e0dc57fd2c15382e', '4.52.19.1.10', 'FATIMAH ZAKIYATUL FITRIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af1d1679f3e43ed77a9c17d9d34884c8fcbe', 'students', 'af1d1679f3e43ed77a9c17d9d34884c8fcbe', '4.52.25.1.12', 'FRISCA DWI SEPTIANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af6beeabf4edb555e8316de9befbd1ee4e42', 'students', 'af6beeabf4edb555e8316de9befbd1ee4e42', '4.52.20.0.10', 'ERVINA AYU PERMATASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('afb01f91442e2e711b738aa9065247c5049b', 'students', 'afb01f91442e2e711b738aa9065247c5049b', '4.52.21.2.22', 'PINKY ALVIYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b28168767b3dbf0055288d35ae968f3bb3e0', 'students', 'b28168767b3dbf0055288d35ae968f3bb3e0', '4.52.25.1.16', 'MERRYS MARGARETHA PUTRI REIMAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b2c3d5dc7c963fd39728f292908955d6117b', 'students', 'b2c3d5dc7c963fd39728f292908955d6117b', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2018, '{\"tahun_masuk\":2018}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b30ac717e844424b6dd831cce92e66af7019', 'students', 'b30ac717e844424b6dd831cce92e66af7019', '4.52.25.0.24', 'SABRINA IBROSA SEPTIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3ab7a6e7381af4575b1d14313fc071f240d', 'students', 'b3ab7a6e7381af4575b1d14313fc071f240d', '4.52.21.0.09', 'DIMAS MAHENDRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3b58cc788d160a0f7527c0fb8b17f868e1f', 'students', 'b3b58cc788d160a0f7527c0fb8b17f868e1f', '4.52.25.1.22', 'QOWI HAQQUN NAUFAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3c45726adbaea4037223873a0ff00278da7', 'students', 'b3c45726adbaea4037223873a0ff00278da7', '4.52.25.0.15', 'MESYA ROSELLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3cefe8b17198007d600d2f8228d7e893982', 'students', 'b3cefe8b17198007d600d2f8228d7e893982', '4.52.19.1.08', 'ELSA RAHMATIKA SETYAKASIH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b48e7511c8da65c963fb4e29e2c797aba866', 'students', 'b48e7511c8da65c963fb4e29e2c797aba866', '4.52.21.2.07', 'AYU RONNA WATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b54fa8092ffe65936dd72527b4a2f1f5a13a', 'students', 'b54fa8092ffe65936dd72527b4a2f1f5a13a', '4.52.25.1.14', 'HANI CHALIMATUS SADIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b555a502b3601768fa857883bc6fdca5b8a8', 'students', 'b555a502b3601768fa857883bc6fdca5b8a8', '4.52.25.3.22', 'REVINA GADIS AYYUN CHOLISYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b698074ba6bb38a570975bbdd5dfed2fd31b', 'students', 'b698074ba6bb38a570975bbdd5dfed2fd31b', '4.52.19.0.28', 'SHERLY RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b76be7cb03195bccc84894f3c8a93a14c859', 'students', 'b76be7cb03195bccc84894f3c8a93a14c859', '4.52.21.2.19', 'MUHAMMAD NUR IRFAN WAHYUDI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b777e5a9fb404436a2b430b1460ac8b8b79e', 'students', 'b777e5a9fb404436a2b430b1460ac8b8b79e', '4.52.25.0.19', 'NAYLA ZULFA ARIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b9ff6cfa57801ff8055e449e528c1c1660e8', 'students', 'b9ff6cfa57801ff8055e449e528c1c1660e8', '4.52.21.0.29', 'TIARA RENA PUSPA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bb0b4fbc4bd4945c3eb0e219dc42807eabd1', 'students', 'bb0b4fbc4bd4945c3eb0e219dc42807eabd1', '4.52.25.3.13', 'MARCHA NABILA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bb963af36ee680e6229202721d9196bfcd9f', 'students', 'bb963af36ee680e6229202721d9196bfcd9f', '4.52.25.0.20', 'NINDI VELINDIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bcdab07441fe50a10f92fd3acd55652f77c7', 'students', 'bcdab07441fe50a10f92fd3acd55652f77c7', '4.52.20.0.03', 'AMELIA TRISNA PUSPANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bcf52a86da1c9ccb74e5ebdd4e442b071a07', 'students', 'bcf52a86da1c9ccb74e5ebdd4e442b071a07', '4.52.19.1.04', 'ASSIFAH SALSABIILAA ROSSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bd351f3421d384865dc44c062a9e234decd0', 'students', 'bd351f3421d384865dc44c062a9e234decd0', '4.52.25.1.23', 'RARA AMELLIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bdf819933f5c4893a1ea9ef91600fd78d844', 'students', 'bdf819933f5c4893a1ea9ef91600fd78d844', '4.52.19.1.24', 'RIZKA LAILA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be0ada62f62cc9bbe717fa89ed729830824b', 'students', 'be0ada62f62cc9bbe717fa89ed729830824b', '4.52.20.0.17', 'MUHAMMAD AZHAR FADHLURROHMAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be298440086943a87aa528a4b3c63f5018dd', 'students', 'be298440086943a87aa528a4b3c63f5018dd', '4.52.20.1.07', 'DIYANNISA FIRDAUSY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be43306459e07f547abf4b72380ffdef4c92', 'students', 'be43306459e07f547abf4b72380ffdef4c92', '4.52.19.0.04', 'BAGOES HERU PRAYOGA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be88ce08108eb26ff4422d2e8470ee528284', 'students', 'be88ce08108eb26ff4422d2e8470ee528284', '4.52.21.0.23', 'RAFLI ERSA ARDIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bf0ffa2727b10b33465794695b58cb24d449', 'students', 'bf0ffa2727b10b33465794695b58cb24d449', '4.52.25.2.19', 'NAURA HUWAIDA ROHADATUL \'AISY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c1b6f87f56cebc3e02c9f2f97d8d761f9cce', 'students', 'c1b6f87f56cebc3e02c9f2f97d8d761f9cce', '4.52.20.1.01', 'AFRIDA AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c241fcb98f638b7aa8fa9e727fc9ab4ab0e1', 'students', 'c241fcb98f638b7aa8fa9e727fc9ab4ab0e1', '4.52.23.8.10', 'STEVANUS MARTIN EKA DIMARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c2c0a663a33b9853e153d2d81c145e536087', 'students', 'c2c0a663a33b9853e153d2d81c145e536087', '4.52.21.0.03', 'ALFINA RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c3f80d1cb4f1c56cf5c7c9dcf13a102039e6', 'students', 'c3f80d1cb4f1c56cf5c7c9dcf13a102039e6', '4.52.25.1.19', 'MUHAMMAD RIZWAR ANAS FIRDAUS', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c55fea30ba33589f101f257aedc55e7ce9f5', 'students', 'c55fea30ba33589f101f257aedc55e7ce9f5', '4.52.19.1.12', 'GUSTI TAHTA LADUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c5b525d68e4a88b74a38c478433fa30df989', 'students', 'c5b525d68e4a88b74a38c478433fa30df989', '4.52.20.0.01', 'ADESGY TIARA LARASATY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c66edb9c6142a2d81ae81c2f1104dc0eb0c8', 'students', 'c66edb9c6142a2d81ae81c2f1104dc0eb0c8', '4.52.21.2.02', 'ALFINA NUGRAHENI RAMADHANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c6ec49ba98dec8d5b26fa29b6ab19eaa7907', 'students', 'c6ec49ba98dec8d5b26fa29b6ab19eaa7907', '4.52.23.8.03', 'DITA RATNA SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c75c7ddb230b993c34aac95c0ad02e1466eb', 'students', 'c75c7ddb230b993c34aac95c0ad02e1466eb', '4.52.21.1.19', 'NAUFAL ABDILLAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c76d9b8c29af32e62a35234cae7dae82ef43', 'students', 'c76d9b8c29af32e62a35234cae7dae82ef43', '4.52.21.1.13', 'FITRIA RAHMA SAHID', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c79387f1a69a430e4174b418494427a947ce', 'students', 'c79387f1a69a430e4174b418494427a947ce', '4.52.25.0.12', 'FAZA MAOLANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c7bcad31daf9eeb7eeb9892d0bc850ac4a6d', 'students', 'c7bcad31daf9eeb7eeb9892d0bc850ac4a6d', '4.52.25.3.29', 'ZAID ABU JABIR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('cb3a4fe1e3b545bccc6b5e47b204dbd0382e', 'students', 'cb3a4fe1e3b545bccc6b5e47b204dbd0382e', '4.52.21.1.28', 'TALITHA SAHDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d00176dd99edca3bcd3a53edb2cbc30f29bd', 'students', 'd00176dd99edca3bcd3a53edb2cbc30f29bd', '4.52.20.1.05', 'ARVIKA OKTARINA JAYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d0b5c93854226beefccd540e83b6aa6c688e', 'students', 'd0b5c93854226beefccd540e83b6aa6c688e', '4.52.21.2.03', 'ALIT NADA SYAHRANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d0ff2579f0de6bb6a4a7088a43198ee3828f', 'students', 'd0ff2579f0de6bb6a4a7088a43198ee3828f', '4.52.25.0.27', 'TAN,INTAN PUSPITA SARI GUNAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d24937762ea5a99d4d3746fcbfc7898e3854', 'students', 'd24937762ea5a99d4d3746fcbfc7898e3854', '4.52.23.8.02', 'AI LUDIANA MANSNANDIFU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d3228f21a2e7a1da8616b76821985b1fe421', 'students', 'd3228f21a2e7a1da8616b76821985b1fe421', '4.52.20.0.27', 'SAPNA PUTRI HANDAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d335fc823295e934f4cb6adcfda8d5177661', 'students', 'd335fc823295e934f4cb6adcfda8d5177661', '4.52.25.2.22', 'RAYHAN AHMAD PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d373f81dcb645f00700101ce2b240dac3534', 'students', 'd373f81dcb645f00700101ce2b240dac3534', '4.52.20.0.19', 'MUHAMMAD YUNUS', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d3f950f842c26908a4bb40e8645af6ee25af', 'students', 'd3f950f842c26908a4bb40e8645af6ee25af', '4.52.21.2.27', 'SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d5acac9a03a53be68bdc9ea7ed78ed330b33', 'students', 'd5acac9a03a53be68bdc9ea7ed78ed330b33', '4.52.21.0.07', 'CLARISSA HAPPY NUR VADITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d63ac8b1e9ad28b812e1dac0a6c6619073c8', 'students', 'd63ac8b1e9ad28b812e1dac0a6c6619073c8', '4.52.25.0.21', 'NUR FITA RIZKY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d71a08aafc37ecef9e9eb6c2d54b4a866c25', 'students', 'd71a08aafc37ecef9e9eb6c2d54b4a866c25', '4.52.19.1.02', 'ANUGRAHA HADI SAPUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d845e8c9d3fd9b64d8807de626a148c9861c', 'students', 'd845e8c9d3fd9b64d8807de626a148c9861c', '4.52.25.3.21', 'RAIHAN ADITYA HENDRIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d8703eaaa67b31bc8435ee3c94901c079855', 'students', 'd8703eaaa67b31bc8435ee3c94901c079855', '4.52.19.1.14', 'JOIS AKSA GANEO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d930e795d956be6408427d191e8879ceaaf2', 'students', 'd930e795d956be6408427d191e8879ceaaf2', '4.52.25.0.03', 'AGHNIYA SAPHIIRA RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d9a091a70359593b2d1b73fcc146814cd77f', 'students', 'd9a091a70359593b2d1b73fcc146814cd77f', '4.52.21.0.16', 'KHAMIM NUR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d9e9197869c5a1fe48a7e6d65f04c0a2a50c', 'students', 'd9e9197869c5a1fe48a7e6d65f04c0a2a50c', '4.52.21.2.26', 'SAKINATUL KHOLIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('daef2475c44e140b3acb5dc4f26d5fdba0f3', 'students', 'daef2475c44e140b3acb5dc4f26d5fdba0f3', '4.52.21.1.26', 'SATYANIN DIAZ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db023aae14f05d1489e3370c1eeb2f352dbc', 'students', 'db023aae14f05d1489e3370c1eeb2f352dbc', '4.52.21.1.03', 'ANISA YUMNA ARIANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db6724ae5ab6b6f2a25c62fd8fdab7f08ecd', 'students', 'db6724ae5ab6b6f2a25c62fd8fdab7f08ecd', '4.52.25.2.03', 'ANTHONY ROBBINS SAPUTRO HANDOYO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db85164943c074c337a685d59f96c6833f6e', 'students', 'db85164943c074c337a685d59f96c6833f6e', '4.52.21.2.05', 'ARVIA NUR AROFAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dbbad91c8b8ac1057a86ebc26589685710a6', 'students', 'dbbad91c8b8ac1057a86ebc26589685710a6', '4.52.25.1.21', 'PARAMITHA NADIA HUMAIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dc617eecffc155b7fc8b4feeb83bc30f5896', 'students', 'dc617eecffc155b7fc8b4feeb83bc30f5896', '4.52.23.8.05', 'JIHAN AURLYA CANDY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dcfcf2710e85953783c771b28419747d0456', 'students', 'dcfcf2710e85953783c771b28419747d0456', '4.52.25.3.14', 'MUHAMMAD APRILIYANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dd3221154f4d7e9130706299656725acb528', 'students', 'dd3221154f4d7e9130706299656725acb528', '4.52.21.0.12', 'EMI ANGGORO WATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dd56645c16b5c269e41da69335bad90119f6', 'students', 'dd56645c16b5c269e41da69335bad90119f6', '4.52.21.2.01', 'ADELIA DEWANTI AZZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('df45f53b18f276dc31a5be519956b940edde', 'students', 'df45f53b18f276dc31a5be519956b940edde', '4.52.21.2.08', 'BRIGITTA PUNGKI YULIASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('df54ddf44a07d617e437f92ffbcd9f92b3db', 'students', 'df54ddf44a07d617e437f92ffbcd9f92b3db', '4.52.21.2.25', 'RESTI FARSHANANDA RISWANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e11bcc209dc166225a4c381bbbe604d10a70', 'students', 'e11bcc209dc166225a4c381bbbe604d10a70', '4.52.21.1.24', 'RISKA MUSTOFASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e13f449090567dbf462f6536a4e966701946', 'students', 'e13f449090567dbf462f6536a4e966701946', '4.52.20.1.30', 'ZAHRASEA FARAH ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e32cabadd2786607fc259afaefda8e4e832e', 'students', 'e32cabadd2786607fc259afaefda8e4e832e', '4.52.25.0.04', 'AMELIA NAJWA AZZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e41ecf601f4f1c2f94c4bdf1cc7fcf29b7e8', 'students', 'e41ecf601f4f1c2f94c4bdf1cc7fcf29b7e8', '4.52.21.0.08', 'DAFA AZZAHRA MUSTIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e42a3f60843b920741679109c147d2b390a8', 'students', 'e42a3f60843b920741679109c147d2b390a8', '4.52.21.1.14', 'HERSA SINTIA PRAMUDYA WARDANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e6a2c13227c3e08aa1c713ea7ae87b97bf23', 'students', 'e6a2c13227c3e08aa1c713ea7ae87b97bf23', '4.52.25.0.17', 'MUHAMMAD FARREL ROZAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e8e1e31593ed496acaddaee8f5e1c377e526', 'students', 'e8e1e31593ed496acaddaee8f5e1c377e526', '4.52.25.1.17', 'MUHAMMAD RAFA MAFTUHIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e8f8919512d277f1c25cca275f241c2437bf', 'students', 'e8f8919512d277f1c25cca275f241c2437bf', '4.52.21.2.23', 'PUTRI KINASIH GUSTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e9e86bacc29f3acfb495c31e9e34612aff39', 'students', 'e9e86bacc29f3acfb495c31e9e34612aff39', '4.52.21.0.13', 'FARIDA NAJWA WAHYUONO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ecc44af0774ee0842e3af2a41c4d34918e09', 'students', 'ecc44af0774ee0842e3af2a41c4d34918e09', '4.52.25.3.24', 'ROSEWINAR FILADELFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ece6a043c9e42ace73af0c98dadf1979e520', 'students', 'ece6a043c9e42ace73af0c98dadf1979e520', '4.52.21.2.11', 'ELSANTI NUR SAFITRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('edcd05e460692c4dcf1bb79f58db99c74009', 'students', 'edcd05e460692c4dcf1bb79f58db99c74009', '4.52.25.2.26', 'VANI ANDREANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('eef11f97cce265c27fd804faa717aac908c8', 'students', 'eef11f97cce265c27fd804faa717aac908c8', '4.52.23.8.06', 'LENNY LEONITA MARINI UBRUANGGE', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"tahun_masuk\":2023}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('efc46d4362f270ae747f16b7012dcd17ac40', 'students', 'efc46d4362f270ae747f16b7012dcd17ac40', '4.52.25.0.06', 'AWALIA ARDIYANTI HANIFA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f12900ef930e0b3086903d7599d3c8311a5c', 'students', 'f12900ef930e0b3086903d7599d3c8311a5c', '4.52.21.1.05', 'AULIA SALSA ZAZILLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f35a0062b116dc7a1a5e997fdb946d78de13', 'students', 'f35a0062b116dc7a1a5e997fdb946d78de13', '4.52.25.0.08', 'CLAUDI DWI VEBRIANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3c372bb0712b8e9092081c73d06be25a5b4', 'students', 'f3c372bb0712b8e9092081c73d06be25a5b4', '4.52.25.3.20', 'NIA DWI RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3c9b163811d33083ea34914d6cfa2656a0c', 'students', 'f3c9b163811d33083ea34914d6cfa2656a0c', '4.52.20.1.06', 'BALQIS GHAISSANY SHADRINA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3f62c7b2932350d6e4b05d025b916bbf51e', 'students', 'f3f62c7b2932350d6e4b05d025b916bbf51e', '4.52.21.2.10', 'DIKA NUR PRASETYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f4d7a232527e296d0e5e225c55ac4c40b483', 'students', 'f4d7a232527e296d0e5e225c55ac4c40b483', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f525d64218c3c64819a69b3b4b7ce0afd3f4', 'students', 'f525d64218c3c64819a69b3b4b7ce0afd3f4', '4.52.25.3.19', 'NAYLA ARKA DEWI INDIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f7092f6cf55aaafde527df01ae4b7053c2d2', 'students', 'f7092f6cf55aaafde527df01ae4b7053c2d2', '4.52.21.2.04', 'ANINDYA  RISTA AMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f7293b32910658136719f49621bd70b6a140', 'students', 'f7293b32910658136719f49621bd70b6a140', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f962edeb4542930e99e62e87c18ccff21918', 'students', 'f962edeb4542930e99e62e87c18ccff21918', '4.52.19.0.26', 'RUMIYATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f98945aa6cef1d452fb5e4939012a93ec827', 'students', 'f98945aa6cef1d452fb5e4939012a93ec827', '4.52.20.0.13', 'LUBNAA TSAABITAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"tahun_masuk\":2020}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f9f23fca2986ccf409852091d16dd6a342ce', 'students', 'f9f23fca2986ccf409852091d16dd6a342ce', '4.52.21.2.09', 'DESTIA RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fa6ff12b87b3fc39c196b4eebfa727c81291', 'students', 'fa6ff12b87b3fc39c196b4eebfa727c81291', '4.52.25.1.02', 'AMIRAH SALSABIL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fafd88d6b75173d9275f422cb98a864ea171', 'students', 'fafd88d6b75173d9275f422cb98a864ea171', '4.52.25.1.15', 'KEYSHA JASMINE KURNIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fc6014910c20c3985f23e46c71aeddd543d9', 'students', 'fc6014910c20c3985f23e46c71aeddd543d9', '4.52.19.1.11', 'FELICIA REVIE KUSUMADEWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fc8db89b442044129c9a603b81b09df794ab', 'students', 'fc8db89b442044129c9a603b81b09df794ab', '4.52.21.0.21', 'NURUL AULIA ISNAINI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fcc5b15e6c6e926c9dcaf29cf11a25832b4f', 'students', 'fcc5b15e6c6e926c9dcaf29cf11a25832b4f', '4.52.19.1.26', 'SOPHIA JULIANTI NISA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2019, '{\"tahun_masuk\":2019}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fecc538004d43789cf209c40dc3a043f3439', 'students', 'fecc538004d43789cf209c40dc3a043f3439', '4.52.21.1.15', 'INDAH LARASATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fedfb4620feda86f68134e5f51294ccb31a4', 'students', 'fedfb4620feda86f68134e5f51294ccb31a4', '4.52.21.0.05', 'ANNISAAUL FITHRIYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_job_relevance_records`
--

CREATE TABLE `menu_job_relevance_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_publications_records`
--

CREATE TABLE `menu_publications_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menu_publications_records`
--

INSERT INTO `menu_publications_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('065af866c80a1b0a6b0fc1dd467d7c4ad2fc', 'achievements', '065af866c80a1b0a6b0fc1dd467d7c4ad2fc', '4.52.20.0.01', 'ADESGY TIARA LARASATY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Winarto Winarto, Nur Rini\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of E-Wom, Price Perception, and Product Quality on VIVO Smartphone Purchasing Decision\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Adesgy Tiara Larasaty,  Winarto Winarto, Nur Rini\",\"is_valid_publication_seminar\":true,\"description\":\"\",\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-14 19:42:47'),
('09fd32d692d84f8e9c6e79ab696d75985835', 'achievements', '09fd32d692d84f8e9c6e79ab696d75985835', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani,\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"Organizational Culture through Technology Resources as Antecedents and its Impact on Export Performance of The Furniture Industry\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani, Ardianita Nur Indah Sari\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('12281b39ac936987eae09f358dca180a0dcb', 'achievements', '12281b39ac936987eae09f358dca180a0dcb', '4.52.20.1.18', 'NELY FALAHATI SIYAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Dody Setyadi, Rara Ririn Budi Utaminingtyas\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"THE INFLUENCE OF SOCIAL MEDIA USE TO WORK, TOTAL QUALITY MANAGEMENT, AND ORGANIZATIONAL CULTURE ON ORGANIZATIONAL PERFORMANCE IN DIGITAL-BASED FOOD PROCESSING MSMES\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Nely Falahati Siyami, Dody Setyadi, Rara Ririn Budi Utaminingtyas\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('478a631946fd869c9a7d78eada8e8c83baf2', 'achievements', '478a631946fd869c9a7d78eada8e8c83baf2', '4.52.20.1.30', 'ZAHRASEA FARAH ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Rustono Rustono, Rif\\u2019ah Dwi Astuti, Sri Wahyuni, Carli Carli\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_non_accredited\",\"title\":\"How Firms Achieve Competitive Advantage And Business Performance: Dynamic Capability Theory Point of View\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Endang Sulistiyani, Rustono Rustono, Zahrasea Farah Ilyasa, Rif\\u2019ah Dwi Astuti, Sri Wahyuni, Carli Carli\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4992985cc060c1c193543c13f714bbff35c9', 'achievements', '4992985cc060c1c193543c13f714bbff35c9', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Sartono, Iwan Hermawan\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"Membangun Kelayakan E-Tourism Berbasis Video Panorama 360 Dalam Rangka Strategi Push Promote Untuk Mengeksplorasi Daya Tarik Destinasi\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Sartono, Iwan Hermawan, Nur Nelisa Adah\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2021-01-01\",\"year\":2021}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4b154796de04bf6e88f562ee5110cfc94043', 'achievements', '4b154796de04bf6e88f562ee5110cfc94043', '4.52.20.0.29', 'VHIELA EKA PRAMITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence Of Customer Experience, Perceived Value, and Trust on Repurchase Intention on BRT Trans Semarang Users\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Vhiela Eka Pramitasari, Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('50f81d3dafd4ae7cee891d7e47c69747eef7', 'achievements', '50f81d3dafd4ae7cee891d7e47c69747eef7', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":\"-\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"judul 2\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"-\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2022-01-01\",\"year\":2022}', 1, '2026-03-06 10:16:16', '2026-03-06 10:14:10', '2026-03-06 10:16:16'),
('58253fd2a958a01b31ed046f650353c2279e', 'achievements', '58253fd2a958a01b31ed046f650353c2279e', '4.52.23.8.03', 'DITA RATNA SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Sri Wahyuni, Paniya\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of Price Increases, Product Availability, and Service Quality on Consumer Satisfaction (A Case Study at LPG 3 Kg Distribution Point Yulianto, agent of PT Mita Ereska, Semarang Regency)\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Dita Ratna Sari, Sri Wahyuni, Paniya\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('739e897d4305d58f8b2c2b321a5ca7c14e09', 'achievements', '739e897d4305d58f8b2c2b321a5ca7c14e09', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":\"-\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"-\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2022-01-01\",\"year\":2022}', 1, '2026-03-06 09:58:56', '2026-03-06 09:52:57', '2026-03-06 09:58:56'),
('742d6ad9766a4a9b7e786f4297adf335f1b1', 'achievements', '742d6ad9766a4a9b7e786f4297adf335f1b1', '4.52.20.1.10', 'FICRYNA SHULCHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi Karnowahadi, Subandi Subandi\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"reputable_international\",\"title\":\"Analysis of the Influence of Online Consumer Reviews, Perceived Quality, and Price Perception on Purchase Decisions at the Charles and Keith Brand in Semarang\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Ficryna Shulcha, Karnowahadi Karnowahadi, Subandi Subandi\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('86699d9fe6c00497678839f64301358b73df', 'achievements', '86699d9fe6c00497678839f64301358b73df', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"reputable_international\",\"title\":\"Building Entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono, Nur Nelisa Adah\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('877e6d47eeea4b2001edc3d231853670685e', 'achievements', '877e6d47eeea4b2001edc3d231853670685e', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":\"-\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"judul 1\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"-\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2020-01-01\",\"year\":2020}', 1, '2026-03-06 10:16:16', '2026-03-06 10:14:10', '2026-03-06 10:16:16'),
('981eadd272d8ac8e45e9f9477d47b8b4d73c', 'achievements', '981eadd272d8ac8e45e9f9477d47b8b4d73c', '4.52.19.1.24', 'RIZKA LAILA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Azizah Azizah, Irawan Malebra\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Design and Build an E-Commerce Website as a Means of Market Network Development for UMKM MDF Pressing\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Endang Sulistiyani Rizka Laila Maulida, Azizah Azizah, Irawan Malebra\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('9a87194f3ef8d096d92e7f14fcb4e6f49f76', 'achievements', '9a87194f3ef8d096d92e7f14fcb4e6f49f76', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"HUMAN CAPITAL STUDY: CAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR FOR BOOSTING JOB SATISFACTION\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Della Amaylia Ashari, Iwan Hermawan\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('a3a780a1975797ec219d3bf1a310c903369d', 'achievements', 'a3a780a1975797ec219d3bf1a310c903369d', '4.52.20.0.27', 'SAPNA PUTRI HANDAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Irawan Malebra\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of Celebrity Endorsement, Electronic Word of Mouth, Perceived Quality on Purchase Decision of Scarlett Whitening Consumer\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Sapna Putri Handayani, Irawan Malebra\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('abf6fbd5a929f5fd39f3ebace337250ee845', 'achievements', 'abf6fbd5a929f5fd39f3ebace337250ee845', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"international\",\"title\":\"The Role of Entrepreneurial Orientation, Organizational Culture, and Technology Resources in Encouraging Supply Chain Management\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('afb6afc73268f7e087f1047f89a59f3c6ed8', 'achievements', 'afb6afc73268f7e087f1047f89a59f3c6ed8', '4.52.19.1.19', 'MUHAMMAD DAFFA EL HAQ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi Karnowahadi, Rustono Rustono\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Analysis of the Effect of Web Quality Dimensions (Usability Quality, Information Quality, Service Interaction Quality) on Customer Satisfaction of Aksesmu Application Users in \\u2026\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Muhammad Daffa El Haq, Karnowahadi Karnowahadi, Rustono Rustono\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('beb89d701dd3755bac3e7b3f7486392f95e5', 'achievements', 'beb89d701dd3755bac3e7b3f7486392f95e5', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"reputable_international\",\"title\":\"Pemberdayaan UKM Olahan Ikan Di Kelurahan Plalangan Melalui Perbaikan Pengembangan Pakan Mandir\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati, Nur Nelisa Adah\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('c55ebfb186fb0ed4bc50b3163ee3648582eb', 'achievements', 'c55ebfb186fb0ed4bc50b3163ee3648582eb', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":\"-\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"ajda\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"ad\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2022-01-01\",\"year\":2022}', 1, '2026-03-06 09:58:56', '2026-03-06 09:48:47', '2026-03-06 09:58:56'),
('c9fdb7f0347023d29a538506ac3acdffe9bd', 'achievements', 'c9fdb7f0347023d29a538506ac3acdffe9bd', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_non_accredited\",\"title\":\"Implementation of Good Governance E-Filling and Strengthening Soft-Skill Characters for Japanese Kenshushei Institutions at LPK Akihiro Semarang\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti, Annisa Nur Aulia\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cf6fe70d935c7440f22cefd2df7f9ff4d519', 'achievements', 'cf6fe70d935c7440f22cefd2df7f9ff4d519', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Eva Purnamasari\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Enhancing Organizational Performance: Can Innovative Millennial Entrepreneurship and Business Continuity Take on A Mediating Role?\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Annisa Nur Aulia, Iwan Hermawan, Eva Purnamasari\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cfa73b7ed6bed500eac5c2a12df67c9462dc', 'achievements', 'cfa73b7ed6bed500eac5c2a12df67c9462dc', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Implementasi APE Inovatif dan PTK Melalui Peran Internet Center pada PAUD Al-Kamilah Semarang\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi, Febrina Indrasari, Ardianita Nur Indah Sari\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('d5e6c7fddaaf462806a86894c24896c61e58', 'achievements', 'd5e6c7fddaaf462806a86894c24896c61e58', '4.52.20.0.06', 'ATHAYA AURELLIA RIFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rustono - Rustono, Noor - Suroija\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of Customer Experience, Brand Ambassador, and Perceived Value On Customer Loyalty Of Somethinc\\u2019s Consumer In Semarang\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Athaya Aurellia Rifani, Rustono - Rustono, Noor - Suroija\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e02078f4cf95b1fa733eeb308d972c1c0ce7', 'achievements', 'e02078f4cf95b1fa733eeb308d972c1c0ce7', '4.52.21.0.22', 'RAFI WILLY FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Mellasanti Ayuwardani\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Mellasanti Ayuwardani, Azzam Alhafhizd, Mirza Dzaki Kamal, Rafi Willy Febrian, Setiawan Wibowo\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2025-01-01\",\"year\":2025}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e0e8a64b32bdba43b80ef80c629622d23cc4', 'achievements', 'e0e8a64b32bdba43b80ef80c629622d23cc4', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah Inayah\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_non_accredited\",\"title\":\"PERAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR DENGAN JOB SATISFACTION STUDI KASUS: PT PERTAMINA LUBRICANTS-PRODUCTION UNIT CILACAP\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Della Amaylia Ashari, Iwan Hermawan, Inayah Inayah\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e1f2e793de9fb3ef7984049984350aeaffe2', 'achievements', 'e1f2e793de9fb3ef7984049984350aeaffe2', '4.52.20.0.30', 'YUDHA ESA PRIBADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_non_accredited\",\"title\":\"Pengaruh Knowledge Sharing, Employee Engagement, Dan Work Life Balance Terhadap Job Satisfication Pada Karyawan PT Wijaya Karya Beton Tbk. PPB Boyolali\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Yudha Esa Pribadi, Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('ed3daab4d2178f49b8d283ff3afdfce35054', 'achievements', 'ed3daab4d2178f49b8d283ff3afdfce35054', '4.52.19.1.20', 'NABILA FIRDA ALFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rustono, Nur Rini\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of E-Service Quality, Promotion, and Brand Trust on Application Use Decisions\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Nabila Firda Alfani, Rustono, Nur Rini\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2023-01-01\",\"year\":2023}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('f04ac57d0e4bc99660ef586fe94f2835353c', 'achievements', 'f04ac57d0e4bc99660ef586fe94f2835353c', '4.52.20.0.15', 'MAYDISTA LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Rif\'ah Dwi Astuti\",\"jenis_diseminasi\":\"jurnal\",\"level_diseminasi\":\"national_accredited\",\"title\":\"Influence of Functional Convenience, Celebrity Endorsment, and Self-Esteem on Impulsion Purchasing\",\"judul_publikasi\":null,\"level_seminar\":null,\"tanggal_publikasi\":null,\"nama_seminar_konferensi\":null,\"url_publikasi\":null,\"penulis\":\"Maydista Lestari, Endang Sulistiyani, Rif\'ah Dwi Astuti\",\"is_valid_publication_seminar\":true,\"description\":null,\"tanggal\":\"2024-01-01\",\"year\":2024}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_research_outputs_records`
--

CREATE TABLE `menu_research_outputs_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_student_achievements_records`
--

CREATE TABLE `menu_student_achievements_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menu_student_achievements_records`
--

INSERT INTO `menu_student_achievements_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('065af866c80a1b0a6b0fc1dd467d7c4ad2fc', 'achievements', '065af866c80a1b0a6b0fc1dd467d7c4ad2fc', '4.52.20.0.01', 'ADESGY TIARA LARASATY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"Influence of E-Wom, Price Perception, and Product Quality on VIVO Smartphone Purchasing Decision\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/6234\\/0\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/6234\\/0\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-14 19:42:47'),
('09fd32d692d84f8e9c6e79ab696d75985835', 'achievements', '09fd32d692d84f8e9c6e79ab696d75985835', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"Organizational Culture through Technology Resources as Antecedents and its Impact on Export Performance of The Furniture Industry\",\"url_publikasi\":\"https:\\/\\/ieomsociety.org\\/proceedings\\/2022malaysia\\/532.pdf\",\"link_produk\":null,\"link\":\"https:\\/\\/ieomsociety.org\\/proceedings\\/2022malaysia\\/532.pdf\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('12281b39ac936987eae09f358dca180a0dcb', 'achievements', '12281b39ac936987eae09f358dca180a0dcb', '4.52.20.1.18', 'NELY FALAHATI SIYAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"THE INFLUENCE OF SOCIAL MEDIA USE TO WORK, TOTAL QUALITY MANAGEMENT, AND ORGANIZATIONAL CULTURE ON ORGANIZATIONAL PERFORMANCE IN DIGITAL-BASED FOOD PROCESSING MSMES\",\"url_publikasi\":\"https:\\/\\/elibrary.ru\\/item.asp?id=81864363\",\"link_produk\":null,\"link\":\"https:\\/\\/elibrary.ru\\/item.asp?id=81864363\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('478a631946fd869c9a7d78eada8e8c83baf2', 'achievements', '478a631946fd869c9a7d78eada8e8c83baf2', '4.52.20.1.30', 'ZAHRASEA FARAH ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"How Firms Achieve Competitive Advantage And Business Performance: Dynamic Capability Theory Point of View\",\"url_publikasi\":\"https:\\/\\/mail.ajmesc.com\\/index.php\\/ajmesc\\/article\\/view\\/1147\",\"link_produk\":null,\"link\":\"https:\\/\\/mail.ajmesc.com\\/index.php\\/ajmesc\\/article\\/view\\/1147\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4992985cc060c1c193543c13f714bbff35c9', 'achievements', '4992985cc060c1c193543c13f714bbff35c9', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2021-01-01\",\"year\":2021,\"title\":\"Membangun Kelayakan E-Tourism Berbasis Video Panorama 360 Dalam Rangka Strategi Push Promote Untuk Mengeksplorasi Daya Tarik Destinasi\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/2731\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/2731\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4b154796de04bf6e88f562ee5110cfc94043', 'achievements', '4b154796de04bf6e88f562ee5110cfc94043', '4.52.20.0.29', 'VHIELA EKA PRAMITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Influence Of Customer Experience, Perceived Value, and Trust on Repurchase Intention on BRT Trans Semarang Users\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6230\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6230\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('50f81d3dafd4ae7cee891d7e47c69747eef7', 'achievements', '50f81d3dafd4ae7cee891d7e47c69747eef7', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2022-01-01\",\"year\":2022,\"title\":\"judul 2\",\"url_publikasi\":null,\"link_produk\":null,\"link\":null}', 1, '2026-03-06 10:16:31', '2026-03-06 10:14:10', '2026-03-06 10:16:31'),
('58253fd2a958a01b31ed046f650353c2279e', 'achievements', '58253fd2a958a01b31ed046f650353c2279e', '4.52.23.8.03', 'DITA RATNA SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"Influence of Price Increases, Product Availability, and Service Quality on Consumer Satisfaction (A Case Study at LPG 3 Kg Distribution Point Yulianto, agent of PT Mita Ereska, Semarang Regency)\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/7013\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/7013\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('739e897d4305d58f8b2c2b321a5ca7c14e09', 'achievements', '739e897d4305d58f8b2c2b321a5ca7c14e09', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2022-01-01\",\"year\":2022,\"title\":\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\",\"url_publikasi\":\"https:\\/\\/journals.researchsynergypress.com\\/index.php\\/orcadev\\/article\\/view\\/2293\",\"link_produk\":null,\"link\":\"https:\\/\\/journals.researchsynergypress.com\\/index.php\\/orcadev\\/article\\/view\\/2293\"}', 1, '2026-03-06 09:58:41', '2026-03-06 09:52:57', '2026-03-06 09:58:41'),
('742d6ad9766a4a9b7e786f4297adf335f1b1', 'achievements', '742d6ad9766a4a9b7e786f4297adf335f1b1', '4.52.20.1.10', 'FICRYNA SHULCHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Analysis of the Influence of Online Consumer Reviews, Perceived Quality, and Price Perception on Purchase Decisions at the Charles and Keith Brand in Semarang\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5726\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5726\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('84e24784dab7e78a8ee1df66478362cef958', 'achievements', '84e24784dab7e78a8ee1df66478362cef958', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2026, '{\"category\":\"applied_academic\",\"subcategory\":\"makanan_minuman\",\"achievement_type\":\"non_academic\",\"tingkat\":\"lokal\",\"tanggal\":\"2026-03-06\",\"year\":2026,\"title\":\"Keripik Ubi\",\"url_publikasi\":null,\"link_produk\":null,\"link\":null}', 1, '2026-03-06 09:58:41', '2026-03-06 09:56:30', '2026-03-06 09:58:41'),
('86699d9fe6c00497678839f64301358b73df', 'achievements', '86699d9fe6c00497678839f64301358b73df', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"Building Entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective\",\"url_publikasi\":\"https:\\/\\/ir.uitm.edu.my\\/id\\/eprint\\/121030\\/\",\"link_produk\":null,\"link\":\"https:\\/\\/ir.uitm.edu.my\\/id\\/eprint\\/121030\\/\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('877e6d47eeea4b2001edc3d231853670685e', 'achievements', '877e6d47eeea4b2001edc3d231853670685e', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2020, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2020-01-01\",\"year\":2020,\"title\":\"judul 1\",\"url_publikasi\":null,\"link_produk\":null,\"link\":null}', 1, '2026-03-06 10:16:31', '2026-03-06 10:14:10', '2026-03-06 10:16:31'),
('981eadd272d8ac8e45e9f9477d47b8b4d73c', 'achievements', '981eadd272d8ac8e45e9f9477d47b8b4d73c', '4.52.19.1.24', 'RIZKA LAILA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Design and Build an E-Commerce Website as a Means of Market Network Development for UMKM MDF Pressing\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5727\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5727\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('9a87194f3ef8d096d92e7f14fcb4e6f49f76', 'achievements', '9a87194f3ef8d096d92e7f14fcb4e6f49f76', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"HUMAN CAPITAL STUDY: CAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR FOR BOOSTING JOB SATISFACTION\",\"url_publikasi\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/about\\/submissions#authorGuidelines\",\"link_produk\":null,\"link\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/about\\/submissions#authorGuidelines\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('a3a780a1975797ec219d3bf1a310c903369d', 'achievements', 'a3a780a1975797ec219d3bf1a310c903369d', '4.52.20.0.27', 'SAPNA PUTRI HANDAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Influence of Celebrity Endorsement, Electronic Word of Mouth, Perceived Quality on Purchase Decision of Scarlett Whitening Consumer\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6583\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6583\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('abf6fbd5a929f5fd39f3ebace337250ee845', 'achievements', 'abf6fbd5a929f5fd39f3ebace337250ee845', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"The Role of Entrepreneurial Orientation, Organizational Culture, and Technology Resources in Encouraging Supply Chain Management\",\"url_publikasi\":\"https:\\/\\/ieomsociety.org\\/malaysia2022\\/proceedings\\/\",\"link_produk\":null,\"link\":\"https:\\/\\/ieomsociety.org\\/malaysia2022\\/proceedings\\/\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('afb6afc73268f7e087f1047f89a59f3c6ed8', 'achievements', 'afb6afc73268f7e087f1047f89a59f3c6ed8', '4.52.19.1.19', 'MUHAMMAD DAFFA EL HAQ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"Analysis of the Effect of Web Quality Dimensions (Usability Quality, Information Quality, Service Interaction Quality) on Customer Satisfaction of Aksesmu Application Users in \\u2026\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4858\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4858\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('beb89d701dd3755bac3e7b3f7486392f95e5', 'achievements', 'beb89d701dd3755bac3e7b3f7486392f95e5', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"internasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"Pemberdayaan UKM Olahan Ikan Di Kelurahan Plalangan Melalui Perbaikan Pengembangan Pakan Mandir\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4547\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4547\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('c55ebfb186fb0ed4bc50b3163ee3648582eb', 'achievements', 'c55ebfb186fb0ed4bc50b3163ee3648582eb', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2022-01-01\",\"year\":2022,\"title\":\"ajda\",\"url_publikasi\":\"https:\\/\\/arsipmhs-abt.com\",\"link_produk\":null,\"link\":\"https:\\/\\/arsipmhs-abt.com\"}', 1, '2026-03-06 09:58:41', '2026-03-06 09:48:47', '2026-03-06 09:58:41'),
('c9fdb7f0347023d29a538506ac3acdffe9bd', 'achievements', 'c9fdb7f0347023d29a538506ac3acdffe9bd', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Implementation of Good Governance E-Filling and Strengthening Soft-Skill Characters for Japanese Kenshushei Institutions at LPK Akihiro Semarang\",\"url_publikasi\":\"https:\\/\\/jurnal.ustjogja.ac.id\\/index.php\\/IMPACTS\\/article\\/view\\/16008\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.ustjogja.ac.id\\/index.php\\/IMPACTS\\/article\\/view\\/16008\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cf6fe70d935c7440f22cefd2df7f9ff4d519', 'achievements', 'cf6fe70d935c7440f22cefd2df7f9ff4d519', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Enhancing Organizational Performance: Can Innovative Millennial Entrepreneurship and Business Continuity Take on A Mediating Role?\",\"url_publikasi\":\"https:\\/\\/www.proquest.com\\/docview\\/3194094618\\/abstract\\/F1416EE71E24500PQ\\/1?accountid=40625&sourcetype=Scholarly%20Journals\",\"link_produk\":null,\"link\":\"https:\\/\\/www.proquest.com\\/docview\\/3194094618\\/abstract\\/F1416EE71E24500PQ\\/1?accountid=40625&sourcetype=Scholarly%20Journals\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cfa73b7ed6bed500eac5c2a12df67c9462dc', 'achievements', 'cfa73b7ed6bed500eac5c2a12df67c9462dc', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"Implementasi APE Inovatif dan PTK Melalui Peran Internet Center pada PAUD Al-Kamilah Semarang\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4545\\/0\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4545\\/0\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('d5e6c7fddaaf462806a86894c24896c61e58', 'achievements', 'd5e6c7fddaaf462806a86894c24896c61e58', '4.52.20.0.06', 'ATHAYA AURELLIA RIFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Influence of Customer Experience, Brand Ambassador, and Perceived Value On Customer Loyalty Of Somethinc\\u2019s Consumer In Semarang\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6224\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6224\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e02078f4cf95b1fa733eeb308d972c1c0ce7', 'achievements', 'e02078f4cf95b1fa733eeb308d972c1c0ce7', '4.52.21.0.22', 'RAFI WILLY FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2025-01-01\",\"year\":2025,\"title\":\"Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online\",\"url_publikasi\":\"https:\\/\\/ejurnal.kampusakademik.co.id\\/index.php\\/japm\\/indeksasi\",\"link_produk\":null,\"link\":\"https:\\/\\/ejurnal.kampusakademik.co.id\\/index.php\\/japm\\/indeksasi\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e0e8a64b32bdba43b80ef80c629622d23cc4', 'achievements', 'e0e8a64b32bdba43b80ef80c629622d23cc4', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"PERAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR DENGAN JOB SATISFACTION STUDI KASUS: PT PERTAMINA LUBRICANTS-PRODUCTION UNIT CILACAP\",\"url_publikasi\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/article\\/view\\/443\",\"link_produk\":null,\"link\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/article\\/view\\/443\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e1f2e793de9fb3ef7984049984350aeaffe2', 'achievements', 'e1f2e793de9fb3ef7984049984350aeaffe2', '4.52.20.0.30', 'YUDHA ESA PRIBADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Pengaruh Knowledge Sharing, Employee Engagement, Dan Work Life Balance Terhadap Job Satisfication Pada Karyawan PT Wijaya Karya Beton Tbk. PPB Boyolali\",\"url_publikasi\":\"https:\\/\\/jurnal.uss.ac.id\\/index.php\\/jmec\\/article\\/view\\/578\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.uss.ac.id\\/index.php\\/jmec\\/article\\/view\\/578\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('ed3daab4d2178f49b8d283ff3afdfce35054', 'achievements', 'ed3daab4d2178f49b8d283ff3afdfce35054', '4.52.19.1.20', 'NABILA FIRDA ALFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2023-01-01\",\"year\":2023,\"title\":\"Influence of E-Service Quality, Promotion, and Brand Trust on Application Use Decisions\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4854\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4854\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('f04ac57d0e4bc99660ef586fe94f2835353c', 'achievements', 'f04ac57d0e4bc99660ef586fe94f2835353c', '4.52.20.0.15', 'MAYDISTA LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"category\":\"scientific_work\",\"subcategory\":\"journal_publication\",\"achievement_type\":\"academic\",\"tingkat\":\"nasional\",\"tanggal\":\"2024-01-01\",\"year\":2024,\"title\":\"Influence of Functional Convenience, Celebrity Endorsment, and Self-Esteem on Impulsion Purchasing\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6580\",\"link_produk\":null,\"link\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6580\"}', 1, NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_student_products_records`
--

CREATE TABLE `menu_student_products_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menu_student_products_records`
--

INSERT INTO `menu_student_products_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('84e24784dab7e78a8ee1df66478362cef958', 'achievements', '84e24784dab7e78a8ee1df66478362cef958', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2026, '{\"category\":\"applied_academic\",\"subcategory\":\"makanan_minuman\",\"kategori_produk\":\"makanan_minuman\",\"achievement_type\":\"non_academic\",\"title\":\"Keripik Ubi\",\"nama_produk\":\"Keripik Ubi\",\"tanggal\":\"2026-03-06\",\"tanggal_adopsi\":\"2026-03-06\",\"lokasi\":null,\"mitra_adopsi\":null,\"penyelenggara\":null,\"description\":null,\"deskripsi\":null,\"link_produk\":null,\"link\":null,\"year\":2026}', 1, '2026-03-06 09:57:16', '2026-03-06 09:56:30', '2026-03-06 09:57:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_study_period_records`
--

CREATE TABLE `menu_study_period_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `menu_study_period_records`
--

INSERT INTO `menu_study_period_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('003da7d7fa7205b44d926b8fbf31e78747af', 'students', '003da7d7fa7205b44d926b8fbf31e78747af', '4.52.21.0.30', 'VIA OKTAFIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('01b057f17c3f11beec30e04171756d6e44b6', 'students', '01b057f17c3f11beec30e04171756d6e44b6', '4.52.20.0.25', 'SALSA AYU AZIZAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('01ef195987b6e544b4c75c5977d9da069f0d', 'students', '01ef195987b6e544b4c75c5977d9da069f0d', '4.52.20.1.16', 'NABILA NUR HALIZA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('042164db015bdd12a31d46284a579c9dfc8b', 'students', '042164db015bdd12a31d46284a579c9dfc8b', '4.52.20.1.19', 'NURUL CHASANATIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('046147ef4986d6d5d058a80f259d7a236606', 'students', '046147ef4986d6d5d058a80f259d7a236606', '4.52.19.0.15', 'IVA SALMA RAMADHANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0500f97f9d0ec4df20ee471998c24a7c91b5', 'students', '0500f97f9d0ec4df20ee471998c24a7c91b5', '4.52.25.1.09', 'DYAH AYU SURYORATRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('072eb1c753f07d7bc2bfc309e6a7d36cd324', 'students', '072eb1c753f07d7bc2bfc309e6a7d36cd324', '4.52.21.1.16', 'JULIATHA NABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('098da1e1846cb162baaccc4fefaa100f5768', 'students', '098da1e1846cb162baaccc4fefaa100f5768', '4.52.20.1.18', 'NELY FALAHATI SIYAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('09a0d7c79054d82dd5490c5421b42656ce63', 'students', '09a0d7c79054d82dd5490c5421b42656ce63', '4.52.21.1.08', 'DEKSA ALENIA ISNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('09ed011e1ca2bfe3dfd62a34d32fef2a98ac', 'students', '09ed011e1ca2bfe3dfd62a34d32fef2a98ac', '4.52.23.8.11', 'TSURAYA DIANETA DEVI ASAWIMANDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0a37791e154af6e9330d6de2c7df4c9eb192', 'students', '0a37791e154af6e9330d6de2c7df4c9eb192', '4.52.21.0.01', 'ABELIA RAHMA PRATIWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0acba23f6deaca46e6c3046fc358fe05fdd0', 'students', '0acba23f6deaca46e6c3046fc358fe05fdd0', '4.52.20.0.26', 'SALSABILA TIARA WIDYASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0c036e5e21e212a5127b62a7f883e2b0326b', 'students', '0c036e5e21e212a5127b62a7f883e2b0326b', '4.52.21.2.13', 'FAJAR MU\'MININ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0caa1788191a71ae13a6867d4645011ac53c', 'students', '0caa1788191a71ae13a6867d4645011ac53c', '4.52.20.1.20', 'RAHMA MAULINA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0cdeb89a48f1ee37289b6a2c7fab239ee9e2', 'students', '0cdeb89a48f1ee37289b6a2c7fab239ee9e2', '4.52.19.0.23', 'PRISMA DINDA ZASMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0da5bac192c69bb43398f3118da55a299576', 'students', '0da5bac192c69bb43398f3118da55a299576', '4.52.21.1.25', 'SAFIRA EKA FARIHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0dd96138b3b39a51e86d52be10f46aae1a3a', 'students', '0dd96138b3b39a51e86d52be10f46aae1a3a', '4.52.25.2.08', 'FADILAH AISYAH RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0ea178aacfa3b80105828ee44df1552f9e04', 'students', '0ea178aacfa3b80105828ee44df1552f9e04', '4.52.25.3.06', 'DIANA NURUL AINI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0f238004f161e0ad1abca141e54c13ad5795', 'students', '0f238004f161e0ad1abca141e54c13ad5795', '4.52.19.0.19', 'MUHAMMAD NAUFAL ARIF', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('0f33510e0800aeb67f00fc185253b786dcf9', 'students', '0f33510e0800aeb67f00fc185253b786dcf9', '4.52.20.0.04', 'AQILA FITRI NUR KAMILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('101b39b15af5a49b72d1e607ad12c982ee30', 'students', '101b39b15af5a49b72d1e607ad12c982ee30', '4.52.20.1.02', 'ANGGRE FARHANNA JULIASANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('10b1c577897b45b18a3c46ba5aa5fcdb27e9', 'students', '10b1c577897b45b18a3c46ba5aa5fcdb27e9', '4.52.21.0.24', 'RIFDA ARDELIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('10cc142fa1ea032c48ed5d7704f29388cadc', 'students', '10cc142fa1ea032c48ed5d7704f29388cadc', '4.52.21.1.09', 'DIYAH AYU WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('17770c9721a4f4dccf875f7771b011f96fb4', 'students', '17770c9721a4f4dccf875f7771b011f96fb4', '4.52.25.0.01', 'ADIL SHERLYNA MELODI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('188d70f36ee6d464be612ce0c0bb3df06466', 'students', '188d70f36ee6d464be612ce0c0bb3df06466', '4.52.19.0.13', 'HANINA AMILA HUSNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('18c375036c52e93e25c5a823f25c8a372599', 'students', '18c375036c52e93e25c5a823f25c8a372599', '4.52.25.3.07', 'DINDA ISLAMI PASHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('19704b9d821cec1bc92ac7a561c67ba72886', 'students', '19704b9d821cec1bc92ac7a561c67ba72886', '4.52.20.0.29', 'VHIELA EKA PRAMITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('19af2f159fd0e7b28ddf5cc700b32b103eb8', 'students', '19af2f159fd0e7b28ddf5cc700b32b103eb8', '4.52.19.0.07', 'DIAH PUSPITA ANGGRAENI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1b0a06c4b8e586830fd48c483c000c662130', 'students', '1b0a06c4b8e586830fd48c483c000c662130', '4.52.21.0.19', 'NAJLA DEBI HABSARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1b9f37d7aaa59ca7d4ed0604027cb98736d5', 'students', '1b9f37d7aaa59ca7d4ed0604027cb98736d5', '4.52.25.2.12', 'KHOFIFATUL MAULANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1bca372eab5ab0697fa79943cc2b411d7c01', 'students', '1bca372eab5ab0697fa79943cc2b411d7c01', '4.52.25.3.11', 'HANUM ALIFFIA NUHAYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1c2ae505d51ef31b1c546b1011464e5745b7', 'students', '1c2ae505d51ef31b1c546b1011464e5745b7', '4.52.25.2.28', 'ZAHRA SALSABILA MAHDIYYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1cbbf30cb76aa72da75c6f808bfd0bf7fcda', 'students', '1cbbf30cb76aa72da75c6f808bfd0bf7fcda', '4.52.25.1.03', 'ANDINI EKA APRILIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1dc24a81835f7cb29ea3b8563d231752725b', 'students', '1dc24a81835f7cb29ea3b8563d231752725b', '4.52.21.1.07', 'BINTANG TITIS SATRIO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1df8fbfd0a23a1b0200b3d860423a9f012db', 'students', '1df8fbfd0a23a1b0200b3d860423a9f012db', '4.52.21.1.20', 'NOFITA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1e406ad065261aa023b781cb424af3adc9fd', 'students', '1e406ad065261aa023b781cb424af3adc9fd', '4.52.21.0.22', 'RAFI WILLY FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('1f45989687e63395e2d6ad69c95b9894a413', 'students', '1f45989687e63395e2d6ad69c95b9894a413', '4.52.25.2.20', 'NOVELIA AGNIMAYA WIBOWO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2142109d7db8f73062a43ddabbb61931bfe3', 'students', '2142109d7db8f73062a43ddabbb61931bfe3', '4.52.25.3.18', 'NAJWA DINDA SEKAR ORCHITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('21b39b042ee5b48610bb4733e185324f8075', 'students', '21b39b042ee5b48610bb4733e185324f8075', '4.52.25.1.01', 'AISHA DAHAYU LAKSMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('21c28c6392c85c7617e1a0f090223b8e48b8', 'students', '21c28c6392c85c7617e1a0f090223b8e48b8', '4.52.19.0.08', 'DIDIN DARMAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('221bf8fbf5e1ccf02b63ca49098dbf58880a', 'students', '221bf8fbf5e1ccf02b63ca49098dbf58880a', '4.52.23.8.09', 'SEMUEL DENI KOROWA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('22209cf42a970d639016b70a4f4e6d66c704', 'students', '22209cf42a970d639016b70a4f4e6d66c704', '4.52.21.1.11', 'ENDAH NOER OCTAVIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2237a7efc239b3bafec1994795dae520ee1f', 'students', '2237a7efc239b3bafec1994795dae520ee1f', '4.52.25.1.08', 'DESTI MUSDALIFAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23bf399b4e5a0e409f870615c92a3de617e5', 'students', '23bf399b4e5a0e409f870615c92a3de617e5', '4.52.19.0.03', 'AUDRINA RAHMA AGUSTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23d7c7483feefa59fddade92c882f393a542', 'students', '23d7c7483feefa59fddade92c882f393a542', '4.52.25.1.29', 'ZYAHWA NOVIA SUKMA PRATIWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('23f14b175d027f09b7e1bd386655f4a89329', 'students', '23f14b175d027f09b7e1bd386655f4a89329', '4.52.25.0.10', 'DZAKIA IMEL PUTRI FERDIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('281452bc2f38e43488c26c9e6ae34c2ec2cb', 'students', '281452bc2f38e43488c26c9e6ae34c2ec2cb', '4.52.20.1.08', 'ESTI RISHMA YULIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('290662834fa5625cc219e95ea3a71d40ba2f', 'students', '290662834fa5625cc219e95ea3a71d40ba2f', '4.52.21.0.26', 'SALMA AYA SOFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('29c65e619548b6cb9ff2b762fde79902fce4', 'students', '29c65e619548b6cb9ff2b762fde79902fce4', '4.52.20.0.21', 'NUR IMAM NAZIHAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2b7c323cacb1986984ff9ca7d3578df94ae1', 'students', '2b7c323cacb1986984ff9ca7d3578df94ae1', '4.52.20.1.27', 'SRI WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2bbe14f0a51d5a407761322b20ade9c9a79d', 'students', '2bbe14f0a51d5a407761322b20ade9c9a79d', '4.52.25.2.13', 'LUTFIA FAISYA AYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2cbaf1833f05fcb322c6cd35ab628712716f', 'students', '2cbaf1833f05fcb322c6cd35ab628712716f', '4.52.23.8.12', 'YOHANA YUSTIN WANDADAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2dd44ad64ab8a5736807530cba2c258ef929', 'students', '2dd44ad64ab8a5736807530cba2c258ef929', '4.52.20.0.16', 'MILATI PUJA KESUMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2e75f50ea4b9fed247e31ca1b2f5dcd2c8e0', 'students', '2e75f50ea4b9fed247e31ca1b2f5dcd2c8e0', '4.52.25.1.18', 'MUHAMMAD RIZKI RAMANDHIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('2ea14c1244bd566dff94e9d5104307354788', 'students', '2ea14c1244bd566dff94e9d5104307354788', '4.52.25.1.07', 'DAVINA AURA DIOLITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('309361e4da6ebfb3f20f2b3b36d89c585287', 'students', '309361e4da6ebfb3f20f2b3b36d89c585287', '4.52.25.0.02', 'AFIFA TIARA RAHMADHANTY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3094b030d312128c982ce2bb3f0f7ed4f039', 'students', '3094b030d312128c982ce2bb3f0f7ed4f039', '4.52.19.0.18', 'MAUDIRA DWI SAFITRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('313784400d13ba34415046e26632c55f5fe6', 'students', '313784400d13ba34415046e26632c55f5fe6', '4.52.25.0.23', 'RIZQATUL JANNAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('33be31321e002e24460aab1e297db7d685c5', 'students', '33be31321e002e24460aab1e297db7d685c5', '4.52.25.2.06', 'DEWI ARRAHMAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('34f6faf63a0817b534eb0c281e839310e916', 'students', '34f6faf63a0817b534eb0c281e839310e916', '4.52.19.0.09', 'DIVA EGIDIA PERMATA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('360d188bd84427e7c7473bc108290cca3aed', 'students', '360d188bd84427e7c7473bc108290cca3aed', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3655995a6e791bbef362e88b925a8dbb6d16', 'students', '3655995a6e791bbef362e88b925a8dbb6d16', '4.52.20.1.23', 'RIZKY TRI FEBRIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('38bf659b7dd24692443bc35a111153356105', 'students', '38bf659b7dd24692443bc35a111153356105', '4.52.25.3.28', 'ZAFIRA RAHMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3c41934ff666bff2649995c95a8d5e3b82f4', 'students', '3c41934ff666bff2649995c95a8d5e3b82f4', '4.52.19.1.22', 'NURHASANAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3cb539456a4848fb084e6bd88c4a58ae8d05', 'students', '3cb539456a4848fb084e6bd88c4a58ae8d05', '4.52.19.0.24', 'RASYA KHANSA JAUZA AZHAAR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3dff91b79e4472cf670ac994dcafbe05160a', 'students', '3dff91b79e4472cf670ac994dcafbe05160a', '4.52.21.1.22', 'NURUL FATAKHILLAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3efa3bbc1a138e7b7b26d27eed910dd422cb', 'students', '3efa3bbc1a138e7b7b26d27eed910dd422cb', '4.52.21.0.27', 'SETIAWAN WIBOWO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3f43ebaf88dd37cc9ce03e211b381fd095d6', 'students', '3f43ebaf88dd37cc9ce03e211b381fd095d6', '4.52.25.1.11', 'FATIHA RAKA CHAIRUL FIQRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3f81402e0d588eb20d4d9dd83780ee0e1f1c', 'students', '3f81402e0d588eb20d4d9dd83780ee0e1f1c', '4.52.25.1.05', 'ATHAR KHAIZURAN RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('3fb49f13c177d81b83b578cd2003a6f2a517', 'students', '3fb49f13c177d81b83b578cd2003a6f2a517', '4.52.25.0.05', 'ARLYNNISA SALSABYLA PANJAITAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('41bcf392128ab31c074537bcf2668b732cc0', 'students', '41bcf392128ab31c074537bcf2668b732cc0', '4.52.19.1.16', 'LUTHFIYA ISTIQOMAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4353d04a9cea1dec78b66a7c25277b1e7a3d', 'students', '4353d04a9cea1dec78b66a7c25277b1e7a3d', '4.52.20.0.23', 'RAKA SETIA DINATA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('43a8619acbe1bc7ce7bf13ef56a41da3fc74', 'students', '43a8619acbe1bc7ce7bf13ef56a41da3fc74', '4.52.21.2.24', 'REDITE CAHYO PERMADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('43aacbc7c75005dda2442d914ee6da969aa4', 'students', '43aacbc7c75005dda2442d914ee6da969aa4', '4.52.19.0.20', 'NADYA AURIGA RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('445c0cd09e47f3f893a0ed5ab27f64d73773', 'students', '445c0cd09e47f3f893a0ed5ab27f64d73773', '4.52.25.2.02', 'ANNISA RAMADHANI ASMARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('44d4dcbf47c40222d37704fc22a9a41e8ba4', 'students', '44d4dcbf47c40222d37704fc22a9a41e8ba4', '4.52.25.2.07', 'ERFIZZA CHAIRINA LATANSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('45b10e8213b0dcd14f4220db8d6579ab9a08', 'students', '45b10e8213b0dcd14f4220db8d6579ab9a08', '4.52.19.1.19', 'MUHAMMAD DAFFA EL HAQ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('48283e21ee804e25c38412ae3aeae9c5e678', 'students', '48283e21ee804e25c38412ae3aeae9c5e678', '4.52.21.2.15', 'HAIDAR FARUQI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('482e52763d6311ad43c18e819b501653cba2', 'students', '482e52763d6311ad43c18e819b501653cba2', '4.52.20.0.18', 'MUHAMMAD FARHAN ARIO PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4a58cb6f3ab1f00d83bf47df96f49b4cc27b', 'students', '4a58cb6f3ab1f00d83bf47df96f49b4cc27b', '4.52.20.1.13', 'M. RIKI FAUZI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4aea3b423c2d3dcd5e11ba9f556cbe8be1b4', 'students', '4aea3b423c2d3dcd5e11ba9f556cbe8be1b4', '4.52.21.0.15', 'GABRIEL MARINDA ALVERA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4b98fd31d17247da0d7927f40f0f694b4756', 'students', '4b98fd31d17247da0d7927f40f0f694b4756', '4.52.21.2.28', 'SAVINA UMI LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4bdcdea18df895c7d617363101129f2e8450', 'students', '4bdcdea18df895c7d617363101129f2e8450', '4.52.19.1.15', 'KHANSA ATALLAH AUFANISWARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4cce5c9e75390ea9de787c9aa0d1d8e3c895', 'students', '4cce5c9e75390ea9de787c9aa0d1d8e3c895', '4.52.21.1.01', 'AHMAD FADHOL IBAWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4de4e2e887d4f3e90720484977256629d156', 'students', '4de4e2e887d4f3e90720484977256629d156', '4.52.20.1.10', 'FICRYNA SHULCHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4df6178940e2836c17a295526f36b1850fde', 'students', '4df6178940e2836c17a295526f36b1850fde', '4.52.20.1.12', 'LINTANG SWARESKA SARASWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4e7f0f558c12d10aa243d3ca79b636f97ba0', 'students', '4e7f0f558c12d10aa243d3ca79b636f97ba0', '4.52.20.0.28', 'TALITHA DWI WIRASTUTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('4f23a887e77e23cbbea0e5ef55bc7769e79b', 'students', '4f23a887e77e23cbbea0e5ef55bc7769e79b', '4.52.20.0.08', 'ERLANGGA PUTRA WIJAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('50ba95539c1dabd077300b2d04f0a64f3d65', 'students', '50ba95539c1dabd077300b2d04f0a64f3d65', '4.52.25.2.05', 'DESTRI RAHMA SINTA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('515603ec92998b19246c2136ab3867e3bfc7', 'students', '515603ec92998b19246c2136ab3867e3bfc7', '4.52.20.1.29', 'YUANITA AMALIA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('525e2ae887ce7e8eab2003585e73c2e25912', 'students', '525e2ae887ce7e8eab2003585e73c2e25912', '4.52.19.1.20', 'NABILA FIRDA ALFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5271818e247c627b22a6288058d95976a783', 'students', '5271818e247c627b22a6288058d95976a783', '4.52.19.0.17', 'LATIFATU ZAKIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5291bc834e51af8c41d39ac5e524290491dc', 'students', '5291bc834e51af8c41d39ac5e524290491dc', '4.52.25.2.09', 'FANDY ADITYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('529fc33388f338dec8363c442676fc99cf22', 'students', '529fc33388f338dec8363c442676fc99cf22', '4.52.20.0.11', 'FADILLA DWI RAHAYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('52d3681943ce6fa6fc5bd547bff45c78713f', 'students', '52d3681943ce6fa6fc5bd547bff45c78713f', '4.52.21.1.21', 'NUR KHASANAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('53667feb06b20509a92dd3b0d90d27a458e3', 'students', '53667feb06b20509a92dd3b0d90d27a458e3', '4.52.21.0.20', 'NANA SOVIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('53723f0676969ac955f9c96bfc0a21e67d60', 'students', '53723f0676969ac955f9c96bfc0a21e67d60', '4.52.25.0.11', 'FAUZI IZZI ITSAR ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('539b70b0bc6e652a73b318edf0413e652bce', 'students', '539b70b0bc6e652a73b318edf0413e652bce', '4.52.25.0.28', 'VIO ANTHAREZA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5507dcf6d6a78ce39cbc690cf4600f5d6646', 'students', '5507dcf6d6a78ce39cbc690cf4600f5d6646', '4.52.20.0.20', 'NAILA DIVA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('551e8f6f02658105e21956a0a62de947290c', 'students', '551e8f6f02658105e21956a0a62de947290c', '4.52.19.0.22', 'NISRINA AYU SEPTIANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('55c0a23dc270d290682a65e61b8d755f302c', 'students', '55c0a23dc270d290682a65e61b8d755f302c', '4.52.20.0.09', 'ERLYAN FERDIANNA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('56b2b9a62f800ceb85ca241baf4cee3d1260', 'students', '56b2b9a62f800ceb85ca241baf4cee3d1260', '4.52.18.1.12', 'INDIE DELIMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2018,\"tahun_lulus\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5835e296d1ecd15c4be9022181cc0788af3e', 'students', '5835e296d1ecd15c4be9022181cc0788af3e', '4.52.21.1.18', 'MUHAMMAD FACHRUR HIDAYAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('58b1d15cde462eb6f8a2713afd96421b6fd8', 'students', '58b1d15cde462eb6f8a2713afd96421b6fd8', '4.52.25.0.14', 'JILTERIZA MAYLAFAYZA DESTYA HADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('591e8a8155a1c58ff3ff663a91ddd0aedc6e', 'students', '591e8a8155a1c58ff3ff663a91ddd0aedc6e', '4.52.20.1.21', 'RAMA TAUFIQURROHMAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5986df87156cacd99ef6ac5dea84400f3c4f', 'students', '5986df87156cacd99ef6ac5dea84400f3c4f', '4.52.21.1.06', 'BETY PUJI RAHAYU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ad31c6908702df08a5e7506aa065efd9618', 'students', '5ad31c6908702df08a5e7506aa065efd9618', '4.52.19.0.14', 'HESTI ELI TRIASMORO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5adf0071bf160c34ff04f3282bcd41a04c91', 'students', '5adf0071bf160c34ff04f3282bcd41a04c91', '4.52.21.0.25', 'RINDANG RIZKIDEWA FAJARAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5bb7b973e42002907630f37cac6b6d69274a', 'students', '5bb7b973e42002907630f37cac6b6d69274a', '4.52.25.2.01', 'ALIFIA MAHARANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5c12e523c99c34a70e22e97b591b60f54371', 'students', '5c12e523c99c34a70e22e97b591b60f54371', '4.52.19.0.02', 'ANNE OKTANAFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ca46ea2bf48ad08a093981c9994d6b826ef', 'students', '5ca46ea2bf48ad08a093981c9994d6b826ef', '4.52.25.1.10', 'ELFRIEDA GRACE NATALIE', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5cf2db78b73106f4ee68ad839b83986e3a91', 'students', '5cf2db78b73106f4ee68ad839b83986e3a91', '4.52.25.1.24', 'SALMA NADIYA FENANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5e1aff6f31bf4cee1abc304574eb282bf4cd', 'students', '5e1aff6f31bf4cee1abc304574eb282bf4cd', '4.52.19.0.12', 'FERDIANSYAH NAUFAL RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ecc2ab483b3bce40b1ed24a174619f84f6d', 'students', '5ecc2ab483b3bce40b1ed24a174619f84f6d', '4.52.21.1.02', 'ALIF RAFLY PRADITHIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5ef0cef33e04a9603f5de83158075a9120d3', 'students', '5ef0cef33e04a9603f5de83158075a9120d3', '4.52.20.1.11', 'KALISTA KUNTI PRAMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('5f27c1accffa6ecde47acbdc8f373b68520f', 'students', '5f27c1accffa6ecde47acbdc8f373b68520f', '4.52.25.0.22', 'RAIHANI ZULFA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6068d2534c4501ceb550cefec837a72520b2', 'students', '6068d2534c4501ceb550cefec837a72520b2', '4.52.25.2.04', 'AULIA NAZUWA YULIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('607dd90a64d383304b98bd41d8cc47a127f3', 'students', '607dd90a64d383304b98bd41d8cc47a127f3', '4.52.25.1.20', 'NAUFAL DZAKI ARDHIAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('61f375392b3e6cb2c806e5041458a7640670', 'students', '61f375392b3e6cb2c806e5041458a7640670', '4.52.21.2.21', 'PAULINA KARTIKA AJENG LARASATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('622ffa11ee1cfdc9668e7e4de11359824b30', 'students', '622ffa11ee1cfdc9668e7e4de11359824b30', '4.52.20.0.30', 'YUDHA ESA PRIBADI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('64afefd8fe156eb8d79c087c3f30418e496c', 'students', '64afefd8fe156eb8d79c087c3f30418e496c', '4.52.19.1.17', 'MARETA MARGAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('64e76435bb26eed1ec5af4a891e1bb598ace', 'students', '64e76435bb26eed1ec5af4a891e1bb598ace', '4.52.25.3.16', 'MUHAMMAD HAKIM MAULANA HALBA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('656f34a5b1f1bb9ce493fd7966b1d36e90b5', 'students', '656f34a5b1f1bb9ce493fd7966b1d36e90b5', '4.52.19.1.09', 'ERICHA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('674760a9ec2f5c87a8350c6f95958f07e16a', 'students', '674760a9ec2f5c87a8350c6f95958f07e16a', '4.52.25.1.04', 'ANGGI LAUDIYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('67575183f10d0d500ac6afbc22d0db667e0a', 'students', '67575183f10d0d500ac6afbc22d0db667e0a', '4.52.25.1.27', 'TALITHA NAFISA RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6872fe7e9ca8c321513b3c5db6a208cdec40', 'students', '6872fe7e9ca8c321513b3c5db6a208cdec40', '4.52.25.0.29', 'ZIDNII SURYA SABRANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('688242b2399969fee180c8f059443a5c44cd', 'students', '688242b2399969fee180c8f059443a5c44cd', '4.52.25.2.25', 'TARA LATIFAH TAUFIQA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('68e6ba31f87851f9821434adf03764befc87', 'students', '68e6ba31f87851f9821434adf03764befc87', '4.52.19.0.11', 'FEBRY KOMALA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('69317fbce0902ef6012fb17881abdeb013bf', 'students', '69317fbce0902ef6012fb17881abdeb013bf', '4.52.19.1.27', 'SYIFA FADILAH ARIYANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6bdc298a03c0dbacf359a628892e73aa0466', 'students', '6bdc298a03c0dbacf359a628892e73aa0466', '4.52.25.3.08', 'EUGENIUS JESSEYRO FAREL ARDANA PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6c5445047c96d0a61fbf9eeb241eac70e15e', 'students', '6c5445047c96d0a61fbf9eeb241eac70e15e', '4.52.19.0.16', 'JULIA ANGGUN PRAVITASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6de60a284a66f721ea44950ff7e7331d7cef', 'students', '6de60a284a66f721ea44950ff7e7331d7cef', '4.52.21.2.20', 'NURBIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6f7e05bcddad07ef178b4873bde430a2f5d7', 'students', '6f7e05bcddad07ef178b4873bde430a2f5d7', '4.52.25.1.13', 'HAFSHAH AULIA AZ ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6fa6ccefc13a5074d913933e34b5a9e25204', 'students', '6fa6ccefc13a5074d913933e34b5a9e25204', '4.52.20.0.06', 'ATHAYA AURELLIA RIFANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('6fcd2599645a33ca32de7ac29763a126dd68', 'students', '6fcd2599645a33ca32de7ac29763a126dd68', '4.52.21.1.04', 'ARIELLA PUTRI WIDY AYUDITHA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('70ad246bdf93291f2fbedb09edeb38aa2029', 'students', '70ad246bdf93291f2fbedb09edeb38aa2029', '4.52.20.1.28', 'TARA AYUNINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('71515584569fb5e50abefe27c2e6b23b4abc', 'students', '71515584569fb5e50abefe27c2e6b23b4abc', '4.52.25.2.14', 'MAQFIRRAH LAILY RAMADHANIA FAISAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7476eb30c82032ac1994977ba375631ac609', 'students', '7476eb30c82032ac1994977ba375631ac609', '4.52.21.2.30', 'ZAKKY AL MUBARAK', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('757f8cc2bfc347d4bf4d3341426175c198b2', 'students', '757f8cc2bfc347d4bf4d3341426175c198b2', '4.52.25.2.11', 'KALYCA ZAHRA AZALIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('75e23d523ed908fe745bb255daf48126a57e', 'students', '75e23d523ed908fe745bb255daf48126a57e', '4.52.20.0.07', 'DEANDRA AURORA PRADIPTA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('76266e35ddc8daf68968093ab3840ed5fd32', 'students', '76266e35ddc8daf68968093ab3840ed5fd32', '4.52.19.1.30', 'VICKA AZIZIAH MAULANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('76c494e146b3916e9ab33c5d8615749cc79c', 'students', '76c494e146b3916e9ab33c5d8615749cc79c', '4.52.25.3.17', 'NADHIFA AMANDA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('779347cc85e72e8d334347ec3c78bd94f6cf', 'students', '779347cc85e72e8d334347ec3c78bd94f6cf', '4.52.25.3.02', 'ALYSHA JASMINE YULIANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('784c0fabdeaaaa0acd3e3cf790df2b6c4f2e', 'students', '784c0fabdeaaaa0acd3e3cf790df2b6c4f2e', '4.52.25.1.25', 'SHOFIYATUR RUHANIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('794a44596044ec4425e94de44f884c367120', 'students', '794a44596044ec4425e94de44f884c367120', '4.52.21.2.14', 'FARAH HUSNA PRAMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('79e27a30e005bea5851cf5d3b6a95d92e27c', 'students', '79e27a30e005bea5851cf5d3b6a95d92e27c', '4.52.25.3.05', 'AZZAHRA PUTRI NURHIDAYAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7a93b304d457de12fb08300e1ba391e7d599', 'students', '7a93b304d457de12fb08300e1ba391e7d599', '4.52.19.0.27', 'SALSABILLA ALTEZA PRAMESWARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7b59b4af6821e777db73e457890354cf99f5', 'students', '7b59b4af6821e777db73e457890354cf99f5', '4.52.19.1.13', 'INAS SALMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7c5435578ad4f1bd96292bd0402a6c8266de', 'students', '7c5435578ad4f1bd96292bd0402a6c8266de', '4.52.25.2.17', 'MUHAMMAD YUDHISTIRA KHAIRIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7c690d99945d50761194bb830b90e0d56770', 'students', '7c690d99945d50761194bb830b90e0d56770', '4.52.25.1.06', 'CINTA LISTIA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7e04f872a05180f45ca77f02c5dc551cc24c', 'students', '7e04f872a05180f45ca77f02c5dc551cc24c', '4.52.19.0.10', 'ERDIAN DWI RACHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('7eea370881f9d6353e1e3dbea0a29ab497e8', 'students', '7eea370881f9d6353e1e3dbea0a29ab497e8', '4.52.19.0.30', 'SUTIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('80965fbdab75f13869f034efe1367153fd46', 'students', '80965fbdab75f13869f034efe1367153fd46', '4.52.25.3.15', 'MUHAMMAD AZHAR RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('80abf8023ddd2c8f77f45980703084928562', 'students', '80abf8023ddd2c8f77f45980703084928562', '4.52.25.2.21', 'PUTRI NUR NABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('81655187b41ee89c8acf40bc994ca3ddd833', 'students', '81655187b41ee89c8acf40bc994ca3ddd833', '4.52.21.0.10', 'DIVIA CAHYA BULAN RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('83b5c4bfc37258642c903c5c419c58135ae2', 'students', '83b5c4bfc37258642c903c5c419c58135ae2', '4.52.25.3.03', 'ASTI MARLINA FEBRIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('85da1612b75cc7c381d1cc12a0868080bcf3', 'students', '85da1612b75cc7c381d1cc12a0868080bcf3', '4.52.23.8.08', 'REGHINA NURALISYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8604364403de2b6f4e7fdc017acc13ef9cc1', 'students', '8604364403de2b6f4e7fdc017acc13ef9cc1', '4.52.21.0.18', 'MODESTA DHEA MARSHEILLA SAVIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('86f5fbe54a77680d085d95f5d18ff7470536', 'students', '86f5fbe54a77680d085d95f5d18ff7470536', '4.52.20.0.12', 'LAKSAMANA MUQSITHU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87a856efedc0080606e96f91d7977f2f5003', 'students', '87a856efedc0080606e96f91d7977f2f5003', '4.52.20.0.22', 'RACHMADIAN NURWULAN FITRIYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87ccf34b080baa0a3d722d5bb3335c49318c', 'students', '87ccf34b080baa0a3d722d5bb3335c49318c', '4.52.20.0.14', 'LUTFI RIDHOWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('87da855432b8a38f6599563fd10f925e14a6', 'students', '87da855432b8a38f6599563fd10f925e14a6', '4.52.21.1.12', 'FADILA BERLIANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('88c6e621aa070879b0dd70935a7539c1caa0', 'students', '88c6e621aa070879b0dd70935a7539c1caa0', '4.52.25.3.04', 'AZKA ZULIDA RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('890150304b390253b1eee29b47fc6e56af5f', 'students', '890150304b390253b1eee29b47fc6e56af5f', '4.52.21.1.23', 'RAHMA FATHIMATUZ ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8af7feab66dfafe3582e82ef5edf78323c9f', 'students', '8af7feab66dfafe3582e82ef5edf78323c9f', '4.52.25.0.18', 'NAJWAN ZAAKIY RAFATA HERMAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8b184351e1c5a6f4f54288d3e660b8a9a48b', 'students', '8b184351e1c5a6f4f54288d3e660b8a9a48b', '4.52.19.1.05', 'ASTI KHOERUNISA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8c0a8e7278e00a4c6366a12ea212f50af639', 'students', '8c0a8e7278e00a4c6366a12ea212f50af639', '4.52.21.2.29', 'ULYA AMRINA ROSYADA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8c4f84f9f7a2a50c4797f028f2188fd4aabf', 'students', '8c4f84f9f7a2a50c4797f028f2188fd4aabf', '4.52.25.0.25', 'SHELLOMITA DEVINA PRASTICA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8d255ba2a98375b9e9b6dbb0efda90fe26b9', 'students', '8d255ba2a98375b9e9b6dbb0efda90fe26b9', '4.52.25.3.12', 'KUN ASHRI RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26');
INSERT INTO `menu_study_period_records` (`id`, `source_table`, `source_id`, `snapshot_nim`, `snapshot_nama`, `snapshot_prodi`, `snapshot_fakultas`, `tahun_pelaporan`, `payload`, `included_in_chart`, `deleted_at`, `created_at`, `updated_at`) VALUES
('8d552a500a42bb233355dfd56375dc7d6d10', 'students', '8d552a500a42bb233355dfd56375dc7d6d10', '4.52.21.0.06', 'AZZAM ALHAFHIZD', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8d5bca3c835456496c227129732982bd7ae7', 'students', '8d5bca3c835456496c227129732982bd7ae7', '4.52.23.8.07', 'PUTRA HOFNI BUANG KARUAPI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8eb9fa5350989550275382b57f6d80bfcff5', 'students', '8eb9fa5350989550275382b57f6d80bfcff5', '4.52.20.1.15', 'MICHELLA DENINTA SULISTYO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('8efb30b3c52026e0d9c35dd84214c852ca0c', 'students', '8efb30b3c52026e0d9c35dd84214c852ca0c', '4.52.25.3.09', 'FATIMAH NUR JANNATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('904ff18404fd9e86462c373322c3444b9171', 'students', '904ff18404fd9e86462c373322c3444b9171', '4.52.25.2.10', 'HANNA LAA TAHZAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('90e5f740abaa25740c2eb4b277554670c9cc', 'students', '90e5f740abaa25740c2eb4b277554670c9cc', '4.52.20.0.05', 'ARDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('92a6f58e9bd8c45be3f82b12241ebd138094', 'students', '92a6f58e9bd8c45be3f82b12241ebd138094', '4.52.21.2.18', 'MEILINA DYAH SETYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('92c4ac55345063c8392d6110d6555a0e8c0d', 'students', '92c4ac55345063c8392d6110d6555a0e8c0d', '4.52.25.0.13', 'GABRIELLE NATALIE WIJAYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('93dd0095d8410167da9ab4bb4c7a56b29fae', 'students', '93dd0095d8410167da9ab4bb4c7a56b29fae', '4.52.19.1.23', 'PUTRI SEKARLANGIT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('93e80dd6b7eb89d4056d3ac82c2020213165', 'students', '93e80dd6b7eb89d4056d3ac82c2020213165', '4.52.20.1.26', 'SINTA BELA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('94047b792f7683892086af5477fb74d01d48', 'students', '94047b792f7683892086af5477fb74d01d48', '4.52.25.1.26', 'SYAHLA GRISELDA RISANDRIYAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('94773b87d2a5bce7ba86095d3bd257f15c56', 'students', '94773b87d2a5bce7ba86095d3bd257f15c56', '4.52.25.2.15', 'MARTASYA CAHYANING MUKTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('950839c3297aff0c65849a2a98ccfe511b03', 'students', '950839c3297aff0c65849a2a98ccfe511b03', '4.52.21.0.17', 'MIRZA DZAKI KAMAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('957746a7a39334cfae09b368aff30179f009', 'students', '957746a7a39334cfae09b368aff30179f009', '4.52.25.2.24', 'SEFANYA MISA EGRINA S KEMBAREN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('96a7eb0f0b1d8abdf90083d482c7fec0cc7c', 'students', '96a7eb0f0b1d8abdf90083d482c7fec0cc7c', '4.52.20.0.15', 'MAYDISTA LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('97793e6174717ee08cbc78edceb14dd7baf4', 'students', '97793e6174717ee08cbc78edceb14dd7baf4', '4.52.25.1.28', 'TASYA LATIFA ZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('99bec0bbb9b65c0fb6804a54b6f5396789be', 'students', '99bec0bbb9b65c0fb6804a54b6f5396789be', '4.52.25.0.07', 'CHELSEA AULIA RAMADHANI PUSPO HAPSARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('99f2d2709f09965142760c9b5d240d0a4faa', 'students', '99f2d2709f09965142760c9b5d240d0a4faa', '4.52.21.0.11', 'ELSA MAHARANI KUMAAT', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a20182e693a156c56995df05020766eb62c', 'students', '9a20182e693a156c56995df05020766eb62c', '4.52.21.0.14', 'FARSYA SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a582c8b4b52954a4d95d48eac52c68cc633', 'students', '9a582c8b4b52954a4d95d48eac52c68cc633', '4.52.19.0.29', 'SHINTA SUGIARTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a68846ce979d1bd5c351817cb899ad435b0', 'students', '9a68846ce979d1bd5c351817cb899ad435b0', '4.52.25.3.01', 'ADELIA AYU SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a81afa5d7e05a31f4de6c251ef07e95e54e', 'students', '9a81afa5d7e05a31f4de6c251ef07e95e54e', '4.52.25.3.25', 'SEVIA SENTRA HATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9a87ccf8b88c20883cb04699d3d87c932093', 'students', '9a87ccf8b88c20883cb04699d3d87c932093', '4.52.25.0.26', 'STEFANE JOY LOVTIANDRO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9aab5d951118a2a96539e8678e763c4edf0c', 'students', '9aab5d951118a2a96539e8678e763c4edf0c', '4.52.19.1.18', 'MOHAMAD WIRA YUDA SAWEGA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9ac63b0b7dc5a133d15423b48637e095cd80', 'students', '9ac63b0b7dc5a133d15423b48637e095cd80', '4.52.19.1.25', 'SHELVIA CHETRIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9c47172769005bad86a254532b741d1a1737', 'students', '9c47172769005bad86a254532b741d1a1737', '4.52.21.1.30', 'ZALFA LARASATI FADILLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9caa0be42087abf642e127604a95bf2a6666', 'students', '9caa0be42087abf642e127604a95bf2a6666', '4.52.20.1.17', 'NABILA RAHMASARY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9d3c0b083e3b15843919a5cfbd7510552712', 'students', '9d3c0b083e3b15843919a5cfbd7510552712', '4.52.21.0.28', 'SRI WAHYUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9d4b6a88fcfb4e162b4f3afe03aa1104c853', 'students', '9d4b6a88fcfb4e162b4f3afe03aa1104c853', '4.52.21.0.02', 'ADINDA HEMAS RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9f6abf469a91eb1958916a41c32f1851dc2c', 'students', '9f6abf469a91eb1958916a41c32f1851dc2c', '4.52.21.2.06', 'AVERIL PRAMUDITA PRIADANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9f927b1678f043e65942ede96b03c630887b', 'students', '9f927b1678f043e65942ede96b03c630887b', '4.52.25.2.23', 'SAVIRA YULIA INDRIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('9fb0608ecadb8485298fb9c397cd7519e645', 'students', '9fb0608ecadb8485298fb9c397cd7519e645', '4.52.19.1.06', 'ASYIFANI LUTHFIYYAH ANNASYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a059e45e68d895d20668b180be081a31f120', 'students', 'a059e45e68d895d20668b180be081a31f120', '4.52.21.2.17', 'LULUK PUTRI LESTARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a0a2b4841b4a6864179c6de00c225f63e57d', 'students', 'a0a2b4841b4a6864179c6de00c225f63e57d', '4.52.25.2.16', 'MOSES SURYA PRAKOSO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a1a4c9d0d4190e71a933e869c3b9be05763c', 'students', 'a1a4c9d0d4190e71a933e869c3b9be05763c', '4.52.21.1.27', 'SOFIAH LAILA RAHMANIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a20ecd3f5bdcc37fc64af24a628b4781faee', 'students', 'a20ecd3f5bdcc37fc64af24a628b4781faee', '4.52.25.3.10', 'FIRDA AULIA PAZA UTAMI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a41209242f17cb720a5c4f97d6929f771b6a', 'students', 'a41209242f17cb720a5c4f97d6929f771b6a', '4.52.25.2.18', 'NADILA ARIVIANA TRI ANTIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a47f757c1c43c783191f57e58925ee20e684', 'students', 'a47f757c1c43c783191f57e58925ee20e684', '4.52.20.0.24', 'RATNA SETIYAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a49fafcdfcf2836dcf151050346791db3f19', 'students', 'a49fafcdfcf2836dcf151050346791db3f19', '4.52.19.0.25', 'RIEGGA RHEZA FERDIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a4b8e63b7cdcf7e50ca41748b5b8c8d04317', 'students', 'a4b8e63b7cdcf7e50ca41748b5b8c8d04317', '4.52.20.1.25', 'SALMA PUTRI KHANSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a54f01125f6c20fe2ebf73ea4cf3388d7cb0', 'students', 'a54f01125f6c20fe2ebf73ea4cf3388d7cb0', '4.52.25.3.23', 'RIO HENDARTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a6223abf1e0de740922b2d97155dd54b1458', 'students', 'a6223abf1e0de740922b2d97155dd54b1458', '4.52.20.0.02', 'ADZIMA QALSUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a69de929464423f4dd3902d9d78d9122b24a', 'students', 'a69de929464423f4dd3902d9d78d9122b24a', '4.52.25.0.16', 'MUHAMMAD DWI RIZKI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a7681a1392183d931569c397f530d6421e96', 'students', 'a7681a1392183d931569c397f530d6421e96', '4.52.25.0.09', 'DIANDRA ASYLA PUTRI ZAHIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a9000ee755ef6a121727ef93f811d663e640', 'students', 'a9000ee755ef6a121727ef93f811d663e640', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a94793722eba0d837e767e459c5bcf71f691', 'students', 'a94793722eba0d837e767e459c5bcf71f691', '4.52.19.1.28', 'TRIYAMAH SOLIHATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('a96a8bf440a39255fe83cdb41f4271e4e373', 'students', 'a96a8bf440a39255fe83cdb41f4271e4e373', '4.52.21.1.17', 'M. FAHRUR RIZKI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('aad2131c222d316ad506c1575bd48c41eb37', 'students', 'aad2131c222d316ad506c1575bd48c41eb37', '4.52.25.2.27', 'WAHENDRA JAYA PRAYITNO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ada57d6df5da9fe7559c2677f06f3adefef0', 'students', 'ada57d6df5da9fe7559c2677f06f3adefef0', '4.52.23.8.04', 'HARDI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ae582392b5f0ba4c78e5d5960f338c258c8a', 'students', 'ae582392b5f0ba4c78e5d5960f338c258c8a', '4.52.25.3.27', 'SUCI AULIA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ae7d0c7104569dfdc831374449d941adccd7', 'students', 'ae7d0c7104569dfdc831374449d941adccd7', '4.52.25.3.26', 'SOFYA ANGEL KEYSYA DEWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af01c1708a409cb69d21e0dc57fd2c15382e', 'students', 'af01c1708a409cb69d21e0dc57fd2c15382e', '4.52.19.1.10', 'FATIMAH ZAKIYATUL FITRIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af1d1679f3e43ed77a9c17d9d34884c8fcbe', 'students', 'af1d1679f3e43ed77a9c17d9d34884c8fcbe', '4.52.25.1.12', 'FRISCA DWI SEPTIANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('af6beeabf4edb555e8316de9befbd1ee4e42', 'students', 'af6beeabf4edb555e8316de9befbd1ee4e42', '4.52.20.0.10', 'ERVINA AYU PERMATASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('afb01f91442e2e711b738aa9065247c5049b', 'students', 'afb01f91442e2e711b738aa9065247c5049b', '4.52.21.2.22', 'PINKY ALVIYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b28168767b3dbf0055288d35ae968f3bb3e0', 'students', 'b28168767b3dbf0055288d35ae968f3bb3e0', '4.52.25.1.16', 'MERRYS MARGARETHA PUTRI REIMAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b2c3d5dc7c963fd39728f292908955d6117b', 'students', 'b2c3d5dc7c963fd39728f292908955d6117b', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2021, '{\"tahun_masuk\":2018,\"tahun_lulus\":2021}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b30ac717e844424b6dd831cce92e66af7019', 'students', 'b30ac717e844424b6dd831cce92e66af7019', '4.52.25.0.24', 'SABRINA IBROSA SEPTIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3ab7a6e7381af4575b1d14313fc071f240d', 'students', 'b3ab7a6e7381af4575b1d14313fc071f240d', '4.52.21.0.09', 'DIMAS MAHENDRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3b58cc788d160a0f7527c0fb8b17f868e1f', 'students', 'b3b58cc788d160a0f7527c0fb8b17f868e1f', '4.52.25.1.22', 'QOWI HAQQUN NAUFAL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3c45726adbaea4037223873a0ff00278da7', 'students', 'b3c45726adbaea4037223873a0ff00278da7', '4.52.25.0.15', 'MESYA ROSELLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b3cefe8b17198007d600d2f8228d7e893982', 'students', 'b3cefe8b17198007d600d2f8228d7e893982', '4.52.19.1.08', 'ELSA RAHMATIKA SETYAKASIH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b48e7511c8da65c963fb4e29e2c797aba866', 'students', 'b48e7511c8da65c963fb4e29e2c797aba866', '4.52.21.2.07', 'AYU RONNA WATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b54fa8092ffe65936dd72527b4a2f1f5a13a', 'students', 'b54fa8092ffe65936dd72527b4a2f1f5a13a', '4.52.25.1.14', 'HANI CHALIMATUS SADIYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b555a502b3601768fa857883bc6fdca5b8a8', 'students', 'b555a502b3601768fa857883bc6fdca5b8a8', '4.52.25.3.22', 'REVINA GADIS AYYUN CHOLISYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b698074ba6bb38a570975bbdd5dfed2fd31b', 'students', 'b698074ba6bb38a570975bbdd5dfed2fd31b', '4.52.19.0.28', 'SHERLY RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b76be7cb03195bccc84894f3c8a93a14c859', 'students', 'b76be7cb03195bccc84894f3c8a93a14c859', '4.52.21.2.19', 'MUHAMMAD NUR IRFAN WAHYUDI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b777e5a9fb404436a2b430b1460ac8b8b79e', 'students', 'b777e5a9fb404436a2b430b1460ac8b8b79e', '4.52.25.0.19', 'NAYLA ZULFA ARIANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('b9ff6cfa57801ff8055e449e528c1c1660e8', 'students', 'b9ff6cfa57801ff8055e449e528c1c1660e8', '4.52.21.0.29', 'TIARA RENA PUSPA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bb0b4fbc4bd4945c3eb0e219dc42807eabd1', 'students', 'bb0b4fbc4bd4945c3eb0e219dc42807eabd1', '4.52.25.3.13', 'MARCHA NABILA PUTRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bb963af36ee680e6229202721d9196bfcd9f', 'students', 'bb963af36ee680e6229202721d9196bfcd9f', '4.52.25.0.20', 'NINDI VELINDIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bcdab07441fe50a10f92fd3acd55652f77c7', 'students', 'bcdab07441fe50a10f92fd3acd55652f77c7', '4.52.20.0.03', 'AMELIA TRISNA PUSPANINGRUM', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bcf52a86da1c9ccb74e5ebdd4e442b071a07', 'students', 'bcf52a86da1c9ccb74e5ebdd4e442b071a07', '4.52.19.1.04', 'ASSIFAH SALSABIILAA ROSSA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bd351f3421d384865dc44c062a9e234decd0', 'students', 'bd351f3421d384865dc44c062a9e234decd0', '4.52.25.1.23', 'RARA AMELLIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bdf819933f5c4893a1ea9ef91600fd78d844', 'students', 'bdf819933f5c4893a1ea9ef91600fd78d844', '4.52.19.1.24', 'RIZKA LAILA MAULIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be0ada62f62cc9bbe717fa89ed729830824b', 'students', 'be0ada62f62cc9bbe717fa89ed729830824b', '4.52.20.0.17', 'MUHAMMAD AZHAR FADHLURROHMAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be298440086943a87aa528a4b3c63f5018dd', 'students', 'be298440086943a87aa528a4b3c63f5018dd', '4.52.20.1.07', 'DIYANNISA FIRDAUSY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be43306459e07f547abf4b72380ffdef4c92', 'students', 'be43306459e07f547abf4b72380ffdef4c92', '4.52.19.0.04', 'BAGOES HERU PRAYOGA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('be88ce08108eb26ff4422d2e8470ee528284', 'students', 'be88ce08108eb26ff4422d2e8470ee528284', '4.52.21.0.23', 'RAFLI ERSA ARDIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('bf0ffa2727b10b33465794695b58cb24d449', 'students', 'bf0ffa2727b10b33465794695b58cb24d449', '4.52.25.2.19', 'NAURA HUWAIDA ROHADATUL \'AISY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c1b6f87f56cebc3e02c9f2f97d8d761f9cce', 'students', 'c1b6f87f56cebc3e02c9f2f97d8d761f9cce', '4.52.20.1.01', 'AFRIDA AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c241fcb98f638b7aa8fa9e727fc9ab4ab0e1', 'students', 'c241fcb98f638b7aa8fa9e727fc9ab4ab0e1', '4.52.23.8.10', 'STEVANUS MARTIN EKA DIMARA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c2c0a663a33b9853e153d2d81c145e536087', 'students', 'c2c0a663a33b9853e153d2d81c145e536087', '4.52.21.0.03', 'ALFINA RAHMAWATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c3f80d1cb4f1c56cf5c7c9dcf13a102039e6', 'students', 'c3f80d1cb4f1c56cf5c7c9dcf13a102039e6', '4.52.25.1.19', 'MUHAMMAD RIZWAR ANAS FIRDAUS', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c55fea30ba33589f101f257aedc55e7ce9f5', 'students', 'c55fea30ba33589f101f257aedc55e7ce9f5', '4.52.19.1.12', 'GUSTI TAHTA LADUNI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c5b525d68e4a88b74a38c478433fa30df989', 'students', 'c5b525d68e4a88b74a38c478433fa30df989', '4.52.20.0.01', 'ADESGY TIARA LARASATY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c66edb9c6142a2d81ae81c2f1104dc0eb0c8', 'students', 'c66edb9c6142a2d81ae81c2f1104dc0eb0c8', '4.52.21.2.02', 'ALFINA NUGRAHENI RAMADHANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c6ec49ba98dec8d5b26fa29b6ab19eaa7907', 'students', 'c6ec49ba98dec8d5b26fa29b6ab19eaa7907', '4.52.23.8.03', 'DITA RATNA SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c75c7ddb230b993c34aac95c0ad02e1466eb', 'students', 'c75c7ddb230b993c34aac95c0ad02e1466eb', '4.52.21.1.19', 'NAUFAL ABDILLAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c76d9b8c29af32e62a35234cae7dae82ef43', 'students', 'c76d9b8c29af32e62a35234cae7dae82ef43', '4.52.21.1.13', 'FITRIA RAHMA SAHID', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c79387f1a69a430e4174b418494427a947ce', 'students', 'c79387f1a69a430e4174b418494427a947ce', '4.52.25.0.12', 'FAZA MAOLANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('c7bcad31daf9eeb7eeb9892d0bc850ac4a6d', 'students', 'c7bcad31daf9eeb7eeb9892d0bc850ac4a6d', '4.52.25.3.29', 'ZAID ABU JABIR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('cb3a4fe1e3b545bccc6b5e47b204dbd0382e', 'students', 'cb3a4fe1e3b545bccc6b5e47b204dbd0382e', '4.52.21.1.28', 'TALITHA SAHDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d00176dd99edca3bcd3a53edb2cbc30f29bd', 'students', 'd00176dd99edca3bcd3a53edb2cbc30f29bd', '4.52.20.1.05', 'ARVIKA OKTARINA JAYANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d0b5c93854226beefccd540e83b6aa6c688e', 'students', 'd0b5c93854226beefccd540e83b6aa6c688e', '4.52.21.2.03', 'ALIT NADA SYAHRANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d0ff2579f0de6bb6a4a7088a43198ee3828f', 'students', 'd0ff2579f0de6bb6a4a7088a43198ee3828f', '4.52.25.0.27', 'TAN,INTAN PUSPITA SARI GUNAWAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d24937762ea5a99d4d3746fcbfc7898e3854', 'students', 'd24937762ea5a99d4d3746fcbfc7898e3854', '4.52.23.8.02', 'AI LUDIANA MANSNANDIFU', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d3228f21a2e7a1da8616b76821985b1fe421', 'students', 'd3228f21a2e7a1da8616b76821985b1fe421', '4.52.20.0.27', 'SAPNA PUTRI HANDAYANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d335fc823295e934f4cb6adcfda8d5177661', 'students', 'd335fc823295e934f4cb6adcfda8d5177661', '4.52.25.2.22', 'RAYHAN AHMAD PUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d373f81dcb645f00700101ce2b240dac3534', 'students', 'd373f81dcb645f00700101ce2b240dac3534', '4.52.20.0.19', 'MUHAMMAD YUNUS', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d3f950f842c26908a4bb40e8645af6ee25af', 'students', 'd3f950f842c26908a4bb40e8645af6ee25af', '4.52.21.2.27', 'SALSABILA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d5acac9a03a53be68bdc9ea7ed78ed330b33', 'students', 'd5acac9a03a53be68bdc9ea7ed78ed330b33', '4.52.21.0.07', 'CLARISSA HAPPY NUR VADITA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d63ac8b1e9ad28b812e1dac0a6c6619073c8', 'students', 'd63ac8b1e9ad28b812e1dac0a6c6619073c8', '4.52.25.0.21', 'NUR FITA RIZKY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d71a08aafc37ecef9e9eb6c2d54b4a866c25', 'students', 'd71a08aafc37ecef9e9eb6c2d54b4a866c25', '4.52.19.1.02', 'ANUGRAHA HADI SAPUTRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d845e8c9d3fd9b64d8807de626a148c9861c', 'students', 'd845e8c9d3fd9b64d8807de626a148c9861c', '4.52.25.3.21', 'RAIHAN ADITYA HENDRIANSYAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d8703eaaa67b31bc8435ee3c94901c079855', 'students', 'd8703eaaa67b31bc8435ee3c94901c079855', '4.52.19.1.14', 'JOIS AKSA GANEO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d930e795d956be6408427d191e8879ceaaf2', 'students', 'd930e795d956be6408427d191e8879ceaaf2', '4.52.25.0.03', 'AGHNIYA SAPHIIRA RAMADHAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d9a091a70359593b2d1b73fcc146814cd77f', 'students', 'd9a091a70359593b2d1b73fcc146814cd77f', '4.52.21.0.16', 'KHAMIM NUR', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('d9e9197869c5a1fe48a7e6d65f04c0a2a50c', 'students', 'd9e9197869c5a1fe48a7e6d65f04c0a2a50c', '4.52.21.2.26', 'SAKINATUL KHOLIDA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('daef2475c44e140b3acb5dc4f26d5fdba0f3', 'students', 'daef2475c44e140b3acb5dc4f26d5fdba0f3', '4.52.21.1.26', 'SATYANIN DIAZ', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db023aae14f05d1489e3370c1eeb2f352dbc', 'students', 'db023aae14f05d1489e3370c1eeb2f352dbc', '4.52.21.1.03', 'ANISA YUMNA ARIANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db6724ae5ab6b6f2a25c62fd8fdab7f08ecd', 'students', 'db6724ae5ab6b6f2a25c62fd8fdab7f08ecd', '4.52.25.2.03', 'ANTHONY ROBBINS SAPUTRO HANDOYO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('db85164943c074c337a685d59f96c6833f6e', 'students', 'db85164943c074c337a685d59f96c6833f6e', '4.52.21.2.05', 'ARVIA NUR AROFAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dbbad91c8b8ac1057a86ebc26589685710a6', 'students', 'dbbad91c8b8ac1057a86ebc26589685710a6', '4.52.25.1.21', 'PARAMITHA NADIA HUMAIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dc617eecffc155b7fc8b4feeb83bc30f5896', 'students', 'dc617eecffc155b7fc8b4feeb83bc30f5896', '4.52.23.8.05', 'JIHAN AURLYA CANDY', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dcfcf2710e85953783c771b28419747d0456', 'students', 'dcfcf2710e85953783c771b28419747d0456', '4.52.25.3.14', 'MUHAMMAD APRILIYANTO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dd3221154f4d7e9130706299656725acb528', 'students', 'dd3221154f4d7e9130706299656725acb528', '4.52.21.0.12', 'EMI ANGGORO WATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('dd56645c16b5c269e41da69335bad90119f6', 'students', 'dd56645c16b5c269e41da69335bad90119f6', '4.52.21.2.01', 'ADELIA DEWANTI AZZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('df45f53b18f276dc31a5be519956b940edde', 'students', 'df45f53b18f276dc31a5be519956b940edde', '4.52.21.2.08', 'BRIGITTA PUNGKI YULIASHARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('df54ddf44a07d617e437f92ffbcd9f92b3db', 'students', 'df54ddf44a07d617e437f92ffbcd9f92b3db', '4.52.21.2.25', 'RESTI FARSHANANDA RISWANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e11bcc209dc166225a4c381bbbe604d10a70', 'students', 'e11bcc209dc166225a4c381bbbe604d10a70', '4.52.21.1.24', 'RISKA MUSTOFASARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e13f449090567dbf462f6536a4e966701946', 'students', 'e13f449090567dbf462f6536a4e966701946', '4.52.20.1.30', 'ZAHRASEA FARAH ILYASA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e32cabadd2786607fc259afaefda8e4e832e', 'students', 'e32cabadd2786607fc259afaefda8e4e832e', '4.52.25.0.04', 'AMELIA NAJWA AZZAHRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e41ecf601f4f1c2f94c4bdf1cc7fcf29b7e8', 'students', 'e41ecf601f4f1c2f94c4bdf1cc7fcf29b7e8', '4.52.21.0.08', 'DAFA AZZAHRA MUSTIKA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e42a3f60843b920741679109c147d2b390a8', 'students', 'e42a3f60843b920741679109c147d2b390a8', '4.52.21.1.14', 'HERSA SINTIA PRAMUDYA WARDANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e6a2c13227c3e08aa1c713ea7ae87b97bf23', 'students', 'e6a2c13227c3e08aa1c713ea7ae87b97bf23', '4.52.25.0.17', 'MUHAMMAD FARREL ROZAN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e8e1e31593ed496acaddaee8f5e1c377e526', 'students', 'e8e1e31593ed496acaddaee8f5e1c377e526', '4.52.25.1.17', 'MUHAMMAD RAFA MAFTUHIN', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e8f8919512d277f1c25cca275f241c2437bf', 'students', 'e8f8919512d277f1c25cca275f241c2437bf', '4.52.21.2.23', 'PUTRI KINASIH GUSTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('e9e86bacc29f3acfb495c31e9e34612aff39', 'students', 'e9e86bacc29f3acfb495c31e9e34612aff39', '4.52.21.0.13', 'FARIDA NAJWA WAHYUONO', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ecc44af0774ee0842e3af2a41c4d34918e09', 'students', 'ecc44af0774ee0842e3af2a41c4d34918e09', '4.52.25.3.24', 'ROSEWINAR FILADELFIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('ece6a043c9e42ace73af0c98dadf1979e520', 'students', 'ece6a043c9e42ace73af0c98dadf1979e520', '4.52.21.2.11', 'ELSANTI NUR SAFITRI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('edcd05e460692c4dcf1bb79f58db99c74009', 'students', 'edcd05e460692c4dcf1bb79f58db99c74009', '4.52.25.2.26', 'VANI ANDREANA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('eef11f97cce265c27fd804faa717aac908c8', 'students', 'eef11f97cce265c27fd804faa717aac908c8', '4.52.23.8.06', 'LENNY LEONITA MARINI UBRUANGGE', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2027, '{\"tahun_masuk\":2023,\"tahun_lulus\":2027}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('efc46d4362f270ae747f16b7012dcd17ac40', 'students', 'efc46d4362f270ae747f16b7012dcd17ac40', '4.52.25.0.06', 'AWALIA ARDIYANTI HANIFA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f12900ef930e0b3086903d7599d3c8311a5c', 'students', 'f12900ef930e0b3086903d7599d3c8311a5c', '4.52.21.1.05', 'AULIA SALSA ZAZILLA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f35a0062b116dc7a1a5e997fdb946d78de13', 'students', 'f35a0062b116dc7a1a5e997fdb946d78de13', '4.52.25.0.08', 'CLAUDI DWI VEBRIANTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3c372bb0712b8e9092081c73d06be25a5b4', 'students', 'f3c372bb0712b8e9092081c73d06be25a5b4', '4.52.25.3.20', 'NIA DWI RAMADHANI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3c9b163811d33083ea34914d6cfa2656a0c', 'students', 'f3c9b163811d33083ea34914d6cfa2656a0c', '4.52.20.1.06', 'BALQIS GHAISSANY SHADRINA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f3f62c7b2932350d6e4b05d025b916bbf51e', 'students', 'f3f62c7b2932350d6e4b05d025b916bbf51e', '4.52.21.2.10', 'DIKA NUR PRASETYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f4d7a232527e296d0e5e225c55ac4c40b483', 'students', 'f4d7a232527e296d0e5e225c55ac4c40b483', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f525d64218c3c64819a69b3b4b7ce0afd3f4', 'students', 'f525d64218c3c64819a69b3b4b7ce0afd3f4', '4.52.25.3.19', 'NAYLA ARKA DEWI INDIRA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f7092f6cf55aaafde527df01ae4b7053c2d2', 'students', 'f7092f6cf55aaafde527df01ae4b7053c2d2', '4.52.21.2.04', 'ANINDYA  RISTA AMESTI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f7293b32910658136719f49621bd70b6a140', 'students', 'f7293b32910658136719f49621bd70b6a140', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f962edeb4542930e99e62e87c18ccff21918', 'students', 'f962edeb4542930e99e62e87c18ccff21918', '4.52.19.0.26', 'RUMIYATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f98945aa6cef1d452fb5e4939012a93ec827', 'students', 'f98945aa6cef1d452fb5e4939012a93ec827', '4.52.20.0.13', 'LUBNAA TSAABITAH', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{\"tahun_masuk\":2020,\"tahun_lulus\":2024}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('f9f23fca2986ccf409852091d16dd6a342ce', 'students', 'f9f23fca2986ccf409852091d16dd6a342ce', '4.52.21.2.09', 'DESTIA RAHMA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fa6ff12b87b3fc39c196b4eebfa727c81291', 'students', 'fa6ff12b87b3fc39c196b4eebfa727c81291', '4.52.25.1.02', 'AMIRAH SALSABIL', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fafd88d6b75173d9275f422cb98a864ea171', 'students', 'fafd88d6b75173d9275f422cb98a864ea171', '4.52.25.1.15', 'KEYSHA JASMINE KURNIA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2029, '{\"tahun_masuk\":2025,\"tahun_lulus\":2029}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fc6014910c20c3985f23e46c71aeddd543d9', 'students', 'fc6014910c20c3985f23e46c71aeddd543d9', '4.52.19.1.11', 'FELICIA REVIE KUSUMADEWI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fc8db89b442044129c9a603b81b09df794ab', 'students', 'fc8db89b442044129c9a603b81b09df794ab', '4.52.21.0.21', 'NURUL AULIA ISNAINI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fcc5b15e6c6e926c9dcaf29cf11a25832b4f', 'students', 'fcc5b15e6c6e926c9dcaf29cf11a25832b4f', '4.52.19.1.26', 'SOPHIA JULIANTI NISA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2022, '{\"tahun_masuk\":2019,\"tahun_lulus\":2022}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fecc538004d43789cf209c40dc3a043f3439', 'students', 'fecc538004d43789cf209c40dc3a043f3439', '4.52.21.1.15', 'INDAH LARASATI', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26'),
('fedfb4620feda86f68134e5f51294ccb31a4', 'students', 'fedfb4620feda86f68134e5f51294ccb31a4', '4.52.21.0.05', 'ANNISAAUL FITHRIYA', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2025, '{\"tahun_masuk\":2021,\"tahun_lulus\":2025}', 1, NULL, '2026-03-06 09:24:26', '2026-03-06 09:24:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_user_satisfaction_records`
--

CREATE TABLE `menu_user_satisfaction_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_waiting_time_records`
--

CREATE TABLE `menu_waiting_time_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `menu_work_coverage_records`
--

CREATE TABLE `menu_work_coverage_records` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_import_logs`
--

CREATE TABLE `prestasi_import_logs` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `finished_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `prestasi_import_logs`
--

INSERT INTO `prestasi_import_logs` (`id`, `module`, `kategori`, `uploaded_by`, `file_name`, `total_rows`, `valid_rows`, `success_rows`, `failed_rows`, `duplicate_rows`, `empty_rows`, `affected_students`, `status`, `created_at`, `finished_at`) VALUES
('24bb6981131931d73aabea3f4eda805574ff', 'prestasi', 'jurnal', 'admin-abt-001', 'template-import-prestasi-jurnal (2).xlsx', 323, 1, 1, 0, 0, 322, 1, 'completed', '2026-03-06 09:48:47', '2026-03-06 09:48:47'),
('358ea4bf860ce17393ae5614aaa4afb2badd', 'prestasi', 'jurnal', 'admin-abt-001', 'template-import-prestasi-jurnal.xlsx', 323, 1, 1, 0, 0, 322, 1, 'completed', '2026-03-06 09:52:56', '2026-03-06 09:52:57'),
('484675c0690c147bc1ab990858241f65d704', 'prestasi', 'jurnal', 'admin-abt-001', 'template-import-prestasi-jurnal (4).xlsx', 324, 2, 2, 0, 0, 322, 1, 'completed', '2026-03-06 10:14:10', '2026-03-06 10:14:10'),
('638f9ef95d6caead52d42928bded5b313c27', 'prestasi', 'jurnal', 'admin-abt-001', 'template-import-prestasi-jurnal (2).xlsx', 323, 0, 0, 1, 0, 322, 0, 'completed', '2026-03-06 09:48:01', '2026-03-06 09:48:01'),
('884f92440f11ea3f826310c4bcf9442908ec', 'prestasi', 'produk_mahasiswa', 'admin-abt-001', 'Template produk.xlsx', 323, 1, 1, 0, 0, 322, 1, 'completed', '2026-03-06 09:56:30', '2026-03-06 09:56:30'),
('feebca0c3e1e178553fecb7f905a4accbdf8', 'prestasi', 'jurnal', 'admin-abt-001', 'Template Jurnal.xlsx', 330, 24, 24, 9, 0, 297, 18, 'completed', '2026-03-11 08:52:26', '2026-03-11 08:52:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_import_log_details`
--

CREATE TABLE `prestasi_import_log_details` (
  `id` varchar(36) NOT NULL,
  `import_log_id` varchar(36) NOT NULL,
  `row_number` int(11) NOT NULL,
  `nim_raw` varchar(50) DEFAULT NULL,
  `status` enum('error','duplicate','skipped_empty','inserted') NOT NULL,
  `message` varchar(500) DEFAULT NULL,
  `raw_payload_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_payload_json`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `prestasi_import_log_details`
--

INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('0009d347503ca7a46b7e2deb70681702a446', 'feebca0c3e1e178553fecb7f905a4accbdf8', 36, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('0021161ebfc4342dc1fb4c4755392c162d4b', '358ea4bf860ce17393ae5614aaa4afb2badd', 133, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('00499393a662bb43f13ed1db01ad0f4af6f0', '638f9ef95d6caead52d42928bded5b313c27', 48, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0051e388ab88244d6dfd293785ca0a94a218', '884f92440f11ea3f826310c4bcf9442908ec', 211, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('005c1e3588a9dfa4f1bc53f86cdac1781275', '484675c0690c147bc1ab990858241f65d704', 74, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('005ee8cc5ea44575d48d6d0ac702196bd2ab', '24bb6981131931d73aabea3f4eda805574ff', 153, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('00811f5b4d236aacbc47b16b982f0eeea84f', '638f9ef95d6caead52d42928bded5b313c27', 123, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('00952f3b62daf758fe0336b0b11a4b2e095b', '884f92440f11ea3f826310c4bcf9442908ec', 20, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('009eac8f00ae3fa9c8e817c25244730e43c4', '24bb6981131931d73aabea3f4eda805574ff', 147, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('00ab9a7f95214e4915bc307c710d8fe619ab', '24bb6981131931d73aabea3f4eda805574ff', 303, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('00dde3a29abec809ad4fa28f05e59cc938ca', '24bb6981131931d73aabea3f4eda805574ff', 329, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('00fca48dafac247ee85946a10294907338ca', 'feebca0c3e1e178553fecb7f905a4accbdf8', 254, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('012d498192b8d87b32e13dbe37a071a30b18', '484675c0690c147bc1ab990858241f65d704', 106, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('015ce91e35defcd06f360eaa6985e7531412', '484675c0690c147bc1ab990858241f65d704', 303, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0173541ff0807c11af93ddad11051b31a17b', '884f92440f11ea3f826310c4bcf9442908ec', 123, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('018206e082720a346e2dfac8b2bea1643e12', '638f9ef95d6caead52d42928bded5b313c27', 19, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('018231db1a4c23f068c1b8923ea42d70efdc', '638f9ef95d6caead52d42928bded5b313c27', 30, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('019e5d6aa9c0ffaabc2c2dcdb6a1b2d080bd', 'feebca0c3e1e178553fecb7f905a4accbdf8', 10, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('01b6cd82415c867969c8d1d057ee31e4d3e3', '358ea4bf860ce17393ae5614aaa4afb2badd', 216, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('01b7c93c3acc737163a6c779cb8eff463a11', '24bb6981131931d73aabea3f4eda805574ff', 231, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('01c1b4473853956b0d8dbcc9956c229e6bbe', '358ea4bf860ce17393ae5614aaa4afb2badd', 205, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('01fd16246809b6e5886b62396913e80ec27a', '24bb6981131931d73aabea3f4eda805574ff', 38, '4.52.19.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0213ce644ec1312bbe447233a5904e9ba3de', '484675c0690c147bc1ab990858241f65d704', 145, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('022f9a44f56ec8374bd34acc96a19d09ab7d', '358ea4bf860ce17393ae5614aaa4afb2badd', 203, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('025c14df5aab6886d945b5b25c02370e41a0', '358ea4bf860ce17393ae5614aaa4afb2badd', 191, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0263b65110130f0922e7837f7fd9e8f77de4', '358ea4bf860ce17393ae5614aaa4afb2badd', 158, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0294b2c7b0d27e68769eb8bd20c619faddaa', '884f92440f11ea3f826310c4bcf9442908ec', 66, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('02b415b0216ee2ddac6217f3fe812d1b7951', '884f92440f11ea3f826310c4bcf9442908ec', 102, '4.52.20.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('02d4eeaeb1e73aef4717847a5f117df8704e', '884f92440f11ea3f826310c4bcf9442908ec', 160, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('02f19f6ebcceab75585e8d6bb146223127e7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 43, '4.52.19.1.07', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.07\",\"nama\":\"DELLA AMAYLIA ASHARI\",\"judul_jurnal\":\"HUMAN CAPITAL STUDY: CAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR FOR BOOSTING JOB SATISFACTION\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"BISECER (Business Economic Entrepreneurship)\",\"penulis\":\"Della Amaylia Ashari, Iwan Hermawan\",\"url_publikasi\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/about\\/submissions#authorGuidelines\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('0321188467fb28be9a80c4eea8cd45403a7c', '884f92440f11ea3f826310c4bcf9442908ec', 282, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0349ecd20894b6db17426207a0b2b74badde', '884f92440f11ea3f826310c4bcf9442908ec', 298, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('035f6c66f4fa18aecab778e992abba927625', '24bb6981131931d73aabea3f4eda805574ff', 10, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('036255d909a14e363bd2a8af96b998066694', '358ea4bf860ce17393ae5614aaa4afb2badd', 221, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0375b92cb6356c248c24ff25d640008a8a26', '484675c0690c147bc1ab990858241f65d704', 82, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('03a68dca23a07785437a8931471619690dda', '884f92440f11ea3f826310c4bcf9442908ec', 121, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('043d7f66fde7bc9eeec7567a72f174af94f2', '24bb6981131931d73aabea3f4eda805574ff', 236, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('046685faf303d682975da400d801715c01a2', '638f9ef95d6caead52d42928bded5b313c27', 249, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('04960592063782e960d3cda5e870d35e82e9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 116, '4.52.20.1.18', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.1.18\",\"nama\":\"NELY FALAHATI SIYAMI\",\"judul_jurnal\":\"THE INFLUENCE OF SOCIAL MEDIA USE TO WORK, TOTAL QUALITY MANAGEMENT, AND ORGANIZATIONAL CULTURE ON ORGANIZATIONAL PERFORMANCE IN DIGITAL-BASED FOOD PROCESSING MSMES\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Dody Setyadi, Rara Ririn Budi Utaminingtyas\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"JURNAL STUDI MANAJEMEN BISNIS \\u0423\\u0447\\u0440\\u0435\\u0434\\u0438\\u0442\\u0435\\u043b\\u0438: Universitas Muria Kudus\",\"penulis\":\"Nely Falahati Siyami, Dody Setyadi, Rara Ririn Budi Utaminingtyas\",\"url_publikasi\":\"https:\\/\\/elibrary.ru\\/item.asp?id=81864363\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('049cfea84c82d56ce3ca86bfcbd7dfbc783e', '638f9ef95d6caead52d42928bded5b313c27', 118, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('04abe8ddc32b848022abdc22e9096fb9a8a5', '638f9ef95d6caead52d42928bded5b313c27', 185, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('04c7b27fb330cc566e24460bd81f0d073aaf', '638f9ef95d6caead52d42928bded5b313c27', 157, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('04f4d1a08919bd5c840c36ac9ddfbc414fc6', '638f9ef95d6caead52d42928bded5b313c27', 291, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('04f9d134e43427cff52fb7ee745338fe69ac', 'feebca0c3e1e178553fecb7f905a4accbdf8', 284, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('0500f31ad44c50980747a79082623590bccc', '358ea4bf860ce17393ae5614aaa4afb2badd', 73, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('057d371d99b3def1f039f337a32f965494f2', '484675c0690c147bc1ab990858241f65d704', 161, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0583c4cace94683bb292a3cccdbf70590bc3', '24bb6981131931d73aabea3f4eda805574ff', 127, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('05c3c3af1428d82913918cf217af04a3b75f', '24bb6981131931d73aabea3f4eda805574ff', 26, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('05f34e362b6d5a7964ebc5d6efd3703cc165', '638f9ef95d6caead52d42928bded5b313c27', 74, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('06255983a230130dd76f5a927413630c3cbd', '884f92440f11ea3f826310c4bcf9442908ec', 61, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('064514f820db824dee3eed995b6305e0d4ff', '638f9ef95d6caead52d42928bded5b313c27', 297, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('06534aac74a027bb42ade533a7e188bc092d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 82, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('0655943d29d47788d3b9e22f0e70cbab2b77', '484675c0690c147bc1ab990858241f65d704', 113, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('066649314f826586a24c156503356d58761b', '24bb6981131931d73aabea3f4eda805574ff', 55, '4.52.19.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0689d2601cb9c9c10ddadbf6e9bb2c723dbf', '484675c0690c147bc1ab990858241f65d704', 245, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('06c00f396712b391f17ebcfba7e7087b64cc', '884f92440f11ea3f826310c4bcf9442908ec', 203, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('06e53cdcaf11c709091f997347dfc336009a', '638f9ef95d6caead52d42928bded5b313c27', 17, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('06e9b936cbc8c40d097f91b16c98522504be', '484675c0690c147bc1ab990858241f65d704', 93, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('073fd37c0bc38cbcda26c086b68ce2b49bdc', '484675c0690c147bc1ab990858241f65d704', 234, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('075ba81c79b266aee883a306e13bcd7b1edc', '24bb6981131931d73aabea3f4eda805574ff', 188, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('07aab0b560afc11378aff29d8bf6f4d8de3f', '24bb6981131931d73aabea3f4eda805574ff', 229, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('07b702da8569e24657e6b14a50aa4a807be3', '358ea4bf860ce17393ae5614aaa4afb2badd', 30, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('07c8bf23b5a1fec1662e6962daabb701970e', '358ea4bf860ce17393ae5614aaa4afb2badd', 179, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('083a03355006376e96b8033adc12fb8e7ae8', '638f9ef95d6caead52d42928bded5b313c27', 23, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('08552ca866ad250f5a007b42e26d7c6acf86', '884f92440f11ea3f826310c4bcf9442908ec', 227, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('08983789f8c99bc28f863cbfc681f43707e9', '884f92440f11ea3f826310c4bcf9442908ec', 159, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('089ae3af910ee9a170648f356e416f51eb14', '358ea4bf860ce17393ae5614aaa4afb2badd', 94, '4.52.20.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('08a14e21f17a34d09531cc3437ae96894044', '24bb6981131931d73aabea3f4eda805574ff', 109, '4.52.20.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('08d190eb48c9bd8b6678bb780a3a55bdd5d4', '24bb6981131931d73aabea3f4eda805574ff', 327, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('09077a3c1135bd972830eac4944c96376383', '24bb6981131931d73aabea3f4eda805574ff', 268, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('092a02236fab00b71cf4f64ecfa15f8ebe86', '484675c0690c147bc1ab990858241f65d704', 26, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('093e6afa1da81e4564e002b45aabc9e5a06b', '638f9ef95d6caead52d42928bded5b313c27', 239, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('094f08d619c15c96c18d8639d3b1786fde31', '884f92440f11ea3f826310c4bcf9442908ec', 183, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('095a55a3d71f45c3d82a2b70b3e3af15b29d', '884f92440f11ea3f826310c4bcf9442908ec', 268, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0998454ce4867a383d039da950cc08dd7ada', '638f9ef95d6caead52d42928bded5b313c27', 195, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('09b1905a1d5e5231471e56f66ca54c8b13f2', '24bb6981131931d73aabea3f4eda805574ff', 87, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('09d1e34d23dfb60cde5d68ee26a80a2fdd22', '358ea4bf860ce17393ae5614aaa4afb2badd', 211, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('09fa032c1064fd48b38fb481d1bb48c6949b', '638f9ef95d6caead52d42928bded5b313c27', 187, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0a504cfe2c15af08d7fb5d677a15a7f9d468', '638f9ef95d6caead52d42928bded5b313c27', 32, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0a7509baa1504f40890b9264a672c3b35877', '484675c0690c147bc1ab990858241f65d704', 44, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0a86281d3b65ddcf351064d99ddcbb00b1b7', '484675c0690c147bc1ab990858241f65d704', 62, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0a92b1c2955a58a36c603a6fcb386e051e97', '484675c0690c147bc1ab990858241f65d704', 48, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0a9ed8a248aed714badfa3af2cace8731b85', '638f9ef95d6caead52d42928bded5b313c27', 38, '4.52.19.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0aa52d48a6d2051aa942f15c232e2199ed22', '884f92440f11ea3f826310c4bcf9442908ec', 240, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0aab376189c330d6e38f5d52e298062920ae', 'feebca0c3e1e178553fecb7f905a4accbdf8', 275, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('0b4dce90b52bb8e441a0d44ae94411be6021', 'feebca0c3e1e178553fecb7f905a4accbdf8', 171, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('0b7017e17cf3e9b50626a0b195a493702fe0', '884f92440f11ea3f826310c4bcf9442908ec', 137, '4.52.21.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0b900276fe54f51f8a21413c540d1f5e4b1d', '24bb6981131931d73aabea3f4eda805574ff', 154, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0b95e18b4c14f8f861ecba519ee4aeab6bb5', '484675c0690c147bc1ab990858241f65d704', 304, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0bae6f2c514e1f7c5cfc09278c41cd7ed048', '638f9ef95d6caead52d42928bded5b313c27', 188, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0bd2ff4c7b4cd08733aa2b32cc59000eb86a', '24bb6981131931d73aabea3f4eda805574ff', 210, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0c63b7329532cee74aa67745c343f4d56ca0', '24bb6981131931d73aabea3f4eda805574ff', 239, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0c71b65adc7d4cd27c5165bbb0c16a851cd8', '638f9ef95d6caead52d42928bded5b313c27', 254, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0c997bf2634283d00794c83796023454311f', '638f9ef95d6caead52d42928bded5b313c27', 95, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0cd972756f179b95f19b2272da67d5e4eefd', 'feebca0c3e1e178553fecb7f905a4accbdf8', 167, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('0d01fc0ba3071db5a63ec7a0931ed7a3441a', '358ea4bf860ce17393ae5614aaa4afb2badd', 180, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0d43c2994fd2f64b82b9da14742c1101f526', '358ea4bf860ce17393ae5614aaa4afb2badd', 293, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0d83d2b9635b967f528129ac70363931c3f6', '638f9ef95d6caead52d42928bded5b313c27', 194, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0dee573e443d6accd3175a60dc5b3b071b70', '24bb6981131931d73aabea3f4eda805574ff', 247, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('0df3c4ebfaff0255c3b553679ada9a339b38', '884f92440f11ea3f826310c4bcf9442908ec', 97, '4.52.20.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0e0ba189aa02335b4128c73ce831fa6af600', '884f92440f11ea3f826310c4bcf9442908ec', 112, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0e443c4d66de2c5f5f86cda7ae2b19933475', '884f92440f11ea3f826310c4bcf9442908ec', 92, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0e4baf99660eae60f94bc3f3bfb2f16c9f23', '358ea4bf860ce17393ae5614aaa4afb2badd', 311, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0e5e6dfdcb5d90c52b5d169f38521f7adf6e', '358ea4bf860ce17393ae5614aaa4afb2badd', 91, '4.52.20.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0e63c1410332a333cc50f2dcf48601771144', '358ea4bf860ce17393ae5614aaa4afb2badd', 12, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0e6f14ed5abd746f2ba4126373058bb7efac', '484675c0690c147bc1ab990858241f65d704', 251, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0e7bffdcf81a23763d4b0b0f7c82493d8ab4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 215, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('0e8f3268eab657f8004fbe7e08b41de2b101', '484675c0690c147bc1ab990858241f65d704', 268, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0e9384b319476a0d3e4d4602d47516e6b065', '638f9ef95d6caead52d42928bded5b313c27', 305, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('0eb3fde7a6213543c95c8c711a76277d7ace', '484675c0690c147bc1ab990858241f65d704', 156, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0f0c99b11ab6058e57085f6617000e3dab66', '358ea4bf860ce17393ae5614aaa4afb2badd', 217, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('0f62d41d96a73c41121d614038179a73dba0', '484675c0690c147bc1ab990858241f65d704', 56, '4.52.19.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0f84645c4e7f983c72b7faba346e40afa43e', '884f92440f11ea3f826310c4bcf9442908ec', 228, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0f9e70fe6e33c63d7d7efa70fabde9d7aa74', '484675c0690c147bc1ab990858241f65d704', 248, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('0fab6385c3d4f887766d15760dfc89b223a9', '884f92440f11ea3f826310c4bcf9442908ec', 236, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('0fdc98b5f22e6b8d877afb59d5705e958df9', '24bb6981131931d73aabea3f4eda805574ff', 54, '4.52.19.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1001f8e01733efc90a353f4ca8b7b3b0da3d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 277, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('10414abf1675693d3facc2c11af72ef99f0b', '638f9ef95d6caead52d42928bded5b313c27', 58, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('10560f2243bf01f62e4bc42195a793aa958b', '638f9ef95d6caead52d42928bded5b313c27', 97, '4.52.20.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1066a1eba6f6eeb0e527131a49036b329329', '484675c0690c147bc1ab990858241f65d704', 42, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('107b73a4653e73ae5004e0ca0727e3fe6700', '24bb6981131931d73aabea3f4eda805574ff', 31, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('10819bc05ba10f746bac54ef88540bb7b20b', '884f92440f11ea3f826310c4bcf9442908ec', 53, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('109ee62738c760720b6679db4e0a62d6327d', '884f92440f11ea3f826310c4bcf9442908ec', 154, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('10da1e44e5dfc0a3872b02873fcfd1f67947', 'feebca0c3e1e178553fecb7f905a4accbdf8', 53, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('10efc2df1b7c2ec76e1554ccedea971c34c3', '358ea4bf860ce17393ae5614aaa4afb2badd', 67, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('11043a6303add7f0f3a3a3d7b4f7db4be34e', '358ea4bf860ce17393ae5614aaa4afb2badd', 120, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1155a3851919bd683ba1a089564d8803c4d0', '884f92440f11ea3f826310c4bcf9442908ec', 157, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('115f3874adf039434e485856d9f8ea9601b0', '884f92440f11ea3f826310c4bcf9442908ec', 257, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('116bfc4aafe2efdb2ff3fe5d8c79e3c52312', '24bb6981131931d73aabea3f4eda805574ff', 75, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('116e2761c298c4aa76aa69ae8665a1224c67', '484675c0690c147bc1ab990858241f65d704', 101, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('117e76958f5c25481514161449c5ac8ac2ff', '24bb6981131931d73aabea3f4eda805574ff', 83, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1183b5365acd44d1dfac26c93aeaeb86fe21', '638f9ef95d6caead52d42928bded5b313c27', 80, '4.52.20.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('11ef5c5acccdb43b92b308687930440482dd', '638f9ef95d6caead52d42928bded5b313c27', 86, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1206ee03db33aba63836b631c360b74dd1f0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 253, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('121005a8d359114fa81ea1651be3dfd1f070', '24bb6981131931d73aabea3f4eda805574ff', 314, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1246a4ed929891c90a95a6dcdb0bdfe6ccaa', 'feebca0c3e1e178553fecb7f905a4accbdf8', 32, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('1281cd7d42c6b81a80181162aa27abaf57dc', '24bb6981131931d73aabea3f4eda805574ff', 195, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1287bf04def0ed11ea9b43956bb4219af3ce', '638f9ef95d6caead52d42928bded5b313c27', 33, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('128e203691988600a11e80998b9e690ab756', '484675c0690c147bc1ab990858241f65d704', 83, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('129742da4da857cd715a515fc8e07b1ade64', '638f9ef95d6caead52d42928bded5b313c27', 247, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('12c361a010a892911457cc3f6dd82d341bee', '484675c0690c147bc1ab990858241f65d704', 104, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('12cb49666a2ce6d0b12c4572a174c4658676', '638f9ef95d6caead52d42928bded5b313c27', 76, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('12cfdbf984e8d4788646c1e278249ac71ad7', '638f9ef95d6caead52d42928bded5b313c27', 131, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('12d6739b0fb5d3dec31c5be25e296d309243', '358ea4bf860ce17393ae5614aaa4afb2badd', 56, '4.52.19.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('12f80df215d46480f4e3c56676b49330a67a', '484675c0690c147bc1ab990858241f65d704', 59, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('133faf8311ff377da266e68f8c1313557d5b', '484675c0690c147bc1ab990858241f65d704', 254, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1360f9e59db3c33fda50385fc6474c3b0685', '884f92440f11ea3f826310c4bcf9442908ec', 307, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('136b133476e9ceaab31082e87fac7e911dee', '638f9ef95d6caead52d42928bded5b313c27', 328, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('138f0a81682d7ff327d81f6653d95696cce8', '884f92440f11ea3f826310c4bcf9442908ec', 302, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('13db7f42e2310d5b9bb32a12617bffd7c8fa', '484675c0690c147bc1ab990858241f65d704', 293, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('13ef484d00f97091da5bb61e7b7eb473b730', '884f92440f11ea3f826310c4bcf9442908ec', 317, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('13f45f8d27e0262a59de65f523d06b0148c0', '358ea4bf860ce17393ae5614aaa4afb2badd', 63, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('143b66e43d670bb2dede0b8584ddbc2e8576', '638f9ef95d6caead52d42928bded5b313c27', 312, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('144745e9303b29376e0a27df76bb9beef89a', '638f9ef95d6caead52d42928bded5b313c27', 120, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('146b5d1b9ffa8ba355a65a0b253a555241bc', '884f92440f11ea3f826310c4bcf9442908ec', 161, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('146cfaff8ea63fbce38d9365e3dd570ec373', 'feebca0c3e1e178553fecb7f905a4accbdf8', 14, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('148f51a7e99e62969cd542325f3c0771952f', '24bb6981131931d73aabea3f4eda805574ff', 111, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('14a98c9d1cf73834a34074acb58d34a0c996', '884f92440f11ea3f826310c4bcf9442908ec', 199, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('14b665fb6167ecd392b5ae1ac9e7470d0919', '484675c0690c147bc1ab990858241f65d704', 253, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('14be5af2ca6fd2e122e9dd98b14c23ab74b8', '24bb6981131931d73aabea3f4eda805574ff', 175, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('14ebca14d03f0c647eb5147da8d3730ce1c2', '884f92440f11ea3f826310c4bcf9442908ec', 93, '4.52.20.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1511ccc11cd1b85ed3d16f511ac7b2c86870', '358ea4bf860ce17393ae5614aaa4afb2badd', 123, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('151664c5f963278699eec8bfadd6f53993a9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 22, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('152beaa8d1c9d727d6e1b3113c147ba35b82', '484675c0690c147bc1ab990858241f65d704', 306, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('152c732a120ac8372acdbe938d4df6e63713', '24bb6981131931d73aabea3f4eda805574ff', 291, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('15394a94d16cc2b5270e28774376b89b5362', 'feebca0c3e1e178553fecb7f905a4accbdf8', 112, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1539d57c5a2a5d09ae0073bac3d35cfa4b47', '24bb6981131931d73aabea3f4eda805574ff', 233, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('153c7353d20e9f87d6bf7da157723f7626d6', '884f92440f11ea3f826310c4bcf9442908ec', 136, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1540208e37b658b646f265757d4aca10ded8', '358ea4bf860ce17393ae5614aaa4afb2badd', 328, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1566662c2dadd6695edb64e4b141922b08d9', '638f9ef95d6caead52d42928bded5b313c27', 283, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1569cfeab35da7c5f2f8c68defd4d5cfc262', '358ea4bf860ce17393ae5614aaa4afb2badd', 329, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('157aace890c4617232fa342003b60bc83fb9', '638f9ef95d6caead52d42928bded5b313c27', 274, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('157c8183b9b728c7f9f004fb28a0e06fe3d2', '638f9ef95d6caead52d42928bded5b313c27', 178, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('158a4e2421ef0b5d7d37fe8b3171d88c6f59', 'feebca0c3e1e178553fecb7f905a4accbdf8', 210, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('158bc6559ecd17ae6cd582708e263866dfd6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 189, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('15b66202616dd7a389cf22b2f9a26a646d90', '358ea4bf860ce17393ae5614aaa4afb2badd', 16, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('161cc21e93ec6737f18ad3d009b3877e72c1', '638f9ef95d6caead52d42928bded5b313c27', 79, '4.52.20.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('16236b14b79da0331520cb8321f1acf8443f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 79, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('16255723bdf427361be1bccce0871a5bdb67', '484675c0690c147bc1ab990858241f65d704', 250, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1655fd530013e6d5ed721d409aeb6e6bc880', '484675c0690c147bc1ab990858241f65d704', 85, '4.52.20.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('166d3de4d207679f52498aba747929d9f4a9', '24bb6981131931d73aabea3f4eda805574ff', 99, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1683b68733771fd1ef7d6b4ea1a7e36235c2', '484675c0690c147bc1ab990858241f65d704', 88, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('16aaf0c9d97b26c3689c4fd3950066ba1a0d', '24bb6981131931d73aabea3f4eda805574ff', 318, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('16e96e5c49d2085ba58ef1b83e892f5ffebd', '638f9ef95d6caead52d42928bded5b313c27', 255, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('16f817db978929f728ea5be5c2a1655da614', '24bb6981131931d73aabea3f4eda805574ff', 309, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('171f9fac3689bd02527c36686191fbfa0af1', '884f92440f11ea3f826310c4bcf9442908ec', 283, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1745028455039b45e44e30f6b0fac7e38b5f', '638f9ef95d6caead52d42928bded5b313c27', 329, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('17564ceed8f4c71338df600136d7975b0402', '358ea4bf860ce17393ae5614aaa4afb2badd', 79, '4.52.20.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('176f38f706426a254592501e5739ddb0af97', '638f9ef95d6caead52d42928bded5b313c27', 276, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('17d5b6d19ed1f4d364e47635c8fac1e1e88f', '638f9ef95d6caead52d42928bded5b313c27', 102, '4.52.20.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('17dc7ff90f29a7ad80314ab15d4259253f88', '638f9ef95d6caead52d42928bded5b313c27', 89, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('17ec817cf40e1fb1cc0f1e6bdd01c44d5017', '884f92440f11ea3f826310c4bcf9442908ec', 96, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('17fbe53e5fc58f4fe3e3150dff2109bfc781', 'feebca0c3e1e178553fecb7f905a4accbdf8', 123, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1825457e8a03fe50391aa92c1cf44524d88f', '358ea4bf860ce17393ae5614aaa4afb2badd', 107, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('183203179d190b213fc04bb39f49fa7c9c73', '638f9ef95d6caead52d42928bded5b313c27', 57, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1852fcebf0307945ab4b370fc9965c82b975', '24bb6981131931d73aabea3f4eda805574ff', 274, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('186a2a79fdf2f44a6eb7450ca521b8e61542', 'feebca0c3e1e178553fecb7f905a4accbdf8', 137, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('18b13c8479d154ea5b92280479c57bf0d68f', '484675c0690c147bc1ab990858241f65d704', 240, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('18d03c532cdde8be2f19cf571d9e3d818172', '484675c0690c147bc1ab990858241f65d704', 35, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('19292f4c586c0f36b0ed57cbe5caf43fbb95', '24bb6981131931d73aabea3f4eda805574ff', 284, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('196b4a6cca787bde980720d2aee40192bc8a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 323, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1978c4418d7f5e2d4550688c157d4d6af925', 'feebca0c3e1e178553fecb7f905a4accbdf8', 133, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('19bc8f4f60e713329c31103a14ae1c1bb4d4', '358ea4bf860ce17393ae5614aaa4afb2badd', 161, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('19c4a11ed8d8e4a2bfa09bc20636eac59057', '358ea4bf860ce17393ae5614aaa4afb2badd', 33, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('19c65448efea48a8251f00a648f0d034f01c', '484675c0690c147bc1ab990858241f65d704', 75, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('19db17a24b4f81c96d73267a687c364bdb82', '24bb6981131931d73aabea3f4eda805574ff', 13, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1a0c111daac08338eb54617b08fc1a28c304', '884f92440f11ea3f826310c4bcf9442908ec', 140, '4.52.21.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1a2169b5f2861aa993bdb14b7347e2e43b31', 'feebca0c3e1e178553fecb7f905a4accbdf8', 89, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('1a288c9b169c644da44acd0156bf9f01ef3d', '638f9ef95d6caead52d42928bded5b313c27', 153, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1a5ddea236ce74d2778ac5551a77f96d5150', '638f9ef95d6caead52d42928bded5b313c27', 11, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1a6a40fdfad5a6bc4c3c11e5e5ca29250eb2', '884f92440f11ea3f826310c4bcf9442908ec', 132, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1a89f5e6a669354d6eced560557d2240df15', '484675c0690c147bc1ab990858241f65d704', 328, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1a8b9ed600eee43e1cc0b13fd6f2573e3080', '638f9ef95d6caead52d42928bded5b313c27', 144, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1aef2f6d38236906f4426c9b4d104dae223e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 324, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1af5677de9c56f56968a9f4ae98064927bb8', '484675c0690c147bc1ab990858241f65d704', 22, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1b170f1083212452bb9a432265d99e86cdc4', '358ea4bf860ce17393ae5614aaa4afb2badd', 54, '4.52.19.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1b333f9b93761ff20907acae6959a61ea2a8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 252, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1b4d56159f5dcaa4243a690aa52c61354f1c', '358ea4bf860ce17393ae5614aaa4afb2badd', 75, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1b5d2160997ab9329235af2e8dd47fb76ccf', 'feebca0c3e1e178553fecb7f905a4accbdf8', 303, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1b6cbece7ff95b227cb5cd0460c626c32e1b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 220, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1bda579ea76a3db18fc293607f2c5004fe03', '484675c0690c147bc1ab990858241f65d704', 238, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1be02684be6a957ddd336646d02763144254', 'feebca0c3e1e178553fecb7f905a4accbdf8', 280, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1c1f6e843ffdffef0f2295c9418bcc4bd906', '638f9ef95d6caead52d42928bded5b313c27', 82, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1c22bfeced9773b1c121abd1a5662759ec68', 'feebca0c3e1e178553fecb7f905a4accbdf8', 217, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1c23f4de6eaaa7ce02a3141be04e80b554b3', '358ea4bf860ce17393ae5614aaa4afb2badd', 275, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1c56578b837800737eb1033f1a20434a5aef', '484675c0690c147bc1ab990858241f65d704', 229, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1c6ac7121aed6e1748df8e37d0b948b01d32', '358ea4bf860ce17393ae5614aaa4afb2badd', 78, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1cb7223b51a3757af66d4ec1884b08a7dd5f', '484675c0690c147bc1ab990858241f65d704', 295, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1ccd5a6838250e2a5ac3d13e0beccfde5bc4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 333, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1d4314e9d2611dd3e3c44e6b25a4a3041d67', '24bb6981131931d73aabea3f4eda805574ff', 63, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('1d4f8100b996c5e4cd14d59f7173441411c7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 332, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1d51909e8e47ec6be6cfa3d3fb540362c5f6', '638f9ef95d6caead52d42928bded5b313c27', 331, '45219006', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1d54a7442e2d437d1fad18a8b18db9c3e25c', '638f9ef95d6caead52d42928bded5b313c27', 96, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1d747632b798bd170217cf80f2ca3b9a9735', 'feebca0c3e1e178553fecb7f905a4accbdf8', 287, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1d763c068bd8eb5d85d9a145f8f91585b5b6', '884f92440f11ea3f826310c4bcf9442908ec', 225, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1d911d0e77a14bf5c8b57ed7a780dd18b434', '638f9ef95d6caead52d42928bded5b313c27', 81, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1d9b3de8f0ae02fa7a755e51d3fc583ca3a0', '638f9ef95d6caead52d42928bded5b313c27', 281, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1de2cbfababaadf51125428fe3435e96af95', '484675c0690c147bc1ab990858241f65d704', 119, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1e3bc0e9604d0f1778ffcbcce9d84601beda', '484675c0690c147bc1ab990858241f65d704', 137, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1e60a609694b18c4ce2942f03c917b872e23', '484675c0690c147bc1ab990858241f65d704', 258, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1eead0b9be5abf9d962694e80723a89117a4', '638f9ef95d6caead52d42928bded5b313c27', 209, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('1f2078dfd4f5298d6b621a56224d68e27021', '484675c0690c147bc1ab990858241f65d704', 191, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1f2698a36dac19072a6ab26e51bf428e3342', '884f92440f11ea3f826310c4bcf9442908ec', 251, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1f36399ea67f0196e9f2190d9353df98d482', '358ea4bf860ce17393ae5614aaa4afb2badd', 219, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('1f620cdeabbfa63201613a4eabf6e00087de', 'feebca0c3e1e178553fecb7f905a4accbdf8', 310, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('1f68bff6ac259f4a91a3d3bd862390ee3b1f', '884f92440f11ea3f826310c4bcf9442908ec', 124, '4.52.21.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1f89d7f47797b72277017df03b30116501bc', '484675c0690c147bc1ab990858241f65d704', 158, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1fc489e94c2bf1cff2b54d03be94c1506c64', '484675c0690c147bc1ab990858241f65d704', 288, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('1fd8e7245361d7c593d2d15224e484982569', '884f92440f11ea3f826310c4bcf9442908ec', 286, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('1ffcc1acdd49dc3dd4f4655eda880d8dd66a', '638f9ef95d6caead52d42928bded5b313c27', 208, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2010557a23791205124c061a653009710ead', 'feebca0c3e1e178553fecb7f905a4accbdf8', 172, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('2042ac8a0131e712f51b2eb953bd672e14bc', '884f92440f11ea3f826310c4bcf9442908ec', 206, '4.52.23.8.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('20444346282b1470e5ff8d642f6f601d2e4d', '24bb6981131931d73aabea3f4eda805574ff', 161, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('20561aa32953760d02847a902d8f912580a5', '24bb6981131931d73aabea3f4eda805574ff', 205, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2077c1b56744db793c7cbf9e3277c00aad27', '884f92440f11ea3f826310c4bcf9442908ec', 175, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2080fa46aea4cbf49a8c606f68ebb2f53ca8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 108, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('209de68ed43a4eded01b1f907737489df065', '638f9ef95d6caead52d42928bded5b313c27', 105, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('20a3f302039a945328a10eac92cb6d48836b', '884f92440f11ea3f826310c4bcf9442908ec', 195, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('20a4f1981fcc3d739b8bf5603acd94c15c38', '24bb6981131931d73aabea3f4eda805574ff', 124, '4.52.21.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('20b40865d9e370fbe7c7f5cf2fb355f9470f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 181, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('20e099ff53852b030df4e9f6e29157671d3c', '24bb6981131931d73aabea3f4eda805574ff', 82, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('20e72a5302ce4e9cace7cd4ef54aa796f7c8', '24bb6981131931d73aabea3f4eda805574ff', 227, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('20f3d6e5debffa3febb5d9aaa311b0051554', '358ea4bf860ce17393ae5614aaa4afb2badd', 95, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2126d42cb14eec83285df4ffca423861c8e8', '638f9ef95d6caead52d42928bded5b313c27', 263, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('21283eec90e2903cc4e69e5c2ff738a9bd57', '24bb6981131931d73aabea3f4eda805574ff', 207, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('213b0bc5eba31e09cd21abd1c88bac9e00d8', '358ea4bf860ce17393ae5614aaa4afb2badd', 184, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2144531ea01f35b9e9e445032b04dd774ef6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 304, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('21cc0027098ff405b2e084fcd8679ddc91e4', '484675c0690c147bc1ab990858241f65d704', 289, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('21f1938b3c7add881b886bfb50f7dd031f7b', '884f92440f11ea3f826310c4bcf9442908ec', 330, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2247dee2ffd53b17de5d0c25a89ec2aec06d', '24bb6981131931d73aabea3f4eda805574ff', 98, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('226ebc75122d15ce8da57a4cccc734f0690e', '484675c0690c147bc1ab990858241f65d704', 222, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('227ac9029505d455f8d66875797f3d5110a1', '358ea4bf860ce17393ae5614aaa4afb2badd', 137, '4.52.21.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('227b8ec686b937bd47cd69a23b42a96cb771', '484675c0690c147bc1ab990858241f65d704', 200, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('22d829752430abde6f733dc5b5a34e9af7ae', '638f9ef95d6caead52d42928bded5b313c27', 161, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('22f97be5dac1af6850dd44a47e4120ee4849', '638f9ef95d6caead52d42928bded5b313c27', 99, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2303707d91addff9b2ad7ab4b0e7c25226ff', 'feebca0c3e1e178553fecb7f905a4accbdf8', 23, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('231e7d9f81dd65fef42999cf596fc325cb62', '358ea4bf860ce17393ae5614aaa4afb2badd', 294, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('234421c707ccae3ddcaae176dcb038b86675', 'feebca0c3e1e178553fecb7f905a4accbdf8', 150, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('234ab0bcd365c6b8c7c16fa4ac542dce3d2c', '638f9ef95d6caead52d42928bded5b313c27', 272, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('23be35ec7a9f47d1aa42e37c925f4dfe1aa0', '24bb6981131931d73aabea3f4eda805574ff', 185, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('240cc4b0817f1ff1cfcd2e710785ccbb7bf5', '358ea4bf860ce17393ae5614aaa4afb2badd', 299, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2422bb3af46c462516533dacfe786b032999', '358ea4bf860ce17393ae5614aaa4afb2badd', 260, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('242677ae090c9706785e3d439658ea9212a2', '638f9ef95d6caead52d42928bded5b313c27', 313, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2427cde3de0e98b3f1e15fb4e1e422dcf6c7', '24bb6981131931d73aabea3f4eda805574ff', 252, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2428020583b90c67030de964891bcf524609', '484675c0690c147bc1ab990858241f65d704', 127, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('24392b540f9a902df126f2226dab20c78187', 'feebca0c3e1e178553fecb7f905a4accbdf8', 224, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('244c980b552d19f4f7b676c42090271ea1e4', '638f9ef95d6caead52d42928bded5b313c27', 298, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2454219f25887d130516172d6c3f0a4e4419', '358ea4bf860ce17393ae5614aaa4afb2badd', 263, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('245bac87651d1af771096996d286d17d9da6', '484675c0690c147bc1ab990858241f65d704', 257, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('246220046edd9f9bd638fac9d30608ded59c', '484675c0690c147bc1ab990858241f65d704', 142, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2474e48e1233512ca6360ba3e1ba373ab5fc', '358ea4bf860ce17393ae5614aaa4afb2badd', 10, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('248912b1fa072e085b69ab1a78fd13fecfa0', '358ea4bf860ce17393ae5614aaa4afb2badd', 227, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('249869369e93aff33756c4b843b3256cd8d2', '358ea4bf860ce17393ae5614aaa4afb2badd', 222, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('24ed6e157d681e32a2c8e76d894060e15503', '638f9ef95d6caead52d42928bded5b313c27', 174, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('251296ed587b90321f09671e7a397e637069', '358ea4bf860ce17393ae5614aaa4afb2badd', 81, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('251f474de1b519bfbf53838627c9e94485dc', '638f9ef95d6caead52d42928bded5b313c27', 229, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('253aa8184e3ebfc14bb89414aacaa71b38b4', '358ea4bf860ce17393ae5614aaa4afb2badd', 84, '4.52.20.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('255579a877975af1fdf8f8d081d8a1f2c709', '24bb6981131931d73aabea3f4eda805574ff', 226, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('25634c5f9ec085f682077f527683c0b43c3a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 93, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('256d24f21ed6ea93925895bef0b3a2feadbb', '638f9ef95d6caead52d42928bded5b313c27', 243, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2595228aa3767d4bd6eb5ee6f53c54a85b66', '884f92440f11ea3f826310c4bcf9442908ec', 277, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('25a8be613177b4670f78b11ae73e3ffa0761', '884f92440f11ea3f826310c4bcf9442908ec', 23, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('25a93ece262e3c96ba5a8ec2911d22cdbf94', 'feebca0c3e1e178553fecb7f905a4accbdf8', 312, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('25b05fd1863fcf5bdae1316e1c414da8c2bd', '484675c0690c147bc1ab990858241f65d704', 67, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('25bbed2db60b16d70a07ee249232446474ae', '24bb6981131931d73aabea3f4eda805574ff', 272, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('25f34f98cc7ee0d1190b50276beec590a17c', '484675c0690c147bc1ab990858241f65d704', 96, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('26028b88f1c6975f9638a88e27d76493df0c', '24bb6981131931d73aabea3f4eda805574ff', 139, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('260ffe5e718c9b03c29bd48a9b208697599c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 98, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('261d6efbdba9cb06ba72fec0acd8706cc680', '638f9ef95d6caead52d42928bded5b313c27', 246, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2633d9c02b45a8da585b0dd0ced53ee662f7', '484675c0690c147bc1ab990858241f65d704', 152, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2640faa32e82ae3c339e2591ccfe21e817a6', '884f92440f11ea3f826310c4bcf9442908ec', 41, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('265fbb5dd4ac8d5ecf311a3d28c062487015', 'feebca0c3e1e178553fecb7f905a4accbdf8', 327, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('26926d22a54afcd993699ea0d1b927e93237', '484675c0690c147bc1ab990858241f65d704', 270, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('26bae78f02353662e6f72d767d9c9016be36', '884f92440f11ea3f826310c4bcf9442908ec', 95, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('26bca2c3d1c830ebff378e106a9beafd7a72', 'feebca0c3e1e178553fecb7f905a4accbdf8', 33, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('26c374ef7187e608e625ab95631dcbbbb191', '24bb6981131931d73aabea3f4eda805574ff', 129, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('26d194ee14662dd97b74082e3b2231ef5a3b', '884f92440f11ea3f826310c4bcf9442908ec', 306, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('26e9893df4dd56839e0db9cf8742fccedb68', '638f9ef95d6caead52d42928bded5b313c27', 117, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('26ead6e240bba5cc7660fb19b8eef9bcda77', '484675c0690c147bc1ab990858241f65d704', 32, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('27094f816f260fedd2bca4fe744e23cf985c', '24bb6981131931d73aabea3f4eda805574ff', 208, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2718722272738de5460e889f7c06ea13dd0c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 243, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('2732b786d96d6e34f353ba37b241b2716093', '484675c0690c147bc1ab990858241f65d704', 271, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('273496d36fe95c3186f3198fa5edfa1885a9', '358ea4bf860ce17393ae5614aaa4afb2badd', 303, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('276ec74bbb8a157da8aa532ab87036e3dd45', '24bb6981131931d73aabea3f4eda805574ff', 174, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('27db0da1ffbd87f1872e51cc2f9b060e56db', '484675c0690c147bc1ab990858241f65d704', 175, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('28105a18634c9e6474376627e6e5e9cbc750', '884f92440f11ea3f826310c4bcf9442908ec', 13, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('282cbae2f95c53a3abb5320aa7682b0a8b7d', '638f9ef95d6caead52d42928bded5b313c27', 66, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2874842cc3388b70eba934007e4fcfc42ad9', '358ea4bf860ce17393ae5614aaa4afb2badd', 104, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2876313d33ad9d1b89fece1e02631989f577', '638f9ef95d6caead52d42928bded5b313c27', 290, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('287c8db30665fbfc1fdfc995ffe0cc19b894', '884f92440f11ea3f826310c4bcf9442908ec', 313, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('28b74231c391c463e61661d152d94b87bda2', '638f9ef95d6caead52d42928bded5b313c27', 284, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('28edf7b5555d4822961349c64fe79765308e', '484675c0690c147bc1ab990858241f65d704', 199, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('291f923e1d8204519c50ae8ce05bf673b53a', '358ea4bf860ce17393ae5614aaa4afb2badd', 307, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('29330bc21decd3fe1ec5accbc67199e122a6', '24bb6981131931d73aabea3f4eda805574ff', 288, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('29392d390a60a017a9089198e34186b3a90c', '24bb6981131931d73aabea3f4eda805574ff', 23, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2957e8b0b98ff7ad65760d20126948f6b075', '358ea4bf860ce17393ae5614aaa4afb2badd', 22, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('295fc54286d11801d144fe777d79f2a54dcc', '24bb6981131931d73aabea3f4eda805574ff', 43, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('296ec05cdc9f4f1f3711126574d6bacf0bbc', '24bb6981131931d73aabea3f4eda805574ff', 296, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('29832bbbb371b76a4417c70dd57285d5f679', '638f9ef95d6caead52d42928bded5b313c27', 323, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('298c5e490dac9602880cadd5201b87295024', '884f92440f11ea3f826310c4bcf9442908ec', 74, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('299e850c6606c30fdd57fe9f58a87d79486d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 272, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('29a8afcfca4dcd151ed70e63eb2174fe2111', '638f9ef95d6caead52d42928bded5b313c27', 103, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('29ae9468d03f60efa223a75fa332af70380f', '484675c0690c147bc1ab990858241f65d704', 326, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('29dface049a847745396d3cc74c90948c2e8', '484675c0690c147bc1ab990858241f65d704', 28, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2a46986b50657c5d12543fc2da21165aab95', '484675c0690c147bc1ab990858241f65d704', 214, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2a647b6c317b2e1484d9fc861bf9df66bd1b', '884f92440f11ea3f826310c4bcf9442908ec', 213, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2a7c1f608b4eb652ebbec3b04e37d578c108', '638f9ef95d6caead52d42928bded5b313c27', 267, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2a88eac376c35ddec5ec1db90a1892013403', '484675c0690c147bc1ab990858241f65d704', 37, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2aae6412de4b074fff817157ee118fe15d68', '484675c0690c147bc1ab990858241f65d704', 116, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('2b257d3d52ea173a6ef539838a93455e785f', '358ea4bf860ce17393ae5614aaa4afb2badd', 92, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2b2f91786e6604cfc393972cbdc830362366', 'feebca0c3e1e178553fecb7f905a4accbdf8', 74, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('2b5e93c270c4f39cd02826e8bb0e5f83d396', '884f92440f11ea3f826310c4bcf9442908ec', 58, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2b5fb632babcc8e39b29d2fdd7ee75a1717d', '358ea4bf860ce17393ae5614aaa4afb2badd', 325, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2b5fedcbe180788696494e6ae5262e3b56c8', '884f92440f11ea3f826310c4bcf9442908ec', 57, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2b63ffb718a9b2876d71afe169ff966813f1', '884f92440f11ea3f826310c4bcf9442908ec', 133, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2b8e3dd5e771721bc1d3f8cc2f718a9aaa45', '358ea4bf860ce17393ae5614aaa4afb2badd', 66, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2b8f67ea7dcc94bd4d5a3f1e68994f347f6e', '638f9ef95d6caead52d42928bded5b313c27', 116, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2bab64c0ed28b377ce4d29689de38a3a278b', '638f9ef95d6caead52d42928bded5b313c27', 25, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2badc1d097900d247e872ee315c4b315f18b', '638f9ef95d6caead52d42928bded5b313c27', 163, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2bb2017abb0ccc90a7ecbb071eb2eebd5ac7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 87, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('2c2d697416f492a7ad80ef78a32f4672d567', '638f9ef95d6caead52d42928bded5b313c27', 206, '4.52.23.8.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2c9d73e35dc2237f463f31a0bb1a8b84c8e0', '358ea4bf860ce17393ae5614aaa4afb2badd', 278, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2caf8e67013465a56ca3ced240b25d69c97f', '24bb6981131931d73aabea3f4eda805574ff', 16, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2cd063485d6d83c6b65ccb937afd30f52972', '884f92440f11ea3f826310c4bcf9442908ec', 309, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2cdaae2b48c46a849b6a6b8ad45bcfee7dd9', '638f9ef95d6caead52d42928bded5b313c27', 231, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2cdf794302943307f87042bbb1bc962e6242', '638f9ef95d6caead52d42928bded5b313c27', 41, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2ce52605e9e1de844b6ac40050873dace761', '358ea4bf860ce17393ae5614aaa4afb2badd', 185, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2cea5c70efa9f056409db5a9d24613b34d8e', '358ea4bf860ce17393ae5614aaa4afb2badd', 321, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2cf1847205204040d2a5b41503fb23b28658', '884f92440f11ea3f826310c4bcf9442908ec', 316, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2d173c146bac0517e0fffb5bf81f87b47ba4', '358ea4bf860ce17393ae5614aaa4afb2badd', 225, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2d17b8b6407769dba53b172c0e2e8f3c426b', '358ea4bf860ce17393ae5614aaa4afb2badd', 175, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2d2d8c6587bc8096d56cb17a4232d5a6a163', 'feebca0c3e1e178553fecb7f905a4accbdf8', 152, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('2d6fc7d96e136970fea3243b31d3bc516589', '638f9ef95d6caead52d42928bded5b313c27', 143, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('2de41f72af80fba6cccda20540d51184bcd7', '24bb6981131931d73aabea3f4eda805574ff', 27, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2e0ea7d3109c64d6c65a1230333ac09fa7a9', '358ea4bf860ce17393ae5614aaa4afb2badd', 121, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('2e254cb0b2f30acbd8bea0a6a200a87e9d60', 'feebca0c3e1e178553fecb7f905a4accbdf8', 308, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('2e480ee7112ab7bb68c0f58db18d15cfd176', '24bb6981131931d73aabea3f4eda805574ff', 215, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2e8837f322035e3e037bd5a27e4f566abcf3', '24bb6981131931d73aabea3f4eda805574ff', 234, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2edb9b74ed4738a9d1bc7aa5e7b3989f1a1c', '24bb6981131931d73aabea3f4eda805574ff', 232, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('2ee6e0d014ef59bc79ad3db726ceafa31b92', '884f92440f11ea3f826310c4bcf9442908ec', 51, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2f6358112448296c44c28f7652ca26f3fe3b', '884f92440f11ea3f826310c4bcf9442908ec', 164, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2f7d42d9e3a5c20fbacca95c7863bd372125', 'feebca0c3e1e178553fecb7f905a4accbdf8', 69, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('2f96c18b4e6d9e5403aad4d691d59717dfb9', '884f92440f11ea3f826310c4bcf9442908ec', 39, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('2fa9eff7d6d65079e8d5aa8737103a22d7dc', 'feebca0c3e1e178553fecb7f905a4accbdf8', 59, '4.52.19.1.21', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.21\",\"nama\":\"NUR NELISA ADAH\",\"judul_jurnal\":\"Building Entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective\",\"level_jurnal\":\"reputable_international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"Management & Accounting Review (MAR)\",\"penulis\":\"Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono, Nur Nelisa Adah\",\"url_publikasi\":\"https:\\/\\/ir.uitm.edu.my\\/id\\/eprint\\/121030\\/\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('2ff832c6f5021d6edbe82ce2486efdfa14c6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 56, '4.52.19.1.19', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.19\",\"nama\":\"MUHAMMAD DAFFA EL HAQ\",\"judul_jurnal\":\"Analysis of the Effect of Web Quality Dimensions (Usability Quality, Information Quality, Service Interaction Quality) on Customer Satisfaction of Aksesmu Application Users in \\u2026\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi Karnowahadi, Rustono Rustono\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"JOBS\",\"penulis\":\"Muhammad Daffa El Haq, Karnowahadi Karnowahadi, Rustono Rustono\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4858\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('30205e6aa6bc70d3383dc47a87d76d1a7490', '638f9ef95d6caead52d42928bded5b313c27', 210, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('303fe75f56a6c92f0c6c23fc39c4c3f0c7fb', '484675c0690c147bc1ab990858241f65d704', 195, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('304579a33de53fe512685802c1c7d5f39617', '358ea4bf860ce17393ae5614aaa4afb2badd', 258, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3045a96975b7c8575f161e4b1f89d836f14e', '638f9ef95d6caead52d42928bded5b313c27', 260, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('304b0ecb3ee91aa4f9bc6d4f401c5c46788d', '358ea4bf860ce17393ae5614aaa4afb2badd', 295, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3052c0d39c60c109b54e7a251467074921ee', 'feebca0c3e1e178553fecb7f905a4accbdf8', 109, '4.52.20.1.10', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.1.10\",\"nama\":\"FICRYNA SHULCHA\",\"judul_jurnal\":\"Analysis of the Influence of Online Consumer Reviews, Perceived Quality, and Price Perception on Purchase Decisions at the Charles and Keith Brand in Semarang\",\"level_jurnal\":\"reputable_international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi Karnowahadi, Subandi Subandi\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"Admisi dan Bisnis\",\"penulis\":\"Ficryna Shulcha, Karnowahadi Karnowahadi, Subandi Subandi\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5726\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('30915fa00107d24479f8a1d5cf5ee18041fe', '484675c0690c147bc1ab990858241f65d704', 131, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('30967a43a88c1abe50ed404d7165165f767d', '884f92440f11ea3f826310c4bcf9442908ec', 264, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('309ac9b07cbd735d7cf6a20aaeb9bbe975ca', '638f9ef95d6caead52d42928bded5b313c27', 111, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('30b9a572b0359ae76113f9f22fec7b78b7db', 'feebca0c3e1e178553fecb7f905a4accbdf8', 39, '4.52.19.1.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.03\",\"nama\":\"ARDIANITA NUR INDAH SARI\",\"judul_jurnal\":\"Implementasi APE Inovatif dan PTK Melalui Peran Internet Center pada PAUD Al-Kamilah Semarang\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat\",\"penulis\":\"Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi, Febrina Indrasari, Ardianita Nur Indah Sari\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4545\\/0\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('30bba788a3bffed4cc739472f810e0d07a70', '358ea4bf860ce17393ae5614aaa4afb2badd', 254, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('30cefb4d7957c444ed8bf39142758e882c01', '638f9ef95d6caead52d42928bded5b313c27', 234, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('30dee263397cbf9761ea8f27704cb5469561', '358ea4bf860ce17393ae5614aaa4afb2badd', 324, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('317fed9dc11023f2754b087c96ad848be7b1', '638f9ef95d6caead52d42928bded5b313c27', 29, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('31abee46737392b18b269d161290076dbe97', '884f92440f11ea3f826310c4bcf9442908ec', 311, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('31c6bc3c63bd55aa2d8b47264713018a99fa', '484675c0690c147bc1ab990858241f65d704', 173, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('31f95d28cf37be6ce6f08341af37ce73668c', '484675c0690c147bc1ab990858241f65d704', 230, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('31fbfc1baf51add97e193f47e7c8ea5dba3b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 15, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('32118a6e13324095fb69f363b40d4cadbe8e', '638f9ef95d6caead52d42928bded5b313c27', 308, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3222f3ccc48d0dca8673c07c46422f5fafc7', '24bb6981131931d73aabea3f4eda805574ff', 196, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('32243d62383370208f7386a39035551493aa', '638f9ef95d6caead52d42928bded5b313c27', 244, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('32259ca8312552beec742b580700c7d4a781', '484675c0690c147bc1ab990858241f65d704', 325, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('32335a1c8b450cfdae5c0a39ce996fd3cfd0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 111, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3236ccd37cb1d0b0bc87c05dbf3ae3603980', '884f92440f11ea3f826310c4bcf9442908ec', 120, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('328262470a9741c1c13bb5e43aafd1e7a26f', '358ea4bf860ce17393ae5614aaa4afb2badd', 134, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('32bf3f6f6d99d238416b9771e7b25fd44f65', '24bb6981131931d73aabea3f4eda805574ff', 41, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('32c23bef9d771b384280f136bf59e2147a30', '358ea4bf860ce17393ae5614aaa4afb2badd', 17, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('32f655c4cc8f47c309077acf754797bbdd5c', '24bb6981131931d73aabea3f4eda805574ff', 123, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('331a84b5b2fe61c937f51f4e511e0174d951', '638f9ef95d6caead52d42928bded5b313c27', 125, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3322104f8be0b835eca47c220627bd110a3c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 191, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('335cceb131339ed6f57d06f594ab0ec45f59', 'feebca0c3e1e178553fecb7f905a4accbdf8', 229, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('33667b4c52d280441f7c1a2879eb6b321bf8', '358ea4bf860ce17393ae5614aaa4afb2badd', 26, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3375aed9ea9accd8bf07f6c30c41d0d8bcdd', '358ea4bf860ce17393ae5614aaa4afb2badd', 197, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('33bcf6c4d46b7a368546cba473cabff2c046', 'feebca0c3e1e178553fecb7f905a4accbdf8', 148, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('33eb2d5e4038cb55a5fe114dbcf5aa09dbb1', '358ea4bf860ce17393ae5614aaa4afb2badd', 330, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('340bbc287fb619ee29ea668f2b9570a8b7e7', '358ea4bf860ce17393ae5614aaa4afb2badd', 247, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('34ae44affb81345ff87fe39c3d1f9ca230e1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 316, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('350b5ee2a3783b3a6a20fd89e284bf1feeca', '484675c0690c147bc1ab990858241f65d704', 103, '4.52.20.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('35766fb7256c3a8e2589849f84a6cc7385ee', '358ea4bf860ce17393ae5614aaa4afb2badd', 74, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('358b410998134255671882a6671b2455b4f7', '884f92440f11ea3f826310c4bcf9442908ec', 219, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3598ebc5c0faced429e8da86d596f009f4fb', '24bb6981131931d73aabea3f4eda805574ff', 307, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3599daeb33485ac7a867b5bdb721cfa46514', '638f9ef95d6caead52d42928bded5b313c27', 26, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('35aaaef6862ad5b05da0f0844957e7d3cf9a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 221, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('35bd811e475e1824561ad11fa3d0d3f1cc53', '484675c0690c147bc1ab990858241f65d704', 167, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('35f1f9bb113554134e220292ac853db49d90', '24bb6981131931d73aabea3f4eda805574ff', 131, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3666cc61c788eb40cb09a0417ca5f493d660', '358ea4bf860ce17393ae5614aaa4afb2badd', 41, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('36739fa410bd366d77834d9775ab32bb47b9', '884f92440f11ea3f826310c4bcf9442908ec', 163, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('36e31ff08e4c62ad552f9d3dd2edfd1e90c0', '484675c0690c147bc1ab990858241f65d704', 208, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('37236355a2c9cd0a3b1eca09c8c32c1e4589', '638f9ef95d6caead52d42928bded5b313c27', 300, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('37af9265c7cbb3179d7e0ae374e642d0a542', '484675c0690c147bc1ab990858241f65d704', 329, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('382d496e79494a726bad51c882332a65305e', '358ea4bf860ce17393ae5614aaa4afb2badd', 136, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('38337a2bd0a9db8b91d26915777f3f94374c', '484675c0690c147bc1ab990858241f65d704', 194, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('384ff87bfd943144713c26562ed563bae05a', '884f92440f11ea3f826310c4bcf9442908ec', 186, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('38781aaffcf3ac2e316e484a296f629321bd', '358ea4bf860ce17393ae5614aaa4afb2badd', 274, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('387e1de1a88f4617f264d917e533c8f539f4', '884f92440f11ea3f826310c4bcf9442908ec', 99, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3883b847eec46e9c0afb56e3b31435b3ce97', '884f92440f11ea3f826310c4bcf9442908ec', 303, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('38a3683480397b24cd6ab7a0ad2e87f8e95c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 202, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('38d0dbaacc303fd5eff74b3593ed092e310e', '884f92440f11ea3f826310c4bcf9442908ec', 10, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3912b215fb1b34e1271a07ba27596cc92d8d', '484675c0690c147bc1ab990858241f65d704', 279, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3923c213230fef32c7526069dce4b1cb70f7', '884f92440f11ea3f826310c4bcf9442908ec', 60, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3962eb24430ab0b6a84cfce7600711448102', '24bb6981131931d73aabea3f4eda805574ff', 121, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('39634e15d2e807d3f4ac81bc26c9acd9d5e0', '24bb6981131931d73aabea3f4eda805574ff', 45, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('397307db309f8263c22d3fd50754afa31038', '358ea4bf860ce17393ae5614aaa4afb2badd', 76, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('397b52d16148d99d8f7417dbfd5458fecacd', '24bb6981131931d73aabea3f4eda805574ff', 119, '4.52.20.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('397f1d632ac7e56497d2efa3a235261663a8', '358ea4bf860ce17393ae5614aaa4afb2badd', 214, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3a08a7d68d807e8bc2131e5b6dcf8d27ad85', '24bb6981131931d73aabea3f4eda805574ff', 183, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3a130f8faf4f68a5af7771621e3b69d07e98', '24bb6981131931d73aabea3f4eda805574ff', 93, '4.52.20.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3a14d8664756cc176d9ea42a7c0ff6df40b0', '884f92440f11ea3f826310c4bcf9442908ec', 271, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3a1786202d270cfa2fa1691dc2cbc4b939d3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 154, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3a33b761ca598d5f837630094a269cc37a18', '484675c0690c147bc1ab990858241f65d704', 202, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3a462bc6cb693a7e681744f80b820b41c90a', '358ea4bf860ce17393ae5614aaa4afb2badd', 178, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3a52b3b25ce91dee7fb24e35efff7f9cb8d3', '24bb6981131931d73aabea3f4eda805574ff', 168, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3ad710488692fbe2a25fac4c0d3efcbddac7', '484675c0690c147bc1ab990858241f65d704', 319, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3ad9002df65d34e01f30b11a142dc7dffa04', '638f9ef95d6caead52d42928bded5b313c27', 47, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3b40f8983ff3488e1765118ad4c7db5ef6d7', '24bb6981131931d73aabea3f4eda805574ff', 197, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3bc409a3d7f23ff47a4123994b93c482fd64', '24bb6981131931d73aabea3f4eda805574ff', 126, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3c0b802eebeee519d8642b0853fefbc4a825', 'feebca0c3e1e178553fecb7f905a4accbdf8', 258, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3c3c65467643d6c0a157a2ec59293804e14e', '638f9ef95d6caead52d42928bded5b313c27', 262, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3c6a858a7407d51b3f2aa4edebba6cd3bec9', '884f92440f11ea3f826310c4bcf9442908ec', 278, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3c6fd755fd6e6b46c562554e26a3158345f4', '484675c0690c147bc1ab990858241f65d704', 163, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3cab8bdb3b735e411ba8c456e8885607bc3b', '638f9ef95d6caead52d42928bded5b313c27', 94, '4.52.20.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3cb34c6307f45587d06d5305df4ca65c9ba9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 211, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3cbb60bf2a6966222311b743553e5c32ebeb', '24bb6981131931d73aabea3f4eda805574ff', 120, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3d134ab5809032e9799db09edf394d643000', '638f9ef95d6caead52d42928bded5b313c27', 223, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3d22086cdf339f178feffc07686740212752', '484675c0690c147bc1ab990858241f65d704', 54, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3d3998f378c14d4ce6aa3e1448a126ed16aa', '358ea4bf860ce17393ae5614aaa4afb2badd', 280, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3d9680820f88ef5f5b6b0262335b24907704', 'feebca0c3e1e178553fecb7f905a4accbdf8', 31, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('3da04f10a7be52226fb485316b28c26f5483', '358ea4bf860ce17393ae5614aaa4afb2badd', 233, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3da22d4fa5a9892c4caac8f1e481dfa18e42', '358ea4bf860ce17393ae5614aaa4afb2badd', 109, '4.52.20.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3da7c092199bd33cff464d2cfcf51d319219', '24bb6981131931d73aabea3f4eda805574ff', 200, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('3dd2b791db590e67bb66df08663890d2b344', '358ea4bf860ce17393ae5614aaa4afb2badd', 117, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3e3df8ea2afb6cbe908d9b097d822c2ac0e1', '884f92440f11ea3f826310c4bcf9442908ec', 189, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('3e5fe6d5320ef90f81f3aec8e7b942857f10', '484675c0690c147bc1ab990858241f65d704', 241, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3e7a926a3ec80c344116392c412d59575547', 'feebca0c3e1e178553fecb7f905a4accbdf8', 30, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('3e9ea118899b7e825ad589543625fcb87fe4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 27, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('3ebcbcffd55ab1b8f74aeec3a2548c5ecf27', '358ea4bf860ce17393ae5614aaa4afb2badd', 18, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('3f265611a5e6f268f4e73a727f1d2770dd1a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 168, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3f56069d67f18454789eeafc5c076c703b0b', '484675c0690c147bc1ab990858241f65d704', 66, '4.52.20.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('3f6913155caa116d986abdfef940ba14aedd', '638f9ef95d6caead52d42928bded5b313c27', 196, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('3f6f2694b2abd3905d089472a2f1a62da345', 'feebca0c3e1e178553fecb7f905a4accbdf8', 263, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('3fc15a14dee3cd506c0d7002ab2fe0efab87', '884f92440f11ea3f826310c4bcf9442908ec', 150, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('4010be3ce478b759025b8c7a91a56a733116', 'feebca0c3e1e178553fecb7f905a4accbdf8', 195, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('404c6c81c973036f3d7b1f2d1a8a6c96a5a7', '884f92440f11ea3f826310c4bcf9442908ec', 25, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('40739ab25098049e5ca36594e7428cbb836d', '358ea4bf860ce17393ae5614aaa4afb2badd', 318, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('409a0d402c1db799f2df54f865bf05530d34', '24bb6981131931d73aabea3f4eda805574ff', 105, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('409e237cf12bb1937593b93c77f246ea7a3a', '24bb6981131931d73aabea3f4eda805574ff', 206, '4.52.23.8.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('40afff528a6e6758c6d54f2020bcbb54c1c4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 325, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('40d9ea1ba79f7db270062a5692e78897933a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 262, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('410269ccc78718a0eea9a09ec89a66b3fcc0', '24bb6981131931d73aabea3f4eda805574ff', 35, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('411e3d3117ad0e4c89094f077bd1706bbfd0', '484675c0690c147bc1ab990858241f65d704', 220, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('417ad69710ad6b5883a57c987d1b9e52e61c', '24bb6981131931d73aabea3f4eda805574ff', 156, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('41f430ac526fb15527070e141558503daa69', '358ea4bf860ce17393ae5614aaa4afb2badd', 114, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('41fc5e3f4f80cbf0b72ec10bf4aa613e70ff', '484675c0690c147bc1ab990858241f65d704', 179, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('422bfe9cf154616e25fa85200a21b2d48e47', '638f9ef95d6caead52d42928bded5b313c27', 142, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('428179f52f625e51a861dcec1954c73a590c', '638f9ef95d6caead52d42928bded5b313c27', 168, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('42b439944d1787d793c05ab5a0b804277fab', '484675c0690c147bc1ab990858241f65d704', 9, '4.52.18.0.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"judul_jurnal\":\"judul 1\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":null,\"tahun_publikasi\":2020,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-06 10:14:10'),
('42b7ddd65d9cf04e042fefdf8e6b124a5f5e', '358ea4bf860ce17393ae5614aaa4afb2badd', 144, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('42cfe9fec4507685164fd5c371c0468f25cb', '484675c0690c147bc1ab990858241f65d704', 300, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('42e311d8949d78053103a7d29827148cf328', '638f9ef95d6caead52d42928bded5b313c27', 245, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('42ec213b83d9ad24e0d252ca5317e5c2f179', '884f92440f11ea3f826310c4bcf9442908ec', 63, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('432bade740baddbebe92ceb2916307e65c95', 'feebca0c3e1e178553fecb7f905a4accbdf8', 118, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('435be12f15fc482789d6171d19e798abd90c', '638f9ef95d6caead52d42928bded5b313c27', 269, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('436039809e2723e52dc1172eb8b806adbc82', '24bb6981131931d73aabea3f4eda805574ff', 324, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('437c309418de6e13e0d39d98e18a810b41af', '358ea4bf860ce17393ae5614aaa4afb2badd', 315, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('43b7356e1031fb2c206424aba8a9934b54f5', '358ea4bf860ce17393ae5614aaa4afb2badd', 261, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('43caccff4c0b7179729b7fafbbf46b121ed8', '358ea4bf860ce17393ae5614aaa4afb2badd', 25, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('43f8092694e0f91183a02cafa632554ccc72', '484675c0690c147bc1ab990858241f65d704', 187, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('43f9b960462778313b84527761903463fbaa', '24bb6981131931d73aabea3f4eda805574ff', 277, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('43ff75154c8ab2a7d3f62a3e10cfafe5d096', '358ea4bf860ce17393ae5614aaa4afb2badd', 316, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('443a90a12a095d998baa7eadb19f916fea7d', '358ea4bf860ce17393ae5614aaa4afb2badd', 235, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('44646915c5ce7634d1c3b36688b4c95c52b7', '24bb6981131931d73aabea3f4eda805574ff', 251, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('447a7b949549642679097dba5c2bd20e3413', '638f9ef95d6caead52d42928bded5b313c27', 13, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('449f2a9da1ea83266fafeae2d2a72827798d', '638f9ef95d6caead52d42928bded5b313c27', 175, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('44c0a798e701c4d2e1df4d6b5412d9d02f68', '884f92440f11ea3f826310c4bcf9442908ec', 162, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('44d4e806eeb9596663e368bb148188e933fc', '24bb6981131931d73aabea3f4eda805574ff', 321, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('44f727cecfdf6c7f0c9fc93f36ce858fb3b3', '484675c0690c147bc1ab990858241f65d704', 138, '4.52.21.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4524c662ee27d780433d5ad18259440a8ff3', '484675c0690c147bc1ab990858241f65d704', 171, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4524d8c9d8d87b0516ec73662b57dd11e514', '638f9ef95d6caead52d42928bded5b313c27', 155, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('45545be465908a3d92abb8e448853800a966', 'feebca0c3e1e178553fecb7f905a4accbdf8', 71, '4.52.20.0.01', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.01\",\"nama\":\"ADESGY TIARA LARASATY\",\"judul_jurnal\":\"Influence of E-Wom, Price Perception, and Product Quality on VIVO Smartphone Purchasing Decision\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Winarto Winarto, Nur Rini\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"Admisi dan Bisnis\",\"penulis\":\"Adesgy Tiara Larasaty,  Winarto Winarto, Nur Rini\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/6234\\/0\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('45981ae9079b70b9d7c9262bd60b5420a3ed', '24bb6981131931d73aabea3f4eda805574ff', 176, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('45a71a0a711d688809313d4ea062537ede23', '358ea4bf860ce17393ae5614aaa4afb2badd', 317, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('45ac02d817d680d547e099ad7eb0e0c38216', '484675c0690c147bc1ab990858241f65d704', 210, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('45cf46f9aab2c3406af4ccf8412124f4d453', '884f92440f11ea3f826310c4bcf9442908ec', 198, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('461620686bba88e69433569b5821f1e9ede3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 228, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('461b475c82da419f4c68e0c72d1c46f2b13e', '884f92440f11ea3f826310c4bcf9442908ec', 126, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('463f66f5491317eb9ec137a6e2b01d0e2b9e', '24bb6981131931d73aabea3f4eda805574ff', 242, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('466d0e0a50dceeaa24534450396aa7483e29', '24bb6981131931d73aabea3f4eda805574ff', 18, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('466de3bad164fb5209c2dab3a3c4dd5ac996', '484675c0690c147bc1ab990858241f65d704', 118, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4692c109b91e8c11d90da88bb4d49a70c216', '484675c0690c147bc1ab990858241f65d704', 232, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('46c8f73c5ebfbaa0dbf76067b29cce10be94', '484675c0690c147bc1ab990858241f65d704', 273, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('46d04d5d6bf00531666348b3280b6e3bf533', '638f9ef95d6caead52d42928bded5b313c27', 319, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('46d15f7a6bd30f4ad744ccb007dda304c73e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 186, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('46d41dca5173bd57de33cae817ed2ac4dde7', '24bb6981131931d73aabea3f4eda805574ff', 261, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('470f29159443637386b3a591199adbccb238', '358ea4bf860ce17393ae5614aaa4afb2badd', 90, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('47134fd877fef0a441125483325b8ba4cdbf', '484675c0690c147bc1ab990858241f65d704', 307, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('471c7fda81af2d33d366e2400713771559f9', '484675c0690c147bc1ab990858241f65d704', 55, '4.52.19.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('472d96886ad30762f1d6663246d653cb3956', '884f92440f11ea3f826310c4bcf9442908ec', 212, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('47399c42a04c32fde32ae12aff697cb1ad9c', '358ea4bf860ce17393ae5614aaa4afb2badd', 145, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4767cdedfb19cca4e716fd96f71738b28d8e', '638f9ef95d6caead52d42928bded5b313c27', 140, '4.52.21.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('47a605de4a45ae88269563a4c57ebf6982da', '638f9ef95d6caead52d42928bded5b313c27', 158, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('47eba5f37dbadb3a54828e8c1c0161c17b04', '358ea4bf860ce17393ae5614aaa4afb2badd', 331, '45219006', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('48238420731be8f5eb7835625f796fa8c87f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 222, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('48288d27feb8676fe67119bd93e075d8c21f', '24bb6981131931d73aabea3f4eda805574ff', 214, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4857842497d5370de2a6aecaed2fba3e3a68', '638f9ef95d6caead52d42928bded5b313c27', 205, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('488435830846550c4d3e8e9b7407bc6de01a', '638f9ef95d6caead52d42928bded5b313c27', 101, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('48b5334e7aaaf4a38f58be419498bebc3406', '358ea4bf860ce17393ae5614aaa4afb2badd', 246, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('48d60323d123cd5b1b03f57bd04ac7fa1f9a', '24bb6981131931d73aabea3f4eda805574ff', 97, '4.52.20.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('48e4c7b81d1d5d5e96e7fe3fee287d8c197c', '484675c0690c147bc1ab990858241f65d704', 95, '4.52.20.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('48e9a64e24aa3e4fa3831f1ca9cbf0136f17', 'feebca0c3e1e178553fecb7f905a4accbdf8', 193, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('48ec1d35baff572c2d9ebe6a3cee919e89cd', '884f92440f11ea3f826310c4bcf9442908ec', 241, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('48fb1c43f09d850f9fa33490f9518f616b3b', '884f92440f11ea3f826310c4bcf9442908ec', 178, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('4920eeb793e28cc9d66d2dd4255eb33eb896', '884f92440f11ea3f826310c4bcf9442908ec', 304, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('4965e8d6108964d331d6aa53506778adfb4e', '358ea4bf860ce17393ae5614aaa4afb2badd', 168, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4974344e7cd0177893b05436f0840b397848', '358ea4bf860ce17393ae5614aaa4afb2badd', 213, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('499f1d2a37fd2b266d3cf954d69b6e92c94b', '24bb6981131931d73aabea3f4eda805574ff', 160, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4ac410dc4d1b1ee07b25402022a7a17bf1b1', '638f9ef95d6caead52d42928bded5b313c27', 224, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4afb6ee23472e08b532da69e16a5671150e5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 207, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('4b10a46625cb44d570c5ce2e753d204b5783', '484675c0690c147bc1ab990858241f65d704', 125, '4.52.21.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4b82f6a6dd218c6a8eb0b1ce50fd66fc8c8f', '358ea4bf860ce17393ae5614aaa4afb2badd', 163, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4b8712fac01e314b60867f5980067db88aca', '884f92440f11ea3f826310c4bcf9442908ec', 232, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('4b905104a81b55e79a28b772f05adca85d1e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 318, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('4ba7bbc1864c6c60f411db2a30f899e09562', '24bb6981131931d73aabea3f4eda805574ff', 80, '4.52.20.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4beccb45776db5dcbc37a00e6bf8d47941de', 'feebca0c3e1e178553fecb7f905a4accbdf8', 120, '4.52.20.1.23', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.20.1.23\",\"nama\":\"RIZKY TRI FEBRIAN\",\"judul_jurnal\":\"Implementation of Inbound Marketing Strategy through Call to Action by Building an E-Store Website\",\"level_jurnal\":null,\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Azizah, Eva Purnamasari, Endang Sulistyani\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"Admisi dan Bisnis\",\"penulis\":\"Rizky Tri Febrian, Azizah, Eva Purnamasari, Endang Sulistyani\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('4c02808b0bd15b6a63468ccf70d0507e5dfe', '358ea4bf860ce17393ae5614aaa4afb2badd', 128, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4cbba296f0bf2dcd535a24e23d900eb9e081', '638f9ef95d6caead52d42928bded5b313c27', 292, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4cc8774d8ccfa2256f6b062b5ae8f8010192', 'feebca0c3e1e178553fecb7f905a4accbdf8', 315, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('4ccbd35b7283e9c1745a1799032b02024a8b', '884f92440f11ea3f826310c4bcf9442908ec', 246, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('4cd8916b8d8a87b8f5fb2876c60a7be25389', '484675c0690c147bc1ab990858241f65d704', 94, '4.52.20.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4cd93ae2d3d800a77e335a71799fadd6fcc2', '358ea4bf860ce17393ae5614aaa4afb2badd', 69, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4ce0f5c4e2674701d447f7c674c4493cf909', '24bb6981131931d73aabea3f4eda805574ff', 115, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4ce15a703cb5213234161cf538a0592d4baf', '484675c0690c147bc1ab990858241f65d704', 309, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4cf758a6009c601d1d90da060bcddd2b45ef', '358ea4bf860ce17393ae5614aaa4afb2badd', 218, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4d13f19ed01cb09bb7b5e2e486af9434c4c5', '24bb6981131931d73aabea3f4eda805574ff', 40, '4.52.19.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4d296950d01daa9af921d014904452f5f4d7', '358ea4bf860ce17393ae5614aaa4afb2badd', 284, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4d36bd8886d6e13334e7bd8260f95466db97', '638f9ef95d6caead52d42928bded5b313c27', 278, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4d899ab00e962703c1d04d53f8bb1ce66835', '638f9ef95d6caead52d42928bded5b313c27', 279, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4da02730adb0fa05033899fd228921c242f6', '358ea4bf860ce17393ae5614aaa4afb2badd', 9, '4.52.18.0.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"judul_jurnal\":\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":null,\"tahun_publikasi\":2022,\"nama_jurnal_konferensi\":\"Organization and Human Capital Development (ORCADEV)\",\"penulis\":null,\"url_publikasi\":\"https:\\/\\/journals.researchsynergypress.com\\/index.php\\/orcadev\\/article\\/view\\/2293\",\"deskripsi\":null}', '2026-03-06 09:52:57'),
('4dfa35bd6ae5740f3e4d331577601fe7323a', '638f9ef95d6caead52d42928bded5b313c27', 301, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4e4322144a9230d805262cec71a2e56f01c4', '484675c0690c147bc1ab990858241f65d704', 284, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4e5fb5273adbc3b885bc9703720765788c40', '638f9ef95d6caead52d42928bded5b313c27', 49, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4e7b9812caffb9c92fd359245c9a79b29e33', 'feebca0c3e1e178553fecb7f905a4accbdf8', 92, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('4eaa9d2fb3867876acf1d8ff132c0e4f7d26', '484675c0690c147bc1ab990858241f65d704', 91, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4eb04043f76d8f8c9d7252daba74695c3ac0', '638f9ef95d6caead52d42928bded5b313c27', 138, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4eb41881f377dab195b59ee4128fb2eb11a0', '638f9ef95d6caead52d42928bded5b313c27', 126, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('4f11c964980acfe2e46df4c5dc04bbc92bef', '484675c0690c147bc1ab990858241f65d704', 311, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4f2c62b1e385b0c1abad698d5a532e75254c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 187, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('4f42cf1df41922da008de72c1fea86bb6f10', '358ea4bf860ce17393ae5614aaa4afb2badd', 173, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('4f473995dcb2df24db5f5a58e2c363d2b157', 'feebca0c3e1e178553fecb7f905a4accbdf8', 38, '4.52.19.1.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.03\",\"nama\":\"ARDIANITA NUR INDAH SARI\",\"judul_jurnal\":\"Organizational Culture through Technology Resources as Antecedents and its Impact on Export Performance of The Furniture Industry\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani,\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia, September 13-15, 2022\",\"penulis\":\"Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani, Ardianita Nur Indah Sari\",\"url_publikasi\":\"https:\\/\\/ieomsociety.org\\/proceedings\\/2022malaysia\\/532.pdf\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('4f4a469fbbe34d9b1dcb58acc823dd14406f', '484675c0690c147bc1ab990858241f65d704', 226, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('4f68fa1494c998a8007155659a27965fe8b0', '24bb6981131931d73aabea3f4eda805574ff', 29, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('4f9c195725173acfc0a94bf01a72da9521ed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 250, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('508f5457eb758340feea6d6791e881d8acdd', '484675c0690c147bc1ab990858241f65d704', 286, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5098441c2714c98f5a9fe2bfbce464695a6d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 147, '4.52.21.0.22', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.21.0.22\",\"nama\":\"RAFI WILLY FEBRIAN\",\"judul_jurnal\":\"Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Mellasanti Ayuwardani\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"JAPM (Jurnal Akademik Pengabdian Masyarakat)\",\"penulis\":\"Mellasanti Ayuwardani, Azzam Alhafhizd, Mirza Dzaki Kamal, Rafi Willy Febrian, Setiawan Wibowo\",\"url_publikasi\":\"https:\\/\\/ejurnal.kampusakademik.co.id\\/index.php\\/japm\\/indeksasi\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('50a3d91ee5ea9d7842c39cd95195152e59f2', '484675c0690c147bc1ab990858241f65d704', 17, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('50c6eac74282194ec7a39f9382875c5ca7e8', '638f9ef95d6caead52d42928bded5b313c27', 238, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5121df9d7a22534c0d6d336fa7c8d7df788c', '358ea4bf860ce17393ae5614aaa4afb2badd', 87, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('5128e26acb28995f3a33c0d5af6c811b391c', '884f92440f11ea3f826310c4bcf9442908ec', 171, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('512b0c05893a691d0e20ceec993c5bcdee03', '484675c0690c147bc1ab990858241f65d704', 49, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('513e7afffa55a4cc513aff5c51a3dc10d169', '884f92440f11ea3f826310c4bcf9442908ec', 64, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('51682909a55c252f21cb23426d55d08fab91', '358ea4bf860ce17393ae5614aaa4afb2badd', 240, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('51a78422623cd1490be68867e1abc3a2b67c', '24bb6981131931d73aabea3f4eda805574ff', 12, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('51ddba7ae0b7a408bc485da6af42f0630d8f', '24bb6981131931d73aabea3f4eda805574ff', 20, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('521c07d01d446d0ef934299c88997e711faf', 'feebca0c3e1e178553fecb7f905a4accbdf8', 48, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('521fb65b23a16f2995bebe8e800e62b17d2d', '884f92440f11ea3f826310c4bcf9442908ec', 146, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('52595eb92d2b1e5d7ccadc55a24f08e7aca5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 336, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('526e5148bbc30df0ffd6c16805a4098256d3', '24bb6981131931d73aabea3f4eda805574ff', 58, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5278c30a895e13de9b2f005dbe61802d731e', '884f92440f11ea3f826310c4bcf9442908ec', 56, '4.52.19.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('52bc97d830525187e386e0dc193f88922bd9', '24bb6981131931d73aabea3f4eda805574ff', 81, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('52d0ab0697ce298a84a2174f94941570731c', '638f9ef95d6caead52d42928bded5b313c27', 129, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('52d785784fd42c728caf798b8ff50d1ec66b', '484675c0690c147bc1ab990858241f65d704', 148, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('52db767669677c416b5c3190febd8b90475b', '884f92440f11ea3f826310c4bcf9442908ec', 153, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('530025b1fac6bca66bc3844ad796d7c6fcae', '24bb6981131931d73aabea3f4eda805574ff', 203, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5305b55a8abe2a3f508d13894da90e2f00ea', '24bb6981131931d73aabea3f4eda805574ff', 243, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('531822535765bfea3c672778dab19e8bccb0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 218, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('531ef4eaeb4ae3c316543adb8d6a1f9575fc', '24bb6981131931d73aabea3f4eda805574ff', 90, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('53561ee11b252da1e329294dcd83492b6ccd', '24bb6981131931d73aabea3f4eda805574ff', 315, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('53624dd634be8a22c9a047d224fbea890d02', '638f9ef95d6caead52d42928bded5b313c27', 316, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('53694893e2be889818eccf9defafc28aa535', '884f92440f11ea3f826310c4bcf9442908ec', 30, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('53a9afef64e81787f56f3b68140d5cad1b47', '358ea4bf860ce17393ae5614aaa4afb2badd', 153, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('53bb4c75e299188c312a5431875dcc4ee65e', '884f92440f11ea3f826310c4bcf9442908ec', 215, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('53bd764c332eeee172a7702d81de2530083d', '484675c0690c147bc1ab990858241f65d704', 24, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('53df9796b251f692ddd1c6d83887e91d41da', '484675c0690c147bc1ab990858241f65d704', 203, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('543668de24288bfc9381c5352b96ba2638f4', '638f9ef95d6caead52d42928bded5b313c27', 27, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('54486a3fa836c94a6f8d98e712a0a14e1465', '358ea4bf860ce17393ae5614aaa4afb2badd', 262, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('545002cf0a3ed357fd7d187348741ab2e627', '884f92440f11ea3f826310c4bcf9442908ec', 82, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('546cd67a02f17fe48e27f085ea493b43291e', '24bb6981131931d73aabea3f4eda805574ff', 172, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('54aacde0110c2964fdbbb8da2e8c45675a66', '24bb6981131931d73aabea3f4eda805574ff', 224, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('54d97cb8bad776ec88f31bd6496b64667cf4', '884f92440f11ea3f826310c4bcf9442908ec', 149, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('54e8d13c69b5d20943af73bcb191b19dd0d6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 153, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5528147562c686273d34f0f2377d26af9511', '638f9ef95d6caead52d42928bded5b313c27', 214, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('553091b871f1da36a28a589de212dd7b8351', '24bb6981131931d73aabea3f4eda805574ff', 103, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('556215c27f227581cd47d55151959243a891', '884f92440f11ea3f826310c4bcf9442908ec', 226, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5567d7d1ad59cf9add6cbc814ed63a0d174b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 290, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5574ab01ba137e56217928f8c291c67c766a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 293, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5589e5827e101d25a586f32839e405757dee', '24bb6981131931d73aabea3f4eda805574ff', 177, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('559862db986c98deb3a8a32f02becee897b8', '24bb6981131931d73aabea3f4eda805574ff', 289, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('55e75cfce6ba8d2063127a4452e1eecfb6e4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 235, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('55ffa25fb88edd3f921cca2f1457f97b3989', '638f9ef95d6caead52d42928bded5b313c27', 289, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('56058cc7e4d4be45efba2572bac9848ee329', 'feebca0c3e1e178553fecb7f905a4accbdf8', 267, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('560765f45aba61c7e2f4b61fba90ff90f452', '484675c0690c147bc1ab990858241f65d704', 15, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('560d4cc7c7b49cdcb016f3a437fe44c90cb2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 256, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('56379e6533dbdf8794314a6a48dc9b7f08e1', '484675c0690c147bc1ab990858241f65d704', 277, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('56576cf5890433200dc28d637e46eedbe621', 'feebca0c3e1e178553fecb7f905a4accbdf8', 60, '4.52.19.1.21', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.21\",\"nama\":\"NUR NELISA ADAH\",\"judul_jurnal\":\"The Role of Entrepreneurial Orientation, Organizational Culture, and Technology Resources in Encouraging Supply Chain Management\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia\",\"penulis\":\"Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho\",\"url_publikasi\":\"https:\\/\\/ieomsociety.org\\/malaysia2022\\/proceedings\\/\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('566bb1cc7511e76caa2116afa1361a8f84e9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 78, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('5673aa64181948a4a5536c6e057866c97ba6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 301, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('568c27beb1f3c2b026f3f41cd06c4d4d5b01', '638f9ef95d6caead52d42928bded5b313c27', 299, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('56949ebb38e49be88b5de84187e35ae2ab93', '484675c0690c147bc1ab990858241f65d704', 79, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('569cb21f3b7efc0213e72d3cf99824e55df6', '24bb6981131931d73aabea3f4eda805574ff', 56, '4.52.19.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('56a7f09389e35c00f3896c17a0368d7d5b56', '484675c0690c147bc1ab990858241f65d704', 120, '4.52.20.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('56e0ccce7097c0a971b362b14a9e3a475df7', '638f9ef95d6caead52d42928bded5b313c27', 212, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('56f3f1c3e4938faa4d49c016adc08d8903e3', '24bb6981131931d73aabea3f4eda805574ff', 173, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('57612736dcbd6392d9c0b998665649e71ef0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 192, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5775634236833c4cf8ae396b2343ef53b155', '24bb6981131931d73aabea3f4eda805574ff', 244, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('57f4e6a59b6ea2aeaf907063b7ab158a1876', '484675c0690c147bc1ab990858241f65d704', 81, '4.52.20.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('582c321d8f4bba9bb1304055b4099d04d3d0', '358ea4bf860ce17393ae5614aaa4afb2badd', 50, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('58398c82a1e2955ad1734a4a4e2553d99374', 'feebca0c3e1e178553fecb7f905a4accbdf8', 269, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('58538fd8288bf4b0c1662ac7cae147e64da9', '638f9ef95d6caead52d42928bded5b313c27', 110, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('585fb74b7296750421b3eec1920db9aa3a6e', '484675c0690c147bc1ab990858241f65d704', 246, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5865b1b1f6fca35cde37f32458cff5bc6cc3', '24bb6981131931d73aabea3f4eda805574ff', 145, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5869339b25cb3203acbed6497a20faa8c373', 'feebca0c3e1e178553fecb7f905a4accbdf8', 64, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('586f6436c4b020c2f8c0bb42940f6028ecf0', '484675c0690c147bc1ab990858241f65d704', 239, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('587ee4a3a41d1931d7a7c3f2f12ac69981e9', '638f9ef95d6caead52d42928bded5b313c27', 257, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5893137a6076a17462590dcf0233ae7d1fe8', '884f92440f11ea3f826310c4bcf9442908ec', 239, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('589419f77f5cb9304eb54acc50fcaf805ae4', '638f9ef95d6caead52d42928bded5b313c27', 296, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('58c8322a32d514256f4572ff62f0d45bd33c', '24bb6981131931d73aabea3f4eda805574ff', 57, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('590f07182ed66a114120c180949b46b3da0c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 237, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('59390a6a2f2d7f06dd5d0bd7075331af0401', 'feebca0c3e1e178553fecb7f905a4accbdf8', 122, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('594a9c09c02f28f4bebd0876dc3a568039b0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 65, '4.52.19.1.24', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.24\",\"nama\":\"RIZKA LAILA MAULIDA\",\"judul_jurnal\":\"Design and Build an E-Commerce Website as a Means of Market Network Development for UMKM MDF Pressing\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Azizah Azizah, Irawan Malebra\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"Admisi dan Bisnis\",\"penulis\":\"Endang Sulistiyani Rizka Laila Maulida, Azizah Azizah, Irawan Malebra\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/5727\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('5954512e50c46879874e4f5425e5af941110', '484675c0690c147bc1ab990858241f65d704', 70, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('596e50e5fd5d397d27ee7a4e3c6788f0f4ad', '884f92440f11ea3f826310c4bcf9442908ec', 279, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('598caaa3eb6cb0c8c1195bd3f9060b2f15d8', '358ea4bf860ce17393ae5614aaa4afb2badd', 83, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('59bdd774d6655393456a96460536426288d5', '484675c0690c147bc1ab990858241f65d704', 317, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('59d4d0072f46fd6b93d35a0cabfe6b48dc9e', '24bb6981131931d73aabea3f4eda805574ff', 228, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5a541f5b4a2c7db4680cd0b4dc13df534663', '638f9ef95d6caead52d42928bded5b313c27', 130, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5a6b445fbfebec60b11787686fdc52849b21', '24bb6981131931d73aabea3f4eda805574ff', 192, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5a9c038307b973b8ae4d8df939ba78aec4ca', '884f92440f11ea3f826310c4bcf9442908ec', 141, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5aa8597600eb7af1eab98612961cad278681', '358ea4bf860ce17393ae5614aaa4afb2badd', 96, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('5ad6883ee8ceefc38e5a96b8a1fa574b7208', 'feebca0c3e1e178553fecb7f905a4accbdf8', 138, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5b4caeabedb3e0e9b057e21c245cb2a32e09', '638f9ef95d6caead52d42928bded5b313c27', 207, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5b4ccfb4a207c6fde6260de692568e92eab4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 337, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5b5085a016a3a68f42b8cad9d841e46b9ad8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 289, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5b67abcfe474400a11a92c88114f0bace81f', '484675c0690c147bc1ab990858241f65d704', 58, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5bbd7aa86f021b79a21e66beaf8b25c9ad8c', '24bb6981131931d73aabea3f4eda805574ff', 142, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5bca38dea0e793ef757ffedbcfbe4ff5c2f5', '484675c0690c147bc1ab990858241f65d704', 281, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5bcc5fbe0e8a442ea9412cbfe020fedb0a79', 'feebca0c3e1e178553fecb7f905a4accbdf8', 75, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('5bd269e36b42c4a695ee9cfbeda3c80282e5', '484675c0690c147bc1ab990858241f65d704', 60, '4.52.19.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5c05a0fa9fb5d5fcb67b63165e76ac869a91', '24bb6981131931d73aabea3f4eda805574ff', 114, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5c05d33151a46da7c68dffc4ffa5cbd3b8d0', '358ea4bf860ce17393ae5614aaa4afb2badd', 59, '4.52.19.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('5c31e9e160bcc0d674de4988ad2f7536b602', '884f92440f11ea3f826310c4bcf9442908ec', 14, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5c489370dcdcc95075e12be0c88aa1f3cf54', '24bb6981131931d73aabea3f4eda805574ff', 240, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5c4d71fb32ec1c5f725d3deca66a9ba3d742', '484675c0690c147bc1ab990858241f65d704', 19, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5c85aa7770e7cd8487c27d959500710582b7', '638f9ef95d6caead52d42928bded5b313c27', 98, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5ca867d83d4e50caf6921c5618f57e2a4554', '24bb6981131931d73aabea3f4eda805574ff', 326, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5cb5ea257db9aa918bb493dfcc1938fdc318', '884f92440f11ea3f826310c4bcf9442908ec', 19, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5cea650ed3682a87ec069f8dd65dcbca06a8', '484675c0690c147bc1ab990858241f65d704', 50, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5cec31418e9d967f3c3c15daffaa594d90b9', '24bb6981131931d73aabea3f4eda805574ff', 316, '4.52.25.3.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5d009130b87c176383876c09f30e28090073', '358ea4bf860ce17393ae5614aaa4afb2badd', 149, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('5d088193a0c8e57ddcbd2a41efbc9e6a1b2f', '638f9ef95d6caead52d42928bded5b313c27', 218, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5d0a3aa50d937b4f7e3b5e15bce4c14686f0', '484675c0690c147bc1ab990858241f65d704', 256, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5d2d8e65fdb42f913a84236a08fbcb78047f', '884f92440f11ea3f826310c4bcf9442908ec', 221, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5d46d622c121c2e8d22c960c7266c8089805', '484675c0690c147bc1ab990858241f65d704', 227, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5d8e7cce63e8d7d1d29960d372e8a2335603', '884f92440f11ea3f826310c4bcf9442908ec', 320, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5dba47a1ed0bc8af5d83c439f8cc60d1e2ca', '638f9ef95d6caead52d42928bded5b313c27', 315, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5e0674d513de63cd84bc011b5b656edb29da', 'feebca0c3e1e178553fecb7f905a4accbdf8', 66, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('5e4f2e39dbf332367689a5efd65984417b31', '638f9ef95d6caead52d42928bded5b313c27', 198, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5e62303bf6a9b68e0192a002d8f323adf3f3', '638f9ef95d6caead52d42928bded5b313c27', 159, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('5e65cb405c2f6efd9140c44c417458532470', '884f92440f11ea3f826310c4bcf9442908ec', 88, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5e736f7e54cf45bce04dbb08b811aa5abfea', '484675c0690c147bc1ab990858241f65d704', 14, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5ec5248ac351675ede20be9d9d50f46161d3', '484675c0690c147bc1ab990858241f65d704', 221, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5ef6e3f5b875425a048858faa06ebf7f41a3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 278, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5f03042da7258c1c343255546c553898ce20', '884f92440f11ea3f826310c4bcf9442908ec', 52, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('5f400fab4b0fe9cfcb76d0c1d0ea50b6dd12', '24bb6981131931d73aabea3f4eda805574ff', 270, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5f6ed5c041920fac64fc4cc697016586efb4', '484675c0690c147bc1ab990858241f65d704', 217, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5f98d18d4d56f95c575aeb769409b30915f1', '24bb6981131931d73aabea3f4eda805574ff', 50, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('5fb9a391df609558ae6e85d3d5d118233e7b', '484675c0690c147bc1ab990858241f65d704', 177, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5fcbe9abd2a0b639ab0b4fb933c43b03fdc3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 286, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('5fe43edd7bb9086fcb7717941af2bd0b3182', '484675c0690c147bc1ab990858241f65d704', 269, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('5ff0d77720f334ef61fb8dfbda2d6ad86724', '24bb6981131931d73aabea3f4eda805574ff', 198, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('603a3ca5b0c20d11942f0b5be36c7a65c78f', '358ea4bf860ce17393ae5614aaa4afb2badd', 119, '4.52.20.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('606cab6f11ca6efac8dc5f928998e52bdb95', '484675c0690c147bc1ab990858241f65d704', 18, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('60748103d67fe17d88bbef8fa8a08ca4e95d', '358ea4bf860ce17393ae5614aaa4afb2badd', 319, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('60a616b437ec85a38883891eb1efd7c9aa9b', '884f92440f11ea3f826310c4bcf9442908ec', 106, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('60c792a79080fdbf1d46535a30c4ca326c14', '484675c0690c147bc1ab990858241f65d704', 52, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('60e41e1aa9ee32220ca3c29eeb6af99cb8bc', '638f9ef95d6caead52d42928bded5b313c27', 169, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('60e828c806625e19c5b02ec78329ea14054e', '884f92440f11ea3f826310c4bcf9442908ec', 90, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('60ea365a306caaef8347b1881663c2564bf1', '358ea4bf860ce17393ae5614aaa4afb2badd', 154, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('610676722ace92b569520ecad4113da1d059', 'feebca0c3e1e178553fecb7f905a4accbdf8', 232, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6119ab6e9ff5bea899f06d14792170c91ff9', '24bb6981131931d73aabea3f4eda805574ff', 249, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('613e039b2dc6d23a133c420cc0fe8d4fa99b', '638f9ef95d6caead52d42928bded5b313c27', 141, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('614ec995d3437a6dc5617ce6619582262e3c', '24bb6981131931d73aabea3f4eda805574ff', 221, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('614fdd7c479288ebeaf74df4add0dfe078c6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 268, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('615ebd9ca013583caa509dfedcbea31cf931', '24bb6981131931d73aabea3f4eda805574ff', 305, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('617dc0f40bd377ee4b3dad1367598255b48b', '884f92440f11ea3f826310c4bcf9442908ec', 17, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6187d0e1fb640b8cadfc5cdb918c57998df0', '24bb6981131931d73aabea3f4eda805574ff', 245, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6190143c9ad71f27177298203c8d3fdda8ff', '484675c0690c147bc1ab990858241f65d704', 76, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('61a7122048ff461dcbe2011cbd3ea62c13e8', '484675c0690c147bc1ab990858241f65d704', 164, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('61b87b7bc1d6d26d4461e6656820e31fccff', '358ea4bf860ce17393ae5614aaa4afb2badd', 253, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6205d3f83f3ac06b5878b9acd341d77206c1', '484675c0690c147bc1ab990858241f65d704', 27, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('622ce95ac38dcff4288fd1f287e5f2f997f5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 131, '4.52.21.0.06', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.21.0.06\",\"nama\":\"AZZAM ALHAFHIZD\",\"judul_jurnal\":\"Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online\",\"level_jurnal\":null,\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Mellasanti Ayuwardani\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"JAPM (Jurnal Akademik Pengabdian Masyarakat)\",\"penulis\":\"Mellasanti Ayuwardani, Azzam Alhafhizd, Mirza Dzaki Kamal, Rafi Willy Febrian, Setiawan Wibowo\",\"url_publikasi\":\"https:\\/\\/ejurnal.kampusakademik.co.id\\/index.php\\/japm\\/indeksasi\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('62a85abc9d60c5db7366e922b33073f2ffd6', '358ea4bf860ce17393ae5614aaa4afb2badd', 126, '4.52.21.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('62ba3cfe3d8a935259497a7f330aaa2574f2', '638f9ef95d6caead52d42928bded5b313c27', 22, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('62c8dbf388483ae26b9f3eb3aacf8105b63b', '24bb6981131931d73aabea3f4eda805574ff', 85, '4.52.20.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('62de86a93dac852d6f0a61698b0f9d951d0f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 106, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('62e2cde251bfab436b6a0af4c6f1aee193fa', '24bb6981131931d73aabea3f4eda805574ff', 144, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('62eec17c59ff1a8a47fca3973bb73a742f21', '358ea4bf860ce17393ae5614aaa4afb2badd', 45, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('630314e39e0a38dbcc0bb269fbec18924cc5', '638f9ef95d6caead52d42928bded5b313c27', 12, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6305217d50f7c72629eeec18a9f16d5f7e15', 'feebca0c3e1e178553fecb7f905a4accbdf8', 117, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('631e7076113ddab6b218e4c003ae7fee5e43', '484675c0690c147bc1ab990858241f65d704', 209, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('63a248f31f7f1b8bc0bd63e055843871db93', '358ea4bf860ce17393ae5614aaa4afb2badd', 29, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('63c5b9bf23176d5587411e98f17f9272686c', '638f9ef95d6caead52d42928bded5b313c27', 166, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6416841f9e33d975a808b96cb800db03fca5', '484675c0690c147bc1ab990858241f65d704', 262, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('649413150e9cf2c51a9229ea48bd07c2abcd', '884f92440f11ea3f826310c4bcf9442908ec', 107, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('64ad02f30b4b48dbfbc70c83cc378e5f4d88', 'feebca0c3e1e178553fecb7f905a4accbdf8', 52, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('650c391d49f1956e7faef2d6d61937ced7b3', '884f92440f11ea3f826310c4bcf9442908ec', 148, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6514bb4bd3c7d5d94a651b1c65c618c56ab2', '358ea4bf860ce17393ae5614aaa4afb2badd', 255, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('655861b068582918051319799e9aaa2739ba', '638f9ef95d6caead52d42928bded5b313c27', 72, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('656639aa6fc8265d676987ea6c95b9466f35', '24bb6981131931d73aabea3f4eda805574ff', 89, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6566f6bce68880c2dc018ba4aef2b6af2e6d', '484675c0690c147bc1ab990858241f65d704', 65, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('656b06c1235802465b812a84491e0401192a', '638f9ef95d6caead52d42928bded5b313c27', 54, '4.52.19.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('659900cac1983c6782fc940a31a3cbf6dc77', '358ea4bf860ce17393ae5614aaa4afb2badd', 190, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6611cf2f66a690f9b9acef7e99880a223f09', '884f92440f11ea3f826310c4bcf9442908ec', 188, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6626f1809de672ba1b4506c8cfd607b11a97', '884f92440f11ea3f826310c4bcf9442908ec', 170, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('66355e56f557672c06e2ca77682ab6da5858', 'feebca0c3e1e178553fecb7f905a4accbdf8', 163, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6668a3d4990d5f61ef5d75b73a3464e94a08', '24bb6981131931d73aabea3f4eda805574ff', 102, '4.52.20.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('668195abf07a0805c1a589712783004d1294', '638f9ef95d6caead52d42928bded5b313c27', 325, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('668606e6b55d905965aa9e517b6b9cc4ba16', '884f92440f11ea3f826310c4bcf9442908ec', 129, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('66cf8d942d3619550fd295fe5da7bb8bc86d', '24bb6981131931d73aabea3f4eda805574ff', 290, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('66da0a6be473dc0068d13aab1e24362abf89', '358ea4bf860ce17393ae5614aaa4afb2badd', 257, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('66e3fe0f6901232176f4e867a5a17f48fc51', '884f92440f11ea3f826310c4bcf9442908ec', 327, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('66e47856901796e965b209a7153fe2abd733', '358ea4bf860ce17393ae5614aaa4afb2badd', 230, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('66f6949c4527ea4b8bd1cb98dffb847b1a5a', '638f9ef95d6caead52d42928bded5b313c27', 127, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('66fbd34c7cbbc3a3417d04b6fc360808df32', '24bb6981131931d73aabea3f4eda805574ff', 223, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('670d57ee6c3905fd75f1a3a6b08766007f5a', '358ea4bf860ce17393ae5614aaa4afb2badd', 292, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('674cfb161c68d144246b3a5b2dee680b5532', '358ea4bf860ce17393ae5614aaa4afb2badd', 312, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('67517773eb49ce9856290e93ed310488f736', 'feebca0c3e1e178553fecb7f905a4accbdf8', 299, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6751a0b55973e586126724f110cc2da943d0', '484675c0690c147bc1ab990858241f65d704', 198, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6752f9c6f806c911d525ef234e5b12750c5d', '484675c0690c147bc1ab990858241f65d704', 260, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('67676832a4d3a84ac73b5287f621506978b2', '358ea4bf860ce17393ae5614aaa4afb2badd', 58, '4.52.19.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6777f23bf59822856369316eb13424ce7b15', '484675c0690c147bc1ab990858241f65d704', 77, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('67847186e0f637e8c3b0928fdc5a1c17fcc7', '24bb6981131931d73aabea3f4eda805574ff', 295, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('67a523efb2b4909db45970914f6ea5707400', '638f9ef95d6caead52d42928bded5b313c27', 136, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('67c42f23d1466c12e2675c948818628504f2', '358ea4bf860ce17393ae5614aaa4afb2badd', 279, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('67e378319b2d9007f7c285e3bcc7d110b9b6', '638f9ef95d6caead52d42928bded5b313c27', 201, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('67fdda0189e5a255b72e8ffe8485f143bdbd', '638f9ef95d6caead52d42928bded5b313c27', 152, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('68060f41f6cf717828d9d18d7e8202170272', '884f92440f11ea3f826310c4bcf9442908ec', 76, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('680c1c2eef0a22235098e0c814844d08f8fa', '638f9ef95d6caead52d42928bded5b313c27', 70, '4.52.20.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('682c910df01f0cd216d090ad4588d439dcbb', '638f9ef95d6caead52d42928bded5b313c27', 302, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('682ced5c2c7d03d2b18e4cf2ee79b0c35083', '484675c0690c147bc1ab990858241f65d704', 236, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('68499b2dccb39e53ed069948453263628f22', '24bb6981131931d73aabea3f4eda805574ff', 25, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('684d7250761db66be6c90a640d557264d16c', '24bb6981131931d73aabea3f4eda805574ff', 134, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('686db5a5ee840cec3bbc7362a7a703bab0c3', '358ea4bf860ce17393ae5614aaa4afb2badd', 35, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('68732a73740e95b6ada8572e4bd065742b33', '358ea4bf860ce17393ae5614aaa4afb2badd', 220, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('68cd52bff8795e1c433fbf263ba8a387f1ef', '24bb6981131931d73aabea3f4eda805574ff', 293, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('68dad7d77dd57ef55f79c410c87f9e417d03', 'feebca0c3e1e178553fecb7f905a4accbdf8', 63, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('68eabd3484e84ab461b266660fd196d23d56', '638f9ef95d6caead52d42928bded5b313c27', 124, '4.52.21.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('68ee3448d7def02f1e33b16d466d5abed51a', '484675c0690c147bc1ab990858241f65d704', 233, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6900a5191af400805e93b26238edbbfde56f', '358ea4bf860ce17393ae5614aaa4afb2badd', 285, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('691aebf593aeac4d0a693c0e82a806aa8e4d', '358ea4bf860ce17393ae5614aaa4afb2badd', 143, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('692a77dd647f623462afb81b56b533eacccc', '638f9ef95d6caead52d42928bded5b313c27', 253, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6939c2a436599106439f32eb13f1c9ad7847', '358ea4bf860ce17393ae5614aaa4afb2badd', 290, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6979d6a8dfa6bddb30413e5a50b327f9b0ae', 'feebca0c3e1e178553fecb7f905a4accbdf8', 205, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('69b046f6cb70794e170b8d662c622ecbb404', '358ea4bf860ce17393ae5614aaa4afb2badd', 182, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('69cde677e6eea514598249a42b42c9d4c880', '638f9ef95d6caead52d42928bded5b313c27', 280, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('69e0623255c90e2c9016040ede9efcbe2785', '484675c0690c147bc1ab990858241f65d704', 159, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6a1a333ffb9f4c6538a7fc95119c94917d48', '24bb6981131931d73aabea3f4eda805574ff', 138, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6a73f0451f90aa96a2918521d1086ddc56ea', '358ea4bf860ce17393ae5614aaa4afb2badd', 108, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6a9510a192cce2b7818890b390948cdbe51b', '884f92440f11ea3f826310c4bcf9442908ec', 83, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6aadfe08bc9de5f76ca69d504211cbbe222c', '24bb6981131931d73aabea3f4eda805574ff', 323, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6accd827cb082090b4b32ab6f7533209c3db', '484675c0690c147bc1ab990858241f65d704', 135, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6ad6ca338a694d5ddd435d9aeb2ce9118223', 'feebca0c3e1e178553fecb7f905a4accbdf8', 46, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('6ad94f8259041eea9cf0fb165d0d26b38666', '24bb6981131931d73aabea3f4eda805574ff', 150, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6b059e9f8d219abf488a07e5ea4ae78bd5aa', '638f9ef95d6caead52d42928bded5b313c27', 330, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6b5d0fa4cbf849c39477328ad3ff123ebd8e', '24bb6981131931d73aabea3f4eda805574ff', 108, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('6bbfb829973a1fc592464f7170e8f00c42ba', '638f9ef95d6caead52d42928bded5b313c27', 271, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6c0e3a0dec66c1e8513f53658bec1582eda1', '484675c0690c147bc1ab990858241f65d704', 114, '4.52.20.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6c101d88363daf3eaf64fc3d4168847673e6', '884f92440f11ea3f826310c4bcf9442908ec', 165, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6c66efac2efe5fcd43bd121834e51858d90b', '358ea4bf860ce17393ae5614aaa4afb2badd', 291, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6c7c62ffc67b3e0808b173c255afcffe8424', '638f9ef95d6caead52d42928bded5b313c27', 219, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6cf79cfef1bd346051f9bcb46f8410b02225', '884f92440f11ea3f826310c4bcf9442908ec', 245, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6d1460da902324dcd9bbb05bcde6b07f13a0', '884f92440f11ea3f826310c4bcf9442908ec', 276, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6d1ea40ecfa44745d09b6729641534dd45cf', '484675c0690c147bc1ab990858241f65d704', 63, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6d8875a67f733f77bdb2aa7204eb5d047e84', 'feebca0c3e1e178553fecb7f905a4accbdf8', 169, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6d965a0c033130436f384f87f1d556b31aa4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 176, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6ddd2328cbc17785722001c2178ad99cd302', 'feebca0c3e1e178553fecb7f905a4accbdf8', 62, '4.52.19.1.21', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.21\",\"nama\":\"NUR NELISA ADAH\",\"judul_jurnal\":\"Pemberdayaan UKM Olahan Ikan Di Kelurahan Plalangan Melalui Perbaikan Pengembangan Pakan Mandir\",\"level_jurnal\":\"reputable_international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat\",\"penulis\":\"Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati, Nur Nelisa Adah\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/4547\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('6e11119c3861ab364ded17864085476944bc', '358ea4bf860ce17393ae5614aaa4afb2badd', 102, '4.52.20.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6e1519b74171be562133fd10b7b47fc41549', '358ea4bf860ce17393ae5614aaa4afb2badd', 46, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6e2d7e45266590376a5f6930bebad4d5239a', '638f9ef95d6caead52d42928bded5b313c27', 46, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6e43874bc701be06efd37a6709c86a03ab40', 'feebca0c3e1e178553fecb7f905a4accbdf8', 208, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('6e49eddde5b9a3f036b702a6879f66784288', '884f92440f11ea3f826310c4bcf9442908ec', 177, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('6ee9976085a6c0c3e0015fe419c85217ae54', '484675c0690c147bc1ab990858241f65d704', 40, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6efe7428bc815be1f804f82244554444c9a0', '484675c0690c147bc1ab990858241f65d704', 290, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6f0659313330dbd2fbe2486da01953d9654a', '638f9ef95d6caead52d42928bded5b313c27', 43, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('6f0d6ae09c9c8d3cacf906bc533989cc8784', '358ea4bf860ce17393ae5614aaa4afb2badd', 269, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('6f8389c59551c4446bf139ceee0ffa7dec43', '484675c0690c147bc1ab990858241f65d704', 140, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('6fdc4bac6c16015cece90b298b6d5d90ddaf', '24bb6981131931d73aabea3f4eda805574ff', 30, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('702975f8be782f6cef18cdbc745a3dd3d038', '638f9ef95d6caead52d42928bded5b313c27', 115, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('70379739142a97ec7f70dfdcb4d6ae7d0ddd', '638f9ef95d6caead52d42928bded5b313c27', 51, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7060a5d4ee8e90c95bbf67a51fd80cab0cad', '638f9ef95d6caead52d42928bded5b313c27', 242, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7069ea521c2c2bcef64a278d0228107054d9', '358ea4bf860ce17393ae5614aaa4afb2badd', 208, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('707d7694d5f486a5f06d2261ba3293daff95', '638f9ef95d6caead52d42928bded5b313c27', 37, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('70f9a39a6bfb109a28ce8024f3d8a38a8c6d', '884f92440f11ea3f826310c4bcf9442908ec', 127, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7137d1cbd413061cb23be062f2712712a849', '638f9ef95d6caead52d42928bded5b313c27', 232, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('715bf5d435058f4c383fd3d5a047596e6538', '358ea4bf860ce17393ae5614aaa4afb2badd', 266, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('716040e00d092ded9791a350418be391df28', '358ea4bf860ce17393ae5614aaa4afb2badd', 131, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('716b12bf6876e0a96d3af5e30bd9b25b2db6', '24bb6981131931d73aabea3f4eda805574ff', 113, '4.52.20.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('716baa286be1ef82625e7bade472a6f5adcd', '484675c0690c147bc1ab990858241f65d704', 252, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('717e3053c9a8f5dfa7d16475f1feef00affa', '484675c0690c147bc1ab990858241f65d704', 12, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('718e6af16c79fdd3ac9951a83e231a544a04', '484675c0690c147bc1ab990858241f65d704', 321, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('71a8b7a7587751e8f503156ac995e8af9393', '484675c0690c147bc1ab990858241f65d704', 332, '45219006', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('71c9745175444eee513d1ddd4d427077d134', '484675c0690c147bc1ab990858241f65d704', 285, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('71f4fe1138aec332a3f2578642e6a23bef0d', '638f9ef95d6caead52d42928bded5b313c27', 287, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('71f6944862395752cea05a6e047bfad857c4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 283, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7238924f95faa4a386d0b2b1beafb1515098', '358ea4bf860ce17393ae5614aaa4afb2badd', 183, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7279b5d8aa126ecf7234d29485d0f69dcdd4', '884f92440f11ea3f826310c4bcf9442908ec', 234, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('72828a6821d4095495e36522467f7e81b258', '638f9ef95d6caead52d42928bded5b313c27', 226, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('72a90dbd3d3cf74e97775ef202057b2b59a1', '24bb6981131931d73aabea3f4eda805574ff', 262, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('72ab05dbe630ee6d99ac979f7bbc9f3878a6', '638f9ef95d6caead52d42928bded5b313c27', 172, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('72d14ed810c541fcc14fdaf33dfaa68768e8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 241, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('72eb22be0ca49f78d0c8a77f0478fb6bdd5c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 129, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('72fd006a80c06c39d8676aa0c0d4af13cbdc', '484675c0690c147bc1ab990858241f65d704', 146, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('72fdf164e5305a93b1008547754db9d6fc45', '24bb6981131931d73aabea3f4eda805574ff', 230, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('730aa22ba2b5f0be299072ac7cc83b78a8cf', '24bb6981131931d73aabea3f4eda805574ff', 9, '4.52.18.0.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"judul_jurnal\":\"ajda\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":null,\"tahun_publikasi\":2022,\"nama_jurnal_konferensi\":\"ajda\",\"penulis\":\"ad\",\"url_publikasi\":\"https:\\/\\/arsipmhs-abt.com\",\"deskripsi\":null}', '2026-03-06 09:48:47'),
('731125a6986786fb7a5d9fb103afaa3878ad', '24bb6981131931d73aabea3f4eda805574ff', 128, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('733878cc906f9446b036b712efabfa2ca1a4', '638f9ef95d6caead52d42928bded5b313c27', 225, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('736a53e7e6dc19c0c8242f9147e9db59014a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 141, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7374f610f13451e363988275b4a6de25bd0e', '24bb6981131931d73aabea3f4eda805574ff', 15, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('737a8e91d43223f5f926921f435bf6a090fe', '24bb6981131931d73aabea3f4eda805574ff', 66, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('73af34c5709e929afa19240ac12660524a99', '884f92440f11ea3f826310c4bcf9442908ec', 176, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('73d256aecda10298a219d194fb27cbe54161', 'feebca0c3e1e178553fecb7f905a4accbdf8', 13, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('73e348408ef35fc44d29acf268b0d91ddc4a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 51, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('73e7ce726e3d662febfe0cf6ce55f85ac3df', 'feebca0c3e1e178553fecb7f905a4accbdf8', 298, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('74d8a178dbfd4c6f0350bb8b4295a82a719b', '638f9ef95d6caead52d42928bded5b313c27', 34, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('74de261e0bb027188f61af3d3603f8a2ecfa', '24bb6981131931d73aabea3f4eda805574ff', 300, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('74f798ed59c75f5503b1ec2aad1c3fd499a6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 248, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('74f804a7281de7df0ec41e6c3f916a797e4b', '484675c0690c147bc1ab990858241f65d704', 130, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('75153f6a153ef05448236058a299cd162952', '484675c0690c147bc1ab990858241f65d704', 36, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('7517afccacfa72ceeed81dda5c05b616ff19', '638f9ef95d6caead52d42928bded5b313c27', 145, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('751cc6e1570aa85c719a58975bbd1b934121', '484675c0690c147bc1ab990858241f65d704', 16, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('752a182b7028993d7a961c568cec2bdadb12', '24bb6981131931d73aabea3f4eda805574ff', 248, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('752bb795535e159f9605c9db12ccc78c4d36', '884f92440f11ea3f826310c4bcf9442908ec', 147, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('754375c909011db5183b945ad88257df7bbc', '358ea4bf860ce17393ae5614aaa4afb2badd', 88, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('754b0dd5b04c1360f402749d83b135217c5f', '24bb6981131931d73aabea3f4eda805574ff', 182, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('757ccf8bb31f8f960af9efce1ed160700b85', '24bb6981131931d73aabea3f4eda805574ff', 178, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('75a217306c0689b8496d6a6caecdc91b6438', '884f92440f11ea3f826310c4bcf9442908ec', 69, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('75d958ff314fdafe1f02ac591a8cdbea5923', '484675c0690c147bc1ab990858241f65d704', 165, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('760db88ffda3fc85059a9defb7b7753b65f2', '358ea4bf860ce17393ae5614aaa4afb2badd', 272, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7635171d4946978c5d04f40e3d90ac0831c9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 292, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('763c32de2493e26ee8dba2c4f8c17e08abdf', '24bb6981131931d73aabea3f4eda805574ff', 216, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('76678c876678d90f83107b519ecfeb5376dc', '358ea4bf860ce17393ae5614aaa4afb2badd', 288, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7683416ab34432a38d8b12c242bb4da48654', '484675c0690c147bc1ab990858241f65d704', 25, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('76c829fd2603a7d313078ce358954d1ce9c6', '638f9ef95d6caead52d42928bded5b313c27', 44, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('76df29f1dc1a3d885e1ac4b1755930876ea8', '24bb6981131931d73aabea3f4eda805574ff', 91, '4.52.20.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('76f31ba413437f72d2345c9cc78db5431ca1', '484675c0690c147bc1ab990858241f65d704', 107, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('77197bd70fc309d5ed0274c46b4f830f7b80', 'feebca0c3e1e178553fecb7f905a4accbdf8', 320, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('774926284462559b5e9e6eff32a14cdad600', '884f92440f11ea3f826310c4bcf9442908ec', 152, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('774a38be71485ba1096b37eace8d08a2decd', '484675c0690c147bc1ab990858241f65d704', 69, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('774b433b7821e2e2c74d37a9ae7b1f5c60eb', '24bb6981131931d73aabea3f4eda805574ff', 180, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('775e9b0cdac114a96bdabd01068c99adaf1a', '484675c0690c147bc1ab990858241f65d704', 153, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('776262c679da137607cfd4206d0cad6320f0', '24bb6981131931d73aabea3f4eda805574ff', 271, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('7768061379d740a7aa1a3558cccb7676b1e1', '484675c0690c147bc1ab990858241f65d704', 128, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('776dbf68e5227c7dab7a55cd28caecf56fec', 'feebca0c3e1e178553fecb7f905a4accbdf8', 314, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('77831d1d026b59655ca1637fec0d7e622af7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 26, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('77894e1d4a2bfa14bb570d04f674331e2f8c', '638f9ef95d6caead52d42928bded5b313c27', 147, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('77ac498d638ebd8a434154fffed70ff5e9a5', '24bb6981131931d73aabea3f4eda805574ff', 51, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('77f22ac6ddec3c0101e1ad86d4d4c8e27f2d', '484675c0690c147bc1ab990858241f65d704', 180, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('781dea3b62d3439c52977dfef6028eeeda5e', '638f9ef95d6caead52d42928bded5b313c27', 88, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('78455a8628e4d137e66377c23ed0abeb3756', '24bb6981131931d73aabea3f4eda805574ff', 37, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('785b833014ff7c12e2b290b6ce99615bef11', '884f92440f11ea3f826310c4bcf9442908ec', 259, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('78621ea83265a2908dbbd8c47bad035580e1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 219, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7870bfd6567ff562746f7b65bd1c1af257e6', '884f92440f11ea3f826310c4bcf9442908ec', 322, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('78facdb82ad464dc79975f180ca4e3892314', 'feebca0c3e1e178553fecb7f905a4accbdf8', 180, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('79040992840122388333727db531330934e5', '484675c0690c147bc1ab990858241f65d704', 237, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('7954c5ac8901423a72b22ef724f159798e76', '358ea4bf860ce17393ae5614aaa4afb2badd', 159, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7958024216430865fbbc3e28b57b5c4b8fd8', '358ea4bf860ce17393ae5614aaa4afb2badd', 135, '4.52.21.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('799668dd2abb1dc82547fba965ca5999a1c1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 198, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('79a31ee2b4d42a1678a65100b6a007a21a8a', '638f9ef95d6caead52d42928bded5b313c27', 215, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('79a6296f376600fb4c03c8875e885dfe1e7f', '638f9ef95d6caead52d42928bded5b313c27', 165, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('79a9d78beb60174abfa16316aa303a20c1c7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 130, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('79b5966db1efa65d45c948a69057caf64a79', '638f9ef95d6caead52d42928bded5b313c27', 307, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('79be93bdfeb034afee99cbdcd05726934def', '24bb6981131931d73aabea3f4eda805574ff', 92, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('79bf34f2bc5f288502b6c3062c7e680e54bd', '358ea4bf860ce17393ae5614aaa4afb2badd', 212, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('79e6786e431af661c96277f36c4a4a3bf31c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 160, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7a0f2fca0da5abb8d2cf45c1d077bd029728', 'feebca0c3e1e178553fecb7f905a4accbdf8', 99, '4.52.20.0.29', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.29\",\"nama\":\"VHIELA EKA PRAMITASARI\",\"judul_jurnal\":\"Influence Of Customer Experience, Perceived Value, and Trust on Repurchase Intention on BRT Trans Semarang Users\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"JOBS\",\"penulis\":\"Vhiela Eka Pramitasari, Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6230\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('7a1a59c134a692512424abf501cd051737c3', '358ea4bf860ce17393ae5614aaa4afb2badd', 15, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7a259e22d52101f76dea6d23ef38adb0a1b1', '638f9ef95d6caead52d42928bded5b313c27', 56, '4.52.19.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7a33b6444cec36267855a129e7428c34146e', '638f9ef95d6caead52d42928bded5b313c27', 311, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7a7ad5c98b858639dab9ea42861ad7d13a24', 'feebca0c3e1e178553fecb7f905a4accbdf8', 76, '4.52.20.0.06', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.06\",\"nama\":\"ATHAYA AURELLIA RIFANI\",\"judul_jurnal\":\"Influence of Customer Experience, Brand Ambassador, and Perceived Value On Customer Loyalty Of Somethinc\\u2019s Consumer In Semarang\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rustono - Rustono, Noor - Suroija\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"JOBS\",\"penulis\":\"Athaya Aurellia Rifani, Rustono - Rustono, Noor - Suroija\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6224\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('7a98be833b8e2a71c3434739940cba639c91', '358ea4bf860ce17393ae5614aaa4afb2badd', 14, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7abfa7f989aaf05485c6d9683d63af141756', '358ea4bf860ce17393ae5614aaa4afb2badd', 323, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7acd18b6a8874b16560a1acbeb73344451dd', '638f9ef95d6caead52d42928bded5b313c27', 171, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7ae495f15c1a4305ea6851ad0777d292c8d8', '638f9ef95d6caead52d42928bded5b313c27', 320, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7b7e914a0a1d2e3d3eafc9cd8ec4121d749f', '358ea4bf860ce17393ae5614aaa4afb2badd', 105, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7b858a07433d72a8e3f6d9da2b7fab0f7b66', 'feebca0c3e1e178553fecb7f905a4accbdf8', 97, '4.52.20.0.27', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.27\",\"nama\":\"SAPNA PUTRI HANDAYANI\",\"judul_jurnal\":\"Influence of Celebrity Endorsement, Electronic Word of Mouth, Perceived Quality on Purchase Decision of Scarlett Whitening Consumer\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Irawan Malebra\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"JOBS\",\"penulis\":\"Sapna Putri Handayani, Irawan Malebra\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6583\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('7bae0456be4a147c03bb306ea7a494a96577', '884f92440f11ea3f826310c4bcf9442908ec', 182, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7bc1b00fd1c823b5d6412b6720f6333a65c3', '24bb6981131931d73aabea3f4eda805574ff', 24, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('7c0bf3a645895bcba393aa32c2125eda0459', 'feebca0c3e1e178553fecb7f905a4accbdf8', 94, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7c1eda0a9b2b3efe794270c7836740ba1ca7', '358ea4bf860ce17393ae5614aaa4afb2badd', 249, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7c1fa5155904cb86cf5752333dd426cda3ad', '884f92440f11ea3f826310c4bcf9442908ec', 145, '4.52.21.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7c5b7ab1b6b9ec6985b3f6ce6df3522520ff', '884f92440f11ea3f826310c4bcf9442908ec', 122, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7cad4957a9d382193cbefc934f892bbd6312', '358ea4bf860ce17393ae5614aaa4afb2badd', 122, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7cf05d29e54629478b0db7d4809ff9213308', '638f9ef95d6caead52d42928bded5b313c27', 9, '4.52.18.0.03', 'error', 'URL publikasi jurnal tidak valid.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"judul_jurnal\":\"ajda\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":null,\"tahun_publikasi\":2022,\"nama_jurnal_konferensi\":\"ajda\",\"penulis\":\"ad\",\"url_publikasi\":\"ed\",\"deskripsi\":null}', '2026-03-06 09:48:01'),
('7d3cd17b6c16fe3ba69a562af7c9669898ca', 'feebca0c3e1e178553fecb7f905a4accbdf8', 19, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('7d46e9be25b040464f60f1c9c4d824511e0b', '884f92440f11ea3f826310c4bcf9442908ec', 243, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7dcf24e1ff3a6c6bfa0f6428fb4c7d633384', 'feebca0c3e1e178553fecb7f905a4accbdf8', 132, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7de046eaa6d30a7f49030e343e444be977c2', '358ea4bf860ce17393ae5614aaa4afb2badd', 82, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7e2fe7345fa5bb59f6fd4ed2871e528a2fd9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 34, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('7e3c4d2a66550f43a62da1c0afabbbfd94fe', 'feebca0c3e1e178553fecb7f905a4accbdf8', 190, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7e6d2dcf7d87b55224dd7ed1922c30a48a59', 'feebca0c3e1e178553fecb7f905a4accbdf8', 29, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('7e853a9c708dcb5cb2aabca9f8320810848c', '484675c0690c147bc1ab990858241f65d704', 151, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('7ec9c652710cfd2357a4e7e93f26e14d61f6', '884f92440f11ea3f826310c4bcf9442908ec', 180, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('7edee72f59a47d2ed7de504f22fbaaf20e20', '638f9ef95d6caead52d42928bded5b313c27', 179, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7ef797468bdf0aad066b27a84f5d211cea2b', '358ea4bf860ce17393ae5614aaa4afb2badd', 151, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7f13335077a27c937cf7975ac371f4af3f36', '638f9ef95d6caead52d42928bded5b313c27', 182, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7f2b13751c5865e85e879bc747616d0ac2b4', '358ea4bf860ce17393ae5614aaa4afb2badd', 309, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7f3c6048548a1b4fbf131a7494021f401bbf', '638f9ef95d6caead52d42928bded5b313c27', 293, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7f44b76e5f27f5cb65bda56e39a508728e1a', '358ea4bf860ce17393ae5614aaa4afb2badd', 31, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7f578e6d4f82678524a7f8348b9c2f825668', 'feebca0c3e1e178553fecb7f905a4accbdf8', 197, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('7f64acde00a9c4a637e2ced08a5d6ffc87ec', '24bb6981131931d73aabea3f4eda805574ff', 69, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('7f68eed66aa2888687934ba4234effb7138d', '638f9ef95d6caead52d42928bded5b313c27', 285, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('7f73abe3b675d94701035803e67721ebcc12', '358ea4bf860ce17393ae5614aaa4afb2badd', 289, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('7fb18c4c6db6cfb89e96c07507541baec77d', '484675c0690c147bc1ab990858241f65d704', 249, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('804b0300680061d8605863adf37da862f422', '484675c0690c147bc1ab990858241f65d704', 89, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('804c3e8d0178b0fe2effdf0395208011a9bf', '484675c0690c147bc1ab990858241f65d704', 100, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('804cdb5703a0b60fdf5d01368027423e4367', 'feebca0c3e1e178553fecb7f905a4accbdf8', 319, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8064bbba13918ee59057cbef788ea343849f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 77, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('808d57762bfe497c6aae959801344b15b7f8', '484675c0690c147bc1ab990858241f65d704', 136, '4.52.21.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('80a186bf7cf1b51cca904ca06f7e9e337270', '884f92440f11ea3f826310c4bcf9442908ec', 197, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('80bc564b66d78c02581c9d3ca88d82acb8a5', '484675c0690c147bc1ab990858241f65d704', 117, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('80e1564e0f97ae407fceb3683df034832ddf', '24bb6981131931d73aabea3f4eda805574ff', 64, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('80f3c083239c66b21353e20364be743a5258', '24bb6981131931d73aabea3f4eda805574ff', 49, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8171cbae8875b2437828bbf39d764654161d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 114, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('81d52c594ae11fe3d0d4493a5f55a4d98098', '884f92440f11ea3f826310c4bcf9442908ec', 287, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('81de7c89589b997abe048405904b3da9912e', '638f9ef95d6caead52d42928bded5b313c27', 270, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('82073f7a4090030670d27724c3eb7e59e717', '884f92440f11ea3f826310c4bcf9442908ec', 267, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('826eb31cc41d1f726c8a412a9de6eac1b2ba', '358ea4bf860ce17393ae5614aaa4afb2badd', 111, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('827f36e55273f1df5a450e065f4747278554', '884f92440f11ea3f826310c4bcf9442908ec', 86, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('829a79944b5474980de6aefe4c382e32adc2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 240, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('830699588bcc2d7dfd9479132f557f7c7612', '638f9ef95d6caead52d42928bded5b313c27', 85, '4.52.20.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8328b400af3619f3f0845cab798780fa6eab', '884f92440f11ea3f826310c4bcf9442908ec', 67, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('83387034b020784d7115ef9363bc8552382e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 102, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8344d6c18640c54477d444544034c0461a27', 'feebca0c3e1e178553fecb7f905a4accbdf8', 12, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('8352973f0c2cbe5702d1ee8b368cb11f4773', '638f9ef95d6caead52d42928bded5b313c27', 109, '4.52.20.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('836074516632192ebf0d79622487063679b8', '638f9ef95d6caead52d42928bded5b313c27', 40, '4.52.19.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('83731021a05265ec978340cb37b6ca02fc8b', '884f92440f11ea3f826310c4bcf9442908ec', 300, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8374f3f6008a8998e73d8167254220735a94', '24bb6981131931d73aabea3f4eda805574ff', 136, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('83928d1f22a142945700787e0231bfdb9249', '358ea4bf860ce17393ae5614aaa4afb2badd', 320, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('839801edae53bb95a159b960569c9cf33d76', '484675c0690c147bc1ab990858241f65d704', 190, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('839ed41db85f5f5d1901d8e7b21dd210d6cf', '638f9ef95d6caead52d42928bded5b313c27', 202, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('83c2d7da6b881d818ac48edc112d3741d91b', '358ea4bf860ce17393ae5614aaa4afb2badd', 250, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('83eb1ca8d9cec00b6af650d4f8eb558d833a', '484675c0690c147bc1ab990858241f65d704', 320, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8433b55f88fedfb8b5742e37279426f3c2d8', '24bb6981131931d73aabea3f4eda805574ff', 112, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('84471f654b34435ca6463ecf4430ecf0abb1', '884f92440f11ea3f826310c4bcf9442908ec', 114, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8451b47b0b886c3bbac4591ccf7a208e9de2', '884f92440f11ea3f826310c4bcf9442908ec', 94, '4.52.20.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8465c520b09dc7a98f251f0aaf163a6c4f0c', '24bb6981131931d73aabea3f4eda805574ff', 36, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('84aa585ff5622cf42a79fe2be6ee730b1de8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 157, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('84bee20f2c2befc30eda3bd0a37feb7eb7fd', '884f92440f11ea3f826310c4bcf9442908ec', 104, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('85078d855ed905922e6f96d4708a63203f40', '358ea4bf860ce17393ae5614aaa4afb2badd', 327, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8517c51885f0f6c5301870069cbfefc8f22d', '638f9ef95d6caead52d42928bded5b313c27', 295, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('851fdee64e8d6443db9c015dd41d9d9602f0', '24bb6981131931d73aabea3f4eda805574ff', 294, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('85643ef7ce720f1637a90072128b13a6b4fb', '484675c0690c147bc1ab990858241f65d704', 141, '4.52.21.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('858a543142d50b74f0c9e0f707c08b82988a', '484675c0690c147bc1ab990858241f65d704', 99, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('859cee0494acc7e55788da4659ba7820e6f9', '638f9ef95d6caead52d42928bded5b313c27', 199, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('85c216359c70baafca916b499a6f7448f001', '884f92440f11ea3f826310c4bcf9442908ec', 231, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('85dcdd65c3fdb63b62738e0ecc4ff44635f7', '24bb6981131931d73aabea3f4eda805574ff', 166, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('85f6aec8575a102a5693aa0efc774187e4c0', '884f92440f11ea3f826310c4bcf9442908ec', 98, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8600b08a4d1f082170b72f90b076ebcf1ef7', '484675c0690c147bc1ab990858241f65d704', 61, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('861f9025d77e1090f332e267f6fcc921a4e5', '484675c0690c147bc1ab990858241f65d704', 105, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('863203a943d3304a60b2df74c678568eec66', 'feebca0c3e1e178553fecb7f905a4accbdf8', 164, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('865334a0eb04c9dce31fc391d08b1f49fbe4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 54, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('866172376d86d44851e17100b78c70c33d6b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 213, '4.52.23.8.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.23.8.03\",\"nama\":\"DITA RATNA SARI\",\"judul_jurnal\":\"Influence of Price Increases, Product Availability, and Service Quality on Consumer Satisfaction (A Case Study at LPG 3 Kg Distribution Point Yulianto, agent of PT Mita Ereska, Semarang Regency)\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Sri Wahyuni, Paniya\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"Admisi Dan Bisnis\",\"penulis\":\"Dita Ratna Sari, Sri Wahyuni, Paniya\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/admisi\\/article\\/view\\/7013\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('866d9507f9976a6e1bc192fbfa81a6cb62ac', '884f92440f11ea3f826310c4bcf9442908ec', 169, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('86c2192ee57af1bf1d8983e03a4bcbf46891', '358ea4bf860ce17393ae5614aaa4afb2badd', 199, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('86c94e12095d1f1de2b790d418e447dfa6a9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 67, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('870286fc4e65a33f376be2c88d0ad1200fed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 101, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('870c3eb3af0af2bc248676b94687eacb1010', 'feebca0c3e1e178553fecb7f905a4accbdf8', 260, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('87112ac4863d62b4d6871944bb34f180cfc2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 236, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8722ca01cd03b33732c227337eefe50b6191', '484675c0690c147bc1ab990858241f65d704', 224, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('87306b33c5e3380bbf4bc9d5f47ad4f93622', '358ea4bf860ce17393ae5614aaa4afb2badd', 65, '4.52.20.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('874e6ff6a7b6c5535f2f11f08cdf7868dae1', '358ea4bf860ce17393ae5614aaa4afb2badd', 276, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('87930f3d41d2226120337a5d73c80d38bd74', '638f9ef95d6caead52d42928bded5b313c27', 230, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('881495c4406465522ce3c38e3a61bbed1519', '484675c0690c147bc1ab990858241f65d704', 90, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('88307e0e477268b2ccc17c5aa433868e7020', '358ea4bf860ce17393ae5614aaa4afb2badd', 39, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8859c554ab2e22ba18aa55963351fc2ee748', '638f9ef95d6caead52d42928bded5b313c27', 63, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('88a8d1b7867d87779e50174b868d4595800b', '358ea4bf860ce17393ae5614aaa4afb2badd', 127, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('88fcc3842fbdd82481fced5e252eee906470', '884f92440f11ea3f826310c4bcf9442908ec', 168, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8909f811747fe4561f3058347671028f52d4', '884f92440f11ea3f826310c4bcf9442908ec', 305, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('897315578025f8a4dd0e54e2a722839fb184', '884f92440f11ea3f826310c4bcf9442908ec', 253, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('898a22512c0379f5b8a848b348bfdd136309', 'feebca0c3e1e178553fecb7f905a4accbdf8', 151, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('898cd51de6dd9ba59407aee6490474684f9e', '484675c0690c147bc1ab990858241f65d704', 294, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('89f76fd177625cec23e06d090a42c93af74d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 300, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('89f8a213ffe32f56cd6660c9fadd1cf14285', 'feebca0c3e1e178553fecb7f905a4accbdf8', 178, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('89f96c468c9dbd3303c76be41507fb8bf37d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 50, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('8a141fcdf38e4c61a71c46149ad7afe4af1b', '638f9ef95d6caead52d42928bded5b313c27', 314, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8a32a9280d7c50dc14c8a5deadc933499f75', 'feebca0c3e1e178553fecb7f905a4accbdf8', 84, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('8a3577994851dde07744de4039cb0e901cf3', '638f9ef95d6caead52d42928bded5b313c27', 87, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8a4a9243fd92f22d9a844c7db2c7b5e689c3', '24bb6981131931d73aabea3f4eda805574ff', 330, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8a63042b03df75e7d489837d9b5c9b64ea93', '484675c0690c147bc1ab990858241f65d704', 207, '4.52.23.8.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8a6c0fb56e8faa2c43551a0c8c2fdc4a8268', 'feebca0c3e1e178553fecb7f905a4accbdf8', 223, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8aaa34e1f0f4d08f1397eca2264f3ed5866a', '638f9ef95d6caead52d42928bded5b313c27', 317, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8aaf3a1aa51535cbe21cc24804d612ed44d6', '884f92440f11ea3f826310c4bcf9442908ec', 237, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8ad810659d4feee8fd048ecfe434ee03e054', '484675c0690c147bc1ab990858241f65d704', 188, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8b016be2ff51454c3c364c6355d2903f7bb2', '358ea4bf860ce17393ae5614aaa4afb2badd', 142, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8b07be38dbd9b8e3e1dde64da5fcba227387', '484675c0690c147bc1ab990858241f65d704', 169, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8b33f3030535c9004db7f1aef5383e1d2e7f', '358ea4bf860ce17393ae5614aaa4afb2badd', 115, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8b34bf501e3f6991d41f595543b3d77b60b6', '484675c0690c147bc1ab990858241f65d704', 43, '4.52.19.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8b6bcc58d7519c45919722a0e38c1e3f7bc9', '484675c0690c147bc1ab990858241f65d704', 297, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8b876c84a9ab0c222974cc34ea584169e8c5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 96, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8b8d562a5b32fcb29ba276932f67f3809e68', '24bb6981131931d73aabea3f4eda805574ff', 255, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8bd6461a8dcebfc68c0d43ffbc06149069fa', 'feebca0c3e1e178553fecb7f905a4accbdf8', 305, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8be63967e5ecb71201a14e3feedd0a070694', '24bb6981131931d73aabea3f4eda805574ff', 281, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8c1fa059bd69064dc74963466d6392082e22', '24bb6981131931d73aabea3f4eda805574ff', 48, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8c48c91efd1629c6f1dcaf80ad7618b96c25', '884f92440f11ea3f826310c4bcf9442908ec', 329, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8c7ab99e45bc0d9c3bc1b7bd8ed90dbaa595', '638f9ef95d6caead52d42928bded5b313c27', 189, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8c80d34094226e237d245f803fe51cf1adcd', 'feebca0c3e1e178553fecb7f905a4accbdf8', 203, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8c82a40088ee1769601a357ae59a5693fa6b', '884f92440f11ea3f826310c4bcf9442908ec', 81, '4.52.20.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8c8c78c3e9ca31527aa81c156d723be5a6a0', '638f9ef95d6caead52d42928bded5b313c27', 236, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8cbfebb46fb207f8555a7c48030b3e4b4124', '484675c0690c147bc1ab990858241f65d704', 228, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8ce0b5e7947f0defc582c2b2694327780698', 'feebca0c3e1e178553fecb7f905a4accbdf8', 170, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8cf545f937e9df16bc204a784d87205614e2', '884f92440f11ea3f826310c4bcf9442908ec', 314, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8cf8644005d37dc02efeb587b58fc25a97bc', '638f9ef95d6caead52d42928bded5b313c27', 151, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8d2a274f4a07441050962488a250e63f0f82', 'feebca0c3e1e178553fecb7f905a4accbdf8', 311, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8d37e76d0fbfffe12c93fbbcda9221ad59da', '638f9ef95d6caead52d42928bded5b313c27', 211, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8d8001064e55e65f917f461295e0a7da3a12', 'feebca0c3e1e178553fecb7f905a4accbdf8', 239, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8d852119e636fa387495642b2f2a257bb885', 'feebca0c3e1e178553fecb7f905a4accbdf8', 44, '4.52.19.1.07', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.07\",\"nama\":\"DELLA AMAYLIA ASHARI\",\"judul_jurnal\":\"PERAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR DENGAN JOB SATISFACTION STUDI KASUS: PT PERTAMINA LUBRICANTS-PRODUCTION UNIT CILACAP\",\"level_jurnal\":\"national_non_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Inayah Inayah\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"BISECER (Business Economic Entrepreneurship)\",\"penulis\":\"Della Amaylia Ashari, Iwan Hermawan, Inayah Inayah\",\"url_publikasi\":\"https:\\/\\/ejournal.undaris.ac.id\\/index.php\\/biceser\\/article\\/view\\/443\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('8e342dcc37032ebfd7d23406a0a5c236a273', '484675c0690c147bc1ab990858241f65d704', 314, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8e350ea4c665596c7b590ab4d7780abb9707', '484675c0690c147bc1ab990858241f65d704', 47, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('8e436c10c2ae8280fb9b97a3f01bcf3dc278', '358ea4bf860ce17393ae5614aaa4afb2badd', 116, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8e588dbe2afe2e3b5f415ed39fc5f73b38bf', '358ea4bf860ce17393ae5614aaa4afb2badd', 237, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8e6c963bdae53ab6c9b6f5a2d88f9a263874', 'feebca0c3e1e178553fecb7f905a4accbdf8', 276, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8e78120c2c526998b561e1316e43ee1adb83', '358ea4bf860ce17393ae5614aaa4afb2badd', 313, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8ea509af70292d77ef3236a1d0128826dd32', 'feebca0c3e1e178553fecb7f905a4accbdf8', 127, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('8ebe78459dc9ebae82cb166de30b89e2434f', '638f9ef95d6caead52d42928bded5b313c27', 100, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8ece8d353464a1ac82ac2108a8780ff35152', '358ea4bf860ce17393ae5614aaa4afb2badd', 226, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8ed56858f07b6f46ebbed46b8daa26b7100b', '884f92440f11ea3f826310c4bcf9442908ec', 274, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('8efd56e722b2e43a1a3d7174ec060432039f', '24bb6981131931d73aabea3f4eda805574ff', 319, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8f354ff5a41f5add7c341491f5cfaeb1221c', '358ea4bf860ce17393ae5614aaa4afb2badd', 20, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('8f5783e4a8b2dd3abe4ba38ca450f9da1644', '638f9ef95d6caead52d42928bded5b313c27', 173, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8f603b5301d8e80645a065597f814d0ea214', '24bb6981131931d73aabea3f4eda805574ff', 101, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('8f7e3120b54e9ff15ccb813a776afe35220b', '638f9ef95d6caead52d42928bded5b313c27', 59, '4.52.19.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('8fa1f576201c6e71aab275b3a4da0985e478', '484675c0690c147bc1ab990858241f65d704', 215, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('903293fd379f9bc0bd5ebd4ffe67e66a7454', '884f92440f11ea3f826310c4bcf9442908ec', 275, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9033c4f9e24ab4d39265105af4af9bed63c4', '638f9ef95d6caead52d42928bded5b313c27', 24, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('905ac9d06b6172cbee7deaeaec4db65312d7', '358ea4bf860ce17393ae5614aaa4afb2badd', 259, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('905c15139ec1d4fb2b60fbe829094b74c5f1', '638f9ef95d6caead52d42928bded5b313c27', 167, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('90e9f53f521c683d25992b6490fd0382b05e', '358ea4bf860ce17393ae5614aaa4afb2badd', 32, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('913965e70c4c46caa60db08a4f3f2fb6eda2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 270, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('91510815e60ec6027ab11ea4b68cf2274b27', 'feebca0c3e1e178553fecb7f905a4accbdf8', 21, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('9152741bde02197b9464d2b8cef3022b8bff', '358ea4bf860ce17393ae5614aaa4afb2badd', 202, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9186369df1870c8dc3b8da487978fb663b30', '24bb6981131931d73aabea3f4eda805574ff', 164, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9193b4056cb477a6ebd68cdde68945e7a458', '358ea4bf860ce17393ae5614aaa4afb2badd', 305, '4.52.25.3.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9198afa36fdddbb1bc07ef0abedae6981676', '358ea4bf860ce17393ae5614aaa4afb2badd', 86, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('919b9ce77cbc776eebad11d464e9e412c74f', '638f9ef95d6caead52d42928bded5b313c27', 50, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('91ac6b05d4d5fedb887c4d67df2757e7515b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 162, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('91b8252979a2522c8efef25cd2c4eb7ec58b', '24bb6981131931d73aabea3f4eda805574ff', 331, '45219006', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('91b92c59b25e1cab1535f5922b093982c77d', '484675c0690c147bc1ab990858241f65d704', 154, '4.52.21.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('91c90af867bbfcde7e79f0c065d4abe33028', '884f92440f11ea3f826310c4bcf9442908ec', 174, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('91db5b91b3c79bfe0f0f3847686fe5c88d2c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 24, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('91dfd843cadeab601b8ac8d88b5ebf1fcc42', '638f9ef95d6caead52d42928bded5b313c27', 108, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('91e0774d80c49378b31e8c7b2b7421f4cebe', '484675c0690c147bc1ab990858241f65d704', 147, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('926954198fb5669067687f8455039c89e753', '884f92440f11ea3f826310c4bcf9442908ec', 18, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('927062371324fbcb6794f97ca4c43d5aea6b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 155, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('9272e1129a7b093ca61d38e07609311d07bf', 'feebca0c3e1e178553fecb7f905a4accbdf8', 166, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('927332922f5ee11a6a8e5c3822330f8aee19', '884f92440f11ea3f826310c4bcf9442908ec', 155, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('92ffa2946dc44b0e3115d31be9088786ec46', '484675c0690c147bc1ab990858241f65d704', 178, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9303e514bf89f54db64854a8438e8c29b037', '484675c0690c147bc1ab990858241f65d704', 31, '4.52.19.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('939fb80b0b680660c9bbd652557f7a1a0074', '24bb6981131931d73aabea3f4eda805574ff', 157, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('93f8aa23ed4a38ca7f5cf89fee0f6edc8112', '24bb6981131931d73aabea3f4eda805574ff', 152, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('93fab05ff0ebea4b53f5f667cc912c4f706c', '358ea4bf860ce17393ae5614aaa4afb2badd', 77, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('940ca064a235e2f8c7909d03bc47b928914e', '484675c0690c147bc1ab990858241f65d704', 29, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('942ddc7e01ee6a3a4039fa90b4790778492a', '484675c0690c147bc1ab990858241f65d704', 184, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('944df901f06c9ef7ca74351e3f310172aee1', '358ea4bf860ce17393ae5614aaa4afb2badd', 100, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9455d5b2b455e8e12f6cd4d876d340ea41ff', 'feebca0c3e1e178553fecb7f905a4accbdf8', 291, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('946b4b347352b1790bb7005bf5236fa3298e', '484675c0690c147bc1ab990858241f65d704', 225, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('947508a24fb9f15fda6f680ccfefebb801f4', '24bb6981131931d73aabea3f4eda805574ff', 140, '4.52.21.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('948dd3823b7a1e6855855a033bc2e50a8f77', 'feebca0c3e1e178553fecb7f905a4accbdf8', 173, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('94a96cb4277977399a9dba4774f188d2d122', '24bb6981131931d73aabea3f4eda805574ff', 148, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('94ace3b0a7ae973518a27278033c7e0d72d6', '24bb6981131931d73aabea3f4eda805574ff', 317, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('94c1f57d103b02f7fc10da5003ee17f47f48', '884f92440f11ea3f826310c4bcf9442908ec', 87, '4.52.20.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('94c7c570dba741c3e9bec19eae18c6ae2a70', '638f9ef95d6caead52d42928bded5b313c27', 183, '4.52.21.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('94eec780bbd224988cce887cb1ce03246d2f', '884f92440f11ea3f826310c4bcf9442908ec', 166, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('950abf8bbdf50a8cc81c23c6357c442905fe', 'feebca0c3e1e178553fecb7f905a4accbdf8', 328, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('950c0f6b79c3e8582e438951d3e2921ebeef', '358ea4bf860ce17393ae5614aaa4afb2badd', 98, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9518ad88b6b4142c245a6e32f2bb0e191b6a', '884f92440f11ea3f826310c4bcf9442908ec', 72, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9563826abb72fe074acc1c25a9fb4ae2a62b', '484675c0690c147bc1ab990858241f65d704', 10, '4.52.18.0.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"judul_jurnal\":\"judul 2\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"mandiri\",\"nama_dosen\":null,\"tahun_publikasi\":2022,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-06 10:14:10'),
('957a66b807d865a5e79568c2bb68c06533e4', '484675c0690c147bc1ab990858241f65d704', 13, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('95b0cb5835cd4823d58aed1c011656b3acd1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 251, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('95cb4b63fd5ce64cbab5ef8b05141928201e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 104, '4.52.20.1.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.1.03\",\"nama\":\"ANNISA NUR AULIA\",\"judul_jurnal\":\"Enhancing Organizational Performance: Can Innovative Millennial Entrepreneurship and Business Continuity Take on A Mediating Role?\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Iwan Hermawan, Eva Purnamasari\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"Organization and Human Capital Development\",\"penulis\":\"Annisa Nur Aulia, Iwan Hermawan, Eva Purnamasari\",\"url_publikasi\":\"https:\\/\\/www.proquest.com\\/docview\\/3194094618\\/abstract\\/F1416EE71E24500PQ\\/1?accountid=40625&sourcetype=Scholarly%20Journals\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('95dbf08dcb44723cf3720806bb607415503d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 257, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('95dde6e35cbe39693b064a464947458e5773', '358ea4bf860ce17393ae5614aaa4afb2badd', 209, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('95eb020083da721312eda21d073b274ba0e3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 204, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('960fe9ae0e83a373b5c2e69299f3bfd8acb5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 184, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('961626c98a2e10f1702f96109cdfa6fd3410', '24bb6981131931d73aabea3f4eda805574ff', 189, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('966749be0025ed2af73325d1677b87d35c19', '484675c0690c147bc1ab990858241f65d704', 97, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9726f13b95a9d6220fe9cdda297edd89fce8', '484675c0690c147bc1ab990858241f65d704', 278, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('974800894de0fca1d5878074958834373e38', '358ea4bf860ce17393ae5614aaa4afb2badd', 11, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9776017460ccd279fd08e6475c32d0085abf', '24bb6981131931d73aabea3f4eda805574ff', 169, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('97b397fbe5165618f22ffa37b49402a9e8f3', '638f9ef95d6caead52d42928bded5b313c27', 45, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('97bb4e22ea800acfc9f7f2c67cb32641633d', '884f92440f11ea3f826310c4bcf9442908ec', 194, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('97c605a95574b4eff8309156a5ea2dd2d06a', '638f9ef95d6caead52d42928bded5b313c27', 258, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('98114f7465fa4bf15e5f3bfc312537200a37', '884f92440f11ea3f826310c4bcf9442908ec', 12, '4.52.19.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9822acc22340e4df9b8ee2e893e143ea4ab9', '24bb6981131931d73aabea3f4eda805574ff', 67, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9823154eeaea58d7540f65b7ee7bf64fdfaa', '884f92440f11ea3f826310c4bcf9442908ec', 270, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('983dd0142c5db5e27402496532600d9c7c58', '358ea4bf860ce17393ae5614aaa4afb2badd', 124, '4.52.21.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9845085a628597c1869ec5e2d38d94ee9cc3', '884f92440f11ea3f826310c4bcf9442908ec', 144, '4.52.21.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9861e6b5d2d2e507e9d852bfc068ae3bb12e', '358ea4bf860ce17393ae5614aaa4afb2badd', 48, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('989ea00730fb3bca37d16e323d8bbb680010', '484675c0690c147bc1ab990858241f65d704', 283, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('98b198237aa26e958e00ed3d53ff6bbdcf72', '24bb6981131931d73aabea3f4eda805574ff', 106, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('98d6da8d99487e451c400680f6cf913a7f19', 'feebca0c3e1e178553fecb7f905a4accbdf8', 83, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('98f95e6a3f15def483321a4ded41b6e70836', '638f9ef95d6caead52d42928bded5b313c27', 184, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('98fbc9cf1c25a9321274c7cb63a57a72c5f1', '358ea4bf860ce17393ae5614aaa4afb2badd', 301, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9903cc42a57e506360729ac33ab32feca631', '484675c0690c147bc1ab990858241f65d704', 211, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('990e8f0aced75ee595ceb6b17863d5aaf5dd', '24bb6981131931d73aabea3f4eda805574ff', 72, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('992bfab065562511b85e038a384094a2e4ce', 'feebca0c3e1e178553fecb7f905a4accbdf8', 28, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('9971ee6418a8a0fa2195fe2bb72293b5a2e5', '24bb6981131931d73aabea3f4eda805574ff', 299, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('997d2c6269823ff9852b648ea4f308cd4cd7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 244, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('99836bccd1724c9edcc4348bb22d20a6f81b', '24bb6981131931d73aabea3f4eda805574ff', 71, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('99942f092f5a099e81873237632d0fbf7dbe', 'feebca0c3e1e178553fecb7f905a4accbdf8', 9, '4.52.18.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('99eab67ccf5f65b6c77eed1d438498b873cd', '24bb6981131931d73aabea3f4eda805574ff', 141, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('99eca8e628656d89cda0ea75c929ce72a751', '24bb6981131931d73aabea3f4eda805574ff', 263, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('99fd19abe6fd5f748f13d6e28e80f8a79516', 'feebca0c3e1e178553fecb7f905a4accbdf8', 174, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('99fd1f81fc61b48d4c9553553718215fb6f6', '638f9ef95d6caead52d42928bded5b313c27', 84, '4.52.20.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9a0ebd122168333e87ea1492c0e8cb56ce13', '24bb6981131931d73aabea3f4eda805574ff', 282, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9a2afe5c07c9810444b9296468867d56f649', '638f9ef95d6caead52d42928bded5b313c27', 60, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9aa2c2b486b00f3fa71760eb8cb10b075464', 'feebca0c3e1e178553fecb7f905a4accbdf8', 321, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('9ac4f91b71cf306f982a4e0bc4b1047140a2', '484675c0690c147bc1ab990858241f65d704', 46, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9ae5360af0981bcf36cfd9e06c9834fac7d5', '358ea4bf860ce17393ae5614aaa4afb2badd', 106, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9b3067ece3a24a7a8f89bc0a0e6548e4982a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 100, '4.52.20.0.30', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.30\",\"nama\":\"YUDHA ESA PRIBADI\",\"judul_jurnal\":\"Pengaruh Knowledge Sharing, Employee Engagement, Dan Work Life Balance Terhadap Job Satisfication Pada Karyawan PT Wijaya Karya Beton Tbk. PPB Boyolali\",\"level_jurnal\":\"national_non_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"Journal of Management, Entrepreneur and Cooperative\",\"penulis\":\"Yudha Esa Pribadi, Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi\",\"url_publikasi\":\"https:\\/\\/jurnal.uss.ac.id\\/index.php\\/jmec\\/article\\/view\\/578\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('9b318fa475bcfc8722727fe2c881050f8875', '884f92440f11ea3f826310c4bcf9442908ec', 91, '4.52.20.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9bde5522a9679007ab65fc8df105c59c55fd', '638f9ef95d6caead52d42928bded5b313c27', 150, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9c05755990c6377a4be7afcf9529294a820a', '24bb6981131931d73aabea3f4eda805574ff', 86, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9c236036c2c4a67f4ae0010a31ebedfbbfc1', '884f92440f11ea3f826310c4bcf9442908ec', 201, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9c37e42ad8320acd3ba600855297086d2ae0', '638f9ef95d6caead52d42928bded5b313c27', 265, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9c3b2008772c54eca035aa35c39203bcdd50', '638f9ef95d6caead52d42928bded5b313c27', 193, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9c535f9a37e0a2777c5d9831e38ef1453467', '24bb6981131931d73aabea3f4eda805574ff', 211, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9c5e2b0748ae09f216adb7ec63cc6ecfaa5a', '884f92440f11ea3f826310c4bcf9442908ec', 310, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9c6e3afaf9f7633d03b13deca12e358fc5c6', '884f92440f11ea3f826310c4bcf9442908ec', 190, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9c7203d8057245ffd57192aa4ea6f7b96b14', '638f9ef95d6caead52d42928bded5b313c27', 221, '4.52.25.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9c8d7eb59435376bd4b35eb31ecf01718685', '24bb6981131931d73aabea3f4eda805574ff', 149, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9ca5fc253b397ba8fb9ee93abcd238ee2cb8', '884f92440f11ea3f826310c4bcf9442908ec', 172, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9cb1965630e23799bd39488aa3563982a180', '638f9ef95d6caead52d42928bded5b313c27', 92, '4.52.20.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9d105530f4786fd73115ff0c97e27c103a24', '484675c0690c147bc1ab990858241f65d704', 330, '4.52.25.3.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9d24665b8447a9605d2dbfd461aab2efc7ff', 'feebca0c3e1e178553fecb7f905a4accbdf8', 226, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('9d33eeb54c0c306f9d1106d66a9fda298bc8', '24bb6981131931d73aabea3f4eda805574ff', 204, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9d531302b6b8d62ffb0c36c539f40dab1892', '24bb6981131931d73aabea3f4eda805574ff', 213, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9d913cee6f3e309fdef7c9cd4583c6e7185a', '884f92440f11ea3f826310c4bcf9442908ec', 324, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9d96f99dece311fdd8380029c0503a69a6d4', '638f9ef95d6caead52d42928bded5b313c27', 119, '4.52.20.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9dcbb5aafc3dc82c1b90db3e6d2b3291378f', '24bb6981131931d73aabea3f4eda805574ff', 159, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('9deae98d4508e863a3b3965538fd7bbeb706', 'feebca0c3e1e178553fecb7f905a4accbdf8', 200, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('9e083df4ea9c94bebb78ccc19727bfe06206', '638f9ef95d6caead52d42928bded5b313c27', 31, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9e13fbc56130baf9c2adfdb00a4e1e62f246', '484675c0690c147bc1ab990858241f65d704', 216, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9e2a6ffc7ae5accd5c0512d12c58e0d8e2f9', '484675c0690c147bc1ab990858241f65d704', 21, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9e94803c179c1260a1fc848b906a503b03a1', '638f9ef95d6caead52d42928bded5b313c27', 252, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9f0abf4b629d2dbfc3a6cf2347a7be07b849', 'feebca0c3e1e178553fecb7f905a4accbdf8', 35, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('9f4f954e54992b744e458024772dbc36d01f', '358ea4bf860ce17393ae5614aaa4afb2badd', 36, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9f5105664e96b8c4eec1a99adaf6cf3e8695', 'feebca0c3e1e178553fecb7f905a4accbdf8', 91, '4.52.20.0.21', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.20.0.21\",\"nama\":\"NUR IMAM NAZIHAH\",\"judul_jurnal\":\"The Influence of Motivation and Family Background on Technopreneur Interest in College Students\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:27'),
('9f5aebe9bf1f2c2e021b8bec322b9540fbe1', '484675c0690c147bc1ab990858241f65d704', 68, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9f92a2946e5cd89169822cbeb0d956f19b32', 'feebca0c3e1e178553fecb7f905a4accbdf8', 264, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('9fbb049076bfd868cb41285d48c815b1d893', '884f92440f11ea3f826310c4bcf9442908ec', 118, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('9fd11bbba7d68a713e1e3500a49b51471ad6', '638f9ef95d6caead52d42928bded5b313c27', 16, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('9fd5023bba1cede9198eaad5a1e7abfb2cf7', '358ea4bf860ce17393ae5614aaa4afb2badd', 204, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('9fefeefdbe04b7ddfeeb5594b4a06b793159', '484675c0690c147bc1ab990858241f65d704', 312, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('9ff57263602ea19b434e595a481ba00d2c45', '24bb6981131931d73aabea3f4eda805574ff', 322, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a023067dbf717ea903592c8e9626977a833f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 288, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a03b32eb87f006ef163d461382bb29372fe4', '24bb6981131931d73aabea3f4eda805574ff', 118, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a0453ffc74c148055c84ed0e4e3f0de6e49d', '884f92440f11ea3f826310c4bcf9442908ec', 36, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a061939265cc67e0c311aa1b9391977a0a90', '358ea4bf860ce17393ae5614aaa4afb2badd', 60, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a0698a1265d1f5994170395fa681c77acca5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 11, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('a07134790f95aeb093eb0be8d80a7bc4232a', '24bb6981131931d73aabea3f4eda805574ff', 209, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a0a4548da2c15a5d4121c0a40217830fca33', '358ea4bf860ce17393ae5614aaa4afb2badd', 306, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a0b153e91a37c96e875b4feb83328e32f7d0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 297, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a0c6f3965dbaee91436921f4574ba30eb063', '484675c0690c147bc1ab990858241f65d704', 244, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a0ce2042d6548ff28dd9da26f97f2e69524b', '24bb6981131931d73aabea3f4eda805574ff', 219, '4.52.25.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a0ce3f7d9590c5da86ba712096e89d8cb72d', '884f92440f11ea3f826310c4bcf9442908ec', 242, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a11cbd3672296d02a3bca07a50c2e717941f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 73, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('a1655520f633ca5939beee87a954c502c1c5', '484675c0690c147bc1ab990858241f65d704', 80, '4.52.20.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a1675863ce0da9afca98b1d8e682188618e9', '24bb6981131931d73aabea3f4eda805574ff', 33, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a17bac6b7ee437f26dd53217af430eb5cfe6', '884f92440f11ea3f826310c4bcf9442908ec', 280, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a18d28963bb9579a789b4b3f8d1233be7a8f', '358ea4bf860ce17393ae5614aaa4afb2badd', 167, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a198ae97dc16d79894e9d61f991d4f3778ee', '358ea4bf860ce17393ae5614aaa4afb2badd', 113, '4.52.20.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a1e45e460066412952f0400ab0e94e5051fa', '358ea4bf860ce17393ae5614aaa4afb2badd', 210, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a20e4583d068462c247a9149009f2aef2936', '358ea4bf860ce17393ae5614aaa4afb2badd', 23, '4.52.19.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a22aaea0850f1d3cb5a0602e81ef6e02f7f7', '484675c0690c147bc1ab990858241f65d704', 87, '4.52.20.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a22c18e267e5b0205be09126a7d3718ca250', 'feebca0c3e1e178553fecb7f905a4accbdf8', 282, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a23ee1fe3761a8f5fff8e2b6e18e0ce0e717', '24bb6981131931d73aabea3f4eda805574ff', 275, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a243f4281aba82ccae420ae6ab90af48acde', '638f9ef95d6caead52d42928bded5b313c27', 77, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a26b66522fec601218b57973cc8e12bd40ca', '884f92440f11ea3f826310c4bcf9442908ec', 16, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a27ba1d50d25e1df46159e08ec49e02c765c', '638f9ef95d6caead52d42928bded5b313c27', 306, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a2b90076b197517a190bf5a5f75d87700a6c', '484675c0690c147bc1ab990858241f65d704', 110, '4.52.20.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a2bb368fb0d4021383bdc8bc64f84c8b0193', '884f92440f11ea3f826310c4bcf9442908ec', 78, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a2d94ddaa5c10ef0b563eddc9e654870fef3', '358ea4bf860ce17393ae5614aaa4afb2badd', 297, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a2f0764267269833da9ccf2c7c11cf100abd', '484675c0690c147bc1ab990858241f65d704', 302, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a3184c020394a3774bab968d64e46b427c05', '484675c0690c147bc1ab990858241f65d704', 86, '4.52.20.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a3303e2f846f39a00468221bfe84e4127681', '484675c0690c147bc1ab990858241f65d704', 322, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a3436d166a0ceec535bdf7767134292e3953', '638f9ef95d6caead52d42928bded5b313c27', 288, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a37cc323303bbb500a36cbf9edbb8f1320d7', '884f92440f11ea3f826310c4bcf9442908ec', 296, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a37e650a771e5532c00bcb6e513589caa5db', '358ea4bf860ce17393ae5614aaa4afb2badd', 103, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a3903d056f81057ca57f3ac886eac1fb094a', '884f92440f11ea3f826310c4bcf9442908ec', 285, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a39960e7287bd13cfbf72e078cc98d354d26', 'feebca0c3e1e178553fecb7f905a4accbdf8', 142, '4.52.21.0.17', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.21.0.17\",\"nama\":\"MIRZA DZAKI KAMAL\",\"judul_jurnal\":\"Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online\",\"level_jurnal\":null,\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Mellasanti Ayuwardani\",\"tahun_publikasi\":2025,\"nama_jurnal_konferensi\":\"JAPM (Jurnal Akademik Pengabdian Masyarakat)\",\"penulis\":\"Mellasanti Ayuwardani, Azzam Alhafhizd, Mirza Dzaki Kamal, Rafi Willy Febrian, Setiawan Wibowo\",\"url_publikasi\":\"https:\\/\\/ejurnal.kampusakademik.co.id\\/index.php\\/japm\\/indeksasi\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('a39c16bdc18c87124aa8b7c94d436080da31', '884f92440f11ea3f826310c4bcf9442908ec', 184, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a3c6b254e13c11ceb06d94e2331f4d958492', '884f92440f11ea3f826310c4bcf9442908ec', 323, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a3cd9689ce67ba33d51bf8f8e4809a84dd96', '24bb6981131931d73aabea3f4eda805574ff', 94, '4.52.20.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a418415575d2f6a533a6e91cbe306f7b3027', '24bb6981131931d73aabea3f4eda805574ff', 312, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a4324fd10f476bca6fea8b14af0dd01f4cd2', '484675c0690c147bc1ab990858241f65d704', 275, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a441ddb98ef7c01e8293c8bf2904ae24e66c', '24bb6981131931d73aabea3f4eda805574ff', 39, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a45b78966e727ce8b7830f71cd3c619064e9', '638f9ef95d6caead52d42928bded5b313c27', 318, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a45f0b008f16b76fb7d777e304fed7ba8692', '484675c0690c147bc1ab990858241f65d704', 168, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a467c10fc8ce478bffa2510bb4a9eba467a8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 45, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('a4cd4ba4c1fdb7f2e822e6b19ee8abc6f6cc', '484675c0690c147bc1ab990858241f65d704', 272, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a4d21f45738d529376240e5ea08e3222933e', '884f92440f11ea3f826310c4bcf9442908ec', 84, '4.52.20.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a500cee964d0c2e5c64e179a4f44b3e4eee0', '358ea4bf860ce17393ae5614aaa4afb2badd', 157, '4.52.21.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a53e1709831dfa09518eacaaf582a92bd36d', '358ea4bf860ce17393ae5614aaa4afb2badd', 171, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a581dc9f18a26510889faeb8ed4e42897ced', '358ea4bf860ce17393ae5614aaa4afb2badd', 40, '4.52.19.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a65f9138538281c99f2ca481d1cbc313d527', '638f9ef95d6caead52d42928bded5b313c27', 133, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a66135563d42c2aefd6b1eceb1f0f2c4d955', 'feebca0c3e1e178553fecb7f905a4accbdf8', 125, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a6cb5d9aade88d000eafe4f39bab36264c70', '24bb6981131931d73aabea3f4eda805574ff', 280, '4.52.25.2.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a6f4280ad146f059492d1109267fa54f2dde', '884f92440f11ea3f826310c4bcf9442908ec', 143, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a706bb85656be016abb99bc5e8e3326f5d56', 'feebca0c3e1e178553fecb7f905a4accbdf8', 331, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a710bf54ebcc67311630b59a652623ae6244', '358ea4bf860ce17393ae5614aaa4afb2badd', 51, '4.52.19.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a732464557d291226a62828070a73e3e3940', '884f92440f11ea3f826310c4bcf9442908ec', 318, '4.52.25.3.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a736c5a5a9d97d336b2d944a1b7cd8aab7f8', '358ea4bf860ce17393ae5614aaa4afb2badd', 64, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a755165b2b6618d1c7023db0c2ac8c237909', '884f92440f11ea3f826310c4bcf9442908ec', 70, '4.52.20.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a7775485254cc6f34062a1af00c1a0a13c34', '638f9ef95d6caead52d42928bded5b313c27', 36, '4.52.19.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a77a32cd0c89b528ce04de8e9e349eb8d88f', '358ea4bf860ce17393ae5614aaa4afb2badd', 283, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a782517f5d3ae587d21b2ba670623fa0c2dd', '884f92440f11ea3f826310c4bcf9442908ec', 79, '4.52.20.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a79304c3de459130283f2634f83b861e72d9', '638f9ef95d6caead52d42928bded5b313c27', 67, '4.52.20.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a79379bbd971a857965a0282af7362a9c908', 'feebca0c3e1e178553fecb7f905a4accbdf8', 47, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('a79c832e33527b15e9727deb9ded23acba67', '638f9ef95d6caead52d42928bded5b313c27', 256, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a7bd0cc6e8437b92d4ac1acfc3b927a4c066', '484675c0690c147bc1ab990858241f65d704', 255, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a7c2521db90404f48c0c7054a6746ca4174a', '484675c0690c147bc1ab990858241f65d704', 243, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a815de9211269dfa0c479050843f7541611a', '638f9ef95d6caead52d42928bded5b313c27', 192, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a86c59dec620e3c7e291330b2039a461c2b6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 88, '4.52.20.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('a86e3ac04ec45ed4b08db446da19f5223d0e', '884f92440f11ea3f826310c4bcf9442908ec', 261, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a86f6dab093ffab1f0eda616bf34c44c86b2', '24bb6981131931d73aabea3f4eda805574ff', 65, '4.52.20.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a8ef761bfc1ee1136bb1380831451bc1a6f2', '884f92440f11ea3f826310c4bcf9442908ec', 24, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a91f03a99a53a169acb748d6f93c48ad0d07', '484675c0690c147bc1ab990858241f65d704', 196, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('a948f27a55daccba071296ae4dc2fd043f0b', '484675c0690c147bc1ab990858241f65d704', 205, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('a957d6ea472cab7b00ffcc1e6dd6add66e5b', '884f92440f11ea3f826310c4bcf9442908ec', 272, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('a95c9ade966065c4c5e5e9d7a29525ac6d81', '24bb6981131931d73aabea3f4eda805574ff', 163, '4.52.21.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('a964e4b3137080e196f70f178b79ac97a38c', '638f9ef95d6caead52d42928bded5b313c27', 191, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('a99cb4055af871957d9ec4d7c056017f53bb', '358ea4bf860ce17393ae5614aaa4afb2badd', 72, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('a9b2b333985b94e93418f140452ec1ef7b88', 'feebca0c3e1e178553fecb7f905a4accbdf8', 281, '4.52.25.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('a9ea0de550af72a090c413d88dc418fcafc9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 143, '4.52.21.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('aa56512cfdcdd73ea1089938c65a0283a4d1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 135, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('aa69e026617d41fce8ddc0a04448c33d6cbf', '484675c0690c147bc1ab990858241f65d704', 261, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('aa809cf3cf5b45e1f82be7b4a0e6f37716d1', '358ea4bf860ce17393ae5614aaa4afb2badd', 267, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('aa866879f9743e83120ef53d7965d3b766c4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 231, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('aaa8953f7e556910e01829b9e8257d453690', 'feebca0c3e1e178553fecb7f905a4accbdf8', 42, '4.52.19.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('aaaa92ceaed85f0f34f16ca2ba679d08082d', '24bb6981131931d73aabea3f4eda805574ff', 222, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('aabf2ca1f9ff3e13fddf3cd2fc2587f0940b', '358ea4bf860ce17393ae5614aaa4afb2badd', 13, '4.52.19.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ab0b739b064288dcc6154359e0c51c80e1d9', '24bb6981131931d73aabea3f4eda805574ff', 310, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ab1cfa14cffc4f2df75de950db119942c105', '884f92440f11ea3f826310c4bcf9442908ec', 68, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ab3ea222b48f4bfd9cf7bb90fe7b74589ded', '24bb6981131931d73aabea3f4eda805574ff', 19, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ab7e584d32186a441a4a8680980b5df56a2f', '638f9ef95d6caead52d42928bded5b313c27', 240, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ab7ec55a4d31781331022d861b13927b7fdc', '358ea4bf860ce17393ae5614aaa4afb2badd', 172, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('aba2e2b2900705f1423c2580361ea6ce0a42', '884f92440f11ea3f826310c4bcf9442908ec', 35, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('abab6bafa405ce8f6fea009c5ae978e7ea0b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 40, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('abba8fb1dbc4e24d82b5558c4e249d743f82', 'feebca0c3e1e178553fecb7f905a4accbdf8', 136, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('abbe5866b4134815aa7a1a96114436b4907d', '24bb6981131931d73aabea3f4eda805574ff', 76, '4.52.20.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('abd3885c61e8c376769d54558f5bc2cb26cd', '24bb6981131931d73aabea3f4eda805574ff', 132, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('abe6294615e7aa561b57be66f7c48092fa3d', '24bb6981131931d73aabea3f4eda805574ff', 279, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('abf18c4b71233d423e373c20d53de95dce95', '484675c0690c147bc1ab990858241f65d704', 197, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ac00003d6a1703c172415043060a3a3a916e', '484675c0690c147bc1ab990858241f65d704', 181, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ac1b97c77a2e03b1be91fedc1b4689a936ef', 'feebca0c3e1e178553fecb7f905a4accbdf8', 177, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ac1cd7723bc48d2c9d5e2dd4af6dadc9510c', '358ea4bf860ce17393ae5614aaa4afb2badd', 80, '4.52.20.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ac47aa1c9d2078474fb6fc70cdc57eac4227', '884f92440f11ea3f826310c4bcf9442908ec', 250, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ac505c0c62e57d8b1cd1306a4907e87fc7fd', '358ea4bf860ce17393ae5614aaa4afb2badd', 198, '4.52.21.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ac7efdd7d8a0f32ef48722a57a4700c9797b', '884f92440f11ea3f826310c4bcf9442908ec', 89, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ac7fc885c710e23b93e42751ae1b983d52e7', '24bb6981131931d73aabea3f4eda805574ff', 250, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ac8bbf543c574220c0698210d3a0a632c4cb', '24bb6981131931d73aabea3f4eda805574ff', 107, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('aca8935a9417ab8ac533e92e6e6d6b55b577', '884f92440f11ea3f826310c4bcf9442908ec', 196, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('acb2d9073c5e3491baf3de35e566ce8201e9', '638f9ef95d6caead52d42928bded5b313c27', 213, '4.52.23.8.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('acbcc25bdc68cd93ff79589c6e358a39f10a', '638f9ef95d6caead52d42928bded5b313c27', 91, '4.52.20.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('acbdf69617f37d1177183874df755e3a95d6', '24bb6981131931d73aabea3f4eda805574ff', 186, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('acd9b340d8eddc3a9a2f6d63d2c27a766beb', '638f9ef95d6caead52d42928bded5b313c27', 134, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('acdfde07bb3472e3c240a1d41c505b2ffb43', '24bb6981131931d73aabea3f4eda805574ff', 201, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ad02309110dc4096f34b807d22eb5ff64aa5', '884f92440f11ea3f826310c4bcf9442908ec', 33, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ad09de6c59c08e3dff455390d5a0806f8e29', '638f9ef95d6caead52d42928bded5b313c27', 18, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ad1116e3203eeacdd0379e37fb7c65f07b93', '484675c0690c147bc1ab990858241f65d704', 310, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ad22eff8316b3070950903451983ea654968', '884f92440f11ea3f826310c4bcf9442908ec', 308, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ad7dc5367cb137931f3489e585f2c44e9ef2', '884f92440f11ea3f826310c4bcf9442908ec', 11, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ae037ae973f7ec4682790eaaa8254d7c55d0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 103, '4.52.20.1.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.1.03\",\"nama\":\"ANNISA NUR AULIA\",\"judul_jurnal\":\"Implementation of Good Governance E-Filling and Strengthening Soft-Skill Characters for Japanese Kenshushei Institutions at LPK Akihiro Semarang\",\"level_jurnal\":\"national_non_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"IMPACTS: International Journal of Empowerment and Community Services\",\"penulis\":\"Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti, Annisa Nur Aulia\",\"url_publikasi\":\"https:\\/\\/jurnal.ustjogja.ac.id\\/index.php\\/IMPACTS\\/article\\/view\\/16008\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('ae074d51f1bd8329e38dd9cd54a9690a34be', '24bb6981131931d73aabea3f4eda805574ff', 70, '4.52.20.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ae263e12e9eb764ef1e3b270c565a7657651', '358ea4bf860ce17393ae5614aaa4afb2badd', 43, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ae37f7151aea2ffe48cb2b64ddc80a3586ac', '884f92440f11ea3f826310c4bcf9442908ec', 193, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ae532eeaf96077f6dc435b58bec4be89a6cd', '484675c0690c147bc1ab990858241f65d704', 64, '4.52.19.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ae68ec30885e9edfc82935d0679e59917a2d', '24bb6981131931d73aabea3f4eda805574ff', 104, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ae732690b89a213e4546467c54219d9f23c5', '884f92440f11ea3f826310c4bcf9442908ec', 230, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ae9c631e00a68a4bb3f6f012fbabc70fdc56', '638f9ef95d6caead52d42928bded5b313c27', 248, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ae9f2a23d1e58f8de6a47c76620783e59c4d', '638f9ef95d6caead52d42928bded5b313c27', 228, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('aef91157ee32667b27621637bb45a874df62', '484675c0690c147bc1ab990858241f65d704', 157, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('af631a4badbcc7640c805b91e7eddd118cc9', '884f92440f11ea3f826310c4bcf9442908ec', 85, '4.52.20.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('af6991532c674cc596a0506dbebdc1145246', '484675c0690c147bc1ab990858241f65d704', 139, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('af7105848d8964b19ae480e00a951ff7ede3', '884f92440f11ea3f826310c4bcf9442908ec', 244, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('af740d8307a3bd9632855b092b36eab5a898', '24bb6981131931d73aabea3f4eda805574ff', 225, '4.52.25.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('af876c5b1baf6026936259a00d473ad50263', '884f92440f11ea3f826310c4bcf9442908ec', 202, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('af9316f88a1c0268dea82e167cc419c305c2', '24bb6981131931d73aabea3f4eda805574ff', 17, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('af9444dc150d076d6d662cb4f70949c5cfa8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 25, '4.52.19.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('afd4edeb476c20aa2d8aaf5a1b218e654fad', 'feebca0c3e1e178553fecb7f905a4accbdf8', 158, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('afe6775c8d5f4f14685e15d84e90570c8bc5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 216, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b041528c8dc94c9a81b1535224024c383809', '884f92440f11ea3f826310c4bcf9442908ec', 34, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b0731e20d5a3375856e23eb0ad2a9e8a4da3', '358ea4bf860ce17393ae5614aaa4afb2badd', 34, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b07795e6683686ec9609bde877a3a5867ce6', '484675c0690c147bc1ab990858241f65d704', 315, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b0835347a595518a90200f5587d89cc8b802', 'feebca0c3e1e178553fecb7f905a4accbdf8', 233, '4.52.25.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b08ba72b6710d5159fea27769b39c43d7e9d', '638f9ef95d6caead52d42928bded5b313c27', 251, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b094a10030d357b56f96305d6d5b883f1594', '638f9ef95d6caead52d42928bded5b313c27', 222, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b0969b424d1036f31cbcbe5466f667655487', '884f92440f11ea3f826310c4bcf9442908ec', 238, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b0a3dfc067c42d547259457433862f8a6fc9', '884f92440f11ea3f826310c4bcf9442908ec', 217, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b0b7dcdf3fc65849fa22a75552ab15841e01', '24bb6981131931d73aabea3f4eda805574ff', 79, '4.52.20.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b13789829cf2299dc59bb9b22cbabfb7b52c', '484675c0690c147bc1ab990858241f65d704', 265, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b13cfd36361544e00674d0f29793f9b84794', '358ea4bf860ce17393ae5614aaa4afb2badd', 139, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b13faf8d90d2baf465409e969177d806220d', '484675c0690c147bc1ab990858241f65d704', 122, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b154515d71dd589e5099b6ff3d9e29cab673', '638f9ef95d6caead52d42928bded5b313c27', 204, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b19bf41dadf1cc9d18c8ae4169e8f6146473', '358ea4bf860ce17393ae5614aaa4afb2badd', 270, '4.52.25.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b1e8cdeb45b9be7586161a6f8ec173541026', '638f9ef95d6caead52d42928bded5b313c27', 154, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b1fe428d0988a6865507b93e0ed5b5cf738f', '484675c0690c147bc1ab990858241f65d704', 316, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b204a100085c430c54eafbaac5520f28d408', '24bb6981131931d73aabea3f4eda805574ff', 62, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b22b8b648dec4b978b16483d512f339d43ef', '358ea4bf860ce17393ae5614aaa4afb2badd', 256, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b23e175a78f3ad097988c3e6f5b9666a0f12', '638f9ef95d6caead52d42928bded5b313c27', 241, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b268c5399e42b0a409891f3ae9be87fa30ef', '358ea4bf860ce17393ae5614aaa4afb2badd', 236, '4.52.25.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b270089d8fcf4d013d9602ee51abe83e37b7', '884f92440f11ea3f826310c4bcf9442908ec', 269, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b27a079587a11804377596e5605c855cdced', 'feebca0c3e1e178553fecb7f905a4accbdf8', 329, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b2816685071d18230b6b87a0633023a72ae8', '884f92440f11ea3f826310c4bcf9442908ec', 218, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b289371cc63211ad2178e8060a422a117b22', '884f92440f11ea3f826310c4bcf9442908ec', 40, '4.52.19.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b2bfe9ffa4672d16358566e5f404eee1eb1c', '24bb6981131931d73aabea3f4eda805574ff', 96, '4.52.20.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b2dce77bc3602870a7b1c8e557ea3046348c', '358ea4bf860ce17393ae5614aaa4afb2badd', 155, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b2ec25366b0a61c99151b97ffc729c89df91', '358ea4bf860ce17393ae5614aaa4afb2badd', 229, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b2fdc11502dcb401c954103d4ec2b04e8239', 'feebca0c3e1e178553fecb7f905a4accbdf8', 86, '4.52.20.0.16', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.20.0.16\",\"nama\":\"MILATI PUJA KESUMA\",\"judul_jurnal\":\"Influence Workload and Physical Work Environment on Job Satisfaction at PT Matahari Silverindo Jaya Semarang City\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:26'),
('b307a90b0a3c0d811f3f7257e2adcd3dca05', '358ea4bf860ce17393ae5614aaa4afb2badd', 28, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b30e1d5b2d89bb741aa820776d439b9c9fb0', '484675c0690c147bc1ab990858241f65d704', 38, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b3136f6e702a093ff3588e48e7507d00a6c8', '884f92440f11ea3f826310c4bcf9442908ec', 134, '4.52.21.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b3333cccfdf03ae00d11ddd3b08cd51bbfcc', '358ea4bf860ce17393ae5614aaa4afb2badd', 286, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b333d2826767c1563c0345bf9f810daa4e5a', '884f92440f11ea3f826310c4bcf9442908ec', 200, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b3922cf50388e8543b8cba9387c5e48fa7d2', '358ea4bf860ce17393ae5614aaa4afb2badd', 201, '4.52.21.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b3a0d5e8d5587ca7636e3716731b61241fab', '638f9ef95d6caead52d42928bded5b313c27', 35, '4.52.19.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b3dbd1824884500fce45a6b805b5e5586df7', '884f92440f11ea3f826310c4bcf9442908ec', 179, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b40fcd5964f06db89370792354ac1127ed79', '24bb6981131931d73aabea3f4eda805574ff', 285, '4.52.25.2.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b41098c1352f0ac33b3e4961eb8e5507fb51', '484675c0690c147bc1ab990858241f65d704', 287, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b4b1c4810b657412824a6327ca4c40f5ee01', '358ea4bf860ce17393ae5614aaa4afb2badd', 215, '4.52.23.8.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b4cb88118b28e274bb13918eee956c19c223', '884f92440f11ea3f826310c4bcf9442908ec', 266, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b4d58bfd94e8ad2a761b300f8c67c07c908c', '358ea4bf860ce17393ae5614aaa4afb2badd', 44, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b4ee86e4051e6d91942411215e8b816a8f46', '638f9ef95d6caead52d42928bded5b313c27', 64, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b526336b51beb7c7d712c8258604246707e8', '884f92440f11ea3f826310c4bcf9442908ec', 26, '4.52.19.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b54c1a36bd9f3b6b32cc2d3dddd350d16ec7', 'feebca0c3e1e178553fecb7f905a4accbdf8', 121, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b54e9cfc85652525f308c3a8e8acff9848b4', '638f9ef95d6caead52d42928bded5b313c27', 121, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b5f319e7668deff391701be5ccd54c57b388', '24bb6981131931d73aabea3f4eda805574ff', 130, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b5f8d4701614d60d9f76a175515dd49309dd', '884f92440f11ea3f826310c4bcf9442908ec', 46, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b60fa98430d409284a8b670d9c2382f78122', '638f9ef95d6caead52d42928bded5b313c27', 327, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b65b53cda2a94b3e682492c8f54d63308964', '638f9ef95d6caead52d42928bded5b313c27', 268, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b66666de1d46981f1b81ffa9c07a4a460af1', '884f92440f11ea3f826310c4bcf9442908ec', 77, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b675ec48fb1ea0c911b0cd12ca478414ea7c', '484675c0690c147bc1ab990858241f65d704', 323, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b67c698354d80feb693d234942fd3c3f6145', '358ea4bf860ce17393ae5614aaa4afb2badd', 112, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b69955f7b973016278c998d098fc3c34a179', '884f92440f11ea3f826310c4bcf9442908ec', 108, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b69ce24ea8eb04e1a02bad9717428b1631de', '24bb6981131931d73aabea3f4eda805574ff', 171, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b6ae61a121d05e984aeb18f8244aa0972eb8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 81, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('b6b32b6e59cbce4afd3dcd905f80c56eae09', 'feebca0c3e1e178553fecb7f905a4accbdf8', 322, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b7301caea411557eccf4394add2b85d150dc', '358ea4bf860ce17393ae5614aaa4afb2badd', 27, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b75cfec2edff1f4eb720198c2d145748a4d4', '484675c0690c147bc1ab990858241f65d704', 313, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b787788a1304fd8d2380588259011e50449d', '884f92440f11ea3f826310c4bcf9442908ec', 50, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b7997772aac7779eb5f648f701829406fd14', '638f9ef95d6caead52d42928bded5b313c27', 107, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b799a6da15b752e053fb1320203c54c4ad2a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 271, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b7abfa938df53bf478399f7adf7e5d095ffe', '638f9ef95d6caead52d42928bded5b313c27', 275, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b7b2db44531fe2f4dd6144c986e5f0a3f0d7', '358ea4bf860ce17393ae5614aaa4afb2badd', 152, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b7ffc7c77ab835e312805fca5821ca204c2c', '24bb6981131931d73aabea3f4eda805574ff', 260, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b8141ca4d6b704295b1330463e6efaf8bdbc', '358ea4bf860ce17393ae5614aaa4afb2badd', 176, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b861f13b429293ddebdf434364da6e2c60e1', '358ea4bf860ce17393ae5614aaa4afb2badd', 150, '4.52.21.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('b8d3c23c8077c4635d5c5bf47bae61bf54e2', '638f9ef95d6caead52d42928bded5b313c27', 264, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b8e8a7b4fd8b8f5650dd288e4ce9a10ba2c3', '884f92440f11ea3f826310c4bcf9442908ec', 315, '4.52.25.3.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('b92141b042e03126ac546733ba27041fbd85', '484675c0690c147bc1ab990858241f65d704', 149, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b939cada7124eb3b9b7c0c41bba841d55b7f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 242, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b9812991f1a9fe38845b6bc33eaeaeffd857', 'feebca0c3e1e178553fecb7f905a4accbdf8', 326, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('b99174529d4269eca34fa5e38a6b4acd07a7', '24bb6981131931d73aabea3f4eda805574ff', 194, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('b9ab6dcfe8b5afb225a90ce1cb3aaba44d0e', '638f9ef95d6caead52d42928bded5b313c27', 227, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('b9d804c3359ac72934502e9067478fc78775', '484675c0690c147bc1ab990858241f65d704', 280, '4.52.25.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('b9e7608f1e0079eef6442430300b73924a0d', '884f92440f11ea3f826310c4bcf9442908ec', 173, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ba4486b76d904af487bad957d46592048368', '484675c0690c147bc1ab990858241f65d704', 301, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ba4bb0238405b21a7751eb4bddabb8b541fd', '484675c0690c147bc1ab990858241f65d704', 150, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ba4df3baa8dc8764d1a364e948d6cd856afb', 'feebca0c3e1e178553fecb7f905a4accbdf8', 209, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ba89dbb177110f0ef4d0bd0b087eba430673', '484675c0690c147bc1ab990858241f65d704', 41, '4.52.19.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('baa690ff3d0c1d7908fe85735d754c1fb1f0', '24bb6981131931d73aabea3f4eda805574ff', 306, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('baf925bb5e0e18174b9580fa95ce0bc150a4', '24bb6981131931d73aabea3f4eda805574ff', 59, '4.52.19.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bb0ad4296e747402203faf0ce0bf268f71bc', '484675c0690c147bc1ab990858241f65d704', 144, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bb0be87fa12b3afb305b097711d7ecc8cc17', '358ea4bf860ce17393ae5614aaa4afb2badd', 195, '4.52.21.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bb259f075f6d81cf559d716f6a399907f2ce', '484675c0690c147bc1ab990858241f65d704', 327, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bb4ce2ca5a74971c4a85edf2b7641e45dffa', 'feebca0c3e1e178553fecb7f905a4accbdf8', 330, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('bb8dc416f77410c297117c4e12ba6e723d00', '484675c0690c147bc1ab990858241f65d704', 78, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bbcd780070606355a39c7e624e42e46fbf6b', '638f9ef95d6caead52d42928bded5b313c27', 73, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('bbdc21ac097c165c03749bb11af711ac5381', '358ea4bf860ce17393ae5614aaa4afb2badd', 89, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bbe6a09237c98497e6b16a8fa3ba8e0f6713', '884f92440f11ea3f826310c4bcf9442908ec', 156, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('bc0cdfad1a8eafb9a75f8254624566fc61dd', '484675c0690c147bc1ab990858241f65d704', 259, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bc163379dfc0a1b88db459422d3f5f2c99ed', '358ea4bf860ce17393ae5614aaa4afb2badd', 242, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bc3b018258e0da5721239afcc86b4db8d61d', '884f92440f11ea3f826310c4bcf9442908ec', 220, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('bc4aea461edbd4b8b58399196abd23721f29', 'feebca0c3e1e178553fecb7f905a4accbdf8', 266, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('bc5937cc7cd7fc495eaf6d09fc8b9b1c8e42', 'feebca0c3e1e178553fecb7f905a4accbdf8', 165, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('bc6c0c9f5d90867e2df53b78aed5b9a414d3', '484675c0690c147bc1ab990858241f65d704', 276, '4.52.25.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bc9e62d5d6596764f4acdbc4360d948735df', '484675c0690c147bc1ab990858241f65d704', 124, '4.52.21.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bcb54523e5653125d566926d54be65f5d12d', '884f92440f11ea3f826310c4bcf9442908ec', 252, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('bcb7541d5c60e25a8080bec5af6bd3469109', '358ea4bf860ce17393ae5614aaa4afb2badd', 252, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bcb7a77366ed9740db9457e7d0bf069cbac0', '358ea4bf860ce17393ae5614aaa4afb2badd', 181, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bcd270c4d4424e99b19243a2bb2cc3d425a2', '484675c0690c147bc1ab990858241f65d704', 201, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bd28b16b4d719d870284144a59b130fdd488', '24bb6981131931d73aabea3f4eda805574ff', 253, '4.52.25.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bd850b547d44c81068d9ab939633992d7f56', '24bb6981131931d73aabea3f4eda805574ff', 78, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bd95991b14898295f1705ce2b76fa5c2dc7c', '24bb6981131931d73aabea3f4eda805574ff', 278, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bdcb94e699b8558c0054cfcb49d85aea1e21', '24bb6981131931d73aabea3f4eda805574ff', 21, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bde1f08f0daac17285eabc5bb076a667bbb2', '884f92440f11ea3f826310c4bcf9442908ec', 256, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('bdf7e42b30ebafdd823367f45967120cac45', '358ea4bf860ce17393ae5614aaa4afb2badd', 47, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('be10afeef2a34edb070217a5d37e8393664d', '884f92440f11ea3f826310c4bcf9442908ec', 247, '4.52.25.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('be4008da9c14ff5e25bc825b453dcd64788d', '638f9ef95d6caead52d42928bded5b313c27', 53, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('be51a36134a7b01b722dd4624895ccecb70e', '638f9ef95d6caead52d42928bded5b313c27', 162, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('bea2e4e7fbb3d2ac4790ded2288244b941a4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 212, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('bebb525de97485cd1a4fb7decd08af052764', 'feebca0c3e1e178553fecb7f905a4accbdf8', 55, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('bec88027f233c5e4ec82c69a3eaa60b86001', '24bb6981131931d73aabea3f4eda805574ff', 110, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bf323e835b25d6dc4974c3a9fe8aabbe87ff', '638f9ef95d6caead52d42928bded5b313c27', 10, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('bf42366b9e46ac0ed8e11ddde4107c64e26e', '638f9ef95d6caead52d42928bded5b313c27', 216, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('bf7fcae82eab09593b0beba2138808d77784', '358ea4bf860ce17393ae5614aaa4afb2badd', 70, '4.52.20.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bf85b141caf85cb3f5f09cc9f6b30b6d3e21', '24bb6981131931d73aabea3f4eda805574ff', 74, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bf92cb8b5c92aec21c4865d84ad8753a87d4', '358ea4bf860ce17393ae5614aaa4afb2badd', 223, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bf9ea5c1fa54fe905572d62dedd622ab3222', 'feebca0c3e1e178553fecb7f905a4accbdf8', 196, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('bfa80c17346bf4233ab41fa3a398309106f7', '24bb6981131931d73aabea3f4eda805574ff', 53, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('bfb5e2447ebafe6c688e4b0ac480a477b27f', '358ea4bf860ce17393ae5614aaa4afb2badd', 166, '4.52.21.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('bfbf6df4226222f0a7494c0356ddb92168f6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 41, '4.52.19.1.05', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.19.1.05\",\"nama\":\"ASTI KHOERUNISA\",\"judul_jurnal\":\"An Empirical Study of Dynamic Capability: Leveraging The Roles of Virtual Leadership and Relational Capital\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:26'),
('bfc43d4c5f2b3c08616696df9f05a96d2748', '638f9ef95d6caead52d42928bded5b313c27', 322, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('bfd2d85899e6d04c7a4ba84f3c903b093580', '884f92440f11ea3f826310c4bcf9442908ec', 210, '4.52.23.8.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('bfdfef23c282ad683395dbbd555652507ac3', '484675c0690c147bc1ab990858241f65d704', 23, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('bfffc57f9616b3e908f9eb16d6540eacfc79', '638f9ef95d6caead52d42928bded5b313c27', 113, '4.52.20.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c0283721f484fac145a9223b37b93fab798d', '638f9ef95d6caead52d42928bded5b313c27', 200, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c033baa307c1cbb6bae898d1eb3fa3ad45ac', '358ea4bf860ce17393ae5614aaa4afb2badd', 162, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c037341c3f4192d9837c26e39cc5d7546745', '884f92440f11ea3f826310c4bcf9442908ec', 135, '4.52.21.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c03bea49bfd20651de5d97481807d25be9a0', '638f9ef95d6caead52d42928bded5b313c27', 146, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c03f66a9523d006c76a27b2d9640ed2b56f9', '358ea4bf860ce17393ae5614aaa4afb2badd', 322, '4.52.25.3.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c076b5b1ca263599d3e8a079ac8e0090eeac', '884f92440f11ea3f826310c4bcf9442908ec', 71, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c0869ff2006cfcb325409f2a341872df40b1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 58, '4.52.19.1.21', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.19.1.21\",\"nama\":\"NUR NELISA ADAH\",\"judul_jurnal\":\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:26'),
('c0a6cde91fae7879d74b2f12a03422d3bfe6', '884f92440f11ea3f826310c4bcf9442908ec', 331, '45219006', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c0a7062800dba653d8c7bdc40c980dc9fb69', '884f92440f11ea3f826310c4bcf9442908ec', 185, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c0ca41916fe15937476fb38921a7b4439a82', '484675c0690c147bc1ab990858241f65d704', 308, '4.52.25.3.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c0d700cd48abb69a50e83471ee1d32f0db37', '484675c0690c147bc1ab990858241f65d704', 305, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c11aba53bd1d3c356a43af78a0b4b5fade7a', '884f92440f11ea3f826310c4bcf9442908ec', 131, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c12d5617188c39de54f36e9e3f9914b98326', '638f9ef95d6caead52d42928bded5b313c27', 20, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c1471d4a28507d584d9222081757cec6e090', '24bb6981131931d73aabea3f4eda805574ff', 276, '4.52.25.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c192c88ee0e6c970c70f474a4b114e518910', '358ea4bf860ce17393ae5614aaa4afb2badd', 125, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c1ab13f6f4627820e1ca7c75e2dcf301a20b', '884f92440f11ea3f826310c4bcf9442908ec', 205, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c1fc9c2b43389e6b30b43b6713d8e369263f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 201, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c2633074795ebc792473ae16ffc4229e5b2b', '484675c0690c147bc1ab990858241f65d704', 92, '4.52.20.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c2ae70b54caf1e57c1e353e679da038decfd', '884f92440f11ea3f826310c4bcf9442908ec', 29, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c2b7985bfeb2df3f88a7b4a99f3b16016920', '24bb6981131931d73aabea3f4eda805574ff', 328, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c2ff973ad9eb2a89061d0add5dd4edd29e4b', '358ea4bf860ce17393ae5614aaa4afb2badd', 138, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c3418fe6746ccb91792a3fb0ad42c2064bee', '638f9ef95d6caead52d42928bded5b313c27', 71, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c3437f17dbcc652b04e8da9dd11ad9186a2a', '358ea4bf860ce17393ae5614aaa4afb2badd', 99, '4.52.20.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c38b38bc3875f378b218bc88a8ca3a108877', '638f9ef95d6caead52d42928bded5b313c27', 321, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c3aebc2d9164b16830527b7ef15166b2aa38', '358ea4bf860ce17393ae5614aaa4afb2badd', 241, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c3e5e3add9d35183bf7013089552794e44f1', '24bb6981131931d73aabea3f4eda805574ff', 73, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c3f17976591d528cd299e802fe6e88dfe29f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 57, '4.52.19.1.20', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.20\",\"nama\":\"NABILA FIRDA ALFANI\",\"judul_jurnal\":\"Influence of E-Service Quality, Promotion, and Brand Trust on Application Use Decisions\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Rustono, Nur Rini\",\"tahun_publikasi\":2023,\"nama_jurnal_konferensi\":\"JOBS\",\"penulis\":\"Nabila Firda Alfani, Rustono, Nur Rini\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/4854\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('c3f77aebf041365eb377e573de5a1f014254', '484675c0690c147bc1ab990858241f65d704', 132, '4.52.21.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c42b3b4a2c7091f49f9abdfe31bf628cb96c', '24bb6981131931d73aabea3f4eda805574ff', 44, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c44e1d232bbf8779480f25d0e574f6c00aad', '24bb6981131931d73aabea3f4eda805574ff', 199, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c44f067b3bdbc91f0918eb9700c32b882803', '358ea4bf860ce17393ae5614aaa4afb2badd', 271, '4.52.25.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c450bb50e6bcb6a47e21a69859204dcab788', '24bb6981131931d73aabea3f4eda805574ff', 193, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c4b6f79e41a5c711a04a2b5c38a9f34d07b2', '358ea4bf860ce17393ae5614aaa4afb2badd', 57, '4.52.19.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c4f42b46e5931cfa179cd1cb63f1684cb069', '24bb6981131931d73aabea3f4eda805574ff', 184, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c521522a9bb0c7b6bbf83fcf88f022909a3a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 128, '4.52.21.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c52ffe5b1ba40404292f1a8effcb3a47ba77', 'feebca0c3e1e178553fecb7f905a4accbdf8', 140, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c5634d0935e360bc906a7a5e1ccce7577660', '638f9ef95d6caead52d42928bded5b313c27', 180, '4.52.21.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c58f16b723fc9487a0b0e0b3d177a6388450', '358ea4bf860ce17393ae5614aaa4afb2badd', 38, '4.52.19.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c590e06ec4a2427a8f563235f144824d148b', '638f9ef95d6caead52d42928bded5b313c27', 294, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c592b3928b0a90f96fd9df3b1474a516d7c7', '638f9ef95d6caead52d42928bded5b313c27', 93, '4.52.20.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c5ae7f83ca0bbe4d6bea26ba9c8ad4090cc6', 'feebca0c3e1e178553fecb7f905a4accbdf8', 245, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c5b17424a1cefeaafe8c55983d6964332307', '638f9ef95d6caead52d42928bded5b313c27', 137, '4.52.21.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c5cac134c484a57b087b421da8a760504268', '484675c0690c147bc1ab990858241f65d704', 266, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c6241f300a00d08990601481bab8b4ff55e8', '24bb6981131931d73aabea3f4eda805574ff', 117, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c6ba3b7322273dbc0adf3dd245a154cae2ec', '484675c0690c147bc1ab990858241f65d704', 298, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c6d143aa3e29bbf7ad5c09c1f5e0040e92a0', '484675c0690c147bc1ab990858241f65d704', 182, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c6d4b5691ff245aa8ca7992b319dc1f72b58', '884f92440f11ea3f826310c4bcf9442908ec', 321, '4.52.25.3.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c6e7e13cf70d4167f942a7369b3dc2bb6f59', '358ea4bf860ce17393ae5614aaa4afb2badd', 302, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c7ae65499f923b5ebbe4f3d11642a043625d', '638f9ef95d6caead52d42928bded5b313c27', 237, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('c7db42b99673b5d3ebecb3e9febfa7a0c92a', '358ea4bf860ce17393ae5614aaa4afb2badd', 188, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c7e745650e2ba2871fe357ab1fcdd0a4f116', '24bb6981131931d73aabea3f4eda805574ff', 135, '4.52.21.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c7eeaa837badcc4f8bb49ab52c4b8820e469', '884f92440f11ea3f826310c4bcf9442908ec', 312, '4.52.25.3.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c7f200dbfafe6c007353e016c2fe50c14c5d', '24bb6981131931d73aabea3f4eda805574ff', 297, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c7f9a6eaa31c39729b5eef2589464d9884c6', '24bb6981131931d73aabea3f4eda805574ff', 298, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c817cbe7f182358f1c05dce5f1e54db8ab91', 'feebca0c3e1e178553fecb7f905a4accbdf8', 175, '4.52.21.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c88c40c212f1a9fc6f4ccd9009cae111de32', 'feebca0c3e1e178553fecb7f905a4accbdf8', 159, '4.52.21.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c88f01f5f6c29e1f502cccacc709ccd270e5', '24bb6981131931d73aabea3f4eda805574ff', 267, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c8b336a1a5fdf63d2f5a729f9e1c05a21256', '24bb6981131931d73aabea3f4eda805574ff', 116, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c8b803efa40492f2ada106bd031c88e0fbe5', '884f92440f11ea3f826310c4bcf9442908ec', 229, '4.52.25.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c8f6a1b3274d59acca519783e2e2eb54ea92', 'feebca0c3e1e178553fecb7f905a4accbdf8', 113, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('c9152b01c415d7003bb323f6eeb74766954f', '484675c0690c147bc1ab990858241f65d704', 264, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c9231c768af98c506af0b8b9db5b0ad1c92c', '484675c0690c147bc1ab990858241f65d704', 53, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('c926bcce7eb2f732234c7a85a74bcaab3d41', '358ea4bf860ce17393ae5614aaa4afb2badd', 140, '4.52.21.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('c96e777d0d643c25749a181307e5812811a3', '884f92440f11ea3f826310c4bcf9442908ec', 128, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c9734f3229cc9670d88a0b6c55dfce0c547e', '24bb6981131931d73aabea3f4eda805574ff', 61, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('c984f66f3b9a6f9a9ad5af9a15ea86e57c84', '884f92440f11ea3f826310c4bcf9442908ec', 209, '4.52.23.8.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c99b0cf85b15c9321d643edd58d2011fd02d', '884f92440f11ea3f826310c4bcf9442908ec', 110, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('c9bdcb886dfbf482e024f522f238b7ac2bd2', '884f92440f11ea3f826310c4bcf9442908ec', 263, '4.52.25.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ca21d08848939ec98cd9eb03cabf4d8da775', 'feebca0c3e1e178553fecb7f905a4accbdf8', 16, '4.52.19.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('ca58349a00e34b31ba0e91389062c617441c', '24bb6981131931d73aabea3f4eda805574ff', 46, '4.52.19.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ca60ddc983702ad7e298468fc5e575802051', '884f92440f11ea3f826310c4bcf9442908ec', 54, '4.52.19.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ca89a2ec88a18f6b01ce8c9c4b39d415f6c0', '884f92440f11ea3f826310c4bcf9442908ec', 22, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('cad203947277595dd0777fa8d0a48661f2e8', '884f92440f11ea3f826310c4bcf9442908ec', 297, '4.52.25.2.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cadec04cc7c39955a3845ad488cee29ad3c4', 'feebca0c3e1e178553fecb7f905a4accbdf8', 295, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('caf3413b613d1e4c7c23e212eaa89f60b1d3', '484675c0690c147bc1ab990858241f65d704', 267, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('cb04908369ef8f40dec94736df98559c13b6', '884f92440f11ea3f826310c4bcf9442908ec', 208, '4.52.23.8.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cb8ce31075842836b3c0e18608f2ae07e1ed', '638f9ef95d6caead52d42928bded5b313c27', 148, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('cbb12f34414c490da7ef22d5b319f000aa50', '358ea4bf860ce17393ae5614aaa4afb2badd', 130, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('cbd0ed66e55783127acb50059a734180e866', '884f92440f11ea3f826310c4bcf9442908ec', 130, '4.52.21.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cbeb2349c58f92b533a5e105ff9c5af1bfc9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 234, '4.52.25.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('cbef619b9be8e3b0969a1865fbd6ce5b21f8', '638f9ef95d6caead52d42928bded5b313c27', 197, '4.52.21.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('cbfbddf45456255017a2a7c07f35b85d3299', '24bb6981131931d73aabea3f4eda805574ff', 133, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cc3ebafe24d848f904610111c96e7c8d2ded', 'feebca0c3e1e178553fecb7f905a4accbdf8', 238, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('cc4302672fdc0e72609f9ec9c1a0facad242', '884f92440f11ea3f826310c4bcf9442908ec', 319, '4.52.25.3.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cc63b8c0557728fd395c47dab37bc6cac485', '24bb6981131931d73aabea3f4eda805574ff', 68, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cc696820ee273821449e9da3f321c10fed7c', '484675c0690c147bc1ab990858241f65d704', 170, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('cc7873e28e15f41500d2a7dca8b046d712cd', '358ea4bf860ce17393ae5614aaa4afb2badd', 298, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ccc86baf8b99f388de798b8df941b1748117', 'feebca0c3e1e178553fecb7f905a4accbdf8', 227, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ccf0badc4e7fb63f4903e5220c2341934f43', 'feebca0c3e1e178553fecb7f905a4accbdf8', 214, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ccfa0b9004126b11bd66a2a7e28ca2618ab3', '638f9ef95d6caead52d42928bded5b313c27', 21, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('cd0510a37b218104d226f4d232f6cf3634d5', '24bb6981131931d73aabea3f4eda805574ff', 14, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cda6ba1445518a5060c714b17ec14b1583ee', '484675c0690c147bc1ab990858241f65d704', 155, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ce452022375ab3a0fdc3896bc3a08f90f582', '484675c0690c147bc1ab990858241f65d704', 121, '4.52.21.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('cebbae2f402a25aa9d2801fafed8f77922cd', '24bb6981131931d73aabea3f4eda805574ff', 301, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cec429703a99db4a33318f396a6c2ba5f276', '884f92440f11ea3f826310c4bcf9442908ec', 43, '4.52.19.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cf16277b9f83787fb7e9060a335d94c8ad0f', '884f92440f11ea3f826310c4bcf9442908ec', 288, '4.52.25.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cf1cc43c1b3f5d7acf85b14b3f39a8569a6c', '884f92440f11ea3f826310c4bcf9442908ec', 65, '4.52.20.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('cf38d36b7611e88247e69aa57c73581c252e', '358ea4bf860ce17393ae5614aaa4afb2badd', 281, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('cf73ff4e61afa089634a55c7463dce187e53', 'feebca0c3e1e178553fecb7f905a4accbdf8', 107, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('cf8b92540347083f02ce6c21beb87c62aa16', '484675c0690c147bc1ab990858241f65d704', 296, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('cfa552ed0ba582bd78ac660d809232e208c7', '24bb6981131931d73aabea3f4eda805574ff', 122, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cfaf52f570bdf3eaf7a1ccef4d890eeab712', '24bb6981131931d73aabea3f4eda805574ff', 286, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('cfbb0a234d7984f620b961a8b10b575d77cd', '484675c0690c147bc1ab990858241f65d704', 176, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('cfe5da389c624cc2f9b554e0e58afdba057e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 119, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('cfe5e2b0f859c600d0ac28133d759dacd1ae', '358ea4bf860ce17393ae5614aaa4afb2badd', 49, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d005d2e3df37a8915ca6fe3a952928d001f3', '358ea4bf860ce17393ae5614aaa4afb2badd', 228, '4.52.25.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d042b446fc81a5452cf52372cc47710871e4', '484675c0690c147bc1ab990858241f65d704', 274, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d04a327956c9020b99cb081860ae546f9b95', 'feebca0c3e1e178553fecb7f905a4accbdf8', 249, '4.52.25.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d0730d3e74c05d82a01b2c4d5b2bed2e497c', '24bb6981131931d73aabea3f4eda805574ff', 308, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d08485aa499727611829813bd5f1c6bbc70a', '884f92440f11ea3f826310c4bcf9442908ec', 48, '4.52.19.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d087d52b0a57faf21ee8fb16bf67c9e7b64c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 85, '4.52.20.0.15', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.0.15\",\"nama\":\"MAYDISTA LESTARI\",\"judul_jurnal\":\"Influence of Functional Convenience, Celebrity Endorsment, and Self-Esteem on Impulsion Purchasing\",\"level_jurnal\":\"national_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Rif\'ah Dwi Astuti\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"JOBS (Jurnal Of Business Studies)\",\"penulis\":\"Maydista Lestari, Endang Sulistiyani, Rif\'ah Dwi Astuti\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/jobs\\/article\\/view\\/6580\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('d09ece7bea1340d3ba2d08ca1190151a881e', '358ea4bf860ce17393ae5614aaa4afb2badd', 19, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d0a188f733e9412600f1a77cea591086e78b', '358ea4bf860ce17393ae5614aaa4afb2badd', 296, '4.52.25.2.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d0a1cc8b40640f07aede273601c05d5675d3', 'feebca0c3e1e178553fecb7f905a4accbdf8', 144, '4.52.21.0.19', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.21.0.19\",\"nama\":\"NAJLA DEBI HABSARI\",\"judul_jurnal\":\"From Preference to Purchase: How Value and Product Quality Influence Coffee Consumers\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:27'),
('d0d9531e20cad594c5b6fe3309a8774ed5e0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 105, '4.52.20.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d0dc345c19e62292264c6a067a21daf37eb0', 'feebca0c3e1e178553fecb7f905a4accbdf8', 296, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d1429d584dab0a3d6b6f3bcbc930410af20c', '358ea4bf860ce17393ae5614aaa4afb2badd', 248, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d15f6b486b8c7a9fbfadc9ef2d6019f567e5', '884f92440f11ea3f826310c4bcf9442908ec', 45, '4.52.19.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d166795f1c07f41b01d0543189b575aa855b', '484675c0690c147bc1ab990858241f65d704', 133, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d1b1d083d366769ecde88df817dfbbb5ca49', '884f92440f11ea3f826310c4bcf9442908ec', 248, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d1d298d7c337f844db2ce58c8744bd193278', '884f92440f11ea3f826310c4bcf9442908ec', 249, '4.52.25.1.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d239ca52c7fc2a149e18695e5623d2a8b334', '24bb6981131931d73aabea3f4eda805574ff', 84, '4.52.20.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d27078a4642576d04f97331c38bf9f0226a5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 49, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('d2a2db2e2893bed24d8e911e292a8dbe513b', '24bb6981131931d73aabea3f4eda805574ff', 246, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d2e43aa1a40982a7dfc35e4a97e1bf44f366', '24bb6981131931d73aabea3f4eda805574ff', 165, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d35406629d597e517051d1c49f9b381bd7f1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 182, '4.52.21.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d35f4406302f5bc29a176056f6904ff8de4d', '358ea4bf860ce17393ae5614aaa4afb2badd', 189, '4.52.21.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d362e4874c1091142e9838272e5a3c041327', '884f92440f11ea3f826310c4bcf9442908ec', 103, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d36969dd5036e8a388e7c1c7583acc8f17cf', '638f9ef95d6caead52d42928bded5b313c27', 78, '4.52.20.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d3b1fc5588dc046c122364fde879ad9e7d79', '358ea4bf860ce17393ae5614aaa4afb2badd', 287, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d3b78563982e709ca30b0654f68fe1cc6a16', 'feebca0c3e1e178553fecb7f905a4accbdf8', 338, '4.52.19.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d3ebec22b7bb7bcbe6bf2fb0fddbad4eab9e', '884f92440f11ea3f826310c4bcf9442908ec', 301, '4.52.25.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d40291b5fff8f9d97fc25618ea2914c031b9', '884f92440f11ea3f826310c4bcf9442908ec', 216, '4.52.25.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d40b021e41cc634a085ddfdfc74731683536', '484675c0690c147bc1ab990858241f65d704', 123, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d4196e70e7a6b53a31c91bfd1e9e0e4c033d', '24bb6981131931d73aabea3f4eda805574ff', 28, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d44dcf13becdb6a549010d072634348a1c09', '884f92440f11ea3f826310c4bcf9442908ec', 105, '4.52.20.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d45fb0c9be52b6b3339914a89d1b769b1c1f', '884f92440f11ea3f826310c4bcf9442908ec', 290, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d4720743360288118afd1b428e4b3c265a2f', '884f92440f11ea3f826310c4bcf9442908ec', 328, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d47a458f184e97c6d5ade275ab72e19d8f1e', '884f92440f11ea3f826310c4bcf9442908ec', 293, '4.52.25.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d48568ee60a6a15abf6cc51ad428209fc7a1', '884f92440f11ea3f826310c4bcf9442908ec', 223, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d4b12828f799b127c81f7b8da39c248305dc', '484675c0690c147bc1ab990858241f65d704', 160, '4.52.21.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d4ea3dbd15fee251109175e9612d54de6781', 'feebca0c3e1e178553fecb7f905a4accbdf8', 279, '4.52.25.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d4f4d452adfcbe79013178f529aad5d2c9a7', '638f9ef95d6caead52d42928bded5b313c27', 250, '4.52.25.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d517965dda3653ee6ce18208c9007b58ccc6', '484675c0690c147bc1ab990858241f65d704', 71, '4.52.20.0.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d57d0c91d5e3d5affe253c53b4ed2c0a54c7', '638f9ef95d6caead52d42928bded5b313c27', 177, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d5d92faf1ea539fac023d12a1a9caa5331f7', '24bb6981131931d73aabea3f4eda805574ff', 237, '4.52.25.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d5e7d34c676b707c4902e0f62cb0bda5614b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 37, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('d603802f3cfe5fc99a4c46301b16c76b536f', '358ea4bf860ce17393ae5614aaa4afb2badd', 238, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d61e6369e6962fb3f30af26f4945e331ffe9', '24bb6981131931d73aabea3f4eda805574ff', 217, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d6697dc9598153606bfb21d1a65aa5146d81', '484675c0690c147bc1ab990858241f65d704', 186, '4.52.21.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d67134284bc35e7a74c32ce1c89ccb8669c1', '358ea4bf860ce17393ae5614aaa4afb2badd', 244, '4.52.25.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d6a9c4d941918ac94a96d0e7741a33575800', '638f9ef95d6caead52d42928bded5b313c27', 304, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d7080d053bc55d288a9fa7c0427c3fb68da0', '358ea4bf860ce17393ae5614aaa4afb2badd', 207, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d73e131412b832d6e5b25a669e25443bbf6c', '638f9ef95d6caead52d42928bded5b313c27', 132, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d759d706854c38f8c0d57395eca1f1b8ef5a', '358ea4bf860ce17393ae5614aaa4afb2badd', 156, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d792ab9cf49defed0a4903aec817a9d8efd4', '484675c0690c147bc1ab990858241f65d704', 223, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d7a07bff88b7d35187d33e072dc3c8a5358f', '638f9ef95d6caead52d42928bded5b313c27', 128, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d7bc88b324e8e825d08116f79558b7977c5f', '638f9ef95d6caead52d42928bded5b313c27', 65, '4.52.20.0.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d7bdc2ba682bd6a6f62b5e8911294d4fa766', '24bb6981131931d73aabea3f4eda805574ff', 302, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d807b87134c03a053cf77b344da0a67c2672', '358ea4bf860ce17393ae5614aaa4afb2badd', 234, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d80f20fe2d96f2f27d351f3601ddb81db603', 'feebca0c3e1e178553fecb7f905a4accbdf8', 247, '4.52.25.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d861deff5b0d80366f486da4f78e9436f24b', '24bb6981131931d73aabea3f4eda805574ff', 179, '4.52.21.2.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d8770912d94c911b1198cf4e3502b28bef46', '484675c0690c147bc1ab990858241f65d704', 73, '4.52.20.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d87880be7f57b96b89f7757f6a84f9dee456', '884f92440f11ea3f826310c4bcf9442908ec', 139, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d8a91b0e8993301ba303dd2466f8d2a7aa42', '638f9ef95d6caead52d42928bded5b313c27', 259, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d8c1da33d77521961275a18a9372e9bc8d27', '638f9ef95d6caead52d42928bded5b313c27', 277, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d8c36e61c57b67727d3adc4b0c605602a211', '358ea4bf860ce17393ae5614aaa4afb2badd', 24, '4.52.19.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d8d79a4673a69a0cea10a2776e9ab137f499', '24bb6981131931d73aabea3f4eda805574ff', 42, '4.52.19.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d8d9300c52bef84f9e4efff4b1c10acdb99c', '484675c0690c147bc1ab990858241f65d704', 39, '4.52.19.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('d8e6991bde6106b438555776c0a59a401a07', '884f92440f11ea3f826310c4bcf9442908ec', 167, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d8eb43faba1b49fda767dd39c8b99deca31d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 230, '4.52.25.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d8ed38d7fd1ce98cf617eb7058bb483b67fb', 'feebca0c3e1e178553fecb7f905a4accbdf8', 183, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('d916390b238230ec1481019f2165dd4b267d', '884f92440f11ea3f826310c4bcf9442908ec', 44, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d9464c44e298b0afbf3f2b29d71714e8f726', '358ea4bf860ce17393ae5614aaa4afb2badd', 239, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d954a0cfcab54ecadf0f1805eaf3139036fb', '884f92440f11ea3f826310c4bcf9442908ec', 262, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('d97dad90216e60a32b76c574176d29346fb5', '24bb6981131931d73aabea3f4eda805574ff', 77, '4.52.20.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('d98964d48b2cd88d1a210359e98f427595b1', '638f9ef95d6caead52d42928bded5b313c27', 309, '4.52.25.3.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('d9cf0ed5288553a84453d9f1dffdc6e1b5c7', '358ea4bf860ce17393ae5614aaa4afb2badd', 55, '4.52.19.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('d9eeabd68d7cb1255a90658251507f63135a', '24bb6981131931d73aabea3f4eda805574ff', 187, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('da0ee22958f8565f8ae250d3d04bb496d5a1', '484675c0690c147bc1ab990858241f65d704', 72, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('da1252c275b2fafbfab978e3e452aa571ad4', '358ea4bf860ce17393ae5614aaa4afb2badd', 277, '4.52.25.2.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('da397416c1d2a6b129db70bfcc877fce0fb9', 'feebca0c3e1e178553fecb7f905a4accbdf8', 194, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('da62bb3ea5649467a5404f395bfbfc603119', '638f9ef95d6caead52d42928bded5b313c27', 68, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('dab6440140501ef5f16e186180f305fd4cbb', '24bb6981131931d73aabea3f4eda805574ff', 32, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('dacf76cea70137d6c719f619058203df3564', '638f9ef95d6caead52d42928bded5b313c27', 235, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('dadfec762c9cc15c2e0041a479cba4d6da1d', '24bb6981131931d73aabea3f4eda805574ff', 257, '4.52.25.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('daf15dd609a3b906c27256d026763171958b', '884f92440f11ea3f826310c4bcf9442908ec', 28, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('dafabeade87eb04bbd2e3559dcf6159599be', '484675c0690c147bc1ab990858241f65d704', 172, '4.52.21.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('db0114c3593aff04e81ef9a600b01732a0ce', '24bb6981131931d73aabea3f4eda805574ff', 241, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('db02ec6664869e31174bcc68d1febbdf533d', '484675c0690c147bc1ab990858241f65d704', 45, '4.52.19.1.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('db0afaa0c901316edac4223d18d7ca61a5a4', '358ea4bf860ce17393ae5614aaa4afb2badd', 310, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('db438852956a772a8c01ddf7a8436b70dd93', '884f92440f11ea3f826310c4bcf9442908ec', 47, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('db475afbd649cc1c40182f6e726fa7795161', '24bb6981131931d73aabea3f4eda805574ff', 190, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('db6368be3cd34bc1af8d10c9843a694b502a', '24bb6981131931d73aabea3f4eda805574ff', 146, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('db956699f61ee9c892a07821cb3a0647e97a', '24bb6981131931d73aabea3f4eda805574ff', 11, '4.52.19.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('db98906f65cc8b92aaf102aa149f51b5e886', 'feebca0c3e1e178553fecb7f905a4accbdf8', 246, '4.52.25.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('dba3f14f0980f63946aeb0bc555f14095ccb', '638f9ef95d6caead52d42928bded5b313c27', 217, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('dbb646f9ae2996b4662fad8f72e1e7d96921', '884f92440f11ea3f826310c4bcf9442908ec', 326, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('dbd148c97f278236729be42ba761046e21bb', '358ea4bf860ce17393ae5614aaa4afb2badd', 282, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dbe7e3b5d0efc76087317880016eb7d2d334', '358ea4bf860ce17393ae5614aaa4afb2badd', 224, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dc14657397d1dbbf70f984ac35c97a0a9c5e', '358ea4bf860ce17393ae5614aaa4afb2badd', 314, '4.52.25.3.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dc4b2a0e72e8777bab48e8e00e9a4e1e9629', '358ea4bf860ce17393ae5614aaa4afb2badd', 21, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dc5d36e3dcc1ab72923cddcd87a564feb28b', '638f9ef95d6caead52d42928bded5b313c27', 164, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('dc82215958d5634b860c5ec4afd842124560', '24bb6981131931d73aabea3f4eda805574ff', 218, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('dcac21cae2d73f6a3676f2b470bbebe02e95', '24bb6981131931d73aabea3f4eda805574ff', 100, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('dcb8a7a1b23aeed27b74656b3143019abfc9', '884f92440f11ea3f826310c4bcf9442908ec', 42, '4.52.19.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('dcc4a9ec5f0683dc75ae6f4f7c964f28ac93', '884f92440f11ea3f826310c4bcf9442908ec', 292, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('dcd6749e96283be01976de587adc48b9607a', '24bb6981131931d73aabea3f4eda805574ff', 258, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('dd319381fb317ccbe7a101e4b55cb9e5a14a', '358ea4bf860ce17393ae5614aaa4afb2badd', 245, '4.52.25.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dd4b643fdb2e7e2b1d9398d164c34e802f9b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 61, '4.52.19.1.21', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.19.1.21\",\"nama\":\"NUR NELISA ADAH\",\"judul_jurnal\":\"Membangun Kelayakan E-Tourism Berbasis Video Panorama 360 Dalam Rangka Strategi Push Promote Untuk Mengeksplorasi Daya Tarik Destinasi\",\"level_jurnal\":\"international\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Sartono, Iwan Hermawan\",\"tahun_publikasi\":2021,\"nama_jurnal_konferensi\":\"Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat\",\"penulis\":\"Sartono, Iwan Hermawan, Nur Nelisa Adah\",\"url_publikasi\":\"https:\\/\\/jurnal.polines.ac.id\\/index.php\\/Sentrikom\\/article\\/view\\/2731\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('dd6593b495a1677ee591848feae1c8db448b', '484675c0690c147bc1ab990858241f65d704', 324, '4.52.25.3.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('dd6d5f24ccf2f753e67232ed69fb29065fdc', '484675c0690c147bc1ab990858241f65d704', 218, '4.52.25.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ddbe7b8d0eb4a57f513afd3888ea84b52ce1', '358ea4bf860ce17393ae5614aaa4afb2badd', 268, '4.52.25.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ddcf18f36f3e42b8008c4ba55a6839f7ad6e', '24bb6981131931d73aabea3f4eda805574ff', 235, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('de3f3b5a1d9e0b163f4641caf896cf4db10d', '638f9ef95d6caead52d42928bded5b313c27', 122, '4.52.21.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('de420381e1b8890160d2371716f53f77110e', '24bb6981131931d73aabea3f4eda805574ff', 181, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('de840f18a82e92d4f7513d1cc89f65a6ad29', '884f92440f11ea3f826310c4bcf9442908ec', 281, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('de9eeb61d4cb5b596163fe2a7da0e2b088de', '484675c0690c147bc1ab990858241f65d704', 51, '4.52.19.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ded6008010df5fcd1c6fee1722d4ab4700da', '358ea4bf860ce17393ae5614aaa4afb2badd', 160, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dee12235dc5fb1d0f7b90cb593240911ace5', '884f92440f11ea3f826310c4bcf9442908ec', 151, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('df038c0c74ceda9135d07f209e3c01db38f8', '358ea4bf860ce17393ae5614aaa4afb2badd', 71, '4.52.20.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('df421ab22ebdd8665b728672b1f72028c6c0', '884f92440f11ea3f826310c4bcf9442908ec', 109, '4.52.20.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('df50e8e791ad278249bf142201186789ba10', '358ea4bf860ce17393ae5614aaa4afb2badd', 194, '4.52.21.2.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('df634873c1bb25178c00ac73d7837560fa4c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 126, '4.52.20.1.30', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.20.1.30\",\"nama\":\"ZAHRASEA FARAH ILYASA\",\"judul_jurnal\":\"How Firms Achieve Competitive Advantage And Business Performance: Dynamic Capability Theory Point of View\",\"level_jurnal\":\"national_non_accredited\",\"jenis_perolehan\":\"kolaborasi_dosen\",\"nama_dosen\":\"Endang Sulistiyani, Rustono Rustono, Rif\\u2019ah Dwi Astuti, Sri Wahyuni, Carli Carli\",\"tahun_publikasi\":2024,\"nama_jurnal_konferensi\":\"Asian Journal of Management, Entrepreneurship and Social Science\",\"penulis\":\"Endang Sulistiyani, Rustono Rustono, Zahrasea Farah Ilyasa, Rif\\u2019ah Dwi Astuti, Sri Wahyuni, Carli Carli\",\"url_publikasi\":\"https:\\/\\/mail.ajmesc.com\\/index.php\\/ajmesc\\/article\\/view\\/1147\",\"deskripsi\":null}', '2026-03-11 08:52:27'),
('df83675e9478fdae2d2544b6bb81d42be949', '884f92440f11ea3f826310c4bcf9442908ec', 9, '4.52.18.0.03', 'inserted', 'Data berhasil diinsert.', '{\"nim\":\"4.52.18.0.03\",\"nama\":\"AMANDA DEA SAFIRA\",\"nama_produk\":\"Keripik Ubi\",\"kategori_produk\":\"makanan_minuman\",\"kategori_produk_lainnya\":null,\"tanggal_adopsi\":2020,\"mitra_adopsi\":null,\"lokasi\":null,\"deskripsi\":null}', '2026-03-06 09:56:30'),
('df894ea5fe5c6adcfa21b7ae965fb92195f2', '484675c0690c147bc1ab990858241f65d704', 30, '4.52.19.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('dfa239aed17067798d8fbdd2d7fa23be222e', '358ea4bf860ce17393ae5614aaa4afb2badd', 132, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('dfb6f18acd4bf1cdc167d9caa47c26c69ae4', '484675c0690c147bc1ab990858241f65d704', 108, '4.52.20.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('dfe974dfac2441b991f5fd9ffcb6d34aaae5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 20, '4.52.19.0.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('dfebc9a9161dffd028b89f652bfe6217777e', '638f9ef95d6caead52d42928bded5b313c27', 55, '4.52.19.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e01cc10f57c47138776be3862e0df795008d', '24bb6981131931d73aabea3f4eda805574ff', 269, '4.52.25.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e01ef23e68a6e2e114497df03aec6ec3f46f', '358ea4bf860ce17393ae5614aaa4afb2badd', 243, '4.52.25.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e0212c7c61ee29845f3111d70d58d1f1d57f', '358ea4bf860ce17393ae5614aaa4afb2badd', 42, '4.52.19.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e04ca7e9ade7b4a91b968a5cd9909b0e4553', '358ea4bf860ce17393ae5614aaa4afb2badd', 174, '4.52.21.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e066071e6239677e501fbecb615840c21fbd', '484675c0690c147bc1ab990858241f65d704', 192, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e0c5092efacc7b80751564c44e83e0e1c4b1', '358ea4bf860ce17393ae5614aaa4afb2badd', 308, '4.52.25.3.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e0e85b0914ba228566cc0af0f6f67ed179c3', '884f92440f11ea3f826310c4bcf9442908ec', 142, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e0f2bddb87edc7803a0467ed337f9dc47f1f', '358ea4bf860ce17393ae5614aaa4afb2badd', 93, '4.52.20.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e131942edea525671fdf632ce7d8a8b8305b', 'feebca0c3e1e178553fecb7f905a4accbdf8', 161, '4.52.21.1.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e137ed5b77cb130dd635c1314e6c35030c83', 'feebca0c3e1e178553fecb7f905a4accbdf8', 72, '4.52.20.0.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('e145d6a9114cbbaa2cb31ba7dccebed47b99', '638f9ef95d6caead52d42928bded5b313c27', 156, '4.52.21.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e16f500be1a73c0533923850e6f2672f3243', '638f9ef95d6caead52d42928bded5b313c27', 181, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e1a1c075ce90dc962f1ed9a00e137d0cfc4b', '638f9ef95d6caead52d42928bded5b313c27', 233, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e22d5b1f4ac77cf45a20346d08cc896c7cd4', '484675c0690c147bc1ab990858241f65d704', 204, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e25e5e46b17eaa5e0c6515721e4cf95a844c', '884f92440f11ea3f826310c4bcf9442908ec', 224, '4.52.25.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e26a8933059a8ab4a66fffaaf68068f4f835', '24bb6981131931d73aabea3f4eda805574ff', 143, '4.52.21.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e2b567216243496292afafcaa53915bbbb84', '884f92440f11ea3f826310c4bcf9442908ec', 113, '4.52.20.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e3020deac27f89eaa0e6774133f4e131f279', 'feebca0c3e1e178553fecb7f905a4accbdf8', 225, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e306575d3bbe6568424ce710072fda70448c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 124, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e33b924c0fc54b36b38b42c820bf114097e8', '884f92440f11ea3f826310c4bcf9442908ec', 62, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e340c88ea3be644b38976fc7cfcbe9ab9f13', 'feebca0c3e1e178553fecb7f905a4accbdf8', 334, '4.52.25.3.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e3438b722759b84e7b05881bb3efac07c954', '884f92440f11ea3f826310c4bcf9442908ec', 233, '4.52.25.0.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e38386fe7b484a8787e1c372e16ac47f8599', '358ea4bf860ce17393ae5614aaa4afb2badd', 169, '4.52.21.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e417a80baf7c5038efdc8f7d0e0000296237', '484675c0690c147bc1ab990858241f65d704', 166, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e4182cde104f6a16547e38325bbc7973f716', '638f9ef95d6caead52d42928bded5b313c27', 14, '4.52.19.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e4189cd9a4a27c8164be13558ea18fe5e073', '24bb6981131931d73aabea3f4eda805574ff', 125, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e44d1a2389fca919f3a9dfde6ea6f5265aa5', '358ea4bf860ce17393ae5614aaa4afb2badd', 52, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e47749220920b36d6c8bc0a34e1e2fb1f7e7', '484675c0690c147bc1ab990858241f65d704', 193, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e47a68e091581f9bb5b6975646958b0a663e', 'feebca0c3e1e178553fecb7f905a4accbdf8', 294, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e4bd36854b356e9b5e9aa227e1a12218b497', '884f92440f11ea3f826310c4bcf9442908ec', 75, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e4bf76bbed919211f7ada38118e1d6f5d06f', '484675c0690c147bc1ab990858241f65d704', 98, '4.52.20.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e4c6eca2eb5229c35d7eb0823a8cacb871df', '638f9ef95d6caead52d42928bded5b313c27', 42, '4.52.19.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e4c7d6391066b04982cbceaa93a8f39d316a', '638f9ef95d6caead52d42928bded5b313c27', 273, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e4e201a94a73662be763db26f925e8100220', '638f9ef95d6caead52d42928bded5b313c27', 324, '4.52.25.3.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e5179c2e14d5dd1c445e90985e0a2a7a2d68', '358ea4bf860ce17393ae5614aaa4afb2badd', 193, '4.52.21.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e54d464548105688addf21682c09560bed3d', '484675c0690c147bc1ab990858241f65d704', 109, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e56d0610b994266a57916665e35cd0fefa03', '24bb6981131931d73aabea3f4eda805574ff', 320, '4.52.25.3.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e577f4efe496a7ef96654cd2c47ec0a7f86d', '24bb6981131931d73aabea3f4eda805574ff', 52, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e5a4aafeac1befa20ac2e90f40f341832d9e', '884f92440f11ea3f826310c4bcf9442908ec', 299, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e5c3cbd5b519b67c920164e64687f028b04a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 145, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e5d772a5a83d8a6891c952d46cbf69dd97ec', '884f92440f11ea3f826310c4bcf9442908ec', 289, '4.52.25.2.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e627b30dd5607647b4cce8f1c65edfd55664', '484675c0690c147bc1ab990858241f65d704', 331, '4.52.25.3.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e63d19b36becbb752e302bac04fa4cd4dfca', '638f9ef95d6caead52d42928bded5b313c27', 190, '4.52.21.2.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('e6419c0dbe15bf5e487c702dbaf230812cc5', '884f92440f11ea3f826310c4bcf9442908ec', 31, '4.52.19.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e6432bdfba69e59159fe5917e61385a79575', 'feebca0c3e1e178553fecb7f905a4accbdf8', 317, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e6674eb2868b03515160328e42b55a00a5fe', '24bb6981131931d73aabea3f4eda805574ff', 34, '4.52.19.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e679e55e559ce7fcb70b881abee15367996e', '884f92440f11ea3f826310c4bcf9442908ec', 125, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e717ac926ff9cf3c8d6a3d9d2beb7857306e', '484675c0690c147bc1ab990858241f65d704', 206, '4.52.23.8.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e732d5a0d2b4e3bb4be25d17db57d7e581e7', '884f92440f11ea3f826310c4bcf9442908ec', 222, '4.52.25.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e736bfa57f0a03a141297eee46cb2d4ddea6', '484675c0690c147bc1ab990858241f65d704', 299, '4.52.25.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e75a68b8b9a1cac329af284a7f6e86b8e8db', 'feebca0c3e1e178553fecb7f905a4accbdf8', 156, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e75ff7903643c38c31390d180c0426b762f8', '884f92440f11ea3f826310c4bcf9442908ec', 55, '4.52.19.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e791b44ca1aa1afe64a4aefa938b3469167e', '358ea4bf860ce17393ae5614aaa4afb2badd', 231, '4.52.25.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e79ddbf1f3221c8fcbf96a35913c952772d5', '358ea4bf860ce17393ae5614aaa4afb2badd', 206, '4.52.23.8.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e79de4754ebf1ecb411b5c7f93a506582eab', '24bb6981131931d73aabea3f4eda805574ff', 158, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e7a939ba5f7a10a3604b367a8996f8c31fb0', '484675c0690c147bc1ab990858241f65d704', 143, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e7a9f053ac199cd1b51fe9dcf4a7b017409b', '358ea4bf860ce17393ae5614aaa4afb2badd', 146, '4.52.21.0.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e7b54c0f7e9e0029e3065a6ab789e4389137', '884f92440f11ea3f826310c4bcf9442908ec', 294, '4.52.25.2.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('e7c39179775517ce1ae7a82f3f1bfacd4d65', 'feebca0c3e1e178553fecb7f905a4accbdf8', 302, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e7d6b9d9969aee0be01033154fbf7bdac491', '24bb6981131931d73aabea3f4eda805574ff', 60, '4.52.19.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e7e15866a5ad9f35bcf1d1d091c0214f888f', '358ea4bf860ce17393ae5614aaa4afb2badd', 147, '4.52.21.0.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e7fc0d4f63eb85f1da3291f0e76b387db314', 'feebca0c3e1e178553fecb7f905a4accbdf8', 285, '4.52.25.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e803cef6abf899d871fe0e4892b74439a434', '24bb6981131931d73aabea3f4eda805574ff', 256, '4.52.25.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e82cddd706b3a6bc0613254829384b3a479a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 199, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e8372773166a51bd4e9b65b71957a3683959', '358ea4bf860ce17393ae5614aaa4afb2badd', 251, '4.52.25.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('e844e07bfb7310b597b3786a7dcc3496faf7', '484675c0690c147bc1ab990858241f65d704', 235, '4.52.25.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('e8487fb3636372755aa4bf8404493a36a366', 'feebca0c3e1e178553fecb7f905a4accbdf8', 188, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e8b7973b741d00b9595bbb08af2696f4a3ae', '24bb6981131931d73aabea3f4eda805574ff', 170, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e8e78f86c9ecd9aecdf97931ac38cb9aa193', 'feebca0c3e1e178553fecb7f905a4accbdf8', 273, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e8f01ae9dccfa19ea0f67f3c28689ab1ca0f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 313, '4.52.25.3.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('e90f90d7dd5edca628453336db494a010571', '24bb6981131931d73aabea3f4eda805574ff', 259, '4.52.25.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('e9fd1f99bce760cac47405a118e621d12623', '884f92440f11ea3f826310c4bcf9442908ec', 15, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ea306982c9f1fe2b7acb84c1bcf153cfe884', '484675c0690c147bc1ab990858241f65d704', 84, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ea4879e13c27069739875508820aac01687a', '358ea4bf860ce17393ae5614aaa4afb2badd', 196, '4.52.21.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ea6888784bf1f13614e937d5360c1b333c03', '638f9ef95d6caead52d42928bded5b313c27', 170, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ea699f67124b8a58f5661f3ebf0cb133e955', '358ea4bf860ce17393ae5614aaa4afb2badd', 85, '4.52.20.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ea6ee757d2e0be769692701adce9705d24e4', '884f92440f11ea3f826310c4bcf9442908ec', 191, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ea93f76fa02de97ad53d27516a854d7c919c', '638f9ef95d6caead52d42928bded5b313c27', 62, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ea99f2c86b706d3af4057280848c8c76f23a', '358ea4bf860ce17393ae5614aaa4afb2badd', 129, '4.52.21.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('eaba9a943c79713aeeecc060c4f8afb0fb26', 'feebca0c3e1e178553fecb7f905a4accbdf8', 80, '4.52.20.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('eaf0ff2c28734cf01e24ca0d776eb65548d6', '884f92440f11ea3f826310c4bcf9442908ec', 80, '4.52.20.0.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('eb04de3b7cad1167cd02cf0ca8ab4971a616', '358ea4bf860ce17393ae5614aaa4afb2badd', 326, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('eb28dfab43cabea37e1e7dee46f375eee953', '884f92440f11ea3f826310c4bcf9442908ec', 192, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('eb336ff367d4e495f23588b6d8e0a5c6a562', '358ea4bf860ce17393ae5614aaa4afb2badd', 304, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('eb64e140bfad4f1bfd903edb34520a8b33ef', '884f92440f11ea3f826310c4bcf9442908ec', 21, '4.52.19.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('eb8a3dab8c37aec0f83e43633dee529b20f1', '24bb6981131931d73aabea3f4eda805574ff', 292, '4.52.25.2.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('eb930e934f87cd6358fe8f6228e99a54b315', '24bb6981131931d73aabea3f4eda805574ff', 88, '4.52.20.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ebef815420872ed37daa7b60e89bfb0ad0eb', '884f92440f11ea3f826310c4bcf9442908ec', 111, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ec163e1499da3d90eb651eadcda55e20072d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 18, '4.52.19.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('ec45aa6e437bbdd3fbf8c3a2b77aaa67ef32', '24bb6981131931d73aabea3f4eda805574ff', 304, '4.52.25.3.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ec622674b6cc7bb37753059184715200b34f', '358ea4bf860ce17393ae5614aaa4afb2badd', 200, '4.52.21.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ec6f79c01b7331161180212ea468d0d0936f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 149, '4.52.21.0.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ec7a0eb9194e34fe8810381dff9554296788', '884f92440f11ea3f826310c4bcf9442908ec', 37, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ec867952119f3be0be7e5206949d09e8ed29', '484675c0690c147bc1ab990858241f65d704', 212, '4.52.23.8.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ec9408ed0678661ac12e48e37808c67a08cb', '884f92440f11ea3f826310c4bcf9442908ec', 59, '4.52.19.1.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ecc4641be49d0a23aeb0bdd5b5be8b6dc540', 'feebca0c3e1e178553fecb7f905a4accbdf8', 307, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ecd57de6f4888d64f2477282a11ca577d8d9', '24bb6981131931d73aabea3f4eda805574ff', 151, '4.52.21.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ece0f4148e87611ec1d80510ddf98d4dbcbf', '24bb6981131931d73aabea3f4eda805574ff', 220, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ececf2a5b2063c86647bd36063230b0cdc0f', '484675c0690c147bc1ab990858241f65d704', 111, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ed00813378ff062520e76cb0f50d2a4936b1', '24bb6981131931d73aabea3f4eda805574ff', 254, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ed082ae4ae81a6f1024865d5fb38f23ea09b', '884f92440f11ea3f826310c4bcf9442908ec', 214, '4.52.23.8.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ed2e467308bfa24fa3c8fad794b7a968b231', '484675c0690c147bc1ab990858241f65d704', 231, '4.52.25.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10');
INSERT INTO `prestasi_import_log_details` (`id`, `import_log_id`, `row_number`, `nim_raw`, `status`, `message`, `raw_payload_json`, `created_at`) VALUES
('ed94f59a2fc3ebb6f7806b6df9ca1b418c5d', '638f9ef95d6caead52d42928bded5b313c27', 203, '4.52.21.2.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('edcade14d366822622344aeacf43b85c3a36', 'feebca0c3e1e178553fecb7f905a4accbdf8', 17, '4.52.19.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('edd28a4a99bc1426a8311af31f33441d8ce7', '638f9ef95d6caead52d42928bded5b313c27', 282, '4.52.25.2.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ede285170a008c56c5372dc71f929f8ae10e', '638f9ef95d6caead52d42928bded5b313c27', 135, '4.52.21.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('edeaec89642031f370d6f86e7925d15544df', '484675c0690c147bc1ab990858241f65d704', 20, '4.52.19.0.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ee0909af69043c08246209fe1417591b783d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 274, '4.52.25.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ee6660cdcebe7a7d99e37b02da26040f4b6f', '484675c0690c147bc1ab990858241f65d704', 282, '4.52.25.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ee6748ed57ae67a22d430b71afa7d5fc577c', '884f92440f11ea3f826310c4bcf9442908ec', 260, '4.52.25.1.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ee8479ecc3cbdf273608619a00cb0e97a69c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 146, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ee9ecab717666126adb24a5244a3f516478e', '884f92440f11ea3f826310c4bcf9442908ec', 119, '4.52.20.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ee9fda5b5ff4a134d6ea2e4ecfe586195873', '24bb6981131931d73aabea3f4eda805574ff', 167, '4.52.21.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('eebe2d60fccc8d396a46960c9a441a87fae4', '484675c0690c147bc1ab990858241f65d704', 162, '4.52.21.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('eee6fbd4dc361926b819d24e6fd40cb8411e', '638f9ef95d6caead52d42928bded5b313c27', 114, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ef0fbd3cb077e493fe1112480385101450da', '638f9ef95d6caead52d42928bded5b313c27', 220, '4.52.25.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ef537d386a1c71d35a04ad240f1b8dc422cb', '358ea4bf860ce17393ae5614aaa4afb2badd', 37, '4.52.19.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ef5c9ecc57dd9ee6a4e1f53f5ddf9db23d11', '638f9ef95d6caead52d42928bded5b313c27', 69, '4.52.20.0.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ef5f0f5ea53016a2d9c1044ef4dec4eb8497', '884f92440f11ea3f826310c4bcf9442908ec', 116, '4.52.20.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ef8716016988e5b0b8a0f19760264373b25a', '358ea4bf860ce17393ae5614aaa4afb2badd', 177, '4.52.21.2.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ef8a315369627cb9ba8e33a36c5a641a517c', '484675c0690c147bc1ab990858241f65d704', 292, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('efb9e0bb217b94d9eaa41225eb613ec537e7', '884f92440f11ea3f826310c4bcf9442908ec', 27, '4.52.19.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('efdec37479f3b8c6da90625f649b8e6f3725', '358ea4bf860ce17393ae5614aaa4afb2badd', 148, '4.52.21.0.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('eff6e43595175669bf598df9131aa076a018', '884f92440f11ea3f826310c4bcf9442908ec', 273, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('eff716f6267ef3c643f70105f76833aa9cd7', '24bb6981131931d73aabea3f4eda805574ff', 325, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f022b524402585187dffcc4d0e4f4cab13f5', 'feebca0c3e1e178553fecb7f905a4accbdf8', 179, '4.52.21.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f033db5368161361cd78662555dc7aacfe23', '884f92440f11ea3f826310c4bcf9442908ec', 254, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f058684e2968b33bc484bca587ec9beea794', '358ea4bf860ce17393ae5614aaa4afb2badd', 170, '4.52.21.1.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f05cf39bff205803723f3b62b16725e13a72', '484675c0690c147bc1ab990858241f65d704', 318, '4.52.25.3.16', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f0977f19793d4c4fe9c8486ae7823cc6d18d', '884f92440f11ea3f826310c4bcf9442908ec', 187, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f09b8e3cd89b518dd4363a4c2fecc65a7f82', '484675c0690c147bc1ab990858241f65d704', 134, '4.52.21.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f1095554acc4fa15484aeaf98c7fb7b861be', '484675c0690c147bc1ab990858241f65d704', 112, '4.52.20.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f10e593112c9aa7c09afb56ede026727cab5', '358ea4bf860ce17393ae5614aaa4afb2badd', 141, '4.52.21.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f12d301a2d326788d7efa62f7b59f8714c91', '484675c0690c147bc1ab990858241f65d704', 185, '4.52.21.2.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f1522fac3e177645eb8e04c30368100f6993', '638f9ef95d6caead52d42928bded5b313c27', 39, '4.52.19.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f17a1d72b507dac71c666c630c12f96648cf', '24bb6981131931d73aabea3f4eda805574ff', 47, '4.52.19.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f1aeceb4c47a798b41709e5260d98c463a88', '358ea4bf860ce17393ae5614aaa4afb2badd', 192, '4.52.21.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f229df2730bf2b702f2f447d77c904a0e94a', '358ea4bf860ce17393ae5614aaa4afb2badd', 97, '4.52.20.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f230cf20e3112fd4e454adc430c19bc4026d', '638f9ef95d6caead52d42928bded5b313c27', 176, '4.52.21.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f23eb1f98ba3239b3f9cca609246851c682d', '358ea4bf860ce17393ae5614aaa4afb2badd', 165, '4.52.21.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f250c364917a62aa22dc59253e5ca14b02df', '358ea4bf860ce17393ae5614aaa4afb2badd', 273, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f2577de908c5a36917c6e7399fcf45021236', '24bb6981131931d73aabea3f4eda805574ff', 22, '4.52.19.0.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f2b22becba95bedc03404e31f69d1ef33e48', '638f9ef95d6caead52d42928bded5b313c27', 75, '4.52.20.0.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f2c77f7b0c54505b2e03485c8bcab7476979', '484675c0690c147bc1ab990858241f65d704', 219, '4.52.25.0.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f2ee6b5b1d0203b1f673f1422f43e694ea75', '24bb6981131931d73aabea3f4eda805574ff', 238, '4.52.25.0.23', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f34e01bd606cafdc68bdb3a5a54ba6130456', '638f9ef95d6caead52d42928bded5b313c27', 104, '4.52.20.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f36552bc44d59226b04f86297ef6ff78dc2d', '638f9ef95d6caead52d42928bded5b313c27', 266, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f37b4a28a3555551128d4685a7b910b865b1', '884f92440f11ea3f826310c4bcf9442908ec', 101, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f3a4d518adfe047789bc96689b416033a296', '484675c0690c147bc1ab990858241f65d704', 129, '4.52.21.0.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f3d873b3bc04cf1bff575493b4d6e1dd5226', '884f92440f11ea3f826310c4bcf9442908ec', 49, '4.52.19.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f3f207e1d294f801d54430c4ef69ae656fa1', 'feebca0c3e1e178553fecb7f905a4accbdf8', 309, '4.52.25.3.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f3f300baf1f83aed16bd195005b63a854f4e', '638f9ef95d6caead52d42928bded5b313c27', 261, '4.52.25.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f4038108a510cf6817e1f05e7bd1f5045d42', '884f92440f11ea3f826310c4bcf9442908ec', 284, '4.52.25.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f408c696067acea382c7653c109ba1b0f0bc', 'feebca0c3e1e178553fecb7f905a4accbdf8', 139, '4.52.21.0.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f4f31bd4853e1c6bb3951145e5ab1b7f4b0e', '24bb6981131931d73aabea3f4eda805574ff', 162, '4.52.21.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f51e0f1236d2316015871effb21ec7539414', '358ea4bf860ce17393ae5614aaa4afb2badd', 264, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f5284c3347164167db8e2a2d3b5a1668d1a2', '484675c0690c147bc1ab990858241f65d704', 34, '4.52.19.0.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f52f4833e2bbb0b5129de45f99308d2ed571', '638f9ef95d6caead52d42928bded5b313c27', 149, '4.52.21.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f586c8678f6cb15bd10e22abceee0594a300', 'feebca0c3e1e178553fecb7f905a4accbdf8', 261, '4.52.25.1.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f5cf051c5a8edacafed45cf17b22bd5579dc', '484675c0690c147bc1ab990858241f65d704', 33, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f5f67d471a10bfb79cde112d9c3cb462a5e0', '358ea4bf860ce17393ae5614aaa4afb2badd', 68, '4.52.20.0.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f64c0d5ea9b70d37a54f14b6af05ec820c07', '884f92440f11ea3f826310c4bcf9442908ec', 158, '4.52.21.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f65efc85acb9c06a8982660edce14b84eccc', '24bb6981131931d73aabea3f4eda805574ff', 264, '4.52.25.1.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f67492f6055e285577d9dfb406e58288c6df', '484675c0690c147bc1ab990858241f65d704', 263, '4.52.25.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f68a4e9bc38d3b59d62d088b146a765f4bb6', '884f92440f11ea3f826310c4bcf9442908ec', 73, '4.52.20.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f6b82124aab3af4f0255b5921f20b5d0942f', '638f9ef95d6caead52d42928bded5b313c27', 15, '4.52.19.0.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f6dc7836fdf56aee470f12dd1637f39fd8d8', 'feebca0c3e1e178553fecb7f905a4accbdf8', 255, '4.52.25.1.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f6f2fdd1acdfa8d8a68f1ccded82b632ab6c', '24bb6981131931d73aabea3f4eda805574ff', 287, '4.52.25.2.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f75f5552e3c363e768f6b967cc211474c162', '638f9ef95d6caead52d42928bded5b313c27', 139, '4.52.21.0.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f771e6519f6d47efb06a400bbf546e0e12e3', '884f92440f11ea3f826310c4bcf9442908ec', 255, '4.52.25.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f77b9bbb4098a14be54b17f83484b5658a6f', '884f92440f11ea3f826310c4bcf9442908ec', 181, '4.52.21.2.05', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f77bde9e12f26b50288c2f16ab5f04733f63', '24bb6981131931d73aabea3f4eda805574ff', 273, '4.52.25.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f7ab764fb07609186aa5d795f39d43d13822', '484675c0690c147bc1ab990858241f65d704', 247, '4.52.25.1.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f7ad32948314cfcd6939865c2b526e7e758a', '884f92440f11ea3f826310c4bcf9442908ec', 235, '4.52.25.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f7db282b6aab3b5cca3b1fc4aa0babe6dcf0', '884f92440f11ea3f826310c4bcf9442908ec', 117, '4.52.20.1.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f7e3ff441602e1e1a2a5228d3e0641e71cdc', '484675c0690c147bc1ab990858241f65d704', 213, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f7e5070a4955a53c1bd5c475d3358c2e8532', '484675c0690c147bc1ab990858241f65d704', 11, '4.52.18.1.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f809f9b40a16d7545048ba163a9a5078917d', '484675c0690c147bc1ab990858241f65d704', 102, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f82096bbcc5f5ff9b62eb794bebef2f43c84', '484675c0690c147bc1ab990858241f65d704', 291, '4.52.25.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f82f9d9fffd2e7237f715ac633aac4b57219', '24bb6981131931d73aabea3f4eda805574ff', 95, '4.52.20.1.01', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f83c4c6d6c650eeb9dbe5a75cb684c71ad8c', '24bb6981131931d73aabea3f4eda805574ff', 313, '4.52.25.3.12', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f8462ba2e2d6d4b857e759d191156a1fae64', '638f9ef95d6caead52d42928bded5b313c27', 310, '4.52.25.3.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f86449a04f486f58a26fb8fa3f902328f690', '484675c0690c147bc1ab990858241f65d704', 189, '4.52.21.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f869f8e0ffdcfdf2ebadafda5a27dd0add40', 'feebca0c3e1e178553fecb7f905a4accbdf8', 185, '4.52.21.2.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('f86ee504f9be9d83a938dd30b703094d1bad', '638f9ef95d6caead52d42928bded5b313c27', 28, '4.52.19.0.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('f88da19a8cec664cd6f4a91f8c9063db6e1f', 'feebca0c3e1e178553fecb7f905a4accbdf8', 68, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('f891f15399be0dd5d56636a2909708dcea12', '484675c0690c147bc1ab990858241f65d704', 242, '4.52.25.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('f8e9736d5da11d3647da3aaf7ada97aacb6e', '358ea4bf860ce17393ae5614aaa4afb2badd', 101, '4.52.20.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('f8f9f07bba0f8eb3e08cfe536c766866bf19', '24bb6981131931d73aabea3f4eda805574ff', 155, '4.52.21.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('f8fc08aa3cdcfde00b1291af67b4425afa4e', '884f92440f11ea3f826310c4bcf9442908ec', 291, '4.52.25.2.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f93ec248ba208586da49b26be4fa9a9e8fec', '884f92440f11ea3f826310c4bcf9442908ec', 325, '4.52.25.3.24', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f983f8e6092502f3391ed8c8841a593772e5', '884f92440f11ea3f826310c4bcf9442908ec', 295, '4.52.25.2.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('f98c77f4be000b1b2f8debf895939f01f960', '358ea4bf860ce17393ae5614aaa4afb2badd', 118, '4.52.20.1.29', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fa026fc45b9ee81ffdcc7c5199a7a529518e', '24bb6981131931d73aabea3f4eda805574ff', 311, '4.52.25.3.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fa129ce29c3c56c0fab3cfe73b9981ba9b0b', '24bb6981131931d73aabea3f4eda805574ff', 266, '4.52.25.1.22', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fa18ec37d11d3c3b029220f02bf75fd2c72c', '484675c0690c147bc1ab990858241f65d704', 183, '4.52.21.2.06', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('fa223f932ac59b8df6655c2c348ff75a7227', '358ea4bf860ce17393ae5614aaa4afb2badd', 53, '4.52.19.1.18', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fa28147af43ed83dc0477749d82001f73cd7', '358ea4bf860ce17393ae5614aaa4afb2badd', 265, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fa955a4deafb0b76ba7962137faf1fc33eb5', '24bb6981131931d73aabea3f4eda805574ff', 137, '4.52.21.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fa97e4dcc1df12082518c40c26aff595edea', '638f9ef95d6caead52d42928bded5b313c27', 90, '4.52.20.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fa99429fa162f785a984b710c20842991e81', 'feebca0c3e1e178553fecb7f905a4accbdf8', 335, '4.52.25.3.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('faacd3baa81a08c98c8f771d3449d2c293b2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 115, '4.52.20.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fabb9cdf5f4bcfa8829c4ce08500ca53527b', '484675c0690c147bc1ab990858241f65d704', 174, '4.52.21.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('fabd183c97a60c7dc0ddcbd0ecd9dff914c9', '484675c0690c147bc1ab990858241f65d704', 115, '4.52.20.1.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('facd56d8250d6ef831496fce8769df8af702', '638f9ef95d6caead52d42928bded5b313c27', 186, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fae5825e24bdde4a52c1fdeae8f94542883a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 70, '4.52.19.1.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:26'),
('fafb44c22ed2628fdc484a59854ab3ee0d2e', '358ea4bf860ce17393ae5614aaa4afb2badd', 232, '4.52.25.0.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fb05e99f3a5d71ea1c6cde7893567d7f8151', 'feebca0c3e1e178553fecb7f905a4accbdf8', 110, '4.52.20.1.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fb889a72d415a3ad0ff9a29c8ff872a8f498', '358ea4bf860ce17393ae5614aaa4afb2badd', 61, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fbbca794fb24ae6cab0871a1d6586b948822', '358ea4bf860ce17393ae5614aaa4afb2badd', 186, '4.52.21.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fbc4949f62f6543fb8b9a44ddca59015f391', '358ea4bf860ce17393ae5614aaa4afb2badd', 110, '4.52.20.1.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fbc7e74f692352aedc0b0324776c13d2be15', '884f92440f11ea3f826310c4bcf9442908ec', 100, '4.52.20.1.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fbc8e6deb3e3b0d8680b8257ad67267165e6', '24bb6981131931d73aabea3f4eda805574ff', 265, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fc01e1bc8b16ebbc8e8a7c959745bede943a', 'feebca0c3e1e178553fecb7f905a4accbdf8', 306, '4.52.25.2.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fc0c4f5d07c38c2cfd756d83f94de3b1c031', '884f92440f11ea3f826310c4bcf9442908ec', 258, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fc30455b807b94fb04efe1b8e1c42e11c89c', '884f92440f11ea3f826310c4bcf9442908ec', 138, '4.52.21.0.20', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fc3b116b05bfadb030c2013823fd392f1c5d', 'feebca0c3e1e178553fecb7f905a4accbdf8', 90, '4.52.20.0.20', 'error', 'Kolom wajib kosong: Level Jurnal', '{\"nim\":\"4.52.20.0.20\",\"nama\":\"NAILA DIVA PUTRI\",\"judul_jurnal\":\"Role of Information Technology Capability and Knowledge Management in Increasing Organizational Agility to Encourage Product Innovation in Semarang\",\"level_jurnal\":null,\"jenis_perolehan\":null,\"nama_dosen\":null,\"tahun_publikasi\":null,\"nama_jurnal_konferensi\":null,\"penulis\":null,\"url_publikasi\":null,\"deskripsi\":null}', '2026-03-11 08:52:26'),
('fc5b25b276b4a9beb923c172a8002b11f1cf', '638f9ef95d6caead52d42928bded5b313c27', 61, '4.52.19.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fc5b526cb98fba3cb1f9633b8a008461a9bd', '884f92440f11ea3f826310c4bcf9442908ec', 204, '4.52.21.2.30', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fcc45f651aaf363e55a594a340ae0bee4e50', '358ea4bf860ce17393ae5614aaa4afb2badd', 62, '4.52.19.1.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fcdebfad00d8ca74d3409c5212351a1a9fc4', '358ea4bf860ce17393ae5614aaa4afb2badd', 300, '4.52.25.2.27', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fce5a2e6978606c2eef076f5da22d45be86b', '884f92440f11ea3f826310c4bcf9442908ec', 38, '4.52.19.1.03', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fcf9af336a3920a863bf9b6553c523aa88fa', '884f92440f11ea3f826310c4bcf9442908ec', 265, '4.52.25.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fd0dd05925535d990f0db8d948c4cb4fda50', '638f9ef95d6caead52d42928bded5b313c27', 83, '4.52.20.0.19', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fd1f3ab270eceef4ecdb7a691a5170dbf939', '24bb6981131931d73aabea3f4eda805574ff', 283, '4.52.25.2.10', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fd29a17fa6af46d08aabec230615c6185fa2', 'feebca0c3e1e178553fecb7f905a4accbdf8', 95, '4.52.20.0.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fd483431875e6d548398a1d6d964678eba7f', '638f9ef95d6caead52d42928bded5b313c27', 303, '4.52.25.3.02', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fd4e09fa95b9e1c528aed3eca411e4e9367a', '884f92440f11ea3f826310c4bcf9442908ec', 207, '4.52.23.8.04', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('fd9163b652544ac39c338263a0274b94953a', '484675c0690c147bc1ab990858241f65d704', 126, '4.52.21.0.07', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('fd95ac78fc07a3121581907ad11e3edab869', '638f9ef95d6caead52d42928bded5b313c27', 160, '4.52.21.1.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fdceae627d460c0c85b37c524e3575d8b86a', '638f9ef95d6caead52d42928bded5b313c27', 52, '4.52.19.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('fdd3649e0d490862a51c6a8bf624916b470b', '24bb6981131931d73aabea3f4eda805574ff', 191, '4.52.21.2.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('fe02098e2a9f20c55fe0f963a46c4397f689', 'feebca0c3e1e178553fecb7f905a4accbdf8', 134, '4.52.21.0.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fe2db482950a1c0cf56ec181ae90429e1f0c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 259, '4.52.25.1.08', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('fe824db7370a2bdb36c6c36c2399f4968cb0', '358ea4bf860ce17393ae5614aaa4afb2badd', 164, '4.52.21.1.17', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('fecf4b8569c849337dd926b7b3f22f696bc7', '638f9ef95d6caead52d42928bded5b313c27', 112, '4.52.20.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ff0137094a1283b7dcc7fd49d4ce96d95854', '884f92440f11ea3f826310c4bcf9442908ec', 32, '4.52.19.0.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ff5f728327b0f22c0ed13043c55b6c8c5d1c', '638f9ef95d6caead52d42928bded5b313c27', 326, '4.52.25.3.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ff7a1f0c83ab2cac509e86da64dd10cb4376', 'feebca0c3e1e178553fecb7f905a4accbdf8', 265, '4.52.25.1.14', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ff850ad6c8ccecea24bcee3e767f5d1ba4d0', '484675c0690c147bc1ab990858241f65d704', 57, '4.52.19.1.21', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 10:14:10'),
('ff8a82228e40b04dd3219a5b78df388666ae', 'feebca0c3e1e178553fecb7f905a4accbdf8', 206, '4.52.21.2.25', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-11 08:52:27'),
('ff9407cafaa9e2d5dd4fe08bbc7fdb211088', '358ea4bf860ce17393ae5614aaa4afb2badd', 187, '4.52.21.2.11', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:52:57'),
('ff97e676866e1050a194713c6b3efa76d8d2', '638f9ef95d6caead52d42928bded5b313c27', 106, '4.52.20.1.15', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ffb70f7734704beb94d5b405e27014c3fa76', '884f92440f11ea3f826310c4bcf9442908ec', 115, '4.52.20.1.26', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:56:30'),
('ffc50f213dde8e437002d465c1f19628bc3c', '638f9ef95d6caead52d42928bded5b313c27', 286, '4.52.25.2.13', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:01'),
('ffd6bc8326a2d578d9b9129dd28fa1ae5aac', '24bb6981131931d73aabea3f4eda805574ff', 212, '4.52.23.8.09', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47'),
('ffe69c14f83781c783537d7f31d4516efbc5', '24bb6981131931d73aabea3f4eda805574ff', 202, '4.52.21.2.28', 'skipped_empty', 'Tidak ada data kategori terisi.', NULL, '2026-03-06 09:48:47');

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_kekayaan_intelektual`
--

CREATE TABLE `prestasi_kekayaan_intelektual` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_kekayaan_intelektual_attachments`
--

CREATE TABLE `prestasi_kekayaan_intelektual_attachments` (
  `id` varchar(36) NOT NULL,
  `id_kekayaan_intelektual` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_lomba`
--

CREATE TABLE `prestasi_lomba` (
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
  `peran` enum('peserta','juara') DEFAULT NULL,
  `bidang` varchar(255) DEFAULT NULL,
  `tanggal_mulai` date DEFAULT NULL,
  `tanggal_selesai` date DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_lomba_attachments`
--

CREATE TABLE `prestasi_lomba_attachments` (
  `id` varchar(36) NOT NULL,
  `id_lomba` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_magang`
--

CREATE TABLE `prestasi_magang` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_magang_attachments`
--

CREATE TABLE `prestasi_magang_attachments` (
  `id` varchar(36) NOT NULL,
  `id_magang` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_migration_skipped_logs`
--

CREATE TABLE `prestasi_migration_skipped_logs` (
  `id` varchar(36) NOT NULL,
  `legacy_achievement_id` varchar(36) NOT NULL,
  `legacy_category` varchar(50) DEFAULT NULL,
  `legacy_subcategory` varchar(50) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_organisasi`
--

CREATE TABLE `prestasi_organisasi` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_organisasi_attachments`
--

CREATE TABLE `prestasi_organisasi_attachments` (
  `id` varchar(36) NOT NULL,
  `id_organisasi` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_pengembangan_diri`
--

CREATE TABLE `prestasi_pengembangan_diri` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_pengembangan_diri_attachments`
--

CREATE TABLE `prestasi_pengembangan_diri_attachments` (
  `id` varchar(36) NOT NULL,
  `id_pengembangan_diri` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_portofolio`
--

CREATE TABLE `prestasi_portofolio` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_portofolio_attachments`
--

CREATE TABLE `prestasi_portofolio_attachments` (
  `id` varchar(36) NOT NULL,
  `id_portofolio` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_produk_mahasiswa`
--

CREATE TABLE `prestasi_produk_mahasiswa` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `prestasi_produk_mahasiswa`
--

INSERT INTO `prestasi_produk_mahasiswa` (`id_produk_mahasiswa`, `id_mahasiswa`, `source_import_log_id`, `title`, `description`, `tanggal`, `lokasi`, `penyelenggara`, `tingkat`, `peringkat`, `category`, `subcategory`, `achievement_type`, `verified`, `nama_produk`, `nama_produk_norm`, `kategori_produk`, `link_produk`, `created_at`, `updated_at`) VALUES
('84e24784dab7e78a8ee1df66478362cef958', 'b2c3d5dc7c963fd39728f292908955d6117b', '884f92440f11ea3f826310c4bcf9442908ec', 'Keripik Ubi', NULL, '2026-03-06', NULL, NULL, 'lokal', NULL, 'applied_academic', 'makanan_minuman', 'non_academic', 0, 'Keripik Ubi', 'keripik ubi', 'makanan_minuman', NULL, '2026-03-06 09:56:30', '2026-03-06 09:56:30');

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_produk_mahasiswa_attachments`
--

CREATE TABLE `prestasi_produk_mahasiswa_attachments` (
  `id` varchar(36) NOT NULL,
  `id_produk_mahasiswa` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_publikasi`
--

CREATE TABLE `prestasi_publikasi` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `prestasi_publikasi`
--

INSERT INTO `prestasi_publikasi` (`id_publikasi`, `id_mahasiswa`, `source_import_log_id`, `title`, `description`, `tanggal`, `lokasi`, `penyelenggara`, `tingkat`, `peringkat`, `category`, `subcategory`, `achievement_type`, `verified`, `judul`, `judul_norm`, `jenis_publikasi`, `penulis`, `peran_penulis`, `nama_jurnal_konferensi`, `nama_jurnal_konferensi_norm`, `penerbit`, `doi`, `url`, `tahun_terbit`, `tanggal_terbit`, `deskripsi`, `created_at`, `updated_at`) VALUES
('065af866c80a1b0a6b0fc1dd467d7c4ad2fc', 'c5b525d68e4a88b74a38c478433fa30df989', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of E-Wom, Price Perception, and Product Quality on VIVO Smartphone Purchasing Decision', '', '2025-01-01', NULL, 'Admisi dan Bisnis', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of E-Wom, Price Perception, and Product Quality on VIVO Smartphone Purchasing Decision', 'influence of e-wom, price perception, and product quality on vivo smartphone purchasing decision', 'artikel_jurnal', 'Adesgy Tiara Larasaty,  Winarto Winarto, Nur Rini', 'Winarto Winarto, Nur Rini', 'Admisi dan Bisnis', 'admisi dan bisnis', 'Admisi dan Bisnis', NULL, 'https://jurnal.polines.ac.id/index.php/admisi/article/view/6234/0', 2025, '2025-01-01', '', '2026-03-11 08:52:27', '2026-03-14 19:42:47'),
('09fd32d692d84f8e9c6e79ab696d75985835', 'f4d7a232527e296d0e5e225c55ac4c40b483', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Organizational Culture through Technology Resources as Antecedents and its Impact on Export Performance of The Furniture Industry', NULL, '2023-01-01', NULL, 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia, September 13-15, 2022', 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'Organizational Culture through Technology Resources as Antecedents and its Impact on Export Performance of The Furniture Industry', 'organizational culture through technology resources as antecedents and its impact on export performance of the furniture industry', 'artikel_jurnal', 'Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani, Ardianita Nur Indah Sari', 'Iwan Hermawan, Inayah Inayah, Gita Hindrawati, Sam\'ani Sam\'ani,', 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia, September 13-15, 2022', 'proceedings of the 3rd asia pacific international conference on industrial engineering and operations management, johor bahru, malaysia, september 13-15, 2022', 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia, September 13-15, 2022', NULL, 'https://ieomsociety.org/proceedings/2022malaysia/532.pdf', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('12281b39ac936987eae09f358dca180a0dcb', '098da1e1846cb162baaccc4fefaa100f5768', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'THE INFLUENCE OF SOCIAL MEDIA USE TO WORK, TOTAL QUALITY MANAGEMENT, AND ORGANIZATIONAL CULTURE ON ORGANIZATIONAL PERFORMANCE IN DIGITAL-BASED FOOD PROCESSING MSMES', NULL, '2025-01-01', NULL, 'JURNAL STUDI MANAJEMEN BISNIS Учредители: Universitas Muria Kudus', 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'THE INFLUENCE OF SOCIAL MEDIA USE TO WORK, TOTAL QUALITY MANAGEMENT, AND ORGANIZATIONAL CULTURE ON ORGANIZATIONAL PERFORMANCE IN DIGITAL-BASED FOOD PROCESSING MSMES', 'the influence of social media use to work, total quality management, and organizational culture on organizational performance in digital-based food processing msmes', 'artikel_jurnal', 'Nely Falahati Siyami, Dody Setyadi, Rara Ririn Budi Utaminingtyas', 'Dody Setyadi, Rara Ririn Budi Utaminingtyas', 'JURNAL STUDI MANAJEMEN BISNIS Учредители: Universitas Muria Kudus', 'jurnal studi manajemen bisnis учредители: universitas muria kudus', 'JURNAL STUDI MANAJEMEN BISNIS Учредители: Universitas Muria Kudus', NULL, 'https://elibrary.ru/item.asp?id=81864363', 2025, '2025-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('478a631946fd869c9a7d78eada8e8c83baf2', 'e13f449090567dbf462f6536a4e966701946', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'How Firms Achieve Competitive Advantage And Business Performance: Dynamic Capability Theory Point of View', NULL, '2024-01-01', NULL, 'Asian Journal of Management, Entrepreneurship and Social Science', 'nasional', 'national_non_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'How Firms Achieve Competitive Advantage And Business Performance: Dynamic Capability Theory Point of View', 'how firms achieve competitive advantage and business performance: dynamic capability theory point of view', 'artikel_jurnal', 'Endang Sulistiyani, Rustono Rustono, Zahrasea Farah Ilyasa, Rif’ah Dwi Astuti, Sri Wahyuni, Carli Carli', 'Endang Sulistiyani, Rustono Rustono, Rif’ah Dwi Astuti, Sri Wahyuni, Carli Carli', 'Asian Journal of Management, Entrepreneurship and Social Science', 'asian journal of management, entrepreneurship and social science', 'Asian Journal of Management, Entrepreneurship and Social Science', NULL, 'https://mail.ajmesc.com/index.php/ajmesc/article/view/1147', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4992985cc060c1c193543c13f714bbff35c9', '360d188bd84427e7c7473bc108290cca3aed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Membangun Kelayakan E-Tourism Berbasis Video Panorama 360 Dalam Rangka Strategi Push Promote Untuk Mengeksplorasi Daya Tarik Destinasi', NULL, '2021-01-01', NULL, 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'Membangun Kelayakan E-Tourism Berbasis Video Panorama 360 Dalam Rangka Strategi Push Promote Untuk Mengeksplorasi Daya Tarik Destinasi', 'membangun kelayakan e-tourism berbasis video panorama 360 dalam rangka strategi push promote untuk mengeksplorasi daya tarik destinasi', 'artikel_jurnal', 'Sartono, Iwan Hermawan, Nur Nelisa Adah', 'Sartono, Iwan Hermawan', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'prosiding seminar hasil penelitian dan pengabdian masyarakat', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', NULL, 'https://jurnal.polines.ac.id/index.php/Sentrikom/article/view/2731', 2021, '2021-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('4b154796de04bf6e88f562ee5110cfc94043', '19704b9d821cec1bc92ac7a561c67ba72886', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence Of Customer Experience, Perceived Value, and Trust on Repurchase Intention on BRT Trans Semarang Users', NULL, '2024-01-01', NULL, 'JOBS', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence Of Customer Experience, Perceived Value, and Trust on Repurchase Intention on BRT Trans Semarang Users', 'influence of customer experience, perceived value, and trust on repurchase intention on brt trans semarang users', 'artikel_jurnal', 'Vhiela Eka Pramitasari, Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti', 'Karnowahadi - Karnowahadi, Destine Fajar Wiedayanti', 'JOBS', 'jobs', 'JOBS', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/6230', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('50f81d3dafd4ae7cee891d7e47c69747eef7', 'b2c3d5dc7c963fd39728f292908955d6117b', '484675c0690c147bc1ab990858241f65d704', 'judul 2', NULL, '2022-01-01', NULL, NULL, 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'judul 2', 'judul 2', 'artikel_jurnal', '-', NULL, '', '', NULL, NULL, NULL, 2022, '2022-01-01', NULL, '2026-03-06 10:14:10', '2026-03-06 10:14:10'),
('58253fd2a958a01b31ed046f650353c2279e', 'c6ec49ba98dec8d5b26fa29b6ab19eaa7907', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of Price Increases, Product Availability, and Service Quality on Consumer Satisfaction (A Case Study at LPG 3 Kg Distribution Point Yulianto, agent of PT Mita Ereska, Semarang Regency)', NULL, '2025-01-01', NULL, 'Admisi Dan Bisnis', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of Price Increases, Product Availability, and Service Quality on Consumer Satisfaction (A Case Study at LPG 3 Kg Distribution Point Yulianto, agent of PT Mita Ereska, Semarang Regency)', 'influence of price increases, product availability, and service quality on consumer satisfaction (a case study at lpg 3 kg distribution point yulianto, agent of pt mita ereska, semarang regency)', 'artikel_jurnal', 'Dita Ratna Sari, Sri Wahyuni, Paniya', 'Sri Wahyuni, Paniya', 'Admisi Dan Bisnis', 'admisi dan bisnis', 'Admisi Dan Bisnis', NULL, 'https://jurnal.polines.ac.id/index.php/admisi/article/view/7013', 2025, '2025-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('739e897d4305d58f8b2c2b321a5ca7c14e09', 'b2c3d5dc7c963fd39728f292908955d6117b', '358ea4bf860ce17393ae5614aaa4afb2badd', 'Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform', NULL, '2022-01-01', NULL, 'Organization and Human Capital Development (ORCADEV)', 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform', 'examining the impact of trust-based active participation: an empirical study in creative industry that adopt digital platform', 'artikel_jurnal', '-', NULL, 'Organization and Human Capital Development (ORCADEV)', 'organization and human capital development (orcadev)', 'Organization and Human Capital Development (ORCADEV)', NULL, 'https://journals.researchsynergypress.com/index.php/orcadev/article/view/2293', 2022, '2022-01-01', NULL, '2026-03-06 09:52:57', '2026-03-06 09:52:57'),
('742d6ad9766a4a9b7e786f4297adf335f1b1', '4de4e2e887d4f3e90720484977256629d156', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Analysis of the Influence of Online Consumer Reviews, Perceived Quality, and Price Perception on Purchase Decisions at the Charles and Keith Brand in Semarang', NULL, '2024-01-01', NULL, 'Admisi dan Bisnis', 'internasional', 'reputable_international', 'scientific_work', 'journal_publication', 'academic', 0, 'Analysis of the Influence of Online Consumer Reviews, Perceived Quality, and Price Perception on Purchase Decisions at the Charles and Keith Brand in Semarang', 'analysis of the influence of online consumer reviews, perceived quality, and price perception on purchase decisions at the charles and keith brand in semarang', 'artikel_jurnal', 'Ficryna Shulcha, Karnowahadi Karnowahadi, Subandi Subandi', 'Karnowahadi Karnowahadi, Subandi Subandi', 'Admisi dan Bisnis', 'admisi dan bisnis', 'Admisi dan Bisnis', NULL, 'https://jurnal.polines.ac.id/index.php/admisi/article/view/5726', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('86699d9fe6c00497678839f64301358b73df', '360d188bd84427e7c7473bc108290cca3aed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Building Entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective', NULL, '2025-01-01', NULL, 'Management & Accounting Review (MAR)', 'internasional', 'reputable_international', 'scientific_work', 'journal_publication', 'academic', 0, 'Building Entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective', 'building entrepreneurship based on green innovation to promote sustainable development: a qualitative study perspective', 'artikel_jurnal', 'Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono, Nur Nelisa Adah', 'Iwan Hermawan, Gita Hindrawati, Dody Setyadi, Sartono Sartono', 'Management & Accounting Review (MAR)', 'management & accounting review (mar)', 'Management & Accounting Review (MAR)', NULL, 'https://ir.uitm.edu.my/id/eprint/121030/', 2025, '2025-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('877e6d47eeea4b2001edc3d231853670685e', 'b2c3d5dc7c963fd39728f292908955d6117b', '484675c0690c147bc1ab990858241f65d704', 'judul 1', NULL, '2020-01-01', NULL, NULL, 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'judul 1', 'judul 1', 'artikel_jurnal', '-', NULL, '', '', NULL, NULL, NULL, 2020, '2020-01-01', NULL, '2026-03-06 10:14:10', '2026-03-06 10:14:10'),
('981eadd272d8ac8e45e9f9477d47b8b4d73c', 'bdf819933f5c4893a1ea9ef91600fd78d844', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Design and Build an E-Commerce Website as a Means of Market Network Development for UMKM MDF Pressing', NULL, '2024-01-01', NULL, 'Admisi dan Bisnis', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Design and Build an E-Commerce Website as a Means of Market Network Development for UMKM MDF Pressing', 'design and build an e-commerce website as a means of market network development for umkm mdf pressing', 'artikel_jurnal', 'Endang Sulistiyani Rizka Laila Maulida, Azizah Azizah, Irawan Malebra', 'Endang Sulistiyani, Azizah Azizah, Irawan Malebra', 'Admisi dan Bisnis', 'admisi dan bisnis', 'Admisi dan Bisnis', NULL, 'https://jurnal.polines.ac.id/index.php/admisi/article/view/5727', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('9a87194f3ef8d096d92e7f14fcb4e6f49f76', 'a9000ee755ef6a121727ef93f811d663e640', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'HUMAN CAPITAL STUDY: CAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR FOR BOOSTING JOB SATISFACTION', NULL, '2023-01-01', NULL, 'BISECER (Business Economic Entrepreneurship)', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'HUMAN CAPITAL STUDY: CAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR FOR BOOSTING JOB SATISFACTION', 'human capital study: can organizational citizenship behavior for boosting job satisfaction', 'artikel_jurnal', 'Della Amaylia Ashari, Iwan Hermawan', 'Iwan Hermawan', 'BISECER (Business Economic Entrepreneurship)', 'bisecer (business economic entrepreneurship)', 'BISECER (Business Economic Entrepreneurship)', NULL, 'https://ejournal.undaris.ac.id/index.php/biceser/about/submissions#authorGuidelines', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('a3a780a1975797ec219d3bf1a310c903369d', 'd3228f21a2e7a1da8616b76821985b1fe421', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of Celebrity Endorsement, Electronic Word of Mouth, Perceived Quality on Purchase Decision of Scarlett Whitening Consumer', NULL, '2024-01-01', NULL, 'JOBS', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of Celebrity Endorsement, Electronic Word of Mouth, Perceived Quality on Purchase Decision of Scarlett Whitening Consumer', 'influence of celebrity endorsement, electronic word of mouth, perceived quality on purchase decision of scarlett whitening consumer', 'artikel_jurnal', 'Sapna Putri Handayani, Irawan Malebra', 'Irawan Malebra', 'JOBS', 'jobs', 'JOBS', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/6583', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('abf6fbd5a929f5fd39f3ebace337250ee845', '360d188bd84427e7c7473bc108290cca3aed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'The Role of Entrepreneurial Orientation, Organizational Culture, and Technology Resources in Encouraging Supply Chain Management', NULL, '2025-01-01', NULL, 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia', 'internasional', 'international', 'scientific_work', 'journal_publication', 'academic', 0, 'The Role of Entrepreneurial Orientation, Organizational Culture, and Technology Resources in Encouraging Supply Chain Management', 'the role of entrepreneurial orientation, organizational culture, and technology resources in encouraging supply chain management', 'artikel_jurnal', 'Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho', 'Iwan Hermawan, Inayah, Suharmanto, Luqman Khakim and Jati Nugroho', 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia', 'proceedings of the 3rd asia pacific international conference on industrial engineering and operations management, johor bahru, malaysia', 'Proceedings of the 3rd Asia Pacific International Conference on Industrial Engineering and Operations Management, Johor Bahru, Malaysia', NULL, 'https://ieomsociety.org/malaysia2022/proceedings/', 2025, '2025-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('afb6afc73268f7e087f1047f89a59f3c6ed8', '45b10e8213b0dcd14f4220db8d6579ab9a08', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Analysis of the Effect of Web Quality Dimensions (Usability Quality, Information Quality, Service Interaction Quality) on Customer Satisfaction of Aksesmu Application Users in …', NULL, '2023-01-01', NULL, 'JOBS', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Analysis of the Effect of Web Quality Dimensions (Usability Quality, Information Quality, Service Interaction Quality) on Customer Satisfaction of Aksesmu Application Users in …', 'analysis of the effect of web quality dimensions (usability quality, information quality, service interaction quality) on customer satisfaction of aksesmu application users in …', 'artikel_jurnal', 'Muhammad Daffa El Haq, Karnowahadi Karnowahadi, Rustono Rustono', 'Karnowahadi Karnowahadi, Rustono Rustono', 'JOBS', 'jobs', 'JOBS', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/4858', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('beb89d701dd3755bac3e7b3f7486392f95e5', '360d188bd84427e7c7473bc108290cca3aed', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Pemberdayaan UKM Olahan Ikan Di Kelurahan Plalangan Melalui Perbaikan Pengembangan Pakan Mandir', NULL, '2023-01-01', NULL, 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'internasional', 'reputable_international', 'scientific_work', 'journal_publication', 'academic', 0, 'Pemberdayaan UKM Olahan Ikan Di Kelurahan Plalangan Melalui Perbaikan Pengembangan Pakan Mandir', 'pemberdayaan ukm olahan ikan di kelurahan plalangan melalui perbaikan pengembangan pakan mandir', 'artikel_jurnal', 'Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati, Nur Nelisa Adah', 'Iwan Hermawan, Sartono, Suharmanto, Gita Hindrawati', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'prosiding seminar hasil penelitian dan pengabdian masyarakat', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', NULL, 'https://jurnal.polines.ac.id/index.php/Sentrikom/article/view/4547', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('c55ebfb186fb0ed4bc50b3163ee3648582eb', 'b2c3d5dc7c963fd39728f292908955d6117b', '24bb6981131931d73aabea3f4eda805574ff', 'ajda', NULL, '2022-01-01', NULL, 'ajda', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'ajda', 'ajda', 'artikel_jurnal', 'ad', NULL, 'ajda', 'ajda', 'ajda', NULL, 'https://arsipmhs-abt.com', 2022, '2022-01-01', NULL, '2026-03-06 09:48:47', '2026-03-06 09:48:47'),
('c9fdb7f0347023d29a538506ac3acdffe9bd', 'f7293b32910658136719f49621bd70b6a140', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Implementation of Good Governance E-Filling and Strengthening Soft-Skill Characters for Japanese Kenshushei Institutions at LPK Akihiro Semarang', NULL, '2024-01-01', NULL, 'IMPACTS: International Journal of Empowerment and Community Services', 'nasional', 'national_non_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Implementation of Good Governance E-Filling and Strengthening Soft-Skill Characters for Japanese Kenshushei Institutions at LPK Akihiro Semarang', 'implementation of good governance e-filling and strengthening soft-skill characters for japanese kenshushei institutions at lpk akihiro semarang', 'artikel_jurnal', 'Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti, Annisa Nur Aulia', 'Inayah Inayah, Iwan Hermawan, Gita Hindrawati, Suharmanto Suharmanto, Dika Vivi Widyanti', 'IMPACTS: International Journal of Empowerment and Community Services', 'impacts: international journal of empowerment and community services', 'IMPACTS: International Journal of Empowerment and Community Services', NULL, 'https://jurnal.ustjogja.ac.id/index.php/IMPACTS/article/view/16008', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cf6fe70d935c7440f22cefd2df7f9ff4d519', 'f7293b32910658136719f49621bd70b6a140', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Enhancing Organizational Performance: Can Innovative Millennial Entrepreneurship and Business Continuity Take on A Mediating Role?', NULL, '2024-01-01', NULL, 'Organization and Human Capital Development', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Enhancing Organizational Performance: Can Innovative Millennial Entrepreneurship and Business Continuity Take on A Mediating Role?', 'enhancing organizational performance: can innovative millennial entrepreneurship and business continuity take on a mediating role?', 'artikel_jurnal', 'Annisa Nur Aulia, Iwan Hermawan, Eva Purnamasari', 'Iwan Hermawan, Eva Purnamasari', 'Organization and Human Capital Development', 'organization and human capital development', 'Organization and Human Capital Development', NULL, 'https://www.proquest.com/docview/3194094618/abstract/F1416EE71E24500PQ/1?accountid=40625&sourcetype=Scholarly%20Journals', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('cfa73b7ed6bed500eac5c2a12df67c9462dc', 'f4d7a232527e296d0e5e225c55ac4c40b483', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Implementasi APE Inovatif dan PTK Melalui Peran Internet Center pada PAUD Al-Kamilah Semarang', NULL, '2023-01-01', NULL, 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Implementasi APE Inovatif dan PTK Melalui Peran Internet Center pada PAUD Al-Kamilah Semarang', 'implementasi ape inovatif dan ptk melalui peran internet center pada paud al-kamilah semarang', 'artikel_jurnal', 'Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi, Febrina Indrasari, Ardianita Nur Indah Sari', 'Inayah Inayah, Iwan Hermawan, Sri Eka Sadriatwati, Dody Setyadi', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', 'prosiding seminar hasil penelitian dan pengabdian masyarakat', 'Prosiding Seminar Hasil Penelitian dan Pengabdian Masyarakat', NULL, 'https://jurnal.polines.ac.id/index.php/Sentrikom/article/view/4545/0', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('d5e6c7fddaaf462806a86894c24896c61e58', '6fa6ccefc13a5074d913933e34b5a9e25204', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of Customer Experience, Brand Ambassador, and Perceived Value On Customer Loyalty Of Somethinc’s Consumer In Semarang', NULL, '2024-01-01', NULL, 'JOBS', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of Customer Experience, Brand Ambassador, and Perceived Value On Customer Loyalty Of Somethinc’s Consumer In Semarang', 'influence of customer experience, brand ambassador, and perceived value on customer loyalty of somethinc’s consumer in semarang', 'artikel_jurnal', 'Athaya Aurellia Rifani, Rustono - Rustono, Noor - Suroija', 'Rustono - Rustono, Noor - Suroija', 'JOBS', 'jobs', 'JOBS', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/6224', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e02078f4cf95b1fa733eeb308d972c1c0ce7', '1e406ad065261aa023b781cb424af3adc9fd', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online', NULL, '2025-01-01', NULL, 'JAPM (Jurnal Akademik Pengabdian Masyarakat)', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Mengkomunikasi Visual Bisniskan UMKM dalam Menghadapi Persaingan Bisnis Online', 'mengkomunikasi visual bisniskan umkm dalam menghadapi persaingan bisnis online', 'artikel_jurnal', 'Mellasanti Ayuwardani, Azzam Alhafhizd, Mirza Dzaki Kamal, Rafi Willy Febrian, Setiawan Wibowo', 'Mellasanti Ayuwardani', 'JAPM (Jurnal Akademik Pengabdian Masyarakat)', 'japm (jurnal akademik pengabdian masyarakat)', 'JAPM (Jurnal Akademik Pengabdian Masyarakat)', NULL, 'https://ejurnal.kampusakademik.co.id/index.php/japm/indeksasi', 2025, '2025-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e0e8a64b32bdba43b80ef80c629622d23cc4', 'a9000ee755ef6a121727ef93f811d663e640', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'PERAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR DENGAN JOB SATISFACTION STUDI KASUS: PT PERTAMINA LUBRICANTS-PRODUCTION UNIT CILACAP', NULL, '2024-01-01', NULL, 'BISECER (Business Economic Entrepreneurship)', 'nasional', 'national_non_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'PERAN ORGANIZATIONAL CITIZENSHIP BEHAVIOR DENGAN JOB SATISFACTION STUDI KASUS: PT PERTAMINA LUBRICANTS-PRODUCTION UNIT CILACAP', 'peran organizational citizenship behavior dengan job satisfaction studi kasus: pt pertamina lubricants-production unit cilacap', 'artikel_jurnal', 'Della Amaylia Ashari, Iwan Hermawan, Inayah Inayah', 'Iwan Hermawan, Inayah Inayah', 'BISECER (Business Economic Entrepreneurship)', 'bisecer (business economic entrepreneurship)', 'BISECER (Business Economic Entrepreneurship)', NULL, 'https://ejournal.undaris.ac.id/index.php/biceser/article/view/443', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('e1f2e793de9fb3ef7984049984350aeaffe2', '622ffa11ee1cfdc9668e7e4de11359824b30', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Pengaruh Knowledge Sharing, Employee Engagement, Dan Work Life Balance Terhadap Job Satisfication Pada Karyawan PT Wijaya Karya Beton Tbk. PPB Boyolali', NULL, '2024-01-01', NULL, 'Journal of Management, Entrepreneur and Cooperative', 'nasional', 'national_non_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Pengaruh Knowledge Sharing, Employee Engagement, Dan Work Life Balance Terhadap Job Satisfication Pada Karyawan PT Wijaya Karya Beton Tbk. PPB Boyolali', 'pengaruh knowledge sharing, employee engagement, dan work life balance terhadap job satisfication pada karyawan pt wijaya karya beton tbk. ppb boyolali', 'artikel_jurnal', 'Yudha Esa Pribadi, Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi', 'Rara Ririn Budi Utaminingtyas, Irin Mirrah Luthfia, Mona Inayah Pratiwi', 'Journal of Management, Entrepreneur and Cooperative', 'journal of management, entrepreneur and cooperative', 'Journal of Management, Entrepreneur and Cooperative', NULL, 'https://jurnal.uss.ac.id/index.php/jmec/article/view/578', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('ed3daab4d2178f49b8d283ff3afdfce35054', '525e2ae887ce7e8eab2003585e73c2e25912', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of E-Service Quality, Promotion, and Brand Trust on Application Use Decisions', NULL, '2023-01-01', NULL, 'JOBS', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of E-Service Quality, Promotion, and Brand Trust on Application Use Decisions', 'influence of e-service quality, promotion, and brand trust on application use decisions', 'artikel_jurnal', 'Nabila Firda Alfani, Rustono, Nur Rini', 'Rustono, Nur Rini', 'JOBS', 'jobs', 'JOBS', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/4854', 2023, '2023-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27'),
('f04ac57d0e4bc99660ef586fe94f2835353c', '96a7eb0f0b1d8abdf90083d482c7fec0cc7c', 'feebca0c3e1e178553fecb7f905a4accbdf8', 'Influence of Functional Convenience, Celebrity Endorsment, and Self-Esteem on Impulsion Purchasing', NULL, '2024-01-01', NULL, 'JOBS (Jurnal Of Business Studies)', 'nasional', 'national_accredited', 'scientific_work', 'journal_publication', 'academic', 0, 'Influence of Functional Convenience, Celebrity Endorsment, and Self-Esteem on Impulsion Purchasing', 'influence of functional convenience, celebrity endorsment, and self-esteem on impulsion purchasing', 'artikel_jurnal', 'Maydista Lestari, Endang Sulistiyani, Rif\'ah Dwi Astuti', 'Endang Sulistiyani, Rif\'ah Dwi Astuti', 'JOBS (Jurnal Of Business Studies)', 'jobs (jurnal of business studies)', 'JOBS (Jurnal Of Business Studies)', NULL, 'https://jurnal.polines.ac.id/index.php/jobs/article/view/6580', 2024, '2024-01-01', NULL, '2026-03-11 08:52:27', '2026-03-11 08:52:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_publikasi_attachments`
--

CREATE TABLE `prestasi_publikasi_attachments` (
  `id` varchar(36) NOT NULL,
  `id_publikasi` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_seminar`
--

CREATE TABLE `prestasi_seminar` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_seminar_attachments`
--

CREATE TABLE `prestasi_seminar_attachments` (
  `id` varchar(36) NOT NULL,
  `id_seminar` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_wirausaha`
--

CREATE TABLE `prestasi_wirausaha` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `prestasi_wirausaha_attachments`
--

CREATE TABLE `prestasi_wirausaha_attachments` (
  `id` varchar(36) NOT NULL,
  `id_wirausaha` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `record_change_logs`
--

CREATE TABLE `record_change_logs` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `menu_section` varchar(80) NOT NULL COMMENT 'Section id',
  `record_id` varchar(36) NOT NULL COMMENT 'PK of menu_*_records row',
  `action` enum('created','updated','deleted','recovered','permanent_deleted') NOT NULL,
  `admin_id` varchar(36) NOT NULL COMMENT 'FK users.id',
  `changed_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Asia/Jakarta',
  `old_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Snapshot before change' CHECK (json_valid(`old_data`)),
  `new_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'Snapshot after change' CHECK (json_valid(`new_data`)),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Dipindah ke recycle setelah 20 hari'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for chart record changes';

--
-- Dumping data untuk tabel `record_change_logs`
--

INSERT INTO `record_change_logs` (`id`, `menu_section`, `record_id`, `action`, `admin_id`, `changed_at`, `old_data`, `new_data`, `deleted_at`) VALUES
('06afcc926bfc120093f201fb491ba13bbca7', 'student_achievements', '739e897d4305d58f8b2c2b321a5ca7c14e09', 'deleted', 'admin-abt-001', '2026-03-06 09:58:41', '{\"id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"source_table\":\"achievements\",\"source_id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\\\",\\\"url_publikasi\\\":\\\"https:\\\\\\/\\\\\\/journals.researchsynergypress.com\\\\\\/index.php\\\\\\/orcadev\\\\\\/article\\\\\\/view\\\\\\/2293\\\",\\\"link_produk\\\":null,\\\"link\\\":\\\"https:\\\\\\/\\\\\\/journals.researchsynergypress.com\\\\\\/index.php\\\\\\/orcadev\\\\\\/article\\\\\\/view\\\\\\/2293\\\"}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:52:57\",\"updated_at\":\"2026-03-06 16:52:57\"}', '{\"id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"source_table\":\"achievements\",\"source_id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\\\",\\\"url_publikasi\\\":\\\"https:\\\\\\/\\\\\\/journals.researchsynergypress.com\\\\\\/index.php\\\\\\/orcadev\\\\\\/article\\\\\\/view\\\\\\/2293\\\",\\\"link_produk\\\":null,\\\"link\\\":\\\"https:\\\\\\/\\\\\\/journals.researchsynergypress.com\\\\\\/index.php\\\\\\/orcadev\\\\\\/article\\\\\\/view\\\\\\/2293\\\"}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:58:41\",\"created_at\":\"2026-03-06 16:52:57\",\"updated_at\":\"2026-03-06 16:52:57\"}', NULL),
('102b987c5e6a3140b9e513a1ab57b0dac551', 'student_achievements', '50f81d3dafd4ae7cee891d7e47c69747eef7', 'deleted', 'admin-abt-001', '2026-03-06 10:16:31', '{\"id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"source_table\":\"achievements\",\"source_id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"judul 2\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', '{\"id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"source_table\":\"achievements\",\"source_id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"judul 2\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 17:16:31\",\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', NULL),
('1837505fb6bbc11cebfc089d7be7c72a0d8d', 'student_achievements', '877e6d47eeea4b2001edc3d231853670685e', 'deleted', 'admin-abt-001', '2026-03-06 10:16:31', '{\"id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"source_table\":\"achievements\",\"source_id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2020\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2020-01-01\\\",\\\"year\\\":2020,\\\"title\\\":\\\"judul 1\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', '{\"id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"source_table\":\"achievements\",\"source_id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2020\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"tanggal\\\":\\\"2020-01-01\\\",\\\"year\\\":2020,\\\"title\\\":\\\"judul 1\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 17:16:31\",\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', NULL),
('2fe3c3b67489fa11fd20678d2e45444f86c9', 'publications', '739e897d4305d58f8b2c2b321a5ca7c14e09', 'deleted', 'admin-abt-001', '2026-03-06 09:58:56', '{\"id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"source_table\":\"achievements\",\"source_id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:52:57\",\"updated_at\":\"2026-03-06 16:52:57\"}', '{\"id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"source_table\":\"achievements\",\"source_id\":\"739e897d4305d58f8b2c2b321a5ca7c14e09\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"Examining the Impact of Trust-Based Active Participation: An Empirical Study in Creative Industry That Adopt Digital Platform\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:58:56\",\"created_at\":\"2026-03-06 16:52:57\",\"updated_at\":\"2026-03-06 16:52:57\"}', NULL),
('425d2ca159c48529a36366c0a2797f5cccfc', 'student_achievements', '84e24784dab7e78a8ee1df66478362cef958', 'deleted', 'admin-abt-001', '2026-03-06 09:58:41', '{\"id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"source_table\":\"achievements\",\"source_id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2026\",\"payload\":\"{\\\"category\\\":\\\"applied_academic\\\",\\\"subcategory\\\":\\\"makanan_minuman\\\",\\\"achievement_type\\\":\\\"non_academic\\\",\\\"tingkat\\\":\\\"lokal\\\",\\\"tanggal\\\":\\\"2026-03-06\\\",\\\"year\\\":2026,\\\"title\\\":\\\"Keripik Ubi\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:56:30\",\"updated_at\":\"2026-03-06 16:56:30\"}', '{\"id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"source_table\":\"achievements\",\"source_id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2026\",\"payload\":\"{\\\"category\\\":\\\"applied_academic\\\",\\\"subcategory\\\":\\\"makanan_minuman\\\",\\\"achievement_type\\\":\\\"non_academic\\\",\\\"tingkat\\\":\\\"lokal\\\",\\\"tanggal\\\":\\\"2026-03-06\\\",\\\"year\\\":2026,\\\"title\\\":\\\"Keripik Ubi\\\",\\\"url_publikasi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:58:41\",\"created_at\":\"2026-03-06 16:56:30\",\"updated_at\":\"2026-03-06 16:56:30\"}', NULL),
('82c5bc8e0a9cb2f276db38cb95de20c2c077', 'publications', '877e6d47eeea4b2001edc3d231853670685e', 'deleted', 'admin-abt-001', '2026-03-06 10:16:16', '{\"id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"source_table\":\"achievements\",\"source_id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2020\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"judul 1\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2020-01-01\\\",\\\"year\\\":2020}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', '{\"id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"source_table\":\"achievements\",\"source_id\":\"877e6d47eeea4b2001edc3d231853670685e\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2020\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"judul 1\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2020-01-01\\\",\\\"year\\\":2020}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 17:16:16\",\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', NULL),
('844a66431034cf159e1e274a2b38726301eb', 'publications', 'c55ebfb186fb0ed4bc50b3163ee3648582eb', 'deleted', 'admin-abt-001', '2026-03-06 09:58:56', '{\"id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"source_table\":\"achievements\",\"source_id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"nasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"national_accredited\\\",\\\"title\\\":\\\"ajda\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"ad\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:48:47\",\"updated_at\":\"2026-03-06 16:48:47\"}', '{\"id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"source_table\":\"achievements\",\"source_id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"nasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"national_accredited\\\",\\\"title\\\":\\\"ajda\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"ad\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:58:56\",\"created_at\":\"2026-03-06 16:48:47\",\"updated_at\":\"2026-03-06 16:48:47\"}', NULL),
('8c339de906b53cb5ba4a24c0b55e381944d5', 'student_achievements', 'c55ebfb186fb0ed4bc50b3163ee3648582eb', 'deleted', 'admin-abt-001', '2026-03-06 09:58:41', '{\"id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"source_table\":\"achievements\",\"source_id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"nasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"ajda\\\",\\\"url_publikasi\\\":\\\"https:\\\\\\/\\\\\\/arsipmhs-abt.com\\\",\\\"link_produk\\\":null,\\\"link\\\":\\\"https:\\\\\\/\\\\\\/arsipmhs-abt.com\\\"}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:48:47\",\"updated_at\":\"2026-03-06 16:48:47\"}', '{\"id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"source_table\":\"achievements\",\"source_id\":\"c55ebfb186fb0ed4bc50b3163ee3648582eb\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"nasional\\\",\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022,\\\"title\\\":\\\"ajda\\\",\\\"url_publikasi\\\":\\\"https:\\\\\\/\\\\\\/arsipmhs-abt.com\\\",\\\"link_produk\\\":null,\\\"link\\\":\\\"https:\\\\\\/\\\\\\/arsipmhs-abt.com\\\"}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:58:41\",\"created_at\":\"2026-03-06 16:48:47\",\"updated_at\":\"2026-03-06 16:48:47\"}', NULL),
('a4f8d357e1e88501159835d403cef7c84125', 'publications', '50f81d3dafd4ae7cee891d7e47c69747eef7', 'deleted', 'admin-abt-001', '2026-03-06 10:16:16', '{\"id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"source_table\":\"achievements\",\"source_id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"judul 2\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', '{\"id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"source_table\":\"achievements\",\"source_id\":\"50f81d3dafd4ae7cee891d7e47c69747eef7\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2022\",\"payload\":\"{\\\"category\\\":\\\"scientific_work\\\",\\\"subcategory\\\":\\\"journal_publication\\\",\\\"achievement_type\\\":\\\"academic\\\",\\\"tingkat\\\":\\\"internasional\\\",\\\"jenis_perolehan\\\":\\\"mandiri\\\",\\\"nama_dosen\\\":\\\"-\\\",\\\"jenis_diseminasi\\\":\\\"jurnal\\\",\\\"level_diseminasi\\\":\\\"international\\\",\\\"title\\\":\\\"judul 2\\\",\\\"judul_publikasi\\\":null,\\\"level_seminar\\\":null,\\\"tanggal_publikasi\\\":null,\\\"nama_seminar_konferensi\\\":null,\\\"url_publikasi\\\":null,\\\"penulis\\\":\\\"-\\\",\\\"is_valid_publication_seminar\\\":true,\\\"description\\\":null,\\\"tanggal\\\":\\\"2022-01-01\\\",\\\"year\\\":2022}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 17:16:16\",\"created_at\":\"2026-03-06 17:14:10\",\"updated_at\":\"2026-03-06 17:14:10\"}', NULL),
('d64f805cd4f12a436ece49d1ec4121644516', 'student_products', '84e24784dab7e78a8ee1df66478362cef958', 'deleted', 'admin-abt-001', '2026-03-06 09:57:16', '{\"id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"source_table\":\"achievements\",\"source_id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2026\",\"payload\":\"{\\\"category\\\":\\\"applied_academic\\\",\\\"subcategory\\\":\\\"makanan_minuman\\\",\\\"kategori_produk\\\":\\\"makanan_minuman\\\",\\\"achievement_type\\\":\\\"non_academic\\\",\\\"title\\\":\\\"Keripik Ubi\\\",\\\"nama_produk\\\":\\\"Keripik Ubi\\\",\\\"tanggal\\\":\\\"2026-03-06\\\",\\\"tanggal_adopsi\\\":\\\"2026-03-06\\\",\\\"lokasi\\\":null,\\\"mitra_adopsi\\\":null,\\\"penyelenggara\\\":null,\\\"description\\\":null,\\\"deskripsi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null,\\\"year\\\":2026}\",\"included_in_chart\":\"1\",\"deleted_at\":null,\"created_at\":\"2026-03-06 16:56:30\",\"updated_at\":\"2026-03-06 16:56:30\"}', '{\"id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"source_table\":\"achievements\",\"source_id\":\"84e24784dab7e78a8ee1df66478362cef958\",\"snapshot_nim\":\"4.52.18.0.03\",\"snapshot_nama\":\"AMANDA DEA SAFIRA\",\"snapshot_prodi\":\"Administrasi Bisnis Terapan\",\"snapshot_fakultas\":\"Administrasi Bisnis\",\"tahun_pelaporan\":\"2026\",\"payload\":\"{\\\"category\\\":\\\"applied_academic\\\",\\\"subcategory\\\":\\\"makanan_minuman\\\",\\\"kategori_produk\\\":\\\"makanan_minuman\\\",\\\"achievement_type\\\":\\\"non_academic\\\",\\\"title\\\":\\\"Keripik Ubi\\\",\\\"nama_produk\\\":\\\"Keripik Ubi\\\",\\\"tanggal\\\":\\\"2026-03-06\\\",\\\"tanggal_adopsi\\\":\\\"2026-03-06\\\",\\\"lokasi\\\":null,\\\"mitra_adopsi\\\":null,\\\"penyelenggara\\\":null,\\\"description\\\":null,\\\"deskripsi\\\":null,\\\"link_produk\\\":null,\\\"link\\\":null,\\\"year\\\":2026}\",\"included_in_chart\":\"1\",\"deleted_at\":\"2026-03-06 16:57:16\",\"created_at\":\"2026-03-06 16:56:30\",\"updated_at\":\"2026-03-06 16:56:30\"}', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `research_output_backfill_log`
--

CREATE TABLE `research_output_backfill_log` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `source_table` varchar(64) NOT NULL,
  `source_achievement_id` varchar(64) NOT NULL,
  `source_category` varchar(64) NOT NULL,
  `source_subcategory` varchar(64) DEFAULT NULL,
  `target_achievement_id` varchar(64) DEFAULT NULL,
  `status` enum('inserted','skipped_existing','unmapped','failed') NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `satisfaction_form_responses`
--

CREATE TABLE `satisfaction_form_responses` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `invitation_id` varchar(36) NOT NULL COMMENT 'FK evaluation_invitations',
  `template_id` varchar(36) NOT NULL COMMENT 'FK satisfaction_form_templates (snapshot of form used)',
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Section/item id to value or file reference' CHECK (json_valid(`answers`)),
  `submitted_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom form responses per invitation';

-- --------------------------------------------------------

--
-- Struktur dari tabel `satisfaction_form_templates`
--

CREATE TABLE `satisfaction_form_templates` (
  `id` varchar(36) NOT NULL COMMENT 'UUID',
  `title` varchar(255) NOT NULL COMMENT 'Template display name',
  `definition` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT 'Sections and items: type, required, options, scale_min/max, etc.' CHECK (json_valid(`definition`)),
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Default template; only one row should be true; cannot delete/edit from UI',
  `is_active` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Template currently used for surveys; only one row should be true',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL COMMENT 'Soft delete for recycle bin',
  `deleted_by` varchar(36) DEFAULT NULL COMMENT 'Admin user id that moved to recycle bin'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom user satisfaction form templates';

--
-- Dumping data untuk tabel `satisfaction_form_templates`
--

INSERT INTO `satisfaction_form_templates` (`id`, `title`, `definition`, `is_default`, `is_active`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('a0000001-0000-4000-8000-000000000001', 'Template Utama Kepuasan Pengguna', '{\"sections\": [{\"id\": \"sec-company-name\", \"title\": \"Nama Perusahaan\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Contoh: PT Maju Sejahtera\", \"inputType\": \"text\"}, {\"id\": \"sec-company-address\", \"title\": \"Alamat Perusahaan\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Contoh: Jl. Sudirman No. 10, Semarang\", \"inputType\": \"text\"}, {\"id\": \"sec-employee-name\", \"title\": \"Nama Karyawan yang Dinilai\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Nama karyawan\", \"inputType\": \"text\", \"prefillFrom\": \"student.nama\"}, {\"id\": \"sec-graduation-year\", \"title\": \"Tahun Lulus\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Contoh: 2024\", \"inputType\": \"number\", \"prefillFrom\": \"student.tahun_lulus\"}, {\"id\": \"sec-study-program\", \"title\": \"Program Studi\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Contoh: Administrasi Bisnis Terapan\", \"inputType\": \"text\", \"prefillFrom\": \"student.prodi\"}, {\"id\": \"sec-current-work-division\", \"title\": \"Bagian / Bidang Kerja Saat Ini\", \"required\": true, \"type\": \"open\", \"placeholder\": \"Contoh: Operasional, HR, Keuangan\", \"inputType\": \"text\"}, {\"id\": \"sec-major-job-match\", \"title\": \"Bagian 2 - Kesesuaian Jurusan dengan Pekerjaan\", \"required\": true, \"type\": \"multiple_choice\", \"allowMultiple\": false, \"allowOther\": false, \"options\": [\"Ya\", \"Tidak\"]}, {\"id\": \"sec-competency-rating\", \"title\": \"Bagian 3 - Tabel Penilaian Kompetensi\", \"required\": true, \"type\": \"scale\", \"scaleMin\": 1, \"scaleMax\": 5, \"questionSource\": \"evaluation_aspects\", \"questions\": [{\"id\": \"asp-001\", \"title\": \"Etika\"}, {\"id\": \"asp-002\", \"title\": \"Keahlian pada bidang ilmu (kompetensi utama)\"}, {\"id\": \"asp-003\", \"title\": \"Kemampuan berbahasa asing\"}, {\"id\": \"asp-004\", \"title\": \"Penggunaan teknologi informasi\"}, {\"id\": \"asp-005\", \"title\": \"Kemampuan berkomunikasi\"}, {\"id\": \"asp-006\", \"title\": \"Kerjasama\"}, {\"id\": \"asp-007\", \"title\": \"Pengembangan diri\"}, {\"id\": \"asp-008\", \"title\": \"Loyalitas terhadap tujuan perusahaan\"}, {\"id\": \"asp-009\", \"title\": \"Integritas diri dalam pergaulan di perusahaan\"}, {\"id\": \"asp-010\", \"title\": \"Kemampuan mengelola waktu kerja\"}]}]}', 1, 1, '2026-03-06 08:57:21', '2026-03-06 08:57:21', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `students`
--

CREATE TABLE `students` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `nim` varchar(20) NOT NULL COMMENT 'Student ID number',
  `nama` varchar(100) NOT NULL COMMENT 'Full name',
  `jurusan` varchar(50) NOT NULL DEFAULT 'Administrasi Bisnis' COMMENT 'Department',
  `prodi` varchar(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan' COMMENT 'Study Program',
  `status` enum('active','on_leave','dropout','alumni') NOT NULL DEFAULT 'active' COMMENT 'Student status',
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
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Record creation',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update',
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` varchar(36) DEFAULT NULL
) ;

--
-- Dumping data untuk tabel `students`
--

INSERT INTO `students` (`id`, `nim`, `nama`, `jurusan`, `prodi`, `status`, `tahun_masuk`, `tahun_lulus`, `email`, `login_email`, `pending_login_email`, `is_email_login_enabled`, `email_verified_at`, `email_verification_token_hash`, `email_verification_expires_at`, `email_verification_sent_at`, `email_verification_otp_hash`, `no_hp`, `alamat`, `user_id`, `has_credentials`, `last_login`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('003da7d7fa7205b44d926b8fbf31e78747af', '4.52.21.0.30', 'VIA OKTAFIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ea3e30a6c0b8217917c95fe499d8dd7dc5ba', 1, NULL, '2026-03-06 09:21:59', '2026-03-06 09:21:59', NULL, NULL),
('01b057f17c3f11beec30e04171756d6e44b6', '4.52.20.0.25', 'SALSA AYU AZIZAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a523b086862c503ab130a92dcd8421caeadf', 1, NULL, '2026-03-06 09:21:35', '2026-03-06 09:21:35', NULL, NULL),
('01ef195987b6e544b4c75c5977d9da069f0d', '4.52.20.1.16', 'NABILA NUR HALIZA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3864f15525d65d4e587f9666d908dd89dd7f', 1, NULL, '2026-03-06 09:21:42', '2026-03-06 09:21:42', NULL, NULL),
('030f59609cda5a60f81198f5b1a033d51df0', '45219006', 'DIAH LARASATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2030, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ea01242711e02c747f85ae7bf2296fb1b5fc', 1, NULL, '2026-03-06 09:27:09', '2026-03-06 09:41:07', NULL, NULL),
('042164db015bdd12a31d46284a579c9dfc8b', '4.52.20.1.19', 'NURUL CHASANATIN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '675cbf8a69d0d2c0b353d3022238f927d6c6', 1, NULL, '2026-03-06 09:21:43', '2026-03-06 09:21:43', NULL, NULL),
('046147ef4986d6d5d058a80f259d7a236606', '4.52.19.0.15', 'IVA SALMA RAMADHANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a1426b6837143d4b93fc44dadd1210e0eaba', 1, NULL, '2026-03-06 09:21:07', '2026-03-06 09:21:07', NULL, NULL),
('0500f97f9d0ec4df20ee471998c24a7c91b5', '4.52.25.1.09', 'DYAH AYU SURYORATRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b0ae4e14a2bc469a49a611c436937ad1b8d1', 1, NULL, '2026-03-06 09:22:41', '2026-03-06 09:22:41', NULL, NULL),
('072eb1c753f07d7bc2bfc309e6a7d36cd324', '4.52.21.1.16', 'JULIATHA NABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8ccb4c8d2c6d226dbaee693a62c022562d13', 1, NULL, '2026-03-06 09:22:04', '2026-03-06 09:22:04', NULL, NULL),
('098da1e1846cb162baaccc4fefaa100f5768', '4.52.20.1.18', 'NELY FALAHATI SIYAMI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '738bacc080ec91d3f1c52a65d739d07a3228', 1, NULL, '2026-03-06 09:21:43', '2026-03-06 09:21:43', NULL, NULL),
('09a0d7c79054d82dd5490c5421b42656ce63', '4.52.21.1.08', 'DEKSA ALENIA ISNA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9e3a7a17fbd7baa0ed526c1dbe4b66b69882', 1, NULL, '2026-03-06 09:22:02', '2026-03-06 09:22:02', NULL, NULL),
('09ed011e1ca2bfe3dfd62a34d32fef2a98ac', '4.52.23.8.11', 'TSURAYA DIANETA DEVI ASAWIMANDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0ede972c9fc05216c2366b5adba53078d496', 1, NULL, '2026-03-06 09:22:26', '2026-03-06 09:22:26', NULL, NULL),
('0a37791e154af6e9330d6de2c7df4c9eb192', '4.52.21.0.01', 'ABELIA RAHMA PRATIWI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '11de9df701303bacfd860f2ed20e6b8a1451', 1, NULL, '2026-03-06 09:21:47', '2026-03-06 09:21:47', NULL, NULL),
('0acba23f6deaca46e6c3046fc358fe05fdd0', '4.52.20.0.26', 'SALSABILA TIARA WIDYASARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '57dfad4885261b529ff29cfea4860320da37', 1, NULL, '2026-03-06 09:21:35', '2026-03-06 09:21:35', NULL, NULL),
('0c036e5e21e212a5127b62a7f883e2b0326b', '4.52.21.2.13', 'FAJAR MU\'MININ', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0caebb5899ca9e6a1ca8481bb57c92d5f004', 1, NULL, '2026-03-06 09:22:15', '2026-03-06 09:22:15', NULL, NULL),
('0caa1788191a71ae13a6867d4645011ac53c', '4.52.20.1.20', 'RAHMA MAULINA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '18e653b94fc8fcaebaf7400899746fbfbfc0', 1, NULL, '2026-03-06 09:21:44', '2026-03-06 09:21:44', NULL, NULL),
('0cdeb89a48f1ee37289b6a2c7fab239ee9e2', '4.52.19.0.23', 'PRISMA DINDA ZASMI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '35968801066d6d9a4129e6366f520096724f', 1, NULL, '2026-03-06 09:21:09', '2026-03-06 09:21:09', NULL, NULL),
('0da5bac192c69bb43398f3118da55a299576', '4.52.21.1.25', 'SAFIRA EKA FARIHA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fde1bd4e341af0c2c6426c22ded084ab91b7', 1, NULL, '2026-03-06 09:22:08', '2026-03-06 09:22:08', NULL, NULL),
('0dd96138b3b39a51e86d52be10f46aae1a3a', '4.52.25.2.08', 'FADILAH AISYAH RAHMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '34dfdac9d8f4e46c4aa2c11ac1a74a0019dd', 1, NULL, '2026-03-06 09:22:52', '2026-03-06 09:22:52', NULL, NULL),
('0ea178aacfa3b80105828ee44df1552f9e04', '4.52.25.3.06', 'DIANA NURUL AINI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b98b361b9839d59fe9d1e1c51b1e16d3424c', 1, NULL, '2026-03-06 09:23:03', '2026-03-06 09:23:03', NULL, NULL),
('0f238004f161e0ad1abca141e54c13ad5795', '4.52.19.0.19', 'MUHAMMAD NAUFAL ARIF', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6b07e6bf852669c88e3881664f609066e537', 1, NULL, '2026-03-06 09:21:37', '2026-03-06 09:21:37', NULL, NULL),
('0f33510e0800aeb67f00fc185253b786dcf9', '4.52.20.0.04', 'AQILA FITRI NUR KAMILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bb4da056e4ff406e379ce8d9f252c46db0ef', 1, NULL, '2026-03-06 09:21:26', '2026-03-06 09:21:26', NULL, NULL),
('101b39b15af5a49b72d1e607ad12c982ee30', '4.52.20.1.02', 'ANGGRE FARHANNA JULIASANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4541db92aea907363b9dec8c404c0668497b', 1, NULL, '2026-03-06 09:21:38', '2026-03-06 09:21:38', NULL, NULL),
('10b1c577897b45b18a3c46ba5aa5fcdb27e9', '4.52.21.0.24', 'RIFDA ARDELIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '03c51d9daa3b637a8481b8d1d2f5a2f86472', 1, NULL, '2026-03-06 09:21:56', '2026-03-06 09:21:56', NULL, NULL),
('10cc142fa1ea032c48ed5d7704f29388cadc', '4.52.21.1.09', 'DIYAH AYU WAHYUNI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '147cd149f54e18e91369ffddca30ff2aafa4', 1, NULL, '2026-03-06 09:22:02', '2026-03-06 09:22:02', NULL, NULL),
('17770c9721a4f4dccf875f7771b011f96fb4', '4.52.25.0.01', 'ADIL SHERLYNA MELODI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3b1903ef4ff29e4088e181c5e1be7a5dbc03', 1, NULL, '2026-03-06 09:22:27', '2026-03-06 09:22:27', NULL, NULL),
('188d70f36ee6d464be612ce0c0bb3df06466', '4.52.19.0.13', 'HANINA AMILA HUSNA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1c975a2bd289b7bc2488a6436f970c50f2ae', 1, NULL, '2026-03-06 09:21:06', '2026-03-06 09:21:06', NULL, NULL),
('18c375036c52e93e25c5a823f25c8a372599', '4.52.25.3.07', 'DINDA ISLAMI PASHA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '44db3744ecdfe1d6d670c4e7f2516233e098', 1, NULL, '2026-03-06 09:23:03', '2026-03-06 09:23:03', NULL, NULL),
('19704b9d821cec1bc92ac7a561c67ba72886', '4.52.20.0.29', 'VHIELA EKA PRAMITASARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3ec327f6ea3f475e36aa9f558cc0d7710575', 1, NULL, '2026-03-06 09:21:36', '2026-03-06 09:21:36', NULL, NULL),
('19af2f159fd0e7b28ddf5cc700b32b103eb8', '4.52.19.0.07', 'DIAH PUSPITA ANGGRAENI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cc41f7e5f28c65d0d56246782e1229e1ccd1', 1, NULL, '2026-03-06 09:21:04', '2026-03-06 09:21:04', NULL, NULL),
('1b0a06c4b8e586830fd48c483c000c662130', '4.52.21.0.19', 'NAJLA DEBI HABSARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7de6af6c2ef3a4068dd3801c75382be10056', 1, NULL, '2026-03-06 09:21:54', '2026-03-06 09:21:54', NULL, NULL),
('1b9f37d7aaa59ca7d4ed0604027cb98736d5', '4.52.25.2.12', 'KHOFIFATUL MAULANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b73ee6e339a14ee857199dd06821f653944d', 1, NULL, '2026-03-06 09:22:54', '2026-03-06 09:22:54', NULL, NULL),
('1bca372eab5ab0697fa79943cc2b411d7c01', '4.52.25.3.11', 'HANUM ALIFFIA NUHAYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '57cf83057315b2a9fe875fd375e40c67a9ef', 1, NULL, '2026-03-06 09:23:05', '2026-03-06 09:23:05', NULL, NULL),
('1c2ae505d51ef31b1c546b1011464e5745b7', '4.52.25.2.28', 'ZAHRA SALSABILA MAHDIYYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '58b54715ac51e684b57202df199ed6aaff1a', 1, NULL, '2026-03-06 09:23:00', '2026-03-06 09:23:00', NULL, NULL),
('1cbbf30cb76aa72da75c6f808bfd0bf7fcda', '4.52.25.1.03', 'ANDINI EKA APRILIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0b5b79479923ee355408c935f15cad1432ee', 1, NULL, '2026-03-06 09:22:39', '2026-03-06 09:22:39', NULL, NULL),
('1dc24a81835f7cb29ea3b8563d231752725b', '4.52.21.1.07', 'BINTANG TITIS SATRIO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'af8a6809147927d887d34ef9f28c40f45909', 1, NULL, '2026-03-06 09:22:02', '2026-03-06 09:22:02', NULL, NULL),
('1df8fbfd0a23a1b0200b3d860423a9f012db', '4.52.21.1.20', 'NOFITA SALSABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5f2ba7292ad874ab748a523491aeb66f4f68', 1, NULL, '2026-03-06 09:22:06', '2026-03-06 09:22:06', NULL, NULL),
('1e406ad065261aa023b781cb424af3adc9fd', '4.52.21.0.22', 'RAFI WILLY FEBRIAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '82ea2ad1a1708fa76468f1625f272957def0', 1, NULL, '2026-03-06 09:21:56', '2026-03-06 09:21:56', NULL, NULL),
('1f45989687e63395e2d6ad69c95b9894a413', '4.52.25.2.20', 'NOVELIA AGNIMAYA WIBOWO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '02095ab141206539bf833264a8dd489e81ab', 1, NULL, '2026-03-06 09:22:57', '2026-03-06 09:22:57', NULL, NULL),
('2142109d7db8f73062a43ddabbb61931bfe3', '4.52.25.3.18', 'NAJWA DINDA SEKAR ORCHITA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '518cdddcc74e4c9dbe1a96ea2297d3d10625', 1, NULL, '2026-03-06 09:23:08', '2026-03-06 09:23:08', NULL, NULL),
('21b39b042ee5b48610bb4733e185324f8075', '4.52.25.1.01', 'AISHA DAHAYU LAKSMI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8ce93ba0552915947fab5c7cb74447eecf06', 1, NULL, '2026-03-06 09:22:38', '2026-03-06 09:22:38', NULL, NULL),
('21c28c6392c85c7617e1a0f090223b8e48b8', '4.52.19.0.08', 'DIDIN DARMAWAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ba5c038ea98b67314ba50ddb08b73928c008', 1, NULL, '2026-03-06 09:21:04', '2026-03-06 09:21:04', NULL, NULL),
('221bf8fbf5e1ccf02b63ca49098dbf58880a', '4.52.23.8.09', 'SEMUEL DENI KOROWA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '442ee479158f6f48cdc54688aa802625e67f', 1, NULL, '2026-03-06 09:22:25', '2026-03-06 09:22:25', NULL, NULL),
('22209cf42a970d639016b70a4f4e6d66c704', '4.52.21.1.11', 'ENDAH NOER OCTAVIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '61d428c053e049aab8fa9258b6a51b9d84c4', 1, NULL, '2026-03-06 09:22:03', '2026-03-06 09:22:03', NULL, NULL),
('2237a7efc239b3bafec1994795dae520ee1f', '4.52.25.1.08', 'DESTI MUSDALIFAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8c9c3db9cacaebf6104ab5879d52c06201af', 1, NULL, '2026-03-06 09:22:41', '2026-03-06 09:22:41', NULL, NULL),
('23bf399b4e5a0e409f870615c92a3de617e5', '4.52.19.0.03', 'AUDRINA RAHMA AGUSTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '83614ce6d840f521aa64d390c31fbca4ec9e', 1, NULL, '2026-03-06 09:20:43', '2026-03-06 09:20:43', NULL, NULL),
('23d7c7483feefa59fddade92c882f393a542', '4.52.25.1.29', 'ZYAHWA NOVIA SUKMA PRATIWI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c939481a8d50b1c8957fcc11df9de6f2cbe2', 1, NULL, '2026-03-06 09:22:49', '2026-03-06 09:22:49', NULL, NULL),
('23f14b175d027f09b7e1bd386655f4a89329', '4.52.25.0.10', 'DZAKIA IMEL PUTRI FERDIAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aa26a314913fbd7c5ef7c32b31e63221e55d', 1, NULL, '2026-03-06 09:22:30', '2026-03-06 09:22:30', NULL, NULL),
('281452bc2f38e43488c26c9e6ae34c2ec2cb', '4.52.20.1.08', 'ESTI RISHMA YULIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ac65df08c67c036d2eed8549d936175a77a3', 1, NULL, '2026-03-06 09:21:40', '2026-03-06 09:21:40', NULL, NULL),
('290662834fa5625cc219e95ea3a71d40ba2f', '4.52.21.0.26', 'SALMA AYA SOFIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f4ff7d3ea2f3d4f817ca0b4a31b2c3410761', 1, NULL, '2026-03-06 09:21:57', '2026-03-06 09:21:57', NULL, NULL),
('29c65e619548b6cb9ff2b762fde79902fce4', '4.52.20.0.21', 'NUR IMAM NAZIHAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '95ea247d3a8040230c3ffcaeadb462474b3c', 1, NULL, '2026-03-06 09:21:33', '2026-03-06 09:21:33', NULL, NULL),
('2b7c323cacb1986984ff9ca7d3578df94ae1', '4.52.20.1.27', 'SRI WAHYUNI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '04f957fb52a161783b4478ec1975f5b52e71', 1, NULL, '2026-03-06 09:21:46', '2026-03-06 09:21:46', NULL, NULL),
('2bbe14f0a51d5a407761322b20ade9c9a79d', '4.52.25.2.13', 'LUTFIA FAISYA AYU', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '474ecf4bf6ece68b134a3db31fe5d75bfd6c', 1, NULL, '2026-03-06 09:22:54', '2026-03-06 09:22:54', NULL, NULL),
('2cbaf1833f05fcb322c6cd35ab628712716f', '4.52.23.8.12', 'YOHANA YUSTIN WANDADAYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '58251970b9f1befe2949b7dc6e588ef2e448', 1, NULL, '2026-03-06 09:22:26', '2026-03-06 09:22:26', NULL, NULL),
('2dd44ad64ab8a5736807530cba2c258ef929', '4.52.20.0.16', 'MILATI PUJA KESUMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e18126e5079a044f4d8ae8378ed8c7d1ca25', 1, NULL, '2026-03-06 09:21:31', '2026-03-06 09:21:31', NULL, NULL),
('2e75f50ea4b9fed247e31ca1b2f5dcd2c8e0', '4.52.25.1.18', 'MUHAMMAD RIZKI RAMANDHIKA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bda7e3dddac7f7dc488aa4870621d3691cdd', 1, NULL, '2026-03-06 09:22:45', '2026-03-06 09:22:45', NULL, NULL),
('2ea14c1244bd566dff94e9d5104307354788', '4.52.25.1.07', 'DAVINA AURA DIOLITA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e7705003c211b7ecebca46f2fd522f3dab79', 1, NULL, '2026-03-06 09:22:41', '2026-03-06 09:22:41', NULL, NULL),
('309361e4da6ebfb3f20f2b3b36d89c585287', '4.52.25.0.02', 'AFIFA TIARA RAHMADHANTY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f30319a7979bba8a05717bde9cbe6810e4f8', 1, NULL, '2026-03-06 09:22:27', '2026-03-06 09:22:27', NULL, NULL),
('3094b030d312128c982ce2bb3f0f7ed4f039', '4.52.19.0.18', 'MAUDIRA DWI SAFITRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ab8eca16361c2633513085e4aee720e589bc', 1, NULL, '2026-03-06 09:21:08', '2026-03-06 09:21:08', NULL, NULL),
('313784400d13ba34415046e26632c55f5fe6', '4.52.25.0.23', 'RIZQATUL JANNAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '22fca8e62bfb101384d33f9429979911c503', 1, NULL, '2026-03-06 09:22:36', '2026-03-06 09:22:36', NULL, NULL),
('33be31321e002e24460aab1e297db7d685c5', '4.52.25.2.06', 'DEWI ARRAHMAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5b1b7189c0771cd34647c3f0223f4644bf2f', 1, NULL, '2026-03-06 09:22:52', '2026-03-06 09:22:52', NULL, NULL),
('34f6faf63a0817b534eb0c281e839310e916', '4.52.19.0.09', 'DIVA EGIDIA PERMATA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5deddbd46e3e769420f9c1e62dda946f242d', 1, NULL, '2026-03-06 09:21:05', '2026-03-06 09:21:05', NULL, NULL),
('360d188bd84427e7c7473bc108290cca3aed', '4.52.19.1.21', 'NUR NELISA ADAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a72e5e7f17065b2065d5aa8c0c5a58b94dca', 1, NULL, '2026-03-06 09:21:21', '2026-03-06 09:21:21', NULL, NULL),
('3655995a6e791bbef362e88b925a8dbb6d16', '4.52.20.1.23', 'RIZKY TRI FEBRIAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f001c76310e4ef920c9d5a982ac0f200fc31', 1, NULL, '2026-03-06 09:21:44', '2026-03-06 09:21:44', NULL, NULL),
('38bf659b7dd24692443bc35a111153356105', '4.52.25.3.28', 'ZAFIRA RAHMADHANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '35a04f8c6c8c845b68b5acd19a1b20d4097c', 1, NULL, '2026-03-06 09:23:12', '2026-03-06 09:23:12', NULL, NULL),
('3c41934ff666bff2649995c95a8d5e3b82f4', '4.52.19.1.22', 'NURHASANAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8a5823760be11d71ca51655e7aba330e4474', 1, NULL, '2026-03-06 09:21:21', '2026-03-06 09:21:21', NULL, NULL),
('3cb539456a4848fb084e6bd88c4a58ae8d05', '4.52.19.0.24', 'RASYA KHANSA JAUZA AZHAAR', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6ed59d100d982310040d000fbd06323ec1e5', 1, NULL, '2026-03-06 09:21:10', '2026-03-06 09:21:10', NULL, NULL),
('3dff91b79e4472cf670ac994dcafbe05160a', '4.52.21.1.22', 'NURUL FATAKHILLAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e7243ae09bf645db056024a6fd14aece737b', 1, NULL, '2026-03-06 09:22:07', '2026-03-06 09:22:07', NULL, NULL),
('3efa3bbc1a138e7b7b26d27eed910dd422cb', '4.52.21.0.27', 'SETIAWAN WIBOWO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1b87139fdcb96913b2fc2d31fc2021ca4877', 1, NULL, '2026-03-06 09:21:58', '2026-03-06 09:21:58', NULL, NULL),
('3f43ebaf88dd37cc9ce03e211b381fd095d6', '4.52.25.1.11', 'FATIHA RAKA CHAIRUL FIQRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dad65b0d1bc56d2cb078db1fbdcabc36b449', 1, NULL, '2026-03-06 09:22:42', '2026-03-06 09:22:42', NULL, NULL),
('3f81402e0d588eb20d4d9dd83780ee0e1f1c', '4.52.25.1.05', 'ATHAR KHAIZURAN RAMADHAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8560c6568a43977b3c253e2d2a87cd5c5dfa', 1, NULL, '2026-03-06 09:22:40', '2026-03-06 09:22:40', NULL, NULL),
('3fb49f13c177d81b83b578cd2003a6f2a517', '4.52.25.0.05', 'ARLYNNISA SALSABYLA PANJAITAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2af07c1a39dfdc9abac651fadd0f8bffec97', 1, NULL, '2026-03-06 09:22:28', '2026-03-06 09:22:28', NULL, NULL),
('41bcf392128ab31c074537bcf2668b732cc0', '4.52.19.1.16', 'LUTHFIYA ISTIQOMAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'af7cf90ca66fa7e5d63e568b2d20ca428db4', 1, NULL, '2026-03-06 09:21:19', '2026-03-06 09:21:19', NULL, NULL),
('4353d04a9cea1dec78b66a7c25277b1e7a3d', '4.52.20.0.23', 'RAKA SETIA DINATA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c61ff187a74cf03543ade40beb1a62d8a93a', 1, NULL, '2026-03-06 09:21:34', '2026-03-06 09:21:34', NULL, NULL),
('43a8619acbe1bc7ce7bf13ef56a41da3fc74', '4.52.21.2.24', 'REDITE CAHYO PERMADI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2e4b4033f5a94ec28b568cb92696a23e4e84', 1, NULL, '2026-03-06 09:22:19', '2026-03-06 09:22:19', NULL, NULL),
('43aacbc7c75005dda2442d914ee6da969aa4', '4.52.19.0.20', 'NADYA AURIGA RAMADHANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1b2297e6bfe82ba51a2b7ee609a9d3b5bd47', 1, NULL, '2026-03-06 09:21:09', '2026-03-06 09:21:09', NULL, NULL),
('445c0cd09e47f3f893a0ed5ab27f64d73773', '4.52.25.2.02', 'ANNISA RAMADHANI ASMARA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a6008f9c03b25de2d7a76952f8a6cacec45f', 1, NULL, '2026-03-06 09:22:50', '2026-03-06 09:22:50', NULL, NULL),
('44d4dcbf47c40222d37704fc22a9a41e8ba4', '4.52.25.2.07', 'ERFIZZA CHAIRINA LATANSA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cac81c5f73372bec35c722fb7417b73c16d2', 1, NULL, '2026-03-06 09:22:52', '2026-03-06 09:22:52', NULL, NULL),
('45b10e8213b0dcd14f4220db8d6579ab9a08', '4.52.19.1.19', 'MUHAMMAD DAFFA EL HAQ', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '706c8aca012f49d14d7922563d651cab0f9d', 1, NULL, '2026-03-06 09:21:20', '2026-03-06 09:21:20', NULL, NULL),
('48283e21ee804e25c38412ae3aeae9c5e678', '4.52.21.2.15', 'HAIDAR FARUQI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b46443ac61d0433190a8beaddb744a818fd1', 1, NULL, '2026-03-06 09:22:16', '2026-03-06 09:22:16', NULL, NULL),
('482e52763d6311ad43c18e819b501653cba2', '4.52.20.0.18', 'MUHAMMAD FARHAN ARIO PUTRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b4e7d1d236f97a88941b9b8a5a191d4dc156', 1, NULL, '2026-03-06 09:21:32', '2026-03-06 09:21:32', NULL, NULL),
('4a58cb6f3ab1f00d83bf47df96f49b4cc27b', '4.52.20.1.13', 'M. RIKI FAUZI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7d935330dc354bea7551e215e17d45f13554', 1, NULL, '2026-03-06 09:21:41', '2026-03-06 09:21:41', NULL, NULL),
('4aea3b423c2d3dcd5e11ba9f556cbe8be1b4', '4.52.21.0.15', 'GABRIEL MARINDA ALVERA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '06d3aedc95ccb935ae826aecf6edd3301454', 1, NULL, '2026-03-06 09:21:53', '2026-03-06 09:21:53', NULL, NULL),
('4b98fd31d17247da0d7927f40f0f694b4756', '4.52.21.2.28', 'SAVINA UMI LESTARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '77beb0d1ddc76f42624214c05b3363ed1bb4', 1, NULL, '2026-03-06 09:22:21', '2026-03-06 09:22:21', NULL, NULL),
('4bdcdea18df895c7d617363101129f2e8450', '4.52.19.1.15', 'KHANSA ATALLAH AUFANISWARA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '99b6a0541ee20a4caddbdcd229520c2f45d2', 1, NULL, '2026-03-06 09:21:18', '2026-03-06 09:21:18', NULL, NULL),
('4cce5c9e75390ea9de787c9aa0d1d8e3c895', '4.52.21.1.01', 'AHMAD FADHOL IBAWI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ac99ae62202e5369e24bd221d722a210b507', 1, NULL, '2026-03-06 09:21:59', '2026-03-06 09:21:59', NULL, NULL),
('4de4e2e887d4f3e90720484977256629d156', '4.52.20.1.10', 'FICRYNA SHULCHA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f56d586856d0812bff60c82137d95fe9c4d6', 1, NULL, '2026-03-06 09:21:40', '2026-03-06 09:21:40', NULL, NULL),
('4df6178940e2836c17a295526f36b1850fde', '4.52.20.1.12', 'LINTANG SWARESKA SARASWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e444981acc935a1ca3ceacbdfcecebb24fc4', 1, NULL, '2026-03-06 09:21:41', '2026-03-06 09:21:41', NULL, NULL),
('4e7f0f558c12d10aa243d3ca79b636f97ba0', '4.52.20.0.28', 'TALITHA DWI WIRASTUTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2e8239662e4e619070e6582f3ae76eb08f17', 1, NULL, '2026-03-06 09:21:36', '2026-03-06 09:21:36', NULL, NULL),
('4f23a887e77e23cbbea0e5ef55bc7769e79b', '4.52.20.0.08', 'ERLANGGA PUTRA WIJAYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '35e1c7e58e5cfc0d42ab2b1763d700808c7d', 1, NULL, '2026-03-06 09:21:27', '2026-03-06 09:21:27', NULL, NULL),
('50ba95539c1dabd077300b2d04f0a64f3d65', '4.52.25.2.05', 'DESTRI RAHMA SINTA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '90d0075437c172177c4e6a93975846307ce7', 1, NULL, '2026-03-06 09:22:51', '2026-03-06 09:22:51', NULL, NULL),
('515603ec92998b19246c2136ab3867e3bfc7', '4.52.20.1.29', 'YUANITA AMALIA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a9aea50c123b7b056b6024f5bfcf14fc0f32', 1, NULL, '2026-03-06 09:21:46', '2026-03-06 09:21:46', NULL, NULL),
('525e2ae887ce7e8eab2003585e73c2e25912', '4.52.19.1.20', 'NABILA FIRDA ALFANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ac65f88aa8910b9210f5f3a2906f59ed158f', 1, NULL, '2026-03-06 09:21:21', '2026-03-06 09:21:21', NULL, NULL),
('5271818e247c627b22a6288058d95976a783', '4.52.19.0.17', 'LATIFATU ZAKIYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1e06023b1c5c2405d30d46282f31b71b350a', 1, NULL, '2026-03-06 09:21:08', '2026-03-06 09:21:08', NULL, NULL),
('5291bc834e51af8c41d39ac5e524290491dc', '4.52.25.2.09', 'FANDY ADITYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '650d72fd7ed1a70575627b3cdafe78b0ae5d', 1, NULL, '2026-03-06 09:22:53', '2026-03-06 09:22:53', NULL, NULL),
('529fc33388f338dec8363c442676fc99cf22', '4.52.20.0.11', 'FADILLA DWI RAHAYU', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5386d2c5f305cd2bb79d362db7694f946b24', 1, NULL, '2026-03-06 09:21:29', '2026-03-06 09:21:29', NULL, NULL),
('52d3681943ce6fa6fc5bd547bff45c78713f', '4.52.21.1.21', 'NUR KHASANAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ea053e8f64781c22983efc280e8127f8d389', 1, NULL, '2026-03-06 09:22:07', '2026-03-06 09:22:07', NULL, NULL),
('53667feb06b20509a92dd3b0d90d27a458e3', '4.52.21.0.20', 'NANA SOVIANA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3ec2537875dd3fadb18517ba68919e6aa53f', 1, NULL, '2026-03-06 09:21:55', '2026-03-06 09:21:55', NULL, NULL),
('53723f0676969ac955f9c96bfc0a21e67d60', '4.52.25.0.11', 'FAUZI IZZI ITSAR ILYASA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5637ce926b312674894386f82923df059305', 1, NULL, '2026-03-06 09:22:31', '2026-03-06 09:22:31', NULL, NULL),
('539b70b0bc6e652a73b318edf0413e652bce', '4.52.25.0.28', 'VIO ANTHAREZA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f1dd1613f4a439f8862e7a1832aae8510ba9', 1, NULL, '2026-03-06 09:22:37', '2026-03-06 09:22:37', NULL, NULL),
('5507dcf6d6a78ce39cbc690cf4600f5d6646', '4.52.20.0.20', 'NAILA DIVA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd9ce1cd7fb67d901924e456f24b78d72d993', 1, NULL, '2026-03-06 09:21:32', '2026-03-06 09:21:32', NULL, NULL),
('551e8f6f02658105e21956a0a62de947290c', '4.52.19.0.22', 'NISRINA AYU SEPTIANINGRUM', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '47139c44cd245d217ab40c9c4a4c1cde22ee', 1, NULL, '2026-03-06 09:21:09', '2026-03-06 09:21:09', NULL, NULL),
('55c0a23dc270d290682a65e61b8d755f302c', '4.52.20.0.09', 'ERLYAN FERDIANNA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a7e9e69fabaf5babaed54d7207fb9baa6d68', 1, NULL, '2026-03-06 09:21:28', '2026-03-06 09:21:28', NULL, NULL),
('56b2b9a62f800ceb85ca241baf4cee3d1260', '4.52.18.1.12', 'INDIE DELIMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2018, 2021, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6c4791d281ecc1fd15f544be19a7f86e46e1', 1, NULL, '2026-03-06 09:21:13', '2026-03-06 09:21:13', NULL, NULL),
('5835e296d1ecd15c4be9022181cc0788af3e', '4.52.21.1.18', 'MUHAMMAD FACHRUR HIDAYAT', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '89ca018168720c88f772e5587b7e9c64e3f4', 1, NULL, '2026-03-06 09:22:05', '2026-03-06 09:22:05', NULL, NULL),
('58b1d15cde462eb6f8a2713afd96421b6fd8', '4.52.25.0.14', 'JILTERIZA MAYLAFAYZA DESTYA HADI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'befc1e95a6d303a5a0a571e244e0e4a8da57', 1, NULL, '2026-03-06 09:22:32', '2026-03-06 09:22:32', NULL, NULL),
('591e8a8155a1c58ff3ff663a91ddd0aedc6e', '4.52.20.1.21', 'RAMA TAUFIQURROHMAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fb4c057eae2eac2be2ea69177660efa5143f', 1, NULL, '2026-03-06 09:21:44', '2026-03-06 09:21:44', NULL, NULL),
('5986df87156cacd99ef6ac5dea84400f3c4f', '4.52.21.1.06', 'BETY PUJI RAHAYU', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1dec14d527324c94f2deb1d2b87e8ec764f3', 1, NULL, '2026-03-06 09:22:01', '2026-03-06 09:22:01', NULL, NULL),
('5ad31c6908702df08a5e7506aa065efd9618', '4.52.19.0.14', 'HESTI ELI TRIASMORO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cb713698afcbb7669e8930bc1641e37065cb', 1, NULL, '2026-03-06 09:21:07', '2026-03-06 09:21:07', NULL, NULL),
('5adf0071bf160c34ff04f3282bcd41a04c91', '4.52.21.0.25', 'RINDANG RIZKIDEWA FAJARAYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '933c675c6ea6ba9c362c32fdc73214c986bc', 1, NULL, '2026-03-06 09:21:57', '2026-03-06 09:21:57', NULL, NULL),
('5bb7b973e42002907630f37cac6b6d69274a', '4.52.25.2.01', 'ALIFIA MAHARANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f0efea0b5d6fd06b4ec22a967bd31adb9eb7', 1, NULL, '2026-03-06 09:22:50', '2026-03-06 09:22:50', NULL, NULL),
('5c12e523c99c34a70e22e97b591b60f54371', '4.52.19.0.02', 'ANNE OKTANAFIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0462115fd74d06a90e8057e2ff95925b69fa', 1, NULL, '2026-03-06 09:20:43', '2026-03-06 09:20:43', NULL, NULL),
('5ca46ea2bf48ad08a093981c9994d6b826ef', '4.52.25.1.10', 'ELFRIEDA GRACE NATALIE', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cad07b332da9fb3de90280cec3de721004fb', 1, NULL, '2026-03-06 09:22:42', '2026-03-06 09:22:42', NULL, NULL),
('5cf2db78b73106f4ee68ad839b83986e3a91', '4.52.25.1.24', 'SALMA NADIYA FENANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e76689ae6dcf0bb62edad0bce01e398bdc93', 1, NULL, '2026-03-06 09:22:47', '2026-03-06 09:22:47', NULL, NULL),
('5e1aff6f31bf4cee1abc304574eb282bf4cd', '4.52.19.0.12', 'FERDIANSYAH NAUFAL RAMADHAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c75b452b90c2884a52d74798de24ba038453', 1, NULL, '2026-03-06 09:21:06', '2026-03-06 09:21:06', NULL, NULL),
('5ecc2ab483b3bce40b1ed24a174619f84f6d', '4.52.21.1.02', 'ALIF RAFLY PRADITHIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a2d88e9cb0c90cf2f3ba0b80bc99aab3d3e2', 1, NULL, '2026-03-06 09:22:00', '2026-03-06 09:22:00', NULL, NULL),
('5ef0cef33e04a9603f5de83158075a9120d3', '4.52.20.1.11', 'KALISTA KUNTI PRAMESTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e236e69d1c56ff20aea987b50887797d35cf', 1, NULL, '2026-03-06 09:21:40', '2026-03-06 09:21:40', NULL, NULL),
('5f27c1accffa6ecde47acbdc8f373b68520f', '4.52.25.0.22', 'RAIHANI ZULFA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c974b23a9fff983d861b35b0f2872c36ec7a', 1, NULL, '2026-03-06 09:22:35', '2026-03-06 09:22:35', NULL, NULL),
('6068d2534c4501ceb550cefec837a72520b2', '4.52.25.2.04', 'AULIA NAZUWA YULIANA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '89d44bf1a4df136fca8bafd78939c35b3b67', 1, NULL, '2026-03-06 09:22:51', '2026-03-06 09:22:51', NULL, NULL),
('607dd90a64d383304b98bd41d8cc47a127f3', '4.52.25.1.20', 'NAUFAL DZAKI ARDHIAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8ccd9de0cda5153de135c255c57dab513fd0', 1, NULL, '2026-03-06 09:22:46', '2026-03-06 09:22:46', NULL, NULL),
('61f375392b3e6cb2c806e5041458a7640670', '4.52.21.2.21', 'PAULINA KARTIKA AJENG LARASATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd87f63d30f6b666863ac61e40c73a553207b', 1, NULL, '2026-03-06 09:22:18', '2026-03-06 09:22:18', NULL, NULL),
('622ffa11ee1cfdc9668e7e4de11359824b30', '4.52.20.0.30', 'YUDHA ESA PRIBADI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8b1efe09aee841ff1bd8a9433b977173ab4a', 1, NULL, '2026-03-06 09:21:37', '2026-03-06 09:21:37', NULL, NULL),
('64afefd8fe156eb8d79c087c3f30418e496c', '4.52.19.1.17', 'MARETA MARGAYANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '15d7004be485ba4a5abcb2d07317875a1214', 1, NULL, '2026-03-06 09:21:19', '2026-03-06 09:21:19', NULL, NULL),
('64e76435bb26eed1ec5af4a891e1bb598ace', '4.52.25.3.16', 'MUHAMMAD HAKIM MAULANA HALBA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5b945e3a8d93bd2bd01a1ffba3758c7d29da', 1, NULL, '2026-03-06 09:23:07', '2026-03-06 09:23:07', NULL, NULL),
('656f34a5b1f1bb9ce493fd7966b1d36e90b5', '4.52.19.1.09', 'ERICHA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '28fb5601c85c558ac9660b25a859dcdd4de0', 1, NULL, '2026-03-06 09:21:16', '2026-03-06 09:21:16', NULL, NULL),
('674760a9ec2f5c87a8350c6f95958f07e16a', '4.52.25.1.04', 'ANGGI LAUDIYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c3d9a856e9d7678b0be5b935a53039ec88d9', 1, NULL, '2026-03-06 09:22:39', '2026-03-06 09:22:39', NULL, NULL),
('67575183f10d0d500ac6afbc22d0db667e0a', '4.52.25.1.27', 'TALITHA NAFISA RAHMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0d7d7303b406fa1f93b37443122c2720b0fb', 1, NULL, '2026-03-06 09:22:48', '2026-03-06 09:22:48', NULL, NULL),
('6872fe7e9ca8c321513b3c5db6a208cdec40', '4.52.25.0.29', 'ZIDNII SURYA SABRANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6add5ba2c6d87f41d7e2b8d1eac453111c2b', 1, NULL, '2026-03-06 09:22:38', '2026-03-06 09:22:38', NULL, NULL),
('688242b2399969fee180c8f059443a5c44cd', '4.52.25.2.25', 'TARA LATIFAH TAUFIQA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4f15d5b2190a90fd275e312481abd8973bc4', 1, NULL, '2026-03-06 09:22:59', '2026-03-06 09:22:59', NULL, NULL),
('68e6ba31f87851f9821434adf03764befc87', '4.52.19.0.11', 'FEBRY KOMALA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aa8c34c88b9f6b2fbf8e9563a4cb32f91694', 1, NULL, '2026-03-06 09:21:05', '2026-03-06 09:21:05', NULL, NULL),
('69317fbce0902ef6012fb17881abdeb013bf', '4.52.19.1.27', 'SYIFA FADILAH ARIYANTO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fbff0ce75e2d830a8c618c2b723e3006c044', 1, NULL, '2026-03-06 09:21:23', '2026-03-06 09:21:23', NULL, NULL),
('6ac7a70e172e976b899570cb52c6bc1dbea2', '4.52.19.0.05', 'DELLA ANDRIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e9456c26ac6af0aadf20c6693b2938707aa5', 1, NULL, '2026-03-09 08:56:22', '2026-03-09 08:56:22', NULL, NULL),
('6bdc298a03c0dbacf359a628892e73aa0466', '4.52.25.3.08', 'EUGENIUS JESSEYRO FAREL ARDANA PUTRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '16ac3e5f0e677e606498efe1671aa8c71b13', 1, NULL, '2026-03-06 09:23:04', '2026-03-06 09:23:04', NULL, NULL),
('6c5445047c96d0a61fbf9eeb241eac70e15e', '4.52.19.0.16', 'JULIA ANGGUN PRAVITASARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'aa81e3d18748bd0e57a61d6b4b1f12c47d3b', 1, NULL, '2026-03-06 09:21:07', '2026-03-06 09:21:07', NULL, NULL),
('6de60a284a66f721ea44950ff7e7331d7cef', '4.52.21.2.20', 'NURBIYANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '62c03003fe488a2ab98a9ee320bc9076e41b', 1, NULL, '2026-03-06 09:22:17', '2026-03-06 09:22:17', NULL, NULL),
('6f7e05bcddad07ef178b4873bde430a2f5d7', '4.52.25.1.13', 'HAFSHAH AULIA AZ ZAHRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '15807ce9b8d8f3f989f08e470fc5a6c42151', 1, NULL, '2026-03-06 09:22:43', '2026-03-06 09:22:43', NULL, NULL),
('6fa6ccefc13a5074d913933e34b5a9e25204', '4.52.20.0.06', 'ATHAYA AURELLIA RIFANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0f5359fa69b8615a7e7a001fee1020fb1216', 1, NULL, '2026-03-06 09:21:27', '2026-03-06 09:21:27', NULL, NULL),
('6fcd2599645a33ca32de7ac29763a126dd68', '4.52.21.1.04', 'ARIELLA PUTRI WIDY AYUDITHA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ceaf5a65511631987ec0e3b44b15f14c0c78', 1, NULL, '2026-03-06 09:22:01', '2026-03-06 09:22:01', NULL, NULL),
('70ad246bdf93291f2fbedb09edeb38aa2029', '4.52.20.1.28', 'TARA AYUNINGRUM', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f212c489f54af700263976982501e4f36f8d', 1, NULL, '2026-03-06 09:21:46', '2026-03-06 09:21:46', NULL, NULL),
('71515584569fb5e50abefe27c2e6b23b4abc', '4.52.25.2.14', 'MAQFIRRAH LAILY RAMADHANIA FAISAL', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '09929a41cac922e7126b8bb501b95a05ebc3', 1, NULL, '2026-03-06 09:22:55', '2026-03-06 09:22:55', NULL, NULL),
('7476eb30c82032ac1994977ba375631ac609', '4.52.21.2.30', 'ZAKKY AL MUBARAK', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c69afd8c2fc953c7f1a38267ca695b51dcb3', 1, NULL, '2026-03-06 09:22:22', '2026-03-06 09:22:22', NULL, NULL),
('757f8cc2bfc347d4bf4d3341426175c198b2', '4.52.25.2.11', 'KALYCA ZAHRA AZALIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd24a6329668b772f3d6cca91720b2991c7a7', 1, NULL, '2026-03-06 09:22:54', '2026-03-06 09:22:54', NULL, NULL),
('75e23d523ed908fe745bb255daf48126a57e', '4.52.20.0.07', 'DEANDRA AURORA PRADIPTA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7e70311819f7474909bb1842b3dacb3b0c69', 1, NULL, '2026-03-06 09:21:27', '2026-03-06 09:21:27', NULL, NULL),
('76266e35ddc8daf68968093ab3840ed5fd32', '4.52.19.1.30', 'VICKA AZIZIAH MAULANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7c438351ea98ee7652c3300100048ea10311', 1, NULL, '2026-03-06 09:21:24', '2026-03-06 09:21:24', NULL, NULL),
('76c494e146b3916e9ab33c5d8615749cc79c', '4.52.25.3.17', 'NADHIFA AMANDA MAULIDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '39e40edf749bfd3a1905dcd587276ec5039c', 1, NULL, '2026-03-06 09:23:07', '2026-03-06 09:23:07', NULL, NULL),
('779347cc85e72e8d334347ec3c78bd94f6cf', '4.52.25.3.02', 'ALYSHA JASMINE YULIANTO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '136648c3fd51e543c79f502b18f3bbf32422', 1, NULL, '2026-03-06 09:23:01', '2026-03-06 09:23:01', NULL, NULL),
('784c0fabdeaaaa0acd3e3cf790df2b6c4f2e', '4.52.25.1.25', 'SHOFIYATUR RUHANIYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '44d6a055ba272e8a52c1b7c048a7264c525e', 1, NULL, '2026-03-06 09:22:47', '2026-03-06 09:22:47', NULL, NULL),
('794a44596044ec4425e94de44f884c367120', '4.52.21.2.14', 'FARAH HUSNA PRAMESTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '56cb7e888e436245699bf485beca8a3e20b0', 1, NULL, '2026-03-06 09:22:15', '2026-03-06 09:22:15', NULL, NULL),
('79e27a30e005bea5851cf5d3b6a95d92e27c', '4.52.25.3.05', 'AZZAHRA PUTRI NURHIDAYAT', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'edb3ff8c4fcc56eaa68a177623af97ffd08e', 1, NULL, '2026-03-06 09:23:02', '2026-03-06 09:23:02', NULL, NULL),
('7a93b304d457de12fb08300e1ba391e7d599', '4.52.19.0.27', 'SALSABILLA ALTEZA PRAMESWARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '04676120b83d9a13bf1a092acb83cd57c1b5', 1, NULL, '2026-03-06 09:21:11', '2026-03-06 09:21:11', NULL, NULL),
('7b59b4af6821e777db73e457890354cf99f5', '4.52.19.1.13', 'INAS SALMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '138747943559b7453c1e1f4c6f7b4a07b462', 1, NULL, '2026-03-06 09:21:17', '2026-03-06 09:21:17', NULL, NULL),
('7c5435578ad4f1bd96292bd0402a6c8266de', '4.52.25.2.17', 'MUHAMMAD YUDHISTIRA KHAIRIANSYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5b9cc0178d13809b8773183a2acd33c771ce', 1, NULL, '2026-03-06 09:22:56', '2026-03-06 09:22:56', NULL, NULL),
('7c690d99945d50761194bb830b90e0d56770', '4.52.25.1.06', 'CINTA LISTIA SALSABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ec58465dd826cec9bff326596eb1ff27df23', 1, NULL, '2026-03-06 09:22:40', '2026-03-06 09:22:40', NULL, NULL);
INSERT INTO `students` (`id`, `nim`, `nama`, `jurusan`, `prodi`, `status`, `tahun_masuk`, `tahun_lulus`, `email`, `login_email`, `pending_login_email`, `is_email_login_enabled`, `email_verified_at`, `email_verification_token_hash`, `email_verification_expires_at`, `email_verification_sent_at`, `email_verification_otp_hash`, `no_hp`, `alamat`, `user_id`, `has_credentials`, `last_login`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('7e04f872a05180f45ca77f02c5dc551cc24c', '4.52.19.0.10', 'ERDIAN DWI RACHMAWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '34d7b938b34f748d0d6f5f0bb1c58cd44249', 1, NULL, '2026-03-06 09:21:05', '2026-03-06 09:21:05', NULL, NULL),
('7eea370881f9d6353e1e3dbea0a29ab497e8', '4.52.19.0.30', 'SUTIYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '544a7d5b75c41e2f0615968ad0c49389a7de', 1, NULL, '2026-03-06 09:21:12', '2026-03-06 09:21:12', NULL, NULL),
('80965fbdab75f13869f034efe1367153fd46', '4.52.25.3.15', 'MUHAMMAD AZHAR RAMADHAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2a93049c247ae69b049ff7ddcfe227fc7f30', 1, NULL, '2026-03-06 09:23:07', '2026-03-06 09:23:07', NULL, NULL),
('80abf8023ddd2c8f77f45980703084928562', '4.52.25.2.21', 'PUTRI NUR NABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bdc33139f6aece6077f8b5649d2175225855', 1, NULL, '2026-03-06 09:22:58', '2026-03-06 09:22:58', NULL, NULL),
('81655187b41ee89c8acf40bc994ca3ddd833', '4.52.21.0.10', 'DIVIA CAHYA BULAN RAMADHANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '717f98103c57b1af819267bd71b08f6e7448', 1, NULL, '2026-03-06 09:21:51', '2026-03-06 09:21:51', NULL, NULL),
('83b5c4bfc37258642c903c5c419c58135ae2', '4.52.25.3.03', 'ASTI MARLINA FEBRIYANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd7a6d212e0a397629a0a48e6c6330b1ce640', 1, NULL, '2026-03-06 09:23:02', '2026-03-06 09:23:02', NULL, NULL),
('85da1612b75cc7c381d1cc12a0868080bcf3', '4.52.23.8.08', 'REGHINA NURALISYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '837e9ea3556c489d6edde590d828810c1463', 1, NULL, '2026-03-06 09:22:25', '2026-03-06 09:22:25', NULL, NULL),
('8604364403de2b6f4e7fdc017acc13ef9cc1', '4.52.21.0.18', 'MODESTA DHEA MARSHEILLA SAVIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '824b47b916182182510baf3baa843770bdde', 1, NULL, '2026-03-06 09:21:54', '2026-03-06 09:21:54', NULL, NULL),
('86f5fbe54a77680d085d95f5d18ff7470536', '4.52.20.0.12', 'LAKSAMANA MUQSITHU', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b4d05b21e2b22d36931441187fef7b95bcf3', 1, NULL, '2026-03-06 09:21:29', '2026-03-06 09:21:29', NULL, NULL),
('87a856efedc0080606e96f91d7977f2f5003', '4.52.20.0.22', 'RACHMADIAN NURWULAN FITRIYANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2f58a690d40ec4ffaf303b3bc9c6ff304a7a', 1, NULL, '2026-03-06 09:21:33', '2026-03-06 09:21:33', NULL, NULL),
('87ccf34b080baa0a3d722d5bb3335c49318c', '4.52.20.0.14', 'LUTFI RIDHOWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '38c4042bd70b60564facfe3f7c08b074a908', 1, NULL, '2026-03-06 09:21:30', '2026-03-06 09:21:30', NULL, NULL),
('87da855432b8a38f6599563fd10f925e14a6', '4.52.21.1.12', 'FADILA BERLIANA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1b201f730ca30aa24d5da0cf85a7706b4c8d', 1, NULL, '2026-03-06 09:22:03', '2026-03-06 09:22:03', NULL, NULL),
('88c6e621aa070879b0dd70935a7539c1caa0', '4.52.25.3.04', 'AZKA ZULIDA RAHMAWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '749799cd1161f73e5ee300d9eef7012a64e0', 1, NULL, '2026-03-06 09:23:02', '2026-03-06 09:23:02', NULL, NULL),
('890150304b390253b1eee29b47fc6e56af5f', '4.52.21.1.23', 'RAHMA FATHIMATUZ ZAHRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '505f9ed9ad80a74e6b2cc7289bf76b18e230', 1, NULL, '2026-03-06 09:22:07', '2026-03-06 09:22:07', NULL, NULL),
('8af7feab66dfafe3582e82ef5edf78323c9f', '4.52.25.0.18', 'NAJWAN ZAAKIY RAFATA HERMAWAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '10c3f0b5a3c6821bb291920820908776f44d', 1, NULL, '2026-03-06 09:22:34', '2026-03-06 09:22:34', NULL, NULL),
('8b184351e1c5a6f4f54288d3e660b8a9a48b', '4.52.19.1.05', 'ASTI KHOERUNISA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '39c5b82e9f17175953143614bf663fafcbdf', 1, NULL, '2026-03-06 09:21:14', '2026-03-06 09:21:14', NULL, NULL),
('8c0a8e7278e00a4c6366a12ea212f50af639', '4.52.21.2.29', 'ULYA AMRINA ROSYADA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd4762130f410bbb3e80e58ed325a4be390ef', 1, NULL, '2026-03-06 09:22:21', '2026-03-06 09:22:21', NULL, NULL),
('8c4f84f9f7a2a50c4797f028f2188fd4aabf', '4.52.25.0.25', 'SHELLOMITA DEVINA PRASTICA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '526fbd399068bb65e05d8feaa4d82ec2b337', 1, NULL, '2026-03-06 09:22:36', '2026-03-06 09:22:36', NULL, NULL),
('8d255ba2a98375b9e9b6dbb0efda90fe26b9', '4.52.25.3.12', 'KUN ASHRI RAHMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '75713dca7c2cb230f0abdbc74c4e30d58fa5', 1, NULL, '2026-03-06 09:23:05', '2026-03-06 09:23:05', NULL, NULL),
('8d552a500a42bb233355dfd56375dc7d6d10', '4.52.21.0.06', 'AZZAM ALHAFHIZD', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4afe9bb000f4953d1eec621f51c5bf0858a7', 1, NULL, '2026-03-06 09:21:49', '2026-03-06 09:21:49', NULL, NULL),
('8d5bca3c835456496c227129732982bd7ae7', '4.52.23.8.07', 'PUTRA HOFNI BUANG KARUAPI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dcc25db9986c410c8b7c779c9e6dff4010f6', 1, NULL, '2026-03-06 09:22:24', '2026-03-06 09:22:24', NULL, NULL),
('8eb9fa5350989550275382b57f6d80bfcff5', '4.52.20.1.15', 'MICHELLA DENINTA SULISTYO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b14836357aec96284e64f392b7c4e0b3ee7e', 1, NULL, '2026-03-06 09:21:42', '2026-03-06 09:21:42', NULL, NULL),
('8efb30b3c52026e0d9c35dd84214c852ca0c', '4.52.25.3.09', 'FATIMAH NUR JANNATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '61471ccabc25df96b76e1cc147ccfada8e21', 1, NULL, '2026-03-06 09:23:04', '2026-03-06 09:23:04', NULL, NULL),
('904ff18404fd9e86462c373322c3444b9171', '4.52.25.2.10', 'HANNA LAA TAHZAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c808790321673af3b41e1874af728b153987', 1, NULL, '2026-03-06 09:22:53', '2026-03-06 09:22:53', NULL, NULL),
('90e5f740abaa25740c2eb4b277554670c9cc', '4.52.20.0.05', 'ARDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '231c2d86709b9e9227fe21c47039e5ed2756', 1, NULL, '2026-03-06 09:21:26', '2026-03-06 09:21:26', NULL, NULL),
('92a6f58e9bd8c45be3f82b12241ebd138094', '4.52.21.2.18', 'MEILINA DYAH SETYANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '82a97768873e3477685716915d1484c37760', 1, NULL, '2026-03-06 09:22:17', '2026-03-06 09:22:17', NULL, NULL),
('92c4ac55345063c8392d6110d6555a0e8c0d', '4.52.25.0.13', 'GABRIELLE NATALIE WIJAYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bc214093e078d44d38cf1ff3b03153b10b31', 1, NULL, '2026-03-06 09:22:31', '2026-03-06 09:22:31', NULL, NULL),
('93dd0095d8410167da9ab4bb4c7a56b29fae', '4.52.19.1.23', 'PUTRI SEKARLANGIT', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ee37d4a09ab0e34d0d5284eb90370eefee98', 1, NULL, '2026-03-06 09:21:22', '2026-03-06 09:21:22', NULL, NULL),
('93e80dd6b7eb89d4056d3ac82c2020213165', '4.52.20.1.26', 'SINTA BELA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '74fa2b33feda88041156cb67c3bf8d9324c7', 1, NULL, '2026-03-06 09:21:45', '2026-03-06 09:21:45', NULL, NULL),
('94047b792f7683892086af5477fb74d01d48', '4.52.25.1.26', 'SYAHLA GRISELDA RISANDRIYAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '93f99c8407f22a951632c1b198dc8ff3793b', 1, NULL, '2026-03-06 09:22:48', '2026-03-06 09:22:48', NULL, NULL),
('94773b87d2a5bce7ba86095d3bd257f15c56', '4.52.25.2.15', 'MARTASYA CAHYANING MUKTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b1802c92af52edf52b74de34256215ba7388', 1, NULL, '2026-03-06 09:22:55', '2026-03-06 09:22:55', NULL, NULL),
('950839c3297aff0c65849a2a98ccfe511b03', '4.52.21.0.17', 'MIRZA DZAKI KAMAL', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3bf0d66b7deeed18b7a84bb33eddbcc6abb4', 1, NULL, '2026-03-06 09:21:54', '2026-03-06 09:21:54', NULL, NULL),
('957746a7a39334cfae09b368aff30179f009', '4.52.25.2.24', 'SEFANYA MISA EGRINA S KEMBAREN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '17ecd7939734a41332ad47a7c133c2de54a3', 1, NULL, '2026-03-06 09:22:59', '2026-03-06 09:22:59', NULL, NULL),
('96a7eb0f0b1d8abdf90083d482c7fec0cc7c', '4.52.20.0.15', 'MAYDISTA LESTARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9606913d0727c5017c0701e570cd7f1ac6e5', 1, NULL, '2026-03-06 09:21:30', '2026-03-06 09:21:30', NULL, NULL),
('97793e6174717ee08cbc78edceb14dd7baf4', '4.52.25.1.28', 'TASYA LATIFA ZAHRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ddb3c9165f8f409091d7dcc8fbe796c02a8c', 1, NULL, '2026-03-06 09:22:49', '2026-03-06 09:22:49', NULL, NULL),
('99bec0bbb9b65c0fb6804a54b6f5396789be', '4.52.25.0.07', 'CHELSEA AULIA RAMADHANI PUSPO HAPSARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5170480eb3636d9e73a5bebf12e5bc39a3ef', 1, NULL, '2026-03-06 09:22:29', '2026-03-06 09:22:29', NULL, NULL),
('99f2d2709f09965142760c9b5d240d0a4faa', '4.52.21.0.11', 'ELSA MAHARANI KUMAAT', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f674c2974241a8d2d0d9d9a79953901b81f4', 1, NULL, '2026-03-06 09:21:51', '2026-03-06 09:21:51', NULL, NULL),
('9a20182e693a156c56995df05020766eb62c', '4.52.21.0.14', 'FARSYA SALSABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7d190d33271d93679aba73fd39fdbc1a0cc2', 1, NULL, '2026-03-06 09:21:52', '2026-03-06 09:21:52', NULL, NULL),
('9a582c8b4b52954a4d95d48eac52c68cc633', '4.52.19.0.29', 'SHINTA SUGIARTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fb85a11dc3178e93c0c0aa9ea5289e91cdd2', 1, NULL, '2026-03-06 09:21:12', '2026-03-06 09:21:12', NULL, NULL),
('9a68846ce979d1bd5c351817cb899ad435b0', '4.52.25.3.01', 'ADELIA AYU SAFIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '24ac7cfd58cf64ef364dd8bf0bcca589d692', 1, NULL, '2026-03-06 09:23:01', '2026-03-06 09:23:01', NULL, NULL),
('9a81afa5d7e05a31f4de6c251ef07e95e54e', '4.52.25.3.25', 'SEVIA SENTRA HATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9f3acc1ecf454e3ebcc00e76469e45316e50', 1, NULL, '2026-03-06 09:23:11', '2026-03-06 09:23:11', NULL, NULL),
('9a87ccf8b88c20883cb04699d3d87c932093', '4.52.25.0.26', 'STEFANE JOY LOVTIANDRO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4234622a981d56b1ed8566f4795de35218ef', 1, NULL, '2026-03-06 09:22:37', '2026-03-06 09:22:37', NULL, NULL),
('9aab5d951118a2a96539e8678e763c4edf0c', '4.52.19.1.18', 'MOHAMAD WIRA YUDA SAWEGA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ce03f708e47a8a8a4eb1cf3e317f8a2af460', 1, NULL, '2026-03-06 09:21:20', '2026-03-06 09:21:20', NULL, NULL),
('9ac63b0b7dc5a133d15423b48637e095cd80', '4.52.19.1.25', 'SHELVIA CHETRIN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4c020396355c22e93fd9a57fee69eeb82d25', 1, NULL, '2026-03-06 09:21:23', '2026-03-06 09:21:23', NULL, NULL),
('9c47172769005bad86a254532b741d1a1737', '4.52.21.1.30', 'ZALFA LARASATI FADILLA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a551094092a08d08c9eb8c82b568bbefddaf', 1, NULL, '2026-03-06 09:22:10', '2026-03-06 09:22:10', NULL, NULL),
('9caa0be42087abf642e127604a95bf2a6666', '4.52.20.1.17', 'NABILA RAHMASARY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7fd37f7aa62840e83859df16d33f686030cf', 1, NULL, '2026-03-06 09:21:42', '2026-03-06 09:21:42', NULL, NULL),
('9d3c0b083e3b15843919a5cfbd7510552712', '4.52.21.0.28', 'SRI WAHYUNI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bf85e90a2f6723308742eaa5ac2ec43c8574', 1, NULL, '2026-03-06 09:21:58', '2026-03-06 09:21:58', NULL, NULL),
('9d4b6a88fcfb4e162b4f3afe03aa1104c853', '4.52.21.0.02', 'ADINDA HEMAS RAHMAWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '52171e3bbd34935f96a51432177285373fc3', 1, NULL, '2026-03-06 09:21:48', '2026-03-06 09:21:48', NULL, NULL),
('9f6abf469a91eb1958916a41c32f1851dc2c', '4.52.21.2.06', 'AVERIL PRAMUDITA PRIADANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9b9f8315ae121acb8fbf82c29e2cd083b60d', 1, NULL, '2026-03-06 09:22:12', '2026-03-06 09:22:12', NULL, NULL),
('9f927b1678f043e65942ede96b03c630887b', '4.52.25.2.23', 'SAVIRA YULIA INDRIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0692ff43fbbb456d1074f979cd9be4aa57ca', 1, NULL, '2026-03-06 09:22:58', '2026-03-06 09:22:58', NULL, NULL),
('9fb0608ecadb8485298fb9c397cd7519e645', '4.52.19.1.06', 'ASYIFANI LUTHFIYYAH ANNASYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '54ae53f07da827a6218aee5f7da505811c51', 1, NULL, '2026-03-06 09:21:15', '2026-03-06 09:21:15', NULL, NULL),
('a059e45e68d895d20668b180be081a31f120', '4.52.21.2.17', 'LULUK PUTRI LESTARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '47b3cfaba974fdb7ce035c3db14ded537e83', 1, NULL, '2026-03-06 09:22:16', '2026-03-06 09:22:16', NULL, NULL),
('a0a2b4841b4a6864179c6de00c225f63e57d', '4.52.25.2.16', 'MOSES SURYA PRAKOSO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '44e72f51b3e282f82fa06bfeae032673f5c2', 1, NULL, '2026-03-06 09:22:56', '2026-03-06 09:22:56', NULL, NULL),
('a1a4c9d0d4190e71a933e869c3b9be05763c', '4.52.21.1.27', 'SOFIAH LAILA RAHMANIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6f40cb36eeca16cb7e157825fb62ef48bdb0', 1, NULL, '2026-03-06 09:22:09', '2026-03-06 09:22:09', NULL, NULL),
('a20ecd3f5bdcc37fc64af24a628b4781faee', '4.52.25.3.10', 'FIRDA AULIA PAZA UTAMI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2f654293f02533459480d24d1b55ed68eef7', 1, NULL, '2026-03-06 09:23:04', '2026-03-06 09:23:04', NULL, NULL),
('a41209242f17cb720a5c4f97d6929f771b6a', '4.52.25.2.18', 'NADILA ARIVIANA TRI ANTIKA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5d45461c02d09a058ed2cee21a192f29d3b6', 1, NULL, '2026-03-06 09:22:56', '2026-03-06 09:22:56', NULL, NULL),
('a47f757c1c43c783191f57e58925ee20e684', '4.52.20.0.24', 'RATNA SETIYAWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b6d6fe8e9cc7a36719afddc4b0bfd4d491c2', 1, NULL, '2026-03-06 09:21:34', '2026-03-06 09:21:34', NULL, NULL),
('a49fafcdfcf2836dcf151050346791db3f19', '4.52.19.0.25', 'RIEGGA RHEZA FERDIANSYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ac6b7c464ec763675b913fc88aa5d761f75e', 1, NULL, '2026-03-06 09:21:10', '2026-03-06 09:21:10', NULL, NULL),
('a4b8e63b7cdcf7e50ca41748b5b8c8d04317', '4.52.20.1.25', 'SALMA PUTRI KHANSA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0f70464b6405386f8129cc03e0bade077e08', 1, NULL, '2026-03-06 09:21:45', '2026-03-06 09:21:45', NULL, NULL),
('a54f01125f6c20fe2ebf73ea4cf3388d7cb0', '4.52.25.3.23', 'RIO HENDARTO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd4f8da010e9ea42ac1b8c23ced3200390698', 1, NULL, '2026-03-06 09:23:10', '2026-03-06 09:23:10', NULL, NULL),
('a6223abf1e0de740922b2d97155dd54b1458', '4.52.20.0.02', 'ADZIMA QALSUM', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '0e33caf06442f7b7dd510cdbd544450daebc', 1, NULL, '2026-03-06 09:21:25', '2026-03-06 09:21:25', NULL, NULL),
('a69de929464423f4dd3902d9d78d9122b24a', '4.52.25.0.16', 'MUHAMMAD DWI RIZKI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1a1ba6c14b1f644193939c4e87e289f70923', 1, NULL, '2026-03-06 09:22:33', '2026-03-06 09:22:33', NULL, NULL),
('a7681a1392183d931569c397f530d6421e96', '4.52.25.0.09', 'DIANDRA ASYLA PUTRI ZAHIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1318322e82e1e4025bdfd64e68403b2b755a', 1, NULL, '2026-03-06 09:22:30', '2026-03-06 09:22:30', NULL, NULL),
('a9000ee755ef6a121727ef93f811d663e640', '4.52.19.1.07', 'DELLA AMAYLIA ASHARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ab54713e0c6816d4ea8a4619f6a30c8731f2', 1, NULL, '2026-03-06 09:21:15', '2026-03-06 09:21:15', NULL, NULL),
('a94793722eba0d837e767e459c5bcf71f691', '4.52.19.1.28', 'TRIYAMAH SOLIHATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '92e3d000c8d34a6d28397433d511a41177c2', 1, NULL, '2026-03-06 09:21:24', '2026-03-06 09:21:24', NULL, NULL),
('a96a8bf440a39255fe83cdb41f4271e4e373', '4.52.21.1.17', 'M. FAHRUR RIZKI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4ba93274fbf1f48dc60f2516b83babe5cea1', 1, NULL, '2026-03-06 09:22:05', '2026-03-06 09:22:05', NULL, NULL),
('aad2131c222d316ad506c1575bd48c41eb37', '4.52.25.2.27', 'WAHENDRA JAYA PRAYITNO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5c7c1a4d4fc9a55045f6dde048151694493e', 1, NULL, '2026-03-06 09:23:00', '2026-03-06 09:23:00', NULL, NULL),
('ada57d6df5da9fe7559c2677f06f3adefef0', '4.52.23.8.04', 'HARDI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c689ca19ca02d1e88048c9fdd8b8de1f4cf3', 1, NULL, '2026-03-06 09:22:23', '2026-03-06 09:22:23', NULL, NULL),
('ae582392b5f0ba4c78e5d5960f338c258c8a', '4.52.25.3.27', 'SUCI AULIA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7c88a07183d45af72e1027688351b1d414eb', 1, NULL, '2026-03-06 09:23:11', '2026-03-06 09:23:11', NULL, NULL),
('ae7d0c7104569dfdc831374449d941adccd7', '4.52.25.3.26', 'SOFYA ANGEL KEYSYA DEWI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '252945835f8b3a24acdfc856c727dcff9ce7', 1, NULL, '2026-03-06 09:23:11', '2026-03-06 09:23:11', NULL, NULL),
('af01c1708a409cb69d21e0dc57fd2c15382e', '4.52.19.1.10', 'FATIMAH ZAKIYATUL FITRIYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f8f2677d2e122ed324e8d15ab98c080d5d8c', 1, NULL, '2026-03-06 09:21:16', '2026-03-06 09:21:16', NULL, NULL),
('af1d1679f3e43ed77a9c17d9d34884c8fcbe', '4.52.25.1.12', 'FRISCA DWI SEPTIANINGRUM', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '96814e34a642525d3b634836fb59b3087291', 1, NULL, '2026-03-06 09:22:43', '2026-03-06 09:22:43', NULL, NULL),
('af6beeabf4edb555e8316de9befbd1ee4e42', '4.52.20.0.10', 'ERVINA AYU PERMATASARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '94e27ce76e2fc50c618da12b84c19c7a61ea', 1, NULL, '2026-03-06 09:21:28', '2026-03-06 09:21:28', NULL, NULL),
('afb01f91442e2e711b738aa9065247c5049b', '4.52.21.2.22', 'PINKY ALVIYANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3022ba9b8d9c46bd486c0f11b36c19032a3a', 1, NULL, '2026-03-06 09:22:18', '2026-03-06 09:22:18', NULL, NULL),
('b28168767b3dbf0055288d35ae968f3bb3e0', '4.52.25.1.16', 'MERRYS MARGARETHA PUTRI REIMAL', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3bb83426b476c33ace9578ad815707eb391a', 1, NULL, '2026-03-06 09:22:44', '2026-03-06 09:22:44', NULL, NULL),
('b2c3d5dc7c963fd39728f292908955d6117b', '4.52.18.0.03', 'AMANDA DEA SAFIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2018, 2021, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '417066c5128906a1a089b723dc99d3556b69', 1, NULL, '2026-03-06 09:20:42', '2026-03-06 09:20:42', NULL, NULL),
('b30ac717e844424b6dd831cce92e66af7019', '4.52.25.0.24', 'SABRINA IBROSA SEPTIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b0624d07feecc3ce20774b01aa35dc67a3c4', 1, NULL, '2026-03-06 09:22:36', '2026-03-06 09:22:36', NULL, NULL),
('b3ab7a6e7381af4575b1d14313fc071f240d', '4.52.21.0.09', 'DIMAS MAHENDRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd0fa51050e662410a179cc30620e578c083b', 1, NULL, '2026-03-06 09:21:50', '2026-03-06 09:21:50', NULL, NULL),
('b3b58cc788d160a0f7527c0fb8b17f868e1f', '4.52.25.1.22', 'QOWI HAQQUN NAUFAL', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b28f80bddc30cc4562bc26ecbfb5067b4f67', 1, NULL, '2026-03-06 09:22:46', '2026-03-06 09:22:46', NULL, NULL),
('b3c45726adbaea4037223873a0ff00278da7', '4.52.25.0.15', 'MESYA ROSELLA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '38615812690775447c677c60acad6af00a0b', 1, NULL, '2026-03-06 09:22:32', '2026-03-06 09:22:32', NULL, NULL),
('b3cefe8b17198007d600d2f8228d7e893982', '4.52.19.1.08', 'ELSA RAHMATIKA SETYAKASIH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5c2ce00d0fab1b783e0b17fc130e1c7bcd5d', 1, NULL, '2026-03-06 09:21:16', '2026-03-06 09:21:16', NULL, NULL),
('b48e7511c8da65c963fb4e29e2c797aba866', '4.52.21.2.07', 'AYU RONNA WATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a21de899662e2c60ff464954e283ffbc2bfb', 1, NULL, '2026-03-06 09:22:13', '2026-03-06 09:22:13', NULL, NULL),
('b54fa8092ffe65936dd72527b4a2f1f5a13a', '4.52.25.1.14', 'HANI CHALIMATUS SADIYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a062428195b4355268e669dbd895246f020e', 1, NULL, '2026-03-06 09:22:43', '2026-03-06 09:22:43', NULL, NULL),
('b555a502b3601768fa857883bc6fdca5b8a8', '4.52.25.3.22', 'REVINA GADIS AYYUN CHOLISYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2f8ec48d962012d1970c3bb0cd994f59c365', 1, NULL, '2026-03-06 09:23:09', '2026-03-06 09:23:09', NULL, NULL),
('b698074ba6bb38a570975bbdd5dfed2fd31b', '4.52.19.0.28', 'SHERLY RAMADHANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'eb226ec1c061e7aa891fbf4a47121c81807d', 1, NULL, '2026-03-06 09:21:12', '2026-03-06 09:21:12', NULL, NULL),
('b76be7cb03195bccc84894f3c8a93a14c859', '4.52.21.2.19', 'MUHAMMAD NUR IRFAN WAHYUDI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7e7580f96203c76ee5a6babceb6a3cece998', 1, NULL, '2026-03-06 09:22:17', '2026-03-06 09:22:17', NULL, NULL),
('b777e5a9fb404436a2b430b1460ac8b8b79e', '4.52.25.0.19', 'NAYLA ZULFA ARIANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9404fa33f6ecddaf89962a96242e35337eec', 1, NULL, '2026-03-06 09:22:34', '2026-03-06 09:22:34', NULL, NULL),
('b9ff6cfa57801ff8055e449e528c1c1660e8', '4.52.21.0.29', 'TIARA RENA PUSPA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9136cca068ffa32610b32ae248c3a31f76d0', 1, NULL, '2026-03-06 09:21:59', '2026-03-06 09:21:59', NULL, NULL),
('bb0b4fbc4bd4945c3eb0e219dc42807eabd1', '4.52.25.3.13', 'MARCHA NABILA PUTRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'de9de0418ea3399f960f4fdbb7bf93818bbf', 1, NULL, '2026-03-06 09:23:06', '2026-03-06 09:23:06', NULL, NULL),
('bb963af36ee680e6229202721d9196bfcd9f', '4.52.25.0.20', 'NINDI VELINDIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '181769bc7b8783ebf2e83b349587cbe9bf6d', 1, NULL, '2026-03-06 09:22:34', '2026-03-06 09:22:34', NULL, NULL),
('bcdab07441fe50a10f92fd3acd55652f77c7', '4.52.20.0.03', 'AMELIA TRISNA PUSPANINGRUM', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '916bdc5ac3b3e018d6decf075787fa426ca5', 1, NULL, '2026-03-06 09:21:25', '2026-03-06 09:21:25', NULL, NULL),
('bcf52a86da1c9ccb74e5ebdd4e442b071a07', '4.52.19.1.04', 'ASSIFAH SALSABIILAA ROSSA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7c13a8df176a7968c4f13ba94af630a82e12', 1, NULL, '2026-03-06 09:21:14', '2026-03-06 09:21:14', NULL, NULL),
('bd351f3421d384865dc44c062a9e234decd0', '4.52.25.1.23', 'RARA AMELLIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e4d0fd98fd3337307adf0d1d229056153447', 1, NULL, '2026-03-06 09:22:47', '2026-03-06 09:22:47', NULL, NULL),
('bdf819933f5c4893a1ea9ef91600fd78d844', '4.52.19.1.24', 'RIZKA LAILA MAULIDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2ca7b03abaa27beee7a26ce7c3be1a285e18', 1, NULL, '2026-03-06 09:21:22', '2026-03-06 09:21:22', NULL, NULL),
('be0ada62f62cc9bbe717fa89ed729830824b', '4.52.20.0.17', 'MUHAMMAD AZHAR FADHLURROHMAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2f8281627902b9ffa27e16007a24e5039322', 1, NULL, '2026-03-06 09:21:31', '2026-03-06 09:21:31', NULL, NULL),
('be298440086943a87aa528a4b3c63f5018dd', '4.52.20.1.07', 'DIYANNISA FIRDAUSY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2c213cab23f66f10f7c1cd2acea93fbda23c', 1, NULL, '2026-03-06 09:21:39', '2026-03-06 09:21:39', NULL, NULL),
('be43306459e07f547abf4b72380ffdef4c92', '4.52.19.0.04', 'BAGOES HERU PRAYOGA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '4b48ec2a0feedb68b2c23722833a3ce604d6', 1, NULL, '2026-03-06 09:20:43', '2026-03-06 09:20:43', NULL, NULL),
('be88ce08108eb26ff4422d2e8470ee528284', '4.52.21.0.23', 'RAFLI ERSA ARDIANSYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bc4905a83de3a5ea16d4b2cdccff1e3c8a65', 1, NULL, '2026-03-06 09:21:56', '2026-03-06 09:21:56', NULL, NULL),
('bf0ffa2727b10b33465794695b58cb24d449', '4.52.25.2.19', 'NAURA HUWAIDA ROHADATUL \'AISY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'af0e727504443dc870f4e50bdea52c8f0e32', 1, NULL, '2026-03-06 09:22:57', '2026-03-06 09:22:57', NULL, NULL),
('c1b6f87f56cebc3e02c9f2f97d8d761f9cce', '4.52.20.1.01', 'AFRIDA AULIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '824f21fe75ffa0f4c967c7d549314ce83d76', 1, NULL, '2026-03-06 09:21:37', '2026-03-06 09:21:37', NULL, NULL),
('c241fcb98f638b7aa8fa9e727fc9ab4ab0e1', '4.52.23.8.10', 'STEVANUS MARTIN EKA DIMARA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '150044901ad14aa25cf89f1b3362a1feecb0', 1, NULL, '2026-03-06 09:22:25', '2026-03-06 09:22:25', NULL, NULL),
('c2c0a663a33b9853e153d2d81c145e536087', '4.52.21.0.03', 'ALFINA RAHMAWATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '93cbd56fc6679ec6f8424cf783ee10b9e78e', 1, NULL, '2026-03-06 09:21:48', '2026-03-06 09:21:48', NULL, NULL),
('c3f80d1cb4f1c56cf5c7c9dcf13a102039e6', '4.52.25.1.19', 'MUHAMMAD RIZWAR ANAS FIRDAUS', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '41fcc807c90b306f59e32488483988be164f', 1, NULL, '2026-03-06 09:22:45', '2026-03-06 09:22:45', NULL, NULL),
('c55fea30ba33589f101f257aedc55e7ce9f5', '4.52.19.1.12', 'GUSTI TAHTA LADUNI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '05afd2241960906ab9120bf882570d261ebe', 1, NULL, '2026-03-06 09:21:17', '2026-03-06 09:21:17', NULL, NULL),
('c5b525d68e4a88b74a38c478433fa30df989', '4.52.20.0.01', 'ADESGY TIARA LARASATY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9206ab80a539d6da74cb899f08f98ea55e95', 1, NULL, '2026-03-06 09:21:25', '2026-03-06 09:21:25', NULL, NULL),
('c665af96d9a303fd3fec7f8f594b7d820b09', '4.52.19.0.06', 'DIAH LARASATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6fa8c9ecd1aef104350e834b86dcf6ae30cf', 1, NULL, '2026-03-09 08:56:23', '2026-03-09 08:56:23', NULL, NULL),
('c66edb9c6142a2d81ae81c2f1104dc0eb0c8', '4.52.21.2.02', 'ALFINA NUGRAHENI RAMADHANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1ebc7ff13931ee6b4566aa873d1189bc9622', 1, NULL, '2026-03-06 09:22:11', '2026-03-06 09:22:11', NULL, NULL),
('c6ec49ba98dec8d5b26fa29b6ab19eaa7907', '4.52.23.8.03', 'DITA RATNA SARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8a77d09809d2a780957b2d86baed1d8400d6', 1, NULL, '2026-03-06 09:22:22', '2026-03-06 09:22:22', NULL, NULL),
('c75c7ddb230b993c34aac95c0ad02e1466eb', '4.52.21.1.19', 'NAUFAL ABDILLAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1ec58d44272331dff74866de37069b896699', 1, NULL, '2026-03-06 09:22:06', '2026-03-06 09:22:06', NULL, NULL),
('c76d9b8c29af32e62a35234cae7dae82ef43', '4.52.21.1.13', 'FITRIA RAHMA SAHID', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '658d457f80e2fa5233068b5cc9becb8c6185', 1, NULL, '2026-03-06 09:22:03', '2026-03-06 09:22:03', NULL, NULL),
('c79387f1a69a430e4174b418494427a947ce', '4.52.25.0.12', 'FAZA MAOLANA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6c971938b66e2a0dfd07990f1b097f8cff9f', 1, NULL, '2026-03-06 09:22:31', '2026-03-06 09:22:31', NULL, NULL),
('c7bcad31daf9eeb7eeb9892d0bc850ac4a6d', '4.52.25.3.29', 'ZAID ABU JABIR', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'bbe947558cac07f4d2a29fd533c833039c15', 1, NULL, '2026-03-06 09:23:12', '2026-03-06 09:23:12', NULL, NULL),
('cb3a4fe1e3b545bccc6b5e47b204dbd0382e', '4.52.21.1.28', 'TALITHA SAHDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dd6a154b47906094416971cea84efe54fbda', 1, NULL, '2026-03-06 09:22:09', '2026-03-06 09:22:09', NULL, NULL),
('d00176dd99edca3bcd3a53edb2cbc30f29bd', '4.52.20.1.05', 'ARVIKA OKTARINA JAYANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fe6fd8693793d01bfd930497c6dd826bb3ce', 1, NULL, '2026-03-06 09:21:38', '2026-03-06 09:21:38', NULL, NULL),
('d0b5c93854226beefccd540e83b6aa6c688e', '4.52.21.2.03', 'ALIT NADA SYAHRANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c9644e80f9d8ec0be46327c9614d3bd821bc', 1, NULL, '2026-03-06 09:22:11', '2026-03-06 09:22:11', NULL, NULL),
('d0ff2579f0de6bb6a4a7088a43198ee3828f', '4.52.25.0.27', 'TAN,INTAN PUSPITA SARI GUNAWAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1531d2791a0332ccff496085d936ad817543', 1, NULL, '2026-03-06 09:22:37', '2026-03-06 09:22:37', NULL, NULL),
('d24937762ea5a99d4d3746fcbfc7898e3854', '4.52.23.8.02', 'AI LUDIANA MANSNANDIFU', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '16aa511818882e5fd432e374328996953222', 1, NULL, '2026-03-06 09:22:22', '2026-03-06 09:22:22', NULL, NULL),
('d3228f21a2e7a1da8616b76821985b1fe421', '4.52.20.0.27', 'SAPNA PUTRI HANDAYANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '515e0f56cb200a046b58e8038ce9e1420d3d', 1, NULL, '2026-03-06 09:21:35', '2026-03-06 09:21:35', NULL, NULL),
('d335fc823295e934f4cb6adcfda8d5177661', '4.52.25.2.22', 'RAYHAN AHMAD PUTRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '86eeeaeb5e200f74679fb2613e09d566447c', 1, NULL, '2026-03-06 09:22:58', '2026-03-06 09:22:58', NULL, NULL),
('d373f81dcb645f00700101ce2b240dac3534', '4.52.20.0.19', 'MUHAMMAD YUNUS', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5d7564d11de4a12e97009b08f05c99b3ec98', 1, NULL, '2026-03-06 09:21:32', '2026-03-06 09:21:32', NULL, NULL),
('d3f950f842c26908a4bb40e8645af6ee25af', '4.52.21.2.27', 'SALSABILA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'b85d773c22ccc61b621d081b1a1760343b50', 1, NULL, '2026-03-06 09:22:20', '2026-03-06 09:22:20', NULL, NULL),
('d5acac9a03a53be68bdc9ea7ed78ed330b33', '4.52.21.0.07', 'CLARISSA HAPPY NUR VADITA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ccacf0d086c3dbbc92faaf99b3a7da4de497', 1, NULL, '2026-03-06 09:21:50', '2026-03-06 09:21:50', NULL, NULL),
('d63ac8b1e9ad28b812e1dac0a6c6619073c8', '4.52.25.0.21', 'NUR FITA RIZKY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2cf3fc2ef7dd9cd950f0e4d06b25215dda0d', 1, NULL, '2026-03-06 09:22:35', '2026-03-06 09:22:35', NULL, NULL),
('d71a08aafc37ecef9e9eb6c2d54b4a866c25', '4.52.19.1.02', 'ANUGRAHA HADI SAPUTRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1018a182ec0a629d1232e55e353a605e49b3', 1, NULL, '2026-03-06 09:21:13', '2026-03-06 09:21:13', NULL, NULL),
('d845e8c9d3fd9b64d8807de626a148c9861c', '4.52.25.3.21', 'RAIHAN ADITYA HENDRIANSYAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6203ba3cb441d65090d6ee32c2f106e7faf3', 1, NULL, '2026-03-06 09:23:09', '2026-03-06 09:23:09', NULL, NULL),
('d8703eaaa67b31bc8435ee3c94901c079855', '4.52.19.1.14', 'JOIS AKSA GANEO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ec2e675cba2ae62bbdc06d270dcd74dba5dc', 1, NULL, '2026-03-06 09:21:18', '2026-03-06 09:21:18', NULL, NULL),
('d930e795d956be6408427d191e8879ceaaf2', '4.52.25.0.03', 'AGHNIYA SAPHIIRA RAMADHAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '255bb8bac1b09dd1f09fb525cb1e1a0d9b75', 1, NULL, '2026-03-06 09:22:27', '2026-03-06 09:22:27', NULL, NULL),
('d9a091a70359593b2d1b73fcc146814cd77f', '4.52.21.0.16', 'KHAMIM NUR', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ba2549c8cb36b1faef33c9eee70a7b3cd62b', 1, NULL, '2026-03-06 09:21:53', '2026-03-06 09:21:53', NULL, NULL),
('d9e9197869c5a1fe48a7e6d65f04c0a2a50c', '4.52.21.2.26', 'SAKINATUL KHOLIDA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cbf66bf923f6800066a97d2a19c84ee3ae54', 1, NULL, '2026-03-06 09:22:20', '2026-03-06 09:22:20', NULL, NULL),
('daef2475c44e140b3acb5dc4f26d5fdba0f3', '4.52.21.1.26', 'SATYANIN DIAZ', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '56466d2e6966f48913d7ff7a1470361abd2e', 1, NULL, '2026-03-06 09:22:09', '2026-03-06 09:22:09', NULL, NULL),
('db023aae14f05d1489e3370c1eeb2f352dbc', '4.52.21.1.03', 'ANISA YUMNA ARIANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '780c1e30660ef4ca71ad1bdf000835369bec', 1, NULL, '2026-03-06 09:22:00', '2026-03-06 09:22:00', NULL, NULL),
('db6724ae5ab6b6f2a25c62fd8fdab7f08ecd', '4.52.25.2.03', 'ANTHONY ROBBINS SAPUTRO HANDOYO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8152429973714b710485e32bb7a7ba9d5b7b', 1, NULL, '2026-03-06 09:22:50', '2026-03-06 09:22:50', NULL, NULL),
('db85164943c074c337a685d59f96c6833f6e', '4.52.21.2.05', 'ARVIA NUR AROFAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f067f60be0ade0d1a0e308931a2b51d5b588', 1, NULL, '2026-03-06 09:22:12', '2026-03-06 09:22:12', NULL, NULL),
('dbbad91c8b8ac1057a86ebc26589685710a6', '4.52.25.1.21', 'PARAMITHA NADIA HUMAIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '9a8baacfe3ea803172be44e7872618a23b4d', 1, NULL, '2026-03-06 09:22:46', '2026-03-06 09:22:46', NULL, NULL),
('dc617eecffc155b7fc8b4feeb83bc30f5896', '4.52.23.8.05', 'JIHAN AURLYA CANDY', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c064043365eadcd9a3c1785c45c4abe04508', 1, NULL, '2026-03-06 09:22:23', '2026-03-06 09:22:23', NULL, NULL),
('dcfcf2710e85953783c771b28419747d0456', '4.52.25.3.14', 'MUHAMMAD APRILIYANTO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6ed366359b9c53d0c783872fce96853fda5b', 1, NULL, '2026-03-06 09:23:06', '2026-03-06 09:23:06', NULL, NULL),
('dd3221154f4d7e9130706299656725acb528', '4.52.21.0.12', 'EMI ANGGORO WATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5478f1a2093e8fd8b5e1095219b9e50f5aaa', 1, NULL, '2026-03-06 09:21:52', '2026-03-06 09:21:52', NULL, NULL),
('dd56645c16b5c269e41da69335bad90119f6', '4.52.21.2.01', 'ADELIA DEWANTI AZZAHRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6fe0cf1b79bbdd288341d25970d26839bb3d', 1, NULL, '2026-03-06 09:22:10', '2026-03-06 09:22:10', NULL, NULL),
('df45f53b18f276dc31a5be519956b940edde', '4.52.21.2.08', 'BRIGITTA PUNGKI YULIASHARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '98ccb48777e88b54e09ae2c5c70ce5def585', 1, NULL, '2026-03-06 09:22:13', '2026-03-06 09:22:13', NULL, NULL),
('df54ddf44a07d617e437f92ffbcd9f92b3db', '4.52.21.2.25', 'RESTI FARSHANANDA RISWANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a5637a6e1ae8fb4abe2bfcdd1d8394787d2c', 1, NULL, '2026-03-06 09:22:19', '2026-03-06 09:22:19', NULL, NULL),
('e11bcc209dc166225a4c381bbbe604d10a70', '4.52.21.1.24', 'RISKA MUSTOFASARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '666cedbb63d25db24959f6452b309a8b964d', 1, NULL, '2026-03-06 09:22:08', '2026-03-06 09:22:08', NULL, NULL),
('e13f449090567dbf462f6536a4e966701946', '4.52.20.1.30', 'ZAHRASEA FARAH ILYASA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'd3af966fd57bcfe2462b18eca3c67eeec852', 1, NULL, '2026-03-06 09:21:47', '2026-03-06 09:21:47', NULL, NULL),
('e32cabadd2786607fc259afaefda8e4e832e', '4.52.25.0.04', 'AMELIA NAJWA AZZAHRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dbe585c23f340f80d0091c9728b268ba8fe4', 1, NULL, '2026-03-06 09:22:28', '2026-03-06 09:22:28', NULL, NULL),
('e41ecf601f4f1c2f94c4bdf1cc7fcf29b7e8', '4.52.21.0.08', 'DAFA AZZAHRA MUSTIKA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '758c7c376c4a5a6fcba079bbc664db556299', 1, NULL, '2026-03-06 09:21:50', '2026-03-06 09:21:50', NULL, NULL),
('e42a3f60843b920741679109c147d2b390a8', '4.52.21.1.14', 'HERSA SINTIA PRAMUDYA WARDANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'e08b504a486aad0c1d617eaa632f5aae43b0', 1, NULL, '2026-03-06 09:22:04', '2026-03-06 09:22:04', NULL, NULL),
('e6a2c13227c3e08aa1c713ea7ae87b97bf23', '4.52.25.0.17', 'MUHAMMAD FARREL ROZAN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '49973861704b6d37df8066f5e30fc96787df', 1, NULL, '2026-03-06 09:22:33', '2026-03-06 09:22:33', NULL, NULL),
('e8e1e31593ed496acaddaee8f5e1c377e526', '4.52.25.1.17', 'MUHAMMAD RAFA MAFTUHIN', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'f78982d4843744289c0f76b4c3435df7bdd5', 1, NULL, '2026-03-06 09:22:45', '2026-03-06 09:22:45', NULL, NULL),
('e8f8919512d277f1c25cca275f241c2437bf', '4.52.21.2.23', 'PUTRI KINASIH GUSTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2998550c915503511cfc35a31685073094fa', 1, NULL, '2026-03-06 09:22:19', '2026-03-06 09:22:19', NULL, NULL),
('e9e86bacc29f3acfb495c31e9e34612aff39', '4.52.21.0.13', 'FARIDA NAJWA WAHYUONO', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'c046b9716be739b69578604dfbc1022b423a', 1, NULL, '2026-03-06 09:21:52', '2026-03-06 09:21:52', NULL, NULL),
('ecc44af0774ee0842e3af2a41c4d34918e09', '4.52.25.3.24', 'ROSEWINAR FILADELFIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a898b302d44ca98cfaf908d9a3ca91a2ca00', 1, NULL, '2026-03-06 09:23:10', '2026-03-06 09:23:10', NULL, NULL),
('ece6a043c9e42ace73af0c98dadf1979e520', '4.52.21.2.11', 'ELSANTI NUR SAFITRI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1a7c542475c6253c432206feac32e76568bd', 1, NULL, '2026-03-06 09:22:15', '2026-03-06 09:22:15', NULL, NULL),
('edcd05e460692c4dcf1bb79f58db99c74009', '4.52.25.2.26', 'VANI ANDREANA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a45343a950f9eed7b9742e2c1fbc257c3831', 1, NULL, '2026-03-06 09:23:00', '2026-03-06 09:23:00', NULL, NULL);
INSERT INTO `students` (`id`, `nim`, `nama`, `jurusan`, `prodi`, `status`, `tahun_masuk`, `tahun_lulus`, `email`, `login_email`, `pending_login_email`, `is_email_login_enabled`, `email_verified_at`, `email_verification_token_hash`, `email_verification_expires_at`, `email_verification_sent_at`, `email_verification_otp_hash`, `no_hp`, `alamat`, `user_id`, `has_credentials`, `last_login`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
('eef11f97cce265c27fd804faa717aac908c8', '4.52.23.8.06', 'LENNY LEONITA MARINI UBRUANGGE', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2023, 2027, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'a74ce5285e77e78b680908bdb8842758dadf', 1, NULL, '2026-03-06 09:22:24', '2026-03-06 09:22:24', NULL, NULL),
('efc46d4362f270ae747f16b7012dcd17ac40', '4.52.25.0.06', 'AWALIA ARDIYANTI HANIFA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ab8967e1ebe20bf40acd68f53e992ad1a222', 1, NULL, '2026-03-06 09:22:29', '2026-03-06 09:22:29', NULL, NULL),
('f12900ef930e0b3086903d7599d3c8311a5c', '4.52.21.1.05', 'AULIA SALSA ZAZILLA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7e1735aa44b00040e0267052a4d9eef6e887', 1, NULL, '2026-03-06 09:22:01', '2026-03-06 09:22:01', NULL, NULL),
('f35a0062b116dc7a1a5e997fdb946d78de13', '4.52.25.0.08', 'CLAUDI DWI VEBRIANTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '5ae017cea559c37068cce259670a8c88c172', 1, NULL, '2026-03-06 09:22:29', '2026-03-06 09:22:29', NULL, NULL),
('f3c372bb0712b8e9092081c73d06be25a5b4', '4.52.25.3.20', 'NIA DWI RAMADHANI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'cc4bb43988ae098acfacdc60986b6a3d8119', 1, NULL, '2026-03-06 09:23:09', '2026-03-06 09:23:09', NULL, NULL),
('f3c9b163811d33083ea34914d6cfa2656a0c', '4.52.20.1.06', 'BALQIS GHAISSANY SHADRINA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '6cc97fbb753c71d7aee38b3672ae91299af4', 1, NULL, '2026-03-06 09:21:39', '2026-03-06 09:21:39', NULL, NULL),
('f3f62c7b2932350d6e4b05d025b916bbf51e', '4.52.21.2.10', 'DIKA NUR PRASETYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3b39c38054d0648505dcdfcfea2c33aaa10b', 1, NULL, '2026-03-06 09:22:14', '2026-03-06 09:22:14', NULL, NULL),
('f4d7a232527e296d0e5e225c55ac4c40b483', '4.52.19.1.03', 'ARDIANITA NUR INDAH SARI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'efd646fcd9fcab281130e2ea17a62955463c', 1, NULL, '2026-03-06 09:21:14', '2026-03-06 09:21:14', NULL, NULL),
('f525d64218c3c64819a69b3b4b7ce0afd3f4', '4.52.25.3.19', 'NAYLA ARKA DEWI INDIRA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '51fa1a9d336f9217e104b65b33805aae9acf', 1, NULL, '2026-03-06 09:23:08', '2026-03-06 09:23:08', NULL, NULL),
('f7092f6cf55aaafde527df01ae4b7053c2d2', '4.52.21.2.04', 'ANINDYA  RISTA AMESTI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '51548c87156e42f477713beb97217c0fd06d', 1, NULL, '2026-03-06 09:22:12', '2026-03-06 09:22:12', NULL, NULL),
('f7293b32910658136719f49621bd70b6a140', '4.52.20.1.03', 'ANNISA NUR AULIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '8498da2e884225ebb9f8fc4f3f82b24dd559', 1, NULL, '2026-03-06 09:21:38', '2026-03-06 09:21:38', NULL, NULL),
('f962edeb4542930e99e62e87c18ccff21918', '4.52.19.0.26', 'RUMIYATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '52f0c6cb70dc3fc1a616deb36150c4362303', 1, NULL, '2026-03-06 09:21:11', '2026-03-06 09:21:11', NULL, NULL),
('f98945aa6cef1d452fb5e4939012a93ec827', '4.52.20.0.13', 'LUBNAA TSAABITAH', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2020, 2024, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '65737fc4b49414843858a15a4c2e7182411d', 1, NULL, '2026-03-06 09:21:29', '2026-03-06 09:21:29', NULL, NULL),
('f9f23fca2986ccf409852091d16dd6a342ce', '4.52.21.2.09', 'DESTIA RAHMA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ce29e80934d469dced8fe265884c6af4b82f', 1, NULL, '2026-03-06 09:22:14', '2026-03-06 09:22:14', NULL, NULL),
('fa6ff12b87b3fc39c196b4eebfa727c81291', '4.52.25.1.02', 'AMIRAH SALSABIL', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2a5268a6c763b119e760f58cc08f745c75e6', 1, NULL, '2026-03-06 09:22:39', '2026-03-06 09:22:39', NULL, NULL),
('fafd88d6b75173d9275f422cb98a864ea171', '4.52.25.1.15', 'KEYSHA JASMINE KURNIA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2025, 2029, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '3ff0cc82498a5248df297f22b13761ddf75a', 1, NULL, '2026-03-06 09:22:44', '2026-03-06 09:22:44', NULL, NULL),
('fc6014910c20c3985f23e46c71aeddd543d9', '4.52.19.1.11', 'FELICIA REVIE KUSUMADEWI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '18ae0443648dfe3ccd07c8f9447dcdde2269', 1, NULL, '2026-03-06 09:21:17', '2026-03-06 09:21:17', NULL, NULL),
('fc8db89b442044129c9a603b81b09df794ab', '4.52.21.0.21', 'NURUL AULIA ISNAINI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '486d86e3decf18b9c96a9de7933f46613804', 1, NULL, '2026-03-06 09:21:55', '2026-03-06 09:21:55', NULL, NULL),
('fcc5b15e6c6e926c9dcaf29cf11a25832b4f', '4.52.19.1.26', 'SOPHIA JULIANTI NISA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2019, 2022, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'fbb86b387e60df2be1568f156be5dfc548cc', 1, NULL, '2026-03-06 09:21:23', '2026-03-06 09:21:23', NULL, NULL),
('fecc538004d43789cf209c40dc3a043f3439', '4.52.21.1.15', 'INDAH LARASATI', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '7506b8986ca8816804d78b181b0c67e40380', 1, NULL, '2026-03-06 09:22:04', '2026-03-06 09:22:04', NULL, NULL),
('fedfb4620feda86f68134e5f51294ccb31a4', '4.52.21.0.05', 'ANNISAAUL FITHRIYA', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, 2025, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2e131b7def6a3136036591ae6fb12ade680c', 1, NULL, '2026-03-06 09:21:49', '2026-03-06 09:21:49', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_notifications`
--

CREATE TABLE `student_notifications` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Creation timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification storage for students';

-- --------------------------------------------------------

--
-- Struktur dari tabel `tracer_study`
--

CREATE TABLE `tracer_study` (
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
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Submission date',
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp() COMMENT 'Last update'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alumni career tracking (tracer study)';

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL COMMENT 'UUID v4',
  `username` varchar(50) NOT NULL COMMENT 'Login username (admin or NIM)',
  `password_hash` varchar(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `nama` varchar(100) NOT NULL COMMENT 'Full name',
  `role` enum('admin','student') NOT NULL DEFAULT 'student' COMMENT 'User role',
  `created_at` timestamp NULL DEFAULT current_timestamp() COMMENT 'Account creation date',
  `last_login` timestamp NULL DEFAULT NULL COMMENT 'Last login timestamp',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Account status'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Unified authentication table for admins and students';

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `created_at`, `last_login`, `is_active`) VALUES
('02095ab141206539bf833264a8dd489e81ab', '4.52.25.2.20', '$2y$12$btXvq8L38zDEk8e0E.U3uO/QiQ4FVnk/3WkbsGNTAzmHH7b5inC/i', 'NOVELIA AGNIMAYA WIBOWO', 'student', '2026-03-06 09:22:57', NULL, 1),
('03c51d9daa3b637a8481b8d1d2f5a2f86472', '4.52.21.0.24', '$2y$12$dVrHIMbZscBo/MKeaicMnujLqcO0ZVOZsyAuWGlQ6u9etALagw8Tq', 'RIFDA ARDELIA', 'student', '2026-03-06 09:21:56', NULL, 1),
('0462115fd74d06a90e8057e2ff95925b69fa', '4.52.19.0.02', '$2y$12$gTOkx6DeSO.oCvrSn91f8eGXIBOdEOERVw.RwOCX7AY3qIqYptyrO', 'ANNE OKTANAFIA', 'student', '2026-03-06 09:20:43', NULL, 1),
('04676120b83d9a13bf1a092acb83cd57c1b5', '4.52.19.0.27', '$2y$12$q3U54.NYwqVfJgcY87xdf.nQG3hyAH3cwtYPlF9akkdMl4ooZfW5O', 'SALSABILLA ALTEZA PRAMESWARI', 'student', '2026-03-06 09:21:11', NULL, 1),
('04f957fb52a161783b4478ec1975f5b52e71', '4.52.20.1.27', '$2y$12$ewLW8Mgnn8Ox0fSAGG9XP.lZKsltLKhgQaPkpCtWcE0/TTzxtErmy', 'SRI WAHYUNI', 'student', '2026-03-06 09:21:46', NULL, 1),
('05afd2241960906ab9120bf882570d261ebe', '4.52.19.1.12', '$2y$12$SYI7tMevu2pou7ibmyFuIusTFpmoXuwfHI2fJqSaXkb1fYAvyt4sa', 'GUSTI TAHTA LADUNI', 'student', '2026-03-06 09:21:17', NULL, 1),
('0692ff43fbbb456d1074f979cd9be4aa57ca', '4.52.25.2.23', '$2y$12$bg7sdjeS6wAC.2ZVjL8hVe0AHbDvtjd.Ct4qrYLaN5Svkgza29/G2', 'SAVIRA YULIA INDRIANI', 'student', '2026-03-06 09:22:58', NULL, 1),
('06d3aedc95ccb935ae826aecf6edd3301454', '4.52.21.0.15', '$2y$12$p4fTC9UuQlTJ4RCchR1Oc.G5Q.X52O49Gnzx81jsKFrQ.R4.TMyIu', 'GABRIEL MARINDA ALVERA', 'student', '2026-03-06 09:21:53', NULL, 1),
('09929a41cac922e7126b8bb501b95a05ebc3', '4.52.25.2.14', '$2y$12$roiJ1Ss3CW65lZmpNPL/y.MIlU9fASAUUD5KIPT/yGCCzpRB6oLqS', 'MAQFIRRAH LAILY RAMADHANIA FAISAL', 'student', '2026-03-06 09:22:55', NULL, 1),
('0b5b79479923ee355408c935f15cad1432ee', '4.52.25.1.03', '$2y$12$Q6aH/Vs95So0rptxPpMkMuvY8Ba5LFk9fhWMOpQTyVkj2Sd5zwyfO', 'ANDINI EKA APRILIA', 'student', '2026-03-06 09:22:39', NULL, 1),
('0caebb5899ca9e6a1ca8481bb57c92d5f004', '4.52.21.2.13', '$2y$12$OLlz05VHihH16765kqzuxep.QNvI3Bu4YssYelEkXZ9HOu/Ukmi7e', 'FAJAR MU\'MININ', 'student', '2026-03-06 09:22:15', NULL, 1),
('0d7d7303b406fa1f93b37443122c2720b0fb', '4.52.25.1.27', '$2y$12$s0V1viZxwzWQvPiHEy1lke6fnzyQbQZOkb3r.wVFUrfVNYpnPSmli', 'TALITHA NAFISA RAHMA', 'student', '2026-03-06 09:22:48', NULL, 1),
('0e33caf06442f7b7dd510cdbd544450daebc', '4.52.20.0.02', '$2y$12$46ijU5A8WVUtQUtC4/fp6.wKBsotEuEV7scCbCyqU7GKBLVniXHy2', 'ADZIMA QALSUM', 'student', '2026-03-06 09:21:25', NULL, 1),
('0ede972c9fc05216c2366b5adba53078d496', '4.52.23.8.11', '$2y$12$g7isYR4DT63HtEv1hPTgE.jQO.hdMlQLL0KIM/XXDI5DuIKeSJ3Qu', 'TSURAYA DIANETA DEVI ASAWIMANDA', 'student', '2026-03-06 09:22:26', NULL, 1),
('0f5359fa69b8615a7e7a001fee1020fb1216', '4.52.20.0.06', '$2y$12$0WTJNS6pda82uPrjK2hbdewdO3tMwVJbJvMHE33GC7Hj3LqcPPP5W', 'ATHAYA AURELLIA RIFANI', 'student', '2026-03-06 09:21:27', NULL, 1),
('0f70464b6405386f8129cc03e0bade077e08', '4.52.20.1.25', '$2y$12$2X0x2ujlb7XqFWGxTTu.LuDyc/fV2p7pVvJci6kU7kEqtmvBmwZ56', 'SALMA PUTRI KHANSA', 'student', '2026-03-06 09:21:45', NULL, 1),
('1018a182ec0a629d1232e55e353a605e49b3', '4.52.19.1.02', '$2y$12$GIooJ7BlF/OT0WbcwOS.iOk0Aa5H4RvpYyFaGUBXvFIHvef8s0FKS', 'ANUGRAHA HADI SAPUTRA', 'student', '2026-03-06 09:21:13', NULL, 1),
('10c3f0b5a3c6821bb291920820908776f44d', '4.52.25.0.18', '$2y$12$uwem9GroXR0o/kGw3rwet.7Tp2Lcl7JimoZFOW8zLfvEBFGbjV38y', 'NAJWAN ZAAKIY RAFATA HERMAWAN', 'student', '2026-03-06 09:22:34', NULL, 1),
('11de9df701303bacfd860f2ed20e6b8a1451', '4.52.21.0.01', '$2y$12$ikSBHFOyd.oXFknvjZaup.DzQS3XJhpWnR12zX8v/IySYFk/lsODy', 'ABELIA RAHMA PRATIWI', 'student', '2026-03-06 09:21:47', NULL, 1),
('1318322e82e1e4025bdfd64e68403b2b755a', '4.52.25.0.09', '$2y$12$sDOBsX2wSU8UnJepZdeLyebzL280S8CycroC3R3Rxb5WRsGOwCsP6', 'DIANDRA ASYLA PUTRI ZAHIRA', 'student', '2026-03-06 09:22:30', NULL, 1),
('136648c3fd51e543c79f502b18f3bbf32422', '4.52.25.3.02', '$2y$12$WKk1hiLHGIopwmJa9R27Oer7Zy..pKwYJjnXk649NLtNg97FjBOTG', 'ALYSHA JASMINE YULIANTO', 'student', '2026-03-06 09:23:01', NULL, 1),
('138747943559b7453c1e1f4c6f7b4a07b462', '4.52.19.1.13', '$2y$12$A8Obd6RRf4TY5u.MfJ4AFe8VaG.rg4Nx12AZPrDpx7jIBAoLSoajG', 'INAS SALMA', 'student', '2026-03-06 09:21:17', NULL, 1),
('147cd149f54e18e91369ffddca30ff2aafa4', '4.52.21.1.09', '$2y$12$yqwH6JgN75aTgHLD6ZeXh.eL4lc6nutstEslB.6vD4fRM1QfSDpHS', 'DIYAH AYU WAHYUNI', 'student', '2026-03-06 09:22:02', NULL, 1),
('150044901ad14aa25cf89f1b3362a1feecb0', '4.52.23.8.10', '$2y$12$OHxiqdNCRyTboDLzJChEqOAS.Qg0qGW1tdV3uTqiM2iwhMHQntOu.', 'STEVANUS MARTIN EKA DIMARA', 'student', '2026-03-06 09:22:25', NULL, 1),
('1531d2791a0332ccff496085d936ad817543', '4.52.25.0.27', '$2y$12$79OKzed1xvLb5dEV306UFOSk5dmtXivJzRPrC6Tg9hKGr0nAVnnDW', 'TAN,INTAN PUSPITA SARI GUNAWAN', 'student', '2026-03-06 09:22:37', NULL, 1),
('15807ce9b8d8f3f989f08e470fc5a6c42151', '4.52.25.1.13', '$2y$12$5Iw0wPOVR/LeXQeJSyzEvOiJUpwtb/gu4gfeVTRrRYh.qfwAHnvgK', 'HAFSHAH AULIA AZ ZAHRA', 'student', '2026-03-06 09:22:43', NULL, 1),
('15d7004be485ba4a5abcb2d07317875a1214', '4.52.19.1.17', '$2y$12$HIPpdCk7PtxyeVGZ1Y.7L.xqWdYcLUbFNeoxnPQT5ta9/FWooIO/W', 'MARETA MARGAYANI', 'student', '2026-03-06 09:21:19', NULL, 1),
('16aa511818882e5fd432e374328996953222', '4.52.23.8.02', '$2y$12$re5c620KLgFc2XSCD9MFf.slAYvQ4AlLq3j64inZdz32sJJpf.ucq', 'AI LUDIANA MANSNANDIFU', 'student', '2026-03-06 09:22:22', NULL, 1),
('16ac3e5f0e677e606498efe1671aa8c71b13', '4.52.25.3.08', '$2y$12$d6.7msTHzUHACbLxQEzXoOLi6YAGCGCx5pGmDwmnv2WPA4Mmzg4jq', 'EUGENIUS JESSEYRO FAREL ARDANA PUTRA', 'student', '2026-03-06 09:23:04', NULL, 1),
('17ecd7939734a41332ad47a7c133c2de54a3', '4.52.25.2.24', '$2y$12$.SJTPUhOU9nh9eMAvT9ccuWav5tAXIYidPwVRHseF4NuMFQNcBiae', 'SEFANYA MISA EGRINA S KEMBAREN', 'student', '2026-03-06 09:22:59', NULL, 1),
('181769bc7b8783ebf2e83b349587cbe9bf6d', '4.52.25.0.20', '$2y$12$Ltpvl9zPeJSf5eodn1/J9egHsVR9E1uYc9ymwGE29Z/Y8Svy0tgRa', 'NINDI VELINDIA', 'student', '2026-03-06 09:22:34', NULL, 1),
('18ae0443648dfe3ccd07c8f9447dcdde2269', '4.52.19.1.11', '$2y$12$v2.pJRlx4m88lu8NKT/MCO4J89mjYzaFXnqgOeX0oxXa6hVd5T/ey', 'FELICIA REVIE KUSUMADEWI', 'student', '2026-03-06 09:21:17', NULL, 1),
('18e653b94fc8fcaebaf7400899746fbfbfc0', '4.52.20.1.20', '$2y$12$UrvDfUqxaIHV7EuBG74iHuzYAzy/nlW/rBvUQMTNrqGJh0zazmRjO', 'RAHMA MAULINA', 'student', '2026-03-06 09:21:44', NULL, 1),
('1a1ba6c14b1f644193939c4e87e289f70923', '4.52.25.0.16', '$2y$12$lm7XlLoZl6QLHk6GgDIdXeuKRbwDlTku6PB5YShWkPhOg657WHzUK', 'MUHAMMAD DWI RIZKI', 'student', '2026-03-06 09:22:33', NULL, 1),
('1a7c542475c6253c432206feac32e76568bd', '4.52.21.2.11', '$2y$12$NIr7S2KReQYlEgJPzadceOMgRCFnHGeduaj5HkvWjWzoqZENexBeG', 'ELSANTI NUR SAFITRI', 'student', '2026-03-06 09:22:15', NULL, 1),
('1b201f730ca30aa24d5da0cf85a7706b4c8d', '4.52.21.1.12', '$2y$12$CT.sqmZtwEuISguGIUkFV.HqMlf4yY4RFUtC2t26JX5iDqFqxPnd6', 'FADILA BERLIANA', 'student', '2026-03-06 09:22:03', NULL, 1),
('1b2297e6bfe82ba51a2b7ee609a9d3b5bd47', '4.52.19.0.20', '$2y$12$qRXiAvSiVu.NjvVPTFbHcOhZxGM4DrI5JubH9Aycp2tODa4RPuBC2', 'NADYA AURIGA RAMADHANI', 'student', '2026-03-06 09:21:09', NULL, 1),
('1b87139fdcb96913b2fc2d31fc2021ca4877', '4.52.21.0.27', '$2y$12$bR9zOFNcOBO7UtQzzGnfUuW3h7y4/RpgkROMbEOYddj6iNGF6W77y', 'SETIAWAN WIBOWO', 'student', '2026-03-06 09:21:58', NULL, 1),
('1c975a2bd289b7bc2488a6436f970c50f2ae', '4.52.19.0.13', '$2y$12$3pB9vAmbhLayxHMYPtI8Cu.IRN4sOWjCtTl/.S/sHfcLpKMmVXLRu', 'HANINA AMILA HUSNA', 'student', '2026-03-06 09:21:06', NULL, 1),
('1dec14d527324c94f2deb1d2b87e8ec764f3', '4.52.21.1.06', '$2y$12$esqrcosBCQa0DrtlBKwTL.Cl0aWZckdL3tw/FjR6zIxyOh5RSz0r.', 'BETY PUJI RAHAYU', 'student', '2026-03-06 09:22:01', NULL, 1),
('1e06023b1c5c2405d30d46282f31b71b350a', '4.52.19.0.17', '$2y$12$xkE9/rNHeej6sHBY.Jz1uuDDYbFL3cnUL2vDwj4hijhGsd6GpZRJG', 'LATIFATU ZAKIYAH', 'student', '2026-03-06 09:21:08', NULL, 1),
('1ebc7ff13931ee6b4566aa873d1189bc9622', '4.52.21.2.02', '$2y$12$sX.hILhwCpSAzSbFa0Cp...S.q04TE25Ka2eFm9.cGq9CUWFQRwPG', 'ALFINA NUGRAHENI RAMADHANTI', 'student', '2026-03-06 09:22:11', NULL, 1),
('1ec58d44272331dff74866de37069b896699', '4.52.21.1.19', '$2y$12$Kz9f2RYeXWWiwJ5rYr0IjO9pT8SrXn4op5S29oIcGkLCXO9/VzzFK', 'NAUFAL ABDILLAH', 'student', '2026-03-06 09:22:06', NULL, 1),
('22fca8e62bfb101384d33f9429979911c503', '4.52.25.0.23', '$2y$12$pLWPudL8ETqBNB2ilNgIT.Sucg.3eP26T9k4HNCuV7NwpYFk.NZOO', 'RIZQATUL JANNAH', 'student', '2026-03-06 09:22:36', NULL, 1),
('231c2d86709b9e9227fe21c47039e5ed2756', '4.52.20.0.05', '$2y$12$rpSdFWPXrIxPfK2/aq70TOwTWCN6wnzxppzQRQ8JlW8GOZcdTQgK.', 'ARDA', 'student', '2026-03-06 09:21:26', NULL, 1),
('24ac7cfd58cf64ef364dd8bf0bcca589d692', '4.52.25.3.01', '$2y$12$1IPtzWnT7hzio/j2djFVAOKtXl3D2YNF6HFtBDFi38xaEEpMiRlEy', 'ADELIA AYU SAFIRA', 'student', '2026-03-06 09:23:01', NULL, 1),
('252945835f8b3a24acdfc856c727dcff9ce7', '4.52.25.3.26', '$2y$12$9UqnsnoOUkpdVXyaMBz1bu2tXfwKHqvD5rD51Op4SKnapkOsKTlXq', 'SOFYA ANGEL KEYSYA DEWI', 'student', '2026-03-06 09:23:11', NULL, 1),
('255bb8bac1b09dd1f09fb525cb1e1a0d9b75', '4.52.25.0.03', '$2y$12$E8/RZVNKTW17DgkPvQbXn.NiIJthJ5ttRND6M21RuD7Lw7OCCwKZ.', 'AGHNIYA SAPHIIRA RAMADHAN', 'student', '2026-03-06 09:22:27', NULL, 1),
('28fb5601c85c558ac9660b25a859dcdd4de0', '4.52.19.1.09', '$2y$12$zP2XWBPIIXp3HHwkEKJPFuejlK4VktAQm6fayIitUIBj8ed/Tn/Q.', 'ERICHA PUTRI', 'student', '2026-03-06 09:21:16', NULL, 1),
('2998550c915503511cfc35a31685073094fa', '4.52.21.2.23', '$2y$12$fQyYJmBCh4tkusvog49HUOzXqhjFVhpymvsALVuR1znEJTaS5PRJS', 'PUTRI KINASIH GUSTI', 'student', '2026-03-06 09:22:19', NULL, 1),
('2a5268a6c763b119e760f58cc08f745c75e6', '4.52.25.1.02', '$2y$12$hawL3H4vCvyeiWDx5/1kDeABorSMlalrjKLLsnwMDMnBld7Bw923.', 'AMIRAH SALSABIL', 'student', '2026-03-06 09:22:39', NULL, 1),
('2a93049c247ae69b049ff7ddcfe227fc7f30', '4.52.25.3.15', '$2y$12$Nndb08UBV6CblJpxY1WFFOlcG4WAJRwuFQHg.QOSwJjEGLV7UlzxS', 'MUHAMMAD AZHAR RAMADHAN', 'student', '2026-03-06 09:23:07', NULL, 1),
('2af07c1a39dfdc9abac651fadd0f8bffec97', '4.52.25.0.05', '$2y$12$kFy.4/QLi3uMbc3/ku19CuHI59mk0zzPlcnD9wf0IIqwWxPcn6ef2', 'ARLYNNISA SALSABYLA PANJAITAN', 'student', '2026-03-06 09:22:28', NULL, 1),
('2c213cab23f66f10f7c1cd2acea93fbda23c', '4.52.20.1.07', '$2y$12$FfHu64CekTwImGJv0SHl4ukVJAZd6Qh31GNs1SvWcH0K9BSCpWhFu', 'DIYANNISA FIRDAUSY', 'student', '2026-03-06 09:21:39', NULL, 1),
('2ca7b03abaa27beee7a26ce7c3be1a285e18', '4.52.19.1.24', '$2y$12$oaXhmpoIo0Cceejc5w1ZSu1gjtdTledH15gXf5PtRyUokY97HcUWO', 'RIZKA LAILA MAULIDA', 'student', '2026-03-06 09:21:22', NULL, 1),
('2cf3fc2ef7dd9cd950f0e4d06b25215dda0d', '4.52.25.0.21', '$2y$12$2pvJzPnzhx/g7UTFzT03TOuKKre/H3zRMwgNA.TG8UGFFbgiht25K', 'NUR FITA RIZKY', 'student', '2026-03-06 09:22:35', NULL, 1),
('2e131b7def6a3136036591ae6fb12ade680c', '4.52.21.0.05', '$2y$12$WE5gdYuQsqKbKnwWx0aHf.cTvV9pjEklvgaYZS0evxhLmP3vOGbH6', 'ANNISAAUL FITHRIYA', 'student', '2026-03-06 09:21:49', NULL, 1),
('2e4b4033f5a94ec28b568cb92696a23e4e84', '4.52.21.2.24', '$2y$12$qDqKM3b74k7L0TqP9amCR.tjGwLiry0e4sA49ISrLr..uoixJzvfq', 'REDITE CAHYO PERMADI', 'student', '2026-03-06 09:22:19', NULL, 1),
('2e8239662e4e619070e6582f3ae76eb08f17', '4.52.20.0.28', '$2y$12$moBXoVREERFvQqBKJSkIMeDd7Y0ewtFAtENLDPFxl38TOkromRzrm', 'TALITHA DWI WIRASTUTI', 'student', '2026-03-06 09:21:36', NULL, 1),
('2f58a690d40ec4ffaf303b3bc9c6ff304a7a', '4.52.20.0.22', '$2y$12$eOP0bONtt.1IGznA2Yonxez6W8b4GGlQoKFAC5YX6YicXwibKgafW', 'RACHMADIAN NURWULAN FITRIYANTI', 'student', '2026-03-06 09:21:33', NULL, 1),
('2f654293f02533459480d24d1b55ed68eef7', '4.52.25.3.10', '$2y$12$lGN4CuEzkxdY35EucLIGLusAngCQ0DhvZL6W9b0X8nv/IxDe2iqGy', 'FIRDA AULIA PAZA UTAMI', 'student', '2026-03-06 09:23:04', NULL, 1),
('2f8281627902b9ffa27e16007a24e5039322', '4.52.20.0.17', '$2y$12$JFxs.mwgN8KCA9GCU4ho1Om6t6cwUuXajVKrZ83x.LuZJZrQq1HhW', 'MUHAMMAD AZHAR FADHLURROHMAN', 'student', '2026-03-06 09:21:31', NULL, 1),
('2f8ec48d962012d1970c3bb0cd994f59c365', '4.52.25.3.22', '$2y$12$6i6D4pDl2K81CtL8zRBupOL2fU8cmQVYoYcrHWIPukXZwUZjdKMyi', 'REVINA GADIS AYYUN CHOLISYA', 'student', '2026-03-06 09:23:09', NULL, 1),
('3022ba9b8d9c46bd486c0f11b36c19032a3a', '4.52.21.2.22', '$2y$12$xtFlxHyAONdKhRkn.WmLregqdfFzUx4mjxiC7eYYJHdTIWsxwiXxe', 'PINKY ALVIYANI', 'student', '2026-03-06 09:22:18', NULL, 1),
('34d7b938b34f748d0d6f5f0bb1c58cd44249', '4.52.19.0.10', '$2y$12$2QRnpUurmkF8OuLNEZyGPeVJwXj.6GbSRRznby49vGavAY1qKGQ4y', 'ERDIAN DWI RACHMAWATI', 'student', '2026-03-06 09:21:05', NULL, 1),
('34dfdac9d8f4e46c4aa2c11ac1a74a0019dd', '4.52.25.2.08', '$2y$12$MiH0kJwr26eu4RKamCHoeuzsspq3IGtTvet38EXTvbp7sCSUqW3Xu', 'FADILAH AISYAH RAHMA', 'student', '2026-03-06 09:22:52', NULL, 1),
('35968801066d6d9a4129e6366f520096724f', '4.52.19.0.23', '$2y$12$.cTZdys7XYr.8NTtfitYqOPuV6Vk34V5KmNhH.AepxXzzRu5Wt2mu', 'PRISMA DINDA ZASMI', 'student', '2026-03-06 09:21:09', NULL, 1),
('35a04f8c6c8c845b68b5acd19a1b20d4097c', '4.52.25.3.28', '$2y$12$hKvcz7ALtqtE8a3OQUhQRu45xytGWaBDT6lFz5Ern.lCC0aOjcDn6', 'ZAFIRA RAHMADHANI', 'student', '2026-03-06 09:23:12', NULL, 1),
('35e1c7e58e5cfc0d42ab2b1763d700808c7d', '4.52.20.0.08', '$2y$12$zEYFCqb7HNizA8t6utwaSuXkp2LY6VepPQk9IAq5x780ylZx5IDm2', 'ERLANGGA PUTRA WIJAYA', 'student', '2026-03-06 09:21:27', NULL, 1),
('38615812690775447c677c60acad6af00a0b', '4.52.25.0.15', '$2y$12$IiHN.kJ4w.GIrrt7MI9n6ubEQTez4H1mxy4EnllQB2jxsulFdfAa2', 'MESYA ROSELLA', 'student', '2026-03-06 09:22:32', NULL, 1),
('3864f15525d65d4e587f9666d908dd89dd7f', '4.52.20.1.16', '$2y$12$tJFO67coB2G4qqfEJEUiEugbxFKALVh3CrUjw.L.cm9ICQBbKRP8i', 'NABILA NUR HALIZA', 'student', '2026-03-06 09:21:42', NULL, 1),
('38c4042bd70b60564facfe3f7c08b074a908', '4.52.20.0.14', '$2y$12$4RuO4IEUU5fpprKVUCPj0exTE8XzH/6xwspyd3/EFUT1PgoQyvSDW', 'LUTFI RIDHOWATI', 'student', '2026-03-06 09:21:30', NULL, 1),
('39c5b82e9f17175953143614bf663fafcbdf', '4.52.19.1.05', '$2y$12$0u4lvwr2ngkQY4NFqbo6ouK7mC7Hzs.dhQSTseG1WKDPJJq4/4bpe', 'ASTI KHOERUNISA', 'student', '2026-03-06 09:21:14', NULL, 1),
('39e40edf749bfd3a1905dcd587276ec5039c', '4.52.25.3.17', '$2y$12$FrWNK017WhBmhy9pWs8wQumczgi2We9MHllcu09N77wu8vTTIOibe', 'NADHIFA AMANDA MAULIDA', 'student', '2026-03-06 09:23:07', NULL, 1),
('3b1903ef4ff29e4088e181c5e1be7a5dbc03', '4.52.25.0.01', '$2y$12$J8Z7nkjIwtXeHfoRToSBrOQYfJbkASTRknDcAWXV3TYaulKbt1E5u', 'ADIL SHERLYNA MELODI', 'student', '2026-03-06 09:22:27', NULL, 1),
('3b39c38054d0648505dcdfcfea2c33aaa10b', '4.52.21.2.10', '$2y$12$IZvf/q8B4k/4OSZwB7p7UOwfIV/MG96s3J1cy3V5rqobaqoh3nJMu', 'DIKA NUR PRASETYA', 'student', '2026-03-06 09:22:14', NULL, 1),
('3bb83426b476c33ace9578ad815707eb391a', '4.52.25.1.16', '$2y$12$TSZuUkOzi6OOJGuiTbVy0u.fxub.jIV9nGeuOt0D1NbSOkWNjX0CO', 'MERRYS MARGARETHA PUTRI REIMAL', 'student', '2026-03-06 09:22:44', NULL, 1),
('3bf0d66b7deeed18b7a84bb33eddbcc6abb4', '4.52.21.0.17', '$2y$12$u1SR7Yjvz0WWDDv.ZMNF4O92TLR32vpp4dQu7syab/iAq8DJb4Hr6', 'MIRZA DZAKI KAMAL', 'student', '2026-03-06 09:21:54', NULL, 1),
('3ec2537875dd3fadb18517ba68919e6aa53f', '4.52.21.0.20', '$2y$12$s2hBiqv2cLYTukwo17p98OkHII5U0PIUPs0SF6pAuUInA6cXTQCV2', 'NANA SOVIANA', 'student', '2026-03-06 09:21:55', NULL, 1),
('3ec327f6ea3f475e36aa9f558cc0d7710575', '4.52.20.0.29', '$2y$12$T8hgSBbb.bdAIGY6w4V18uqm2edJ/ksT0UShNC85AJRVg0EvOaj4O', 'VHIELA EKA PRAMITASARI', 'student', '2026-03-06 09:21:36', NULL, 1),
('3ff0cc82498a5248df297f22b13761ddf75a', '4.52.25.1.15', '$2y$12$5kUO5zHWr5RPRoSZjuKKmexAKmQbzkNTekqz1XUaknD.NrwCC5PB2', 'KEYSHA JASMINE KURNIA', 'student', '2026-03-06 09:22:44', NULL, 1),
('417066c5128906a1a089b723dc99d3556b69', '4.52.18.0.03', '$2y$12$w4Ke9urokBWySc49GXsmQOLdGkCEflfK.znLB/EY3OD3CcCYbOdnK', 'AMANDA DEA SAFIRA', 'student', '2026-03-06 09:20:42', NULL, 1),
('41fcc807c90b306f59e32488483988be164f', '4.52.25.1.19', '$2y$12$C0lCnJTe/NOuoceYR1Os2eEuYKNoYs24GsGXlGX3Bl.QbFj2eIQFm', 'MUHAMMAD RIZWAR ANAS FIRDAUS', 'student', '2026-03-06 09:22:45', NULL, 1),
('4234622a981d56b1ed8566f4795de35218ef', '4.52.25.0.26', '$2y$12$O.Szk/Qh3J15vek6Z1Mck.tk2NUC9rMnK.Cxf1lWCnf0ynjvCDxKi', 'STEFANE JOY LOVTIANDRO', 'student', '2026-03-06 09:22:37', NULL, 1),
('442ee479158f6f48cdc54688aa802625e67f', '4.52.23.8.09', '$2y$12$iDBoMoIHUZUr4bD01/galOlcVc97L/QKaWdd6F8OF88ed/39rIuOK', 'SEMUEL DENI KOROWA', 'student', '2026-03-06 09:22:25', NULL, 1),
('44d6a055ba272e8a52c1b7c048a7264c525e', '4.52.25.1.25', '$2y$12$n15RO3A9vCFv9k6.k6rv7.U5EJWHHvwF3xSyw3M1z7.7rmlBorYAW', 'SHOFIYATUR RUHANIYAH', 'student', '2026-03-06 09:22:47', NULL, 1),
('44db3744ecdfe1d6d670c4e7f2516233e098', '4.52.25.3.07', '$2y$12$pPA7FiCyzEk0RM.M14x8AONTS2eYbpklxEukV1nIjxk7v4JjIW69.', 'DINDA ISLAMI PASHA', 'student', '2026-03-06 09:23:03', NULL, 1),
('44e72f51b3e282f82fa06bfeae032673f5c2', '4.52.25.2.16', '$2y$12$KPFIqu.b9u3Bku6PtaeF9u2f28oBe1vZwYP00iseLjY3Qfwsc.8/q', 'MOSES SURYA PRAKOSO', 'student', '2026-03-06 09:22:56', NULL, 1),
('4541db92aea907363b9dec8c404c0668497b', '4.52.20.1.02', '$2y$12$.PX46SC73FvpSKKV3blQcOCsVUDVQxtIaWA25AbFIFnW35GgX9Afa', 'ANGGRE FARHANNA JULIASANI', 'student', '2026-03-06 09:21:38', NULL, 1),
('47139c44cd245d217ab40c9c4a4c1cde22ee', '4.52.19.0.22', '$2y$12$knOUyeJ39ngnYyKjK7RlTO133NV91urQS2XIMzMMV7GZ0Bb7OAjvS', 'NISRINA AYU SEPTIANINGRUM', 'student', '2026-03-06 09:21:09', NULL, 1),
('474ecf4bf6ece68b134a3db31fe5d75bfd6c', '4.52.25.2.13', '$2y$12$lwetT0YlHvRLY6UgCeoEHe/dc1GyNKPtWuxSEtv0ONZnAvF5DuMei', 'LUTFIA FAISYA AYU', 'student', '2026-03-06 09:22:54', NULL, 1),
('47b3cfaba974fdb7ce035c3db14ded537e83', '4.52.21.2.17', '$2y$12$Pdi0gjlm69d6CQ7NGais7esdhkAB9hJfTuEqcrPb9vGmqB19FQq3.', 'LULUK PUTRI LESTARI', 'student', '2026-03-06 09:22:16', NULL, 1),
('486d86e3decf18b9c96a9de7933f46613804', '4.52.21.0.21', '$2y$12$iDkj9nHpeGkyIA1megAW7O9y4Rr4YHmwDM2X.f0VFCxSPCUWEg9Cq', 'NURUL AULIA ISNAINI', 'student', '2026-03-06 09:21:55', NULL, 1),
('49973861704b6d37df8066f5e30fc96787df', '4.52.25.0.17', '$2y$12$iHxMLML.hLM7kTNCb6khrObQ1ZJ0/pUicxQDfgYHbLDGGA8mV7zTm', 'MUHAMMAD FARREL ROZAN', 'student', '2026-03-06 09:22:33', NULL, 1),
('4afe9bb000f4953d1eec621f51c5bf0858a7', '4.52.21.0.06', '$2y$12$o9gt3qkBjMaDvpL69H0d3ubXqEhmXqh28p85hRNNe2hEX0XBPU7zS', 'AZZAM ALHAFHIZD', 'student', '2026-03-06 09:21:49', NULL, 1),
('4b48ec2a0feedb68b2c23722833a3ce604d6', '4.52.19.0.04', '$2y$12$zkWCiGJ6ug00HYSPU0L/.uY2VmsouC7CHTSgOEHgm6msF/kHKtPYW', 'BAGOES HERU PRAYOGA', 'student', '2026-03-06 09:20:43', NULL, 1),
('4ba93274fbf1f48dc60f2516b83babe5cea1', '4.52.21.1.17', '$2y$12$u.RtNNmIR1nFxybN3BtPge3DNPf2SEmR3HQpanOMbqCG0SPlhnFeq', 'M. FAHRUR RIZKI', 'student', '2026-03-06 09:22:05', NULL, 1),
('4c020396355c22e93fd9a57fee69eeb82d25', '4.52.19.1.25', '$2y$12$MTYZcTch1FWzmyizSbuTLe5lNPEaogqTvLSLMM54XbBJtg.GuTwG2', 'SHELVIA CHETRIN', 'student', '2026-03-06 09:21:23', NULL, 1),
('4f15d5b2190a90fd275e312481abd8973bc4', '4.52.25.2.25', '$2y$12$DoEcqXUg7xICTA8PBLejVeeYl3cTJ7OcK6sZKmivLDl6OwlLHm8VG', 'TARA LATIFAH TAUFIQA', 'student', '2026-03-06 09:22:59', NULL, 1),
('505f9ed9ad80a74e6b2cc7289bf76b18e230', '4.52.21.1.23', '$2y$12$IUmn0gU9.N8ycakdKiLCd.LmU/pajxzSADI0XA4M05JOZa2uQYRwi', 'RAHMA FATHIMATUZ ZAHRA', 'student', '2026-03-06 09:22:07', NULL, 1),
('51548c87156e42f477713beb97217c0fd06d', '4.52.21.2.04', '$2y$12$g0.4BVCD/SZqynmNtt/DleBPKw1SSfc2qcndgmKrybIyQiVDX/gSG', 'ANINDYA  RISTA AMESTI', 'student', '2026-03-06 09:22:12', NULL, 1),
('515e0f56cb200a046b58e8038ce9e1420d3d', '4.52.20.0.27', '$2y$12$YJJe.RY.dIPqnEsD7x3JCeh1FVgcQDHaSIRPnmV1h33r6LPRC1F2.', 'SAPNA PUTRI HANDAYANI', 'student', '2026-03-06 09:21:35', NULL, 1),
('5170480eb3636d9e73a5bebf12e5bc39a3ef', '4.52.25.0.07', '$2y$12$ZOpbaviZwyWKmNecK3H9EOMRF5q17ATxTLdzLwYOe0YvMjIUiVNYa', 'CHELSEA AULIA RAMADHANI PUSPO HAPSARI', 'student', '2026-03-06 09:22:29', NULL, 1),
('518cdddcc74e4c9dbe1a96ea2297d3d10625', '4.52.25.3.18', '$2y$12$2mEBoAVYEmj82BZHZpzBF.PthrsnOtqw4irIbn3HCSy7Nk2hDxmO.', 'NAJWA DINDA SEKAR ORCHITA', 'student', '2026-03-06 09:23:08', NULL, 1),
('51fa1a9d336f9217e104b65b33805aae9acf', '4.52.25.3.19', '$2y$12$t3MyaHIMv3YjY.yoS1b.p.cDWFSYTR25PY0h0spvdTXcDzomj292W', 'NAYLA ARKA DEWI INDIRA', 'student', '2026-03-06 09:23:08', NULL, 1),
('52171e3bbd34935f96a51432177285373fc3', '4.52.21.0.02', '$2y$12$y3/NlN1BJR5o9KwvWH69Ke0UmkKkA2rFmMYMW0XnwXruJWg3GJPJW', 'ADINDA HEMAS RAHMAWATI', 'student', '2026-03-06 09:21:48', NULL, 1),
('526fbd399068bb65e05d8feaa4d82ec2b337', '4.52.25.0.25', '$2y$12$33kssQEpAU/Rz9b0hUefGOzkQutDlWKgGBt7zt9sMS/JvR643jlWC', 'SHELLOMITA DEVINA PRASTICA PUTRI', 'student', '2026-03-06 09:22:36', NULL, 1),
('52f0c6cb70dc3fc1a616deb36150c4362303', '4.52.19.0.26', '$2y$12$pWc9Ur.m1EaHvumoXmtLsutdGtvxzTL1IsOQ6o4pOlk2VMmmn4EsG', 'RUMIYATI', 'student', '2026-03-06 09:21:11', NULL, 1),
('5386d2c5f305cd2bb79d362db7694f946b24', '4.52.20.0.11', '$2y$12$MXXE1eqNF00m0jcWoawfkOyDuu75LbS8N9AKlst5lC2i0MdcZ778y', 'FADILLA DWI RAHAYU', 'student', '2026-03-06 09:21:29', NULL, 1),
('544a7d5b75c41e2f0615968ad0c49389a7de', '4.52.19.0.30', '$2y$12$rmDWJKSOqei07Whovglz9.dUXSeRa7TkRmJHHjwY2X/uy3q6Yjl6i', 'SUTIYAH', 'student', '2026-03-06 09:21:12', NULL, 1),
('5478f1a2093e8fd8b5e1095219b9e50f5aaa', '4.52.21.0.12', '$2y$12$8L2d/KRLy34VXiDsjVPdeueltDrfGTe/7ywJ5cz4aYNR2xl7Xvmxu', 'EMI ANGGORO WATI', 'student', '2026-03-06 09:21:52', NULL, 1),
('54ae53f07da827a6218aee5f7da505811c51', '4.52.19.1.06', '$2y$12$MTWxj76jJNTk8uLrk7kK8uA9Tn1MbF/EhxDxdNg2CCNyDH84bB.tO', 'ASYIFANI LUTHFIYYAH ANNASYA', 'student', '2026-03-06 09:21:15', NULL, 1),
('5637ce926b312674894386f82923df059305', '4.52.25.0.11', '$2y$12$C0tJ/hWeXvzPOuCsxwjxuelOfxm9MJXNz0IOkTzkkcoeNRh4xhvcK', 'FAUZI IZZI ITSAR ILYASA', 'student', '2026-03-06 09:22:31', NULL, 1),
('56466d2e6966f48913d7ff7a1470361abd2e', '4.52.21.1.26', '$2y$12$MI5rjhQx/3X06VZ90EiKiuXUS6AD80j0LAowYnaO8OCzzw7uNfRbu', 'SATYANIN DIAZ', 'student', '2026-03-06 09:22:09', NULL, 1),
('56cb7e888e436245699bf485beca8a3e20b0', '4.52.21.2.14', '$2y$12$w66qoGG8gMyHUwjsYapC0.5C82UFakrT1h5LOlzVIFOrywvHTsu6i', 'FARAH HUSNA PRAMESTI', 'student', '2026-03-06 09:22:15', NULL, 1),
('57cf83057315b2a9fe875fd375e40c67a9ef', '4.52.25.3.11', '$2y$12$bczDirtnbiXHJqznP1XjduoNL4OgOOg3iDIR31vo5x96ebFkYjGni', 'HANUM ALIFFIA NUHAYAH', 'student', '2026-03-06 09:23:05', NULL, 1),
('57dfad4885261b529ff29cfea4860320da37', '4.52.20.0.26', '$2y$12$qtym9g5uWgrWJsfWbHt1oez/ilscdyN/AO61Y90Cd/NaRvDnoEiqW', 'SALSABILA TIARA WIDYASARI', 'student', '2026-03-06 09:21:35', NULL, 1),
('58251970b9f1befe2949b7dc6e588ef2e448', '4.52.23.8.12', '$2y$12$G7UoQyQr2QzArBtHSDoFOutYr1jiStx5AC3kvOMcuI2mjo4g4QuPG', 'YOHANA YUSTIN WANDADAYA', 'student', '2026-03-06 09:22:26', NULL, 1),
('58b54715ac51e684b57202df199ed6aaff1a', '4.52.25.2.28', '$2y$12$efr/AsWkbDuxV.6aXwDLwehalG..C9HPT9l2Vle.iAxt7ZU8QrtTS', 'ZAHRA SALSABILA MAHDIYYAH', 'student', '2026-03-06 09:23:00', NULL, 1),
('5ae017cea559c37068cce259670a8c88c172', '4.52.25.0.08', '$2y$12$mlnH4p/UjSGKrqojgVvrR.A3teN22ugT5lFZDSOqMIvBRUpiwCTTK', 'CLAUDI DWI VEBRIANTI', 'student', '2026-03-06 09:22:29', NULL, 1),
('5b1b7189c0771cd34647c3f0223f4644bf2f', '4.52.25.2.06', '$2y$12$jZ6VCqqClgLOc5PWk2XW/.yTkdiGh7d6wHqAtrLuY8e5/tuKGx9me', 'DEWI ARRAHMAH', 'student', '2026-03-06 09:22:52', NULL, 1),
('5b945e3a8d93bd2bd01a1ffba3758c7d29da', '4.52.25.3.16', '$2y$12$o366pcPxmG.lSiBPxvS8mejxjgSb9a4Mlbu8d8jlyy8o48XybnL2a', 'MUHAMMAD HAKIM MAULANA HALBA', 'student', '2026-03-06 09:23:07', NULL, 1),
('5b9cc0178d13809b8773183a2acd33c771ce', '4.52.25.2.17', '$2y$12$ZGNU7nt8yjtVZhyvPJ52nu.QxBmIlYsmrzn9kq5jeBbcwr5jEHNt.', 'MUHAMMAD YUDHISTIRA KHAIRIANSYAH', 'student', '2026-03-06 09:22:56', NULL, 1),
('5c2ce00d0fab1b783e0b17fc130e1c7bcd5d', '4.52.19.1.08', '$2y$12$yEv68qRjmFH6Hna/trGx0u2SQTm9apmAZK3CH1scv6pcLvW6j9qwq', 'ELSA RAHMATIKA SETYAKASIH', 'student', '2026-03-06 09:21:16', NULL, 1),
('5c7c1a4d4fc9a55045f6dde048151694493e', '4.52.25.2.27', '$2y$12$S2jJpXMA9qdcd/dcOkyAC.hOOW9I7NxsmBlIqDV80VYi17edXKtyO', 'WAHENDRA JAYA PRAYITNO', 'student', '2026-03-06 09:23:00', NULL, 1),
('5d45461c02d09a058ed2cee21a192f29d3b6', '4.52.25.2.18', '$2y$12$KBZ4i5S533zQU3sUqfvHBelhaKpnqWHkL92VZ/W722gVKl.UGtY.S', 'NADILA ARIVIANA TRI ANTIKA', 'student', '2026-03-06 09:22:56', NULL, 1),
('5d7564d11de4a12e97009b08f05c99b3ec98', '4.52.20.0.19', '$2y$12$eePYJRRGCg.bDgfpcOpOluz6oQKqX.gm34iFHsHZKgmqTAkAfOA8O', 'MUHAMMAD YUNUS', 'student', '2026-03-06 09:21:32', NULL, 1),
('5deddbd46e3e769420f9c1e62dda946f242d', '4.52.19.0.09', '$2y$12$2ax7VZTQyjWP6TZoOFfBR.GTJhaCu0uX3Bs.G5LHZxxABz4C57Zg2', 'DIVA EGIDIA PERMATA', 'student', '2026-03-06 09:21:05', NULL, 1),
('5f2ba7292ad874ab748a523491aeb66f4f68', '4.52.21.1.20', '$2y$12$BKoVDXNncqnp9IP05FAX6.2i4SVbUgo1755b5NRX.lLeRMfARs17G', 'NOFITA SALSABILA', 'student', '2026-03-06 09:22:06', NULL, 1),
('61471ccabc25df96b76e1cc147ccfada8e21', '4.52.25.3.09', '$2y$12$UW8Uz5zw66Oeze6LXN7Pl.GJ./WSavn3QZ2wxwVRDEqVsi57xwxwe', 'FATIMAH NUR JANNATI', 'student', '2026-03-06 09:23:04', NULL, 1),
('61d428c053e049aab8fa9258b6a51b9d84c4', '4.52.21.1.11', '$2y$12$TLRsuhU5IT7/O7RJH.gzTOJelfeiSjsj46zw0jNdzPs/G5pYgl202', 'ENDAH NOER OCTAVIANI', 'student', '2026-03-06 09:22:03', NULL, 1),
('6203ba3cb441d65090d6ee32c2f106e7faf3', '4.52.25.3.21', '$2y$12$iCXRv3.TZ8YiWx0.xvJcZ.K/4W3laWx859ksxuO1kIs0lpDWaOC7C', 'RAIHAN ADITYA HENDRIANSYAH', 'student', '2026-03-06 09:23:09', NULL, 1),
('62c03003fe488a2ab98a9ee320bc9076e41b', '4.52.21.2.20', '$2y$12$tjQcfbpDiXpbdsiyMRJL9.SiZFyw7snpU2aHeYWUajKxYxbg/PK0q', 'NURBIYANTI', 'student', '2026-03-06 09:22:17', NULL, 1),
('650d72fd7ed1a70575627b3cdafe78b0ae5d', '4.52.25.2.09', '$2y$12$zC0BhEiW/kQs7wFd1TOGje34ZDSCqSGwT2y/GvyU2cUj2zUHqBF0C', 'FANDY ADITYA', 'student', '2026-03-06 09:22:53', NULL, 1),
('65737fc4b49414843858a15a4c2e7182411d', '4.52.20.0.13', '$2y$12$Ut7xIXvQ9/fr2MpjAY2oJO4LHseVfMX5g69TRioTTidf/S6Rrqu32', 'LUBNAA TSAABITAH', 'student', '2026-03-06 09:21:29', NULL, 1),
('658d457f80e2fa5233068b5cc9becb8c6185', '4.52.21.1.13', '$2y$12$PXuPHbPn3qpjlMecPBtklu7sNE9uabISglAcCn6ligv.5rqnyqcCK', 'FITRIA RAHMA SAHID', 'student', '2026-03-06 09:22:03', NULL, 1),
('666cedbb63d25db24959f6452b309a8b964d', '4.52.21.1.24', '$2y$12$PnZpmBYDiLGCovRkH29ayO21ui4jWohvba9/VlxLEeDfM5.PJF37q', 'RISKA MUSTOFASARI', 'student', '2026-03-06 09:22:08', NULL, 1),
('675cbf8a69d0d2c0b353d3022238f927d6c6', '4.52.20.1.19', '$2y$12$wn5RZkbz7SDBJc14GamP4uLCPNzVK3HamSOfdFlGr5hkOnQTJjhve', 'NURUL CHASANATIN', 'student', '2026-03-06 09:21:43', NULL, 1),
('6add5ba2c6d87f41d7e2b8d1eac453111c2b', '4.52.25.0.29', '$2y$12$7KERqZMt.SQ9v15ajXEpguxk/XghpwfuYzcSz1Z/7shJEXTMSQOZm', 'ZIDNII SURYA SABRANI', 'student', '2026-03-06 09:22:38', NULL, 1),
('6b07e6bf852669c88e3881664f609066e537', '4.52.19.0.19', '$2y$12$cJWoHM2Mq61lewG0H/uk0emVkdwQaXvCbHCqctyxHKo7twmUGXheC', 'MUHAMMAD NAUFAL ARIF', 'student', '2026-03-06 09:21:37', NULL, 1),
('6c4791d281ecc1fd15f544be19a7f86e46e1', '4.52.18.1.12', '$2y$12$rjN3nPmHcSZ4ZxBicazd5uy77awPzjwA8BjlSxFIx4NvmMgAtOv0i', 'INDIE DELIMA', 'student', '2026-03-06 09:21:13', NULL, 1),
('6c971938b66e2a0dfd07990f1b097f8cff9f', '4.52.25.0.12', '$2y$12$sFqSi.oZPs4FP4WEh12AgeiOWWZWS3s0uE/xmGC7bjG1RnNGFKY7i', 'FAZA MAOLANA', 'student', '2026-03-06 09:22:31', NULL, 1),
('6cc97fbb753c71d7aee38b3672ae91299af4', '4.52.20.1.06', '$2y$12$bTp0/WtUi2VsDujtjDjgLOuBlubefhydJIVYNKXDFYsu3fhZEW/8y', 'BALQIS GHAISSANY SHADRINA', 'student', '2026-03-06 09:21:39', NULL, 1),
('6ed366359b9c53d0c783872fce96853fda5b', '4.52.25.3.14', '$2y$12$JwkQGu70vE4muorxMmGvWuP2W01sNdPBJ3d/g/ybxDrAhbKgrdAma', 'MUHAMMAD APRILIYANTO', 'student', '2026-03-06 09:23:06', NULL, 1),
('6ed59d100d982310040d000fbd06323ec1e5', '4.52.19.0.24', '$2y$12$32D/lWGLxKm59ADgB56Z7u5Hp9kGy1MwwDsxb7tDrvNE1Bjfy59JK', 'RASYA KHANSA JAUZA AZHAAR', 'student', '2026-03-06 09:21:10', NULL, 1),
('6f40cb36eeca16cb7e157825fb62ef48bdb0', '4.52.21.1.27', '$2y$12$VI9bCNMOYkom3Mt4QgN0cuG7zsSb/sU3EAbBGlvrnJIygTq.QHjPK', 'SOFIAH LAILA RAHMANIA', 'student', '2026-03-06 09:22:09', NULL, 1),
('6fa8c9ecd1aef104350e834b86dcf6ae30cf', '4.52.19.0.06', '$2y$12$gY0an96rT9druRJrrTJ.Tem.tBRBRs.IM2/ef35URU8rC0S7AQDCe', 'DIAH LARASATI', 'student', '2026-03-09 08:56:23', NULL, 1),
('6fe0cf1b79bbdd288341d25970d26839bb3d', '4.52.21.2.01', '$2y$12$fZepIIP.X4U.jaOuDEyqZelapviNWawbRjS2ur0OvbfaFP.uZ6tjG', 'ADELIA DEWANTI AZZAHRA', 'student', '2026-03-06 09:22:10', NULL, 1),
('706c8aca012f49d14d7922563d651cab0f9d', '4.52.19.1.19', '$2y$12$zmuW7r.awNGZA2kmWzgYrOAxyNyC4NExtqqaZkhgBJn4hVLmnEPRK', 'MUHAMMAD DAFFA EL HAQ', 'student', '2026-03-06 09:21:20', NULL, 1),
('717f98103c57b1af819267bd71b08f6e7448', '4.52.21.0.10', '$2y$12$mHt9FSEUVJR4ndJWyaYa8etrotCIm709oYCpO3ypDBJuKWJhXnNuW', 'DIVIA CAHYA BULAN RAMADHANI', 'student', '2026-03-06 09:21:51', NULL, 1),
('738bacc080ec91d3f1c52a65d739d07a3228', '4.52.20.1.18', '$2y$12$Rt0IzdN7rWIdd/XkI9lMJ.IUSiUKp.8EB054.s/ap5zpCfFK77s8u', 'NELY FALAHATI SIYAMI', 'student', '2026-03-06 09:21:43', NULL, 1),
('749799cd1161f73e5ee300d9eef7012a64e0', '4.52.25.3.04', '$2y$12$cVZPYeyDJXqEPpg6TUgBH.DHft7V4MzWoQoHGYp0qaj5WLmmt81jO', 'AZKA ZULIDA RAHMAWATI', 'student', '2026-03-06 09:23:02', NULL, 1),
('74fa2b33feda88041156cb67c3bf8d9324c7', '4.52.20.1.26', '$2y$12$NhlraUfCk2Cstt0yNO6uNuERUwErsjysANX/v8A2GLRX.AAjFzQ1C', 'SINTA BELA', 'student', '2026-03-06 09:21:45', NULL, 1),
('7506b8986ca8816804d78b181b0c67e40380', '4.52.21.1.15', '$2y$12$MEsrTomyYp2LUL3SB.4TbutZJvTapEjAKoXc6BqKPnmiGJeiaXYKO', 'INDAH LARASATI', 'student', '2026-03-06 09:22:04', NULL, 1),
('75713dca7c2cb230f0abdbc74c4e30d58fa5', '4.52.25.3.12', '$2y$12$ACU0KYS5/BwHj6oGS2IQ0ejT8xz4bc0AgqvWdG1X.ncfJ5hwzntz6', 'KUN ASHRI RAHMA', 'student', '2026-03-06 09:23:05', NULL, 1),
('758c7c376c4a5a6fcba079bbc664db556299', '4.52.21.0.08', '$2y$12$2HAZKd0px2UMxWEpTUM/QOuoHsD5lIzDvGb30dFXNODekSp/xxfIy', 'DAFA AZZAHRA MUSTIKA', 'student', '2026-03-06 09:21:50', NULL, 1),
('77beb0d1ddc76f42624214c05b3363ed1bb4', '4.52.21.2.28', '$2y$12$U3uUu4m2WTHWZ24Nv62ZsOTIabwhVq7jGM2FyddtPEAid2ElG6rD.', 'SAVINA UMI LESTARI', 'student', '2026-03-06 09:22:21', NULL, 1),
('780c1e30660ef4ca71ad1bdf000835369bec', '4.52.21.1.03', '$2y$12$Zr.7i8gkzWiS4u2ltr6hc.Ob/230kcPiOCUZh/epXoiBNwqBU72su', 'ANISA YUMNA ARIANTI', 'student', '2026-03-06 09:22:00', NULL, 1),
('7c13a8df176a7968c4f13ba94af630a82e12', '4.52.19.1.04', '$2y$12$1vCAebwjTVx2ATL.Qk5vfu3ZDYvg5G9KxKdlVeVgPgs.NpbWlm.ku', 'ASSIFAH SALSABIILAA ROSSA', 'student', '2026-03-06 09:21:14', NULL, 1),
('7c438351ea98ee7652c3300100048ea10311', '4.52.19.1.30', '$2y$12$lqHOvSXyFn6izeBLueDpmu99iD7bkYAvjMi5RFRADxz5VR5eOA.VO', 'VICKA AZIZIAH MAULANI', 'student', '2026-03-06 09:21:24', NULL, 1),
('7c88a07183d45af72e1027688351b1d414eb', '4.52.25.3.27', '$2y$12$RywjB8TCl8.AeqzvDsw0nOt0l6HyPugP/JlU3L9z7prVwYoih7gw6', 'SUCI AULIA PUTRI', 'student', '2026-03-06 09:23:11', NULL, 1),
('7d190d33271d93679aba73fd39fdbc1a0cc2', '4.52.21.0.14', '$2y$12$1vQXnASkKl1PctCeNnXP8./gcjYNNJKg8WA7ljipSPZeVQc8ZtS7y', 'FARSYA SALSABILA', 'student', '2026-03-06 09:21:52', NULL, 1),
('7d935330dc354bea7551e215e17d45f13554', '4.52.20.1.13', '$2y$12$1F.r7n3SXQMG.U6VEKHA4eX2DPQ4UvV2Pw9UOGUmG5q9vibwT8CUO', 'M. RIKI FAUZI', 'student', '2026-03-06 09:21:41', NULL, 1),
('7de6af6c2ef3a4068dd3801c75382be10056', '4.52.21.0.19', '$2y$12$Ab1nAsFfEPy9wGtIVnDP.uXLb1E7EjxFscPfkUEus/hXezg4mZldS', 'NAJLA DEBI HABSARI', 'student', '2026-03-06 09:21:54', NULL, 1),
('7e1735aa44b00040e0267052a4d9eef6e887', '4.52.21.1.05', '$2y$12$4aNVZ.xEC/kog6/oaz2cYufIyD9pfv8Rcs6gYssSHqyfAMiiNrT/C', 'AULIA SALSA ZAZILLA', 'student', '2026-03-06 09:22:01', NULL, 1),
('7e70311819f7474909bb1842b3dacb3b0c69', '4.52.20.0.07', '$2y$12$OO8rc5B0vQBHiHgqPsMdre03Y/JyyAcsmQWECC8upLhPBdKjffoee', 'DEANDRA AURORA PRADIPTA', 'student', '2026-03-06 09:21:27', NULL, 1),
('7e7580f96203c76ee5a6babceb6a3cece998', '4.52.21.2.19', '$2y$12$Lc4UF4vUAhumvTQWIqsOpujjGJ4zYcpoXq6aQg2HvEDJt49ryUSJW', 'MUHAMMAD NUR IRFAN WAHYUDI', 'student', '2026-03-06 09:22:17', NULL, 1),
('7fd37f7aa62840e83859df16d33f686030cf', '4.52.20.1.17', '$2y$12$SHFsMCoE6PA8YUzRjhaplOk4x4WNpDsgXUfh6Ljp4.oOD/kTiygNC', 'NABILA RAHMASARY', 'student', '2026-03-06 09:21:42', NULL, 1),
('8152429973714b710485e32bb7a7ba9d5b7b', '4.52.25.2.03', '$2y$12$yWR/RJAcyDIN0SjjQDHAH.wt7ta8gN1tz.I76Hw8zlnHvuJUaZy1y', 'ANTHONY ROBBINS SAPUTRO HANDOYO', 'student', '2026-03-06 09:22:50', NULL, 1),
('824b47b916182182510baf3baa843770bdde', '4.52.21.0.18', '$2y$12$vsA9CTJZ2xdK2igVSHuv6.Omjas8YpVL.vDi4k3I/G3PCFpY/lHWy', 'MODESTA DHEA MARSHEILLA SAVIRA', 'student', '2026-03-06 09:21:54', NULL, 1),
('824f21fe75ffa0f4c967c7d549314ce83d76', '4.52.20.1.01', '$2y$12$BRWYY6V8jtJkZ7ywpYOpyeS5TY9j2kZsNpOb9SMRkQ1jdheHQ4u6a', 'AFRIDA AULIA', 'student', '2026-03-06 09:21:37', NULL, 1),
('82a97768873e3477685716915d1484c37760', '4.52.21.2.18', '$2y$12$4HKSnRBtFhAffERJgbrxmO10wN0C0dx2CONcEIn.poDTxj46Clbt6', 'MEILINA DYAH SETYANI', 'student', '2026-03-06 09:22:17', NULL, 1),
('82ea2ad1a1708fa76468f1625f272957def0', '4.52.21.0.22', '$2y$12$YUxq67TlhHHpQ/2I9smZcOL.RRYaU8P4qUGsxVTYzZyrGFq4GU5wC', 'RAFI WILLY FEBRIAN', 'student', '2026-03-06 09:21:56', NULL, 1),
('83614ce6d840f521aa64d390c31fbca4ec9e', '4.52.19.0.03', '$2y$12$bC0u/mC3JY/AzLOxvkh24.TrMWzIPHJeqephdVvQ0s97WzC6hblW6', 'AUDRINA RAHMA AGUSTI', 'student', '2026-03-06 09:20:43', NULL, 1),
('837e9ea3556c489d6edde590d828810c1463', '4.52.23.8.08', '$2y$12$5godkhvhsFDZ91tuPhfYHuxtKaYI6pjNqZFmTKhgBNFFvz3c5R78W', 'REGHINA NURALISYAH', 'student', '2026-03-06 09:22:25', NULL, 1),
('8498da2e884225ebb9f8fc4f3f82b24dd559', '4.52.20.1.03', '$2y$12$Fmbgf50VjpJyHYGiONGEz.wrBELX4OmSJRZjAT74XknP7jCtj16Ge', 'ANNISA NUR AULIA', 'student', '2026-03-06 09:21:38', NULL, 1),
('8560c6568a43977b3c253e2d2a87cd5c5dfa', '4.52.25.1.05', '$2y$12$YQZ7f5Yl6gKnEz698hbhm.ytM4b5vEFXOyktkT29vl5IVNEvzone6', 'ATHAR KHAIZURAN RAMADHAN', 'student', '2026-03-06 09:22:40', NULL, 1),
('86eeeaeb5e200f74679fb2613e09d566447c', '4.52.25.2.22', '$2y$12$2vhlYPbYxiKfi4eqUkld9OqMG8qOcO9NsGPOnGTdxyObLnN2UvYPC', 'RAYHAN AHMAD PUTRA', 'student', '2026-03-06 09:22:58', NULL, 1),
('89ca018168720c88f772e5587b7e9c64e3f4', '4.52.21.1.18', '$2y$12$rrliL1I7AK3upyWAZiac2uTkUWjvFy/9gv8U7jfEcvkQ9AWVOJslm', 'MUHAMMAD FACHRUR HIDAYAT', 'student', '2026-03-06 09:22:05', NULL, 1),
('89d44bf1a4df136fca8bafd78939c35b3b67', '4.52.25.2.04', '$2y$12$RcaFuk6atK6BBBdkJ2V4TOxcKSvZrumVxzIXgZ3Sh0xw6fTUsWBh2', 'AULIA NAZUWA YULIANA', 'student', '2026-03-06 09:22:51', NULL, 1),
('8a5823760be11d71ca51655e7aba330e4474', '4.52.19.1.22', '$2y$12$yln/QbhZHOaCjTb6PxVqEOPEVGSv4yBtcx0nxEDc3PU734TbRuV76', 'NURHASANAH', 'student', '2026-03-06 09:21:21', NULL, 1),
('8a77d09809d2a780957b2d86baed1d8400d6', '4.52.23.8.03', '$2y$12$txXNNg7szQH001iN0vB9re9oqu73OOCuXqbmm46Wmh1vhhQGNRhXO', 'DITA RATNA SARI', 'student', '2026-03-06 09:22:22', NULL, 1),
('8b1efe09aee841ff1bd8a9433b977173ab4a', '4.52.20.0.30', '$2y$12$kOD7g6CkHwtsY3IzHuhUYu2L8NxNOfYj7aT/erze5jnuvFHsSaFX.', 'YUDHA ESA PRIBADI', 'student', '2026-03-06 09:21:37', NULL, 1),
('8c9c3db9cacaebf6104ab5879d52c06201af', '4.52.25.1.08', '$2y$12$Hi4yMTxat9Oz0PSEDAmFYOpi4WVmX.JZVb7w52p/6qfewOByD545u', 'DESTI MUSDALIFAH', 'student', '2026-03-06 09:22:41', NULL, 1),
('8ccb4c8d2c6d226dbaee693a62c022562d13', '4.52.21.1.16', '$2y$12$a.VdoJqsRts13cmzKyd0Iu.zt36TmYvxshooIKEwqyNZShrj80xXm', 'JULIATHA NABILA', 'student', '2026-03-06 09:22:04', NULL, 1),
('8ccd9de0cda5153de135c255c57dab513fd0', '4.52.25.1.20', '$2y$12$vqtS/VF6bCkDlkvZtQMxIOppefgDTDGXzhy7QMV/ku5eyT3qS394S', 'NAUFAL DZAKI ARDHIAN', 'student', '2026-03-06 09:22:46', NULL, 1),
('8ce93ba0552915947fab5c7cb74447eecf06', '4.52.25.1.01', '$2y$12$37Qflp3GSWYQu.OACRDeqOO4Zfl5wf6biVmYrdC7lYWaAt7Igghiu', 'AISHA DAHAYU LAKSMI', 'student', '2026-03-06 09:22:38', NULL, 1),
('90d0075437c172177c4e6a93975846307ce7', '4.52.25.2.05', '$2y$12$a5tvMeIaGcaImADPoAT1IuQ7iHsT6cdX0WPdVabHwNlEYxYiJ2RZy', 'DESTRI RAHMA SINTA', 'student', '2026-03-06 09:22:51', NULL, 1),
('9136cca068ffa32610b32ae248c3a31f76d0', '4.52.21.0.29', '$2y$12$2LebOQy4NR7VF3cjbAkPV.L1/ep8gbnQxdtYE1aQf3UnWqF20bmWy', 'TIARA RENA PUSPA', 'student', '2026-03-06 09:21:59', NULL, 1),
('916bdc5ac3b3e018d6decf075787fa426ca5', '4.52.20.0.03', '$2y$12$lsk2GSR8jobipqnNaZfg9u1Y6JmBs5Hpfc4vEI7RMFo79LdgMw67G', 'AMELIA TRISNA PUSPANINGRUM', 'student', '2026-03-06 09:21:25', NULL, 1),
('9206ab80a539d6da74cb899f08f98ea55e95', '4.52.20.0.01', '$2y$12$wCv3ke7KGAeO6lsU8xzBcuIJB1z9I2Jcl/zSR6s9NCpIJ0xtOlGwO', 'ADESGY TIARA LARASATY', 'student', '2026-03-06 09:21:25', NULL, 1),
('92e3d000c8d34a6d28397433d511a41177c2', '4.52.19.1.28', '$2y$12$bQUXKmgEy7GOZNz0K2cJKOzHAE99U8yVd4Q8SqyDem014UcYntA2q', 'TRIYAMAH SOLIHATI', 'student', '2026-03-06 09:21:24', NULL, 1),
('933c675c6ea6ba9c362c32fdc73214c986bc', '4.52.21.0.25', '$2y$12$HdWqEBXOmZoEJvkIkdsRZeO6vsxzWetLKwZqxVXdwu2/FZg1mR.eq', 'RINDANG RIZKIDEWA FAJARAYA', 'student', '2026-03-06 09:21:57', NULL, 1),
('93cbd56fc6679ec6f8424cf783ee10b9e78e', '4.52.21.0.03', '$2y$12$yBX8RcfYAg3Ie4rYhpPSSenpArImAXSHBL0xxmZV5V1gCBE2nrQRC', 'ALFINA RAHMAWATI', 'student', '2026-03-06 09:21:48', NULL, 1),
('93f99c8407f22a951632c1b198dc8ff3793b', '4.52.25.1.26', '$2y$12$I1uxZFec978NcN8WwW/Ccu3gM4IyMSU5SpVC8scIxtKwg/qIpVuF6', 'SYAHLA GRISELDA RISANDRIYAN', 'student', '2026-03-06 09:22:48', NULL, 1),
('9404fa33f6ecddaf89962a96242e35337eec', '4.52.25.0.19', '$2y$12$DXApqhmXsX0LkcYLcapFs.CIliaxXJOd7F/KQGFlsTUOvQHoVs03a', 'NAYLA ZULFA ARIANI', 'student', '2026-03-06 09:22:34', NULL, 1),
('94e27ce76e2fc50c618da12b84c19c7a61ea', '4.52.20.0.10', '$2y$12$Y.E2fXIMQoyPBQgtcw4.v.JU2Bf3ciiq9pxC99uGn7bPgAVK1Gj3K', 'ERVINA AYU PERMATASARI', 'student', '2026-03-06 09:21:28', NULL, 1),
('95ea247d3a8040230c3ffcaeadb462474b3c', '4.52.20.0.21', '$2y$12$LkTtQiYTJKV9L0XVyJ4JCu8SK091060BnHqGLir77xeCgAPUJ7xVK', 'NUR IMAM NAZIHAH', 'student', '2026-03-06 09:21:33', NULL, 1),
('9606913d0727c5017c0701e570cd7f1ac6e5', '4.52.20.0.15', '$2y$12$m9IOBokek7NiTyrIqMvDVeloNMg9ykYuu9gY6/QcGD9RRaX.5AzIO', 'MAYDISTA LESTARI', 'student', '2026-03-06 09:21:30', NULL, 1),
('96814e34a642525d3b634836fb59b3087291', '4.52.25.1.12', '$2y$12$qI356YNSj6K29vWocVfNv.SP3dKtRezudCkXMRAiolwtzXc8BgSPG', 'FRISCA DWI SEPTIANINGRUM', 'student', '2026-03-06 09:22:43', NULL, 1),
('98ccb48777e88b54e09ae2c5c70ce5def585', '4.52.21.2.08', '$2y$12$mMNwC/v413jTT2Hysfr2ruhsbklAvdYovUG5F5CzDdQ7nYia/o8jy', 'BRIGITTA PUNGKI YULIASHARI', 'student', '2026-03-06 09:22:13', NULL, 1),
('99b6a0541ee20a4caddbdcd229520c2f45d2', '4.52.19.1.15', '$2y$12$aWG/YJ1Z9TG02veSKRi0IeF20qJ72iTMZFDXF8ylAyu6SWeR5FEoG', 'KHANSA ATALLAH AUFANISWARA', 'student', '2026-03-06 09:21:18', NULL, 1),
('9a8baacfe3ea803172be44e7872618a23b4d', '4.52.25.1.21', '$2y$12$g74oZuHeisHegU2pVPyJr.XFzqeJTopwEuNwJvNmnrVCii6BNFq7K', 'PARAMITHA NADIA HUMAIRA', 'student', '2026-03-06 09:22:46', NULL, 1),
('9b9f8315ae121acb8fbf82c29e2cd083b60d', '4.52.21.2.06', '$2y$12$qqEIpL1BjClXxNKSMQomr.dQCD9mEdiVFPxFVbMhnuj33P6kYmCaC', 'AVERIL PRAMUDITA PRIADANI', 'student', '2026-03-06 09:22:12', NULL, 1),
('9e3a7a17fbd7baa0ed526c1dbe4b66b69882', '4.52.21.1.08', '$2y$12$1/VyAZS4oSH4m59xwPioRehudiZuWj4W5HwYV0q3vMYNUqlvrZhrq', 'DEKSA ALENIA ISNA', 'student', '2026-03-06 09:22:02', NULL, 1),
('9f3acc1ecf454e3ebcc00e76469e45316e50', '4.52.25.3.25', '$2y$12$s1CfIbC/wGsVC5cv3x5uV.USuXAWAi/JtKbr9skn0LmpQEjcJ3Z6G', 'SEVIA SENTRA HATI', 'student', '2026-03-06 09:23:11', NULL, 1),
('a062428195b4355268e669dbd895246f020e', '4.52.25.1.14', '$2y$12$z5ajmLSLZhhs/nYdltX9LOx6NUf72uN488UXLZA.wIMnqJeGpnv2y', 'HANI CHALIMATUS SADIYAH', 'student', '2026-03-06 09:22:43', NULL, 1),
('a1426b6837143d4b93fc44dadd1210e0eaba', '4.52.19.0.15', '$2y$12$3dpzuEs.an76ab8s/7IRxuj.SJ2TG2Jm9yxk6vlQnibnVPj7Ioxqm', 'IVA SALMA RAMADHANTI', 'student', '2026-03-06 09:21:07', NULL, 1),
('a21de899662e2c60ff464954e283ffbc2bfb', '4.52.21.2.07', '$2y$12$qgCfgejD6pZKP6Yk8I4jeeYn7hb5OIpy9AGJTM/KN80mLaR0iZy9S', 'AYU RONNA WATI', 'student', '2026-03-06 09:22:13', NULL, 1),
('a2d88e9cb0c90cf2f3ba0b80bc99aab3d3e2', '4.52.21.1.02', '$2y$12$UYVMuQQRuFSxdYpBWLFfcO1OG/Ow1DzugXJpK8fXLfaqWVh6ubTLm', 'ALIF RAFLY PRADITHIA', 'student', '2026-03-06 09:22:00', NULL, 1),
('a45343a950f9eed7b9742e2c1fbc257c3831', '4.52.25.2.26', '$2y$12$BS9nj3pMV.UweBbzWNHejORA.a.lCNRnh64me9ZkDEjMFlrOB.nRG', 'VANI ANDREANA', 'student', '2026-03-06 09:23:00', NULL, 1),
('a523b086862c503ab130a92dcd8421caeadf', '4.52.20.0.25', '$2y$12$3VU5shBBOAbmdEm2V89QBe5fCfRzL/4p9I6kqQRp8k2t5er6wl2VO', 'SALSA AYU AZIZAH', 'student', '2026-03-06 09:21:35', NULL, 1),
('a551094092a08d08c9eb8c82b568bbefddaf', '4.52.21.1.30', '$2y$12$6VvdOAZHlG4NFHMX9oSJGubWdpiFsSVRc9mN4YjAD633Pi.iPA7h.', 'ZALFA LARASATI FADILLA', 'student', '2026-03-06 09:22:10', NULL, 1),
('a5637a6e1ae8fb4abe2bfcdd1d8394787d2c', '4.52.21.2.25', '$2y$12$hI1N3iFJUyX2hZsUvPTxHutv2P7995.u3nJzN4iliOaoCuxzhEng2', 'RESTI FARSHANANDA RISWANTI', 'student', '2026-03-06 09:22:19', NULL, 1),
('a6008f9c03b25de2d7a76952f8a6cacec45f', '4.52.25.2.02', '$2y$12$SLTSYYA3WS8aaSDFjWXpoON4UIurC9.TK5y27kGJmTQ.xZoTp3xB6', 'ANNISA RAMADHANI ASMARA', 'student', '2026-03-06 09:22:50', NULL, 1),
('a72e5e7f17065b2065d5aa8c0c5a58b94dca', '4.52.19.1.21', '$2y$12$bXtMh5QDxN8jM2Taxi6Oh.bO0l.wMoOErG0YZH80HnPQgofNAhqh6', 'NUR NELISA ADAH', 'student', '2026-03-06 09:21:21', NULL, 1),
('a74ce5285e77e78b680908bdb8842758dadf', '4.52.23.8.06', '$2y$12$MNWWRgXNYfF98RlEh1I/keo4Q3iXPGqW5SXSvdUbYyi6xP5eJaPYu', 'LENNY LEONITA MARINI UBRUANGGE', 'student', '2026-03-06 09:22:24', NULL, 1),
('a7e9e69fabaf5babaed54d7207fb9baa6d68', '4.52.20.0.09', '$2y$12$QqUBqzdTD8tXDzrU2w.YzuxVFuPwdwMnj461tn0x4dktRr..gdA7y', 'ERLYAN FERDIANNA', 'student', '2026-03-06 09:21:28', NULL, 1),
('a898b302d44ca98cfaf908d9a3ca91a2ca00', '4.52.25.3.24', '$2y$12$qnmfFyg.NdHhJ26qvQf5/OTeVLF5bq3E9FA3AW9KXr8E7WVEIc1RG', 'ROSEWINAR FILADELFIA', 'student', '2026-03-06 09:23:10', NULL, 1),
('a9aea50c123b7b056b6024f5bfcf14fc0f32', '4.52.20.1.29', '$2y$12$yIhmvTdpgRLsYG3xjCsmcu2fPcGXuSYSNfZ/Dr..fp2XKFLQg9rje', 'YUANITA AMALIA PUTRI', 'student', '2026-03-06 09:21:46', NULL, 1),
('aa26a314913fbd7c5ef7c32b31e63221e55d', '4.52.25.0.10', '$2y$12$jnR9OvMWdXZYvGHuGw4deustGVO0CjxaJqVf88odZuar77fjDKp8W', 'DZAKIA IMEL PUTRI FERDIAN', 'student', '2026-03-06 09:22:30', NULL, 1),
('aa81e3d18748bd0e57a61d6b4b1f12c47d3b', '4.52.19.0.16', '$2y$12$cj93Iyt1U66U5yNklIy5juowhiE5dTuEIwxbxD.9P16h2VNCUQfEm', 'JULIA ANGGUN PRAVITASARI', 'student', '2026-03-06 09:21:07', NULL, 1),
('aa8c34c88b9f6b2fbf8e9563a4cb32f91694', '4.52.19.0.11', '$2y$12$ZfvuwoeZbWK.P585bgGF1edusC4R.SJS3dXVdvZUhX9kJPAJXouj6', 'FEBRY KOMALA PUTRI', 'student', '2026-03-06 09:21:05', NULL, 1),
('ab54713e0c6816d4ea8a4619f6a30c8731f2', '4.52.19.1.07', '$2y$12$TAWm/H2G4o4qv8FKXDYvx.48tLm.X42G6ZhSZ3zlHHjR6GjmbQfsW', 'DELLA AMAYLIA ASHARI', 'student', '2026-03-06 09:21:15', NULL, 1),
('ab8967e1ebe20bf40acd68f53e992ad1a222', '4.52.25.0.06', '$2y$12$WpLFgR7ERwhOP5px9XPv0egfeNS5nOydDP89PIOq8n3R2.pjXJeAK', 'AWALIA ARDIYANTI HANIFA', 'student', '2026-03-06 09:22:29', NULL, 1),
('ab8eca16361c2633513085e4aee720e589bc', '4.52.19.0.18', '$2y$12$czd4EbwuFLLJJJyZMbDxJeGsjWkQdPpBmeON1U.FBdeYpRwWTUUT2', 'MAUDIRA DWI SAFITRI', 'student', '2026-03-06 09:21:08', NULL, 1),
('ac65df08c67c036d2eed8549d936175a77a3', '4.52.20.1.08', '$2y$12$g6ozxdohxLm/.qvDppSvo.f/n3vW7gSn4JD8jl9E8zp0g3OsJpjOK', 'ESTI RISHMA YULIANI', 'student', '2026-03-06 09:21:40', NULL, 1),
('ac65f88aa8910b9210f5f3a2906f59ed158f', '4.52.19.1.20', '$2y$12$vTn0ynoFzpbl8.FJhXdij.WUPtM.zESJZ93WR0do27As8QOk06uie', 'NABILA FIRDA ALFANI', 'student', '2026-03-06 09:21:21', NULL, 1),
('ac6b7c464ec763675b913fc88aa5d761f75e', '4.52.19.0.25', '$2y$12$hpHDE3HVhBTv30x4yrY77erfd8N0TSx98SN9Ob59i7HQJmIl/i4w6', 'RIEGGA RHEZA FERDIANSYAH', 'student', '2026-03-06 09:21:10', NULL, 1),
('ac99ae62202e5369e24bd221d722a210b507', '4.52.21.1.01', '$2y$12$BH1XBmxIqswOIqhXEGj2pOKsJGVeL1z8NpZaHNcPb1St6ZQf7UUou', 'AHMAD FADHOL IBAWI', 'student', '2026-03-06 09:21:59', NULL, 1),
('admin-abt-001', 'AdminABT', '$2y$10$71S1z6j1GZS2Z4EOEqhDBOtjW/Xn/eh9EuU90Wg8zb9beJaI1DpSW', 'Administrator Arsip ABT', 'admin', '2026-03-06 09:10:14', '2026-03-09 08:46:45', 1),
('af0e727504443dc870f4e50bdea52c8f0e32', '4.52.25.2.19', '$2y$12$tjfRp8Pa4O6UDlGqHNoQ/.rya43tfS7RmFjLWnSgHXu06r98d97k2', 'NAURA HUWAIDA ROHADATUL \'AISY', 'student', '2026-03-06 09:22:57', NULL, 1),
('af7cf90ca66fa7e5d63e568b2d20ca428db4', '4.52.19.1.16', '$2y$12$e.44.HoNvpz1JC5DZ6qTdO7zG2Io2ZDpClWgH3DuUHi3oWL0y5QY2', 'LUTHFIYA ISTIQOMAH', 'student', '2026-03-06 09:21:19', NULL, 1),
('af8a6809147927d887d34ef9f28c40f45909', '4.52.21.1.07', '$2y$12$X2h0WcKNJb3RknyA8gl/r.wgipxzhXMxmhVz3VpQDj6qiffvdo69u', 'BINTANG TITIS SATRIO', 'student', '2026-03-06 09:22:02', NULL, 1),
('b0624d07feecc3ce20774b01aa35dc67a3c4', '4.52.25.0.24', '$2y$12$w7R15Z0FMd5/f.AZR/NAdO32KhJ1JHhmqwM8iLR2xMC8qqBzm2tt2', 'SABRINA IBROSA SEPTIANI', 'student', '2026-03-06 09:22:36', NULL, 1),
('b0ae4e14a2bc469a49a611c436937ad1b8d1', '4.52.25.1.09', '$2y$12$gWe3FEPc8tOgNCxJD63NVOX92EZYJouv0JUTLqLT2G2NvMoEDKq.2', 'DYAH AYU SURYORATRI', 'student', '2026-03-06 09:22:41', NULL, 1),
('b14836357aec96284e64f392b7c4e0b3ee7e', '4.52.20.1.15', '$2y$12$CLmj0g.6CHJt3mCzK2ecz.w/m/LW4rnEaoTwoHWZrzn4nCP2uOVZu', 'MICHELLA DENINTA SULISTYO', 'student', '2026-03-06 09:21:42', NULL, 1),
('b1802c92af52edf52b74de34256215ba7388', '4.52.25.2.15', '$2y$12$0xe70r3naauQC2hL6GjGauNuXqYtvIxn.sGg0WoMqZnGyz7jEweu.', 'MARTASYA CAHYANING MUKTI', 'student', '2026-03-06 09:22:55', NULL, 1),
('b28f80bddc30cc4562bc26ecbfb5067b4f67', '4.52.25.1.22', '$2y$12$ezgwNtPblXU9osoooeua4OVdXv0QpFt.Vv/uqwPyPfhoexPlQYJzK', 'QOWI HAQQUN NAUFAL', 'student', '2026-03-06 09:22:46', NULL, 1),
('b46443ac61d0433190a8beaddb744a818fd1', '4.52.21.2.15', '$2y$12$HgiTlwhoRlI3ni4zY..EZ.OENyEEEmUUO9pHwwYdBwYR64m76lIEC', 'HAIDAR FARUQI', 'student', '2026-03-06 09:22:16', NULL, 1),
('b4d05b21e2b22d36931441187fef7b95bcf3', '4.52.20.0.12', '$2y$12$A4SyRAXPywj8mCMzG9Mhi.2gPRp96Dqht9JMluwi2xWORBSw/XIg.', 'LAKSAMANA MUQSITHU', 'student', '2026-03-06 09:21:29', NULL, 1),
('b4e7d1d236f97a88941b9b8a5a191d4dc156', '4.52.20.0.18', '$2y$12$sglvLrAmVfmVqrS3tFvFYO.Gaaa3OiLp7oKPVT2NqiDFtMD45FrAe', 'MUHAMMAD FARHAN ARIO PUTRA', 'student', '2026-03-06 09:21:32', NULL, 1),
('b6d6fe8e9cc7a36719afddc4b0bfd4d491c2', '4.52.20.0.24', '$2y$12$qBuzMBSjxc0yiltsZI7iZOIIcFdVJ72k.DJ/N0.GL.TK7ZClk5yM6', 'RATNA SETIYAWATI', 'student', '2026-03-06 09:21:34', NULL, 1),
('b73ee6e339a14ee857199dd06821f653944d', '4.52.25.2.12', '$2y$12$NiGUg5BFxr4f7Ivu26KZJ.qqfxz/9mj1vUC7gp1.YkllRKA5NizZ2', 'KHOFIFATUL MAULANI', 'student', '2026-03-06 09:22:54', NULL, 1),
('b85d773c22ccc61b621d081b1a1760343b50', '4.52.21.2.27', '$2y$12$MrmFEOl0oKx8/hA1m4yf6eABvj1eOpmIPojoLtGXmjMJRO37javTq', 'SALSABILA', 'student', '2026-03-06 09:22:20', NULL, 1),
('b98b361b9839d59fe9d1e1c51b1e16d3424c', '4.52.25.3.06', '$2y$12$QC7gnAySvuRddo2p4Bh4DuqchmlHt9Ro8A9mODar0VZqz.sBnFxGm', 'DIANA NURUL AINI', 'student', '2026-03-06 09:23:03', NULL, 1),
('ba2549c8cb36b1faef33c9eee70a7b3cd62b', '4.52.21.0.16', '$2y$12$ISbCWRvfldjKgMdgX1lUs.mi3JIj6Nx.p22LyYxsW5ucG2RIqzraa', 'KHAMIM NUR', 'student', '2026-03-06 09:21:53', NULL, 1),
('ba5c038ea98b67314ba50ddb08b73928c008', '4.52.19.0.08', '$2y$12$d/XRxKal2HmIwlRa2e99YOmqeCRNz70xtd0TCMUOmwZmEadjz8Ek2', 'DIDIN DARMAWAN', 'student', '2026-03-06 09:21:04', NULL, 1),
('bb4da056e4ff406e379ce8d9f252c46db0ef', '4.52.20.0.04', '$2y$12$F5rG3uSRSGHdZjtJGJVenOIgJw6YohDUhRennGt6wxWtl6JYOmyLe', 'AQILA FITRI NUR KAMILA', 'student', '2026-03-06 09:21:26', NULL, 1),
('bbe947558cac07f4d2a29fd533c833039c15', '4.52.25.3.29', '$2y$12$p9LFtEdF4HEzofsf92RwvejZXCZssE9Pp7mM8hIPOY4Vu52GYFmtq', 'ZAID ABU JABIR', 'student', '2026-03-06 09:23:12', NULL, 1),
('bc214093e078d44d38cf1ff3b03153b10b31', '4.52.25.0.13', '$2y$12$DgcCZh9JkxAETofi..QtfOTDJeUlFLmZn/mac74VQtXJybRufTj6m', 'GABRIELLE NATALIE WIJAYA', 'student', '2026-03-06 09:22:31', NULL, 1),
('bc4905a83de3a5ea16d4b2cdccff1e3c8a65', '4.52.21.0.23', '$2y$12$z0hX.foWj8HQ6tPGLjK/T.bmo7JNoALlR/no6YvZDKN0vhCto5Y0S', 'RAFLI ERSA ARDIANSYAH', 'student', '2026-03-06 09:21:56', NULL, 1),
('bda7e3dddac7f7dc488aa4870621d3691cdd', '4.52.25.1.18', '$2y$12$rjY0uS8vO/a7BHy3MXvRh.E9JYdWO1ZSsZ3qm5AHxDhlJ6hQA8mCm', 'MUHAMMAD RIZKI RAMANDHIKA', 'student', '2026-03-06 09:22:45', NULL, 1),
('bdc33139f6aece6077f8b5649d2175225855', '4.52.25.2.21', '$2y$12$2FZNuR6v/K2Lv48lM9dhF.CcqoiSZSfGncxFV1UhsREn2FFTPqW/a', 'PUTRI NUR NABILA', 'student', '2026-03-06 09:22:58', NULL, 1),
('befc1e95a6d303a5a0a571e244e0e4a8da57', '4.52.25.0.14', '$2y$12$PDydrUFWlYFqiajDmgzuP.V5DUXMcXAExxDpPhxBRCt3hFcg9ZtLG', 'JILTERIZA MAYLAFAYZA DESTYA HADI', 'student', '2026-03-06 09:22:32', NULL, 1),
('bf85e90a2f6723308742eaa5ac2ec43c8574', '4.52.21.0.28', '$2y$12$Bf0sh3zC02.9tQgRNCZ6tuJo.8rONUMRnmXnZlEWqIiBBCSGWy4xi', 'SRI WAHYUNI', 'student', '2026-03-06 09:21:58', NULL, 1),
('c046b9716be739b69578604dfbc1022b423a', '4.52.21.0.13', '$2y$12$a5jEsTXQ6.b7ckcejBqnaui11hl9LfbQsZd/Qz6BY2AEn.cLJLxqG', 'FARIDA NAJWA WAHYUONO', 'student', '2026-03-06 09:21:52', NULL, 1),
('c064043365eadcd9a3c1785c45c4abe04508', '4.52.23.8.05', '$2y$12$HVsThPVwRIMa4dCUiVqyVOKPtd5IJ9doKWfS0vrWWATjlNYOeUmW2', 'JIHAN AURLYA CANDY', 'student', '2026-03-06 09:22:23', NULL, 1),
('c3d9a856e9d7678b0be5b935a53039ec88d9', '4.52.25.1.04', '$2y$12$nRTCD8rFLrNmdNF31t3w4OhSKZYQ8VHVrl9oRUDVEanF9D1iUkAc.', 'ANGGI LAUDIYA', 'student', '2026-03-06 09:22:39', NULL, 1),
('c61ff187a74cf03543ade40beb1a62d8a93a', '4.52.20.0.23', '$2y$12$Xb.WKwJbhvbF9swO0bSdLeyIxeEdH1ICb9BHe8FMfSo0AkVcG1jla', 'RAKA SETIA DINATA', 'student', '2026-03-06 09:21:34', NULL, 1),
('c689ca19ca02d1e88048c9fdd8b8de1f4cf3', '4.52.23.8.04', '$2y$12$c22cN94u7e4dPzSmZh.eYe2JJd.gUvzhH0zTVBw/.yZUvduYM38Oe', 'HARDI', 'student', '2026-03-06 09:22:23', NULL, 1),
('c69afd8c2fc953c7f1a38267ca695b51dcb3', '4.52.21.2.30', '$2y$12$dYVke/25oobIq1rWx2urr.L8e2URQ77hnVwFnB3KvG/zKqrpmhsja', 'ZAKKY AL MUBARAK', 'student', '2026-03-06 09:22:22', NULL, 1),
('c75b452b90c2884a52d74798de24ba038453', '4.52.19.0.12', '$2y$12$LGrke0mVnJaT/LyPrxmdGe3cG09MPYUriG6utIT191SkQDeyruskG', 'FERDIANSYAH NAUFAL RAMADHAN', 'student', '2026-03-06 09:21:06', NULL, 1),
('c808790321673af3b41e1874af728b153987', '4.52.25.2.10', '$2y$12$gOk1uXvUPMYHWUjZLlN8NeOSv/VMGcpvzvZnM.lnE0tS/ThQPEgoy', 'HANNA LAA TAHZAN', 'student', '2026-03-06 09:22:53', NULL, 1),
('c939481a8d50b1c8957fcc11df9de6f2cbe2', '4.52.25.1.29', '$2y$12$nMxAKmUJhnzK2takpNTzw.aN8VJP.7cXmmfUD4dCUXGO3yQ4Ig0Sq', 'ZYAHWA NOVIA SUKMA PRATIWI', 'student', '2026-03-06 09:22:49', NULL, 1),
('c9644e80f9d8ec0be46327c9614d3bd821bc', '4.52.21.2.03', '$2y$12$M9agkjYSRxtbo7lCkQSoOuJgUy4TsUXKmC4a/iCyCSvpTqK2NkfMq', 'ALIT NADA SYAHRANI', 'student', '2026-03-06 09:22:11', NULL, 1),
('c974b23a9fff983d861b35b0f2872c36ec7a', '4.52.25.0.22', '$2y$12$P23GVY8JNIHlW/6B.EAVC.VRbDoiP7eo3xWkt8vAXLWdBxEJACWSW', 'RAIHANI ZULFA', 'student', '2026-03-06 09:22:35', NULL, 1);
INSERT INTO `users` (`id`, `username`, `password_hash`, `nama`, `role`, `created_at`, `last_login`, `is_active`) VALUES
('cac81c5f73372bec35c722fb7417b73c16d2', '4.52.25.2.07', '$2y$12$/mwtdGuoIWRdWcUXv/XWFOqM8nVeu51n2Hfdmcj8zZnmPEQDS.0Ma', 'ERFIZZA CHAIRINA LATANSA', 'student', '2026-03-06 09:22:52', NULL, 1),
('cad07b332da9fb3de90280cec3de721004fb', '4.52.25.1.10', '$2y$12$ZQC1VeLawI11sGEgDXpOK.dMGba72WnucB/qrVJfLgn2c56a40rDG', 'ELFRIEDA GRACE NATALIE', 'student', '2026-03-06 09:22:42', NULL, 1),
('cb713698afcbb7669e8930bc1641e37065cb', '4.52.19.0.14', '$2y$12$slWtGTNeFygt/LmNAXnsNO/CBEKtiaCtQqszeJe47CNKtkWemFEIa', 'HESTI ELI TRIASMORO', 'student', '2026-03-06 09:21:07', NULL, 1),
('cbf66bf923f6800066a97d2a19c84ee3ae54', '4.52.21.2.26', '$2y$12$UGT4JlKPwKcflDRMWpc6H.vfL72H39U9jpm9AMqcCD0hAzZ6DToxG', 'SAKINATUL KHOLIDA', 'student', '2026-03-06 09:22:20', NULL, 1),
('cc41f7e5f28c65d0d56246782e1229e1ccd1', '4.52.19.0.07', '$2y$12$I7DOUwnibe7xlz1ve8Vxfe26XQ6RTyOBlcrwBhuTcq6Hr5UQkf9/2', 'DIAH PUSPITA ANGGRAENI', 'student', '2026-03-06 09:21:04', NULL, 1),
('cc4bb43988ae098acfacdc60986b6a3d8119', '4.52.25.3.20', '$2y$12$KjeE6YMjlGVtxQXyIzyGsOL1xNF33og78KrmG5JHUoQkiNgSPVbVy', 'NIA DWI RAMADHANI', 'student', '2026-03-06 09:23:09', NULL, 1),
('ccacf0d086c3dbbc92faaf99b3a7da4de497', '4.52.21.0.07', '$2y$12$XtFdycyW4cgiRlGNQ6Agreae2vRIKmGiBh/k0kl1pvsUw0/6ayPry', 'CLARISSA HAPPY NUR VADITA', 'student', '2026-03-06 09:21:50', NULL, 1),
('ce03f708e47a8a8a4eb1cf3e317f8a2af460', '4.52.19.1.18', '$2y$12$WG9KmS1AUlxC33ztRg5Xae5rRhMVWSzPdxPAe4C00yWsBmMGwC3w.', 'MOHAMAD WIRA YUDA SAWEGA', 'student', '2026-03-06 09:21:20', NULL, 1),
('ce29e80934d469dced8fe265884c6af4b82f', '4.52.21.2.09', '$2y$12$Lc0EXU5nxFoscoSbdX7OieJrBudpine0Xxfjmjd28t9PWeOnUso0y', 'DESTIA RAHMA', 'student', '2026-03-06 09:22:14', NULL, 1),
('ceaf5a65511631987ec0e3b44b15f14c0c78', '4.52.21.1.04', '$2y$12$0mksfYnNuADTG/LRdDch5Od/3HrXBr4fZEGwERheNxivi2dWiyHwa', 'ARIELLA PUTRI WIDY AYUDITHA', 'student', '2026-03-06 09:22:01', NULL, 1),
('d0fa51050e662410a179cc30620e578c083b', '4.52.21.0.09', '$2y$12$.2fGfJKwHxucWAA/tj.QbeBPaKm5A/n2lpFv0yhTe1mzlrOLamote', 'DIMAS MAHENDRA', 'student', '2026-03-06 09:21:50', NULL, 1),
('d24a6329668b772f3d6cca91720b2991c7a7', '4.52.25.2.11', '$2y$12$09NCbQOfK2YzjsXaCKBttelSKqMyBHFDEOlVbJAjwyUPMIPCaCDeC', 'KALYCA ZAHRA AZALIA', 'student', '2026-03-06 09:22:54', NULL, 1),
('d3af966fd57bcfe2462b18eca3c67eeec852', '4.52.20.1.30', '$2y$12$8TyZvp50TUPsF0/Kg0.b0u.G.V8oJev76rNHKeH3awRH3AQ8B1WPK', 'ZAHRASEA FARAH ILYASA', 'student', '2026-03-06 09:21:47', NULL, 1),
('d4762130f410bbb3e80e58ed325a4be390ef', '4.52.21.2.29', '$2y$12$QjOuGBF/.Ejyd5fWWXnlN.Hb6oCf.P1FiP34cyHSx3cQeuJ/1oAiO', 'ULYA AMRINA ROSYADA', 'student', '2026-03-06 09:22:21', NULL, 1),
('d4f8da010e9ea42ac1b8c23ced3200390698', '4.52.25.3.23', '$2y$12$BSJPsSqX5dNKk4k7tlhYV.E5pUE2f8HcBTfWwYxKNPGQoHRMlKeAe', 'RIO HENDARTO', 'student', '2026-03-06 09:23:10', NULL, 1),
('d7a6d212e0a397629a0a48e6c6330b1ce640', '4.52.25.3.03', '$2y$12$tGceXb8zbUt8Bc6JZEAFpOxgfUepwPa.ikiWUg1XWf/oB0cNJjcQi', 'ASTI MARLINA FEBRIYANTI', 'student', '2026-03-06 09:23:02', NULL, 1),
('d87f63d30f6b666863ac61e40c73a553207b', '4.52.21.2.21', '$2y$12$IniQ71gBGBhLJxDZjNlK9ORjacg5r8hYrTE7h977wHv0z9QrBJ2.m', 'PAULINA KARTIKA AJENG LARASATI', 'student', '2026-03-06 09:22:18', NULL, 1),
('d9ce1cd7fb67d901924e456f24b78d72d993', '4.52.20.0.20', '$2y$12$hroSiK.3aV4ieMzPXSpHoeTLyn7RJt1oJbI1wR2SbvbXYw53dIR7m', 'NAILA DIVA PUTRI', 'student', '2026-03-06 09:21:32', NULL, 1),
('dad65b0d1bc56d2cb078db1fbdcabc36b449', '4.52.25.1.11', '$2y$12$umc0Y9hkpUoyuWfaiO8vTugw2iX3gGqQjPdusn0MC9iLjMluGBoAm', 'FATIHA RAKA CHAIRUL FIQRI', 'student', '2026-03-06 09:22:42', NULL, 1),
('dbe585c23f340f80d0091c9728b268ba8fe4', '4.52.25.0.04', '$2y$12$hkPFNjPFYP0qS4Q./.Qk9.3Qq50oxYrSXHhrQbySkqsYWwgMqYVxa', 'AMELIA NAJWA AZZAHRA', 'student', '2026-03-06 09:22:28', NULL, 1),
('dcc25db9986c410c8b7c779c9e6dff4010f6', '4.52.23.8.07', '$2y$12$ghUTyXYgv/lhqjML.dr/ZOcHyqjPm9WQobSg5zg0IocBxDvNNcCxO', 'PUTRA HOFNI BUANG KARUAPI', 'student', '2026-03-06 09:22:24', NULL, 1),
('dd6a154b47906094416971cea84efe54fbda', '4.52.21.1.28', '$2y$12$/8ZwN8wzBT396T5ESyOLUeRde7h/EHFFxpaRE72wVD3f5lOgZojw2', 'TALITHA SAHDA', 'student', '2026-03-06 09:22:09', NULL, 1),
('ddb3c9165f8f409091d7dcc8fbe796c02a8c', '4.52.25.1.28', '$2y$12$m7TDujtXruNBZek1csyuEO6Y5ffUW9rY4qvx4ikVRiRJLuQlIXZ5q', 'TASYA LATIFA ZAHRA', 'student', '2026-03-06 09:22:49', NULL, 1),
('de9de0418ea3399f960f4fdbb7bf93818bbf', '4.52.25.3.13', '$2y$12$7xqw4.fwd5aOBMdMQuf0wOyVwhjiLrOifRAarwwM9YmJ72Gf5eJAO', 'MARCHA NABILA PUTRI', 'student', '2026-03-06 09:23:06', NULL, 1),
('e08b504a486aad0c1d617eaa632f5aae43b0', '4.52.21.1.14', '$2y$12$AYv1NyZfnuE0eUL9QYShEuw8CHcfEHXd6PevdImATHv3zFp.gF2BS', 'HERSA SINTIA PRAMUDYA WARDANI', 'student', '2026-03-06 09:22:04', NULL, 1),
('e18126e5079a044f4d8ae8378ed8c7d1ca25', '4.52.20.0.16', '$2y$12$o5OsnhQMUnF.2tBtfA6WcuXs8c38nOQsIc6gojMP2LGAEft7qcQ2O', 'MILATI PUJA KESUMA', 'student', '2026-03-06 09:21:31', NULL, 1),
('e236e69d1c56ff20aea987b50887797d35cf', '4.52.20.1.11', '$2y$12$uqVSIxbQ3NCrbumzyM2S4Oecb.U5jBRV60l1V3KHV7CEvye/uz2i.', 'KALISTA KUNTI PRAMESTI', 'student', '2026-03-06 09:21:40', NULL, 1),
('e444981acc935a1ca3ceacbdfcecebb24fc4', '4.52.20.1.12', '$2y$12$m2yTRU8Jz/nz49lRnuUhyuVdnHsZPpqJ02ppSRddcpO1hHiTh6DH.', 'LINTANG SWARESKA SARASWATI', 'student', '2026-03-06 09:21:41', NULL, 1),
('e4d0fd98fd3337307adf0d1d229056153447', '4.52.25.1.23', '$2y$12$UQYKK//EZmZ.CdPBL.1JWOW2saceT4lDfnTfJDipXzjBi9Ob.7DNq', 'RARA AMELLIA', 'student', '2026-03-06 09:22:47', NULL, 1),
('e7243ae09bf645db056024a6fd14aece737b', '4.52.21.1.22', '$2y$12$INeIxwkTJM/AZ9XRDdkT/uAaUnjjI4V6dfnq1zvsVscyl1KwdvXHG', 'NURUL FATAKHILLAH', 'student', '2026-03-06 09:22:07', NULL, 1),
('e76689ae6dcf0bb62edad0bce01e398bdc93', '4.52.25.1.24', '$2y$12$yp76.MU5RvoUb2oLpI4Nzeb7KkiHbH.BDiH1avAIfyktiDeE8joGG', 'SALMA NADIYA FENANI', 'student', '2026-03-06 09:22:47', NULL, 1),
('e7705003c211b7ecebca46f2fd522f3dab79', '4.52.25.1.07', '$2y$12$qi2FHCEt5SzRXMjYO9Xer.Jz6JbKC3uXmc5Wr9OFKKOs8NcBkMAXu', 'DAVINA AURA DIOLITA', 'student', '2026-03-06 09:22:41', NULL, 1),
('e9456c26ac6af0aadf20c6693b2938707aa5', '4.52.19.0.05', '$2y$12$j3B3r8hVcSMD/9.SVtkfyuw4TojEkcifC9OJj05t2DVfXEDEl76FO', 'DELLA ANDRIANI', 'student', '2026-03-09 08:56:22', NULL, 1),
('ea01242711e02c747f85ae7bf2296fb1b5fc', '45219006', '$2y$12$u0RQUYCa8k/wDD2otEHAO.0hO/qG8TylXnWauYUdV33MfOfPY3aXW', 'DIAH LARASATI', 'student', '2026-03-06 09:27:09', NULL, 1),
('ea053e8f64781c22983efc280e8127f8d389', '4.52.21.1.21', '$2y$12$t4P4Jm4O9l2gbuV8/W5otOhL1HBnI/Ghp8HU6iJVqnPtD1ODSwirO', 'NUR KHASANAH', 'student', '2026-03-06 09:22:07', NULL, 1),
('ea3e30a6c0b8217917c95fe499d8dd7dc5ba', '4.52.21.0.30', '$2y$12$0kjCmrLzm.LWEFvESAe5ReOacoOk/9hDf8FdIvp82q2ql0kKOopCK', 'VIA OKTAFIANI', 'student', '2026-03-06 09:21:59', NULL, 1),
('eb226ec1c061e7aa891fbf4a47121c81807d', '4.52.19.0.28', '$2y$12$s6Xwd8CkY9Jdpe0fca.Nyeh7axO4rAE/Li0EsK5QPmOT1Sd2aLuoi', 'SHERLY RAMADHANI', 'student', '2026-03-06 09:21:12', NULL, 1),
('ec2e675cba2ae62bbdc06d270dcd74dba5dc', '4.52.19.1.14', '$2y$12$iTnim49ehgoRKG5/lbKReOJC9zSgFPlwrWKtjRrpWHsvxtXnVFOt.', 'JOIS AKSA GANEO', 'student', '2026-03-06 09:21:18', NULL, 1),
('ec58465dd826cec9bff326596eb1ff27df23', '4.52.25.1.06', '$2y$12$ySS8IA/IyyBu8aMO2PJBXuNz4Sto6.f2c4YVLOoVzWMN2nDnKX2l6', 'CINTA LISTIA SALSABILA', 'student', '2026-03-06 09:22:40', NULL, 1),
('edb3ff8c4fcc56eaa68a177623af97ffd08e', '4.52.25.3.05', '$2y$12$wRoSkGftCiFA5HvziXcb3e4dGqct0M.IMcCbvMaoBLMbuGbfw3yHG', 'AZZAHRA PUTRI NURHIDAYAT', 'student', '2026-03-06 09:23:02', NULL, 1),
('ee37d4a09ab0e34d0d5284eb90370eefee98', '4.52.19.1.23', '$2y$12$l9IByjPPTSCVlPMW5L0w4e1qFMRclep4vesiNOGxeu8dvWKgFArT6', 'PUTRI SEKARLANGIT', 'student', '2026-03-06 09:21:22', NULL, 1),
('efd646fcd9fcab281130e2ea17a62955463c', '4.52.19.1.03', '$2y$12$uleQ2v3YK/YiU20Mg0mwfebVpAy7avPGUfrjktxHI8Tc669Pupxxq', 'ARDIANITA NUR INDAH SARI', 'student', '2026-03-06 09:21:14', NULL, 1),
('f001c76310e4ef920c9d5a982ac0f200fc31', '4.52.20.1.23', '$2y$12$yZbTVQzFswSEDP4Ozl.bBOuBv.Ctg.SVSKQpiz1ThaQ5mUCLttsdq', 'RIZKY TRI FEBRIAN', 'student', '2026-03-06 09:21:44', NULL, 1),
('f067f60be0ade0d1a0e308931a2b51d5b588', '4.52.21.2.05', '$2y$12$kY6Nw10wyOdX2ozWduSAHe.J97.IEGWlI.z1TNhpPlJtOPiLTEbbq', 'ARVIA NUR AROFAH', 'student', '2026-03-06 09:22:12', NULL, 1),
('f0efea0b5d6fd06b4ec22a967bd31adb9eb7', '4.52.25.2.01', '$2y$12$9y6zRz6NBmsfwUyz4PtvOejsFeuXVqS5X0xPkEQbA9V/3Op9I07Wa', 'ALIFIA MAHARANI', 'student', '2026-03-06 09:22:50', NULL, 1),
('f1dd1613f4a439f8862e7a1832aae8510ba9', '4.52.25.0.28', '$2y$12$WnOKnlRM23k5kec..UL/GuGwHIc7N.RZ2i2enniC166Zq0f/ML6Ka', 'VIO ANTHAREZA', 'student', '2026-03-06 09:22:37', NULL, 1),
('f212c489f54af700263976982501e4f36f8d', '4.52.20.1.28', '$2y$12$axN55xnuq1eNIkukxHgCQeMUV1WjLFz89ymcbWan4Ji2fjbv2UYY.', 'TARA AYUNINGRUM', 'student', '2026-03-06 09:21:46', NULL, 1),
('f30319a7979bba8a05717bde9cbe6810e4f8', '4.52.25.0.02', '$2y$12$ahc8SK.oY7OWFGyLFQPuwu3TSBp4PHV2qQEXcRWMzBHpzy4Opia7y', 'AFIFA TIARA RAHMADHANTY', 'student', '2026-03-06 09:22:27', NULL, 1),
('f4ff7d3ea2f3d4f817ca0b4a31b2c3410761', '4.52.21.0.26', '$2y$12$v4kdwnxD48dTJmteTz8vwepMsJKiuzINq/wpi91/l1KzmXYhpYmlO', 'SALMA AYA SOFIA', 'student', '2026-03-06 09:21:57', NULL, 1),
('f56d586856d0812bff60c82137d95fe9c4d6', '4.52.20.1.10', '$2y$12$svhPh95Xjch.VyBxmL84R.VfBI4YKKlNHvyPJDSucqs9kOGDdpeWS', 'FICRYNA SHULCHA', 'student', '2026-03-06 09:21:40', NULL, 1),
('f674c2974241a8d2d0d9d9a79953901b81f4', '4.52.21.0.11', '$2y$12$kqRI/SRCob/GwfT9kvBi6O999tq1Y5Z7qtEI68Ngo478mqoF9rldC', 'ELSA MAHARANI KUMAAT', 'student', '2026-03-06 09:21:51', NULL, 1),
('f78982d4843744289c0f76b4c3435df7bdd5', '4.52.25.1.17', '$2y$12$DMnh1.6YFloEfjzTUa/Toujo/KWVGMLHuON/MsOyByHUjgJelMw0O', 'MUHAMMAD RAFA MAFTUHIN', 'student', '2026-03-06 09:22:45', NULL, 1),
('f8f2677d2e122ed324e8d15ab98c080d5d8c', '4.52.19.1.10', '$2y$12$jEtJLRcM/LycWcwusg7/suUy7C2uK4H8f7wGJPw6z8DfjyzoqOSpG', 'FATIMAH ZAKIYATUL FITRIYAH', 'student', '2026-03-06 09:21:16', NULL, 1),
('fb4c057eae2eac2be2ea69177660efa5143f', '4.52.20.1.21', '$2y$12$L3.L5WivHc/nsecmW0Ay.uRUl1YsGyZ6/B8OsaemqRjhCjhRpOpG6', 'RAMA TAUFIQURROHMAN', 'student', '2026-03-06 09:21:44', NULL, 1),
('fb85a11dc3178e93c0c0aa9ea5289e91cdd2', '4.52.19.0.29', '$2y$12$J311jikhNSF7z.UV8oqWtOytZvzimLKwipanKtq69dkTsNBZjNwAG', 'SHINTA SUGIARTI', 'student', '2026-03-06 09:21:12', NULL, 1),
('fbb86b387e60df2be1568f156be5dfc548cc', '4.52.19.1.26', '$2y$12$H2tzlosADNxm.KX9B.RyPezYzDCvcGAOMMkhjVp1AlicbzWmHj64C', 'SOPHIA JULIANTI NISA', 'student', '2026-03-06 09:21:23', NULL, 1),
('fbff0ce75e2d830a8c618c2b723e3006c044', '4.52.19.1.27', '$2y$12$WzH7zceYvRKqh9Tt3H/TGu/bP9iFciJCEB3p0.d7pXW54nzTjQeH.', 'SYIFA FADILAH ARIYANTO', 'student', '2026-03-06 09:21:23', NULL, 1),
('fde1bd4e341af0c2c6426c22ded084ab91b7', '4.52.21.1.25', '$2y$12$M9UeE2LdolgcU.lbXElBBeOKYuDt7bpSKXMF8XGCWgOjMrcS.DLoa', 'SAFIRA EKA FARIHA', 'student', '2026-03-06 09:22:08', NULL, 1),
('fe6fd8693793d01bfd930497c6dd826bb3ce', '4.52.20.1.05', '$2y$12$PAjI.4YwcTdTP4Kahzo5Lepiaa037TV6akuC8Tx2OnKYwHUkGa6Jm', 'ARVIKA OKTARINA JAYANTI', 'student', '2026-03-06 09:21:38', NULL, 1);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_alumni_overview`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_alumni_overview` (
`id` varchar(36)
,`nim` varchar(20)
,`nama` varchar(100)
,`tahun_lulus` int(11)
,`email` varchar(100)
,`no_hp` varchar(20)
,`career_status` enum('working','job_seeking','entrepreneur','further_study')
,`tahun_pengisian` int(11)
,`total_achievements` bigint(21)
);

-- --------------------------------------------------------

--
-- Stand-in struktur untuk tampilan `v_student_achievements_summary`
-- (Lihat di bawah untuk tampilan aktual)
--
CREATE TABLE `v_student_achievements_summary` (
`id` varchar(36)
,`nim` varchar(20)
,`nama` varchar(100)
,`status` enum('active','on_leave','dropout','alumni')
,`total_achievements` bigint(21)
,`total_categories` bigint(21)
,`verified_achievements` bigint(21)
,`latest_achievement_date` date
);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `achievements_legacy_backup_20260306155721`
--
ALTER TABLE `achievements_legacy_backup_20260306155721`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_subcategory` (`subcategory`),
  ADD KEY `idx_achievement_type` (`achievement_type`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_tanggal` (`tanggal` DESC),
  ADD KEY `idx_student_category` (`student_id`,`category`);

--
-- Indeks untuk tabel `achievement_attachments_legacy_backup_20260306155721`
--
ALTER TABLE `achievement_attachments_legacy_backup_20260306155721`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_achievement_id` (`achievement_id`),
  ADD KEY `idx_achievement_attachments_deleted_at` (`deleted_at`),
  ADD KEY `idx_achievement_attachments_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `active_students_semester_stats`
--
ALTER TABLE `active_students_semester_stats`
  ADD PRIMARY KEY (`tahun`,`semester`),
  ADD KEY `idx_tahun` (`tahun`);

--
-- Indeks untuk tabel `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `chart_sync_log`
--
ALTER TABLE `chart_sync_log`
  ADD PRIMARY KEY (`menu_section`),
  ADD KEY `idx_last_synced` (`last_synced_at`);

--
-- Indeks untuk tabel `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `closed_by` (`closed_by`),
  ADD KEY `idx_evaluations_status` (`status`),
  ADD KEY `idx_evaluations_period` (`start_at`,`end_at`),
  ADD KEY `idx_evaluations_creator` (`created_by`),
  ADD KEY `idx_evaluations_deleted_at` (`deleted_at`),
  ADD KEY `idx_evaluations_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `evaluation_aspects`
--
ALTER TABLE `evaluation_aspects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `idx_aspects_active_order` (`is_active`,`sort_order`);

--
-- Indeks untuk tabel `evaluation_invitations`
--
ALTER TABLE `evaluation_invitations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `access_token` (`access_token`),
  ADD UNIQUE KEY `unique_evaluation_student` (`evaluation_id`,`student_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_invitations_evaluation` (`evaluation_id`),
  ADD KEY `idx_invitations_student` (`student_id`),
  ADD KEY `idx_invitations_user_id` (`user_id`),
  ADD KEY `idx_invitations_submitted` (`submitted_at`),
  ADD KEY `idx_invitations_reminder_due` (`submitted_at`,`last_sent_at`);

--
-- Indeks untuk tabel `evaluation_responses`
--
ALTER TABLE `evaluation_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_response_invitation` (`invitation_id`),
  ADD UNIQUE KEY `unique_response_evaluation_student` (`evaluation_id`,`student_id`),
  ADD KEY `idx_responses_evaluation` (`evaluation_id`),
  ADD KEY `idx_responses_student` (`student_id`),
  ADD KEY `idx_responses_match` (`major_job_match`),
  ADD KEY `idx_responses_submitted` (`submitted_at` DESC);

--
-- Indeks untuk tabel `evaluation_response_ratings`
--
ALTER TABLE `evaluation_response_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_response_aspect` (`response_id`,`aspect_id`),
  ADD KEY `idx_ratings_aspect` (`aspect_id`),
  ADD KEY `idx_ratings_score` (`score`),
  ADD KEY `idx_ratings_aspect_score` (`aspect_id`,`score`);

--
-- Indeks untuk tabel `evaluation_token_blacklist`
--
ALTER TABLE `evaluation_token_blacklist`
  ADD PRIMARY KEY (`token`),
  ADD KEY `idx_blacklist_evaluation` (`evaluation_id`);

--
-- Indeks untuk tabel `export_logs`
--
ALTER TABLE `export_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin` (`admin_id`),
  ADD KEY `idx_menu_section` (`menu_section`),
  ADD KEY `idx_exported_at` (`exported_at` DESC);

--
-- Indeks untuk tabel `menu_active_students_records`
--
ALTER TABLE `menu_active_students_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_job_relevance_records`
--
ALTER TABLE `menu_job_relevance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_publications_records`
--
ALTER TABLE `menu_publications_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_research_outputs_records`
--
ALTER TABLE `menu_research_outputs_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_student_achievements_records`
--
ALTER TABLE `menu_student_achievements_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`),
  ADD KEY `idx_snapshot_nim` (`snapshot_nim`);

--
-- Indeks untuk tabel `menu_student_products_records`
--
ALTER TABLE `menu_student_products_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_study_period_records`
--
ALTER TABLE `menu_study_period_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_user_satisfaction_records`
--
ALTER TABLE `menu_user_satisfaction_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_waiting_time_records`
--
ALTER TABLE `menu_waiting_time_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `menu_work_coverage_records`
--
ALTER TABLE `menu_work_coverage_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_source` (`source_table`,`source_id`),
  ADD KEY `idx_deleted` (`deleted_at`),
  ADD KEY `idx_tahun` (`tahun_pelaporan`);

--
-- Indeks untuk tabel `prestasi_import_logs`
--
ALTER TABLE `prestasi_import_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_import_logs_kategori` (`kategori`),
  ADD KEY `idx_prestasi_import_logs_created_at` (`created_at` DESC),
  ADD KEY `idx_prestasi_import_logs_uploaded_by` (`uploaded_by`);

--
-- Indeks untuk tabel `prestasi_import_log_details`
--
ALTER TABLE `prestasi_import_log_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_import_log_details_import_log_id` (`import_log_id`),
  ADD KEY `idx_prestasi_import_log_details_status` (`status`);

--
-- Indeks untuk tabel `prestasi_kekayaan_intelektual`
--
ALTER TABLE `prestasi_kekayaan_intelektual`
  ADD PRIMARY KEY (`id_kekayaan_intelektual`),
  ADD UNIQUE KEY `uq_prestasi_ki_nomor_pendaftaran` (`nomor_pendaftaran`),
  ADD UNIQUE KEY `uq_prestasi_ki_nomor_sertifikat` (`nomor_sertifikat`),
  ADD UNIQUE KEY `uq_prestasi_ki_fallback` (`id_mahasiswa`,`judul_ki_norm`,`jenis_ki`,`tahun_pengajuan`),
  ADD KEY `idx_prestasi_ki_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_ki_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_kekayaan_intelektual_attachments`
--
ALTER TABLE `prestasi_kekayaan_intelektual_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_ki_att_fk` (`id_kekayaan_intelektual`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_lomba`
--
ALTER TABLE `prestasi_lomba`
  ADD PRIMARY KEY (`id_lomba`),
  ADD UNIQUE KEY `uq_prestasi_lomba` (`id_mahasiswa`,`nama_lomba_norm`,`tingkat`,`tanggal_mulai`),
  ADD KEY `idx_prestasi_lomba_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_lomba_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_lomba_attachments`
--
ALTER TABLE `prestasi_lomba_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_lomba_att_fk` (`id_lomba`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_magang`
--
ALTER TABLE `prestasi_magang`
  ADD PRIMARY KEY (`id_magang`),
  ADD UNIQUE KEY `uq_prestasi_magang` (`id_mahasiswa`,`nama_perusahaan_norm`,`posisi_norm`,`tanggal_mulai`),
  ADD KEY `idx_prestasi_magang_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_magang_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_magang_attachments`
--
ALTER TABLE `prestasi_magang_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_magang_att_fk` (`id_magang`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_migration_skipped_logs`
--
ALTER TABLE `prestasi_migration_skipped_logs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_prestasi_migration_skipped_legacy_id` (`legacy_achievement_id`);

--
-- Indeks untuk tabel `prestasi_organisasi`
--
ALTER TABLE `prestasi_organisasi`
  ADD PRIMARY KEY (`id_organisasi`),
  ADD UNIQUE KEY `uq_prestasi_organisasi` (`id_mahasiswa`,`nama_organisasi_norm`,`jabatan_norm`,`tanggal_mulai`),
  ADD KEY `idx_prestasi_organisasi_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_organisasi_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_organisasi_attachments`
--
ALTER TABLE `prestasi_organisasi_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_organisasi_att_fk` (`id_organisasi`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_pengembangan_diri`
--
ALTER TABLE `prestasi_pengembangan_diri`
  ADD PRIMARY KEY (`id_pengembangan_diri`),
  ADD UNIQUE KEY `uq_prestasi_pengembangan` (`id_mahasiswa`,`nama_program_norm`,`jenis_program`,`tanggal_mulai`),
  ADD KEY `idx_prestasi_pengembangan_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_pengembangan_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_pengembangan_diri_attachments`
--
ALTER TABLE `prestasi_pengembangan_diri_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_pengembangan_att_fk` (`id_pengembangan_diri`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_portofolio`
--
ALTER TABLE `prestasi_portofolio`
  ADD PRIMARY KEY (`id_portofolio`),
  ADD UNIQUE KEY `uq_prestasi_portofolio` (`id_mahasiswa`,`mata_kuliah_norm`,`judul_proyek_norm`,`semester`,`tahun`),
  ADD KEY `idx_prestasi_portofolio_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_portofolio_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_portofolio_attachments`
--
ALTER TABLE `prestasi_portofolio_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_portofolio_att_fk` (`id_portofolio`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_produk_mahasiswa`
--
ALTER TABLE `prestasi_produk_mahasiswa`
  ADD PRIMARY KEY (`id_produk_mahasiswa`),
  ADD UNIQUE KEY `uq_prestasi_produk_mahasiswa` (`id_mahasiswa`,`nama_produk_norm`,`kategori_produk`,`tanggal`),
  ADD KEY `idx_prestasi_produk_mahasiswa_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_produk_mahasiswa_date` (`tanggal` DESC),
  ADD KEY `idx_prestasi_produk_mahasiswa_category` (`category`,`subcategory`),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_produk_mahasiswa_attachments`
--
ALTER TABLE `prestasi_produk_mahasiswa_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_produk_mahasiswa_att_fk` (`id_produk_mahasiswa`),
  ADD KEY `idx_prestasi_produk_mahasiswa_att_deleted_at` (`deleted_at`),
  ADD KEY `idx_prestasi_produk_mahasiswa_att_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_publikasi`
--
ALTER TABLE `prestasi_publikasi`
  ADD PRIMARY KEY (`id_publikasi`),
  ADD UNIQUE KEY `uq_prestasi_publikasi` (`id_mahasiswa`,`judul_norm`,`jenis_publikasi`,`tahun_terbit`,`nama_jurnal_konferensi_norm`),
  ADD KEY `idx_prestasi_publikasi_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_publikasi_date` (`tanggal` DESC),
  ADD KEY `idx_prestasi_publikasi_category` (`category`,`subcategory`),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_publikasi_attachments`
--
ALTER TABLE `prestasi_publikasi_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_publikasi_att_fk` (`id_publikasi`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_seminar`
--
ALTER TABLE `prestasi_seminar`
  ADD PRIMARY KEY (`id_seminar`),
  ADD UNIQUE KEY `uq_prestasi_seminar_publication` (`id_mahasiswa`,`judul_publikasi_norm`,`level_seminar`,`jenis_perolehan`,`tanggal_publikasi`),
  ADD KEY `idx_prestasi_seminar_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_seminar_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_seminar_attachments`
--
ALTER TABLE `prestasi_seminar_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_seminar_att_fk` (`id_seminar`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `prestasi_wirausaha`
--
ALTER TABLE `prestasi_wirausaha`
  ADD PRIMARY KEY (`id_wirausaha`),
  ADD UNIQUE KEY `uq_prestasi_wirausaha` (`id_mahasiswa`,`nama_usaha_norm`,`lokasi_norm`,`tahun_mulai`),
  ADD KEY `idx_prestasi_wirausaha_student` (`id_mahasiswa`),
  ADD KEY `idx_prestasi_wirausaha_date` (`tanggal` DESC),
  ADD KEY `source_import_log_id` (`source_import_log_id`);

--
-- Indeks untuk tabel `prestasi_wirausaha_attachments`
--
ALTER TABLE `prestasi_wirausaha_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_prestasi_wirausaha_att_fk` (`id_wirausaha`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `record_change_logs`
--
ALTER TABLE `record_change_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_menu_section` (`menu_section`),
  ADD KEY `idx_record` (`menu_section`,`record_id`),
  ADD KEY `idx_admin` (`admin_id`),
  ADD KEY `idx_changed_at` (`changed_at` DESC);

--
-- Indeks untuk tabel `research_output_backfill_log`
--
ALTER TABLE `research_output_backfill_log`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_research_output_backfill_source` (`source_table`,`source_achievement_id`),
  ADD KEY `idx_research_output_backfill_status` (`status`);

--
-- Indeks untuk tabel `satisfaction_form_responses`
--
ALTER TABLE `satisfaction_form_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_satisfaction_response_invitation` (`invitation_id`),
  ADD KEY `idx_satisfaction_responses_template` (`template_id`),
  ADD KEY `idx_satisfaction_responses_submitted` (`submitted_at` DESC);

--
-- Indeks untuk tabel `satisfaction_form_templates`
--
ALTER TABLE `satisfaction_form_templates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_satisfaction_templates_deleted` (`deleted_at`),
  ADD KEY `idx_satisfaction_templates_default` (`is_default`),
  ADD KEY `idx_satisfaction_templates_active` (`is_active`),
  ADD KEY `idx_satisfaction_templates_updated` (`updated_at` DESC);

--
-- Indeks untuk tabel `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nim` (`nim`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `login_email` (`login_email`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_nim` (`nim`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tahun_lulus` (`tahun_lulus`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_login_email` (`login_email`),
  ADD KEY `idx_pending_login_email` (`pending_login_email`),
  ADD KEY `idx_email_verification_token_hash` (`email_verification_token_hash`),
  ADD KEY `idx_email_verification_otp_hash` (`email_verification_otp_hash`),
  ADD KEY `idx_status_tahun` (`status`,`tahun_lulus`),
  ADD KEY `idx_students_eval_working_filter` (`status`,`user_id`,`tahun_masuk`,`tahun_lulus`),
  ADD KEY `idx_students_pending_login_email` (`pending_login_email`),
  ADD KEY `idx_deleted_by` (`deleted_by`);

--
-- Indeks untuk tabel `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invitation_id` (`invitation_id`),
  ADD KEY `idx_notifications_student` (`student_id`),
  ADD KEY `idx_notifications_read` (`student_id`,`is_read`),
  ADD KEY `idx_notifications_created` (`created_at` DESC),
  ADD KEY `idx_notifications_evaluation` (`evaluation_id`);

--
-- Indeks untuk tabel `tracer_study`
--
ALTER TABLE `tracer_study`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD KEY `idx_career_status` (`career_status`),
  ADD KEY `idx_tahun_pengisian` (`tahun_pengisian`),
  ADD KEY `idx_student_id` (`student_id`),
  ADD KEY `idx_tracer_career_student` (`career_status`,`student_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_users_role_active_id` (`role`,`is_active`,`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `research_output_backfill_log`
--
ALTER TABLE `research_output_backfill_log`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Struktur untuk view `achievements`
--
DROP TABLE IF EXISTS `achievements`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `achievements`  AS SELECT `p`.`id_publikasi` AS `id`, `p`.`id_mahasiswa` AS `student_id`, `p`.`category` AS `category`, `p`.`subcategory` AS `subcategory`, `p`.`achievement_type` AS `achievement_type`, `p`.`title` AS `title`, `p`.`description` AS `description`, `p`.`tanggal` AS `tanggal`, `p`.`lokasi` AS `lokasi`, `p`.`penyelenggara` AS `penyelenggara`, `p`.`tingkat` AS `tingkat`, `p`.`peringkat` AS `peringkat`, `p`.`verified` AS `verified`, `p`.`created_at` AS `created_at`, `p`.`updated_at` AS `updated_at` FROM `prestasi_publikasi` AS `p`union all select `p`.`id_portofolio` AS `id_portofolio`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_portofolio` `p` union all select `p`.`id_lomba` AS `id_lomba`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_lomba` `p` union all select `p`.`id_kekayaan_intelektual` AS `id_kekayaan_intelektual`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_kekayaan_intelektual` `p` union all select `p`.`id_magang` AS `id_magang`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_magang` `p` union all select `p`.`id_produk_mahasiswa` AS `id_produk_mahasiswa`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_produk_mahasiswa` `p` union all select `p`.`id_wirausaha` AS `id_wirausaha`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_wirausaha` `p` union all select `p`.`id_pengembangan_diri` AS `id_pengembangan_diri`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_pengembangan_diri` `p` union all select `p`.`id_organisasi` AS `id_organisasi`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_organisasi` `p` union all select `p`.`id_seminar` AS `id_seminar`,`p`.`id_mahasiswa` AS `id_mahasiswa`,`p`.`category` AS `category`,`p`.`subcategory` AS `subcategory`,`p`.`achievement_type` AS `achievement_type`,`p`.`title` AS `title`,`p`.`description` AS `description`,`p`.`tanggal` AS `tanggal`,`p`.`lokasi` AS `lokasi`,`p`.`penyelenggara` AS `penyelenggara`,`p`.`tingkat` AS `tingkat`,`p`.`peringkat` AS `peringkat`,`p`.`verified` AS `verified`,`p`.`created_at` AS `created_at`,`p`.`updated_at` AS `updated_at` from `prestasi_seminar` `p`  ;

-- --------------------------------------------------------

--
-- Struktur untuk view `achievement_attachments`
--
DROP TABLE IF EXISTS `achievement_attachments`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `achievement_attachments`  AS SELECT `a`.`id` AS `id`, `a`.`id_publikasi` AS `achievement_id`, `a`.`file_name` AS `file_name`, `a`.`file_type` AS `file_type`, `a`.`file_size` AS `file_size`, `a`.`file_path` AS `file_path`, `a`.`uploaded_at` AS `uploaded_at` FROM `prestasi_publikasi_attachments` AS `a` WHERE `a`.`deleted_at` is nullunion allselect `a`.`id` AS `id`,`a`.`id_portofolio` AS `id_portofolio`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_portofolio_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_lomba` AS `id_lomba`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_lomba_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_kekayaan_intelektual` AS `id_kekayaan_intelektual`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_kekayaan_intelektual_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_magang` AS `id_magang`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_magang_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_produk_mahasiswa` AS `id_produk_mahasiswa`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_produk_mahasiswa_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_wirausaha` AS `id_wirausaha`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_wirausaha_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_pengembangan_diri` AS `id_pengembangan_diri`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_pengembangan_diri_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_organisasi` AS `id_organisasi`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_organisasi_attachments` `a` where `a`.`deleted_at` is null union all select `a`.`id` AS `id`,`a`.`id_seminar` AS `id_seminar`,`a`.`file_name` AS `file_name`,`a`.`file_type` AS `file_type`,`a`.`file_size` AS `file_size`,`a`.`file_path` AS `file_path`,`a`.`uploaded_at` AS `uploaded_at` from `prestasi_seminar_attachments` `a` where `a`.`deleted_at` is null  ;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_alumni_overview`
--
DROP TABLE IF EXISTS `v_alumni_overview`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_alumni_overview`  AS SELECT `s`.`id` AS `id`, `s`.`nim` AS `nim`, `s`.`nama` AS `nama`, `s`.`tahun_lulus` AS `tahun_lulus`, `s`.`email` AS `email`, `s`.`no_hp` AS `no_hp`, `t`.`career_status` AS `career_status`, `t`.`tahun_pengisian` AS `tahun_pengisian`, count(distinct `a`.`id`) AS `total_achievements` FROM ((`students` `s` left join `tracer_study` `t` on(`s`.`id` = `t`.`student_id`)) left join `achievements` `a` on(`s`.`id` = `a`.`student_id`)) WHERE `s`.`status` = 'alumni' GROUP BY `s`.`id`, `s`.`nim`, `s`.`nama`, `s`.`tahun_lulus`, `s`.`email`, `s`.`no_hp`, `t`.`career_status`, `t`.`tahun_pengisian` ;

-- --------------------------------------------------------

--
-- Struktur untuk view `v_student_achievements_summary`
--
DROP TABLE IF EXISTS `v_student_achievements_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_student_achievements_summary`  AS SELECT `s`.`id` AS `id`, `s`.`nim` AS `nim`, `s`.`nama` AS `nama`, `s`.`status` AS `status`, count(`a`.`id`) AS `total_achievements`, count(distinct `a`.`category`) AS `total_categories`, count(case when `a`.`verified` = 1 then 1 else NULL end) AS `verified_achievements`, max(`a`.`tanggal`) AS `latest_achievement_date` FROM (`students` `s` left join `achievements` `a` on(`s`.`id` = `a`.`student_id`)) GROUP BY `s`.`id`, `s`.`nim`, `s`.`nama`, `s`.`status` ;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `achievements_legacy_backup_20260306155721`
--
ALTER TABLE `achievements_legacy_backup_20260306155721`
  ADD CONSTRAINT `achievements_legacy_backup_20260306155721_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `achievement_attachments_legacy_backup_20260306155721`
--
ALTER TABLE `achievement_attachments_legacy_backup_20260306155721`
  ADD CONSTRAINT `achievement_attachments_legacy_backup_20260306155721_ibfk_1` FOREIGN KEY (`achievement_id`) REFERENCES `achievements_legacy_backup_20260306155721` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `evaluation_invitations`
--
ALTER TABLE `evaluation_invitations`
  ADD CONSTRAINT `evaluation_invitations_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_invitations_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_invitations_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `evaluation_responses`
--
ALTER TABLE `evaluation_responses`
  ADD CONSTRAINT `evaluation_responses_ibfk_1` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_responses_ibfk_2` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`),
  ADD CONSTRAINT `evaluation_responses_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `evaluation_response_ratings`
--
ALTER TABLE `evaluation_response_ratings`
  ADD CONSTRAINT `evaluation_response_ratings_ibfk_1` FOREIGN KEY (`response_id`) REFERENCES `evaluation_responses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluation_response_ratings_ibfk_2` FOREIGN KEY (`aspect_id`) REFERENCES `evaluation_aspects` (`id`);

--
-- Ketidakleluasaan untuk tabel `prestasi_import_logs`
--
ALTER TABLE `prestasi_import_logs`
  ADD CONSTRAINT `prestasi_import_logs_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `prestasi_import_log_details`
--
ALTER TABLE `prestasi_import_log_details`
  ADD CONSTRAINT `prestasi_import_log_details_ibfk_1` FOREIGN KEY (`import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_kekayaan_intelektual`
--
ALTER TABLE `prestasi_kekayaan_intelektual`
  ADD CONSTRAINT `prestasi_kekayaan_intelektual_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_kekayaan_intelektual_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_kekayaan_intelektual_attachments`
--
ALTER TABLE `prestasi_kekayaan_intelektual_attachments`
  ADD CONSTRAINT `prestasi_kekayaan_intelektual_attachments_ibfk_1` FOREIGN KEY (`id_kekayaan_intelektual`) REFERENCES `prestasi_kekayaan_intelektual` (`id_kekayaan_intelektual`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_lomba`
--
ALTER TABLE `prestasi_lomba`
  ADD CONSTRAINT `prestasi_lomba_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_lomba_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_lomba_attachments`
--
ALTER TABLE `prestasi_lomba_attachments`
  ADD CONSTRAINT `prestasi_lomba_attachments_ibfk_1` FOREIGN KEY (`id_lomba`) REFERENCES `prestasi_lomba` (`id_lomba`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_magang`
--
ALTER TABLE `prestasi_magang`
  ADD CONSTRAINT `prestasi_magang_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_magang_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_magang_attachments`
--
ALTER TABLE `prestasi_magang_attachments`
  ADD CONSTRAINT `prestasi_magang_attachments_ibfk_1` FOREIGN KEY (`id_magang`) REFERENCES `prestasi_magang` (`id_magang`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_organisasi`
--
ALTER TABLE `prestasi_organisasi`
  ADD CONSTRAINT `prestasi_organisasi_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_organisasi_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_organisasi_attachments`
--
ALTER TABLE `prestasi_organisasi_attachments`
  ADD CONSTRAINT `prestasi_organisasi_attachments_ibfk_1` FOREIGN KEY (`id_organisasi`) REFERENCES `prestasi_organisasi` (`id_organisasi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_pengembangan_diri`
--
ALTER TABLE `prestasi_pengembangan_diri`
  ADD CONSTRAINT `prestasi_pengembangan_diri_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_pengembangan_diri_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_pengembangan_diri_attachments`
--
ALTER TABLE `prestasi_pengembangan_diri_attachments`
  ADD CONSTRAINT `prestasi_pengembangan_diri_attachments_ibfk_1` FOREIGN KEY (`id_pengembangan_diri`) REFERENCES `prestasi_pengembangan_diri` (`id_pengembangan_diri`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_portofolio`
--
ALTER TABLE `prestasi_portofolio`
  ADD CONSTRAINT `prestasi_portofolio_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_portofolio_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_portofolio_attachments`
--
ALTER TABLE `prestasi_portofolio_attachments`
  ADD CONSTRAINT `prestasi_portofolio_attachments_ibfk_1` FOREIGN KEY (`id_portofolio`) REFERENCES `prestasi_portofolio` (`id_portofolio`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_produk_mahasiswa`
--
ALTER TABLE `prestasi_produk_mahasiswa`
  ADD CONSTRAINT `prestasi_produk_mahasiswa_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_produk_mahasiswa_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_produk_mahasiswa_attachments`
--
ALTER TABLE `prestasi_produk_mahasiswa_attachments`
  ADD CONSTRAINT `prestasi_produk_mahasiswa_attachments_ibfk_1` FOREIGN KEY (`id_produk_mahasiswa`) REFERENCES `prestasi_produk_mahasiswa` (`id_produk_mahasiswa`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_produk_mahasiswa_attachments_ibfk_2` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_publikasi`
--
ALTER TABLE `prestasi_publikasi`
  ADD CONSTRAINT `prestasi_publikasi_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_publikasi_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_publikasi_attachments`
--
ALTER TABLE `prestasi_publikasi_attachments`
  ADD CONSTRAINT `prestasi_publikasi_attachments_ibfk_1` FOREIGN KEY (`id_publikasi`) REFERENCES `prestasi_publikasi` (`id_publikasi`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_seminar`
--
ALTER TABLE `prestasi_seminar`
  ADD CONSTRAINT `prestasi_seminar_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_seminar_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_seminar_attachments`
--
ALTER TABLE `prestasi_seminar_attachments`
  ADD CONSTRAINT `prestasi_seminar_attachments_ibfk_1` FOREIGN KEY (`id_seminar`) REFERENCES `prestasi_seminar` (`id_seminar`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `prestasi_wirausaha`
--
ALTER TABLE `prestasi_wirausaha`
  ADD CONSTRAINT `prestasi_wirausaha_ibfk_1` FOREIGN KEY (`id_mahasiswa`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prestasi_wirausaha_ibfk_2` FOREIGN KEY (`source_import_log_id`) REFERENCES `prestasi_import_logs` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `prestasi_wirausaha_attachments`
--
ALTER TABLE `prestasi_wirausaha_attachments`
  ADD CONSTRAINT `prestasi_wirausaha_attachments_ibfk_1` FOREIGN KEY (`id_wirausaha`) REFERENCES `prestasi_wirausaha` (`id_wirausaha`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `satisfaction_form_responses`
--
ALTER TABLE `satisfaction_form_responses`
  ADD CONSTRAINT `satisfaction_form_responses_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `satisfaction_form_responses_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `satisfaction_form_templates` (`id`);

--
-- Ketidakleluasaan untuk tabel `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `student_notifications`
--
ALTER TABLE `student_notifications`
  ADD CONSTRAINT `student_notifications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_notifications_ibfk_2` FOREIGN KEY (`evaluation_id`) REFERENCES `evaluations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_notifications_ibfk_3` FOREIGN KEY (`invitation_id`) REFERENCES `evaluation_invitations` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `tracer_study`
--
ALTER TABLE `tracer_study`
  ADD CONSTRAINT `tracer_study_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
