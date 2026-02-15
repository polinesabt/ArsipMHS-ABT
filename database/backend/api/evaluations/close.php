<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || empty($input['id'])) {
        throw new Exception('ID evaluasi diperlukan');
    }

    $id = trim((string)$input['id']);

    $check = $pdo->prepare('SELECT id, status FROM evaluations WHERE id = ? LIMIT 1');
    $check->execute([$id]);
    $evaluation = $check->fetch(PDO::FETCH_ASSOC);

    if (!$evaluation) {
        throw new Exception('Evaluasi tidak ditemukan');
    }

    if ($evaluation['status'] === 'closed') {
        echo json_encode([
            'success' => true,
            'message' => 'Evaluasi sudah berstatus selesai',
        ]);
        exit();
    }

    $stmt = $pdo->prepare('
        UPDATE evaluations
        SET status = ?, closed_by = ?, closed_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ');
    $stmt->execute(['closed', $auth['sub'] ?? null, $id]);

    echo json_encode([
        'success' => true,
        'message' => 'Evaluasi berhasil ditutup',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
