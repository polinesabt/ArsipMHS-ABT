<?php
/**
 * Run migration: normalize satisfaction template active state.
 * Execute: php backend/database/run-satisfaction-template-active-normalize.php
 */
$autoload = __DIR__ . '/../config/database.php';
if (!file_exists($autoload)) {
    echo "ERROR: config/database.php not found. Run from project root.\n";
    exit(1);
}
require_once $autoload;

$migrationFile = __DIR__ . '/migrations/2026-02-27-normalize-satisfaction-template-active-state.sql';
if (!file_exists($migrationFile)) {
    echo "ERROR: Migration file not found.\n";
    exit(1);
}

$sql = file_get_contents($migrationFile);
if ($sql === false || trim($sql) === '') {
    echo "ERROR: Could not read migration file.\n";
    exit(1);
}

try {
    $pdo->exec($sql);
    echo "OK: Migration 2026-02-27-normalize-satisfaction-template-active-state berhasil dijalankan.\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

