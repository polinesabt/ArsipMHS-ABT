<?php
/**
 * Pindahkan entri logbook (record_change_logs) yang sudah lebih dari 20 hari
 * ke Recycle Bin dengan set deleted_at = NOW().
 * Jadwalkan via cron (misalnya sekali sehari).
 *
 * Usage:
 *   php backend/scripts/purge-logbook-to-recycle.php
 */

require_once __DIR__ . '/../config/database.php';

$results = [
    'success' => false,
    'moved_count' => 0,
    'moved_ids' => [],
];

$days = 20;

try {
    // Cek apakah kolom deleted_at ada (migration 2026-02-28-logbook-recycle-bin.sql)
    $cols = $pdo->query("SHOW COLUMNS FROM record_change_logs LIKE 'deleted_at'");
    if ($cols->rowCount() === 0) {
        $results['error'] = 'Kolom deleted_at belum ada. Jalankan migration 2026-02-28-logbook-recycle-bin.sql dulu.';
        echo json_encode($results, JSON_PRETTY_PRINT);
        exit(1);
    }

    $stmt = $pdo->prepare("
        SELECT id
        FROM record_change_logs
        WHERE deleted_at IS NULL
          AND changed_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY changed_at ASC
    ");
    $stmt->execute([$days]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (count($ids) === 0) {
        $results['success'] = true;
        echo json_encode($results, JSON_PRETTY_PRINT);
        exit(0);
    }

    $update = $pdo->prepare("UPDATE record_change_logs SET deleted_at = NOW() WHERE id = ?");
    foreach ($ids as $id) {
        $update->execute([$id]);
        $results['moved_count']++;
        $results['moved_ids'][] = $id;
    }

    $results['success'] = true;
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
} catch (Exception $e) {
    $results['error'] = $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(1);
}
