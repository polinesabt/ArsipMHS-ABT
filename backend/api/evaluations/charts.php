<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $evaluationId = isset($_GET['evaluation_id']) ? trim((string)$_GET['evaluation_id']) : 'all';
    $isAll = ($evaluationId === '' || strtolower($evaluationId) === 'all');

    $evaluationInfo = null;
    if (!$isAll) {
        $evalStmt = $pdo->prepare('SELECT id, title, status, start_at, end_at FROM evaluations WHERE id = ? LIMIT 1');
        $evalStmt->execute([$evaluationId]);
        $evaluationInfo = $evalStmt->fetch(PDO::FETCH_ASSOC);
        if (!$evaluationInfo) {
            throw new Exception('Evaluasi tidak ditemukan');
        }
    }

    $aspectQuery = '
        SELECT
            a.id,
            a.code,
            a.name,
            a.sort_order,
            SUM(CASE WHEN t.score = 5 THEN 1 ELSE 0 END) AS sangat_baik,
            SUM(CASE WHEN t.score = 4 THEN 1 ELSE 0 END) AS baik,
            SUM(CASE WHEN t.score = 3 THEN 1 ELSE 0 END) AS cukup_baik,
            SUM(CASE WHEN t.score = 2 THEN 1 ELSE 0 END) AS kurang_baik,
            SUM(CASE WHEN t.score = 1 THEN 1 ELSE 0 END) AS tidak_baik,
            COUNT(t.score) AS total
        FROM evaluation_aspects a
        LEFT JOIN (
            SELECT rr.aspect_id, rr.score
            FROM evaluation_response_ratings rr
            JOIN evaluation_responses r ON r.id = rr.response_id
    ';

    $aspectParams = [];
    if (!$isAll) {
        $aspectQuery .= ' WHERE r.evaluation_id = ? ';
        $aspectParams[] = $evaluationId;
    }

    $aspectQuery .= '
        ) t ON t.aspect_id = a.id
        WHERE a.is_active = 1
        GROUP BY a.id, a.code, a.name, a.sort_order
        ORDER BY a.sort_order ASC
    ';

    $aspectStmt = $pdo->prepare($aspectQuery);
    $aspectStmt->execute($aspectParams);
    $aspectRows = $aspectStmt->fetchAll(PDO::FETCH_ASSOC);

    $matchQuery = 'SELECT major_job_match, COUNT(*) AS total FROM evaluation_responses';
    $matchParams = [];

    if (!$isAll) {
        $matchQuery .= ' WHERE evaluation_id = ?';
        $matchParams[] = $evaluationId;
    }

    $matchQuery .= ' GROUP BY major_job_match';

    $matchStmt = $pdo->prepare($matchQuery);
    $matchStmt->execute($matchParams);
    $matchRows = $matchStmt->fetchAll(PDO::FETCH_ASSOC);

    $jobMatch = ['ya' => 0, 'tidak' => 0];
    foreach ($matchRows as $row) {
        $key = $row['major_job_match'] === 'ya' ? 'ya' : 'tidak';
        $jobMatch[$key] = (int)$row['total'];
    }

    $progressQuery = '
        SELECT
            COUNT(*) AS total_targets,
            SUM(CASE WHEN first_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS total_sent,
            SUM(CASE WHEN submitted_at IS NOT NULL THEN 1 ELSE 0 END) AS total_submitted
        FROM evaluation_invitations
    ';
    $progressParams = [];

    if (!$isAll) {
        $progressQuery .= ' WHERE evaluation_id = ?';
        $progressParams[] = $evaluationId;
    }

    $progressStmt = $pdo->prepare($progressQuery);
    $progressStmt->execute($progressParams);
    $progressRow = $progressStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $targets = (int)($progressRow['total_targets'] ?? 0);
    $sent = (int)($progressRow['total_sent'] ?? 0);
    $submitted = (int)($progressRow['total_submitted'] ?? 0);

    echo json_encode([
        'success' => true,
        'data' => [
            'scope' => $isAll ? 'all' : 'single',
            'evaluation' => $evaluationInfo,
            'progress' => [
                'total_targets' => $targets,
                'total_sent' => $sent,
                'total_submitted' => $submitted,
                'response_rate' => $targets > 0 ? round(($submitted / $targets) * 100, 2) : 0,
            ],
            'job_match' => [
                ['label' => 'Ya', 'key' => 'ya', 'value' => $jobMatch['ya']],
                ['label' => 'Tidak', 'key' => 'tidak', 'value' => $jobMatch['tidak']],
            ],
            'aspect_distribution' => array_map(function ($row) {
                return [
                    'aspect_id' => $row['id'],
                    'aspect_code' => $row['code'],
                    'aspect_name' => $row['name'],
                    'sort_order' => (int)$row['sort_order'],
                    'sangat_baik' => (int)$row['sangat_baik'],
                    'baik' => (int)$row['baik'],
                    'cukup_baik' => (int)$row['cukup_baik'],
                    'kurang_baik' => (int)$row['kurang_baik'],
                    'tidak_baik' => (int)$row['tidak_baik'],
                    'total' => (int)$row['total'],
                ];
            }, $aspectRows),
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
