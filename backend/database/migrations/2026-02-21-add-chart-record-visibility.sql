-- Add per-record visibility toggle for chart dataset controls.
-- OFF means hidden from chart calculation but still stored in DB.

ALTER TABLE menu_student_achievements_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_study_period_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_waiting_time_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_job_relevance_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_work_coverage_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_user_satisfaction_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_publications_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_active_students_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_student_products_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);

ALTER TABLE menu_research_outputs_records
  ADD COLUMN included_in_chart TINYINT(1) NOT NULL DEFAULT 1 AFTER payload,
  ADD INDEX idx_included_in_chart (included_in_chart);
