-- Add achievement_type classification field to achievements table.
-- Mapping:
-- - academic: scientific_work, intellectual_property, applied_academic + course_portfolio
-- - non_academic: everything else

ALTER TABLE achievements
  ADD COLUMN achievement_type ENUM('academic', 'non_academic') NOT NULL DEFAULT 'non_academic' AFTER subcategory,
  ADD INDEX idx_achievement_type (achievement_type);

UPDATE achievements
SET achievement_type = CASE
  WHEN category = 'scientific_work' THEN 'academic'
  WHEN category = 'intellectual_property' THEN 'academic'
  WHEN category = 'applied_academic' AND subcategory = 'course_portfolio' THEN 'academic'
  ELSE 'non_academic'
END;
