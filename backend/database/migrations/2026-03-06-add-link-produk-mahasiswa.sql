-- Tambah kolom link produk untuk fitur input URL pada form Produk Mahasiswa
ALTER TABLE prestasi_produk_mahasiswa
  ADD COLUMN IF NOT EXISTS link_produk VARCHAR(500) NULL
  AFTER kategori_produk;
