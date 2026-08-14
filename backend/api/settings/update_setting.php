<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $payload = requireAuth('developer');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['key']) || !isset($input['value'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Parameter key dan value wajib diisi']);
        exit();
    }

    $key = trim((string)$input['key']);
    $value = (string)$input['value'];

    // Ensure system_settings table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
          key_name VARCHAR(100) PRIMARY KEY,
          value_text TEXT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $stmt = $pdo->prepare('
        INSERT INTO system_settings (key_name, value_text)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE value_text = VALUES(value_text)
    ');
    $stmt->execute([$key, $value]);

    echo json_encode([
        'success' => true,
        'message' => 'Pengaturan berhasil diperbarui',
        'data' => [
            'key' => $key,
            'value' => $value,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Gagal mengupdate pengaturan: ' . $e->getMessage(),
    ]);
}
