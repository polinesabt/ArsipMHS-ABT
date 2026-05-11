-- Normalize active-state consistency for satisfaction_form_templates.
-- Rules:
-- 1) Deleted templates must not stay active.
-- 2) If none active (non-deleted), auto-activate default.
-- 3) If multiple active, keep newest active and deactivate others.

SET NAMES utf8mb4;

-- 1) Nonaktifkan template yang sudah dihapus (soft delete).
UPDATE satisfaction_form_templates
SET is_active = 0
WHERE deleted_at IS NOT NULL
  AND is_active = 1;

-- 2) Jika tidak ada active non-deleted, aktifkan template default (jika ada).
UPDATE satisfaction_form_templates
SET is_active = 1, updated_at = NOW()
WHERE id = (
  SELECT pick.id
  FROM (
    SELECT id
    FROM satisfaction_form_templates
    WHERE deleted_at IS NULL AND is_default = 1
    ORDER BY updated_at DESC, created_at DESC, id DESC
    LIMIT 1
  ) AS pick
)
AND NOT EXISTS (
  SELECT 1
  FROM satisfaction_form_templates
  WHERE deleted_at IS NULL AND is_active = 1
);

-- 3) Jika active non-deleted lebih dari satu, sisakan yang terbaru.
UPDATE satisfaction_form_templates
SET is_active = CASE
  WHEN id = (
    SELECT pick.id
    FROM (
      SELECT id
      FROM satisfaction_form_templates
      WHERE deleted_at IS NULL AND is_active = 1
      ORDER BY updated_at DESC, created_at DESC, id DESC
      LIMIT 1
    ) AS pick
  ) THEN 1
  ELSE 0
END
WHERE deleted_at IS NULL
  AND is_active = 1
  AND (
    SELECT COUNT(*)
    FROM satisfaction_form_templates
    WHERE deleted_at IS NULL AND is_active = 1
  ) > 1;

