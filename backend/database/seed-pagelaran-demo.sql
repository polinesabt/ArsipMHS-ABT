-- =====================================================================
-- Seed cepat: data demo untuk tab Diseminasi "Pagelaran / Presentasi"
-- =====================================================================
-- Tujuan:
-- 1) Menambahkan contoh data pagelaran/presentasi ke prestasi_seminar
-- 2) Agar setelah sync, tab Insight "Pagelaran / Presentasi" langsung terisi
--
-- Aman dijalankan berulang (ON DUPLICATE KEY UPDATE).
-- Script ini menargetkan NIM seed default: 20200011, 20200015, 20200018.
-- Jika NIM tidak ada, baris terkait akan dilewati otomatis.
-- =====================================================================

USE arsipmhs;
SET NAMES utf8mb4;

INSERT INTO prestasi_seminar (
  id_seminar,
  id_mahasiswa,
  title,
  description,
  tanggal,
  lokasi,
  penyelenggara,
  tingkat,
  peringkat,
  category,
  subcategory,
  achievement_type,
  verified,
  nama_seminar,
  nama_seminar_norm,
  penyelenggara_norm,
  peran_seminar,
  mode_seminar,
  tanggal_seminar,
  deskripsi,
  created_at,
  updated_at
)
SELECT
  'seed-pagelaran-20200011',
  s.id,
  'Presentasi Konferensi Manajemen Terapan',
  'Presentasi hasil studi kasus bisnis digital pada konferensi nasional.',
  '2025-03-18',
  'Yogyakarta',
  'Forum Dosen ABT Indonesia',
  'nasional',
  NULL,
  'event_participation',
  'conference',
  'non_academic',
  TRUE,
  'Konferensi Manajemen Terapan 2025',
  'konferensi manajemen terapan 2025',
  'forum dosen abt indonesia',
  'pembicara',
  'offline',
  '2025-03-18',
  'Presentasi hasil studi kasus bisnis digital pada konferensi nasional.',
  NOW(),
  NOW()
FROM students s
WHERE s.nim = '20200011' AND s.deleted_at IS NULL
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  tanggal = VALUES(tanggal),
  lokasi = VALUES(lokasi),
  penyelenggara = VALUES(penyelenggara),
  tingkat = VALUES(tingkat),
  category = VALUES(category),
  subcategory = VALUES(subcategory),
  achievement_type = VALUES(achievement_type),
  verified = VALUES(verified),
  nama_seminar = VALUES(nama_seminar),
  nama_seminar_norm = VALUES(nama_seminar_norm),
  penyelenggara_norm = VALUES(penyelenggara_norm),
  peran_seminar = VALUES(peran_seminar),
  mode_seminar = VALUES(mode_seminar),
  tanggal_seminar = VALUES(tanggal_seminar),
  deskripsi = VALUES(deskripsi),
  updated_at = NOW();

INSERT INTO prestasi_seminar (
  id_seminar,
  id_mahasiswa,
  title,
  description,
  tanggal,
  lokasi,
  penyelenggara,
  tingkat,
  peringkat,
  category,
  subcategory,
  achievement_type,
  verified,
  nama_seminar,
  nama_seminar_norm,
  penyelenggara_norm,
  peran_seminar,
  mode_seminar,
  tanggal_seminar,
  deskripsi,
  created_at,
  updated_at
)
SELECT
  'seed-pagelaran-20200015',
  s.id,
  'Pameran Produk Inovasi Mahasiswa',
  'Menampilkan prototipe produk layanan digital pada expo kampus.',
  '2025-08-10',
  'Semarang',
  'Politeknik Negeri Semarang',
  'regional',
  NULL,
  'event_participation',
  'expo',
  'non_academic',
  TRUE,
  'ABT Innovation Expo 2025',
  'abt innovation expo 2025',
  'politeknik negeri semarang',
  'peserta',
  'offline',
  '2025-08-10',
  'Menampilkan prototipe produk layanan digital pada expo kampus.',
  NOW(),
  NOW()
FROM students s
WHERE s.nim = '20200015' AND s.deleted_at IS NULL
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  tanggal = VALUES(tanggal),
  lokasi = VALUES(lokasi),
  penyelenggara = VALUES(penyelenggara),
  tingkat = VALUES(tingkat),
  category = VALUES(category),
  subcategory = VALUES(subcategory),
  achievement_type = VALUES(achievement_type),
  verified = VALUES(verified),
  nama_seminar = VALUES(nama_seminar),
  nama_seminar_norm = VALUES(nama_seminar_norm),
  penyelenggara_norm = VALUES(penyelenggara_norm),
  peran_seminar = VALUES(peran_seminar),
  mode_seminar = VALUES(mode_seminar),
  tanggal_seminar = VALUES(tanggal_seminar),
  deskripsi = VALUES(deskripsi),
  updated_at = NOW();

INSERT INTO prestasi_seminar (
  id_seminar,
  id_mahasiswa,
  title,
  description,
  tanggal,
  lokasi,
  penyelenggara,
  tingkat,
  peringkat,
  category,
  subcategory,
  achievement_type,
  verified,
  nama_seminar,
  nama_seminar_norm,
  penyelenggara_norm,
  peran_seminar,
  mode_seminar,
  tanggal_seminar,
  deskripsi,
  created_at,
  updated_at
)
SELECT
  'seed-pagelaran-20200018',
  s.id,
  'Pagelaran Presentasi Riset UMKM',
  'Sesi presentasi terbuka hasil riset pendampingan UMKM.',
  '2026-01-22',
  'Semarang',
  'Dinas Koperasi Kota Semarang',
  'nasional',
  NULL,
  'event_participation',
  'pagelaran',
  'non_academic',
  TRUE,
  'Pagelaran Riset UMKM 2026',
  'pagelaran riset umkm 2026',
  'dinas koperasi kota semarang',
  'pembicara',
  'offline',
  '2026-01-22',
  'Sesi presentasi terbuka hasil riset pendampingan UMKM.',
  NOW(),
  NOW()
FROM students s
WHERE s.nim = '20200018' AND s.deleted_at IS NULL
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  tanggal = VALUES(tanggal),
  lokasi = VALUES(lokasi),
  penyelenggara = VALUES(penyelenggara),
  tingkat = VALUES(tingkat),
  category = VALUES(category),
  subcategory = VALUES(subcategory),
  achievement_type = VALUES(achievement_type),
  verified = VALUES(verified),
  nama_seminar = VALUES(nama_seminar),
  nama_seminar_norm = VALUES(nama_seminar_norm),
  penyelenggara_norm = VALUES(penyelenggara_norm),
  peran_seminar = VALUES(peran_seminar),
  mode_seminar = VALUES(mode_seminar),
  tanggal_seminar = VALUES(tanggal_seminar),
  deskripsi = VALUES(deskripsi),
  updated_at = NOW();

-- =====================================================================
-- Setelah import file ini, jalankan sinkronisasi chart records:
--   E:\XAMPP\php\php.exe backend/scripts/seed-sync-all-charts.php
-- =====================================================================
