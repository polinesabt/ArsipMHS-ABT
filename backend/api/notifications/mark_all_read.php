<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('student');

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE user_id = ? LIMIT 1');
    $studentStmt->execute([$auth['sub'] ?? '']);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan untuk sesi login ini');
    }

    $updateStmt = $pdo->prepare('
        UPDATE student_notifications
        SET is_read = 1, read_at = NOW()
        WHERE student_id = ? AND is_read = 0
    ');
    $updateStmt->execute([$student['id']]);

    echo json_encode([
        'success' => true,
        'data' => [
            'updated' => $updateStmt->rowCount(),
        ],
        'message' => 'Semua notifikasi ditandai sudah dibaca',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
