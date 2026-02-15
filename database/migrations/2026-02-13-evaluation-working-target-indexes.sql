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
