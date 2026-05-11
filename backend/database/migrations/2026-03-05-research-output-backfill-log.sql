-- Log table for idempotent research_output backfill from legacy achievement categories.
CREATE TABLE IF NOT EXISTS research_output_backfill_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL,
  source_achievement_id VARCHAR(64) NOT NULL,
  source_category VARCHAR(64) NOT NULL,
  source_subcategory VARCHAR(64) NULL,
  target_achievement_id VARCHAR(64) NULL,
  status ENUM('inserted', 'skipped_existing', 'unmapped', 'failed') NOT NULL,
  note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_research_output_backfill_source (source_table, source_achievement_id),
  INDEX idx_research_output_backfill_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
