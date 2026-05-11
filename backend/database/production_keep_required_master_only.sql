-- =====================================================================
-- PRODUCTION CLEANUP (KEEP ADMIN + REQUIRED MASTER DATA ONLY)
-- =====================================================================
-- Tujuan:
-- - Hapus data input operasional (akun mahasiswa, tracer, prestasi, evaluasi, chart snapshot, log).
-- - Pertahankan data admin yang sudah ada.
-- - Pertahankan master wajib:
--   1) evaluation_aspects
--   2) satisfaction_form_templates (minimal default/active)
--
-- Cara pakai:
-- 1) Buka phpMyAdmin hosting production.
-- 2) Pilih database target terlebih dahulu (contoh: arsipmhs).
-- 3) Import file SQL ini.
--
-- Catatan penting:
-- - Script ini hanya membersihkan isi tabel, bukan drop struktur.
-- - Script ini tidak menghapus file fisik attachment di folder storage server.
--   Bersihkan manual folder:
--   - public_html/backend/storage/achievements/
--   - public_html/backend/storage/satisfaction_attachments/
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1) EVALUATION / SURVEY OPERATIONAL DATA
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluation_response_ratings' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `evaluation_response_ratings`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'satisfaction_form_responses' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `satisfaction_form_responses`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluation_responses' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `evaluation_responses`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluation_invitations' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `evaluation_invitations`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'student_notifications' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `student_notifications`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluation_token_blacklist' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `evaluation_token_blacklist`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'evaluations' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `evaluations`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 2) ACHIEVEMENT ATTACHMENTS (SSOT TABLES)
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_publikasi_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_publikasi_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_portofolio_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_portofolio_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_lomba_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_lomba_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_kekayaan_intelektual_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_kekayaan_intelektual_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_magang_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_magang_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_produk_mahasiswa_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_produk_mahasiswa_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_wirausaha_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_wirausaha_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_pengembangan_diri_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_pengembangan_diri_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_organisasi_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_organisasi_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_seminar_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_seminar_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Legacy achievements tables (jika masih BASE TABLE, bukan VIEW)
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'achievement_attachments' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `achievement_attachments`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'achievements' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `achievements`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 3) ACHIEVEMENT MASTER DATA (SSOT TABLES)
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_publikasi' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_publikasi`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_portofolio' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_portofolio`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_lomba' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_lomba`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_kekayaan_intelektual' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_kekayaan_intelektual`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_magang' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_magang`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_produk_mahasiswa' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_produk_mahasiswa`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_wirausaha' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_wirausaha`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_pengembangan_diri' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_pengembangan_diri`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_organisasi' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_organisasi`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_seminar' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_seminar`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 4) IMPORT / BACKFILL LOGS
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_import_log_details' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_import_log_details`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_import_logs' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_import_logs`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'prestasi_migration_skipped_logs' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `prestasi_migration_skipped_logs`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'research_output_backfill_log' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `research_output_backfill_log`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 5) STUDENT / TRACER DATA + STUDENT ACCOUNTS
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tracer_study' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `tracer_study`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'students' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `students`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'users' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `users` WHERE `role` = ''student''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 6) DASHBOARD SNAPSHOT / LOG TABLES
-- ---------------------------------------------------------------------
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_student_achievements_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_student_achievements_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_study_period_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_study_period_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_waiting_time_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_waiting_time_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_job_relevance_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_job_relevance_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_work_coverage_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_work_coverage_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_user_satisfaction_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_user_satisfaction_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_publications_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_publications_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_active_students_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_active_students_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_student_products_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_student_products_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'menu_research_outputs_records' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `menu_research_outputs_records`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'active_students_semester_stats' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `active_students_semester_stats`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'chart_sync_log' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `chart_sync_log`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'record_change_logs' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `record_change_logs`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'export_logs' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `export_logs`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Optional table percobaan
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tabel_percobaan' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `tabel_percobaan`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------
-- 7) KEEP REQUIRED MASTER FOR SATISFACTION TEMPLATE
-- ---------------------------------------------------------------------
-- Pertahankan template default/active, hapus template lain.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'satisfaction_form_templates' AND table_type = 'BASE TABLE') > 0,
  'UPDATE `satisfaction_form_templates`
   SET `deleted_at` = NULL
   WHERE COALESCE(`is_default`, 0) = 1 OR COALESCE(`is_active`, 0) = 1',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'satisfaction_form_templates' AND table_type = 'BASE TABLE') > 0,
  'DELETE FROM `satisfaction_form_templates`
   WHERE COALESCE(`is_default`, 0) = 0
     AND COALESCE(`is_active`, 0) = 0
     AND EXISTS (
       SELECT 1
       FROM `satisfaction_form_templates` t
       WHERE COALESCE(t.`is_default`, 0) = 1 OR COALESCE(t.`is_active`, 0) = 1
     )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Jika belum ada template aktif, aktifkan template default.
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'satisfaction_form_templates' AND table_type = 'BASE TABLE') > 0,
  'UPDATE `satisfaction_form_templates`
   SET `is_active` = 1, `deleted_at` = NULL
   WHERE COALESCE(`is_default`, 0) = 1
     AND NOT EXISTS (
       SELECT 1
       FROM `satisfaction_form_templates` t
       WHERE COALESCE(t.`is_active`, 0) = 1 AND t.`deleted_at` IS NULL
     )',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET FOREIGN_KEY_CHECKS = 1;

-- ---------------------------------------------------------------------
-- 8) REBUILD COMPATIBILITY VIEWS
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- 9) POST-RUN CHECK (opsional)
-- ---------------------------------------------------------------------
-- Jalankan query ini setelah import untuk verifikasi cepat:
-- SELECT COUNT(*) AS admin_users FROM users WHERE role = 'admin' AND is_active = 1;
-- SELECT COUNT(*) AS student_users FROM users WHERE role = 'student';
-- SELECT COUNT(*) AS students_data FROM students;
-- SELECT COUNT(*) AS tracer_data FROM tracer_study;
-- SELECT COUNT(*) AS evaluations_data FROM evaluations;
-- SELECT COUNT(*) AS achievement_rows FROM prestasi_publikasi;
-- SELECT COUNT(*) AS aspects_active FROM evaluation_aspects WHERE is_active = 1;
