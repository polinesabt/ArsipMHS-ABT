<?php
/**
 * One-off script: hapus isi tabel uji_agent lalu drop tabel.
 * Uses project database config. Run from project root: php backend/database/drop_uji_agent.php
 */

require_once __DIR__ . '/../config/database.php';

try {
    $pdo->exec("DELETE FROM uji_agent");
    $pdo->exec("DROP TABLE uji_agent");
} catch (PDOException $e) {
    fwrite(STDERR, "Error: " . $e->getMessage() . "\n");
    exit(1);
}

echo "OK: Data tabel uji_agent dihapus, tabel uji_agent di-drop dari database.\n";
exit(0);
