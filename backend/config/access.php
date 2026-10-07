<?php
require_once __DIR__ . '/auth.php';

function access_student_id(PDO $pdo, array $auth): string {
    $stmt = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([(string)($auth['sub'] ?? '')]);
    $id = $stmt->fetchColumn();
    if (!$id) {
        auth_json_error(403, 'Akun mahasiswa tidak memiliki data aktif', 'STUDENT_ACCESS_DENIED');
    }
    return (string)$id;
}

function requireStudentDataRead(PDO $pdo, array $auth): ?string {
    $role = (string)($auth['role'] ?? '');
    if (in_array($role, ['admin', 'developer'], true)) {
        return null;
    }
    if ($role === 'student') {
        return access_student_id($pdo, $auth);
    }
    auth_json_error(403, 'Akses data mahasiswa ditolak', 'STUDENT_READ_DENIED');
}

function requireStudentWriteAccess(PDO $pdo, array $auth, string $studentId): void {
    $role = (string)($auth['role'] ?? '');
    if (in_array($role, ['admin', 'developer'], true)) {
        return;
    }
    if ($role === 'student' && $studentId !== '' && hash_equals(access_student_id($pdo, $auth), $studentId)) {
        return;
    }
    auth_json_error(403, 'Akses perubahan data mahasiswa ditolak', 'STUDENT_WRITE_DENIED');
}

function requireAdminModuleEdit(PDO $pdo, array $auth, string $module): void {
    if (($auth['role'] ?? null) !== 'admin') {
        auth_json_error(403, 'Akses admin diperlukan', 'ADMIN_MODULE_DENIED');
    }
    $column = $module === 'dosen' ? 'can_edit_dosen' : ($module === 'mahasiswa' ? 'can_edit_mahasiswa' : null);
    if ($column === null) {
        throw new InvalidArgumentException('Modul tidak dikenal');
    }
    $stmt = $pdo->prepare("SELECT $column FROM admins WHERE id = ? LIMIT 1");
    $stmt->execute([(string)($auth['sub'] ?? '')]);
    if ((int)$stmt->fetchColumn() !== 1) {
        auth_json_error(403, 'Izin edit modul ditolak', 'ADMIN_MODULE_EDIT_DENIED');
    }
}
