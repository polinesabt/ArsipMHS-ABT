SET @students_index_exists := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'students'
    AND INDEX_NAME = 'idx_students_deleted_updated'
);
SET @students_index_sql := IF(
  @students_index_exists = 0,
  'CREATE INDEX idx_students_deleted_updated ON students(deleted_at, updated_at)',
  'SELECT 1'
);
PREPARE students_index_stmt FROM @students_index_sql;
EXECUTE students_index_stmt;
DEALLOCATE PREPARE students_index_stmt;
