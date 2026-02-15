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
    
    $achievement_id = $input['id'];
    $fields = [];
    $params = [];
    
    $allowedFields = [
        'student_id' => 'student_id',
        'category' => 'category',
        'subcategory' => 'subcategory',
        'title' => 'title',
        'description' => 'description',
        'tanggal' => 'tanggal',
        'lokasi' => 'lokasi',
        'penyelenggara' => 'penyelenggara',
        'tingkat' => 'tingkat',
        'peringkat' => 'peringkat',
        'verified' => 'verified',
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
    
    $params[] = $achievement_id;
    $query = 'UPDATE achievements SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ?';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $stmt = $pdo->prepare('SELECT * FROM achievements WHERE id = ?');
    $stmt->execute([$achievement_id]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $updated,
        'message' => 'Achievement berhasil diperbarui'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
