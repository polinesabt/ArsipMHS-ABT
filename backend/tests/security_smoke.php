<?php
declare(strict_types=1);

putenv('APP_ENV=development');
putenv('JWT_SECRET=local-test-secret-0123456789-abcdefghijk');
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/access.php';
require_once __DIR__ . '/../config/login_rate_limit.php';
require_once __DIR__ . '/../config/api_errors.php';

function check(bool $condition, string $description): void {
    if (!$condition) {
        throw new RuntimeException($description);
    }
}

$claims = ['sub' => 'user-1', 'username' => 'test', 'role' => 'student'];
$access = auth_generate_token($claims);
$refresh = auth_generate_token($claims, JWT_REFRESH_EXPIRATION, 'refresh');
check((auth_verify_token($access)['typ'] ?? null) === 'access', 'Access token must verify');
check(auth_verify_token($refresh) === null, 'Refresh token must not authorize API access');
check((auth_verify_token_detailed($refresh)['payload']['typ'] ?? null) === 'refresh', 'Refresh token must have refresh type');

$parts = explode('.', $access);
$legacyPayload = json_decode(auth_base64url_decode($parts[1]), true);
unset($legacyPayload['typ']);
$parts[1] = auth_base64url_encode(json_encode($legacyPayload));
$parts[2] = auth_base64url_encode(hash_hmac('sha256', $parts[0] . '.' . $parts[1], JWT_SECRET, true));
check(auth_verify_token(implode('.', $parts)) === null, 'Legacy token must be rejected');

$expiredParts = explode('.', $access);
$expiredPayload = json_decode(auth_base64url_decode($expiredParts[1]), true);
$expiredPayload['session_exp'] = time() - 1;
$expiredPayload['exp'] = $expiredPayload['session_exp'];
$expiredParts[1] = auth_base64url_encode(json_encode($expiredPayload));
$expiredParts[2] = auth_base64url_encode(hash_hmac('sha256', $expiredParts[0] . '.' . $expiredParts[1], JWT_SECRET, true));
check((auth_verify_token_detailed(implode('.', $expiredParts))['reason'] ?? null) === 'expired', 'Expired session must be rejected');

$demo = auth_generate_token(['sub' => 'demo-1', 'username' => 'demo', 'role' => 'demo']);
check(auth_verify_token($demo) === null, 'Demo token must be rejected');

$pdo = new PDO('sqlite::memory:');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->exec('CREATE TABLE students (id TEXT, user_id TEXT, deleted_at TEXT)');
$pdo->exec("INSERT INTO students (id, user_id) VALUES ('student-1', 'user-1'), ('student-2', 'user-2')");
$pdo->exec('CREATE TABLE admins (id TEXT, can_edit_dosen INTEGER, can_edit_mahasiswa INTEGER)');
$pdo->exec("INSERT INTO admins VALUES ('admin-1', 1, 0)");
$pdo->exec('CREATE TABLE users (id TEXT, role TEXT, is_active INTEGER)');
$pdo->exec("INSERT INTO users VALUES ('user-1', 'student', 1), ('disabled', 'student', 0)");
check(requireStudentDataRead($pdo, $claims) === 'student-1', 'Student must resolve only own record');
requireStudentWriteAccess($pdo, $claims, 'student-1');
check(requireStudentDataRead($pdo, ['sub' => 'admin-1', 'role' => 'admin']) === null, 'Admin can read all records');
check(auth_refresh_account_active($pdo, auth_verify_token_detailed($refresh)['payload']), 'Active account can refresh');
check(!auth_refresh_account_active($pdo, ['typ' => 'refresh', 'sub' => 'disabled', 'role' => 'student']), 'Inactive account cannot refresh');
check(!auth_refresh_account_active($pdo, ['typ' => 'refresh', 'sub' => 'user-1', 'role' => 'admin']), 'Changed role cannot refresh');

$_SERVER['REMOTE_ADDR'] = '127.0.0.1';
$_SERVER['HTTP_X_FORWARDED_FOR'] = '8.8.8.8';
check(getClientIP() === '127.0.0.1', 'Forwarded IP must be ignored');
check(api_exception_status(new InvalidArgumentException('Payload tidak valid')) === 400, 'Validation status must be 400');
check(api_exception_status(new PDOException('private SQL detail')) === 500, 'Database status must be 500');

echo "Security smoke checks passed\n";
