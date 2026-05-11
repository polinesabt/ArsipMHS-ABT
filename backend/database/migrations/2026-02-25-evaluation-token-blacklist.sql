-- Migration: evaluation_token_blacklist for superseded tokens when admin resends link
-- Run once; safe if table already exists (CREATE IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS evaluation_token_blacklist (
  token VARCHAR(128) PRIMARY KEY COMMENT 'Superseded access_token',
  evaluation_id VARCHAR(36) NOT NULL COMMENT 'FK to evaluations',
  invalidated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When token was replaced by resend',
  INDEX idx_blacklist_evaluation (evaluation_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tokens invalidated when admin resends evaluation link';
