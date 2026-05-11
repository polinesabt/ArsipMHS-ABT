<?php
/**
 * Hapus permanen entri logbook (record_change_logs) yang sudah lebih dari 20 hari.
 * Tidak ada recycle bin untuk logbook; langsung hapus permanen.
 * Jadwalkan via cron / Task Scheduler (misalnya sekali sehari).
 *
 * Usage:
 *   php backend/scripts/purge-logbook-old.php
 */

require_once __DIR__ . '/../config/database.php';

$results = [
    'success' => false,
    'deleted_count' => 0,
    'deleted_ids' => [],
];

$days = 20;

try {
    $stmt = $pdo->prepare("
        SELECT id
        FROM record_change_logs
        WHERE changed_at <= DATE_SUB(NOW(), INTERVAL ? DAY)
        ORDER BY changed_at ASC
    ");
    $stmt->execute([$days]);
    $ids = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (count($ids) === 0) {
        $results['success'] = true;
        echo json_encode($results, JSON_PRETTY_PRINT);
        exit(0);
    }

    $delete = $pdo->prepare("DELETE FROM record_change_logs WHERE id = ?");
    foreach ($ids as $id) {
        $delete->execute([$id]);
        $results['deleted_count']++;
        $results['deleted_ids'][] = $id;
    }

    $results['success'] = true;
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
} catch (Exception $e) {
    $results['error'] = $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(1);
}
