<?php
/**
 * Run migration: tambah kolom deleted_at di record_change_logs (logbook recycle bin).
 * Execute: php backend/database/run-logbook-recycle-migration.php
 */
require_once __DIR__ . '/../config/database.php';

$sql = "ALTER TABLE record_change_logs
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Dipindah ke recycle setelah 20 hari',
ADD INDEX idx_deleted_at (deleted_at)";

try {
    $pdo->exec($sql);
    echo "OK: Migration berhasil. Kolom deleted_at untuk logbook recycle bin telah ditambahkan.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column') !== false) {
        echo "OK: Kolom deleted_at sudah ada. Tidak perlu migrasi lagi.\n";
        exit(0);
    }
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
