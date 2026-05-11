<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid');
    }

    $title = trim((string)($input['title'] ?? ''));
    $definition = $input['definition'] ?? null;

    if ($title === '') {
        throw new Exception('Judul formulir wajib diisi');
    }
    if (!is_array($definition) || !isset($definition['sections'])) {
        throw new Exception('Definisi formulir (sections) tidak valid');
    }

    $definitionJson = json_encode($definition);
    if ($definitionJson === false) {
        throw new Exception('Definisi formulir tidak valid (JSON)');
    }

    $id = sprintf('%s-%s-%s-%s-%s',
        bin2hex(random_bytes(4)),
        bin2hex(random_bytes(2)),
        bin2hex(random_bytes(2)),
        bin2hex(random_bytes(2)),
        bin2hex(random_bytes(6))
    );

    $stmt = $pdo->prepare("
        INSERT INTO satisfaction_form_templates (id, title, definition, is_default, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 0, 0, NOW(), NOW())
    ");
    $stmt->execute([$id, $title, $definitionJson]);

    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $id,
            'title' => $title,
            'definition' => $definition,
            'is_default' => false,
            'is_active' => false,
            'created_at' => (new DateTime())->format('Y-m-d H:i:s'),
            'updated_at' => (new DateTime())->format('Y-m-d H:i:s'),
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
