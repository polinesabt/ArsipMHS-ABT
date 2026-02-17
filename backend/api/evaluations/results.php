<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $evaluationId = isset($_GET['evaluation_id']) ? trim((string)$_GET['evaluation_id']) : null;
    $responseId = isset($_GET['response_id']) ? trim((string)$_GET['response_id']) : null;

    if ($responseId) {
        $detailStmt = $pdo->prepare('
            SELECT
                r.*,
                e.title AS evaluation_title,
                e.status AS evaluation_status,
                s.nim,
                s.nama,
                s.tahun_lulus,
                s.prodi,
                i.send_count,
                i.first_sent_at,
                i.last_sent_at
            FROM evaluation_responses r
            JOIN evaluations e ON e.id COLLATE utf8mb4_unicode_ci = r.evaluation_id COLLATE utf8mb4_unicode_ci
            JOIN students s ON s.id COLLATE utf8mb4_unicode_ci = r.student_id COLLATE utf8mb4_unicode_ci
            JOIN evaluation_invitations i ON i.id COLLATE utf8mb4_unicode_ci = r.invitation_id COLLATE utf8mb4_unicode_ci
            WHERE r.id = ?
            LIMIT 1
        ');
        $detailStmt->execute([$responseId]);
        $header = $detailStmt->fetch(PDO::FETCH_ASSOC);

        if (!$header) {
            throw new Exception('Hasil evaluasi tidak ditemukan');
        }

        $ratingsStmt = $pdo->prepare('
            SELECT
                rr.aspect_id,
                rr.score,
                a.code AS aspect_code,
                a.name AS aspect_name,
                a.sort_order
            FROM evaluation_response_ratings rr
            JOIN evaluation_aspects a ON a.id COLLATE utf8mb4_unicode_ci = rr.aspect_id COLLATE utf8mb4_unicode_ci
            WHERE rr.response_id = ?
            ORDER BY a.sort_order ASC
        ');
        $ratingsStmt->execute([$responseId]);
        $ratings = $ratingsStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'header' => $header,
                'ratings' => array_map(function ($row) {
                    return [
                        'aspect_id' => $row['aspect_id'],
                        'aspect_code' => $row['aspect_code'],
                        'aspect_name' => $row['aspect_name'],
                        'sort_order' => (int)$row['sort_order'],
                        'score' => (int)$row['score'],
                    ];
                }, $ratings),
            ],
        ]);
        exit();
    }

    $query = '
        SELECT
            r.id AS response_id,
            r.evaluation_id,
            e.title AS evaluation_title,
            r.student_id,
            s.nim,
            s.nama,
            r.company_name,
            r.employee_name,
            r.major_job_match,
            r.submitted_at
        FROM evaluation_responses r
        JOIN evaluations e ON e.id COLLATE utf8mb4_unicode_ci = r.evaluation_id COLLATE utf8mb4_unicode_ci
        JOIN students s ON s.id COLLATE utf8mb4_unicode_ci = r.student_id COLLATE utf8mb4_unicode_ci
    ';

    $params = [];
    if ($evaluationId) {
        $query .= ' WHERE r.evaluation_id = ? ';
        $params[] = $evaluationId;
    }

    $query .= ' ORDER BY r.submitted_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $rows,
        'count' => count($rows),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
