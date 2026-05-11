<?php
/**
 * Upload sertifikat/dokumen untuk achievement.
 * POST multipart/form-data: achievement_id, file
 * Auth: admin only (untuk Advanced Settings); atau student pemilik achievement.
 */
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../store_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

try {
    $auth = requireAuth(null);
    $userId = $auth['sub'] ?? '';
    $role = $auth['role'] ?? '';

    $achievementId = isset($_POST['achievement_id']) ? trim((string)$_POST['achievement_id']) : '';
    if ($achievementId === '') {
        throw new Exception('achievement_id wajib diisi.');
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $err = $_FILES['file']['error'] ?? -1;
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) throw new Exception('Ukuran file terlalu besar.');
        if ($err === UPLOAD_ERR_NO_FILE) throw new Exception('Tidak ada file yang diunggah.');
        throw new Exception('Gagal mengunggah file.');
    }

    $file = $_FILES['file'];
    $size = (int)$file['size'];
    if ($size <= 0 || $size > MAX_FILE_SIZE) {
        throw new Exception('Ukuran file tidak valid atau melebihi batas 2MB.');
    }

    $mime = mime_content_type($file['tmp_name']) ?: $file['type'];
    if (!in_array($mime, ALLOWED_TYPES, true)) {
        throw new Exception('Tipe file tidak diizinkan. Gunakan gambar (JPEG, PNG, GIF, WebP) atau PDF.');
    }

    $found = achievement_store_find_record($pdo, $achievementId);
    if (!$found) {
        throw new Exception('Achievement tidak ditemukan.');
    }

    $row = $found['row'];
    $config = $found['config'];

    $ownerStmt = $pdo->prepare('SELECT id FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $ownerStmt->execute([(string)($row['id_mahasiswa'] ?? '')]);
    if (!$ownerStmt->fetch()) {
        throw new Exception('Achievement tidak ditemukan.');
    }

    if ($role === 'student') {
        $stmtUser = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND id = ? AND deleted_at IS NULL');
        $stmtUser->execute([$userId, $row['id_mahasiswa']]);
        if (!$stmtUser->fetch()) {
            http_response_code(403);
            throw new Exception('Anda tidak berhak menambah lampiran untuk achievement ini.');
        }
    }

    $originalName = $file['name'];
    $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $originalName);
    $safeName = substr((string)$safeName, 0, 200);
    $attachmentId = bin2hex(random_bytes(18));

    $baseDir = __DIR__ . '/../../../storage/achievements/' . $achievementId;
    if (!is_dir($baseDir)) {
        if (!mkdir($baseDir, 0755, true)) {
            throw new Exception('Gagal membuat folder penyimpanan.');
        }
    }

    $storedName = $attachmentId . '_' . $safeName;
    $fullPath = $baseDir . '/' . $storedName;

    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        throw new Exception('Gagal menyimpan file.');
    }

    $relativePath = 'achievements/' . $achievementId . '/' . $storedName;

    $sql = sprintf(
        'INSERT INTO %s (id, %s, file_name, file_type, file_size, file_path, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        $config['attachment_table'],
        $config['attachment_fk']
    );
    $ins = $pdo->prepare($sql);
    $ins->execute([$attachmentId, $achievementId, $originalName, $mime, $size, $relativePath]);

    echo json_encode([
        'success' => true,
        'id' => $attachmentId,
        'achievement_id' => $achievementId,
        'file_name' => $originalName,
        'file_type' => $mime,
        'file_size' => $size,
        'file_path' => $relativePath,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
