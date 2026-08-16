-- Migration: Add module permissions (can_edit_dosen, can_edit_mahasiswa) to admins table
-- Date: 2026-08-15

-- 1. Pastikan tabel admins ada
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(36) PRIMARY KEY COMMENT 'FK to users.id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Admin creation date',
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Admin role mapping';

-- 2. Tambah kolom can_edit_dosen jika belum ada
SET @col_dosen_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'can_edit_dosen'
);

SET @sql_dosen := IF(@col_dosen_exists = 0,
  'ALTER TABLE admins ADD COLUMN can_edit_dosen TINYINT(1) NOT NULL DEFAULT 1 COMMENT \'Permission to edit dosen data\'',
  'SELECT 1'
);
PREPARE stmt_dosen FROM @sql_dosen;
EXECUTE stmt_dosen;
DEALLOCATE PREPARE stmt_dosen;

-- 3. Tambah kolom can_edit_mahasiswa jika belum ada
SET @col_mhs_exists := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'can_edit_mahasiswa'
);

SET @sql_mhs := IF(@col_mhs_exists = 0,
  'ALTER TABLE admins ADD COLUMN can_edit_mahasiswa TINYINT(1) NOT NULL DEFAULT 1 COMMENT \'Permission to edit mahasiswa data\'',
  'SELECT 1'
);
PREPARE stmt_mhs FROM @sql_mhs;
EXECUTE stmt_mhs;
DEALLOCATE PREPARE stmt_mhs;

-- 4. Pastikan semua user bertipe admin terdaftar di tabel admins
INSERT IGNORE INTO admins (id, created_at, can_edit_dosen, can_edit_mahasiswa)
SELECT id, NOW(), 1, 1
FROM users
WHERE role = 'admin';
