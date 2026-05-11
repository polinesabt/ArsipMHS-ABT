<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        throw new Exception('ID template diperlukan');
    }

    $id = trim((string)$input['id']);
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

    $check = $pdo->prepare("SELECT is_default FROM satisfaction_form_templates WHERE id = ? AND deleted_at IS NULL LIMIT 1");
    $check->execute([$id]);
    $row = $check->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }
    if (!empty($row['is_default'])) {
        throw new Exception('Template utama tidak dapat diedit');
    }

    $stmt = $pdo->prepare("
        UPDATE satisfaction_form_templates
        SET title = ?, definition = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
    ");
    $stmt->execute([$title, $definitionJson, $id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Template tidak ditemukan']);
        return;
    }

    $get = $pdo->prepare("SELECT id, title, definition, is_default, is_active, created_at, updated_at FROM satisfaction_form_templates WHERE id = ? LIMIT 1");
    $get->execute([$id]);
    $out = $get->fetch(PDO::FETCH_ASSOC);
    $out['is_default'] = (bool)$out['is_default'];
    $out['is_active'] = (bool)$out['is_active'];
    if (isset($out['definition']) && is_string($out['definition'])) {
        $out['definition'] = json_decode($out['definition'], true);
    }

    echo json_encode([
        'success' => true,
        'data' => $out,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
