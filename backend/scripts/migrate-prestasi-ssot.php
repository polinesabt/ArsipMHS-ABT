<?php
/**
 * Run refactor migration: achievements -> per-category prestasi tables.
 *
 * Usage:
 *   php backend/scripts/migrate-prestasi-ssot.php
 */
require_once __DIR__ . '/../config/database.php';

$migrationFile = __DIR__ . '/../database/migrations/2026-02-24-refactor-prestasi-ssot.sql';
if (!file_exists($migrationFile)) {
    fwrite(STDERR, "Migration file not found: {$migrationFile}\n");
    exit(1);
}

$sql = file_get_contents($migrationFile);
if ($sql === false || trim($sql) === '') {
    fwrite(STDERR, "Migration file is empty: {$migrationFile}\n");
    exit(1);
}

try {
    $pdo->exec($sql);
    echo "OK: migration refactor prestasi SSOT berhasil dijalankan.\n";
} catch (PDOException $e) {
    fwrite(STDERR, "ERROR: " . $e->getMessage() . "\n");
    exit(1);
}
