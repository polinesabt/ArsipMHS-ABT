<?php
require_once __DIR__ . '/../../config/cors.php';



require_once __DIR__ . '/../../config/database.php';

try {
    $category = $_GET['category'] ?? null;
    $student_id = $_GET['student_id'] ?? null;
    $id = $_GET['id'] ?? null;
    
    $query = '
        SELECT a.*, s.nim, s.nama 
        FROM achievements a 
        JOIN students s ON s.id COLLATE utf8mb4_unicode_ci = a.student_id
    ';
    $conditions = [];
    $params = [];
    
    if ($category) {
        $conditions[] = 'a.category = ?';
        $params[] = $category;
    }
    if ($student_id) {
        $conditions[] = 'a.student_id = ?';
        $params[] = $student_id;
    }
    if ($id) {
        $conditions[] = 'a.id = ?';
        $params[] = $id;
    }
    
    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }
    
    $query .= ' ORDER BY a.tanggal DESC';
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $achievements,
        'count' => count($achievements)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
