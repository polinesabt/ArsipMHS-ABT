<?php
/**
 * Reconcile derived chart records for achievement-based sections.
 *
 * Usage (CLI):
 *   php backend/scripts/reconcile-achievement-derived-records.php
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../api/insight/sync_helpers.php';

header('Content-Type: application/json');

$sectionSyncFunctions = [
    'student_achievements' => 'syncStudentAchievements',
    'publications' => 'syncPublications',
    'student_products' => 'syncStudentProducts',
    'research_outputs' => 'syncResearchOutputs',
];

$sectionRules = [
    'student_achievements' => [
        'table' => 'menu_student_achievements_records',
        'categories' => null,
    ],
    'publications' => [
        'table' => 'menu_publications_records',
        'categories' => ['scientific_work', 'event_participation'],
    ],
    'student_products' => [
        'table' => 'menu_student_products_records',
        'categories' => ['applied_academic'],
    ],
    'research_outputs' => [
        'table' => 'menu_research_outputs_records',
        'categories' => ['intellectual_property', 'scientific_work'],
    ],
];

function softDeleteOrphanRows(PDO $pdo, string $table): int {
    $sql = "
        UPDATE {$table} r
        LEFT JOIN achievements a ON a.id = r.source_id
        SET r.deleted_at = NOW(), r.updated_at = NOW()
        WHERE r.source_table = 'achievements'
          AND r.deleted_at IS NULL
          AND a.id IS NULL
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    return (int)$stmt->rowCount();
}

function softDeleteIrrelevantRows(PDO $pdo, string $table, ?array $allowedCategories): int {
    if ($allowedCategories === null) {
        return 0;
    }
    if (count($allowedCategories) === 0) {
        return 0;
    }

    $placeholders = implode(',', array_fill(0, count($allowedCategories), '?'));
    $sql = "
        UPDATE {$table} r
        INNER JOIN achievements a ON a.id = r.source_id
        SET r.deleted_at = NOW(), r.updated_at = NOW()
        WHERE r.source_table = 'achievements'
          AND r.deleted_at IS NULL
          AND a.category NOT IN ({$placeholders})
    ";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($allowedCategories);
    return (int)$stmt->rowCount();
}

$results = [];

try {
    $pdo->beginTransaction();
    try {
        foreach ($sectionSyncFunctions as $section => $syncFn) {
            if (!function_exists($syncFn)) {
                throw new Exception("Sync function tidak ditemukan: {$syncFn}");
            }

            $table = $sectionRules[$section]['table'];
            $allowedCategories = $sectionRules[$section]['categories'];

            $syncedCount = (int)$syncFn($pdo);
            $softDeletedOrphan = softDeleteOrphanRows($pdo, $table);
            $softDeletedIrrelevant = softDeleteIrrelevantRows($pdo, $table, $allowedCategories);
            updateChartSyncLog($pdo, $section, null);

            $results[$section] = [
                'table' => $table,
                'synced_from_master' => $syncedCount,
                'soft_deleted_orphan' => $softDeletedOrphan,
                'soft_deleted_irrelevant' => $softDeletedIrrelevant,
            ];
        }

        $pdo->commit();
    } catch (Exception $inner) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $inner;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Rekonsiliasi achievement-derived records selesai.',
        'data' => $results,
    ], JSON_PRETTY_PRINT);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ], JSON_PRETTY_PRINT);
}

