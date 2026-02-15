<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

function normalizeRatings($raw): array {
    $normalized = [];

    if (is_array($raw)) {
        $isAssoc = array_keys($raw) !== range(0, count($raw) - 1);

        if ($isAssoc) {
            foreach ($raw as $aspectId => $score) {
                $normalized[trim((string)$aspectId)] = (int)$score;
            }
        } else {
            foreach ($raw as $row) {
                if (!is_array($row)) {
                    continue;
                }
                $aspectId = trim((string)($row['aspect_id'] ?? ''));
                $score = (int)($row['score'] ?? 0);
                if ($aspectId !== '') {
                    $normalized[$aspectId] = $score;
                }
            }
        }
    }

    return $normalized;
}

try {
    $auth = requireAuth('student');

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid');
    }

    $token = trim((string)($input['token'] ?? ''));
    $companyName = trim((string)($input['company_name'] ?? ''));
    $companyAddress = trim((string)($input['company_address'] ?? ''));
    $employeeName = trim((string)($input['employee_name'] ?? ''));
    $graduationYear = (int)($input['graduation_year'] ?? 0);
    $studyProgram = trim((string)($input['study_program'] ?? ''));
    $currentWorkDivision = trim((string)($input['current_work_division'] ?? ''));
    $majorJobMatch = strtolower(trim((string)($input['major_job_match'] ?? '')));
    $ratingsInput = normalizeRatings($input['ratings'] ?? []);

    if ($token === '') {
        throw new Exception('Token survey diperlukan');
    }
    if ($companyName === '' || $companyAddress === '' || $employeeName === '') {
        throw new Exception('Data identitas perusahaan dan karyawan wajib diisi');
    }
    if ($graduationYear < 1900 || $graduationYear > 2100) {
        throw new Exception('Tahun lulus tidak valid');
    }
    if ($studyProgram === '' || $currentWorkDivision === '') {
        throw new Exception('Program studi dan bidang kerja saat ini wajib diisi');
    }
    if (!in_array($majorJobMatch, ['ya', 'tidak'], true)) {
        throw new Exception('Kesesuaian jurusan wajib dipilih (ya/tidak)');
    }

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE user_id = ? LIMIT 1');
    $studentStmt->execute([$auth['sub'] ?? '']);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan untuk sesi login ini');
    }

    $studentId = $student['id'];

    $pdo->beginTransaction();

    $invitationStmt = $pdo->prepare('
        SELECT i.*, e.status AS evaluation_status
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id
        WHERE i.access_token = ?
        FOR UPDATE
    ');
    $invitationStmt->execute([$token]);
    $invitation = $invitationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitation) {
        throw new Exception('Link survey tidak valid');
    }

    if (($invitation['student_id'] ?? '') !== $studentId) {
        throw new Exception('Link survey tidak sesuai dengan akun mahasiswa yang sedang login');
    }

    if (($invitation['evaluation_status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi sudah ditutup dan tidak menerima pengisian baru');
    }

    if (!empty($invitation['submitted_at'])) {
        throw new Exception('Survey pada evaluasi ini sudah pernah dikirim dan terkunci');
    }

    $activeAspectsStmt = $pdo->prepare('SELECT id FROM evaluation_aspects WHERE is_active = 1 ORDER BY sort_order ASC');
    $activeAspectsStmt->execute();
    $activeAspects = $activeAspectsStmt->fetchAll(PDO::FETCH_COLUMN);

    if (count($activeAspects) === 0) {
        throw new Exception('Master aspek evaluasi belum tersedia');
    }

    foreach ($activeAspects as $aspectId) {
        if (!array_key_exists($aspectId, $ratingsInput)) {
            throw new Exception('Semua aspek wajib diberi nilai tepat satu kali');
        }
        $score = (int)$ratingsInput[$aspectId];
        if ($score < 1 || $score > 5) {
            throw new Exception('Nilai aspek harus antara 1 sampai 5');
        }
    }

    $responseId = bin2hex(random_bytes(18));

    $insertResponseStmt = $pdo->prepare('
        INSERT INTO evaluation_responses (
            id, evaluation_id, invitation_id, student_id,
            company_name, company_address, employee_name,
            graduation_year, study_program, current_work_division,
            major_job_match, submitted_at, created_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )
    ');

    $insertResponseStmt->execute([
        $responseId,
        $invitation['evaluation_id'],
        $invitation['id'],
        $studentId,
        $companyName,
        $companyAddress,
        $employeeName,
        $graduationYear,
        $studyProgram,
        $currentWorkDivision,
        $majorJobMatch,
    ]);

    $insertRatingStmt = $pdo->prepare('
        INSERT INTO evaluation_response_ratings (
            id, response_id, aspect_id, score, created_at
        ) VALUES (
            ?, ?, ?, ?, NOW()
        )
    ');

    foreach ($activeAspects as $aspectId) {
        $insertRatingStmt->execute([
            bin2hex(random_bytes(18)),
            $responseId,
            $aspectId,
            (int)$ratingsInput[$aspectId],
        ]);
    }

    $updateInvitationStmt = $pdo->prepare('
        UPDATE evaluation_invitations
        SET submitted_at = NOW(), updated_at = NOW()
        WHERE id = ?
    ');
    $updateInvitationStmt->execute([$invitation['id']]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'response_id' => $responseId,
            'submitted_at' => date('Y-m-d H:i:s'),
        ],
        'message' => 'Survey berhasil dikirim',
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
