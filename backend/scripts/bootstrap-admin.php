<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$username = trim((string)(getenv('ADMIN_BOOTSTRAP_USERNAME') ?: 'AdminABT'));
$password = (string)(getenv('ADMIN_BOOTSTRAP_PASSWORD') ?: '');
if ($username === '' || strlen($password) < 16) {
    fwrite(STDERR, "Set ADMIN_BOOTSTRAP_PASSWORD minimal 16 karakter dan username yang valid.\n");
    exit(1);
}

$pdo->beginTransaction();
try {
    $stmt = $pdo->prepare('SELECT id, role FROM users WHERE username = ? FOR UPDATE');
    $stmt->execute([$username]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($existing && $existing['role'] !== 'admin') {
        throw new RuntimeException('Username sudah dipakai role lain');
    }
    $id = $existing['id'] ?? bin2hex(random_bytes(18));
    $hash = password_hash($password, PASSWORD_BCRYPT);
    if ($existing) {
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, is_active = 1 WHERE id = ? AND role = ?');
        $stmt->execute([$hash, $id, 'admin']);
    } else {
        $stmt = $pdo->prepare('INSERT INTO users (id, username, password_hash, nama, role, is_active) VALUES (?, ?, ?, ?, ?, 1)');
        $stmt->execute([$id, $username, $hash, 'Administrator Arsip ABT', 'admin']);
    }
    $stmt = $pdo->prepare('INSERT IGNORE INTO admins (id, created_at) VALUES (?, NOW())');
    $stmt->execute([$id]);
    $pdo->commit();
    fwrite(STDOUT, "Akun admin siap.\n");
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Admin bootstrap failed: ' . $error->getMessage());
    fwrite(STDERR, "Gagal menyiapkan akun admin.\n");
    exit(1);
}
