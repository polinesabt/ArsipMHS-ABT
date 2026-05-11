-- =====================================================================
-- Add New Achievement Category Table: prestasi_produk_mahasiswa
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS prestasi_produk_mahasiswa (
  id_produk_mahasiswa VARCHAR(36) PRIMARY KEY,
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
  subcategory VARCHAR(50) NOT NULL DEFAULT 'makanan_minuman',
  achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic',
  verified BOOLEAN DEFAULT FALSE,
  nama_produk VARCHAR(255) NULL,
  nama_produk_norm VARCHAR(255) NOT NULL DEFAULT '',
  kategori_produk VARCHAR(50) NOT NULL DEFAULT 'makanan_minuman',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_prestasi_produk_mahasiswa (id_mahasiswa, nama_produk_norm, kategori_produk, tanggal),
  INDEX idx_prestasi_produk_mahasiswa_student (id_mahasiswa),
  INDEX idx_prestasi_produk_mahasiswa_date (tanggal DESC),
  INDEX idx_prestasi_produk_mahasiswa_category (category, subcategory),
  FOREIGN KEY (id_mahasiswa) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (source_import_log_id) REFERENCES prestasi_import_logs(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prestasi_produk_mahasiswa_attachments (
  id VARCHAR(36) PRIMARY KEY,
  id_produk_mahasiswa VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by VARCHAR(36) NULL,
  INDEX idx_prestasi_produk_mahasiswa_att_fk (id_produk_mahasiswa),
  INDEX idx_prestasi_produk_mahasiswa_att_deleted_at (deleted_at),
  INDEX idx_prestasi_produk_mahasiswa_att_deleted_by (deleted_by),
  FOREIGN KEY (id_produk_mahasiswa) REFERENCES prestasi_produk_mahasiswa(id_produk_mahasiswa) ON DELETE CASCADE,
  FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP VIEW IF EXISTS achievement_attachments;
DROP VIEW IF EXISTS achievements;

CREATE VIEW achievements AS
SELECT p.id_publikasi AS id, p.id_mahasiswa AS student_id, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_publikasi p
UNION ALL SELECT p.id_portofolio, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_portofolio p
UNION ALL SELECT p.id_lomba, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_lomba p
UNION ALL SELECT p.id_kekayaan_intelektual, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_kekayaan_intelektual p
UNION ALL SELECT p.id_magang, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_magang p
UNION ALL SELECT p.id_produk_mahasiswa, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_produk_mahasiswa p
UNION ALL SELECT p.id_wirausaha, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_wirausaha p
UNION ALL SELECT p.id_pengembangan_diri, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_pengembangan_diri p
UNION ALL SELECT p.id_organisasi, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_organisasi p
UNION ALL SELECT p.id_seminar, p.id_mahasiswa, p.category, p.subcategory, p.achievement_type, p.title, p.description, p.tanggal, p.lokasi, p.penyelenggara, p.tingkat, p.peringkat, p.verified, p.created_at, p.updated_at FROM prestasi_seminar p;

CREATE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_publikasi_attachments a
UNION ALL SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_portofolio_attachments a
UNION ALL SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_lomba_attachments a
UNION ALL SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_kekayaan_intelektual_attachments a
UNION ALL SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_magang_attachments a
UNION ALL SELECT a.id, a.id_produk_mahasiswa, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_produk_mahasiswa_attachments a
WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_wirausaha_attachments a
UNION ALL SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_pengembangan_diri_attachments a
UNION ALL SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_organisasi_attachments a
UNION ALL SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_seminar_attachments a;

SET FOREIGN_KEY_CHECKS = 1;
