<?php
/**
 * Upload lampiran form kepuasan (form bertanda tangan) - PDF atau PNG.
 * POST multipart/form-data: token, file
 * Tidak perlu auth: token survey cukup untuk validasi.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIMES = ['application/pdf', 'image/png'];

try {
    $token = isset($_POST['token']) ? trim((string)$_POST['token']) : '';
    if ($token === '') {
        throw new Exception('Token survey diperlukan.');
    }

    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $err = $_FILES['file']['error'] ?? -1;
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            throw new Exception('Ukuran file terlalu besar.');
        }
        if ($err === UPLOAD_ERR_NO_FILE) {
            throw new Exception('Tidak ada file yang diunggah.');
        }
        throw new Exception('Gagal mengunggah file.');
    }

    $file = $_FILES['file'];
    $size = (int)$file['size'];
    if ($size <= 0 || $size > MAX_FILE_SIZE) {
        throw new Exception('Ukuran file tidak valid atau melebihi batas 5MB.');
    }

    $mime = @mime_content_type($file['tmp_name']) ?: $file['type'];
    if (!in_array($mime, ALLOWED_MIMES, true)) {
        throw new Exception('Tipe file tidak diizinkan. Gunakan PDF atau PNG.');
    }

    $ext = $mime === 'application/pdf' ? 'pdf' : 'png';

    $invitationStmt = $pdo->prepare('
        SELECT i.id, i.submitted_at, e.status AS evaluation_status
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        WHERE i.access_token = ?
        LIMIT 1
    ');
    $invitationStmt->execute([$token]);
    $invitation = $invitationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitation) {
        throw new Exception('Link survey tidak valid.');
    }
    if (($invitation['evaluation_status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi sudah ditutup.');
    }
    if (!empty($invitation['submitted_at'])) {
        throw new Exception('Survey sudah dikirim; lampiran tidak dapat diubah.');
    }

    $invitationId = $invitation['id'];
    $baseDir = __DIR__ . '/../../storage/satisfaction_attachments/' . $invitationId;
    if (!is_dir($baseDir)) {
        if (!@mkdir($baseDir, 0755, true)) {
            throw new Exception('Gagal membuat folder penyimpanan.');
        }
    }

    $uniqueId = bin2hex(random_bytes(8));
    $storedName = $uniqueId . '.' . $ext;
    $fullPath = $baseDir . '/' . $storedName;

    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        throw new Exception('Gagal menyimpan file.');
    }

    $relativePath = 'satisfaction_attachments/' . $invitationId . '/' . $storedName;
    $originalName = $file['name'];
    if (strlen($originalName) > 200) {
        $originalName = substr($originalName, -200);
    }

    echo json_encode([
        'success' => true,
        'path' => $relativePath,
        'file_name' => $originalName,
        'file_type' => $mime,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
