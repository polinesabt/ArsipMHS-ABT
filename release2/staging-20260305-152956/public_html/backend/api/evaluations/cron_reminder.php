<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/env.php';

try {
    $expectedSecret = getenv('CRON_SECRET') ?: getenv('JWT_SECRET') ?: '';
    $providedSecret = $_SERVER['HTTP_X_CRON_SECRET'] ?? '';

    if ($expectedSecret === '' || $providedSecret === '' || !hash_equals($expectedSecret, $providedSecret)) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Cron secret tidak valid',
        ]);
        exit();
    }

    $input = json_decode(file_get_contents('php://input'), true);
    $evaluationId = is_array($input) && isset($input['evaluation_id'])
        ? trim((string)$input['evaluation_id'])
        : null;

    $query = '
        SELECT
            i.id AS invitation_id,
            i.student_id,
            i.evaluation_id,
            i.access_token,
            e.title,
            e.short_message,
            e.reminder_interval_days
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id
        JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
        WHERE e.status = "active"
          AND e.deleted_at IS NULL
          AND e.reminder_enabled = 1
          AND i.submitted_at IS NULL
          AND i.last_sent_at IS NOT NULL
          AND TIMESTAMPDIFF(DAY, i.last_sent_at, NOW()) >= e.reminder_interval_days
    ';

    $params = [];
    if ($evaluationId) {
        $query .= ' AND i.evaluation_id = ?';
        $params[] = $evaluationId;
    }

    $query .= ' ORDER BY i.last_sent_at ASC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $dueInvitations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($dueInvitations) === 0) {
        echo json_encode([
            'success' => true,
            'data' => [
                'processed' => 0,
            ],
            'message' => 'Tidak ada reminder yang jatuh tempo',
        ]);
        exit();
    }

    $pdo->beginTransaction();

    $notificationStmt = $pdo->prepare('
        INSERT INTO student_notifications (
            id, student_id, evaluation_id, invitation_id,
            type, title, message, link_path, is_read, created_at
        ) VALUES (
            ?, ?, ?, ?, "reminder", ?, ?, ?, 0, NOW()
        )
    ');

    $invitationUpdateStmt = $pdo->prepare('
        UPDATE evaluation_invitations
        SET last_sent_at = NOW(), send_count = send_count + 1, updated_at = NOW()
        WHERE id = ?
    ');

    foreach ($dueInvitations as $row) {
        $title = 'Pengingat Evaluasi Lulusan: ' . $row['title'];
        $message = trim((string)($row['short_message'] ?? ''));
        if ($message === '') {
            $message = 'Pengingat: mohon lengkapi survey evaluasi lulusan melalui tautan berikut.';
        }

        $notificationStmt->execute([
            bin2hex(random_bytes(18)),
            $row['student_id'],
            $row['evaluation_id'],
            $row['invitation_id'],
            $title,
            $message,
            '/evaluasi?token=' . rawurlencode($row['access_token']),
        ]);

        $invitationUpdateStmt->execute([$row['invitation_id']]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'processed' => count($dueInvitations),
        ],
        'message' => 'Auto reminder berhasil diproses',
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
