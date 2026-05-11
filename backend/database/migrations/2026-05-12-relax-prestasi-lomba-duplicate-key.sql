-- Relax duplicate validation for prestasi_lomba.
-- Old unique key:
--   id_mahasiswa + nama_lomba_norm + tingkat + tanggal_mulai
-- New unique key:
--   id_mahasiswa + nama_lomba_norm + tingkat + tanggal_mulai + penyelenggara_norm
--
-- This migration is idempotent for existing databases. If exact duplicate rows
-- already exist under the new key, it leaves the unique index unchanged and
-- returns a diagnostic SELECT so the duplicates can be merged first.

SET @has_prestasi_lomba_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
);

SET @has_penyelenggara_norm_column := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
    AND COLUMN_NAME = 'penyelenggara_norm'
);

SET @sql := IF(
  @has_prestasi_lomba_table = 1 AND @has_penyelenggara_norm_column = 0,
  'ALTER TABLE prestasi_lomba ADD COLUMN penyelenggara_norm VARCHAR(255) NOT NULL DEFAULT '''' AFTER nama_lomba_norm',
  'SELECT ''prestasi_lomba.penyelenggara_norm already exists or table is missing'' AS migration_note'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE prestasi_lomba
SET penyelenggara_norm = LOWER(TRIM(COALESCE(penyelenggara, '')))
WHERE COALESCE(penyelenggara_norm, '') = '';

SET @duplicate_groups := (
  SELECT COUNT(*)
  FROM (
    SELECT
      id_mahasiswa,
      nama_lomba_norm,
      tingkat,
      tanggal_mulai,
      penyelenggara_norm,
      COUNT(*) AS row_count
    FROM prestasi_lomba
    GROUP BY id_mahasiswa, nama_lomba_norm, tingkat, tanggal_mulai, penyelenggara_norm
    HAVING COUNT(*) > 1
  ) duplicate_check
);

SET @has_uq_prestasi_lomba := (
  SELECT COUNT(DISTINCT INDEX_NAME)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
    AND INDEX_NAME = 'uq_prestasi_lomba'
);

SET @has_uq_prestasi_lomba_with_penyelenggara := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
    AND INDEX_NAME = 'uq_prestasi_lomba'
    AND COLUMN_NAME = 'penyelenggara_norm'
);

SET @sql := IF(
  @duplicate_groups = 0
    AND @has_uq_prestasi_lomba > 0
    AND @has_uq_prestasi_lomba_with_penyelenggara = 0,
  'ALTER TABLE prestasi_lomba DROP INDEX uq_prestasi_lomba',
  'SELECT ''uq_prestasi_lomba drop skipped'' AS migration_note'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_uq_prestasi_lomba_after_drop := (
  SELECT COUNT(DISTINCT INDEX_NAME)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
    AND INDEX_NAME = 'uq_prestasi_lomba'
);

SET @has_new_uq_prestasi_lomba := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_lomba'
    AND INDEX_NAME = 'uq_prestasi_lomba'
    AND COLUMN_NAME = 'penyelenggara_norm'
);

SET @sql := IF(
  @duplicate_groups = 0
    AND @has_uq_prestasi_lomba_after_drop = 0
    AND @has_new_uq_prestasi_lomba = 0,
  'ALTER TABLE prestasi_lomba ADD UNIQUE KEY uq_prestasi_lomba (id_mahasiswa, nama_lomba_norm, tingkat, tanggal_mulai, penyelenggara_norm)',
  'SELECT ''uq_prestasi_lomba add skipped; check duplicate groups if value is greater than 0'' AS migration_note, @duplicate_groups AS duplicate_groups'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT
  @duplicate_groups AS duplicate_groups_remaining,
  'If duplicate_groups_remaining is 0, prestasi_lomba now allows same name/level/year with different penyelenggara.' AS migration_result;
