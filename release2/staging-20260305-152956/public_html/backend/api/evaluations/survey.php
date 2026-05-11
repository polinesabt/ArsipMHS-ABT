<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../satisfaction-forms/template_resolver.php';

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

try {
    $token = isset($_GET['token']) ? trim((string)$_GET['token']) : '';
    if ($token === '') {
        throw new Exception('Token survey diperlukan');
    }

    $invitationStmt = $pdo->prepare('
        SELECT
            i.*,
            e.title AS evaluation_title,
            e.short_message,
            e.status AS evaluation_status,
            e.start_at,
            e.end_at
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        WHERE i.access_token = ?
        LIMIT 1
    ');
    $invitationStmt->execute([$token]);
    $invitation = $invitationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitation) {
        try {
            $blacklistStmt = $pdo->prepare('SELECT 1 FROM evaluation_token_blacklist WHERE token = ? LIMIT 1');
            $blacklistStmt->execute([$token]);
            if ($blacklistStmt->fetchColumn() !== false) {
                http_response_code(410);
                echo json_encode([
                    'success' => false,
                    'error' => 'Link sudah tidak berlaku. Link terbaru telah dikirim ke dashboard dan email Anda.',
                ]);
                return;
            }
        } catch (Throwable $e) {
            // Table may not exist yet
        }
        throw new Exception('Link survey tidak valid');
    }

    if (($invitation['evaluation_status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi telah ditutup dan tidak menerima pengisian baru');
    }

    $now = date('Y-m-d H:i:s');
    $startAt = $invitation['start_at'] ?? '';
    $endAt = $invitation['end_at'] ?? null;

    if ($startAt !== '' && $now < $startAt) {
        throw new Exception('Periode evaluasi belum dimulai');
    }
    if ($endAt !== null && trim($endAt) !== '' && $now > $endAt) {
        throw new Exception('Periode evaluasi telah berakhir');
    }

    $responseStmt = $pdo->prepare('SELECT * FROM evaluation_responses WHERE invitation_id = ? LIMIT 1');
    $responseStmt->execute([$invitation['id']]);
    $existingResponse = $responseStmt->fetch(PDO::FETCH_ASSOC) ?: null;

    $customResponseStmt = $pdo->prepare('SELECT id FROM satisfaction_form_responses WHERE invitation_id = ? LIMIT 1');
    $customResponseStmt->execute([$invitation['id']]);
    $customResponse = $customResponseStmt->fetch(PDO::FETCH_ASSOC) ?: null;

    $isSubmitted = !empty($invitation['submitted_at']) || $existingResponse || $customResponse;

    $resolvedTemplate = resolveCurrentSatisfactionTemplate($pdo);
    $activeTemplate = [
        'id' => $resolvedTemplate['template']['id'],
        'title' => $resolvedTemplate['template']['title'],
        'definition' => $resolvedTemplate['template']['definition'],
    ];

    $studentStmt = $pdo->prepare('SELECT id, nim, nama, tahun_lulus, prodi FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $studentStmt->execute([$invitation['student_id']]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan');
    }

    $aspectsStmt = $pdo->prepare('
        SELECT id, code, name, sort_order
        FROM evaluation_aspects
        WHERE is_active = 1
        ORDER BY sort_order ASC
    ');
    $aspectsStmt->execute();
    $aspects = $aspectsStmt->fetchAll(PDO::FETCH_ASSOC);

    $ratings = [];
    if ($existingResponse) {
        $ratingsStmt = $pdo->prepare('
            SELECT aspect_id, score
            FROM evaluation_response_ratings
            WHERE response_id = ?
        ');
        $ratingsStmt->execute([$existingResponse['id']]);
        $rows = $ratingsStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as $row) {
            $ratings[$row['aspect_id']] = (int)$row['score'];
        }
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'status' => $isSubmitted ? 'submitted' : 'pending',
            'invitation' => [
                'id' => $invitation['id'],
                'evaluation_id' => $invitation['evaluation_id'],
                'token' => $invitation['access_token'],
                'submitted_at' => $invitation['submitted_at'],
            ],
            'evaluation' => [
                'id' => $invitation['evaluation_id'],
                'title' => $invitation['evaluation_title'],
                'short_message' => $invitation['short_message'],
                'status' => $invitation['evaluation_status'],
                'start_at' => $invitation['start_at'],
                'end_at' => $invitation['end_at'],
            ],
            'student' => $student,
            'response' => $existingResponse,
            'ratings' => $ratings,
            'aspects' => array_map(function ($aspect) {
                return [
                    'id' => $aspect['id'],
                    'code' => $aspect['code'],
                    'name' => $aspect['name'],
                    'sort_order' => (int)$aspect['sort_order'],
                ];
            }, $aspects),
            'active_template' => $activeTemplate,
            'active_template_id' => $activeTemplate !== null ? ($activeTemplate['id'] ?? null) : null,
            'active_template_updated_at' => $resolvedTemplate['template']['updated_at'] ?? null,
            'active_template_resolved_via' => $resolvedTemplate['resolved_via'] ?? 'active',
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
