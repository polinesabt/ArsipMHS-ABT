<?php
require_once __DIR__ . '/../../config/cors.php';



require_once __DIR__ . '/../../config/database.php';

try {
    $student_id = $_GET['student_id'] ?? null;
    $id = $_GET['id'] ?? null;
    
    $query = '
        SELECT t.*, s.nim, s.nama 
        FROM tracer_study t 
        JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL
    ';
    $conditions = [];
    $params = [];
    
    if ($student_id) {
        $conditions[] = 't.student_id = ?';
        $params[] = $student_id;
    }
    if ($id) {
        $conditions[] = 't.id = ?';
        $params[] = $id;
    }
    
    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }
    
    $query .= ' ORDER BY t.created_at DESC';
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $tracers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $tracers,
        'count' => count($tracers)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
