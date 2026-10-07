<?php
declare(strict_types=1);

if (getenv('SECURITY_TEST_DB') !== '1') {
    fwrite(STDERR, "Set SECURITY_TEST_DB=1 dan TEST_DB_* untuk menjalankan tes database sementara.\n");
    exit(2);
}
putenv('APP_ENV=development');
putenv('JWT_SECRET=local-test-secret-0123456789-abcdefghijk');
require_once __DIR__ . '/../config/login_rate_limit.php';

$case = $argv[1] ?? null;
if ($case !== null) {
    $host = getenv('TEST_DB_HOST') ?: '127.0.0.1';
    $name = getenv('TEST_DB_NAME') ?: 'mysql';
    $user = getenv('TEST_DB_USER') ?: 'root';
    $pass = getenv('TEST_DB_PASS') ?: '';
    $pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec('CREATE TEMPORARY TABLE login_attempts (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, ip_hash CHAR(64), identifier_hash CHAR(64), failed_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6), INDEX (ip_hash, identifier_hash, failed_at), INDEX (ip_hash, failed_at))');
    $_SERVER['REMOTE_ADDR'] = '127.0.0.1';
    if ($case === 'pair_four') {
        for ($i = 0; $i < 4; $i++) login_limit_failed($pdo, 'alice');
        login_limit_check($pdo, 'alice');
    } elseif ($case === 'pair_five') {
        for ($i = 0; $i < 5; $i++) login_limit_failed($pdo, 'alice');
        login_limit_check($pdo, 'alice');
    } elseif ($case === 'ip_thirty') {
        for ($i = 0; $i < 30; $i++) login_limit_failed($pdo, 'user-' . $i);
        login_limit_check($pdo, 'new-user');
    } elseif ($case === 'success_reset') {
        for ($i = 0; $i < 4; $i++) login_limit_failed($pdo, 'alice');
        login_limit_succeeded($pdo, 'alice');
        [$ipHash, $identifierHash] = login_limit_keys('alice');
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM login_attempts WHERE ip_hash = ? AND identifier_hash = ?');
        $stmt->execute([$ipHash, $identifierHash]);
        if ((int)$stmt->fetchColumn() !== 0) exit(1);
        login_limit_check($pdo, 'alice');
    } else {
        exit(2);
    }
    echo 'allowed';
    exit;
}

$expected = ['pair_four' => 'allowed', 'pair_five' => 'AUTH_RATE_LIMITED', 'ip_thirty' => 'AUTH_RATE_LIMITED', 'success_reset' => 'allowed'];
foreach ($expected as $name => $fragment) {
    $process = proc_open([PHP_BINARY, __FILE__, $name], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($process)) throw new RuntimeException('Failed to start database test');
    $output = stream_get_contents($pipes[1]);
    $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $status = proc_close($process);
    if ($status !== 0 || !str_contains($output, $fragment)) {
        throw new RuntimeException("$name failed: $output $error");
    }
}
echo "Rate limit integration passed\n";
