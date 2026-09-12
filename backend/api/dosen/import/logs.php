<?php
declare(strict_types=1);

require_once __DIR__ . '/../../../config/cors.php';
require_once __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

try {
    requireAuth('admin');
    $logId = trim((string)($_GET['id'] ?? ''));
    if ($logId !== '') {
        $log = $pdo->prepare('SELECT id,module,uploaded_by,file_name,total_rows,success_rows,skipped_rows,failed_rows,affected_dosen,status,created_at,finished_at FROM dosen_import_logs WHERE id=? LIMIT 1');
        $log->execute([$logId]);
        $header = $log->fetch(PDO::FETCH_ASSOC);
        if (!$header) dosen_json_response(404, ['success'=>false,'error'=>'Log impor tidak ditemukan.']);
        $details = $pdo->prepare('SELECT row_number AS row, identity_raw AS identity, status, message FROM dosen_import_log_details WHERE import_log_id=? ORDER BY row_number');
        $details->execute([$logId]);
        $header['details'] = $details->fetchAll(PDO::FETCH_ASSOC);
        dosen_json_response(200, ['success'=>true,'data'=>$header]);
    }
    $stmt = $pdo->query('SELECT id,module,file_name,total_rows,success_rows,skipped_rows,failed_rows,affected_dosen,status,created_at,finished_at FROM dosen_import_logs ORDER BY created_at DESC LIMIT 50');
    dosen_json_response(200, ['success'=>true,'data'=>$stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Throwable $error) {
    dosen_json_response(500, ['success'=>false,'error'=>'Gagal memuat log impor: '.$error->getMessage()]);
}
