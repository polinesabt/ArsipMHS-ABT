-- Agregat per semester untuk chart Mahasiswa Aktif: PD-Dikti (input) dan aktif (optional override).
-- Jika aktif NULL, backend menghitung dari menu_active_students_records / students.

CREATE TABLE IF NOT EXISTS active_students_semester_stats (
  tahun INT NOT NULL,
  semester ENUM('genap','ganjil') NOT NULL,
  pd_dikti INT NOT NULL DEFAULT 0 COMMENT 'Jumlah terdaftar PD-Dikti semester ini',
  aktif INT NULL COMMENT 'Jumlah mahasiswa aktif; NULL = hitung dari records',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (tahun, semester),
  INDEX idx_tahun (tahun)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
