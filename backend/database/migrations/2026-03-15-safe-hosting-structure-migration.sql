-- =====================================================================
-- SAFE HOSTING STRUCTURE MIGRATION (AUTO-COMBINED, updated 2026-03-15)
-- Arsip Mahasiswa ABT
-- =====================================================================
-- Jalankan setelah memilih database target di phpMyAdmin.
-- Script ini tidak melakukan DROP DATABASE / DROP TABLE / TRUNCATE / DELETE.
-- Data lama dipertahankan; tabel legacy achievements di-rename menjadi backup.

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';
SET FOREIGN_KEY_CHECKS = 0;



-- ===== SOURCE: backend/database/install.sql =====
-- =====================================================================
-- ARSIP MAHASISWA PRODI ABT - Instalasi Database MySQL
-- =====================================================================
-- Cara pakai di phpMyAdmin:
-- 1. Buka phpMyAdmin (http://localhost/phpmyadmin)
-- 2. Klik tab "SQL"
-- 3. Copy-paste seluruh isi file ini, lalu klik "Go"
--
-- Atau: Import file ini lewat tab "Import" â†’ pilih install.sql
--
-- Catatan: Jalankan sekali untuk database baru. Nama database: arsipmhs
-- (sesuaikan di .env: DB_NAME=arsipmhs)
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. USERS TABLE - Unified Authentication
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Login username (admin or NIM)',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  nama VARCHAR(100) NOT NULL COMMENT 'Full name',
  role ENUM('admin', 'student') NOT NULL DEFAULT 'student' COMMENT 'User role',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation date',
  last_login TIMESTAMP NULL COMMENT 'Last login timestamp',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Account status',
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Unified authentication table for admins and students';

-- =====================================================================
-- 2. STUDENTS TABLE - Main Profile Hub
-- =====================================================================
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  nim VARCHAR(20) UNIQUE NOT NULL COMMENT 'Student ID number',
  nama VARCHAR(100) NOT NULL COMMENT 'Full name',
  jurusan VARCHAR(50) NOT NULL DEFAULT 'Administrasi Bisnis' COMMENT 'Department',
  prodi VARCHAR(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan' COMMENT 'Study Program',
  status ENUM('active', 'on_leave', 'dropout', 'alumni') NOT NULL DEFAULT 'active' COMMENT 'Student status',
  status_mode ENUM('manual', 'auto') NOT NULL DEFAULT 'auto' COMMENT 'manual=use status; auto=compute active/alumni from tahun_masuk/tahun_lulus',
  tahun_masuk INT NOT NULL COMMENT 'Year of enrollment',
  tahun_lulus INT NULL COMMENT 'Year of graduation (NULL if not alumni)',
  email VARCHAR(100) NULL UNIQUE COMMENT 'Email address',
  login_email VARCHAR(100) NULL UNIQUE COMMENT 'Verified email for optional login',
  pending_login_email VARCHAR(100) NULL COMMENT 'Pending email waiting for verification',
  is_email_login_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Email login activation status',
  email_verified_at TIMESTAMP NULL COMMENT 'Email login verification timestamp',
  email_verification_token_hash CHAR(64) NULL COMMENT 'SHA-256 hash of verification token',
  email_verification_expires_at DATETIME NULL COMMENT 'Verification token expiry timestamp',
  email_verification_sent_at DATETIME NULL COMMENT 'Last verification email sent timestamp',
  email_verification_otp_hash CHAR(64) NULL COMMENT 'SHA-256 hash of 6-digit OTP for email verification',
  no_hp VARCHAR(20) NULL COMMENT 'Phone number',
  alamat TEXT NULL COMMENT 'Address',
  user_id VARCHAR(36) UNIQUE NULL COMMENT 'FK to users table',
  has_credentials BOOLEAN DEFAULT FALSE COMMENT 'Has login account',
  last_login TIMESTAMP NULL COMMENT 'Last login',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  INDEX idx_nim (nim),
  INDEX idx_status (status),
  INDEX idx_tahun_lulus (tahun_lulus),
  INDEX idx_email (email),
  INDEX idx_login_email (login_email),
  INDEX idx_pending_login_email (pending_login_email),
  INDEX idx_email_verification_token_hash (email_verification_token_hash),
  INDEX idx_email_verification_otp_hash (email_verification_otp_hash),
  INDEX idx_status_tahun (status, tahun_lulus),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT check_tahun_lulus CHECK (tahun_lulus IS NULL OR tahun_lulus >= tahun_masuk),
  CONSTRAINT check_tahun_masuk CHECK (tahun_masuk > 1900 AND tahun_masuk < 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Central student profile hub';

-- =====================================================================
-- 3. ADMINS TABLE - Admin Role Mapping
-- =====================================================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY COMMENT 'FK to users.id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Admin creation date',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin role mapping';

-- =====================================================================
-- 4. TRACER_STUDY TABLE - Alumni Career Tracking
-- =====================================================================
CREATE TABLE IF NOT EXISTS tracer_study (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  student_id VARCHAR(36) UNIQUE NOT NULL COMMENT 'FK to students (UNIQUE - one per student)',
  email VARCHAR(100) NOT NULL COMMENT 'Contact email',
  no_hp VARCHAR(20) NOT NULL COMMENT 'Phone number',
  media_sosial VARCHAR(255) NULL COMMENT 'Social media handle',
  linkedin VARCHAR(255) NULL COMMENT 'LinkedIn URL',
  career_status ENUM('working', 'job_seeking', 'entrepreneur', 'further_study') NOT NULL COMMENT 'Career status',
  tahun_pengisian INT NOT NULL COMMENT 'Year of submission',
  employment_data JSON NULL COMMENT 'Employment details (career_status = working)',
  job_seeking_data JSON NULL COMMENT 'Job seeking details (career_status = job_seeking)',
  entrepreneurship_data JSON NULL COMMENT 'Business details (career_status = entrepreneur)',
  further_study_data JSON NULL COMMENT 'Further study details (career_status = further_study)',
  ringkasan_karir TEXT NULL COMMENT 'Career summary',
  bersedia_dihubungi BOOLEAN DEFAULT FALSE COMMENT 'Willing to be contacted',
  saran_komentar TEXT NULL COMMENT 'Suggestions/comments',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_career_status (career_status),
  INDEX idx_tahun_pengisian (tahun_pengisian),
  INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alumni career tracking (tracer study)';

-- =====================================================================
-- 5. ACHIEVEMENTS TABLE - Non-Academic Achievement Records
-- =====================================================================
CREATE TABLE IF NOT EXISTS achievements (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK to students',
  category VARCHAR(50) NOT NULL COMMENT 'Achievement category',
  subcategory VARCHAR(50) NOT NULL COMMENT 'Achievement subcategory',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic' COMMENT 'Derived achievement classification',
  title VARCHAR(255) NOT NULL COMMENT 'Achievement title',
  description TEXT NULL COMMENT 'Detailed description',
  tanggal DATE NOT NULL COMMENT 'Achievement date',
  lokasi VARCHAR(255) NULL COMMENT 'Location',
  penyelenggara VARCHAR(255) NULL COMMENT 'Organizer/institution',
  tingkat ENUM('lokal', 'regional', 'nasional', 'internasional') NULL COMMENT 'Achievement level',
  peringkat VARCHAR(100) NULL COMMENT 'Ranking/award (e.g., Juara 1, Finalist)',
  verified BOOLEAN DEFAULT FALSE COMMENT 'Admin verified',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_category (category),
  INDEX idx_subcategory (subcategory),
  INDEX idx_achievement_type (achievement_type),
  INDEX idx_student_id (student_id),
  INDEX idx_tanggal (tanggal DESC),
  INDEX idx_student_category (student_id, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Non-academic achievements';

-- =====================================================================
-- 6. ACHIEVEMENT_ATTACHMENTS TABLE - File Storage Metadata
-- =====================================================================
CREATE TABLE IF NOT EXISTS achievement_attachments (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  achievement_id VARCHAR(36) NOT NULL COMMENT 'FK to achievements',
  file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
  file_type VARCHAR(50) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
  file_size INT NOT NULL COMMENT 'File size in bytes',
  file_path VARCHAR(500) NOT NULL COMMENT 'URL or server path to file',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin/system actor id that moved attachment to Recycle Bin',
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  INDEX idx_achievement_id (achievement_id),
  INDEX idx_achievement_attachments_deleted_at (deleted_at),
  INDEX idx_achievement_attachments_deleted_by (deleted_by),
  CONSTRAINT check_file_size CHECK (file_size > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Achievement file attachments metadata';

-- =====================================================================
-- 7. EVALUATIONS TABLE - Graduate Evaluation Campaign
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  title VARCHAR(255) NOT NULL COMMENT 'Evaluation title',
  short_message VARCHAR(500) NULL COMMENT 'Short notification message',
  status ENUM('active', 'closed') NOT NULL DEFAULT 'active' COMMENT 'Evaluation lifecycle status',
  start_at DATETIME NOT NULL COMMENT 'Evaluation start date-time',
  end_at DATETIME NULL COMMENT 'Evaluation end date-time',
  reminder_enabled BOOLEAN DEFAULT TRUE COMMENT 'Enable automatic reminder',
  reminder_interval_days INT NOT NULL DEFAULT 7 COMMENT 'Auto reminder interval in days',
  created_by VARCHAR(36) NOT NULL COMMENT 'FK to users (admin creator)',
  closed_by VARCHAR(36) NULL COMMENT 'FK to users (admin closer)',
  closed_at TIMESTAMP NULL COMMENT 'Closed timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin/system actor id that moved evaluation to Recycle Bin',
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT check_evaluation_period CHECK (end_at IS NULL OR end_at >= start_at),
  CONSTRAINT check_reminder_days CHECK (reminder_interval_days >= 1 AND reminder_interval_days <= 365),
  INDEX idx_evaluations_status (status),
  INDEX idx_evaluations_period (start_at, end_at),
  INDEX idx_evaluations_creator (created_by),
  INDEX idx_evaluations_deleted_at (deleted_at),
  INDEX idx_evaluations_deleted_by (deleted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Graduate evaluation campaigns';

-- =====================================================================
-- 8. EVALUATION_ASPECTS TABLE - Master Aspect Configuration
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluation_aspects (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  code VARCHAR(50) NOT NULL UNIQUE COMMENT 'Stable aspect code',
  name VARCHAR(255) NOT NULL COMMENT 'Aspect display label',
  sort_order INT NOT NULL COMMENT 'Display order',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Aspect active flag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  CONSTRAINT check_aspect_sort_order CHECK (sort_order > 0),
  INDEX idx_aspects_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master list of evaluation aspects';

-- =====================================================================
-- 9. EVALUATION_INVITATIONS TABLE - Alumni Invitation Tracking
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluation_invitations (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluations',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK to students (alumni target)',
  user_id VARCHAR(36) NULL COMMENT 'FK to users (student account)',
  access_token VARCHAR(128) NOT NULL UNIQUE COMMENT 'Secure survey access token',
  first_sent_at TIMESTAMP NULL COMMENT 'First invitation sent timestamp',
  last_sent_at TIMESTAMP NULL COMMENT 'Latest invitation/reminder sent timestamp',
  send_count INT NOT NULL DEFAULT 0 COMMENT 'How many times invitation/reminder sent',
  submitted_at TIMESTAMP NULL COMMENT 'Survey submission timestamp',
  created_by VARCHAR(36) NULL COMMENT 'FK to users (admin sender/creator)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT unique_evaluation_student UNIQUE (evaluation_id, student_id),
  CONSTRAINT check_send_count CHECK (send_count >= 0),
  INDEX idx_invitations_evaluation (evaluation_id),
  INDEX idx_invitations_student (student_id),
  INDEX idx_invitations_user_id (user_id),
  INDEX idx_invitations_submitted (submitted_at),
  INDEX idx_invitations_reminder_due (submitted_at, last_sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Invitation mapping between evaluation and alumni';

-- =====================================================================
-- 10. EVALUATION_RESPONSES TABLE - Survey Header Responses
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluation_responses (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluations',
  invitation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluation_invitations',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK to students',
  company_name VARCHAR(255) NOT NULL COMMENT 'Company name',
  company_address TEXT NOT NULL COMMENT 'Company address',
  employee_name VARCHAR(255) NOT NULL COMMENT 'Employee being evaluated',
  graduation_year INT NOT NULL COMMENT 'Graduation year of employee',
  study_program VARCHAR(150) NOT NULL COMMENT 'Study program',
  current_work_division VARCHAR(255) NOT NULL COMMENT 'Current work division/field',
  major_job_match ENUM('ya', 'tidak') NOT NULL COMMENT 'Is major relevant to current work',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Response submission timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (invitation_id) REFERENCES evaluation_invitations(id) ON DELETE RESTRICT,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT unique_response_invitation UNIQUE (invitation_id),
  CONSTRAINT unique_response_evaluation_student UNIQUE (evaluation_id, student_id),
  INDEX idx_responses_evaluation (evaluation_id),
  INDEX idx_responses_student (student_id),
  INDEX idx_responses_match (major_job_match),
  INDEX idx_responses_submitted (submitted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Survey response header data';

-- =====================================================================
-- 11. EVALUATION_RESPONSE_RATINGS TABLE - Aspect Scores
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluation_response_ratings (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  response_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluation_responses',
  aspect_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluation_aspects',
  score TINYINT UNSIGNED NOT NULL COMMENT 'Rating score: 1-5',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  FOREIGN KEY (response_id) REFERENCES evaluation_responses(id) ON DELETE CASCADE,
  FOREIGN KEY (aspect_id) REFERENCES evaluation_aspects(id) ON DELETE RESTRICT,
  CONSTRAINT unique_response_aspect UNIQUE (response_id, aspect_id),
  CONSTRAINT check_rating_score CHECK (score >= 1 AND score <= 5),
  INDEX idx_ratings_aspect (aspect_id),
  INDEX idx_ratings_score (score),
  INDEX idx_ratings_aspect_score (aspect_id, score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-aspect rating values for each response';

-- =====================================================================
-- 12. STUDENT_NOTIFICATIONS TABLE - In-app Notification Feed
-- =====================================================================
CREATE TABLE IF NOT EXISTS student_notifications (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID-like id',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK to students',
  evaluation_id VARCHAR(36) NULL COMMENT 'FK to evaluations (nullable)',
  invitation_id VARCHAR(36) NULL COMMENT 'FK to evaluation_invitations (nullable)',
  type ENUM('invitation', 'reminder') NOT NULL COMMENT 'Notification type',
  title VARCHAR(255) NOT NULL COMMENT 'Notification title',
  message VARCHAR(500) NOT NULL COMMENT 'Notification message',
  link_path VARCHAR(500) NOT NULL COMMENT 'Frontend route/path with token',
  is_read BOOLEAN DEFAULT FALSE COMMENT 'Read status',
  read_at TIMESTAMP NULL COMMENT 'Read timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE SET NULL,
  FOREIGN KEY (invitation_id) REFERENCES evaluation_invitations(id) ON DELETE SET NULL,
  INDEX idx_notifications_student (student_id),
  INDEX idx_notifications_read (student_id, is_read),
  INDEX idx_notifications_created (created_at DESC),
  INDEX idx_notifications_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification storage for students';

-- =====================================================================
-- EVALUATION_TOKEN_BLACKLIST - Superseded tokens when admin resends link
-- =====================================================================
CREATE TABLE IF NOT EXISTS evaluation_token_blacklist (
  token VARCHAR(128) PRIMARY KEY COMMENT 'Superseded access_token',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluations',
  invalidated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When token was replaced by resend',
  INDEX idx_blacklist_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens invalidated when admin resends evaluation link';

-- =====================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- (Jalankan sekali; jika index sudah ada akan error - aman diabaikan)
-- =====================================================================

-- =====================================================================
-- VIEWS (Optional, for reporting)
-- =====================================================================



SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SEED DATA - Data awal (admin + aspek evaluasi)
-- =====================================================================
-- Admin: username=admin, password=admin123
INSERT IGNORE INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('admin-001', 'admin', '$2y$10$hrLNnB/vm3jGnUZNl5KpMOZ4F00A2siE/1C0q26JfCt58ER3QSiJq', 'Administrator ARSIP MAHASISWA ABT', 'admin', NOW(), TRUE);

INSERT IGNORE INTO admins (id, created_at) VALUES
('admin-001', NOW());

-- Aspek evaluasi lulusan (survey kepuasan)
INSERT IGNORE INTO evaluation_aspects (id, code, name, sort_order, is_active, created_at, updated_at) VALUES
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
-- SELESAI - Database siap dipakai
-- =====================================================================


-- ===== SOURCE: backend/database/migrations/2026-02-13-evaluation-working-target-indexes.sql =====
-- Migration: Add indexes for evaluation working-target filtering
-- Date: 2026-02-13
-- Scope: optimize alumni-working target lookup for evaluation module

SET NAMES utf8mb4;

-- 1) tracer_study(career_status, student_id)
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tracer_study'
    AND INDEX_NAME = 'idx_tracer_career_student'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE tracer_study ADD INDEX idx_tracer_career_student (career_status, student_id)',
  'SELECT "idx_tracer_career_student already exists"'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2) students(status, user_id, tahun_masuk, tahun_lulus)
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND INDEX_NAME = 'idx_students_eval_working_filter'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE students ADD INDEX idx_students_eval_working_filter (status, user_id, tahun_masuk, tahun_lulus)',
  'SELECT "idx_students_eval_working_filter already exists"'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3) users(role, is_active, id)
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND INDEX_NAME = 'idx_users_role_active_id'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE users ADD INDEX idx_users_role_active_id (role, is_active, id)',
  'SELECT "idx_users_role_active_id already exists"'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ===== SOURCE: backend/database/migrations/2026-02-20-create-chart-records-tables.sql =====
-- =====================================================================
-- Chart Records & Advanced Settings Dashboard
-- Migration: menu_*_records, record_change_logs, export_logs, chart_sync_log
-- Timezone: store in server default; app uses Asia/Jakarta for display
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. CHART_SYNC_LOG - Last sync time per section (for tooltip)
-- =====================================================================
CREATE TABLE IF NOT EXISTS chart_sync_log (
  menu_section VARCHAR(80) PRIMARY KEY COMMENT 'e.g. student_achievements, study_period',
  last_synced_at TIMESTAMP NULL COMMENT 'Last sync from master (Asia/Jakarta)',
  synced_by VARCHAR(36) NULL COMMENT 'FK users.id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_last_synced (last_synced_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Last sync time per dashboard section';

-- =====================================================================
-- 2. RECORD_CHANGE_LOGS - Audit trail for menu_*_records
-- =====================================================================
CREATE TABLE IF NOT EXISTS record_change_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  menu_section VARCHAR(80) NOT NULL COMMENT 'Section id',
  record_id VARCHAR(36) NOT NULL COMMENT 'PK of menu_*_records row',
  action ENUM('created', 'updated', 'deleted') NOT NULL,
  admin_id VARCHAR(36) NOT NULL COMMENT 'FK users.id',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Asia/Jakarta',
  old_data JSON NULL COMMENT 'Snapshot before change',
  new_data JSON NULL COMMENT 'Snapshot after change',
  INDEX idx_menu_section (menu_section),
  INDEX idx_record (menu_section, record_id),
  INDEX idx_admin (admin_id),
  INDEX idx_changed_at (changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for chart record changes';

-- =====================================================================
-- 3. EXPORT_LOGS - Who exported what, when
-- =====================================================================
CREATE TABLE IF NOT EXISTS export_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  admin_id VARCHAR(36) NOT NULL COMMENT 'FK users.id',
  menu_section VARCHAR(80) NOT NULL,
  format ENUM('csv', 'xlsx', 'pdf') NOT NULL,
  filters JSON NULL COMMENT 'e.g. {"year": 2024}',
  exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Asia/Jakarta',
  INDEX idx_admin (admin_id),
  INDEX idx_menu_section (menu_section),
  INDEX idx_exported_at (exported_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Export audit log';

-- =====================================================================
-- 4. MENU_*_RECORDS - One table per dashboard section (source of truth for charts)
-- =====================================================================

-- Helper: same structure for all menu_*_records
-- id, source_table, source_id, snapshot_*, tahun_pelaporan, payload (JSON), deleted_at, created_at, updated_at

CREATE TABLE IF NOT EXISTS menu_student_achievements_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL COMMENT 'achievements.id',
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL COMMENT 'Year for reporting',
  payload JSON NOT NULL COMMENT 'Chart/export data snapshot',
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan),
  INDEX idx_snapshot_nim (snapshot_nim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_study_period_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'students',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_waiting_time_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_job_relevance_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_work_coverage_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_user_satisfaction_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'evaluation_responses',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_publications_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_active_students_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'students',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_student_products_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_research_outputs_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;


-- ===== SOURCE: backend/database/migrations/2026-02-21-add-chart-record-visibility.sql =====
-- Add per-record visibility toggle for chart dataset controls.
-- OFF means hidden from chart calculation but still stored in DB.

ALTER TABLE menu_student_achievements_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_study_period_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_waiting_time_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_job_relevance_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_work_coverage_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_user_satisfaction_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_publications_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_active_students_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_student_products_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;

ALTER TABLE menu_research_outputs_records
  ADD COLUMN IF NOT EXISTS included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload;


-- ===== SOURCE: backend/database/migrations/2026-02-21-advance-settings-enum.sql =====
-- Extend record_change_logs action enum for Recycle Bin & Recovery
ALTER TABLE record_change_logs
MODIFY COLUMN action ENUM('created', 'updated', 'deleted', 'recovered', 'permanent_deleted') NOT NULL;


-- ===== SOURCE: backend/database/migrations/2026-02-23-add-achievement-type.sql =====
-- Add achievement_type classification field to achievements table.
-- Mapping:
-- - academic: scientific_work, intellectual_property, applied_academic + course_portfolio
-- - non_academic: everything else

SET @achievements_base_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'achievements'
    AND table_type = 'BASE TABLE'
);
SET @sql := IF(
  @achievements_base_exists > 0,
  'ALTER TABLE achievements ADD COLUMN IF NOT EXISTS achievement_type ENUM(''academic'', ''non_academic'') NOT NULL DEFAULT ''non_academic'' AFTER subcategory',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  @achievements_base_exists > 0,
  'UPDATE achievements
   SET achievement_type = CASE
     WHEN category = ''scientific_work'' THEN ''academic''
     WHEN category = ''intellectual_property'' THEN ''academic''
     WHEN category = ''applied_academic'' AND subcategory = ''course_portfolio'' THEN ''academic''
     ELSE ''non_academic''
   END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ===== SOURCE: backend/database/migrations/2026-02-24-reclassify-haki-non-academic.sql =====
-- Reclassify achievement_type after moving intellectual_property (HAKI) to non_academic.
-- Final mapping:
-- - academic: scientific_work, applied_academic + course_portfolio
-- - non_academic: everything else (including intellectual_property)

SET @sql := IF(
  @achievements_base_exists > 0,
  'UPDATE achievements
   SET achievement_type = CASE
     WHEN category = ''scientific_work'' THEN ''academic''
     WHEN category = ''applied_academic'' AND subcategory = ''course_portfolio'' THEN ''academic''
     ELSE ''non_academic''
   END',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ===== SOURCE: backend/database/migrations/2026-02-24-active-students-semester-stats.sql =====
-- Agregat per semester untuk chart Mahasiswa Aktif: PD-Dikti (input) dan aktif (optional override).
-- Jika aktif NULL, backend menghitung dari menu_active_students_records / students.

CREATE TABLE IF NOT EXISTS active_students_semester_stats (
  tahun INT NOT NULL,
  semester ENUM('genap','ganjil') NOT NULL,
  pd_dikti INT NOT NULL DEFAULT 0 COMMENT 'Jumlah terdaftar PD-Dikti semester ini',
  aktif INT NULL COMMENT 'Jumlah mahasiswa aktif; NULL = hitung dari records',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tahun, semester),
  INDEX idx_tahun (tahun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ===== SOURCE: backend/database/migrations/2026-02-24-student-email-login.sql =====
-- Email login tambahan untuk mahasiswa (soft onboarding, verifikasi link).
-- Menambah kolom kredensial email login terpisah dari email kontak.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS login_email VARCHAR(100) NULL AFTER email,
  ADD COLUMN IF NOT EXISTS pending_login_email VARCHAR(100) NULL AFTER login_email,
  ADD COLUMN IF NOT EXISTS is_email_login_enabled BOOLEAN NOT NULL DEFAULT 0 AFTER pending_login_email,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP NULL AFTER is_email_login_enabled,
  ADD COLUMN IF NOT EXISTS email_verification_token_hash CHAR(64) NULL AFTER email_verified_at,
  ADD COLUMN IF NOT EXISTS email_verification_expires_at DATETIME NULL AFTER email_verification_token_hash,
  ADD COLUMN IF NOT EXISTS email_verification_sent_at DATETIME NULL AFTER email_verification_expires_at;

-- Index helper: only create if missing (MariaDB < 10.5 lacks ADD INDEX IF NOT EXISTS).
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND INDEX_NAME = 'idx_students_pending_login_email'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE students ADD INDEX idx_students_pending_login_email (pending_login_email)',
  'SELECT 1'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ===== SOURCE: backend/database/migrations/2026-02-24-student-soft-delete-recycle-bin.sql =====
-- Soft delete support untuk recycle bin akun mahasiswa.
-- Menyimpan metadata penghapus dan waktu penghapusan.

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND INDEX_NAME = 'idx_deleted_by'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE students ADD INDEX idx_deleted_by (deleted_by)',
  'SELECT 1'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== SOURCE: backend/database/migrations/2026-03-15-student-status-mode.sql =====
-- Add status_mode to support auto-computed student status with manual override.
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS status_mode ENUM('manual', 'auto') NOT NULL DEFAULT 'auto'
  COMMENT 'manual=use status; auto=compute active/alumni from tahun_masuk/tahun_lulus'
  AFTER status;

UPDATE students
SET status_mode = 'manual'
WHERE status IN ('on_leave', 'dropout');


-- ===== SOURCE: backend/database/migrations/2026-02-25-email-login-otp.sql =====
-- Add OTP hash column for email login verification (link + OTP option).
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS email_verification_otp_hash CHAR(64) NULL COMMENT 'SHA-256 hash of 6-digit OTP' AFTER email_verification_sent_at;


-- ===== SOURCE: backend/database/migrations/2026-02-25-evaluation-invitations-user-id.sql =====
-- Migration: Add user_id to evaluation_invitations for token-only survey access (Opsi A)
-- Date: 2026-02-25
-- Enables resolving invitation by token without joining students for user context.

SET NAMES utf8mb4;

-- Add user_id column if not present (nullable for existing rows)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_invitations' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE evaluation_invitations ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) NULL COMMENT ''FK to users (student account)'' AFTER student_id, ADD INDEX idx_invitations_user_id (user_id)',
  'SELECT ''Column user_id already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill user_id from students
UPDATE evaluation_invitations ei
  INNER JOIN students s ON s.id = ei.student_id AND s.deleted_at IS NULL
  SET ei.user_id = s.user_id
  WHERE ei.user_id IS NULL AND s.user_id IS NOT NULL;


-- ===== SOURCE: backend/database/migrations/2026-02-25-evaluation-token-blacklist.sql =====
-- Migration: evaluation_token_blacklist for superseded tokens when admin resends link
-- Run once; safe if table already exists (CREATE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS evaluation_token_blacklist (
  token VARCHAR(128) PRIMARY KEY COMMENT 'Superseded access_token',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluations',
  invalidated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When token was replaced by resend',
  INDEX idx_blacklist_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens invalidated when admin resends evaluation link';


-- ===== SOURCE: backend/database/migrations/2026-02-26-satisfaction-form-templates.sql =====
-- Custom Form Kepuasan Pengguna: templates and responses.
-- One default template (is_default=1) cannot be deleted/edited from UI.
-- Only one template can be active (is_active=1) at a time.

SET NAMES utf8mb4;

-- Templates: form definition stored as JSON (sections with type, required, options, etc.)
CREATE TABLE IF NOT EXISTS satisfaction_form_templates (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  title VARCHAR(255) NOT NULL COMMENT 'Template display name',
  definition JSON NOT NULL COMMENT 'Sections and items: type, required, options, scale_min/max, etc.',
  is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Default template; only one row should be true; cannot delete/edit from UI',
  is_active BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Template currently used for surveys; only one row should be true',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete for recycle bin',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin user id that moved to recycle bin',

  INDEX idx_satisfaction_templates_deleted (deleted_at),
  INDEX idx_satisfaction_templates_default (is_default),
  INDEX idx_satisfaction_templates_active (is_active),
  INDEX idx_satisfaction_templates_updated (updated_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom user satisfaction form templates';

-- Responses: one per invitation when using custom form
CREATE TABLE IF NOT EXISTS satisfaction_form_responses (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  invitation_id VARCHAR(36) NOT NULL COMMENT 'FK evaluation_invitations',
  template_id VARCHAR(36) NOT NULL COMMENT 'FK satisfaction_form_templates (snapshot of form used)',
  answers JSON NOT NULL COMMENT 'Section/item id to value or file reference',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uk_satisfaction_response_invitation (invitation_id),
  FOREIGN KEY (invitation_id) REFERENCES evaluation_invitations(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES satisfaction_form_templates(id) ON DELETE RESTRICT,
  INDEX idx_satisfaction_responses_template (template_id),
  INDEX idx_satisfaction_responses_submitted (submitted_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Custom form responses per invitation';

-- Seed default template (minimal structure: one open section). Fixed ID so re-run is safe.
INSERT IGNORE INTO satisfaction_form_templates (id, title, definition, is_default, is_active, created_at, updated_at)
VALUES (
  'a0000001-0000-4000-8000-000000000001',
  'Template Utama Kepuasan Pengguna',
  JSON_OBJECT(
    'sections', JSON_ARRAY(
      JSON_OBJECT(
        'id', 'sec-default-1',
        'title', 'Komentar atau saran',
        'required', true,
        'type', 'open',
        'placeholder', 'Tulis komentar atau saran Anda di sini...'
      )
    )
  ),
  1,
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);


-- ===== SOURCE: backend/database/migrations/2026-02-27-normalize-satisfaction-template-active-state.sql =====
-- Normalize active-state consistency for satisfaction_form_templates.
-- Rules:
-- 1) Deleted templates must not stay active.
-- 2) If none active (non-deleted), auto-activate default.
-- 3) If multiple active, keep newest active and deactivate others.

SET NAMES utf8mb4;

-- 1) Nonaktifkan template yang sudah dihapus (soft delete).
UPDATE satisfaction_form_templates
SET is_active = 0
WHERE deleted_at IS NOT NULL
  AND is_active = 1;

-- 2) Jika tidak ada active non-deleted, aktifkan template default (jika ada).
UPDATE satisfaction_form_templates
SET is_active = 1, updated_at = NOW()
WHERE id = (
  SELECT pick.id
  FROM (
    SELECT id
    FROM satisfaction_form_templates
    WHERE deleted_at IS NULL AND is_default = 1
    ORDER BY updated_at DESC, created_at DESC, id DESC
    LIMIT 1
  ) AS pick
)
AND NOT EXISTS (
  SELECT 1
  FROM satisfaction_form_templates
  WHERE deleted_at IS NULL AND is_active = 1
);

-- 3) Jika active non-deleted lebih dari satu, sisakan yang terbaru.
UPDATE satisfaction_form_templates
SET is_active = CASE
  WHEN id = (
    SELECT pick.id
    FROM (
      SELECT id
      FROM satisfaction_form_templates
      WHERE deleted_at IS NULL AND is_active = 1
      ORDER BY updated_at DESC, created_at DESC, id DESC
      LIMIT 1
    ) AS pick
  ) THEN 1
  ELSE 0
END
WHERE deleted_at IS NULL
  AND is_active = 1
  AND (
    SELECT COUNT(*)
    FROM satisfaction_form_templates
    WHERE deleted_at IS NULL AND is_active = 1
  ) > 1;


-- ===== SOURCE: backend/database/migrations/2026-02-27-sync-default-satisfaction-template.sql =====
-- Sync default custom satisfaction template with current legacy survey structure.
-- Safe update: only runs when default template is still old minimal seed (single comment question).

SET NAMES utf8mb4;

UPDATE satisfaction_form_templates
SET
  definition = JSON_OBJECT(
    'sections', JSON_ARRAY(
      JSON_OBJECT(
        'id', 'sec-company-name',
        'title', 'Nama Perusahaan',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: PT Maju Sejahtera',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-company-address',
        'title', 'Alamat Perusahaan',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Jl. Sudirman No. 10, Semarang',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-employee-name',
        'title', 'Nama Karyawan yang Dinilai',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Nama karyawan',
        'inputType', 'text',
        'prefillFrom', 'student.nama'
      ),
      JSON_OBJECT(
        'id', 'sec-graduation-year',
        'title', 'Tahun Lulus',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: 2024',
        'inputType', 'number',
        'prefillFrom', 'student.tahun_lulus'
      ),
      JSON_OBJECT(
        'id', 'sec-study-program',
        'title', 'Program Studi',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Administrasi Bisnis Terapan',
        'inputType', 'text',
        'prefillFrom', 'student.prodi'
      ),
      JSON_OBJECT(
        'id', 'sec-current-work-division',
        'title', 'Bagian / Bidang Kerja Saat Ini',
        'required', TRUE,
        'type', 'open',
        'placeholder', 'Contoh: Operasional, HR, Keuangan',
        'inputType', 'text'
      ),
      JSON_OBJECT(
        'id', 'sec-major-job-match',
        'title', 'Bagian 2 - Kesesuaian Jurusan dengan Pekerjaan',
        'required', TRUE,
        'type', 'multiple_choice',
        'allowMultiple', FALSE,
        'allowOther', FALSE,
        'options', JSON_ARRAY('Ya', 'Tidak')
      ),
      JSON_OBJECT(
        'id', 'sec-competency-rating',
        'title', 'Bagian 3 - Tabel Penilaian Kompetensi',
        'required', TRUE,
        'type', 'scale',
        'scaleMin', 1,
        'scaleMax', 5,
        'questionSource', 'evaluation_aspects',
        'questions', JSON_ARRAY(
          JSON_OBJECT('id', 'asp-001', 'title', 'Etika'),
          JSON_OBJECT('id', 'asp-002', 'title', 'Keahlian pada bidang ilmu (kompetensi utama)'),
          JSON_OBJECT('id', 'asp-003', 'title', 'Kemampuan berbahasa asing'),
          JSON_OBJECT('id', 'asp-004', 'title', 'Penggunaan teknologi informasi'),
          JSON_OBJECT('id', 'asp-005', 'title', 'Kemampuan berkomunikasi'),
          JSON_OBJECT('id', 'asp-006', 'title', 'Kerjasama'),
          JSON_OBJECT('id', 'asp-007', 'title', 'Pengembangan diri'),
          JSON_OBJECT('id', 'asp-008', 'title', 'Loyalitas terhadap tujuan perusahaan'),
          JSON_OBJECT('id', 'asp-009', 'title', 'Integritas diri dalam pergaulan di perusahaan'),
          JSON_OBJECT('id', 'asp-010', 'title', 'Kemampuan mengelola waktu kerja')
        )
      )
    )
  ),
  updated_at = CURRENT_TIMESTAMP
WHERE id = 'a0000001-0000-4000-8000-000000000001'
  AND deleted_at IS NULL
  AND JSON_LENGTH(JSON_EXTRACT(definition, '$.sections')) = 1
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].id')) = 'sec-default-1'
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].type')) = 'open'
  AND JSON_UNQUOTE(JSON_EXTRACT(definition, '$.sections[0].title')) = 'Komentar atau saran';


-- ===== SOURCE: backend/database/migrations/2026-02-28-evaluation-response-attachment.sql =====
-- Add optional attachment path for legacy evaluation form (signed form PDF/PNG).
SET NAMES utf8mb4;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_responses' AND COLUMN_NAME = 'attachment_path');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE evaluation_responses ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(512) NULL COMMENT ''Relative path: satisfaction_attachments/...'' AFTER major_job_match',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;


-- ===== SOURCE: backend/database/migrations/2026-02-28-logbook-recycle-bin.sql =====
-- Logbook (record_change_logs) recycle bin: pindah otomatis setelah 20 hari
-- Entri log lebih dari 20 hari akan di-set deleted_at oleh script purge.
ALTER TABLE record_change_logs
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Dipindah ke recycle setelah 20 hari';


-- ===== SOURCE: backend/database/migrations/2026-02-24-refactor-prestasi-ssot.sql =====
-- =====================================================================
-- Refactor Prestasi SSOT: split achievements into category tables
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;


CREATE TABLE IF NOT EXISTS prestasi_import_logs (
  id VARCHAR(36) PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NULL,
  total_rows INT NOT NULL DEFAULT 0,
  valid_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  duplicate_rows INT NOT NULL DEFAULT 0,
  empty_rows INT NOT NULL DEFAULT 0,
  affected_students INT NOT NULL DEFAULT 0,
  status ENUM('processing','completed','failed') NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  INDEX idx_prestasi_import_logs_kategori (kategori),
  INDEX idx_prestasi_import_logs_created_at (created_at DESC),
  INDEX idx_prestasi_import_logs_uploaded_by (uploaded_by),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_import_log_details (
  id VARCHAR(36) PRIMARY KEY,
  import_log_id VARCHAR(36) NOT NULL,
  `row_number` INT NOT NULL,
  nim_raw VARCHAR(50) NULL,
  status ENUM('error','duplicate','skipped_empty','inserted') NOT NULL,
  message VARCHAR(500) NULL,
  raw_payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_import_log_details_import_log_id (import_log_id),
  INDEX idx_prestasi_import_log_details_status (status),
  FOREIGN KEY (import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_migration_skipped_logs (
  id VARCHAR(36) PRIMARY KEY,
  legacy_achievement_id VARCHAR(36) NOT NULL,
  legacy_category VARCHAR(50) NULL,
  legacy_subcategory VARCHAR(50) NULL,
  reason VARCHAR(255) NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_migration_skipped_legacy_id (legacy_achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_publikasi (
  id_publikasi VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'scientific_work',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'journal_publication',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'academic',
  verified BOOLEAN DEFAULT FALSE,
  judul VARCHAR(255) NULL,
  judul_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_publikasi ENUM('artikel_jurnal','prosiding','buku','book_chapter','lainnya') NULL,
  penulis TEXT NULL,
  peran_penulis VARCHAR(100) NULL,
  nama_jurnal_konferensi VARCHAR(255) NULL,
  nama_jurnal_konferensi_norm VARCHAR(255) NOT NULL DEFAULT '',
  penerbit VARCHAR(255) NULL,
  doi VARCHAR(255) NULL,
  url VARCHAR(500) NULL,
  tahun_terbit INT NULL,
  tanggal_terbit DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_publikasi (id_mahasiswa, judul_norm, jenis_publikasi, tahun_terbit, nama_jurnal_konferensi_norm),
  INDEX idx_prestasi_publikasi_student (id_mahasiswa),
  INDEX idx_prestasi_publikasi_date (tanggal DESC),
  INDEX idx_prestasi_publikasi_category (category, subcategory),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_portofolio (
  id_portofolio VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'applied_academic',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'course_portfolio',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'academic',
  verified BOOLEAN DEFAULT FALSE,
  judul_proyek VARCHAR(255) NULL,
  judul_proyek_norm VARCHAR(255) NOT NULL DEFAULT '',
  mata_kuliah_kode VARCHAR(50) NULL,
  mata_kuliah_custom VARCHAR(255) NULL,
  mata_kuliah_norm VARCHAR(255) NOT NULL DEFAULT '',
  tahun INT NULL,
  semester ENUM('ganjil','genap') NULL,
  deskripsi_proyek TEXT NULL,
  output VARCHAR(500) NULL,
  url_proyek VARCHAR(500) NULL,
  nilai VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_portofolio (id_mahasiswa, mata_kuliah_norm, judul_proyek_norm, semester, tahun),
  INDEX idx_prestasi_portofolio_student (id_mahasiswa),
  INDEX idx_prestasi_portofolio_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_lomba (
  id_lomba VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'event_participation',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'competition',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_lomba VARCHAR(255) NULL,
  nama_lomba_norm VARCHAR(255) NOT NULL DEFAULT '',
  penyelenggara_norm VARCHAR(255) NOT NULL DEFAULT '',
  peran ENUM('peserta','juara') NULL,
  bidang VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_lomba (id_mahasiswa, nama_lomba_norm, tingkat, tanggal_mulai, penyelenggara_norm),
  INDEX idx_prestasi_lomba_student (id_mahasiswa),
  INDEX idx_prestasi_lomba_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_kekayaan_intelektual (
  id_kekayaan_intelektual VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'intellectual_property',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'patent',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  judul_ki VARCHAR(255) NULL,
  judul_ki_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_ki ENUM('hak_cipta','paten','merek','desain_industri','rahasia_dagang') NULL,
  status_ki ENUM('terdaftar','granted','pending','ditolak') NULL,
  pemegang VARCHAR(255) NULL,
  nomor_pendaftaran VARCHAR(255) NULL,
  nomor_sertifikat VARCHAR(255) NULL,
  tahun_pengajuan INT NULL,
  tahun_terbit INT NULL,
  tanggal_pengajuan DATE NULL,
  tanggal_terbit DATE NULL,
  deskripsi TEXT NULL,
  jenis_perolehan ENUM('mandiri','kolaborasi_dosen') NULL,
  nama_dosen VARCHAR(255) NULL,
  url_publikasi VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_ki_nomor_pendaftaran (nomor_pendaftaran),
  UNIQUE KEY uq_prestasi_ki_nomor_sertifikat (nomor_sertifikat),
  UNIQUE KEY uq_prestasi_ki_fallback (id_mahasiswa, judul_ki_norm, jenis_ki, tahun_pengajuan),
  INDEX idx_prestasi_ki_student (id_mahasiswa),
  INDEX idx_prestasi_ki_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_magang (
  id_magang VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'applied_academic',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'internship',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_perusahaan VARCHAR(255) NULL,
  nama_perusahaan_norm VARCHAR(255) NOT NULL DEFAULT '',
  posisi VARCHAR(255) NULL,
  posisi_norm VARCHAR(255) NOT NULL DEFAULT '',
  industri VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  sedang_berjalan BOOLEAN DEFAULT FALSE,
  deskripsi_tugas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_magang (id_mahasiswa, nama_perusahaan_norm, posisi_norm, tanggal_mulai),
  INDEX idx_prestasi_magang_student (id_mahasiswa),
  INDEX idx_prestasi_magang_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_wirausaha (
  id_wirausaha VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'entrepreneurship',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'active_business',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_usaha VARCHAR(255) NULL,
  nama_usaha_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_usaha VARCHAR(255) NULL,
  peran VARCHAR(255) NULL,
  lokasi_norm VARCHAR(255) NOT NULL DEFAULT '',
  tahun_mulai INT NULL,
  masih_aktif BOOLEAN DEFAULT TRUE,
  tahun_selesai INT NULL,
  deskripsi_usaha TEXT NULL,
  jumlah_karyawan INT NULL,
  omzet_per_bulan VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_wirausaha (id_mahasiswa, nama_usaha_norm, lokasi_norm, tahun_mulai),
  INDEX idx_prestasi_wirausaha_student (id_mahasiswa),
  INDEX idx_prestasi_wirausaha_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_pengembangan_diri (
  id_pengembangan_diri VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'self_development',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'workshop',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_program VARCHAR(255) NULL,
  nama_program_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_program ENUM('pertukaran_mahasiswa','beasiswa','volunteer','pelatihan','lainnya') NULL,
  peran_mahasiswa VARCHAR(255) NULL,
  negara VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  sedang_berjalan BOOLEAN DEFAULT FALSE,
  output VARCHAR(500) NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_pengembangan (id_mahasiswa, nama_program_norm, jenis_program, tanggal_mulai),
  INDEX idx_prestasi_pengembangan_student (id_mahasiswa),
  INDEX idx_prestasi_pengembangan_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_organisasi (
  id_organisasi VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'self_development',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'volunteer',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_organisasi VARCHAR(255) NULL,
  nama_organisasi_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_organisasi ENUM('kampus','luar_kampus') NULL,
  jabatan VARCHAR(255) NULL,
  jabatan_norm VARCHAR(255) NOT NULL DEFAULT '',
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  masih_aktif BOOLEAN DEFAULT TRUE,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_organisasi (id_mahasiswa, nama_organisasi_norm, jabatan_norm, tanggal_mulai),
  INDEX idx_prestasi_organisasi_student (id_mahasiswa),
  INDEX idx_prestasi_organisasi_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_seminar (
  id_seminar VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'event_participation',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'seminar',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_seminar VARCHAR(255) NULL,
  nama_seminar_norm VARCHAR(255) NOT NULL DEFAULT '',
  penyelenggara_norm VARCHAR(255) NOT NULL DEFAULT '',
  peran_seminar ENUM('peserta','pembicara') NULL,
  mode_seminar ENUM('online','offline') NULL,
  tanggal_seminar DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_seminar (id_mahasiswa, nama_seminar_norm, penyelenggara_norm, tanggal_seminar, peran_seminar),
  INDEX idx_prestasi_seminar_student (id_mahasiswa),
  INDEX idx_prestasi_seminar_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_publikasi_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_publikasi VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_publikasi_att_fk (id_publikasi),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_publikasi) REFERENCES prestasi_publikasi(id_publikasi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_portofolio_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_portofolio VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_portofolio_att_fk (id_portofolio),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_portofolio) REFERENCES prestasi_portofolio(id_portofolio) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_lomba_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_lomba VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_lomba_att_fk (id_lomba),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_lomba) REFERENCES prestasi_lomba(id_lomba) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_kekayaan_intelektual_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_kekayaan_intelektual VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_ki_att_fk (id_kekayaan_intelektual),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_kekayaan_intelektual) REFERENCES prestasi_kekayaan_intelektual(id_kekayaan_intelektual) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_magang_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_magang VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_magang_att_fk (id_magang),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_magang) REFERENCES prestasi_magang(id_magang) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_wirausaha_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_wirausaha VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_wirausaha_att_fk (id_wirausaha),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_wirausaha) REFERENCES prestasi_wirausaha(id_wirausaha) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_pengembangan_diri_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_pengembangan_diri VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_pengembangan_att_fk (id_pengembangan_diri),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_pengembangan_diri) REFERENCES prestasi_pengembangan_diri(id_pengembangan_diri) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_organisasi_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_organisasi VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_organisasi_att_fk (id_organisasi),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_organisasi) REFERENCES prestasi_organisasi(id_organisasi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_seminar_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_seminar VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_seminar_att_fk (id_seminar),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  FOREIGN KEY (id_seminar) REFERENCES prestasi_seminar(id_seminar) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== SOURCE: backend/database/migrations/2026-02-24-expand-recycle-bin-multi-entities.sql =====
-- Expand recycle bin coverage:
-- 1) Graduate evaluations (campaign-level)
-- 2) Achievement attachments (all category attachment tables)
--
-- Also refresh achievement_attachments view to only expose active attachments.
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_publikasi_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_portofolio_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_lomba_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_kekayaan_intelektual_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_magang_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_wirausaha_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_pengembangan_diri_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_organisasi_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

ALTER TABLE prestasi_seminar_attachments
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(36) NULL AFTER deleted_at;

INSERT IGNORE INTO prestasi_publikasi (
  id_publikasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul, judul_norm, jenis_publikasi, penulis, nama_jurnal_konferensi, nama_jurnal_konferensi_norm, penerbit,
  doi, url, tahun_terbit, tanggal_terbit, deskripsi, created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'artikel_jurnal', '-', a.penyelenggara, LOWER(TRIM(COALESCE(a.penyelenggara, ''))), a.penyelenggara,
  NULL, NULL, YEAR(a.tanggal), a.tanggal, a.description, a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'scientific_work'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_portofolio (
  id_portofolio, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul_proyek, judul_proyek_norm, mata_kuliah_kode, mata_kuliah_norm, tahun, semester, deskripsi_proyek,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'other', 'other', YEAR(a.tanggal), 'ganjil', a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'applied_academic'
  AND a.subcategory = 'course_portfolio'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_lomba (
  id_lomba, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_lomba, nama_lomba_norm, penyelenggara_norm, peran, bidang, tanggal_mulai, tanggal_selesai, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), LOWER(TRIM(COALESCE(a.penyelenggara, ''))), IF(a.peringkat IS NULL OR TRIM(a.peringkat) = '', 'peserta', 'juara'), NULL, a.tanggal, NULL, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'event_participation'
  AND a.subcategory = 'competition'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;
INSERT IGNORE INTO prestasi_kekayaan_intelektual (
  id_kekayaan_intelektual, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul_ki, judul_ki_norm, jenis_ki, status_ki, pemegang, tahun_pengajuan, tanggal_pengajuan, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'paten', 'pending', COALESCE(a.penyelenggara, '-'), YEAR(a.tanggal), a.tanggal, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'intellectual_property'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_magang (
  id_magang, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_perusahaan, nama_perusahaan_norm, posisi, posisi_norm, industri, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi_tugas,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  COALESCE(a.penyelenggara, a.title), LOWER(TRIM(COALESCE(a.penyelenggara, a.title))), a.title, LOWER(TRIM(a.title)),
  COALESCE(a.description, ''), a.tanggal, NULL, 0, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'applied_academic'
  AND a.subcategory = 'internship'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_wirausaha (
  id_wirausaha, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_usaha, nama_usaha_norm, jenis_usaha, lokasi_norm, tahun_mulai, masih_aktif, deskripsi_usaha,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), COALESCE(a.description, ''), LOWER(TRIM(COALESCE(a.lokasi, ''))), YEAR(a.tanggal), 1, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'entrepreneurship'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_pengembangan_diri (
  id_pengembangan_diri, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_program, nama_program_norm, jenis_program, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'pelatihan', a.tanggal, NULL, 0, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'self_development'
  AND a.subcategory <> 'volunteer'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_organisasi (
  id_organisasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_organisasi, nama_organisasi_norm, jenis_organisasi, jabatan, jabatan_norm, tanggal_mulai, tanggal_selesai, masih_aktif, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'kampus', COALESCE(NULLIF(TRIM(a.description), ''), 'Anggota'), LOWER(TRIM(COALESCE(NULLIF(TRIM(a.description), ''), 'Anggota'))),
  a.tanggal, NULL, 1, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'self_development'
  AND a.subcategory = 'volunteer'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_seminar (
  id_seminar, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_seminar, nama_seminar_norm, penyelenggara_norm, peran_seminar, mode_seminar, tanggal_seminar, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), LOWER(TRIM(COALESCE(a.penyelenggara, ''))), 'peserta', 'offline', a.tanggal, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'event_participation'
  AND a.subcategory = 'seminar'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_migration_skipped_logs (
  id, legacy_achievement_id, legacy_category, legacy_subcategory, reason, payload
)
SELECT
  a.id,
  a.id,
  a.category,
  a.subcategory,
  'Record legacy tidak dapat dipetakan lengkap ke skema kategori baru',
  JSON_OBJECT(
    'id', a.id,
    'student_id', a.student_id,
    'category', a.category,
    'subcategory', a.subcategory,
    'title', a.title,
    'tanggal', a.tanggal
  )
FROM achievements a
LEFT JOIN (
  SELECT id_publikasi AS id FROM prestasi_publikasi
  UNION ALL SELECT id_portofolio AS id FROM prestasi_portofolio
  UNION ALL SELECT id_lomba AS id FROM prestasi_lomba
  UNION ALL SELECT id_kekayaan_intelektual AS id FROM prestasi_kekayaan_intelektual
  UNION ALL SELECT id_magang AS id FROM prestasi_magang
  UNION ALL SELECT id_wirausaha AS id FROM prestasi_wirausaha
  UNION ALL SELECT id_pengembangan_diri AS id FROM prestasi_pengembangan_diri
  UNION ALL SELECT id_organisasi AS id FROM prestasi_organisasi
  UNION ALL SELECT id_seminar AS id FROM prestasi_seminar
) migrated ON migrated.id = a.id
WHERE migrated.id IS NULL;

INSERT IGNORE INTO prestasi_publikasi_attachments (id, id_publikasi, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_publikasi p ON p.id_publikasi = aa.achievement_id;
INSERT IGNORE INTO prestasi_portofolio_attachments (id, id_portofolio, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_portofolio p ON p.id_portofolio = aa.achievement_id;
INSERT IGNORE INTO prestasi_lomba_attachments (id, id_lomba, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_lomba p ON p.id_lomba = aa.achievement_id;
INSERT IGNORE INTO prestasi_kekayaan_intelektual_attachments (id, id_kekayaan_intelektual, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_kekayaan_intelektual p ON p.id_kekayaan_intelektual = aa.achievement_id;
INSERT IGNORE INTO prestasi_magang_attachments (id, id_magang, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_magang p ON p.id_magang = aa.achievement_id;
INSERT IGNORE INTO prestasi_wirausaha_attachments (id, id_wirausaha, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_wirausaha p ON p.id_wirausaha = aa.achievement_id;
INSERT IGNORE INTO prestasi_pengembangan_diri_attachments (id, id_pengembangan_diri, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_pengembangan_diri p ON p.id_pengembangan_diri = aa.achievement_id;
INSERT IGNORE INTO prestasi_organisasi_attachments (id, id_organisasi, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_organisasi p ON p.id_organisasi = aa.achievement_id;
INSERT IGNORE INTO prestasi_seminar_attachments (id, id_seminar, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_seminar p ON p.id_seminar = aa.achievement_id;




SET FOREIGN_KEY_CHECKS = 1;


-- ===== SOURCE: backend/database/migrations/2026-03-04-add-prestasi-produk-mahasiswa.sql =====
-- =====================================================================
-- Add New Achievement Category Table: prestasi_produk_mahasiswa
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS prestasi_produk_mahasiswa (
  id_produk_mahasiswa VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'applied_academic',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'makanan_minuman',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_produk VARCHAR(255) NULL,
  nama_produk_norm VARCHAR(255) NOT NULL DEFAULT '',
  kategori_produk VARCHAR(50) NOT NULL DEFAULT 'makanan_minuman',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_produk_mahasiswa (id_mahasiswa, nama_produk_norm, kategori_produk, tanggal),
  INDEX idx_prestasi_produk_mahasiswa_student (id_mahasiswa),
  INDEX idx_prestasi_produk_mahasiswa_date (tanggal DESC),
  INDEX idx_prestasi_produk_mahasiswa_category (category, subcategory),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_produk_mahasiswa_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_produk_mahasiswa VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_produk_mahasiswa_att_fk (id_produk_mahasiswa),
  INDEX idx_prestasi_produk_mahasiswa_att_deleted_at (deleted_at),
  INDEX idx_prestasi_produk_mahasiswa_att_deleted_by (deleted_by),
  FOREIGN KEY (id_produk_mahasiswa) REFERENCES prestasi_produk_mahasiswa(id_produk_mahasiswa) ON DELETE CASCADE,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




SET FOREIGN_KEY_CHECKS = 1;


-- ===== SOURCE: backend/database/migrations/2026-03-05-research-output-backfill-log.sql =====
-- Log table for idempotent research_output backfill from legacy achievement categories.
CREATE TABLE IF NOT EXISTS research_output_backfill_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL,
  source_achievement_id VARCHAR(64) NOT NULL,
  source_category VARCHAR(64) NOT NULL,
  source_subcategory VARCHAR(64) NULL,
  target_achievement_id VARCHAR(64) NULL,
  status ENUM('inserted', 'skipped_existing', 'unmapped', 'failed') NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_research_output_backfill_source (source_table, source_achievement_id),
  INDEX idx_research_output_backfill_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== EXTRA SAFE SEMINAR REFACTOR (NO DROP) =====
ALTER TABLE prestasi_seminar
  ADD COLUMN IF NOT EXISTS judul_publikasi VARCHAR(255) NULL AFTER nama_seminar,
  ADD COLUMN IF NOT EXISTS judul_publikasi_norm VARCHAR(255) NOT NULL DEFAULT '' AFTER judul_publikasi,
  ADD COLUMN IF NOT EXISTS level_seminar ENUM('local','national','international') NULL AFTER judul_publikasi_norm,
  ADD COLUMN IF NOT EXISTS jenis_perolehan ENUM('mandiri','kolaborasi_dosen') NULL AFTER level_seminar,
  ADD COLUMN IF NOT EXISTS nama_dosen VARCHAR(255) NULL AFTER jenis_perolehan,
  ADD COLUMN IF NOT EXISTS penulis TEXT NULL AFTER nama_dosen,
  ADD COLUMN IF NOT EXISTS nama_seminar_konferensi VARCHAR(255) NULL AFTER penulis,
  ADD COLUMN IF NOT EXISTS nama_seminar_konferensi_norm VARCHAR(255) NOT NULL DEFAULT '' AFTER nama_seminar_konferensi,
  ADD COLUMN IF NOT EXISTS url_publikasi VARCHAR(500) NULL AFTER nama_seminar_konferensi_norm,
  ADD COLUMN IF NOT EXISTS tanggal_publikasi DATE NULL AFTER url_publikasi;

ALTER TABLE prestasi_kekayaan_intelektual
  ADD COLUMN IF NOT EXISTS jenis_perolehan ENUM('mandiri','kolaborasi_dosen') NULL AFTER deskripsi,
  ADD COLUMN IF NOT EXISTS nama_dosen VARCHAR(255) NULL AFTER jenis_perolehan,
  ADD COLUMN IF NOT EXISTS url_publikasi VARCHAR(500) NULL AFTER nama_dosen;

-- Drop legacy unique key jika masih ada.
SET @seminar_legacy_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'prestasi_seminar'
    AND index_name = 'uq_prestasi_seminar'
);
SET @seminar_drop_legacy_idx_sql := IF(
  @seminar_legacy_idx_exists > 0,
  'ALTER TABLE prestasi_seminar DROP INDEX uq_prestasi_seminar',
  'SELECT 1'
);
PREPARE stmt_seminar_drop_legacy_idx FROM @seminar_drop_legacy_idx_sql;
EXECUTE stmt_seminar_drop_legacy_idx;
DEALLOCATE PREPARE stmt_seminar_drop_legacy_idx;

-- Tambah unique key dedupe versi publikasi seminar.
SET @seminar_pub_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'prestasi_seminar'
    AND index_name = 'uq_prestasi_seminar_publication'
);
SET @seminar_add_pub_idx_sql := IF(
  @seminar_pub_idx_exists = 0,
  'ALTER TABLE prestasi_seminar ADD UNIQUE KEY uq_prestasi_seminar_publication (id_mahasiswa, judul_publikasi_norm, level_seminar, jenis_perolehan, tanggal_publikasi)',
  'SELECT 1'
);
PREPARE stmt_seminar_add_pub_idx FROM @seminar_add_pub_idx_sql;
EXECUTE stmt_seminar_add_pub_idx;
DEALLOCATE PREPARE stmt_seminar_add_pub_idx;

UPDATE prestasi_seminar
SET
  judul_publikasi = COALESCE(NULLIF(TRIM(judul_publikasi), ''), NULLIF(TRIM(title), ''), NULLIF(TRIM(nama_seminar), '')),
  judul_publikasi_norm = LOWER(TRIM(COALESCE(NULLIF(judul_publikasi, ''), NULLIF(title, ''), NULLIF(nama_seminar, '')))),
  level_seminar = COALESCE(
    level_seminar,
    CASE
      WHEN LOWER(COALESCE(tingkat, '')) IN ('lokal', 'regional') THEN 'local'
      WHEN LOWER(COALESCE(tingkat, '')) = 'nasional' THEN 'national'
      WHEN LOWER(COALESCE(tingkat, '')) = 'internasional' THEN 'international'
      ELSE NULL
    END
  ),
  tanggal_publikasi = COALESCE(tanggal_publikasi, tanggal_seminar, tanggal),
  nama_seminar_konferensi = COALESCE(NULLIF(TRIM(nama_seminar_konferensi), ''), NULLIF(TRIM(nama_seminar), '')),
  nama_seminar_konferensi_norm = LOWER(TRIM(COALESCE(NULLIF(nama_seminar_konferensi, ''), NULLIF(nama_seminar, '')))),
  jenis_perolehan = CASE
    WHEN jenis_perolehan IN ('mandiri', 'kolaborasi_dosen') THEN jenis_perolehan
    WHEN LOWER(CONCAT_WS(' ', title, description, deskripsi, penyelenggara, nama_seminar)) REGEXP 'dosen|pembimbing|co[- ]?author' THEN 'kolaborasi_dosen'
    WHEN LOWER(CONCAT_WS(' ', title, description, deskripsi, penyelenggara, nama_seminar)) REGEXP 'mandiri' THEN 'mandiri'
    ELSE NULL
  END
WHERE (judul_publikasi IS NULL OR judul_publikasi = '')
   OR (judul_publikasi_norm = '')
   OR (nama_seminar_konferensi_norm = '')
   OR tanggal_publikasi IS NULL;

-- ===== LEGACY TABLE RENAME (NO DROP) =====
SET @legacy_suffix := DATE_FORMAT(NOW(), '%Y%m%d%H%i%s');

SET @has_legacy_ach_main := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'achievements'
    AND table_type = 'BASE TABLE'
);
SET @sql := IF(
  @has_legacy_ach_main > 0,
  CONCAT('RENAME TABLE achievements TO achievements_legacy_backup_', @legacy_suffix),
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_legacy_att_main := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'achievement_attachments'
    AND table_type = 'BASE TABLE'
);
SET @sql := IF(
  @has_legacy_att_main > 0,
  CONCAT('RENAME TABLE achievement_attachments TO achievement_attachments_legacy_backup_', @legacy_suffix),
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== FINAL COMPATIBILITY VIEWS =====
CREATE OR REPLACE VIEW achievements AS
SELECT p.id_publikasi AS id, p.id_mahasiswa AS student_id, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_publikasi p
UNION ALL SELECT p.id_portofolio, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_portofolio p
UNION ALL SELECT p.id_lomba, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_lomba p
UNION ALL SELECT p.id_kekayaan_intelektual, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_kekayaan_intelektual p
UNION ALL SELECT p.id_magang, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_magang p
UNION ALL SELECT p.id_produk_mahasiswa, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_produk_mahasiswa p
UNION ALL SELECT p.id_wirausaha, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_wirausaha p
UNION ALL SELECT p.id_pengembangan_diri, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_pengembangan_diri p
UNION ALL SELECT p.id_organisasi, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_organisasi p
UNION ALL SELECT p.id_seminar, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_seminar p;

CREATE OR REPLACE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_publikasi_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_portofolio_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_lomba_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_kekayaan_intelektual_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_magang_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_produk_mahasiswa, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_produk_mahasiswa_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_wirausaha_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_pengembangan_diri_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_organisasi_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_seminar_attachments a WHERE a.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_alumni_overview AS
SELECT s.id, s.nim, s.nama, s.tahun_lulus, s.email, s.no_hp, t.career_status, t.tahun_pengisian, COUNT(DISTINCT a.id) AS total_achievements
FROM students s
LEFT JOIN tracer_study t ON s.id = t.student_id
LEFT JOIN achievements a ON s.id = a.student_id
WHERE (
  CASE
    WHEN s.status_mode = 'manual' THEN s.status
    WHEN s.status_mode = 'auto' THEN
      CASE
        WHEN s.tahun_lulus IS NOT NULL AND s.tahun_lulus <= YEAR(CURDATE()) THEN 'alumni'
        WHEN s.tahun_lulus IS NULL AND YEAR(CURDATE()) >= (s.tahun_masuk + 4) THEN 'alumni'
        ELSE 'active'
      END
    ELSE s.status
  END
) = 'alumni'
GROUP BY s.id, s.nim, s.nama, s.tahun_lulus, s.email, s.no_hp, t.career_status, t.tahun_pengisian;

CREATE OR REPLACE VIEW v_student_achievements_summary AS
SELECT s.id, s.nim, s.nama, s.status, COUNT(a.id) AS total_achievements, COUNT(DISTINCT a.category) AS total_categories,
COUNT(CASE WHEN a.verified = TRUE THEN 1 ELSE NULL END) AS verified_achievements, MAX(a.tanggal) AS latest_achievement_date
FROM students s
LEFT JOIN achievements a ON s.id = a.student_id
GROUP BY s.id, s.nim, s.nama, s.status;

SET FOREIGN_KEY_CHECKS = 1;

