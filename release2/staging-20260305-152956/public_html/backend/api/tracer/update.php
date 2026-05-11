<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }
    
    $tracer_id = $input['id'];

    $checkStmt = $pdo->prepare('
        SELECT t.id, s.status AS student_status
        FROM tracer_study t
        JOIN students s ON s.id = t.student_id
        WHERE t.id = ? AND s.deleted_at IS NULL
        LIMIT 1
    ');
    $checkStmt->execute([$tracer_id]);
    $checkRow = $checkStmt->fetch(PDO::FETCH_ASSOC);
    if (!$checkRow) {
        throw new Exception('Tracer study tidak ditemukan atau akun mahasiswa tidak aktif');
    }
    if (($checkRow['student_status'] ?? '') !== 'alumni') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Mahasiswa belum berstatus Alumni. Akses ditolak.',
        ]);
        exit;
    }
    
    $fields = [];
    $params = [];
    
    $allowedFields = [
        'email' => 'email',
        'no_hp' => 'no_hp',
        'media_sosial' => 'media_sosial',
        'linkedin' => 'linkedin',
        'career_status' => 'career_status',
        'tahun_pengisian' => 'tahun_pengisian',
        'employment_data' => 'employment_data',
        'job_seeking_data' => 'job_seeking_data',
        'entrepreneurship_data' => 'entrepreneurship_data',
        'further_study_data' => 'further_study_data',
        'ringkasan_karir' => 'ringkasan_karir',
        'bersedia_dihubungi' => 'bersedia_dihubungi',
        'saran_komentar' => 'saran_komentar',
    ];
    
    foreach ($allowedFields as $inputKey => $dbField) {
        if (array_key_exists($inputKey, $input)) {
            $value = $input[$inputKey];
            if (in_array($inputKey, ['employment_data', 'job_seeking_data', 'entrepreneurship_data', 'further_study_data'], true)) {
                $value = $value !== null ? json_encode($value) : null;
            }
            $fields[] = "$dbField = ?";
            $params[] = $value;
        }
    }
    
    if (empty($fields)) {
        throw new Exception('Tidak ada data untuk diperbarui');
    }
    
    $params[] = $tracer_id;
    $query = 'UPDATE tracer_study SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ?';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);

    if (array_key_exists('email', $input)) {
        $studentIdStmt = $pdo->prepare('SELECT student_id FROM tracer_study WHERE id = ?');
        $studentIdStmt->execute([$tracer_id]);
        $row = $studentIdStmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $emailVal = $input['email'];
            if (is_string($emailVal)) {
                $updateStudent = $pdo->prepare('UPDATE students SET email = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL');
                $updateStudent->execute([trim($emailVal), $row['student_id']]);
            }
        }
    }
    
    $stmt = $pdo->prepare('SELECT * FROM tracer_study WHERE id = ?');
    $stmt->execute([$tracer_id]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);

    // Sinkron otomatis chart Waktu Tunggu dan Cakupan Kerja setiap update tracer
    require_once __DIR__ . '/../insight/sync_helpers.php';
    syncWaitingTime($pdo);
    syncWorkCoverage($pdo);

    echo json_encode([
        'success' => true,
        'data' => $updated,
        'message' => 'Tracer study berhasil diperbarui'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
