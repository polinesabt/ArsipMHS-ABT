<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

$migrationFile = __DIR__ . '/migrations/2026-09-04-dosen-portal-import.sql';
if (!file_exists($migrationFile)) {
    echo "ERROR: Migration file not found: {$migrationFile}\n";
    exit(1);
}

$sql = file_get_contents($migrationFile);
if ($sql === false || trim($sql) === '') {
    echo "ERROR: Could not read migration file.\n";
    exit(1);
}

try {
    $pdo->exec($sql);
    echo "OK: Migrasi 2026-09-04-dosen-portal-import.sql berhasil dijalankan.\n";
} catch (PDOException $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
