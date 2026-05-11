<?php
/**
 * Serve file lampiran form kepuasan (admin only).
 * GET ?path=satisfaction_attachments/...
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    requireAuth('admin');

    $path = isset($_GET['path']) ? trim((string)$_GET['path']) : '';
    if ($path === '' || strpos($path, 'satisfaction_attachments/') !== 0) {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Parameter path tidak valid.']);
        exit;
    }

    $path = preg_replace('/\.\./', '', $path);
    $basePath = __DIR__ . '/../../storage/';
    $resolvedBase = realpath($basePath);
    $fullPath = realpath($basePath . $path);

    if ($resolvedBase === false || $fullPath === false || strpos($fullPath, $resolvedBase) !== 0 || !is_file($fullPath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'File tidak ditemukan.']);
        exit;
    }

    $mime = @mime_content_type($fullPath) ?: 'application/octet-stream';
    $fileName = basename($path);
    $fileSize = filesize($fullPath);

    header('Content-Type: ' . $mime);
    header('Content-Length: ' . $fileSize);
    header('Content-Disposition: inline; filename="' . str_replace('"', '\\"', $fileName) . '"');
    readfile($fullPath);
    exit;
} catch (Exception $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
