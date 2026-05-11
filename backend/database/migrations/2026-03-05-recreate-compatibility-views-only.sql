-- =====================================================================
-- Recreate compatibility views only (no table creation)
-- Use this after base tables already exist.
-- Safe for cases where placeholder objects exist as TABLE or VIEW.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET collation_connection = 'utf8mb4_unicode_ci';

-- 1) Drop object with same name (table/view) for compatibility targets.
-- Use both DROP VIEW + DROP TABLE to avoid ROUTINE privilege requirement on shared hosting.
DROP VIEW IF EXISTS achievements;
DROP TABLE IF EXISTS achievements;

DROP VIEW IF EXISTS achievement_attachments;
DROP TABLE IF EXISTS achievement_attachments;

DROP VIEW IF EXISTS v_alumni_overview;
DROP TABLE IF EXISTS v_alumni_overview;

DROP VIEW IF EXISTS v_student_achievements_summary;
DROP TABLE IF EXISTS v_student_achievements_summary;

-- 2) Recreate views without DEFINER
CREATE OR REPLACE VIEW achievements AS
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

CREATE OR REPLACE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_publikasi_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_portofolio_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_lomba_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_kekayaan_intelektual_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_magang_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_produk_mahasiswa, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_produk_mahasiswa_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_wirausaha_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_pengembangan_diri_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_organisasi_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_seminar_attachments a WHERE a.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_alumni_overview AS
SELECT s.id, s.nim, s.nama, s.tahun_lulus, s.email, s.no_hp, t.career_status, t.tahun_pengisian, COUNT(DISTINCT a.id) AS total_achievements
FROM students s
LEFT JOIN tracer_study t ON s.id = t.student_id
LEFT JOIN achievements a ON s.id = a.student_id
WHERE (
  CASE
    WHEN s.status_mode = 'manual' THEN s.status
    WHEN s.status_mode = 'auto' THEN
      CASE
        WHEN s.tahun_lulus IS NOT NULL AND s.tahun_lulus <= YEAR(CURDATE()) THEN 'alumni'
        WHEN s.tahun_lulus IS NULL AND YEAR(CURDATE()) >= (s.tahun_masuk + 4) THEN 'alumni'
        ELSE 'active'
      END
    ELSE s.status
  END
) = 'alumni'
GROUP BY s.id, s.nim, s.nama, s.tahun_lulus, s.email, s.no_hp, t.career_status, t.tahun_pengisian;

CREATE OR REPLACE VIEW v_student_achievements_summary AS
SELECT s.id, s.nim, s.nama, s.status, COUNT(a.id) AS total_achievements, COUNT(DISTINCT a.category) AS total_categories,
COUNT(CASE WHEN a.verified = TRUE THEN 1 ELSE NULL END) AS verified_achievements, MAX(a.tanggal) AS latest_achievement_date
FROM students s
LEFT JOIN achievements a ON s.id = a.student_id
GROUP BY s.id, s.nim, s.nama, s.status;
