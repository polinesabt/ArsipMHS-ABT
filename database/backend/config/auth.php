<?php
/**
 * JWT Authentication Helper
 * Centralized issue + verify JWT and bearer auth utilities.
 */

require_once __DIR__ . '/env.php';

if (!function_exists('auth_trim_bom')) {
    function auth_trim_bom(string $value): string {
        return preg_replace('/^\xEF\xBB\xBF/', '', $value) ?? $value;
    }
}

if (!function_exists('auth_env')) {
    function auth_env(string $key, string $fallback = ''): string {
        $value = getenv($key);
        if ($value === false) {
            return $fallback;
        }

        $value = auth_trim_bom(trim((string)$value));
        return $value !== '' ? $value : $fallback;
    }
}

if (!defined('JWT_SECRET')) {
    define(
        'JWT_SECRET',
        auth_env('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')
    );
}
if (!defined('JWT_ALGORITHM')) {
    define('JWT_ALGORITHM', strtoupper(auth_env('JWT_ALGORITHM', 'HS256')));
}
if (!defined('JWT_EXPIRATION')) {
    $exp = (int)auth_env('JWT_EXPIRATION', '86400');
    define('JWT_EXPIRATION', $exp > 0 ? $exp : 86400);
}
if (!defined('JWT_ACCESS_EXPIRATION')) {
    $exp = (int)auth_env('JWT_ACCESS_EXPIRATION', '900');
    define('JWT_ACCESS_EXPIRATION', $exp > 0 ? $exp : 900);
}
if (!defined('JWT_REFRESH_EXPIRATION')) {
    $exp = (int)auth_env('JWT_REFRESH_EXPIRATION', '604800');
    define('JWT_REFRESH_EXPIRATION', $exp > 0 ? $exp : 604800);
}

function auth_json_error(int $statusCode, string $error, string $code): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $error,
        'code' => $code,
    ]);
    exit();
}

function auth_base64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function auth_base64url_decode(string $input): string {
    $remainder = strlen($input) % 4;
    if ($remainder > 0) {
        $input .= str_repeat('=', 4 - $remainder);
    }
    $decoded = base64_decode(strtr($input, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
}

function auth_get_authorization_headers(): array {
    $candidates = [
        $_SERVER['HTTP_AUTHORIZATION'] ?? null,
        $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
        $_SERVER['REDIRECT_REDIRECT_HTTP_AUTHORIZATION'] ?? null,
        $_SERVER['Authorization'] ?? null,
    ];

    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $key => $value) {
            if (strcasecmp($key, 'Authorization') === 0) {
                $candidates[] = $value;
            }
        }
    }

    return $candidates;
}

function auth_extract_bearer_tokens(string $header): array {
    if (trim($header) === '') {
        return [];
    }

    $matches = [];
    if (preg_match_all('/Bearer\s+([A-Za-z0-9\-_\.]+)/i', $header, $matches) !== 1) {
        return [];
    }

    $tokens = [];
    foreach ($matches[1] as $token) {
        $token = trim((string)$token);
        if ($token !== '') {
            $tokens[] = $token;
        }
    }

    return $tokens;
}

function auth_get_bearer_tokens(): array {
    $tokens = [];
    $seen = [];

    foreach (auth_get_authorization_headers() as $header) {
        if (!is_string($header)) {
            continue;
        }

        foreach (auth_extract_bearer_tokens($header) as $token) {
            if (isset($seen[$token])) {
                continue;
            }
            $seen[$token] = true;
            $tokens[] = $token;
        }
    }

    return $tokens;
}

function auth_get_bearer_token(): ?string {
    $tokens = auth_get_bearer_tokens();
    return $tokens[0] ?? null;
}

/**
 * Generate JWT (access or refresh by expiration).
 *
 * @param array $payload claims (sub, username, role, etc.)
 * @param int|null $expirationSeconds null = use JWT_ACCESS_EXPIRATION
 * @return string JWT
 */
function auth_generate_token(array $payload, ?int $expirationSeconds = null): string {
    if (JWT_ALGORITHM !== 'HS256') {
        throw new Exception('JWT_ALGORITHM tidak didukung');
    }

    $secret = auth_trim_bom(trim((string)JWT_SECRET));
    if ($secret === '') {
        throw new Exception('JWT_SECRET tidak boleh kosong');
    }

    $exp = $expirationSeconds !== null ? $expirationSeconds : JWT_ACCESS_EXPIRATION;
    $now = time();
    $tokenPayload = $payload;
    $tokenPayload['iat'] = $now;
    $tokenPayload['exp'] = $now + $exp;

    $headerEncoded = auth_base64url_encode(json_encode([
        'alg' => JWT_ALGORITHM,
        'typ' => 'JWT',
    ]));
    $payloadEncoded = auth_base64url_encode(json_encode($tokenPayload));
    $signature = hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true);
    $signatureEncoded = auth_base64url_encode($signature);

    return $headerEncoded . '.' . $payloadEncoded . '.' . $signatureEncoded;
}

