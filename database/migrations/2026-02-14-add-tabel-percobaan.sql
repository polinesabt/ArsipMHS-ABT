-- Tabel Percobaan - dummy data untuk percobaan
-- Jalankan di phpMyAdmin atau: mysql -u root -p arsipmhs < migrations/2026-02-14-add-tabel-percobaan.sql

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `tabel_percobaan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nama` VARCHAR(100) NOT NULL COMMENT 'Nama mahasiswa',
  `nim` VARCHAR(20) NOT NULL COMMENT 'NIM mahasiswa',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_nim` (`nim`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabel percobaan - data dummy mahasiswa';

INSERT INTO `tabel_percobaan` (`nama`, `nim`) VALUES
('Ahmad Fauzi', '4.42.0001'),
('Budi Santoso', '4.42.0002'),
('Citra Dewi', '4.42.0003'),
('Dian Pratama', '4.42.0004'),
('Eka Wulandari', '4.42.0005');
