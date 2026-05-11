<?php
require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';

header('Content-Type: application/json');

try {
    requireAuth('admin');

    $logId = isset($_GET['log_id']) ? trim((string)$_GET['log_id']) : '';
    $limit = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 50;
    $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

    if ($logId !== '') {
        $logStmt = $pdo->prepare('SELECT * FROM prestasi_import_logs WHERE id = ? LIMIT 1');
        $logStmt->execute([$logId]);
        $log = $logStmt->fetch(PDO::FETCH_ASSOC);
        if (!$log) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Log import tidak ditemukan.']);
            exit;
        }

        $detailStmt = $pdo->prepare('SELECT id, `row_number`, nim_raw, status, message, raw_payload_json, created_at FROM prestasi_import_log_details WHERE import_log_id = ? ORDER BY `row_number` ASC');
        $detailStmt->execute([$logId]);
        $details = $detailStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'log' => $log,
                'details' => $details,
            ],
        ]);
        exit;
    }

    $countStmt = $pdo->query('SELECT COUNT(*) FROM prestasi_import_logs');
    $total = (int)$countStmt->fetchColumn();

    $stmt = $pdo->prepare('SELECT * FROM prestasi_import_logs ORDER BY created_at DESC LIMIT ? OFFSET ?');
    $stmt->bindValue(1, $limit, PDO::PARAM_INT);
    $stmt->bindValue(2, $offset, PDO::PARAM_INT);
    $stmt->execute();

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'logs' => $rows,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
