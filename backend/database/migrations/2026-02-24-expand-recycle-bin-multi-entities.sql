-- Expand recycle bin coverage:
-- 1) Graduate evaluations (campaign-level)
-- 2) Achievement attachments (all category attachment tables)
--
-- Also refresh achievement_attachments view to only expose active attachments.

ALTER TABLE evaluations
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER updated_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_evaluations_deleted_at (deleted_at),
  ADD INDEX idx_evaluations_deleted_by (deleted_by);

ALTER TABLE prestasi_publikasi_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_portofolio_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_lomba_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_kekayaan_intelektual_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_magang_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_wirausaha_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_pengembangan_diri_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_organisasi_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

ALTER TABLE prestasi_seminar_attachments
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER uploaded_at,
  ADD COLUMN deleted_by VARCHAR(36) NULL AFTER deleted_at,
  ADD INDEX idx_deleted_at (deleted_at),
  ADD INDEX idx_deleted_by (deleted_by);

CREATE OR REPLACE VIEW achievement_attachments AS
SELECT a.id, a.id_publikasi AS achievement_id, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_publikasi_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_portofolio, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_portofolio_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_lomba, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_lomba_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_kekayaan_intelektual, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_kekayaan_intelektual_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_magang, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_magang_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_wirausaha, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_wirausaha_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_pengembangan_diri, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_pengembangan_diri_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_organisasi, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_organisasi_attachments a
WHERE a.deleted_at IS NULL
UNION ALL
SELECT a.id, a.id_seminar, a.file_name, a.file_type, a.file_size, a.file_path, a.uploaded_at
FROM prestasi_seminar_attachments a
WHERE a.deleted_at IS NULL;
