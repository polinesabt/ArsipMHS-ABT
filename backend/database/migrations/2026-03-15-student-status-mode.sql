-- Add status_mode to support auto-computed student status with manual override.
-- - manual: use students.status as-is
-- - auto: compute status_effective from tahun_masuk/tahun_lulus (4-year estimation)

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS status_mode ENUM('manual', 'auto') NOT NULL DEFAULT 'auto'
  COMMENT 'manual=use status; auto=compute active/alumni from tahun_masuk/tahun_lulus'
  AFTER status;

-- Backfill: keep cuti/dropout as manual; others follow auto.
UPDATE students
SET status_mode = 'manual'
WHERE status IN ('on_leave', 'dropout');

