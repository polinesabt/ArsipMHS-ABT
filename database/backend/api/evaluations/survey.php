<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('student');

    $token = isset($_GET['token']) ? trim((string)$_GET['token']) : '';
    if ($token === '') {
        throw new Exception('Token survey diperlukan');
    }

    $studentStmt = $pdo->prepare('SELECT id, nim, nama, tahun_lulus, prodi FROM students WHERE user_id = ? LIMIT 1');
    $studentStmt->execute([$auth['sub'] ?? '']);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan untuk sesi login ini');
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
        JOIN evaluations e ON e.id = i.evaluation_id
        WHERE i.access_token = ?
        LIMIT 1
    ');
    $invitationStmt->execute([$token]);
    $invitation = $invitationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitation) {
        throw new Exception('Link survey tidak valid');
    }

    if (($invitation['student_id'] ?? '') !== ($student['id'] ?? '')) {
        throw new Exception('Link survey tidak sesuai dengan akun mahasiswa yang sedang login');
    }

    $responseStmt = $pdo->prepare('SELECT * FROM evaluation_responses WHERE invitation_id = ? LIMIT 1');
    $responseStmt->execute([$invitation['id']]);
    $existingResponse = $responseStmt->fetch(PDO::FETCH_ASSOC) ?: null;

    if (!$existingResponse && ($invitation['evaluation_status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi sudah ditutup dan tidak menerima pengisian baru');
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
            'status' => $existingResponse ? 'submitted' : 'pending',
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
