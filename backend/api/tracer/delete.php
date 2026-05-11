<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../students/status_effective_sql.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }

    $tracerId = $input['id'];
    $statusEffectiveExpr = student_status_effective_expr('s');
    $checkStmt = $pdo->prepare('
        SELECT t.id, s.status AS student_status, (' . $statusEffectiveExpr . ') AS status_effective
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id
        WHERE t.id = ? AND s.deleted_at IS NULL
        LIMIT 1
    ');
    $checkStmt->execute([$tracerId]);
    $checkRow = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if ($checkRow && ($checkRow['status_effective'] ?? '') !== 'alumni') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Mahasiswa belum berstatus Alumni. Akses ditolak.',
        ]);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM tracer_study WHERE id = ?');
    $result = $stmt->execute([$tracerId]);
    
    if ($result && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Tracer study berhasil dihapus'
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Tracer study tidak ditemukan'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
