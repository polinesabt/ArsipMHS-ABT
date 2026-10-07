<?php
/**
 * Serve achievement attachment file (untuk Gallery/PDF viewer).
 * GET ?id=attachment_id
 * Auth: admin or student owner of the achievement.
 */
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../../../config/access.php';
require_once __DIR__ . '/../store_helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $auth = requireAuth(null);

    $id = isset($_GET['id']) ? trim((string)$_GET['id']) : '';
    if ($id === '') {
        http_response_code(400);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Parameter id wajib.']);
        exit;
    }

    $foundAttachment = achievement_store_find_attachment($pdo, $id);
    if (!$foundAttachment) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Lampiran tidak ditemukan.']);
        exit;
    }

    $attachment = $foundAttachment['row'];
    if (!empty($attachment['deleted_at'])) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Lampiran tidak ditemukan.']);
        exit;
    }
    $achievementId = (string)($attachment['achievement_id'] ?? '');
    $achievementFound = achievement_store_find_record($pdo, $achievementId);
    if (!$achievementFound) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Achievement lampiran tidak ditemukan.']);
        exit;
    }

    $achievementRow = $achievementFound['row'];
    requireStudentWriteAccess($pdo, $auth, (string)($achievementRow['id_mahasiswa'] ?? ''));

    $ownerStmt = $pdo->prepare('SELECT id FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $ownerStmt->execute([(string)($achievementRow['id_mahasiswa'] ?? '')]);
    if (!$ownerStmt->fetch()) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Lampiran tidak ditemukan.']);
        exit;
    }

    $role = $auth['role'] ?? '';
    if ($role === 'student') {
        $stmtU = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND id = ? AND deleted_at IS NULL');
        $stmtU->execute([$auth['sub'] ?? '', $achievementRow['id_mahasiswa']]);
        if (!$stmtU->fetch()) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Akses ditolak.']);
            exit;
        }
    }

    $basePath = __DIR__ . '/../../../storage/';
    $resolvedBase = realpath($basePath);
    $fullPath = realpath($basePath . $attachment['file_path']);

    if ($resolvedBase === false || $fullPath === false || !str_starts_with($fullPath, $resolvedBase . DIRECTORY_SEPARATOR) || !is_file($fullPath)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'File tidak ditemukan.']);
        exit;
    }

    $mime = (string)($attachment['file_type'] ?? 'application/octet-stream');
    if (!in_array($mime, ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'], true)) {
        $mime = 'application/octet-stream';
    }
    $fileName = preg_replace('/[\x00-\x1f\x7f"\\\\]/', '_', (string)($attachment['file_name'] ?? 'lampiran'));
    $fileSize = (int)($attachment['file_size'] ?? filesize($fullPath));

    header('Content-Type: ' . $mime);
    header('X-Content-Type-Options: nosniff');
    header('Content-Length: ' . $fileSize);
    header('Content-Disposition: inline; filename="' . $fileName . '"');
    readfile($fullPath);
    exit;
} catch (Exception $e) {
    http_response_code(api_exception_status($e));
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => api_public_error($e)]);
}
