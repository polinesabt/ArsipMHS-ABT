<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $stmt = $pdo->query("
        SELECT id, title, definition, is_default, is_active, created_at, updated_at
        FROM satisfaction_form_templates
        WHERE deleted_at IS NULL
        ORDER BY is_default DESC, updated_at DESC
    ");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['is_default'] = (bool)$row['is_default'];
        $row['is_active'] = (bool)$row['is_active'];
        if (isset($row['definition']) && is_string($row['definition'])) {
            $row['definition'] = json_decode($row['definition'], true);
        }
    }
    unset($row);

    echo json_encode([
        'success' => true,
        'data' => $rows,
        'count' => count($rows),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
