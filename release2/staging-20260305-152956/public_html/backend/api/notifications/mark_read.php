<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('student');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['notification_id'])) {
        throw new Exception('notification_id diperlukan');
    }

    $notificationId = trim((string)$input['notification_id']);

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $studentStmt->execute([$auth['sub'] ?? '']);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan untuk sesi login ini');
    }

    $updateStmt = $pdo->prepare('
        UPDATE student_notifications
        SET is_read = 1, read_at = NOW()
        WHERE id = ? AND student_id = ?
    ');
    $updateStmt->execute([$notificationId, $student['id']]);

    if ($updateStmt->rowCount() === 0) {
        throw new Exception('Notifikasi tidak ditemukan atau bukan milik pengguna');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Notifikasi ditandai sudah dibaca',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
