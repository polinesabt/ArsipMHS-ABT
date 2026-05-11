<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed',
    ]);
    exit();
}

try {
    requireAuth('admin');

    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $offset = ($page - 1) * $perPage;

    $where = 'WHERE s.deleted_at IS NOT NULL';
    $params = [];

    if ($search !== '') {
        $where .= ' AND (s.nama LIKE ? OR s.nim LIKE ?)';
        $term = '%' . $search . '%';
        $params[] = $term;
        $params[] = $term;
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM students s {$where}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $sql = "
        SELECT
            s.id,
            s.nim,
            s.nama,
            s.jurusan,
            s.prodi,
            s.status,
            s.tahun_masuk,
            s.tahun_lulus,
            s.email,
            s.no_hp,
            s.user_id,
            s.deleted_at,
            s.deleted_by,
            s.updated_at,
            u.is_active AS user_is_active
        FROM students s
        LEFT JOIN users u ON u.id = s.user_id
        {$where}
        ORDER BY s.deleted_at DESC, s.nama ASC
        LIMIT " . (int)$perPage . " OFFSET " . (int)$offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($rows as &$row) {
        $row['user_is_active'] = isset($row['user_is_active']) ? ((int)$row['user_is_active'] === 1) : false;
    }
    unset($row);

    echo json_encode([
        'success' => true,
        'data' => [
            'records' => $rows,
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
?>
