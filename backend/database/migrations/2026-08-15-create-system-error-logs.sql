-- Migration: Create system_error_logs table for developer debug view
-- Date: 2026-08-15

CREATE TABLE IF NOT EXISTS system_error_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID v4',
  user_id VARCHAR(36) NULL COMMENT 'FK to users/student id if authenticated',
  username VARCHAR(100) NULL COMMENT 'Username or NIM of user',
  role ENUM('student', 'admin', 'developer', 'guest') NOT NULL DEFAULT 'guest' COMMENT 'User role when error occurred',
  feature_name VARCHAR(100) NOT NULL COMMENT 'Feature module name e.g. Evaluasi Lulusan, Login',
  error_message TEXT NOT NULL COMMENT 'Error message content',
  stack_trace TEXT NULL COMMENT 'Technical stack trace or details',
  url TEXT NULL COMMENT 'Page or API URL where error occurred',
  user_agent TEXT NULL COMMENT 'Client browser user agent',
  ip_address VARCHAR(45) NULL COMMENT 'Client IP address',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Log timestamp',
  INDEX idx_error_logs_created_at (created_at),
  INDEX idx_error_logs_role (role),
  INDEX idx_error_logs_feature (feature_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System error logs for developer debugging';
