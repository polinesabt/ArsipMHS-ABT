<?php
require_once __DIR__ . '/../../config/cors.php';

require_once __DIR__ . '/../../config/database.php';

try {
    $id = $_GET['id'] ?? null;
    $nim = $_GET['nim'] ?? null;
    $status = $_GET['status'] ?? null;

    $query = 'SELECT * FROM students';
    $conditions = [];
    $params = [];

    if ($id) {
        $conditions[] = 'id = ?';
        $params[] = $id;
    }
    if ($nim) {
        $conditions[] = 'nim = ?';
        $params[] = $nim;
    }
    if ($status) {
        $conditions[] = 'status = ?';
        $params[] = $status;
    }

    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $query .= ' ORDER BY updated_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $students,
        'count' => count($students)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
