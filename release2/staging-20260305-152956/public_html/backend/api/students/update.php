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
    
    $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }
    
    $fields = [];
    $params = [];
    
    $allowedFields = [
        'nim' => 'nim',
        'nama' => 'nama',
        'jurusan' => 'jurusan',
        'prodi' => 'prodi',
        'status' => 'status',
        'tahun_masuk' => 'tahun_masuk',
        'tahun_lulus' => 'tahun_lulus',
        'email' => 'email',
        'no_hp' => 'no_hp',
        'alamat' => 'alamat'
    ];
    
    foreach ($allowedFields as $inputKey => $dbField) {
        if (array_key_exists($inputKey, $input)) {
            $fields[] = "$dbField = ?";
            $params[] = $input[$inputKey];
        }
    }
    
    if (empty($fields)) {
        throw new Exception('Tidak ada data untuk diperbarui');
    }
    
    $pdo->beginTransaction();
    
    $params[] = $student_id;
    $query = 'UPDATE students SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    // If NIM updated, sync with users.username
    if (array_key_exists('nim', $input) && $student['user_id']) {
        $stmt = $pdo->prepare('UPDATE users SET username = ? WHERE id = ?');
        $stmt->execute([$input['nim'], $student['user_id']]);
    }
    
    $pdo->commit();
    
    $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$student_id]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $updated,
        'message' => 'Mahasiswa berhasil diperbarui'
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
