<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/template_resolver.php';

/**
 * Return the currently active satisfaction form template.
 * No admin auth required - used by survey page (invitation token validates access).
 */
try {
    $resolved = resolveCurrentSatisfactionTemplate($pdo);
    $row = $resolved['template'];

    echo json_encode([
        'success' => true,
        'data' => $row,
        'resolved_via' => $resolved['resolved_via'] ?? 'active',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
