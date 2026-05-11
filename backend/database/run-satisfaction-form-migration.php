<?php
/**
 * Run migration: satisfaction_form_templates + satisfaction_form_responses + seed default template.
 * Execute: php backend/database/run-satisfaction-form-migration.php
 * From project root: php backend/database/run-satisfaction-form-migration.php
 */
$autoload = __DIR__ . '/../config/database.php';
if (!file_exists($autoload)) {
    echo "ERROR: config/database.php not found. Run from project root.\n";
    exit(1);
}
require_once $autoload;

$migrationFile = __DIR__ . '/migrations/2026-02-26-satisfaction-form-templates.sql';
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
    echo "OK: Migration 2026-02-26-satisfaction-form-templates berhasil dijalankan.\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
