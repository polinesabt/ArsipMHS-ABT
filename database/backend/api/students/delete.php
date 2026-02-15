<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }
    
    $student_id = $input['id'];
    
    $stmt = $pdo->prepare('SELECT id, user_id FROM students WHERE id = ?');
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }
    
    $pdo->beginTransaction();
    
    $stmt = $pdo->prepare('DELETE FROM students WHERE id = ?');
    $stmt->execute([$student_id]);
    
    if (!empty($student['user_id'])) {
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$student['user_id']]);
    }
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Mahasiswa berhasil dihapus'
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
