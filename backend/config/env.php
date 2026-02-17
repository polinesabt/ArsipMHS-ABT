<?php
/**
 * Environment Loader untuk PHP Backend.
 * Hanya membaca satu file: .env (copy dari .env.example, isi nilai per environment).
 */

$rootDir = __DIR__ . '/../..';
$envFile = $rootDir . '/.env';

if (!file_exists($envFile)) {
    throw new Exception(
        'File .env tidak ditemukan. Copy .env.example ke .env dan isi nilai konfigurasi.'
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
