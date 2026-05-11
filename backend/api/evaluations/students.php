<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../students/status_effective_sql.php';

function mapInvitationStatus(array $row): string {
    if (!empty($row['submitted_at'])) {
        return 'submitted';
    }
    if (!empty($row['first_sent_at'])) {
        return 'sent';
    }
    return 'not_sent';
}

try {
    requireAuth('admin');

    $evaluationId = isset($_GET['evaluation_id']) ? trim((string)$_GET['evaluation_id']) : null;
    $tahunMasuk = isset($_GET['tahun_masuk']) ? (int)$_GET['tahun_masuk'] : null;
    $tahunLulus = isset($_GET['tahun_lulus']) ? (int)$_GET['tahun_lulus'] : null;
    $statusFilter = isset($_GET['evaluation_status']) ? trim((string)$_GET['evaluation_status']) : null;

    if ($statusFilter && !in_array($statusFilter, ['not_sent', 'sent', 'submitted'], true)) {
        throw new Exception('Filter status evaluasi tidak valid');
    }

    if ($evaluationId) {
        $evaluationStmt = $pdo->prepare('SELECT id FROM evaluations WHERE id = ? AND deleted_at IS NULL LIMIT 1');
        $evaluationStmt->execute([$evaluationId]);
        if (!$evaluationStmt->fetch(PDO::FETCH_ASSOC)) {
            throw new Exception('Evaluasi tidak ditemukan');
        }
    }

    $statusEffectiveExpr = student_status_effective_expr('s');
    $query = '
        SELECT DISTINCT
            s.id,
            s.nim,
            s.nama,
            s.jurusan,
            s.prodi,
            s.status,
            s.status_mode,
            (' . $statusEffectiveExpr . ') AS status_effective,
            s.tahun_masuk,
            s.tahun_lulus,
            s.email,
            s.no_hp,
            t.career_status,
            (u.is_active = 1) AS has_active_account,
            ei.id AS invitation_id,
            ei.access_token,
            ei.first_sent_at,
            ei.last_sent_at,
            ei.send_count,
            ei.submitted_at
        FROM students s
        JOIN tracer_study t ON s.id = t.student_id
        JOIN users u ON s.user_id = u.id
    ';

    $params = [];

    if ($evaluationId) {
        $query .= ' LEFT JOIN evaluation_invitations ei ON s.id = ei.student_id AND ei.evaluation_id = ? ';
        $params[] = $evaluationId;
    } else {
        $query .= ' LEFT JOIN evaluation_invitations ei ON 1 = 0 ';
    }

    $conditions = ['(' . $statusEffectiveExpr . ') = ?', 't.career_status = ?', 'u.role = ?', 'u.is_active = 1', 's.deleted_at IS NULL'];
    $params[] = 'alumni';
    $params[] = 'working';
    $params[] = 'student';

    if ($tahunMasuk) {
        $conditions[] = 's.tahun_masuk = ?';
        $params[] = $tahunMasuk;
    }

    if ($tahunLulus) {
        $conditions[] = 's.tahun_lulus = ?';
        $params[] = $tahunLulus;
    }

    $query .= ' WHERE ' . implode(' AND ', $conditions);
    $query .= ' ORDER BY s.nama ASC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $result = [];
    foreach ($rows as $row) {
        $evaluationStatus = mapInvitationStatus($row);
        if ($statusFilter && $evaluationStatus !== $statusFilter) {
            continue;
        }

        $row['evaluation_status'] = $evaluationStatus;
        $row['send_count'] = (int)($row['send_count'] ?? 0);
        $row['has_active_account'] = (bool)($row['has_active_account'] ?? 0);
        $result[] = $row;
    }

    echo json_encode([
        'success' => true,
        'data' => $result,
        'count' => count($result),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
