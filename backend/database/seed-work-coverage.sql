-- =====================================================================
-- Seed data Cakupan Kerja (menu_work_coverage_records)
-- =====================================================================
-- Mengisi tabel chart records untuk section "Cakupan Kerja" sehingga
-- grafik Lokal/Regional, Nasional, Multinasional per tahun lulus
-- menampilkan data demo.
--
-- Jalankan setelah:
--   - install.sql
--   - migrations (2026-02-20-create-chart-records-tables.sql,
--                 2026-02-21-add-chart-record-visibility.sql)
--
-- Opsional: Jika sudah ada seed-demo-chart.sql (students + tracer_study
-- m1-m7), record di sini memakai source_id yang sama (t-m1..t-m7) agar
-- sinkron. Bisa juga dijalankan tanpa seed mahasiswa (data tampil di
-- chart saja).
-- =====================================================================

USE arsipmhs;

SET NAMES utf8mb4;

-- Pastikan tabel punya kolom included_in_chart (migration 2026-02-21)
-- Jika belum, jalankan migration tersebut dulu.

-- Kosongkan seed lama berdasarkan id yang kita pakai (opsional, agar REPLACE bersih)
DELETE FROM menu_work_coverage_records WHERE id IN ('t-m1','t-m2','t-m3','t-m4','t-m5','t-m6','t-m7','t-wc-2023-1','t-wc-2023-2','t-wc-2023-3');

-- 7 alumni tahun lulus 2024: 2 Lokal/Regional, 4 Nasional, 1 Multinasional
-- Payload: career_status, tahun_lulus, work_scope (local | national | multinational)
INSERT INTO menu_work_coverage_records (id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, included_in_chart, deleted_at, created_at, updated_at) VALUES
('t-m1', 'tracer_study', 't-m1', '20200010', 'Andi Wijaya', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"national"}', 1, NULL, NOW(), NOW()),
('t-m2', 'tracer_study', 't-m2', '20200011', 'Bella Kusuma', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"national"}', 1, NULL, NOW(), NOW()),
('t-m3', 'tracer_study', 't-m3', '20200012', 'Cahyo Pratama', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"multinational"}', 1, NULL, NOW(), NOW()),
('t-m4', 'tracer_study', 't-m4', '20200013', 'Dina Marlina', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"national"}', 1, NULL, NOW(), NOW()),
('t-m5', 'tracer_study', 't-m5', '20200014', 'Eka Saputra', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"local"}', 1, NULL, NOW(), NOW()),
('t-m6', 'tracer_study', 't-m6', '20200015', 'Fajar Nugroho', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"local"}', 1, NULL, NOW(), NOW()),
('t-m7', 'tracer_study', 't-m7', '20200016', 'Gita Dewi', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2024, '{"career_status":"working","tahun_lulus":2024,"work_scope":"national"}', 1, NULL, NOW(), NOW());

-- Tambahan 3 alumni tahun lulus 2023 (untuk variasi per tahun)
INSERT INTO menu_work_coverage_records (id, source_table, source_id, snapshot_nim, snapshot_nama, snapshot_prodi, snapshot_fakultas, tahun_pelaporan, payload, included_in_chart, deleted_at, created_at, updated_at) VALUES
('t-wc-2023-1', 'tracer_study', 't-wc-2023-1', '20190001', 'Budi Santoso', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{"career_status":"working","tahun_lulus":2023,"work_scope":"local"}', 1, NULL, NOW(), NOW()),
('t-wc-2023-2', 'tracer_study', 't-wc-2023-2', '20190002', 'Citra Ayu', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{"career_status":"working","tahun_lulus":2023,"work_scope":"national"}', 1, NULL, NOW(), NOW()),
('t-wc-2023-3', 'tracer_study', 't-wc-2023-3', '20190003', 'Dewi Lestari', 'Administrasi Bisnis Terapan', 'Administrasi Bisnis', 2023, '{"career_status":"working","tahun_lulus":2023,"work_scope":"national"}', 1, NULL, NOW(), NOW());

-- Ringkasan seed:
-- Tahun 2024: 2 lokal, 4 nasional, 1 multinasional (total 7)
-- Tahun 2023: 1 lokal, 2 nasional (total 3)
