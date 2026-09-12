-- Portal mandiri tendik. Idempoten untuk MySQL/MariaDB.

ALTER TABLE users
  MODIFY COLUMN role ENUM('admin','student','developer','dosen','tendik','demo') NOT NULL DEFAULT 'student';

SET @tendik_user_id_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tenaga_kependidikan' AND COLUMN_NAME='user_id'
);
SET @tendik_user_id_sql := IF(@tendik_user_id_exists=0,
  'ALTER TABLE tenaga_kependidikan ADD COLUMN user_id VARCHAR(36) NULL AFTER id','SELECT 1');
PREPARE stmt FROM @tendik_user_id_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tendik_user_unique_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tenaga_kependidikan' AND INDEX_NAME='uk_tendik_user_id'
);
SET @tendik_user_unique_sql := IF(@tendik_user_unique_exists=0,
  'ALTER TABLE tenaga_kependidikan ADD UNIQUE KEY uk_tendik_user_id (user_id)','SELECT 1');
PREPARE stmt FROM @tendik_user_unique_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tendik_user_fk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='tenaga_kependidikan'
    AND CONSTRAINT_NAME='fk_tendik_user' AND CONSTRAINT_TYPE='FOREIGN KEY'
);
SET @tendik_user_fk_sql := IF(@tendik_user_fk_exists=0,
  'ALTER TABLE tenaga_kependidikan ADD CONSTRAINT fk_tendik_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL','SELECT 1');
PREPARE stmt FROM @tendik_user_fk_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
