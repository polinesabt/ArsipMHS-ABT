<?php
/**
 * Daftar lampiran untuk satu achievement.
 * GET ?achievement_id=...
 * Auth: admin or student owner.
 */
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../store_helper.php';

header('Content-Type: application/json');

try {
    $auth = requireAuth(null);
    $achievementId = isset($_GET['achievement_id']) ? trim((string)$_GET['achievement_id']) : '';
    if ($achievementId === '') {
        throw new Exception('achievement_id wajib diisi.');
    }

    $found = achievement_store_find_record($pdo, $achievementId);
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Achievement tidak ditemukan.']);
        exit;
    }

    $row = $found['row'];
    $config = $found['config'];

    $ownerStmt = $pdo->prepare('SELECT id FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $ownerStmt->execute([(string)($row['id_mahasiswa'] ?? '')]);
    if (!$ownerStmt->fetch()) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Achievement tidak ditemukan.']);
        exit;
    }

    $role = $auth['role'] ?? '';
    if ($role === 'student') {
        $stmtU = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND id = ? AND deleted_at IS NULL');
        $stmtU->execute([$auth['sub'] ?? '', $row['id_mahasiswa']]);
        if (!$stmtU->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false, 'error' => 'Akses ditolak.']);
            exit;
        }
    }

    $fk = $config['attachment_fk'];
    $table = $config['attachment_table'];
    $sqlWithDeleted = sprintf(
        'SELECT id, %s AS achievement_id, file_name, file_type, file_size, file_path, uploaded_at FROM %s WHERE %s = ? AND deleted_at IS NULL ORDER BY uploaded_at ASC',
        $fk,
        $table,
        $fk
    );
    $sqlNoDeleted = sprintf(
        'SELECT id, %s AS achievement_id, file_name, file_type, file_size, file_path, uploaded_at FROM %s WHERE %s = ? ORDER BY uploaded_at ASC',
        $fk,
        $table,
        $fk
    );
    try {
        $stmt = $pdo->prepare($sqlWithDeleted);
        $stmt->execute([$achievementId]);
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        $stmt = $pdo->prepare($sqlNoDeleted);
        $stmt->execute([$achievementId]);
        $list = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    echo json_encode([
        'success' => true,
        'achievement_id' => $achievementId,
        'attachments' => $list,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
