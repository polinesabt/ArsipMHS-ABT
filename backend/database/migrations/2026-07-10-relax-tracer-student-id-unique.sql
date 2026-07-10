-- Relax tracer study student_id unique constraint to allow multiple careers per student
ALTER TABLE tracer_study DROP INDEX student_id;
