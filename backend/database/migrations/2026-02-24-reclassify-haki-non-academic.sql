-- Reclassify achievement_type after moving intellectual_property (HAKI) to non_academic.
-- Final mapping:
-- - academic: scientific_work, applied_academic + course_portfolio
-- - non_academic: everything else (including intellectual_property)

UPDATE achievements
SET achievement_type = CASE
  WHEN category = 'scientific_work' THEN 'academic'
  WHEN category = 'applied_academic' AND subcategory = 'course_portfolio' THEN 'academic'
  ELSE 'non_academic'
END;
