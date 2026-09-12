<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(200); exit; }
require_once __DIR__ . '/store_helper.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $auth = dosen_require_active_auth($pdo);
    $dosen = dosen_find_for_user($pdo,(string)$auth['sub']);
    if (!$dosen) dosen_json_response(404,['success'=>false,'error'=>'Profil dosen aktif tidak ditemukan.']);
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'GET') dosen_json_response(200,['success'=>true,'data'=>dosen_self_data($pdo,$dosen)]);

    $section = trim((string)($_GET['section'] ?? ''));
    if ($method === 'DELETE') {
        if ($section !== 'waktu_mengajar') dosen_json_response(405,['success'=>false,'error'=>'Penghapusan hanya tersedia untuk EWMP.']);
        $pdo->beginTransaction();
        dosen_delete_waktu_mengajar($pdo,(string)$dosen['id'],(string)($_GET['tahunAkademik'] ?? ''));
        $pdo->commit();
        dosen_json_response(200,['success'=>true,'data'=>dosen_self_data($pdo,$dosen),'message'=>'Data EWMP berhasil dihapus.']);
    }
    if ($method !== 'PUT' && $method !== 'POST') dosen_json_response(405,['success'=>false,'error'=>'Method not allowed.']);
    $data = dosen_request_json();
    $pdo->beginTransaction();
    if ($section === 'pengajaran') dosen_store_pengajaran($pdo,(string)$dosen['id'],$data);
    elseif ($section === 'penelitian') dosen_store_kegiatan($pdo,(string)$dosen['id'],$data,true);
    elseif ($section === 'pengabdian') dosen_store_kegiatan($pdo,(string)$dosen['id'],$data,false);
    elseif ($section === 'luaran') dosen_store_luaran($pdo,(string)$dosen['id'],$data);
    elseif ($section === 'waktu_mengajar') dosen_store_waktu_mengajar($pdo,(string)$dosen['id'],$data);
    else throw new InvalidArgumentException('Bagian data dosen tidak dikenali.');
    $pdo->commit();
    dosen_json_response(200,['success'=>true,'data'=>dosen_self_data($pdo,$dosen),'message'=>'Data berhasil disimpan.']);
} catch (InvalidArgumentException $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(422,['success'=>false,'error'=>$error->getMessage()]);
} catch (RuntimeException $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(404,['success'=>false,'error'=>$error->getMessage()]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(409,['success'=>false,'error'=>$error->getMessage()]);
}
