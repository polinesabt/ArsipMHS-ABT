-- =====================================================================
-- Chart Records & Advanced Settings Dashboard
-- Migration: menu_*_records, record_change_logs, export_logs, chart_sync_log
-- Timezone: store in server default; app uses Asia/Jakarta for display
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================================
-- 1. CHART_SYNC_LOG - Last sync time per section (for tooltip)
-- =====================================================================
CREATE TABLE IF NOT EXISTS chart_sync_log (
  menu_section VARCHAR(80) PRIMARY KEY COMMENT 'e.g. student_achievements, study_period',
  last_synced_at TIMESTAMP NULL COMMENT 'Last sync from master (Asia/Jakarta)',
  synced_by VARCHAR(36) NULL COMMENT 'FK users.id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_last_synced (last_synced_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Last sync time per dashboard section';

-- =====================================================================
-- 2. RECORD_CHANGE_LOGS - Audit trail for menu_*_records
-- =====================================================================
CREATE TABLE IF NOT EXISTS record_change_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  menu_section VARCHAR(80) NOT NULL COMMENT 'Section id',
  record_id VARCHAR(36) NOT NULL COMMENT 'PK of menu_*_records row',
  action ENUM('created', 'updated', 'deleted') NOT NULL,
  admin_id VARCHAR(36) NOT NULL COMMENT 'FK users.id',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Asia/Jakarta',
  old_data JSON NULL COMMENT 'Snapshot before change',
  new_data JSON NULL COMMENT 'Snapshot after change',
  INDEX idx_menu_section (menu_section),
  INDEX idx_record (menu_section, record_id),
  INDEX idx_admin (admin_id),
  INDEX idx_changed_at (changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail for chart record changes';

-- =====================================================================
-- 3. EXPORT_LOGS - Who exported what, when
-- =====================================================================
CREATE TABLE IF NOT EXISTS export_logs (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID',
  admin_id VARCHAR(36) NOT NULL COMMENT 'FK users.id',
  menu_section VARCHAR(80) NOT NULL,
  format ENUM('csv', 'xlsx', 'pdf') NOT NULL,
  filters JSON NULL COMMENT 'e.g. {"year": 2024}',
  exported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Asia/Jakarta',
  INDEX idx_admin (admin_id),
  INDEX idx_menu_section (menu_section),
  INDEX idx_exported_at (exported_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Export audit log';

-- =====================================================================
-- 4. MENU_*_RECORDS - One table per dashboard section (source of truth for charts)
-- =====================================================================

-- Helper: same structure for all menu_*_records
-- id, source_table, source_id, snapshot_*, tahun_pelaporan, payload (JSON), deleted_at, created_at, updated_at

CREATE TABLE IF NOT EXISTS menu_student_achievements_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL COMMENT 'achievements.id',
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL COMMENT 'Year for reporting',
  payload JSON NOT NULL COMMENT 'Chart/export data snapshot',
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan),
  INDEX idx_snapshot_nim (snapshot_nim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_study_period_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'students',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_waiting_time_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_job_relevance_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_work_coverage_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'tracer_study',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_user_satisfaction_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'evaluation_responses',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_publications_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_active_students_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'students',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_student_products_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS menu_research_outputs_records (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL DEFAULT 'achievements',
  source_id VARCHAR(36) NOT NULL,
  snapshot_nim VARCHAR(20) NOT NULL,
  snapshot_nama VARCHAR(100) NOT NULL,
  snapshot_prodi VARCHAR(100) NOT NULL,
  snapshot_fakultas VARCHAR(100) NOT NULL,
  tahun_pelaporan INT NOT NULL,
  payload JSON NOT NULL,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_source (source_table, source_id),
  INDEX idx_deleted (deleted_at),
  INDEX idx_tahun (tahun_pelaporan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
