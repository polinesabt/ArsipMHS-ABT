-- =====================================================================
-- Reframe kategori seminar menjadi Publikasi di Seminar (existing model)
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

ALTER TABLE prestasi_seminar
  ADD COLUMN IF NOT EXISTS judul_publikasi VARCHAR(255) NULL AFTER nama_seminar,
  ADD COLUMN IF NOT EXISTS judul_publikasi_norm VARCHAR(255) NOT NULL DEFAULT '' AFTER judul_publikasi,
  ADD COLUMN IF NOT EXISTS level_seminar ENUM('local','national','international') NULL AFTER judul_publikasi_norm,
  ADD COLUMN IF NOT EXISTS jenis_perolehan ENUM('mandiri','kolaborasi_dosen') NULL AFTER level_seminar,
  ADD COLUMN IF NOT EXISTS nama_dosen VARCHAR(255) NULL AFTER jenis_perolehan,
  ADD COLUMN IF NOT EXISTS penulis TEXT NULL AFTER nama_dosen,
  ADD COLUMN IF NOT EXISTS nama_seminar_konferensi VARCHAR(255) NULL AFTER penulis,
  ADD COLUMN IF NOT EXISTS nama_seminar_konferensi_norm VARCHAR(255) NOT NULL DEFAULT '' AFTER nama_seminar_konferensi,
  ADD COLUMN IF NOT EXISTS url_publikasi VARCHAR(500) NULL AFTER nama_seminar_konferensi_norm,
  ADD COLUMN IF NOT EXISTS tanggal_publikasi DATE NULL AFTER url_publikasi;

-- Drop legacy unique key jika masih ada
SET @seminar_legacy_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'prestasi_seminar'
    AND index_name = 'uq_prestasi_seminar'
);
SET @seminar_drop_legacy_idx_sql := IF(
  @seminar_legacy_idx_exists > 0,
  'ALTER TABLE prestasi_seminar DROP INDEX uq_prestasi_seminar',
  'SELECT 1'
);
PREPARE stmt_seminar_drop_legacy_idx FROM @seminar_drop_legacy_idx_sql;
EXECUTE stmt_seminar_drop_legacy_idx;
DEALLOCATE PREPARE stmt_seminar_drop_legacy_idx;

-- Tambah unique key dedupe versi publikasi seminar
SET @seminar_pub_idx_exists := (
  SELECT COUNT(1)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'prestasi_seminar'
    AND index_name = 'uq_prestasi_seminar_publication'
);
SET @seminar_add_pub_idx_sql := IF(
  @seminar_pub_idx_exists = 0,
  'ALTER TABLE prestasi_seminar ADD UNIQUE KEY uq_prestasi_seminar_publication (id_mahasiswa, judul_publikasi_norm, level_seminar, jenis_perolehan, tanggal_publikasi)',
  'SELECT 1'
);
PREPARE stmt_seminar_add_pub_idx FROM @seminar_add_pub_idx_sql;
EXECUTE stmt_seminar_add_pub_idx;
DEALLOCATE PREPARE stmt_seminar_add_pub_idx;

UPDATE prestasi_seminar
SET
  judul_publikasi = COALESCE(NULLIF(TRIM(judul_publikasi), ''), NULLIF(TRIM(title), ''), NULLIF(TRIM(nama_seminar), '')),
  judul_publikasi_norm = LOWER(TRIM(COALESCE(NULLIF(judul_publikasi, ''), NULLIF(title, ''), NULLIF(nama_seminar, '')))),
  level_seminar = COALESCE(
    level_seminar,
    CASE
      WHEN LOWER(COALESCE(tingkat, '')) IN ('lokal', 'regional') THEN 'local'
      WHEN LOWER(COALESCE(tingkat, '')) = 'nasional' THEN 'national'
      WHEN LOWER(COALESCE(tingkat, '')) = 'internasional' THEN 'international'
      ELSE NULL
    END
  ),
  tanggal_publikasi = COALESCE(tanggal_publikasi, tanggal_seminar, tanggal),
  nama_seminar_konferensi = COALESCE(NULLIF(TRIM(nama_seminar_konferensi), ''), NULLIF(TRIM(nama_seminar), '')),
  nama_seminar_konferensi_norm = LOWER(TRIM(COALESCE(NULLIF(nama_seminar_konferensi, ''), NULLIF(nama_seminar, '')))),
  jenis_perolehan = CASE
    WHEN jenis_perolehan IN ('mandiri', 'kolaborasi_dosen') THEN jenis_perolehan
    WHEN LOWER(CONCAT_WS(' ', title, description, deskripsi, penyelenggara, nama_seminar)) REGEXP 'dosen|pembimbing|co[- ]?author' THEN 'kolaborasi_dosen'
    WHEN LOWER(CONCAT_WS(' ', title, description, deskripsi, penyelenggara, nama_seminar)) REGEXP 'mandiri' THEN 'mandiri'
    ELSE NULL
  END;

SET FOREIGN_KEY_CHECKS = 1;
