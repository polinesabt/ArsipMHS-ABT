<?php
/**
 * Run migration: extend record_change_logs action enum.
 * Execute via: php backend/database/run-migration-enum.php
 * Or via browser: /backend/database/run-migration-enum.php (if .htaccess allows)
 */
require_once __DIR__ . '/../config/database.php';

$sql = "ALTER TABLE record_change_logs MODIFY COLUMN action ENUM('created', 'updated', 'deleted', 'recovered', 'permanent_deleted') NOT NULL";

try {
    $pdo->exec($sql);
    echo "OK: Migration berhasil. Enum action record_change_logs telah diperbarui.\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
