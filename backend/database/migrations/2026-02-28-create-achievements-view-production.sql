-- =====================================================================
-- Patch Production: Buat view "achievements" dan "achievement_attachments"
-- Jalankan di database production jika error: Table 'achievements' doesn't exist
-- Prasyarat: Tabel prestasi_* (prestasi_lomba, prestasi_seminar, dll) sudah ada.
-- =====================================================================

SET NAMES utf8mb4;

-- Hapus view lama jika ada (jangan drop table)
DROP VIEW IF EXISTS achievement_attachments;
DROP VIEW IF EXISTS achievements;

-- View achievements: gabungan semua tabel prestasi_* agar API bisa SELECT dari "achievements"
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

-- View achievement_attachments: gabungan semua tabel lampiran prestasi_*
CREATE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_publikasi_attachments a
UNION ALL SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_portofolio_attachments a
UNION ALL SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_lomba_attachments a
UNION ALL SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_kekayaan_intelektual_attachments a
UNION ALL SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_magang_attachments a
UNION ALL SELECT a.id, a.id_produk_mahasiswa, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_produk_mahasiswa_attachments a WHERE a.deleted_at IS NULL
UNION ALL SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_wirausaha_attachments a
UNION ALL SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_pengembangan_diri_attachments a
UNION ALL SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_organisasi_attachments a
UNION ALL SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at FROM prestasi_seminar_attachments a;
