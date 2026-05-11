<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['student_id']) || !isset($input['new_password'])) {
        throw new Exception('student_id dan new_password diperlukan');
    }
    
    $student_id = $input['student_id'];
    $new_password = $input['new_password'];
    
    if (strlen($new_password) < 6) {
        throw new Exception('Password minimal 6 karakter');
    }
    
    $stmt = $pdo->prepare('SELECT user_id FROM students WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student || empty($student['user_id'])) {
        throw new Exception('Akun mahasiswa tidak ditemukan');
    }
    
    $password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    $stmt->execute([$password_hash, $student['user_id']]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Password berhasil direset'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
