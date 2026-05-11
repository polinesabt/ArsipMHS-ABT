<?php
/**
 * CORS Configuration
 *
 * Untuk production, set ALLOWED_ORIGIN dengan domain production Anda.
 * Untuk development, ALLOWED_ORIGIN bisa "*".
 */

$allowedOrigin = '*';

// Load environment untuk production origin (fallback aman jika env tidak ditemukan)
try {
    require_once __DIR__ . '/env.php';
    $allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '*';
} catch (Throwable $e) {
    $allowedOrigin = '*';
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Development: allow any origin by echoing back the request origin (compatible with credentials)
// Production: allow only whitelisted origins
if ($allowedOrigin === '*' || empty($allowedOrigin)) {
    if (!empty($origin)) {
        header("Access-Control-Allow-Origin: $origin");
    }
} else {
    $allowedOrigins = array_map('trim', explode(',', $allowedOrigin));
    if (!empty($origin) && in_array($origin, $allowedOrigins, true)) {
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
