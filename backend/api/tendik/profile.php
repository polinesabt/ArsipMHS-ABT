<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
if(($_SERVER['REQUEST_METHOD']??'')==='OPTIONS'){http_response_code(200);exit;}
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

try{
    $auth=tendik_require_active_auth($pdo);
    $userId=(string)$auth['sub'];
    $current=tendik_find_for_user($pdo,$userId);
    if(!$current)tendik_json_response(404,['success'=>false,'error'=>'Profil tendik aktif tidak ditemukan.']);
    $method=$_SERVER['REQUEST_METHOD']??'GET';
    if($method==='GET')tendik_json_response(200,['success'=>true,'data'=>tendik_profile_from_row($current)]);
    if($method!=='PUT'&&$method!=='POST')tendik_json_response(405,['success'=>false,'error'=>'Method not allowed.']);
    $profile=tendik_validate_profile(tendik_request_json());
    $nipChanged=$profile['nip']!==(string)$current['nip'];
    $pdo->beginTransaction();
    if($nipChanged){
        $stmt=$pdo->prepare('SELECT COUNT(*) FROM tenaga_kependidikan WHERE nip=? AND id<>?');$stmt->execute([$profile['nip'],$current['id']]);
        if((int)$stmt->fetchColumn()>0)throw new RuntimeException('NIP/NITK baru sudah digunakan tendik lain.');
        $stmt=$pdo->prepare('SELECT COUNT(*) FROM users WHERE LOWER(TRIM(username))=LOWER(TRIM(?)) AND id<>?');$stmt->execute([$profile['nip'],$userId]);
        if((int)$stmt->fetchColumn()>0)throw new RuntimeException('NIP/NITK baru sudah digunakan akun lain.');
    }
    $stmt=$pdo->prepare('UPDATE tenaga_kependidikan SET nip=?,nama=?,status=?,jabatan=?,golongan=?,pendidikan_d3=?,pendidikan_s1=?,pendidikan_s2=?,pendidikan_s3=?,sertifikat_kompetensi=? WHERE id=?');
    $stmt->execute([$profile['nip'],$profile['nama'],$profile['status'],$profile['jabatan'],$profile['golongan'],$profile['pendidikan_d3'],$profile['pendidikan_s1'],$profile['pendidikan_s2'],$profile['pendidikan_s3'],$profile['sertifikat_kompetensi'],$current['id']]);
    $stmt=$pdo->prepare('UPDATE users SET username=?,nama=? WHERE id=? AND role=?');$stmt->execute([$profile['nip'],$profile['nama'],$userId,'tendik']);
    $pdo->commit();
    $updated=tendik_find_for_user($pdo,$userId);
    $data=['profile'=>tendik_profile_from_row($updated),'nipChanged'=>$nipChanged];
    if($nipChanged)$data=array_merge($data,tendik_issue_tokens($userId,$profile['nip']));
    tendik_json_response(200,['success'=>true,'data'=>$data,'message'=>'Profil tendik berhasil disimpan.']);
}catch(InvalidArgumentException $error){
    if($pdo->inTransaction())$pdo->rollBack();tendik_json_response(422,['success'=>false,'error'=>$error->getMessage()]);
}catch(Throwable $error){
    if($pdo->inTransaction())$pdo->rollBack();tendik_json_response(409,['success'=>false,'error'=>$error->getMessage()]);
}
