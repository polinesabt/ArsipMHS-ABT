<?php
require_once __DIR__ . '/../backend/config/auth.php';

function check(bool $condition, string $message): void {
    if (!$condition) {
        fwrite(STDERR, "FAIL: {$message}\n");
        exit(1);
    }
}

$claims = ['sub' => 'test-user', 'username' => 'test-user', 'role' => 'admin'];
$access = auth_generate_token($claims);
$refresh = auth_generate_token($claims, JWT_REFRESH_EXPIRATION, 'refresh');

check(auth_verify_token($access) !== null, 'access token accepted for API');
check(auth_verify_token($refresh) === null, 'refresh token rejected for API');
check((auth_verify_token_detailed($access)['payload']['typ'] ?? null) === 'access', 'access purpose claim');
check((auth_verify_token_detailed($refresh)['payload']['typ'] ?? null) === 'refresh', 'refresh purpose claim');

$legacyParts = explode('.', $access);
$legacyClaims = json_decode(auth_base64url_decode($legacyParts[1]), true);
unset($legacyClaims['typ']);
$legacyParts[1] = auth_base64url_encode(json_encode($legacyClaims));
$legacyParts[2] = auth_base64url_encode(hash_hmac(
    'sha256', $legacyParts[0] . '.' . $legacyParts[1], JWT_SECRET, true
));
$legacy = implode('.', $legacyParts);
check(!(auth_verify_token_detailed($legacy)['ok'] ?? false), 'legacy token without purpose rejected');

$badParts = explode('.', $access);
$badParts[2] = str_repeat('a', strlen($badParts[2]));
check(!(auth_verify_token_detailed(implode('.', $badParts))['ok'] ?? false), 'bad signature rejected');

$sessionExpiry = time() + 120;
$bounded = auth_generate_token($claims + ['session_exp' => $sessionExpiry], JWT_REFRESH_EXPIRATION, 'refresh');
$boundedClaims = auth_verify_token_detailed($bounded)['payload'] ?? [];
check(($boundedClaims['exp'] ?? 0) === $sessionExpiry, 'refresh cannot extend absolute session');

echo "PASS: token purpose, signature, and session lifetime\n";
