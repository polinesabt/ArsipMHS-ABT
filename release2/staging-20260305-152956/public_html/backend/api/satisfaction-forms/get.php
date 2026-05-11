<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $id = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
    if ($id === '') {
        throw new Exception('ID template diperlukan');
    }

    $stmt = $pdo->prepare("
        SELECT id, title, definition, is_default, is_active, created_at, updated_at
        FROM satisfaction_form_templates
        WHERE id = ? AND deleted_at IS NULL
        LIMIT 1
    ");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }

    $row['is_default'] = (bool)$row['is_default'];
    $row['is_active'] = (bool)$row['is_active'];
    if (isset($row['definition']) && is_string($row['definition'])) {
        $row['definition'] = json_decode($row['definition'], true);
    }

    echo json_encode([
        'success' => true,
        'data' => $row,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
