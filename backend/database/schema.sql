-- =====================================================================
-- Arsip Mahasiswa Prodi ABT - Politeknik Negeri Semarang
-- MySQL Database Schema
-- =====================================================================
-- Character Set: utf8mb4
-- Engine: InnoDB
-- Version: 1.0
-- Created: 2026-02-03
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. USERS TABLE - Unified Authentication
-- =====================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Login username (admin or NIM)',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hashed password',
  nama VARCHAR(150) NOT NULL COMMENT 'Full name',
  role ENUM('admin', 'student', 'developer', 'dosen', 'tendik', 'demo') NOT NULL DEFAULT 'student' COMMENT 'User role',
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
  
  -- Identity
  nim VARCHAR(20) UNIQUE NOT NULL COMMENT 'Student ID number',
  nama VARCHAR(100) NOT NULL COMMENT 'Full name',
  
  -- Academic Program (Fixed to ABT)
  jurusan VARCHAR(50) NOT NULL DEFAULT 'Administrasi Bisnis' COMMENT 'Department',
  prodi VARCHAR(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan' COMMENT 'Study Program',
  
  -- Status tracking
  status ENUM('active', 'on_leave', 'dropout', 'alumni') NOT NULL DEFAULT 'active' COMMENT 'Student status',
  status_mode ENUM('manual', 'auto') NOT NULL DEFAULT 'auto' COMMENT 'manual=use status; auto=compute active/alumni from tahun_masuk/tahun_lulus',
  tahun_masuk INT NOT NULL COMMENT 'Year of enrollment',
  tahun_lulus INT NULL COMMENT 'Year of graduation (NULL if not alumni)',
  
  -- Contact
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
  
  -- Auth reference
  user_id VARCHAR(36) UNIQUE NULL COMMENT 'FK to users table',
  has_credentials BOOLEAN DEFAULT FALSE COMMENT 'Has login account',
  last_login TIMESTAMP NULL COMMENT 'Last login',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin user id that moved account to Recycle Bin',
  
  -- Indexes
  INDEX idx_nim (nim),
  INDEX idx_status (status),
  INDEX idx_tahun_lulus (tahun_lulus),
  INDEX idx_email (email),
  INDEX idx_login_email (login_email),
  INDEX idx_pending_login_email (pending_login_email),
  INDEX idx_email_verification_token_hash (email_verification_token_hash),
  INDEX idx_email_verification_otp_hash (email_verification_otp_hash),
  INDEX idx_status_tahun (status, tahun_lulus),
  INDEX idx_deleted_at (deleted_at),
  INDEX idx_deleted_by (deleted_by),
  
  -- Constraints
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
-- 4. TRACER_STUDY TABLE - Alumni Career Tracking (Alumni Only)
-- =====================================================================
CREATE TABLE IF NOT EXISTS tracer_study (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK to students',
  
  -- Contact info
  email VARCHAR(100) NOT NULL COMMENT 'Contact email',
  no_hp VARCHAR(20) NOT NULL COMMENT 'Phone number',
  media_sosial VARCHAR(255) NULL COMMENT 'Social media handle',
  linkedin VARCHAR(255) NULL COMMENT 'LinkedIn URL',
  
  -- Status & Year
  career_status ENUM('working', 'job_seeking', 'entrepreneur', 'further_study') NOT NULL COMMENT 'Career status',
  tahun_pengisian INT NOT NULL COMMENT 'Year of submission',
  
  -- Conditional Data (Polymorphic - stored as JSON)
  employment_data JSON NULL COMMENT 'Employment details (career_status = working)',
  job_seeking_data JSON NULL COMMENT 'Job seeking details (career_status = job_seeking)',
  entrepreneurship_data JSON NULL COMMENT 'Business details (career_status = entrepreneur)',
  further_study_data JSON NULL COMMENT 'Further study details (career_status = further_study)',
  
  -- Additional Info
  ringkasan_karir TEXT NULL COMMENT 'Career summary',
  bersedia_dihubungi BOOLEAN DEFAULT FALSE COMMENT 'Willing to be contacted',
  saran_komentar TEXT NULL COMMENT 'Suggestions/comments',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Submission date',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  
  -- Constraints
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
  
  -- Classification
  category VARCHAR(50) NOT NULL COMMENT 'Achievement category',
  subcategory VARCHAR(50) NOT NULL COMMENT 'Achievement subcategory',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic' COMMENT 'Derived achievement classification',
  
  -- Details
  title VARCHAR(255) NOT NULL COMMENT 'Achievement title',
  description TEXT NULL COMMENT 'Detailed description',
  tanggal DATE NOT NULL COMMENT 'Achievement date',
  lokasi VARCHAR(255) NULL COMMENT 'Location',
  penyelenggara VARCHAR(255) NULL COMMENT 'Organizer/institution',
  
  -- Recognition
  tingkat ENUM('lokal', 'regional', 'nasional', 'internasional') NULL COMMENT 'Achievement level',
  peringkat VARCHAR(100) NULL COMMENT 'Ranking/award (e.g., Juara 1, Finalist)',
  
  -- Status
  verified BOOLEAN DEFAULT FALSE COMMENT 'Admin verified',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  
  -- Indexes
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
  
  -- File metadata
  file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
  file_type VARCHAR(50) NOT NULL COMMENT 'MIME type (e.g., application/pdf)',
  file_size INT NOT NULL COMMENT 'File size in bytes',
  file_path VARCHAR(500) NOT NULL COMMENT 'URL or server path to file',
  
  -- Upload tracking
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Upload timestamp',
  deleted_at TIMESTAMP NULL COMMENT 'Soft delete timestamp (Recycle Bin)',
  deleted_by VARCHAR(36) NULL COMMENT 'Admin/system actor id that moved attachment to Recycle Bin',
  
  -- Indexes
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
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =====================================================================

CREATE INDEX idx_students_status_tahun ON students(status, tahun_lulus DESC);
CREATE INDEX idx_achievements_date ON achievements(tanggal DESC);
CREATE INDEX idx_tracer_tahun ON tracer_study(tahun_pengisian DESC);
CREATE INDEX idx_invitations_eval_submission ON evaluation_invitations(evaluation_id, submitted_at);
CREATE INDEX idx_responses_eval_match ON evaluation_responses(evaluation_id, major_job_match);

-- =====================================================================
-- VIEWS (Optional, for reporting)
-- =====================================================================

-- Alumni Overview
CREATE VIEW v_alumni_overview AS
SELECT 
  s.id,
  s.nim,
  s.nama,
  s.tahun_lulus,
  s.email,
  s.no_hp,
  t.career_status,
  t.tahun_pengisian,
  COUNT(DISTINCT a.id) as total_achievements
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

-- Student Achievement Summary
CREATE VIEW v_student_achievements_summary AS
SELECT 
  s.id,
  s.nim,
  s.nama,
  s.status,
  COUNT(a.id) as total_achievements,
  COUNT(DISTINCT a.category) as total_categories,
  COUNT(CASE WHEN a.verified = TRUE THEN 1 END) as verified_achievements,
  MAX(a.tanggal) as latest_achievement_date
FROM students s
LEFT JOIN achievements a ON s.id = a.student_id
GROUP BY s.id, s.nim, s.nama, s.status;

-- =====================================================================
-- END OF SCHEMA
-- =====================================================================

-- =====================================================================
-- DOSEN PORTAL, TRIDHARMA, TENDIK, AND IMPORT LOGS
-- =====================================================================
CREATE TABLE IF NOT EXISTS dosen (
  id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36) UNIQUE NULL, nidn VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(150) NOT NULL, status_dosen ENUM('Tetap','Tidak Tetap') NOT NULL DEFAULT 'Tetap',
  jabatan VARCHAR(100) NOT NULL DEFAULT 'Asisten Ahli', peran ENUM('Akademisi','Praktisi') NOT NULL DEFAULT 'Akademisi',
  institusi VARCHAR(150) NOT NULL DEFAULT 'Politeknik Negeri Semarang', pendidikan_pasca_sarjana JSON NULL,
  bidang_keahlian VARCHAR(255) NULL, sertifikat_pendidik VARCHAR(100) DEFAULT '-', sertifikat_kompetensi TEXT NULL,
  email VARCHAR(100) NULL, telepon VARCHAR(30) NULL, avatar_color VARCHAR(50) DEFAULT 'from-blue-600 to-indigo-600',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL, deleted_by VARCHAR(36) NULL, INDEX idx_dosen_deleted (deleted_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_archives (
  id VARCHAR(50) PRIMARY KEY, nidn VARCHAR(20) NOT NULL, nama VARCHAR(150) NOT NULL, payload_json LONGTEXT NOT NULL,
  deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME NOT NULL, INDEX idx_arch_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_pengajaran_matkul (
  id VARCHAR(50) PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, tipe_ps ENUM('PS_ABT','PS_LAIN') NOT NULL DEFAULT 'PS_ABT',
  kode_matkul VARCHAR(30) NULL, nama_matkul VARCHAR(150) NOT NULL, sks INT NOT NULL DEFAULT 3, prodi_lain VARCHAR(150) NULL,
  INDEX idx_matkul_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_pengajaran_bahan_ajar (
  id INT AUTO_INCREMENT PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, judul_bahan_ajar VARCHAR(255) NOT NULL,
  INDEX idx_bahan_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_pengajaran_bimbingan (
  id VARCHAR(36) PRIMARY KEY, dosen_id VARCHAR(36) UNIQUE NOT NULL, ps_abt_ps INT NOT NULL DEFAULT 0,
  ps_abt_ps1 INT NOT NULL DEFAULT 0, ps_abt_ps2 INT NOT NULL DEFAULT 0, ps_lain_ps INT NOT NULL DEFAULT 0,
  ps_lain_ps1 INT NOT NULL DEFAULT 0, ps_lain_ps2 INT NOT NULL DEFAULT 0,
  FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_penelitian (
  id VARCHAR(50) PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, judul TEXT NOT NULL,
  kerjasama_instansi VARCHAR(255) NOT NULL DEFAULT 'Mandiri / Internal PT', tahun VARCHAR(10) NOT NULL, skema VARCHAR(100) NULL,
  INDEX idx_penelitian_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_pengabdian (
  id VARCHAR(50) PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, nama_kegiatan TEXT NOT NULL,
  kerjasama_instansi VARCHAR(255) NOT NULL DEFAULT 'Mandiri / Kelompok Masyarakat', tahun VARCHAR(10) NOT NULL, skema VARCHAR(100) NULL,
  INDEX idx_pengabdian_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_rekognisi (
  id INT AUTO_INCREMENT PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, bidang ENUM('Pengajaran','Penelitian','Pengabdian','Umum') DEFAULT 'Umum',
  deskripsi VARCHAR(255) NOT NULL, INDEX idx_rekognisi_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_waktu_mengajar (
  id VARCHAR(36) PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, tahun_akademik VARCHAR(20) NOT NULL DEFAULT '2024/2025',
  pendidikan_ps_abt DECIMAL(4,1) NOT NULL DEFAULT 0, pendidikan_ps_lain DECIMAL(4,1) NOT NULL DEFAULT 0,
  pendidikan_pt_lain DECIMAL(4,1) NOT NULL DEFAULT 0, penelitian DECIMAL(4,1) NOT NULL DEFAULT 0,
  pkm DECIMAL(4,1) NOT NULL DEFAULT 0, tugas_tambahan DECIMAL(4,1) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_ewmp_dosen_tahun (dosen_id,tahun_akademik), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_luaran_penelitian_pkm (
  id VARCHAR(50) PRIMARY KEY, dosen_id VARCHAR(36) NOT NULL, kategori ENUM('Penelitian','PKM') NOT NULL DEFAULT 'Penelitian',
  judul_luaran TEXT NOT NULL, tahun VARCHAR(10) NOT NULL, sumber_pendanaan ENUM('Perguruan Tinggi / Mandiri','Lembaga Dalam Negeri (di luar Perguruan Tinggi)','Lembaga Luar Negeri') NOT NULL DEFAULT 'Perguruan Tinggi / Mandiri',
  jenis_publikasi ENUM('Jurnal Nasional Tidak Terakreditasi','Jurnal Nasional Terakreditasi','Jurnal Internasional','Jurnal Internasional Bereputasi','Seminar Wilayah, Lokal, Perguruan Tinggi','Seminar Nasional','Seminar Internasional','Tulisan di Media Massa Nasional','Tulisan di Media Massa Internasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional') NOT NULL, url_luaran VARCHAR(255) NULL, INDEX idx_luaran_dosen (dosen_id), FOREIGN KEY (dosen_id) REFERENCES dosen(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS tenaga_kependidikan (
  id VARCHAR(50) PRIMARY KEY, user_id VARCHAR(36) UNIQUE NULL, nip VARCHAR(50) UNIQUE NOT NULL, nama VARCHAR(150) NOT NULL, status ENUM('Tetap','Tidak Tetap') NOT NULL DEFAULT 'Tetap',
  jabatan VARCHAR(100) NOT NULL, golongan VARCHAR(100) NULL, pendidikan_d3 TEXT NULL, pendidikan_s1 TEXT NULL, pendidikan_s2 TEXT NULL, pendidikan_s3 TEXT NULL,
  sertifikat_kompetensi LONGTEXT NULL, deleted_at TIMESTAMP NULL, INDEX idx_tendik_deleted (deleted_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_import_logs (
  id VARCHAR(36) PRIMARY KEY, module ENUM('pengelolaan','pengajaran','penelitian','pengabdian','waktu_mengajar','tendik','luaran') NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL, file_name VARCHAR(255) NOT NULL, total_rows INT NOT NULL DEFAULT 0, success_rows INT NOT NULL DEFAULT 0,
  skipped_rows INT NOT NULL DEFAULT 0, failed_rows INT NOT NULL DEFAULT 0, affected_dosen INT NOT NULL DEFAULT 0,
  status ENUM('processing','completed','completed_with_errors','failed') NOT NULL DEFAULT 'processing', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, finished_at TIMESTAMP NULL,
  INDEX idx_import_module_created (module,created_at), INDEX idx_import_uploaded_by (uploaded_by),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS dosen_import_log_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, import_log_id VARCHAR(36) NOT NULL, row_number INT NOT NULL, identity_raw VARCHAR(100) NULL,
  status ENUM('inserted','skipped','error') NOT NULL, message TEXT NOT NULL, raw_payload_json LONGTEXT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_import_detail_log (import_log_id), INDEX idx_import_detail_status (status), FOREIGN KEY (import_log_id) REFERENCES dosen_import_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
