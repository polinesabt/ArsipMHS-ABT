<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $status = $_GET['status'] ?? null;

    $query = '
        SELECT
            e.*,
            COUNT(DISTINCT i.id) AS total_targets,
            COUNT(DISTINCT CASE WHEN i.first_sent_at IS NOT NULL THEN i.id END) AS total_sent,
            COUNT(DISTINCT CASE WHEN i.submitted_at IS NOT NULL THEN i.id END) AS total_submitted
        FROM evaluations e
        LEFT JOIN evaluation_invitations i ON i.evaluation_id = e.id
    ';

    $conditions = [];
    $params = [];

    if ($status && in_array($status, ['active', 'closed'], true)) {
        $conditions[] = 'e.status = ?';
        $params[] = $status;
    }

    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }

    $query .= ' GROUP BY e.id ORDER BY e.created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $data = array_map(function ($row) {
        $targets = (int)($row['total_targets'] ?? 0);
        $submitted = (int)($row['total_submitted'] ?? 0);
        $responseRate = $targets > 0 ? round(($submitted / $targets) * 100, 2) : 0;

        $row['total_targets'] = $targets;
        $row['total_sent'] = (int)($row['total_sent'] ?? 0);
        $row['total_submitted'] = $submitted;
        $row['response_rate'] = $responseRate;

        return $row;
    }, $rows);

    echo json_encode([
        'success' => true,
        'data' => $data,
        'count' => count($data),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
