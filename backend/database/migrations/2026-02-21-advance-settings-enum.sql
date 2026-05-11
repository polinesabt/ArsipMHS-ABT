-- Extend record_change_logs action enum for Recycle Bin & Recovery
ALTER TABLE record_change_logs
MODIFY COLUMN action ENUM('created', 'updated', 'deleted', 'recovered', 'permanent_deleted') NOT NULL;
