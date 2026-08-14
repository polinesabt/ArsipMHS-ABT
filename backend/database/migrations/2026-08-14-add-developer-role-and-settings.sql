-- Migration: Add developer role to users table and create system_settings table
-- Date: 2026-08-14

ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'student', 'developer') NOT NULL DEFAULT 'student';

CREATE TABLE IF NOT EXISTS system_settings (
  key_name VARCHAR(100) PRIMARY KEY COMMENT 'Setting identifier key',
  value_text TEXT NULL COMMENT 'Setting value text/json',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Global system configurations and feature toggles';

INSERT INTO system_settings (key_name, value_text) 
VALUES ('dosen_module_enabled', 'true')
ON DUPLICATE KEY UPDATE value_text=VALUES(value_text);

INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) 
VALUES ('dev-001', 'developer', '$2y$10$iDs1Idj/xa3J7wT2PzKPE..z7b2.FKk9T67pG5pkNZkXxPGrhePsy', 'Developer System', 'developer', NOW(), 1)
ON DUPLICATE KEY UPDATE role='developer', password_hash='$2y$10$iDs1Idj/xa3J7wT2PzKPE..z7b2.FKk9T67pG5pkNZkXxPGrhePsy';
