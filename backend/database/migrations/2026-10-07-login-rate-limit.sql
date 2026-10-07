CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  ip_hash CHAR(64) NOT NULL,
  identifier_hash CHAR(64) NOT NULL,
  failed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_login_attempts_pair (ip_hash, identifier_hash, failed_at),
  INDEX idx_login_attempts_ip (ip_hash, failed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
