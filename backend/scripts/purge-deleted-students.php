<?php
/**
 * Auto purge akun mahasiswa yang sudah >30 hari di Recycle Bin.
 *
 * Usage:
 *   php backend/scripts/purge-deleted-students.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../api/students/recycle_helpers.php';
require_once __DIR__ . '/../api/achievements/attachments/recycle_helpers.php';
require_once __DIR__ . '/../api/evaluations/recycle_helpers.php';

$actor = 'system-auto-purge';
$results = [
    'success' => false,
    'purged_count' => 0,
    'purged_student_ids' => [],
    'purged_attachments_count' => 0,
    'purged_attachment_ids' => [],
    'purged_evaluations_count' => 0,
    'purged_evaluation_ids' => [],
];

try {
    $studentStmt = $pdo->query("
        SELECT id
        FROM students
        WHERE deleted_at IS NOT NULL
          AND deleted_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY deleted_at ASC
    ");
    $studentIds = $studentStmt->fetchAll(PDO::FETCH_COLUMN);

    $evaluationStmt = $pdo->query("
        SELECT id
        FROM evaluations
        WHERE deleted_at IS NOT NULL
          AND deleted_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)
        ORDER BY deleted_at ASC
    ");
    $evaluationIds = $evaluationStmt->fetchAll(PDO::FETCH_COLUMN);

    $attachmentIds = [];
    foreach (achievement_store_configs() as $config) {
        $attachmentTable = $config['attachment_table'];
        $stmt = $pdo->query("
            SELECT id
            FROM {$attachmentTable}
            WHERE deleted_at IS NOT NULL
              AND deleted_at <= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ORDER BY deleted_at ASC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($rows as $id) {
            $attachmentIds[] = $id;
        }
    }

    if (count($studentIds) === 0 && count($attachmentIds) === 0 && count($evaluationIds) === 0) {
        $results['success'] = true;
        echo json_encode($results, JSON_PRETTY_PRINT);
        exit(0);
    }

    $pdo->beginTransaction();
    foreach ($attachmentIds as $attachmentId) {
        attachment_recycle_permanent_delete($pdo, (string)$attachmentId, $actor, false);
        $results['purged_attachments_count']++;
        $results['purged_attachment_ids'][] = $attachmentId;
    }

    foreach ($evaluationIds as $evaluationId) {
        evaluation_recycle_permanent_delete($pdo, (string)$evaluationId, $actor);
        $results['purged_evaluations_count']++;
        $results['purged_evaluation_ids'][] = $evaluationId;
    }

    foreach ($studentIds as $studentId) {
        student_recycle_permanent_delete($pdo, (string)$studentId, $actor);
        $results['purged_count']++;
        $results['purged_student_ids'][] = $studentId;
    }
    $pdo->commit();

    $results['success'] = true;
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(0);
} catch (Exception $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    $results['error'] = $e->getMessage();
    echo json_encode($results, JSON_PRETTY_PRINT);
    exit(1);
}
