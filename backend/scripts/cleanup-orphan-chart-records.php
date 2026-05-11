<?php
/**
 * One-off cleanup untuk snapshot chart yatim (akun mahasiswa sudah hard-delete di masa lalu).
 *
 * Usage:
 *   php backend/scripts/cleanup-orphan-chart-records.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../api/students/recycle_helpers.php';

$summary = [
    'success' => false,
    'deleted_total' => 0,
    'deleted_by_section' => [],
];

try {
    $pdo->beginTransaction();

    foreach (student_recycle_chart_tables() as $section => $table) {
        $sql = "
            DELETE r
            FROM {$table} r
            LEFT JOIN students s ON s.nim = r.snapshot_nim
            WHERE s.id IS NULL
        ";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $deleted = (int)$stmt->rowCount();
        $summary['deleted_by_section'][$section] = $deleted;
        $summary['deleted_total'] += $deleted;
    }

    $pdo->commit();
    $summary['success'] = true;
    echo json_encode($summary, JSON_PRETTY_PRINT);
    exit(0);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $summary['error'] = $e->getMessage();
    echo json_encode($summary, JSON_PRETTY_PRINT);
    exit(1);
}
