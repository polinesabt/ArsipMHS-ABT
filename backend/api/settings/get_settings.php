<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $settings = [
        'dosen_module_enabled' => 'true',
    ];

    try {
        $stmt = $pdo->query('SELECT key_name, value_text FROM system_settings');
        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $settings[$row['key_name']] = $row['value_text'];
            }
        }
    } catch (Throwable $e) {
        // If table doesn't exist yet, return defaults safely
    }

    echo json_encode([
        'success' => true,
        'data' => $settings,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Gagal mengambil pengaturan sistem: ' . $e->getMessage(),
    ]);
}
