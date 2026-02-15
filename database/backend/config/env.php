<?php
/**
 * Environment Loader untuk PHP Backend.
 *
 * Stabil across requests:
 * - local/dev default: .env.local -> .env -> .env.production
 * - explicit production (APP_ENV dari server env): .env.production -> .env
 *
 * NOTE: do not read APP_ENV from putenv-loaded values here; that can change per request.
 */

$rootDir = __DIR__ . '/../../..';
$serverAppEnv = strtolower(trim((string)($_SERVER['APP_ENV'] ?? '')));

$host = strtolower(trim((string)($_SERVER['HTTP_HOST'] ?? '')));
$hostOnly = $host !== '' ? explode(':', $host, 2)[0] : '';
$isLocalRequest = in_array($hostOnly, ['localhost', '127.0.0.1', '::1'], true);

// Keep env selection deterministic for localhost development.
// Do not rely on REDIRECT_APP_ENV because it can vary on internal redirects.
$isExplicitProduction = !$isLocalRequest && in_array($serverAppEnv, ['production', 'prod'], true);

$candidates = $isExplicitProduction
    ? [$rootDir . '/.env.production', $rootDir . '/.env']
    : [$rootDir . '/.env.local', $rootDir . '/.env', $rootDir . '/.env.production'];

$envFile = null;
foreach ($candidates as $candidate) {
    if (file_exists($candidate)) {
        $envFile = $candidate;
        break;
    }
}

if ($envFile === null) {
    throw new Exception(
        'File env tidak ditemukan. Sediakan .env.local/.env untuk development atau .env.production/.env untuk production'
    );
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach ($lines as $line) {
    $line = preg_replace('/^\xEF\xBB\xBF/', '', $line) ?? $line;
    $trimmedLine = trim($line);
    if ($trimmedLine === '' || strpos($trimmedLine, '#') === 0) {
        continue;
    }

    if (strpos($line, '=') === false) {
        continue;
    }

    [$key, $value] = explode('=', $line, 2);
    $key = preg_replace('/^\xEF\xBB\xBF/', '', trim($key)) ?? trim($key);
    $value = preg_replace('/^\xEF\xBB\xBF/', '', trim($value)) ?? trim($value);

    if (
        (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) ||
        (strpos($value, "'") === 0 && strrpos($value, "'") === strlen($value) - 1)
    ) {
        $value = substr($value, 1, -1);
    }

    $value = trim($value);
    putenv($key . '=' . $value);
    $_ENV[$key] = $value;
}
?>