function auth_verify_token_detailed(string $token): array {
    $token = trim($token);
    if ($token === '') {
        return ['ok' => false, 'reason' => 'missing'];
    }

    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return ['ok' => false, 'reason' => 'malformed'];
    }

    [$headerEncoded, $payloadEncoded, $signatureEncoded] = $parts;

    $headerJson = auth_base64url_decode($headerEncoded);
    $payloadJson = auth_base64url_decode($payloadEncoded);

    if ($headerJson === '' || $payloadJson === '') {
        return ['ok' => false, 'reason' => 'malformed'];
    }

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);

    if (!is_array($header) || !is_array($payload)) {
        return ['ok' => false, 'reason' => 'malformed'];
    }

    if (($header['alg'] ?? null) !== JWT_ALGORITHM) {
        return ['ok' => false, 'reason' => 'malformed'];
    }

    if (JWT_ALGORITHM !== 'HS256') {
        return ['ok' => false, 'reason' => 'malformed'];
    }

    $secret = auth_trim_bom(trim((string)JWT_SECRET));
    if ($secret === '') {
        return ['ok' => false, 'reason' => 'invalid_signature'];
    }

    $expectedSignature = auth_base64url_encode(
        hash_hmac('sha256', $headerEncoded . '.' . $payloadEncoded, $secret, true)
    );

    if (!hash_equals($expectedSignature, $signatureEncoded)) {
        return ['ok' => false, 'reason' => 'invalid_signature'];
    }

    $now = time();
    if (isset($payload['exp']) && (int)$payload['exp'] < $now) {
        return ['ok' => false, 'reason' => 'expired'];
    }

    return [
        'ok' => true,
        'reason' => 'ok',
        'payload' => $payload,
    ];
}

function auth_verify_token(string $token): ?array {
    $verify = auth_verify_token_detailed($token);
    if (!($verify['ok'] ?? false) || !isset($verify['payload']) || !is_array($verify['payload'])) {
        return null;
    }

    /** @var array $payload */
    $payload = $verify['payload'];
    return $payload;
}

function auth_error_from_reason(string $reason): array {
    switch ($reason) {
        case 'missing':
            return [401, 'Token autentikasi tidak ditemukan', 'AUTH_TOKEN_MISSING'];
        case 'malformed':
            return [401, 'Token tidak valid', 'AUTH_TOKEN_MALFORMED'];
        case 'invalid_signature':
            return [401, 'Token tidak valid atau sudah kedaluwarsa', 'AUTH_TOKEN_INVALID_SIGNATURE'];
        case 'expired':
            return [401, 'Token tidak valid atau sudah kedaluwarsa', 'AUTH_TOKEN_EXPIRED'];
        case 'role_forbidden':
            return [403, 'Akses ditolak untuk role saat ini', 'AUTH_TOKEN_ROLE_FORBIDDEN'];
        default:
            return [401, 'Token tidak valid', 'AUTH_TOKEN_INVALID_SIGNATURE'];
    }
}

function auth_abort_from_reason(string $reason): void {
    [$statusCode, $error, $code] = auth_error_from_reason($reason);
    auth_json_error($statusCode, $error, $code);
}

function auth_pick_best_failure_reason(array $reasons): string {
    if (in_array('expired', $reasons, true)) {
        return 'expired';
    }
    if (in_array('invalid_signature', $reasons, true)) {
        return 'invalid_signature';
    }
    if (in_array('malformed', $reasons, true)) {
        return 'malformed';
    }
    if (in_array('missing', $reasons, true)) {
        return 'missing';
    }

    return 'malformed';
}

/**
 * Require authenticated user. Optional role enforcement.
 *
 * @param string|null $requiredRole e.g. 'admin' or 'student'
 * @return array token payload
 */
function requireAuth(?string $requiredRole = null): array {
    $tokens = auth_get_bearer_tokens();
    if (count($tokens) === 0) {
        auth_abort_from_reason('missing');
    }

    $verifyFailures = [];
    $hasRoleMismatch = false;

    foreach ($tokens as $token) {
        $verify = auth_verify_token_detailed($token);
        if (!($verify['ok'] ?? false)) {
            $verifyFailures[] = (string)($verify['reason'] ?? 'malformed');
            continue;
        }

        $payload = $verify['payload'] ?? null;
        if (!is_array($payload)) {
            $verifyFailures[] = 'malformed';
            continue;
        }

        if ($requiredRole !== null && ($payload['role'] ?? null) !== $requiredRole) {
            $hasRoleMismatch = true;
            continue;
        }

        return $payload;
    }

    if ($hasRoleMismatch) {
        auth_abort_from_reason('role_forbidden');
    }

    auth_abort_from_reason(auth_pick_best_failure_reason($verifyFailures));
}
?>
