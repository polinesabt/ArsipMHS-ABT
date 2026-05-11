-- =====================================================================
-- Replace Semua Akun Admin Production ke AdminABT (Hard Replace + Remap)
-- =====================================================================
-- Tujuan:
-- 1) Pastikan akun admin baru aktif:
--    username: AdminABT
--    password: PoliABT*2026
--    hash: $2y$10$gY76DZwn/z29rTfpVDNyVO2XfCRmbY0UhvG/1uxbDLEZI2TSQGPS2
-- 2) Remap referensi admin lama -> admin baru
-- 3) Hapus semua akun admin lama
-- 4) Menyisakan 1 akun admin aktif
--
-- Catatan penting:
-- - Jalankan di DB production yang aktif (phpMyAdmin > pilih DB dulu).
-- - Jika username AdminABT sudah dipakai role selain admin, hentikan proses.
-- =====================================================================

-- =========================
-- PRECHECK (manual)
-- =========================
SELECT id, username, role
FROM users
WHERE LOWER(username) = LOWER('AdminABT');

-- Jika hasil ada role selain 'admin': STOP.
-- Jika kosong / hanya role admin: lanjutkan.

START TRANSACTION;

SET @new_username := 'AdminABT';
SET @new_nama := 'Administrator Arsip ABT';
SET @new_password_hash := '$2y$10$gY76DZwn/z29rTfpVDNyVO2XfCRmbY0UhvG/1uxbDLEZI2TSQGPS2';

-- Jika AdminABT sudah ada sebagai admin, gunakan ID existing agar tidak bentrok UNIQUE username.
-- Jika belum ada, pakai ID default.
SET @new_admin_id := COALESCE(
  (
    SELECT id
    FROM users
    WHERE LOWER(username) = LOWER(@new_username)
      AND role = 'admin'
    LIMIT 1
  ),
  'admin-abt-001'
);

DROP TEMPORARY TABLE IF EXISTS tmp_old_admins;
CREATE TEMPORARY TABLE tmp_old_admins (
  id VARCHAR(36) PRIMARY KEY
);

-- Ambil semua admin lama (kecuali ID admin baru).
INSERT INTO tmp_old_admins (id)
SELECT id
FROM admins
WHERE id <> @new_admin_id;

-- Upsert akun admin baru di users.
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active)
VALUES (@new_admin_id, @new_username, @new_password_hash, @new_nama, 'admin', NOW(), 1)
ON DUPLICATE KEY UPDATE
  username = VALUES(username),
  password_hash = VALUES(password_hash),
  nama = VALUES(nama),
  role = 'admin',
  is_active = 1;

-- Pastikan mapping admin ada.
INSERT IGNORE INTO admins (id, created_at)
VALUES (@new_admin_id, NOW());

-- ==========================================================
-- Remap referensi admin lama -> admin baru (safe if exists)
-- ==========================================================

-- evaluations.created_by (FK RESTRICT, wajib diremap)
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluations'
    AND COLUMN_NAME = 'created_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE evaluations e JOIN tmp_old_admins oa ON e.created_by = oa.id SET e.created_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- evaluations.closed_by
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluations'
    AND COLUMN_NAME = 'closed_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE evaluations e JOIN tmp_old_admins oa ON e.closed_by = oa.id SET e.closed_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- evaluations.deleted_by
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluations'
    AND COLUMN_NAME = 'deleted_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE evaluations e JOIN tmp_old_admins oa ON e.deleted_by = oa.id SET e.deleted_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- evaluation_invitations.created_by
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'evaluation_invitations'
    AND COLUMN_NAME = 'created_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE evaluation_invitations ei JOIN tmp_old_admins oa ON ei.created_by = oa.id SET ei.created_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- chart_sync_log.synced_by
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'chart_sync_log'
    AND COLUMN_NAME = 'synced_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE chart_sync_log c JOIN tmp_old_admins oa ON c.synced_by = oa.id SET c.synced_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- record_change_logs.admin_id
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'record_change_logs'
    AND COLUMN_NAME = 'admin_id'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE record_change_logs r JOIN tmp_old_admins oa ON r.admin_id = oa.id SET r.admin_id = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- export_logs.admin_id
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'export_logs'
    AND COLUMN_NAME = 'admin_id'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE export_logs e JOIN tmp_old_admins oa ON e.admin_id = oa.id SET e.admin_id = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- students.deleted_by
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND COLUMN_NAME = 'deleted_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE students s JOIN tmp_old_admins oa ON s.deleted_by = oa.id SET s.deleted_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- prestasi_import_logs.uploaded_by (FK RESTRICT, jika tabel ada)
SET @exists_col := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'prestasi_import_logs'
    AND COLUMN_NAME = 'uploaded_by'
);
SET @sql := IF(@exists_col > 0,
  'UPDATE prestasi_import_logs p JOIN tmp_old_admins oa ON p.uploaded_by = oa.id SET p.uploaded_by = @new_admin_id',
  'SELECT 1'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================
-- Hapus admin lama
-- =========================
DELETE a
FROM admins a
JOIN tmp_old_admins oa ON oa.id = a.id;

DELETE u
FROM users u
JOIN tmp_old_admins oa ON oa.id = u.id
WHERE u.role = 'admin';

DROP TEMPORARY TABLE IF EXISTS tmp_old_admins;

COMMIT;

-- =========================
-- VALIDASI
-- =========================
SELECT id, username, role, is_active
FROM users
WHERE role = 'admin';

SELECT *
FROM admins;
