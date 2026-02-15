<?php
/**
 * One-off script: create table uji_agent and insert one row.
 * Uses project database config. Run from project root: php database/run_uji_agent.php
 */

require_once __DIR__ . '/backend/config/database.php';

$created = false;
$inserted = false;
$error = null;

try {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS uji_agent (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nama VARCHAR(100),
            nim VARCHAR(20)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $created = true;

    $stmt = $pdo->prepare("INSERT INTO uji_agent (nama, nim) VALUES (?, ?)");
    $stmt->execute(['fauzi', '123']);
    $inserted = true;
} catch (PDOException $e) {
    $error = $e->getMessage();
}

if ($error) {
    fwrite(STDERR, "Error: " . $error . "\n");
    exit(1);
}

echo "OK: Tabel uji_agent dibuat. Data (nama=fauzi, nim=123) berhasil dimasukkan.\n";
exit(0);
