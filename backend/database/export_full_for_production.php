<?php
/**
 * Export full database (schema + data) untuk diunggah ke hosting production.
 * Menghasilkan satu file SQL yang berisi CREATE DATABASE, semua tabel, view, dan data.
 *
 * Cara jalankan (dari root project atau dari backend/database):
 *   php backend/database/export_full_for_production.php
 *   php export_full_for_production.php   (jika sudah cd ke backend/database)
 *
 * File hasil: backend/database/production_full_dump.sql
 * (Bisa diubah lewat argumen: php export_full_for_production.php output.sql)
 */

$isCli = php_sapi_name() === 'cli';
$rootDir = realpath(__DIR__ . '/../..');
if (!$rootDir) {
    $rootDir = realpath(__DIR__ . '/..');
}
$envFile = $rootDir . '/.env';
if (!file_exists($envFile)) {
    echo "Error: File .env tidak ditemukan di {$rootDir}. Buat dari env.example.\n";
    exit(1);
}

// Load env (sederhana, tanpa dependency)
$lines = @file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
foreach ($lines as $line) {
    $line = trim(preg_replace('/^\xEF\xBB\xBF/', '', $line));
    if ($line === '' || strpos($line, '#') === 0 || strpos($line, '=') === false) continue;
    [$k, $v] = explode('=', $line, 2);
    $k = trim($k);
    $v = trim($v);
    if ((strpos($v, '"') === 0 && substr($v, -1) === '"') || (strpos($v, "'") === 0 && substr($v, -1) === "'")) {
        $v = substr($v, 1, -1);
    }
    putenv("$k=$v");
    $_ENV[$k] = $v;
}

$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_NAME') ?: 'arsipmhs';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = getenv('DB_CHARSET') ?: 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$dbName;charset=$charset";
try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    echo "Error koneksi database: " . $e->getMessage() . "\n";
    exit(1);
}

// Output file (argumen pertama atau default)
$outFile = $isCli && isset($argv[1]) ? $argv[1] : (__DIR__ . '/production_full_dump.sql');
if (!preg_match('#^[/\\\\]#', $outFile) && strpos($outFile, ':') !== 1) {
    $outFile = __DIR__ . '/' . $outFile;
}
$outFile = realpath(dirname($outFile)) . '/' . basename($outFile);

echo "Database: {$dbName}\n";
echo "Output:   {$outFile}\n";

$fp = fopen($outFile, 'w');
if (!$fp) {
    echo "Error: Tidak bisa menulis file {$outFile}\n";
    exit(1);
}

$w = function ($line) use ($fp) {
    fwrite($fp, $line . "\n");
};

// ---- Header ----
$w('-- =====================================================================');
$w('-- Arsip Mahasiswa ABT - Full database dump untuk production');
$w('-- Generated: ' . date('Y-m-d H:i:s'));
$w('-- Jalankan file ini di MySQL (phpMyAdmin Import / mysql < file.sql)');
$w('-- =====================================================================');
$w('');
$w('SET NAMES ' . $charset . ' COLLATE ' . $charset . '_unicode_ci;');
$w('SET FOREIGN_KEY_CHECKS = 0;');
$w('');
$w('CREATE DATABASE IF NOT EXISTS `' . str_replace('`', '``', $dbName) . '`');
$w('  CHARACTER SET ' . $charset . ' COLLATE ' . $charset . '_unicode_ci;');
$w('USE `' . str_replace('`', '``', $dbName) . '`;');
$w('');

// Daftar tabel (BASE TABLE saja, urut nama)
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = " . $pdo->quote($dbName) . " AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
$tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($tables as $table) {
    $tableQ = '`' . str_replace('`', '``', $table) . '`';
    $w('-- ---------------------------------------------------------------------');
    $w('-- Table: ' . $table);
    $w('-- ---------------------------------------------------------------------');
    $create = $pdo->query("SHOW CREATE TABLE {$tableQ}")->fetch();
    $createSql = $create['Create Table'];
    $w('DROP TABLE IF EXISTS ' . $tableQ . ';');
    $w($createSql . ';');
    $w('');

    $count = $pdo->query("SELECT COUNT(*) FROM {$tableQ}")->fetchColumn();
    if ($count > 0) {
        $cols = $pdo->query("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = " . $pdo->quote($dbName) . " AND TABLE_NAME = " . $pdo->quote($table) . " ORDER BY ORDINAL_POSITION")->fetchAll(PDO::FETCH_COLUMN);
        $colList = implode(', ', array_map(function ($c) {
            return '`' . str_replace('`', '``', $c) . '`';
        }, $cols));
        $insertPrefix = "INSERT INTO {$tableQ} ({$colList}) VALUES ";
        $chunkSize = 100;
        $offset = 0;
        $firstChunk = true;
        while (true) {
            $rows = $pdo->query("SELECT * FROM {$tableQ} LIMIT " . (int) $chunkSize . " OFFSET " . (int) $offset)->fetchAll(PDO::FETCH_ASSOC);
            if (empty($rows)) break;
            $values = [];
            foreach ($rows as $row) {
                $vals = [];
                foreach ($row as $v) {
                    if ($v === null) {
                        $vals[] = 'NULL';
                    } else {
                        $vals[] = $pdo->quote($v);
                    }
                }
                $values[] = '(' . implode(',', $vals) . ')';
            }
            $w($insertPrefix . implode(",\n", $values) . ';');
            $firstChunk = false;
            $offset += count($rows);
            if (count($rows) < $chunkSize) break;
        }
        $w('');
    }
}

// Views
$stmt = $pdo->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = " . $pdo->quote($dbName) . " AND TABLE_TYPE = 'VIEW' ORDER BY TABLE_NAME");
$views = $stmt->fetchAll(PDO::FETCH_COLUMN);

foreach ($views as $view) {
    $viewQ = '`' . str_replace('`', '``', $view) . '`';
    $w('-- ---------------------------------------------------------------------');
    $w('-- View: ' . $view);
    $w('-- ---------------------------------------------------------------------');
    try {
        $create = $pdo->query("SHOW CREATE VIEW {$viewQ}")->fetch();
        $key = isset($create['Create View']) ? 'Create View' : 'Create Table';
        $createSql = $create[$key];
        $w('DROP VIEW IF EXISTS ' . $viewQ . ';');
        $w($createSql . ';');
    } catch (Exception $e) {
        $w('-- Skip view ' . $view . ': ' . $e->getMessage());
    }
    $w('');
}

$w('SET FOREIGN_KEY_CHECKS = 1;');
$w('');
$w('-- =====================================================================');
$w('-- End of dump');
$w('-- =====================================================================');

fclose($fp);
echo "Selesai. Total tabel: " . count($tables) . ", view: " . count($views) . "\n";
echo "File siap diunggah ke hosting dan di-import lewat phpMyAdmin atau mysql client.\n";
