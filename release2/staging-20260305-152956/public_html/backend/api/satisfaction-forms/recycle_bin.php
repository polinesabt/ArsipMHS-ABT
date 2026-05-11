<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $offset = ($page - 1) * $perPage;

    $where = 'deleted_at IS NOT NULL';
    $params = [];
    if ($search !== '') {
        $where .= ' AND title LIKE ?';
        $params[] = '%' . $search . '%';
    }

    $countSql = "SELECT COUNT(*) FROM satisfaction_form_templates WHERE $where";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare("
        SELECT id, title, is_default, deleted_at, deleted_by, created_at, updated_at
        FROM satisfaction_form_templates
        WHERE $where
        ORDER BY deleted_at DESC
        LIMIT " . (int)$offset . ", " . (int)$perPage
    );
    $stmt->execute($params);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($records as &$r) {
        $r['is_default'] = (bool)$r['is_default'];
    }
    unset($r);

    echo json_encode([
        'success' => true,
        'data' => [
            'records' => $records,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
