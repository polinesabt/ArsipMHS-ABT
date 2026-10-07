<?php
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/security.php';

function login_limit_keys(string $identifier): array {
    $secret = (string)JWT_SECRET;
    $ip = getClientIP();
    return [
        hash_hmac('sha256', $ip, $secret),
        hash_hmac('sha256', mb_strtolower(trim($identifier)), $secret),
    ];
}

function login_limit_check(PDO $pdo, string $identifier): void {
    [$ipHash, $identifierHash] = login_limit_keys($identifier);
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip_hash = ? AND identifier_hash = ? AND failed_at > NOW(6) - INTERVAL 15 MINUTE');
    $stmt->execute([$ipHash, $identifierHash]);
    $pairFailures = (int)$stmt->fetchColumn();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip_hash = ? AND failed_at > NOW(6) - INTERVAL 15 MINUTE');
    $stmt->execute([$ipHash]);
    $ipFailures = (int)$stmt->fetchColumn();
    if ($pairFailures >= 5 || $ipFailures >= 30) {
        header('Retry-After: 900');
        auth_json_error(429, 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.', 'AUTH_RATE_LIMITED');
    }
}

function login_limit_failed(PDO $pdo, string $identifier): void {
    [$ipHash, $identifierHash] = login_limit_keys($identifier);
    $stmt = $pdo->prepare('INSERT INTO login_attempts (ip_hash, identifier_hash) VALUES (?, ?)');
    $stmt->execute([$ipHash, $identifierHash]);
    if (random_int(1, 100) === 1) {
        $pdo->exec('DELETE FROM login_attempts WHERE failed_at < NOW(6) - INTERVAL 1 DAY');
    }
}

function login_limit_succeeded(PDO $pdo, string $identifier): void {
    [$ipHash, $identifierHash] = login_limit_keys($identifier);
    $stmt = $pdo->prepare('DELETE FROM login_attempts WHERE ip_hash = ? AND identifier_hash = ?');
    $stmt->execute([$ipHash, $identifierHash]);
}
