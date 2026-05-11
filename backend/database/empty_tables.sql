-- =====================================================================
-- PENGOSONGAN DATABASE - Hanya isi tabel dihapus, struktur tabel tetap
-- =====================================================================
-- Cara pakai: Import file ini di phpMyAdmin (tab SQL) atau:
--   mysql -u root -p arsipmhs < backend/database/empty_tables.sql
--
-- Jika muncul error "Table '...' doesn't exist", abaikan (tabel dari
-- migrasi yang belum dijalankan). Setelah dijalankan, isi semua tabel
-- akan kosong. Data admin dan aspek evaluasi juga terhapus.
-- =====================================================================

USE arsipmhs;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---- Tabel respons & rating evaluasi ----
DELETE FROM evaluation_response_ratings;
DELETE FROM evaluation_responses;

-- ---- Form kepuasan kustom (jika migrasi sudah dijalankan) ----
DELETE FROM satisfaction_form_responses;
DELETE FROM satisfaction_form_templates;

-- ---- Undangan & notifikasi evaluasi ----
DELETE FROM evaluation_invitations;
DELETE FROM student_notifications;
DELETE FROM evaluation_token_blacklist;

-- ---- Evaluasi & aspek ----
DELETE FROM evaluations;
DELETE FROM evaluation_aspects;

-- ---- Lampiran prestasi (prestasi_*_attachments) ----
DELETE FROM prestasi_publikasi_attachments;
DELETE FROM prestasi_portofolio_attachments;
DELETE FROM prestasi_lomba_attachments;
DELETE FROM prestasi_kekayaan_intelektual_attachments;
DELETE FROM prestasi_magang_attachments;
DELETE FROM prestasi_produk_mahasiswa_attachments;
DELETE FROM prestasi_wirausaha_attachments;
DELETE FROM prestasi_pengembangan_diri_attachments;
DELETE FROM prestasi_organisasi_attachments;
DELETE FROM prestasi_seminar_attachments;

-- ---- Tabel prestasi per kategori (jika migrasi prestasi SSOT sudah dijalankan) ----
DELETE FROM prestasi_publikasi;
DELETE FROM prestasi_portofolio;
DELETE FROM prestasi_lomba;
DELETE FROM prestasi_kekayaan_intelektual;
DELETE FROM prestasi_magang;
DELETE FROM prestasi_produk_mahasiswa;
DELETE FROM prestasi_wirausaha;
DELETE FROM prestasi_pengembangan_diri;
DELETE FROM prestasi_organisasi;
DELETE FROM prestasi_seminar;

-- ---- Log import prestasi ----
DELETE FROM prestasi_import_log_details;
DELETE FROM prestasi_import_logs;
DELETE FROM prestasi_migration_skipped_logs;

-- ---- Tabel achievements lama (jika belum migrasi ke prestasi_*).
--      Jika error "Table doesn't exist", comment 2 baris di bawah ----
DELETE FROM achievement_attachments;
DELETE FROM achievements;

-- ---- Tracer study & mahasiswa ----
DELETE FROM tracer_study;
DELETE FROM students;

-- ---- Admin & users ----
DELETE FROM admins;
DELETE FROM users;

-- ---- Chart / insight / log (jika migrasi sudah dijalankan) ----
DELETE FROM chart_sync_log;
DELETE FROM record_change_logs;
DELETE FROM export_logs;
DELETE FROM menu_student_achievements_records;
DELETE FROM menu_study_period_records;
DELETE FROM menu_waiting_time_records;
DELETE FROM menu_job_relevance_records;
DELETE FROM menu_work_coverage_records;
DELETE FROM menu_user_satisfaction_records;
DELETE FROM menu_publications_records;
DELETE FROM menu_active_students_records;
DELETE FROM menu_student_products_records;
DELETE FROM menu_research_outputs_records;
DELETE FROM active_students_semester_stats;

-- ---- Tabel percobaan (opsional) ----
DELETE FROM tabel_percobaan;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Selesai. Semua isi tabel sudah dikosongkan.
-- Untuk mengembalikan data awal (admin + aspek evaluasi), jalankan
-- bagian SEED DATA dari install.sql atau buat user admin baru.
-- =====================================================================
