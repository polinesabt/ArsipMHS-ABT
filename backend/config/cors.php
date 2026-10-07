<?php
require_once __DIR__ . '/api_errors.php';
/**
 * CORS Configuration
 *
 * Untuk production, set ALLOWED_ORIGIN dengan domain production Anda.
 * Untuk development, ALLOWED_ORIGIN bisa "*".
 */

$allowedOrigin = '';

// Load environment untuk production origin (fallback aman jika env tidak ditemukan)
try {
    require_once __DIR__ . '/env.php';
    $allowedOrigin = trim((string)(getenv('ALLOWED_ORIGIN') ?: ''));
} catch (Throwable $e) {
    $allowedOrigin = '';
}

$configuredOrigins = array_map('trim', explode(',', $allowedOrigin));
if ((getenv('APP_ENV') ?: 'production') !== 'development' && ($allowedOrigin === '' || in_array('*', $configuredOrigins, true))) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(503);
    echo json_encode(['success' => false, 'error' => 'Konfigurasi CORS server belum aman', 'code' => 'CORS_CONFIGURATION_ERROR']);
    exit();
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Development: allow any origin by echoing back the request origin (compatible with credentials)
// Production: allow only whitelisted origins
if ($allowedOrigin === '*' || empty($allowedOrigin)) {
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }
} else {
    if (!empty($origin) && in_array($origin, $configuredOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    }
}

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Auth-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 86400'); // 24 hours

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load security headers (only in production)
if (getenv('APP_ENV') === 'production') {
    require_once __DIR__ . '/security.php';
    setSecurityHeaders();
}
?>
