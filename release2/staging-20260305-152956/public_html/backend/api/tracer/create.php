<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/security.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (
        !$input ||
        !isset($input['student_id']) ||
        !isset($input['career_status']) ||
        !isset($input['email']) ||
        !isset($input['no_hp']) ||
        !isset($input['tahun_pengisian'])
    ) {
        throw new Exception('student_id, career_status, email, no_hp, dan tahun_pengisian diperlukan');
    }
    
    // Sanitize and validate input
    $student_id = sanitizeInput($input['student_id'], 'string');
    $career_status = sanitizeInput($input['career_status'], 'string');
    $email = sanitizeInput($input['email'], 'email');
    $no_hp = sanitizeInput($input['no_hp'], 'string');
    $tahun_pengisian = sanitizeInput($input['tahun_pengisian'], 'int');
    
    // Validate email
    if (!validateEmail($email)) {
        throw new Exception('Format email tidak valid');
    }
    
    // Validate phone (optional, bisa di-comment jika tidak perlu)
    // if (!validatePhone($no_hp)) {
    //     throw new Exception('Format nomor HP tidak valid');
    // }

    $studentStmt = $pdo->prepare('SELECT id, status FROM students WHERE id = ? AND deleted_at IS NULL LIMIT 1');
    $studentStmt->execute([$student_id]);
    $studentRow = $studentStmt->fetch(PDO::FETCH_ASSOC);
    if (!$studentRow) {
        throw new Exception('student_id tidak valid (akun mahasiswa tidak aktif)');
    }
    if (($studentRow['status'] ?? '') !== 'alumni') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Mahasiswa belum berstatus Alumni. Akses ditolak.',
        ]);
        exit;
    }
    
    $id = bin2hex(random_bytes(18)); // Generate UUID-like id
    
    $employment_data = isset($input['employment_data']) ? json_encode($input['employment_data']) : null;
    $job_seeking_data = isset($input['job_seeking_data']) ? json_encode($input['job_seeking_data']) : null;
    $entrepreneurship_data = isset($input['entrepreneurship_data']) ? json_encode($input['entrepreneurship_data']) : null;
    $further_study_data = isset($input['further_study_data']) ? json_encode($input['further_study_data']) : null;
    
    $stmt = $pdo->prepare('
        INSERT INTO tracer_study (
            id, student_id, email, no_hp, media_sosial, linkedin,
            career_status, tahun_pengisian,
            employment_data, job_seeking_data, entrepreneurship_data, further_study_data,
            ringkasan_karir, bersedia_dihubungi, saran_komentar, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?,
            ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, NOW(), NOW()
        )
    ');
    
    $stmt->execute([
        $id,
        $student_id,
        $email,
        $no_hp,
        isset($input['media_sosial']) ? sanitizeInput($input['media_sosial'], 'string') : null,
        isset($input['linkedin']) ? sanitizeInput($input['linkedin'], 'url') : null,
        $career_status,
        $tahun_pengisian,
        $employment_data,
        $job_seeking_data,
        $entrepreneurship_data,
        $further_study_data,
        isset($input['ringkasan_karir']) ? sanitizeInput($input['ringkasan_karir'], 'string') : null,
        isset($input['bersedia_dihubungi']) ? (bool)$input['bersedia_dihubungi'] : false,
        isset($input['saran_komentar']) ? sanitizeInput($input['saran_komentar'], 'string') : null
    ]);

    // Sinkronkan email ke akun mahasiswa (satu email per akun, dipakai di Pengaturan Login Email)
    $updateStudent = $pdo->prepare('UPDATE students SET email = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL');
    $updateStudent->execute([$email, $student_id]);

    // Sync chart Waktu Tunggu dan Cakupan Kerja agar data karir baru langsung muncul di dashboard
    require_once __DIR__ . '/../insight/sync_helpers.php';
    syncWaitingTime($pdo);
    syncWorkCoverage($pdo);
    
    echo json_encode([
        'success' => true,
        'id' => $id,
        'message' => 'Tracer study berhasil dibuat'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
