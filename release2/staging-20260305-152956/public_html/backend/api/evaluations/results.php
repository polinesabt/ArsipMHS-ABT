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
            JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
            JOIN evaluation_invitations i ON i.id = r.invitation_id
            WHERE r.id = ?
            LIMIT 1
        ');
        $detailStmt->execute([$responseId]);
        $header = $detailStmt->fetch(PDO::FETCH_ASSOC);

        if ($header) {
            $ratingsStmt = $pdo->prepare('
                SELECT
                    rr.aspect_id,
                    rr.score,
                    a.code AS aspect_code,
                    a.name AS aspect_name,
                    a.sort_order
                FROM evaluation_response_ratings rr
                JOIN evaluation_aspects a ON a.id = rr.aspect_id
                WHERE rr.response_id = ?
                ORDER BY a.sort_order ASC
            ');
            $ratingsStmt->execute([$responseId]);
            $ratings = $ratingsStmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => [
                    'response_type' => 'legacy',
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

        $customDetailStmt = $pdo->prepare('
            SELECT
                sfr.id,
                sfr.invitation_id,
                sfr.template_id,
                sfr.answers,
                sfr.submitted_at,
                i.evaluation_id,
                i.student_id,
                e.title AS evaluation_title,
                e.status AS evaluation_status,
                s.nim,
                s.nama,
                s.tahun_lulus,
                s.prodi,
                i.send_count,
                i.first_sent_at,
                i.last_sent_at
            FROM satisfaction_form_responses sfr
            JOIN evaluation_invitations i ON i.id = sfr.invitation_id
            JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
            WHERE sfr.id = ?
            LIMIT 1
        ');
        $customDetailStmt->execute([$responseId]);
        $customRow = $customDetailStmt->fetch(PDO::FETCH_ASSOC);

        if ($customRow) {
            $answers = json_decode($customRow['answers'], true);
            if (!is_array($answers)) {
                $answers = [];
            }
            $templateDefinition = [];
            $templateStmt = $pdo->prepare('SELECT definition FROM satisfaction_form_templates WHERE id = ? AND deleted_at IS NULL LIMIT 1');
            $templateStmt->execute([$customRow['template_id']]);
            $templateRow = $templateStmt->fetch(PDO::FETCH_ASSOC);
            if ($templateRow && isset($templateRow['definition'])) {
                $decoded = is_string($templateRow['definition']) ? json_decode($templateRow['definition'], true) : $templateRow['definition'];
                $templateDefinition = is_array($decoded) ? $decoded : [];
            }
            $header = [
                'id' => $customRow['id'],
                'evaluation_id' => $customRow['evaluation_id'],
                'evaluation_title' => $customRow['evaluation_title'],
                'evaluation_status' => $customRow['evaluation_status'],
                'student_id' => $customRow['student_id'],
                'nim' => $customRow['nim'],
                'nama' => $customRow['nama'],
                'tahun_lulus' => $customRow['tahun_lulus'],
                'prodi' => $customRow['prodi'],
                'submitted_at' => $customRow['submitted_at'],
                'send_count' => $customRow['send_count'],
                'first_sent_at' => $customRow['first_sent_at'],
                'last_sent_at' => $customRow['last_sent_at'],
            ];
            echo json_encode([
                'success' => true,
                'data' => [
                    'response_type' => 'custom',
                    'header' => $header,
                    'ratings' => [],
                    'answers' => $answers,
                    'template_definition' => $templateDefinition,
                ],
            ]);
            exit();
        }

        throw new Exception('Hasil evaluasi tidak ditemukan');
    }

    $legacyQuery = '
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
        JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
        JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
    ';
    $legacyParams = [];
    if ($evaluationId) {
        $legacyQuery .= ' WHERE r.evaluation_id = ? ';
        $legacyParams[] = $evaluationId;
    }
    $legacyQuery .= ' ORDER BY r.submitted_at DESC';
    $legacyStmt = $pdo->prepare($legacyQuery);
    $legacyStmt->execute($legacyParams);
    $legacyRows = $legacyStmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($legacyRows as &$legacyRow) {
        $legacyRow['response_type'] = 'legacy';
    }
    unset($legacyRow);

    $customQuery = '
        SELECT
            sfr.id AS response_id,
            i.evaluation_id,
            e.title AS evaluation_title,
            i.student_id AS student_id,
            s.nim,
            s.nama,
            sfr.submitted_at
        FROM satisfaction_form_responses sfr
        JOIN evaluation_invitations i ON i.id = sfr.invitation_id
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
    ';
    $customParams = [];
    if ($evaluationId) {
        $customQuery .= ' WHERE i.evaluation_id = ? ';
        $customParams[] = $evaluationId;
    }
    $customQuery .= ' ORDER BY sfr.submitted_at DESC';
    $customStmt = $pdo->prepare($customQuery);
    $customStmt->execute($customParams);
    $customRows = $customStmt->fetchAll(PDO::FETCH_ASSOC);

    $customMapped = array_map(function ($row) {
        return [
            'response_id' => $row['response_id'],
            'evaluation_id' => $row['evaluation_id'],
            'evaluation_title' => $row['evaluation_title'],
            'student_id' => $row['student_id'],
            'nim' => $row['nim'],
            'nama' => $row['nama'],
            'company_name' => 'Form Kustom',
            'employee_name' => '-',
            'major_job_match' => '-',
            'submitted_at' => $row['submitted_at'],
            'response_type' => 'custom',
        ];
    }, $customRows);

    $rows = array_merge($legacyRows, $customMapped);
    usort($rows, function ($a, $b) {
        $t1 = strtotime($a['submitted_at'] ?? '0');
        $t2 = strtotime($b['submitted_at'] ?? '0');
        return $t2 <=> $t1;
    });

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
