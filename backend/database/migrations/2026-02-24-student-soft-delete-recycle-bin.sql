-- Soft delete support untuk recycle bin akun mahasiswa.
-- Menyimpan metadata penghapus dan waktu penghapusan.

ALTER TABLE students
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);
