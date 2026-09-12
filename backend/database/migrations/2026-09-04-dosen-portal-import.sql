-- Portal Dosen dan impor Excel terintegrasi.
-- Idempoten untuk MySQL/MariaDB yang digunakan aplikasi.

ALTER TABLE users
  MODIFY COLUMN role ENUM('admin', 'student', 'developer', 'dosen') NOT NULL DEFAULT 'student';

ALTER TABLE users MODIFY COLUMN nama VARCHAR(150) NOT NULL;

SET @dosen_user_id_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dosen' AND COLUMN_NAME = 'user_id'
);
SET @dosen_user_id_sql := IF(
  @dosen_user_id_exists = 0,
  'ALTER TABLE dosen ADD COLUMN user_id VARCHAR(36) NULL AFTER id',
  'SELECT 1'
);
PREPARE stmt FROM @dosen_user_id_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @dosen_user_id_unique_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dosen' AND INDEX_NAME = 'uk_dosen_user_id'
);
SET @dosen_user_id_unique_sql := IF(
  @dosen_user_id_unique_exists = 0,
  'ALTER TABLE dosen ADD UNIQUE KEY uk_dosen_user_id (user_id)',
  'SELECT 1'
);
PREPARE stmt FROM @dosen_user_id_unique_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @dosen_user_id_fk_exists := (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE() AND TABLE_NAME = 'dosen'
    AND CONSTRAINT_NAME = 'fk_dosen_user' AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @dosen_user_id_fk_sql := IF(
  @dosen_user_id_fk_exists = 0,
  'ALTER TABLE dosen ADD CONSTRAINT fk_dosen_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @dosen_user_id_fk_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @tendik_golongan_exists := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tenaga_kependidikan' AND COLUMN_NAME = 'golongan'
);
SET @tendik_golongan_sql := IF(
  @tendik_golongan_exists = 0,
  'ALTER TABLE tenaga_kependidikan ADD COLUMN golongan VARCHAR(100) NULL AFTER jabatan',
  'SELECT 1'
);
PREPARE stmt FROM @tendik_golongan_sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS dosen_import_logs (
  id VARCHAR(36) PRIMARY KEY,
  module ENUM('pengelolaan','pengajaran','penelitian','pengabdian','waktu_mengajar','tendik','luaran') NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  total_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  skipped_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  affected_dosen INT NOT NULL DEFAULT 0,
  status ENUM('processing','completed','completed_with_errors','failed') NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  KEY idx_dosen_import_module_created (module, created_at),
  KEY idx_dosen_import_uploaded_by (uploaded_by),
  CONSTRAINT fk_dosen_import_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dosen_import_log_details (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  import_log_id VARCHAR(36) NOT NULL,
  row_number INT NOT NULL,
  identity_raw VARCHAR(100) NULL,
  status ENUM('inserted','skipped','error') NOT NULL,
  message TEXT NOT NULL,
  raw_payload_json LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_dosen_import_detail_log (import_log_id),
  KEY idx_dosen_import_detail_status (status),
  CONSTRAINT fk_dosen_import_detail_log FOREIGN KEY (import_log_id) REFERENCES dosen_import_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
