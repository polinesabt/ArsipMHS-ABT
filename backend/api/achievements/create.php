<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/security.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (
        !$input ||
        !isset($input['student_id']) ||
        !isset($input['title']) ||
        !isset($input['category']) ||
        !isset($input['subcategory'])
    ) {
        throw new Exception('student_id, title, category, dan subcategory diperlukan');
    }
    
    // Sanitize input
    $student_id = sanitizeInput($input['student_id'], 'string');
    $title = sanitizeInput($input['title'], 'string');
    $category = sanitizeInput($input['category'], 'string');
    $subcategory = sanitizeInput($input['subcategory'], 'string');
    
    // Basic validation
    if (empty($title) || empty($category) || empty($subcategory)) {
        throw new Exception('Title, category, dan subcategory tidak boleh kosong');
    }
    
    $id = bin2hex(random_bytes(18));
    
    $stmt = $pdo->prepare('
        INSERT INTO achievements (
            id, student_id, category, subcategory, title, description, tanggal,
            lokasi, penyelenggara, tingkat, peringkat, verified, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )
    ');
    
    $stmt->execute([
        $id,
        $student_id,
        $category,
        $subcategory,
        $title,
        isset($input['description']) ? sanitizeInput($input['description'], 'string') : null,
        isset($input['tanggal']) ? sanitizeInput($input['tanggal'], 'string') : date('Y-m-d'),
        isset($input['lokasi']) ? sanitizeInput($input['lokasi'], 'string') : null,
        isset($input['penyelenggara']) ? sanitizeInput($input['penyelenggara'], 'string') : null,
        isset($input['tingkat']) ? sanitizeInput($input['tingkat'], 'string') : null,
        isset($input['peringkat']) ? sanitizeInput($input['peringkat'], 'string') : null,
        isset($input['verified']) ? (bool)$input['verified'] : false
    ]);
    
    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Achievement berhasil ditambahkan'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
