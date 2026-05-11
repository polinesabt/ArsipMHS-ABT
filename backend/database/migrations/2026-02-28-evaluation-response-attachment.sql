-- Add optional attachment path for legacy evaluation form (signed form PDF/PNG).
SET NAMES utf8mb4;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_responses' AND COLUMN_NAME = 'attachment_path');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE evaluation_responses ADD COLUMN attachment_path VARCHAR(512) NULL COMMENT ''Relative path: satisfaction_attachments/...'' AFTER major_job_match',
  'SELECT 1');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
