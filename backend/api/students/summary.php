<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth();
    if (!in_array($auth['role'] ?? '', ['admin', 'developer'], true)) {
        auth_json_error(403, 'Akses ringkasan ditolak', 'STUDENT_SUMMARY_DENIED');
    }
    $counts = ['filled' => 0, 'bekerja' => 0, 'wirausaha' => 0, 'studi' => 0, 'mencari' => 0];
    $stmt = $pdo->query('SELECT t.career_status, COUNT(*) AS total FROM tracer_study t JOIN students s ON s.id = t.student_id AND s.deleted_at IS NULL GROUP BY t.career_status');
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $key = ['working' => 'bekerja', 'entrepreneur' => 'wirausaha', 'further_study' => 'studi', 'job_seeking' => 'mencari'][$row['career_status']] ?? null;
        if ($key !== null) {
            $counts[$key] = (int)$row['total'];
            $counts['filled'] += (int)$row['total'];
        }
    }
    $nims = $pdo->query('SELECT nim FROM students WHERE deleted_at IS NULL ORDER BY nim')->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['success' => true, 'data' => ['counts' => $counts, 'nims' => $nims]]);
} catch (Throwable $error) {
    http_response_code(api_exception_status($error));
    echo json_encode(['success' => false, 'error' => api_public_error($error)]);
}
