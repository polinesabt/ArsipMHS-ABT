-- Migration: Add Graduate Evaluation module tables (compatible with legacy schema)
-- Date: 2026-02-13
-- Target DB: arsipmhs
--
-- Notes:
-- 1) This migration is intentionally FK-light to stay compatible with existing
--    legacy tables that may not have primary/unique indexes yet.
-- 2) Data integrity is enforced via unique constraints and API validation.

SET NAMES utf8mb4;

-- ===============================================================
-- 1) EVALUATIONS
-- ===============================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  title VARCHAR(255) NOT NULL COMMENT 'Evaluation title',
  short_message VARCHAR(500) DEFAULT NULL COMMENT 'Short notification message',
  status ENUM('active', 'closed') NOT NULL DEFAULT 'active' COMMENT 'Evaluation lifecycle status',
  start_at DATETIME NOT NULL COMMENT 'Evaluation start date-time',
  end_at DATETIME DEFAULT NULL COMMENT 'Evaluation end date-time',
  reminder_enabled TINYINT(1) DEFAULT 1 COMMENT 'Enable automatic reminder',
  reminder_interval_days INT NOT NULL DEFAULT 7 COMMENT 'Auto reminder interval in days',
  created_by VARCHAR(36) NOT NULL COMMENT 'Admin creator user id',
  closed_by VARCHAR(36) DEFAULT NULL COMMENT 'Admin closer user id',
  closed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Closed timestamp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (id),
  KEY idx_evaluations_status (status),
  KEY idx_evaluations_period (start_at, end_at),
  KEY idx_evaluations_creator (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Graduate evaluation campaigns';

-- ===============================================================
-- 2) EVALUATION_ASPECTS
-- ===============================================================
CREATE TABLE IF NOT EXISTS evaluation_aspects (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  code VARCHAR(50) NOT NULL COMMENT 'Stable aspect code',
  name VARCHAR(255) NOT NULL COMMENT 'Aspect display label',
  sort_order INT NOT NULL COMMENT 'Display order',
  is_active TINYINT(1) DEFAULT 1 COMMENT 'Aspect active flag',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (id),
  UNIQUE KEY uk_evaluation_aspects_code (code),
  KEY idx_aspects_active_order (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master list of evaluation aspects';

-- ===============================================================
-- 3) EVALUATION_INVITATIONS
-- ===============================================================
CREATE TABLE IF NOT EXISTS evaluation_invitations (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to evaluations.id',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to students.id',
  access_token VARCHAR(128) NOT NULL COMMENT 'Secure survey access token',
  first_sent_at TIMESTAMP NULL DEFAULT NULL COMMENT 'First invitation sent timestamp',
  last_sent_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Latest invitation/reminder sent timestamp',
  send_count INT NOT NULL DEFAULT 0 COMMENT 'How many times invitation/reminder sent',
  submitted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Survey submission timestamp',
  created_by VARCHAR(36) DEFAULT NULL COMMENT 'Admin sender/creator user id',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (id),
  UNIQUE KEY uk_invitations_evaluation_student (evaluation_id, student_id),
  UNIQUE KEY uk_invitations_access_token (access_token),
  KEY idx_invitations_evaluation (evaluation_id),
  KEY idx_invitations_student (student_id),
  KEY idx_invitations_submitted (submitted_at),
  KEY idx_invitations_reminder_due (submitted_at, last_sent_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Invitation mapping between evaluation and alumni';

-- ===============================================================
-- 4) EVALUATION_RESPONSES
-- ===============================================================
CREATE TABLE IF NOT EXISTS evaluation_responses (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to evaluations.id',
  invitation_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to evaluation_invitations.id',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to students.id',
  company_name VARCHAR(255) NOT NULL COMMENT 'Company name',
  company_address TEXT NOT NULL COMMENT 'Company address',
  employee_name VARCHAR(255) NOT NULL COMMENT 'Employee being evaluated',
  graduation_year INT NOT NULL COMMENT 'Graduation year of employee',
  study_program VARCHAR(150) NOT NULL COMMENT 'Study program',
  current_work_division VARCHAR(255) NOT NULL COMMENT 'Current work division/field',
  major_job_match ENUM('ya', 'tidak') NOT NULL COMMENT 'Is major relevant to current work',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Response submission timestamp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  PRIMARY KEY (id),
  UNIQUE KEY uk_response_invitation (invitation_id),
  UNIQUE KEY uk_response_evaluation_student (evaluation_id, student_id),
  KEY idx_responses_evaluation (evaluation_id),
  KEY idx_responses_student (student_id),
  KEY idx_responses_match (major_job_match),
  KEY idx_responses_submitted (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Survey response header data';

-- ===============================================================
-- 5) EVALUATION_RESPONSE_RATINGS
-- ===============================================================
CREATE TABLE IF NOT EXISTS evaluation_response_ratings (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  response_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to evaluation_responses.id',
  aspect_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to evaluation_aspects.id',
  score TINYINT UNSIGNED NOT NULL COMMENT 'Rating score: 1-5',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  PRIMARY KEY (id),
  UNIQUE KEY uk_response_aspect (response_id, aspect_id),
  KEY idx_ratings_response (response_id),
  KEY idx_ratings_aspect (aspect_id),
  KEY idx_ratings_score (score),
  KEY idx_ratings_aspect_score (aspect_id, score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Per-aspect rating values for each response';

-- ===============================================================
-- 6) STUDENT_NOTIFICATIONS
-- ===============================================================
CREATE TABLE IF NOT EXISTS student_notifications (
  id VARCHAR(36) NOT NULL COMMENT 'UUID-like id',
  student_id VARCHAR(36) NOT NULL COMMENT 'FK-like reference to students.id',
  evaluation_id VARCHAR(36) DEFAULT NULL COMMENT 'FK-like reference to evaluations.id',
  invitation_id VARCHAR(36) DEFAULT NULL COMMENT 'FK-like reference to evaluation_invitations.id',
  type ENUM('invitation', 'reminder') NOT NULL COMMENT 'Notification type',
  title VARCHAR(255) NOT NULL COMMENT 'Notification title',
  message VARCHAR(500) NOT NULL COMMENT 'Notification message',
  link_path VARCHAR(500) NOT NULL COMMENT 'Frontend route/path with token',
  is_read TINYINT(1) DEFAULT 0 COMMENT 'Read status',
  read_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Read timestamp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  PRIMARY KEY (id),
  KEY idx_notifications_student (student_id),
  KEY idx_notifications_read (student_id, is_read),
  KEY idx_notifications_created (created_at),
  KEY idx_notifications_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='In-app notification storage for students';

-- ===============================================================
-- 7) Supporting index for faster admin filtering
-- ===============================================================
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND INDEX_NAME = 'idx_students_eval_filter'
);
SET @idx_sql := IF(
  @idx_exists = 0,
  'ALTER TABLE students ADD INDEX idx_students_eval_filter (status, tahun_masuk, tahun_lulus)',
  'SELECT "idx_students_eval_filter already exists"'
);
PREPARE stmt FROM @idx_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===============================================================
-- 8) Seed default aspects (idempotent)
-- ===============================================================
INSERT INTO evaluation_aspects (id, code, name, sort_order, is_active, created_at, updated_at) VALUES
('asp-001', 'etika', 'Etika', 1, 1, NOW(), NOW()),
('asp-002', 'kompetensi_utama', 'Keahlian pada bidang ilmu (kompetensi utama)', 2, 1, NOW(), NOW()),
('asp-003', 'bahasa_asing', 'Kemampuan berbahasa asing', 3, 1, NOW(), NOW()),
('asp-004', 'teknologi_informasi', 'Penggunaan teknologi informasi', 4, 1, NOW(), NOW()),
('asp-005', 'komunikasi', 'Kemampuan berkomunikasi', 5, 1, NOW(), NOW()),
('asp-006', 'kerjasama', 'Kerjasama', 6, 1, NOW(), NOW()),
('asp-007', 'pengembangan_diri', 'Pengembangan diri', 7, 1, NOW(), NOW()),
('asp-008', 'loyalitas_tujuan', 'Loyalitas terhadap tujuan perusahaan', 8, 1, NOW(), NOW()),
('asp-009', 'integritas_pergaulan', 'Integritas diri dalam pergaulan di perusahaan', 9, 1, NOW(), NOW()),
('asp-010', 'manajemen_waktu', 'Kemampuan mengelola waktu kerja', 10, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sort_order = VALUES(sort_order),
  is_active = VALUES(is_active),
  updated_at = NOW();
