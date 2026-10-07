<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../../../config/access.php';
require_once __DIR__ . '/recycle_helpers.php';

header('Content-Type: application/json');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
    ]);
    exit;
}

try {
    $auth = requireAuth();
    $ownStudentId = requireStudentDataRead($pdo, $auth);

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';

    $payload = attachment_recycle_list($pdo, $page, $perPage, $search, $ownStudentId);

    echo json_encode([
        'success' => true,
        'data' => $payload,
    ]);
} catch (Exception $e) {
    http_response_code(api_exception_status($e));
    echo json_encode([
        'success' => false,
        'error' => api_public_error($e),
    ]);
}
