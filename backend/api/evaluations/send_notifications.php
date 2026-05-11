<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../config/email_login.php';
require_once __DIR__ . '/../../config/evaluation_email.php';
require_once __DIR__ . '/../satisfaction-forms/template_resolver.php';
require_once __DIR__ . '/../students/status_effective_sql.php';

function unique_array_values(array $items): array {
    $out = [];
    foreach ($items as $item) {
        $value = trim((string)$item);
        if ($value !== '' && !in_array($value, $out, true)) {
            $out[] = $value;
        }
    }
    return $out;
}

try {
    $auth = requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid');
    }

    $evaluationId = trim((string)($input['evaluation_id'] ?? ''));
    $studentIds = isset($input['student_ids']) && is_array($input['student_ids'])
        ? unique_array_values($input['student_ids'])
        : [];
    $customTitle = isset($input['title']) ? trim((string)$input['title']) : '';
    $customMessage = isset($input['message']) ? trim((string)$input['message']) : '';

    if ($evaluationId === '') {
        throw new Exception('evaluation_id wajib diisi');
    }
    if (count($studentIds) === 0) {
        throw new Exception('Pilih minimal satu alumni target');
    }

    $evalStmt = $pdo->prepare('SELECT * FROM evaluations WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $evalStmt->execute([$evaluationId]);
    $evaluation = $evalStmt->fetch(PDO::FETCH_ASSOC);

    if (!$evaluation) {
        throw new Exception('Evaluasi tidak ditemukan');
    }
    if (($evaluation['status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi sudah ditutup dan tidak bisa mengirim notifikasi');
    }

    $resolvedTemplate = resolveCurrentSatisfactionTemplate($pdo);

    $pdo->beginTransaction();

    $statusEffectiveExpr = student_status_effective_expr('s');
    $studentStmt = $pdo->prepare('
        SELECT
            s.id,
            s.nama,
            s.status,
            s.status_mode,
            (' . $statusEffectiveExpr . ') AS status_effective,
            t.career_status,
            u.id AS user_id,
            u.role,
            u.is_active,
            TRIM(COALESCE(s.login_email, s.email)) AS student_email
        FROM students s
        JOIN tracer_study t ON s.id = t.student_id
        JOIN users u ON s.user_id = u.id
        WHERE s.id = ?
          AND (' . $statusEffectiveExpr . ') = ?
          AND s.deleted_at IS NULL
          AND t.career_status = ?
          AND u.role = ?
          AND u.is_active = 1
        LIMIT 1
    ');
    $invitationFindStmt = $pdo->prepare('SELECT * FROM evaluation_invitations WHERE evaluation_id = ? AND student_id = ? LIMIT 1');
    $invitationInsertStmt = $pdo->prepare('
        INSERT INTO evaluation_invitations (
            id, evaluation_id, student_id, user_id, access_token,
            first_sent_at, last_sent_at, send_count,
            submitted_at, created_by, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, NOW(), NOW(), 1,
            NULL, ?, NOW(), NOW()
        )
    ');
    $invitationUpdateStmt = $pdo->prepare('
        UPDATE evaluation_invitations
        SET first_sent_at = COALESCE(first_sent_at, NOW()),
            last_sent_at = NOW(),
            send_count = send_count + 1,
            updated_at = NOW()
        WHERE id = ?
    ');
    $invitationUpdateWithNewTokenStmt = $pdo->prepare('
        UPDATE evaluation_invitations
        SET access_token = ?,
            first_sent_at = COALESCE(first_sent_at, NOW()),
            last_sent_at = NOW(),
            send_count = send_count + 1,
            updated_at = NOW()
        WHERE id = ?
    ');
    $blacklistInsertStmt = $pdo->prepare('
        INSERT INTO evaluation_token_blacklist (token, evaluation_id)
        VALUES (?, ?)
    ');
    $notificationStmt = $pdo->prepare('
        INSERT INTO student_notifications (
            id, student_id, evaluation_id, invitation_id,
            type, title, message, link_path, is_read, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW()
        )
    ');

    $sent = 0;
    $skipped = 0;
    $details = [];

    foreach ($studentIds as $studentId) {
        $studentStmt->execute([$studentId, 'alumni', 'working', 'student']);
        $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

        if (!$student) {
            $skipped++;
            $details[] = [
                'student_id' => $studentId,
                'status' => 'skipped_not_eligible_working_user',
            ];
            continue;
        }

        $invitationFindStmt->execute([$evaluationId, $studentId]);
        $invitation = $invitationFindStmt->fetch(PDO::FETCH_ASSOC);

        $invitationId = null;
        $token = null;
        $sendType = 'invitation';

        if ($invitation) {
            if (!empty($invitation['submitted_at'])) {
                $skipped++;
                $details[] = [
                    'student_id' => $studentId,
                    'status' => 'skipped_already_submitted',
                ];
                continue;
            }

            $invitationId = $invitation['id'];
            $oldToken = $invitation['access_token'];
            $token = bin2hex(random_bytes(32));
            $sendType = ((int)$invitation['send_count'] >= 1) ? 'reminder' : 'invitation';

            try {
                $blacklistInsertStmt->execute([$oldToken, $evaluationId]);
            } catch (Throwable $e) {
                // Table may not exist yet; resend still invalidates old link by updating token
            }
            $invitationUpdateWithNewTokenStmt->execute([$token, $invitationId]);
        } else {
            $invitationId = bin2hex(random_bytes(18));
            $token = bin2hex(random_bytes(32));
            $sendType = 'invitation';

            $invitationInsertStmt->execute([
                $invitationId,
                $evaluationId,
                $studentId,
                $student['user_id'] ?? null,
                $token,
                $auth['sub'] ?? null,
            ]);
        }

        $title = $customTitle !== ''
            ? $customTitle
            : 'Evaluasi Lulusan: ' . $evaluation['title'];

        $defaultMessage = trim((string)($evaluation['short_message'] ?? ''));
        if ($defaultMessage === '') {
            $defaultMessage = 'Mohon isi survey evaluasi lulusan pada link berikut.';
        }

        $message = $customMessage !== '' ? $customMessage : $defaultMessage;
        $linkPath = '/evaluasi?token=' . rawurlencode($token);

        $notificationStmt->execute([
            bin2hex(random_bytes(18)),
            $studentId,
            $evaluationId,
            $invitationId,
            $sendType,
            $title,
            $message,
            $linkPath,
        ]);

        $emailSent = false;
        $studentEmail = trim((string)($student['student_email'] ?? ''));
        if ($studentEmail !== '' && filter_var($studentEmail, FILTER_VALIDATE_EMAIL)) {
            $surveyUrl = rtrim(email_login_frontend_base_url(), '/') . '/evaluasi?token=' . rawurlencode($token);
            $emailResult = evaluation_send_survey_email(
                $studentEmail,
                $student['nama'] ?? '',
                $evaluation['title'] ?? 'Evaluasi Lulusan',
                $surveyUrl
            );
            $emailSent = ($emailResult['sent'] ?? false) === true;
        }

        $sent++;
        $details[] = [
            'student_id' => $studentId,
            'status' => 'sent',
            'type' => $sendType,
            'link_path' => $linkPath,
            'email_sent' => $emailSent,
        ];
    }

    $pdo->commit();

    $emailSentCount = 0;
    foreach ($details as $d) {
        if (!empty($d['email_sent'])) {
            $emailSentCount++;
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'sent_count' => $sent,
            'skipped_count' => $skipped,
            'email_sent_count' => $emailSentCount,
            'resolved_template_id' => $resolvedTemplate['template']['id'] ?? null,
            'resolved_template_updated_at' => $resolvedTemplate['template']['updated_at'] ?? null,
            'details' => $details,
        ],
        'message' => 'Pengiriman notifikasi evaluasi selesai',
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
