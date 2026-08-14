<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $payload = requireAuth('developer');

    // Ensure system_error_logs table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_error_logs (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NULL,
          username VARCHAR(100) NULL,
          role ENUM('student', 'admin', 'developer', 'guest') NOT NULL DEFAULT 'guest',
          feature_name VARCHAR(100) NOT NULL,
          error_message TEXT NOT NULL,
          stack_trace TEXT NULL,
          url TEXT NULL,
          user_agent TEXT NULL,
          ip_address VARCHAR(45) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_error_logs_created_at (created_at),
          INDEX idx_error_logs_role (role),
          INDEX idx_error_logs_feature (feature_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $roleFilter = isset($_GET['role']) ? trim((string)$_GET['role']) : '';
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;
    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

    $whereClauses = [];
    $params = [];

    if ($roleFilter !== '' && in_array($roleFilter, ['student', 'admin', 'developer', 'guest'], true)) {
        $whereClauses[] = 'role = ?';
        $params[] = $roleFilter;
    }

    if ($search !== '') {
        $whereClauses[] = '(feature_name LIKE ? OR error_message LIKE ? OR username LIKE ? OR url LIKE ?)';
        $searchTerm = '%' . $search . '%';
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }

    $whereSql = count($whereClauses) > 0 ? 'WHERE ' . implode(' AND ', $whereClauses) : '';

    // Fetch Stats
    $totalCount = (int)$pdo->query("SELECT COUNT(*) FROM system_error_logs")->fetchColumn();
    $adminCount = (int)$pdo->query("SELECT COUNT(*) FROM system_error_logs WHERE role = 'admin'")->fetchColumn();
    $studentCount = (int)$pdo->query("SELECT COUNT(*) FROM system_error_logs WHERE role = 'student'")->fetchColumn();
    $todayCount = (int)$pdo->query("SELECT COUNT(*) FROM system_error_logs WHERE DATE(created_at) = CURDATE()")->fetchColumn();

    // Fetch filtered logs
    $sql = "SELECT id, user_id, username, role, feature_name, error_message, stack_trace, url, user_agent, ip_address, created_at
            FROM system_error_logs
            {$whereSql}
            ORDER BY created_at DESC
            LIMIT {$limit} OFFSET {$offset}";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'stats' => [
            'total' => $totalCount,
            'admin' => $adminCount,
            'student' => $studentCount,
            'today' => $todayCount,
        ],
        'data' => $logs,
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch error logs: ' . $e->getMessage(),
    ]);
}
