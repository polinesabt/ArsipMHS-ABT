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
    
    $stmt = $pdo->prepare('SELECT * FROM tracer_study WHERE id = ?');
    $stmt->execute([$tracer_id]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
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
