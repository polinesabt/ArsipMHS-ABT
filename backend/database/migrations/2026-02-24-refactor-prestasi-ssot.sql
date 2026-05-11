-- =====================================================================
-- Refactor Prestasi SSOT: split achievements into category tables
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS achievement_attachments;
DROP VIEW IF EXISTS achievements;

CREATE TABLE IF NOT EXISTS prestasi_import_logs (
  id VARCHAR(36) PRIMARY KEY,
  module VARCHAR(50) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NULL,
  total_rows INT NOT NULL DEFAULT 0,
  valid_rows INT NOT NULL DEFAULT 0,
  success_rows INT NOT NULL DEFAULT 0,
  failed_rows INT NOT NULL DEFAULT 0,
  duplicate_rows INT NOT NULL DEFAULT 0,
  empty_rows INT NOT NULL DEFAULT 0,
  affected_students INT NOT NULL DEFAULT 0,
  status ENUM('processing','completed','failed') NOT NULL DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL,
  INDEX idx_prestasi_import_logs_kategori (kategori),
  INDEX idx_prestasi_import_logs_created_at (created_at DESC),
  INDEX idx_prestasi_import_logs_uploaded_by (uploaded_by),
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_import_log_details (
  id VARCHAR(36) PRIMARY KEY,
  import_log_id VARCHAR(36) NOT NULL,
  `row_number` INT NOT NULL,
  nim_raw VARCHAR(50) NULL,
  status ENUM('error','duplicate','skipped_empty','inserted') NOT NULL,
  message VARCHAR(500) NULL,
  raw_payload_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_import_log_details_import_log_id (import_log_id),
  INDEX idx_prestasi_import_log_details_status (status),
  FOREIGN KEY (import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_migration_skipped_logs (
  id VARCHAR(36) PRIMARY KEY,
  legacy_achievement_id VARCHAR(36) NOT NULL,
  legacy_category VARCHAR(50) NULL,
  legacy_subcategory VARCHAR(50) NULL,
  reason VARCHAR(255) NOT NULL,
  payload JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_migration_skipped_legacy_id (legacy_achievement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_publikasi (
  id_publikasi VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'scientific_work',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'journal_publication',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'academic',
  verified BOOLEAN DEFAULT FALSE,
  judul VARCHAR(255) NULL,
  judul_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_publikasi ENUM('artikel_jurnal','prosiding','buku','book_chapter','lainnya') NULL,
  penulis TEXT NULL,
  peran_penulis VARCHAR(100) NULL,
  nama_jurnal_konferensi VARCHAR(255) NULL,
  nama_jurnal_konferensi_norm VARCHAR(255) NOT NULL DEFAULT '',
  penerbit VARCHAR(255) NULL,
  doi VARCHAR(255) NULL,
  url VARCHAR(500) NULL,
  tahun_terbit INT NULL,
  tanggal_terbit DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_publikasi (id_mahasiswa, judul_norm, jenis_publikasi, tahun_terbit, nama_jurnal_konferensi_norm),
  INDEX idx_prestasi_publikasi_student (id_mahasiswa),
  INDEX idx_prestasi_publikasi_date (tanggal DESC),
  INDEX idx_prestasi_publikasi_category (category, subcategory),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_portofolio (
  id_portofolio VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'applied_academic',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'course_portfolio',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'academic',
  verified BOOLEAN DEFAULT FALSE,
  judul_proyek VARCHAR(255) NULL,
  judul_proyek_norm VARCHAR(255) NOT NULL DEFAULT '',
  mata_kuliah_kode VARCHAR(50) NULL,
  mata_kuliah_custom VARCHAR(255) NULL,
  mata_kuliah_norm VARCHAR(255) NOT NULL DEFAULT '',
  tahun INT NULL,
  semester ENUM('ganjil','genap') NULL,
  deskripsi_proyek TEXT NULL,
  output VARCHAR(500) NULL,
  url_proyek VARCHAR(500) NULL,
  nilai VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_portofolio (id_mahasiswa, mata_kuliah_norm, judul_proyek_norm, semester, tahun),
  INDEX idx_prestasi_portofolio_student (id_mahasiswa),
  INDEX idx_prestasi_portofolio_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_lomba (
  id_lomba VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'event_participation',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'competition',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_lomba VARCHAR(255) NULL,
  nama_lomba_norm VARCHAR(255) NOT NULL DEFAULT '',
  penyelenggara_norm VARCHAR(255) NOT NULL DEFAULT '',
  peran ENUM('peserta','juara') NULL,
  bidang VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_lomba (id_mahasiswa, nama_lomba_norm, tingkat, tanggal_mulai, penyelenggara_norm),
  INDEX idx_prestasi_lomba_student (id_mahasiswa),
  INDEX idx_prestasi_lomba_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_kekayaan_intelektual (
  id_kekayaan_intelektual VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'intellectual_property',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'patent',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  judul_ki VARCHAR(255) NULL,
  judul_ki_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_ki ENUM('hak_cipta','paten','merek','desain_industri','rahasia_dagang') NULL,
  status_ki ENUM('terdaftar','granted','pending','ditolak') NULL,
  pemegang VARCHAR(255) NULL,
  nomor_pendaftaran VARCHAR(255) NULL,
  nomor_sertifikat VARCHAR(255) NULL,
  tahun_pengajuan INT NULL,
  tahun_terbit INT NULL,
  tanggal_pengajuan DATE NULL,
  tanggal_terbit DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_ki_nomor_pendaftaran (nomor_pendaftaran),
  UNIQUE KEY uq_prestasi_ki_nomor_sertifikat (nomor_sertifikat),
  UNIQUE KEY uq_prestasi_ki_fallback (id_mahasiswa, judul_ki_norm, jenis_ki, tahun_pengajuan),
  INDEX idx_prestasi_ki_student (id_mahasiswa),
  INDEX idx_prestasi_ki_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_magang (
  id_magang VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'applied_academic',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'internship',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_perusahaan VARCHAR(255) NULL,
  nama_perusahaan_norm VARCHAR(255) NOT NULL DEFAULT '',
  posisi VARCHAR(255) NULL,
  posisi_norm VARCHAR(255) NOT NULL DEFAULT '',
  industri VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  sedang_berjalan BOOLEAN DEFAULT FALSE,
  deskripsi_tugas TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_magang (id_mahasiswa, nama_perusahaan_norm, posisi_norm, tanggal_mulai),
  INDEX idx_prestasi_magang_student (id_mahasiswa),
  INDEX idx_prestasi_magang_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_wirausaha (
  id_wirausaha VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'entrepreneurship',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'active_business',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_usaha VARCHAR(255) NULL,
  nama_usaha_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_usaha VARCHAR(255) NULL,
  peran VARCHAR(255) NULL,
  lokasi_norm VARCHAR(255) NOT NULL DEFAULT '',
  tahun_mulai INT NULL,
  masih_aktif BOOLEAN DEFAULT TRUE,
  tahun_selesai INT NULL,
  deskripsi_usaha TEXT NULL,
  jumlah_karyawan INT NULL,
  omzet_per_bulan VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_wirausaha (id_mahasiswa, nama_usaha_norm, lokasi_norm, tahun_mulai),
  INDEX idx_prestasi_wirausaha_student (id_mahasiswa),
  INDEX idx_prestasi_wirausaha_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_pengembangan_diri (
  id_pengembangan_diri VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'self_development',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'workshop',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_program VARCHAR(255) NULL,
  nama_program_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_program ENUM('pertukaran_mahasiswa','beasiswa','volunteer','pelatihan','lainnya') NULL,
  peran_mahasiswa VARCHAR(255) NULL,
  negara VARCHAR(255) NULL,
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  sedang_berjalan BOOLEAN DEFAULT FALSE,
  output VARCHAR(500) NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_pengembangan (id_mahasiswa, nama_program_norm, jenis_program, tanggal_mulai),
  INDEX idx_prestasi_pengembangan_student (id_mahasiswa),
  INDEX idx_prestasi_pengembangan_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_organisasi (
  id_organisasi VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'self_development',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'volunteer',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_organisasi VARCHAR(255) NULL,
  nama_organisasi_norm VARCHAR(255) NOT NULL DEFAULT '',
  jenis_organisasi ENUM('kampus','luar_kampus') NULL,
  jabatan VARCHAR(255) NULL,
  jabatan_norm VARCHAR(255) NOT NULL DEFAULT '',
  tanggal_mulai DATE NULL,
  tanggal_selesai DATE NULL,
  masih_aktif BOOLEAN DEFAULT TRUE,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_organisasi (id_mahasiswa, nama_organisasi_norm, jabatan_norm, tanggal_mulai),
  INDEX idx_prestasi_organisasi_student (id_mahasiswa),
  INDEX idx_prestasi_organisasi_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_seminar (
  id_seminar VARCHAR(36) PRIMARY KEY,
  id_mahasiswa VARCHAR(36) NOT NULL,
  source_import_log_id VARCHAR(36) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  tanggal DATE NOT NULL,
  lokasi VARCHAR(255) NULL,
  penyelenggara VARCHAR(255) NULL,
  tingkat ENUM('lokal','regional','nasional','internasional') NULL,
  peringkat VARCHAR(100) NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'event_participation',
  subcategory VARCHAR(50) NOT NULL DEFAULT 'seminar',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_seminar VARCHAR(255) NULL,
  nama_seminar_norm VARCHAR(255) NOT NULL DEFAULT '',
  penyelenggara_norm VARCHAR(255) NOT NULL DEFAULT '',
  peran_seminar ENUM('peserta','pembicara') NULL,
  mode_seminar ENUM('online','offline') NULL,
  tanggal_seminar DATE NULL,
  deskripsi TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_seminar (id_mahasiswa, nama_seminar_norm, penyelenggara_norm, tanggal_seminar, peran_seminar),
  INDEX idx_prestasi_seminar_student (id_mahasiswa),
  INDEX idx_prestasi_seminar_date (tanggal DESC),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_publikasi_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_publikasi VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_publikasi_att_fk (id_publikasi),
  FOREIGN KEY (id_publikasi) REFERENCES prestasi_publikasi(id_publikasi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_portofolio_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_portofolio VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_portofolio_att_fk (id_portofolio),
  FOREIGN KEY (id_portofolio) REFERENCES prestasi_portofolio(id_portofolio) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_lomba_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_lomba VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_lomba_att_fk (id_lomba),
  FOREIGN KEY (id_lomba) REFERENCES prestasi_lomba(id_lomba) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS prestasi_kekayaan_intelektual_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_kekayaan_intelektual VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_ki_att_fk (id_kekayaan_intelektual),
  FOREIGN KEY (id_kekayaan_intelektual) REFERENCES prestasi_kekayaan_intelektual(id_kekayaan_intelektual) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_magang_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_magang VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_magang_att_fk (id_magang),
  FOREIGN KEY (id_magang) REFERENCES prestasi_magang(id_magang) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_wirausaha_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_wirausaha VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_wirausaha_att_fk (id_wirausaha),
  FOREIGN KEY (id_wirausaha) REFERENCES prestasi_wirausaha(id_wirausaha) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_pengembangan_diri_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_pengembangan_diri VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_pengembangan_att_fk (id_pengembangan_diri),
  FOREIGN KEY (id_pengembangan_diri) REFERENCES prestasi_pengembangan_diri(id_pengembangan_diri) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_organisasi_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_organisasi VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_organisasi_att_fk (id_organisasi),
  FOREIGN KEY (id_organisasi) REFERENCES prestasi_organisasi(id_organisasi) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_seminar_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_seminar VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_prestasi_seminar_att_fk (id_seminar),
  FOREIGN KEY (id_seminar) REFERENCES prestasi_seminar(id_seminar) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO prestasi_publikasi (
  id_publikasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul, judul_norm, jenis_publikasi, penulis, nama_jurnal_konferensi, nama_jurnal_konferensi_norm, penerbit,
  doi, url, tahun_terbit, tanggal_terbit, deskripsi, created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'artikel_jurnal', '-', a.penyelenggara, LOWER(TRIM(COALESCE(a.penyelenggara, ''))), a.penyelenggara,
  NULL, NULL, YEAR(a.tanggal), a.tanggal, a.description, a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'scientific_work'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_portofolio (
  id_portofolio, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul_proyek, judul_proyek_norm, mata_kuliah_kode, mata_kuliah_norm, tahun, semester, deskripsi_proyek,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'other', 'other', YEAR(a.tanggal), 'ganjil', a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'applied_academic'
  AND a.subcategory = 'course_portfolio'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_lomba (
  id_lomba, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_lomba, nama_lomba_norm, penyelenggara_norm, peran, bidang, tanggal_mulai, tanggal_selesai, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), LOWER(TRIM(COALESCE(a.penyelenggara, ''))), IF(a.peringkat IS NULL OR TRIM(a.peringkat) = '', 'peserta', 'juara'), NULL, a.tanggal, NULL, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'event_participation'
  AND a.subcategory = 'competition'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;
INSERT IGNORE INTO prestasi_kekayaan_intelektual (
  id_kekayaan_intelektual, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  judul_ki, judul_ki_norm, jenis_ki, status_ki, pemegang, tahun_pengajuan, tanggal_pengajuan, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'paten', 'pending', COALESCE(a.penyelenggara, '-'), YEAR(a.tanggal), a.tanggal, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'intellectual_property'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_magang (
  id_magang, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_perusahaan, nama_perusahaan_norm, posisi, posisi_norm, industri, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi_tugas,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  COALESCE(a.penyelenggara, a.title), LOWER(TRIM(COALESCE(a.penyelenggara, a.title))), a.title, LOWER(TRIM(a.title)),
  COALESCE(a.description, ''), a.tanggal, NULL, 0, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'applied_academic'
  AND a.subcategory = 'internship'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_wirausaha (
  id_wirausaha, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_usaha, nama_usaha_norm, jenis_usaha, lokasi_norm, tahun_mulai, masih_aktif, deskripsi_usaha,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), COALESCE(a.description, ''), LOWER(TRIM(COALESCE(a.lokasi, ''))), YEAR(a.tanggal), 1, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'entrepreneurship'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_pengembangan_diri (
  id_pengembangan_diri, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_program, nama_program_norm, jenis_program, tanggal_mulai, tanggal_selesai, sedang_berjalan, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'pelatihan', a.tanggal, NULL, 0, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'self_development'
  AND a.subcategory <> 'volunteer'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_organisasi (
  id_organisasi, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_organisasi, nama_organisasi_norm, jenis_organisasi, jabatan, jabatan_norm, tanggal_mulai, tanggal_selesai, masih_aktif, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), 'kampus', COALESCE(NULLIF(TRIM(a.description), ''), 'Anggota'), LOWER(TRIM(COALESCE(NULLIF(TRIM(a.description), ''), 'Anggota'))),
  a.tanggal, NULL, 1, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'self_development'
  AND a.subcategory = 'volunteer'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_seminar (
  id_seminar, id_mahasiswa, title, description, tanggal, lokasi, penyelenggara, tingkat, peringkat,
  category, subcategory, achievement_type, verified,
  nama_seminar, nama_seminar_norm, penyelenggara_norm, peran_seminar, mode_seminar, tanggal_seminar, deskripsi,
  created_at, updated_at
)
SELECT
  a.id, a.student_id, a.title, a.description, a.tanggal, a.lokasi, a.penyelenggara, a.tingkat, a.peringkat,
  a.category, a.subcategory, COALESCE(a.achievement_type, 'non_academic'), a.verified,
  a.title, LOWER(TRIM(a.title)), LOWER(TRIM(COALESCE(a.penyelenggara, ''))), 'peserta', 'offline', a.tanggal, a.description,
  a.created_at, a.updated_at
FROM achievements a
WHERE a.category = 'event_participation'
  AND a.subcategory = 'seminar'
  AND a.title IS NOT NULL
  AND TRIM(a.title) <> ''
  AND a.tanggal IS NOT NULL;

INSERT IGNORE INTO prestasi_migration_skipped_logs (
  id, legacy_achievement_id, legacy_category, legacy_subcategory, reason, payload
)
SELECT
  a.id,
  a.id,
  a.category,
  a.subcategory,
  'Record legacy tidak dapat dipetakan lengkap ke skema kategori baru',
  JSON_OBJECT(
    'id', a.id,
    'student_id', a.student_id,
    'category', a.category,
    'subcategory', a.subcategory,
    'title', a.title,
    'tanggal', a.tanggal
  )
FROM achievements a
LEFT JOIN (
  SELECT id_publikasi AS id FROM prestasi_publikasi
  UNION ALL SELECT id_portofolio AS id FROM prestasi_portofolio
  UNION ALL SELECT id_lomba AS id FROM prestasi_lomba
  UNION ALL SELECT id_kekayaan_intelektual AS id FROM prestasi_kekayaan_intelektual
  UNION ALL SELECT id_magang AS id FROM prestasi_magang
  UNION ALL SELECT id_wirausaha AS id FROM prestasi_wirausaha
  UNION ALL SELECT id_pengembangan_diri AS id FROM prestasi_pengembangan_diri
  UNION ALL SELECT id_organisasi AS id FROM prestasi_organisasi
  UNION ALL SELECT id_seminar AS id FROM prestasi_seminar
) migrated ON migrated.id = a.id
WHERE migrated.id IS NULL;

INSERT IGNORE INTO prestasi_publikasi_attachments (id, id_publikasi, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_publikasi p ON p.id_publikasi = aa.achievement_id;
INSERT IGNORE INTO prestasi_portofolio_attachments (id, id_portofolio, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_portofolio p ON p.id_portofolio = aa.achievement_id;
INSERT IGNORE INTO prestasi_lomba_attachments (id, id_lomba, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_lomba p ON p.id_lomba = aa.achievement_id;
INSERT IGNORE INTO prestasi_kekayaan_intelektual_attachments (id, id_kekayaan_intelektual, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_kekayaan_intelektual p ON p.id_kekayaan_intelektual = aa.achievement_id;
INSERT IGNORE INTO prestasi_magang_attachments (id, id_magang, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_magang p ON p.id_magang = aa.achievement_id;
INSERT IGNORE INTO prestasi_wirausaha_attachments (id, id_wirausaha, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_wirausaha p ON p.id_wirausaha = aa.achievement_id;
INSERT IGNORE INTO prestasi_pengembangan_diri_attachments (id, id_pengembangan_diri, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_pengembangan_diri p ON p.id_pengembangan_diri = aa.achievement_id;
INSERT IGNORE INTO prestasi_organisasi_attachments (id, id_organisasi, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_organisasi p ON p.id_organisasi = aa.achievement_id;
INSERT IGNORE INTO prestasi_seminar_attachments (id, id_seminar, file_name, file_type, file_size, file_path, uploaded_at)
SELECT aa.id, aa.achievement_id, aa.file_name, aa.file_type, aa.file_size, aa.file_path, aa.uploaded_at FROM achievement_attachments aa JOIN prestasi_seminar p ON p.id_seminar = aa.achievement_id;

DROP TABLE IF EXISTS achievement_attachments;
DROP TABLE IF EXISTS achievements;

CREATE OR REPLACE VIEW achievements AS
SELECT p.id_publikasi AS id, p.id_mahasiswa AS student_id, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_publikasi p
UNION ALL SELECT p.id_portofolio, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_portofolio p
UNION ALL SELECT p.id_lomba, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_lomba p
UNION ALL SELECT p.id_kekayaan_intelektual, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_kekayaan_intelektual p
UNION ALL SELECT p.id_magang, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_magang p
UNION ALL SELECT p.id_wirausaha, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_wirausaha p
UNION ALL SELECT p.id_pengembangan_diri, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_pengembangan_diri p
UNION ALL SELECT p.id_organisasi, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_organisasi p
UNION ALL SELECT p.id_seminar, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_seminar p;

CREATE OR REPLACE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_publikasi_attachments a
UNION ALL SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_portofolio_attachments a
UNION ALL SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_lomba_attachments a
UNION ALL SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_kekayaan_intelektual_attachments a
UNION ALL SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_magang_attachments a
UNION ALL SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_wirausaha_attachments a
UNION ALL SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_pengembangan_diri_attachments a
UNION ALL SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_organisasi_attachments a
UNION ALL SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_seminar_attachments a;

SET FOREIGN_KEY_CHECKS = 1;
