<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/satisfaction_evidence.php';

try {
    requireAuth('admin');
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
        header('Allow: GET, OPTIONS');
        http_response_code(405);
        throw new InvalidArgumentException('Metode tidak diizinkan');
    }
    $respondentId = trim((string)($_GET['respondent_id'] ?? ''));
    if (!preg_match('/^(import|legacy|custom)-(.+)$/', $respondentId, $matches)) {
        throw new InvalidArgumentException('Identitas penilaian tidak valid');
    }
    [, $source, $id] = $matches;
    $path = null;
    if ($source === 'import') {
        $stmt = $pdo->prepare("SELECT bukti_local_path FROM import_kepuasan_pengguna WHERE id = ? AND kategori = 'bekerja' LIMIT 1");
        $stmt->execute([$id]);
        $path = $stmt->fetchColumn() ?: null;
    } elseif ($source === 'legacy') {
        $stmt = $pdo->prepare('SELECT r.* FROM evaluation_responses r
            JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
            WHERE r.id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $path = $row['attachment_path'] ?? null;
    } else {
        $stmt = $pdo->prepare('SELECT sfr.answers FROM satisfaction_form_responses sfr
            JOIN evaluation_invitations i ON i.id = sfr.invitation_id
            JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
            JOIN satisfaction_form_templates t ON t.id = sfr.template_id AND t.deleted_at IS NULL
            WHERE sfr.id = ? LIMIT 1');
        $stmt->execute([$id]);
        $answers = json_decode($stmt->fetchColumn() ?: '{}', true);
        $path = is_array($answers) ? customSatisfactionEvidencePath($answers) : null;
    }
    $evidence = resolveSatisfactionEvidence($path);
    if ($evidence === null) {
        http_response_code(404);
        throw new RuntimeException('Bukti formulir belum tersedia di hosting');
    }
    header('Content-Type: ' . $evidence['mime']);
    header('Content-Length: ' . filesize($evidence['full_path']));
    header('Content-Disposition: attachment; filename="' . $evidence['file_name'] . '"');
    header('Cache-Control: private, no-store');
    header('X-Content-Type-Options: nosniff');
    readfile($evidence['full_path']);
} catch (Throwable $e) {
    http_response_code(api_exception_status($e));
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => api_public_error($e)]);
}
