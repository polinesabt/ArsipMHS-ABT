<?php
declare(strict_types=1);

putenv('APP_ENV=development');
putenv('JWT_SECRET=local-test-secret-0123456789-abcdefghijk');
require_once __DIR__ . '/../config/access.php';

function fixture(): PDO {
    $pdo = new PDO('sqlite::memory:');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE TABLE students (id TEXT, user_id TEXT, deleted_at TEXT)');
    $pdo->exec("INSERT INTO students VALUES ('s1', 'u1', NULL), ('s2', 'u2', NULL), ('s3', 'u3', '2026-01-01')");
    $pdo->exec('CREATE TABLE admins (id TEXT, can_edit_dosen INTEGER, can_edit_mahasiswa INTEGER)');
    $pdo->exec("INSERT INTO admins VALUES ('admin-1', 1, 0)");
    return $pdo;
}

$cases = [
    'admin_read' => ['allowed', static fn(PDO $db) => requireStudentDataRead($db, ['sub' => 'admin-1', 'role' => 'admin'])],
    'developer_read' => ['allowed', static fn(PDO $db) => requireStudentDataRead($db, ['sub' => 'dev-1', 'role' => 'developer'])],
    'student_read' => ['allowed', static fn(PDO $db) => requireStudentDataRead($db, ['sub' => 'u1', 'role' => 'student'])],
    'student_own_write' => ['allowed', static fn(PDO $db) => requireStudentWriteAccess($db, ['sub' => 'u1', 'role' => 'student'], 's1')],
    'student_other_write' => ['STUDENT_WRITE_DENIED', static fn(PDO $db) => requireStudentWriteAccess($db, ['sub' => 'u1', 'role' => 'student'], 's2')],
    'student_deleted_read' => ['STUDENT_ACCESS_DENIED', static fn(PDO $db) => requireStudentDataRead($db, ['sub' => 'u3', 'role' => 'student'])],
    'dosen_read' => ['STUDENT_READ_DENIED', static fn(PDO $db) => requireStudentDataRead($db, ['sub' => 'd1', 'role' => 'dosen'])],
    'admin_edit_denied' => ['ADMIN_MODULE_EDIT_DENIED', static fn(PDO $db) => requireAdminModuleEdit($db, ['sub' => 'admin-1', 'role' => 'admin'], 'mahasiswa')],
    'admin_edit_allowed' => ['allowed', static fn(PDO $db) => requireAdminModuleEdit($db, ['sub' => 'admin-1', 'role' => 'admin'], 'dosen')],
];

if (isset($argv[1])) {
    if (!isset($cases[$argv[1]])) {
        exit(2);
    }
    $cases[$argv[1]][1](fixture());
    echo 'allowed';
    exit;
}

foreach ($cases as $name => [$expected]) {
    $process = proc_open([PHP_BINARY, __FILE__, $name], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    if (!is_resource($process)) {
        throw new RuntimeException('Failed to start test process');
    }
    $output = stream_get_contents($pipes[1]);
    $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]);
    fclose($pipes[2]);
    $status = proc_close($process);
    if ($status !== 0 || !str_contains($output, $expected)) {
        throw new RuntimeException("$name failed: $output $error");
    }
}

echo "Access matrix passed\n";
