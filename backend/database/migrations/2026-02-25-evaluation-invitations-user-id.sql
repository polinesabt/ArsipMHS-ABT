-- Migration: Add user_id to evaluation_invitations for token-only survey access (Opsi A)
-- Date: 2026-02-25
-- Enables resolving invitation by token without joining students for user context.

SET NAMES utf8mb4;

-- Add user_id column if not present (nullable for existing rows)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_invitations' AND COLUMN_NAME = 'user_id');
SET @sql = IF(@col_exists = 0,
  'ALTER TABLE evaluation_invitations ADD COLUMN user_id VARCHAR(36) NULL COMMENT ''FK to users (student account)'' AFTER student_id, ADD INDEX idx_invitations_user_id (user_id)',
  'SELECT ''Column user_id already exists'' AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill user_id from students
UPDATE evaluation_invitations ei
  INNER JOIN students s ON s.id = ei.student_id AND s.deleted_at IS NULL
  SET ei.user_id = s.user_id
  WHERE ei.user_id IS NULL AND s.user_id IS NOT NULL;
