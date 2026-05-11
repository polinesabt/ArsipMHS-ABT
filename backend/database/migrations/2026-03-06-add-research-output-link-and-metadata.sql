-- Tambah metadata luaran penelitian untuk sinkronisasi tabel advanced + link
ALTER TABLE prestasi_kekayaan_intelektual
  ADD COLUMN IF NOT EXISTS jenis_perolehan ENUM('mandiri','kolaborasi_dosen') NULL AFTER deskripsi,
  ADD COLUMN IF NOT EXISTS nama_dosen VARCHAR(255) NULL AFTER jenis_perolehan,
  ADD COLUMN IF NOT EXISTS url_publikasi VARCHAR(500) NULL AFTER nama_dosen;
