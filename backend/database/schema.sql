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
  
  -- Identity
  nim VARCHAR(20) UNIQUE NOT NULL COMMENT 'Student ID number',
  nama VARCHAR(100) NOT NULL COMMENT 'Full name',
  
  -- Academic Program (Fixed to ABT)
  jurusan VARCHAR(50) NOT NULL DEFAULT 'Administrasi Bisnis' COMMENT 'Department',
  prodi VARCHAR(100) NOT NULL DEFAULT 'Administrasi Bisnis Terapan' COMMENT 'Study Program',
  
  -- Status tracking
  status ENUM('active', 'on_leave', 'dropout', 'alumni') NOT NULL DEFAULT 'active' COMMENT 'Student status',
  tahun_masuk INT NOT NULL COMMENT 'Year of enrollment',
  tahun_lulus INT NULL COMMENT 'Year of graduation (NULL if not alumni)',
  
  -- Contact
  email VARCHAR(100) NULL UNIQUE COMMENT 'Email address',
  no_hp VARCHAR(20) NULL COMMENT 'Phone number',
  alamat TEXT NULL COMMENT 'Address',
  
  -- Auth reference
  user_id VARCHAR(36) UNIQUE NULL COMMENT 'FK to users table',
  has_credentials BOOLEAN DEFAULT FALSE COMMENT 'Has login account',
  last_login TIMESTAMP NULL COMMENT 'Last login',
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update',
  
  -- Indexes
  INDEX idx_nim (nim),
  INDEX idx_status (status),
  INDEX idx_tahun_lulus (tahun_lulus),
  INDEX idx_email (email),
  INDEX idx_status_tahun (status, tahun_lulus),
  
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
  student_id VARCHAR(36) UNIQUE NOT NULL COMMENT 'FK to students (UNIQUE - one per student)',
  
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
  
  -- Indexes
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  INDEX idx_achievement_id (achievement_id),
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

  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (closed_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT check_evaluation_period CHECK (end_at IS NULL OR end_at >= start_at),
  CONSTRAINT check_reminder_days CHECK (reminder_interval_days >= 1 AND reminder_interval_days <= 365),
  INDEX idx_evaluations_status (status),
  INDEX idx_evaluations_period (start_at, end_at),
  INDEX idx_evaluations_creator (created_by)
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
WHERE s.status = 'alumni'
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

SET FOREIGN_KEY_CHECKS = 1;
