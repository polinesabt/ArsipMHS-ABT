<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

function refresh_fail(int $statusCode, string $error, string $code): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $error,
        'code' => $code,
    ]);
    exit();
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        refresh_fail(405, 'Method not allowed', 'AUTH_REFRESH_METHOD');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $refreshToken = isset($input['refresh_token']) ? trim((string)$input['refresh_token']) : '';

    if ($refreshToken === '') {
        refresh_fail(401, 'Refresh token tidak ditemukan', 'AUTH_REFRESH_MISSING');
    }

    $verify = auth_verify_token_detailed($refreshToken);
    if (!($verify['ok'] ?? false)) {
        $reason = (string)($verify['reason'] ?? 'invalid');
        [$statusCode, $error, $code] = auth_error_from_reason($reason);
        refresh_fail($statusCode, $error, $code);
    }

    $payload = $verify['payload'] ?? null;
    if (!is_array($payload) || empty($payload['sub']) || empty($payload['role'])) {
        refresh_fail(401, 'Token tidak valid', 'AUTH_REFRESH_INVALID_PAYLOAD');
    }

    $tokenPayload = [
        'sub' => $payload['sub'],
        'username' => $payload['username'] ?? '',
        'role' => $payload['role'],
    ];

    $newAccessToken = auth_generate_token($tokenPayload);
    $newRefreshToken = auth_generate_token($tokenPayload, JWT_REFRESH_EXPIRATION);

    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $newAccessToken,
            'refreshToken' => $newRefreshToken,
        ],
        'message' => 'Token diperbarui',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Gagal memperbarui token',
        'code' => 'AUTH_REFRESH_ERROR',
    ]);
}
?>
