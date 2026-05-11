-- Logbook (record_change_logs) recycle bin: pindah otomatis setelah 20 hari
-- Entri log lebih dari 20 hari akan di-set deleted_at oleh script purge.
ALTER TABLE record_change_logs
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Dipindah ke recycle setelah 20 hari',
ADD INDEX idx_deleted_at (deleted_at);
