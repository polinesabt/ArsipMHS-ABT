<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/store_helper.php';
require_once __DIR__ . '/../tendik/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    dosen_json_response(405, ['success' => false, 'error' => 'Method not allowed.']);
}

function dosen_require_target(PDO $pdo, string $nidn): array
{
    $row = dosen_find_by_nidn($pdo, $nidn);
    if (!$row) throw new RuntimeException('Dosen aktif tidak ditemukan.');
    return $row;
}

function dosen_replace_recognitions(PDO $pdo, string $dosenId, string $bidang, array $items): void
{
    $pdo->prepare('DELETE FROM dosen_rekognisi WHERE dosen_id = ? AND bidang = ?')->execute([$dosenId, $bidang]);
    $insert = $pdo->prepare('INSERT INTO dosen_rekognisi (dosen_id, bidang, deskripsi) VALUES (?, ?, ?)');
    foreach ($items as $item) {
        $value = trim((string)$item);
        if ($value !== '') $insert->execute([$dosenId, $bidang, $value]);
    }
}

try {
    $auth = requireAuth('admin');
    requireProductionWrite($auth);
    $input = dosen_request_json();
    $action = trim((string)($input['action'] ?? ''));
    $data = is_array($input['data'] ?? null) ? $input['data'] : (is_array($input['payload'] ?? null) ? $input['payload'] : []);
    $originalNidn = trim((string)($input['nidn'] ?? $data['nidn'] ?? ''));
    $pdo->beginTransaction();

    if ($action === 'create_dosen') {
        $profile = dosen_validate_profile($data);
        if (dosen_find_by_nidn($pdo, $profile['nidn'], true)) throw new RuntimeException('NIDN/NIDK sudah terdaftar.');
        $id = dosen_uuid();
        $insert = $pdo->prepare('INSERT INTO dosen (id,nidn,nama,status_dosen,jabatan,peran,institusi,pendidikan_pasca_sarjana,bidang_keahlian,sertifikat_pendidik,sertifikat_kompetensi,email,telepon) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $insert->execute([$id,$profile['nidn'],$profile['nama'],$profile['status_dosen'],$profile['jabatan'],$profile['peran'],$profile['institusi'],$profile['pendidikan_pasca_sarjana'],$profile['bidang_keahlian'],$profile['sertifikat_pendidik'],$profile['sertifikat_kompetensi'],$profile['email'],$profile['telepon']]);
        dosen_create_account($pdo, $id, $profile['nidn'], $profile['nama']);
    } elseif ($action === 'update_dosen') {
        $target = dosen_require_target($pdo, $originalNidn);
        $profile = dosen_validate_profile($data);
        if ($profile['nidn'] !== $originalNidn) {
            $duplicate = dosen_find_by_nidn($pdo, $profile['nidn'], true);
            if ($duplicate && $duplicate['id'] !== $target['id']) throw new RuntimeException('NIDN/NIDK baru sudah digunakan.');
        }
        if (!empty($target['user_id']) && $profile['nidn'] !== $target['nidn']) {
            $duplicateUser = $pdo->prepare('SELECT COUNT(*) FROM users WHERE LOWER(TRIM(username))=LOWER(TRIM(?)) AND id<>?');
            $duplicateUser->execute([$profile['nidn'], $target['user_id']]);
            if ((int)$duplicateUser->fetchColumn() > 0) throw new RuntimeException('Username baru sudah dipakai akun lain.');
        }
        $update = $pdo->prepare('UPDATE dosen SET nidn=?,nama=?,status_dosen=?,jabatan=?,peran=?,institusi=?,pendidikan_pasca_sarjana=?,bidang_keahlian=?,sertifikat_pendidik=?,sertifikat_kompetensi=?,email=?,telepon=? WHERE id=?');
        $update->execute([$profile['nidn'],$profile['nama'],$profile['status_dosen'],$profile['jabatan'],$profile['peran'],$profile['institusi'],$profile['pendidikan_pasca_sarjana'],$profile['bidang_keahlian'],$profile['sertifikat_pendidik'],$profile['sertifikat_kompetensi'],$profile['email'],$profile['telepon'],$target['id']]);
        if (!empty($target['user_id']) && $profile['nidn'] !== $target['nidn']) {
            $user = $pdo->prepare('UPDATE users SET username=?,nama=? WHERE id=? AND role=?');
            $user->execute([$profile['nidn'],$profile['nama'],$target['user_id'],'dosen']);
        } elseif (!empty($target['user_id'])) {
            $user = $pdo->prepare('UPDATE users SET nama=? WHERE id=? AND role=?');
            $user->execute([$profile['nama'],$target['user_id'],'dosen']);
        }
    } elseif ($action === 'delete_dosen') {
        $target = dosen_require_target($pdo, $originalNidn);
        $archive = $pdo->prepare('INSERT INTO dosen_archives (id,nidn,nama,payload_json,deleted_at,expires_at) VALUES (?,?,?,?,NOW(),DATE_ADD(NOW(),INTERVAL 20 DAY))');
        $archive->execute([dosen_uuid(),$target['nidn'],$target['nama'],json_encode(dosen_profile_from_row($target),JSON_UNESCAPED_UNICODE)]);
        $pdo->prepare('UPDATE dosen SET deleted_at=NOW(),deleted_by=? WHERE id=?')->execute([(string)$auth['sub'],$target['id']]);
        if (!empty($target['user_id'])) $pdo->prepare('UPDATE users SET is_active=0 WHERE id=?')->execute([$target['user_id']]);
    } elseif ($action === 'restore_dosen') {
        $target = dosen_find_by_nidn($pdo, $originalNidn, true);
        if (!$target || empty($target['deleted_at'])) throw new RuntimeException('Arsip dosen tidak ditemukan.');
        $pdo->prepare('UPDATE dosen SET deleted_at=NULL,deleted_by=NULL WHERE id=?')->execute([$target['id']]);
        if (!empty($target['user_id'])) $pdo->prepare('UPDATE users SET is_active=1 WHERE id=?')->execute([$target['user_id']]);
        $pdo->prepare('DELETE FROM dosen_archives WHERE nidn=?')->execute([$originalNidn]);
    } elseif ($action === 'permanent_delete_dosen') {
        $target = dosen_find_by_nidn($pdo, $originalNidn, true);
        if (!$target || empty($target['deleted_at'])) throw new RuntimeException('Arsip dosen tidak ditemukan.');
        $userId = $target['user_id'] ?? null;
        $pdo->prepare('DELETE FROM dosen WHERE id=?')->execute([$target['id']]);
        $pdo->prepare('DELETE FROM dosen_archives WHERE nidn=?')->execute([$originalNidn]);
        if ($userId) $pdo->prepare('DELETE FROM users WHERE id=? AND role=?')->execute([$userId,'dosen']);
    } elseif ($action === 'update_pengajaran') {
        $target = dosen_require_target($pdo, $originalNidn);
        dosen_store_pengajaran($pdo,(string)$target['id'],$data);
    } elseif ($action === 'update_penelitian' || $action === 'update_pengabdian') {
        $target = dosen_require_target($pdo, $originalNidn);
        $research = $action === 'update_penelitian';
        dosen_store_kegiatan($pdo,(string)$target['id'],$data,$research);
    } elseif ($action === 'update_waktu_mengajar') {
        $target = dosen_require_target($pdo, $originalNidn);
        dosen_store_waktu_mengajar($pdo,(string)$target['id'],$data);
    } elseif ($action === 'delete_waktu_mengajar') {
        $target = dosen_require_target($pdo, $originalNidn);
        dosen_delete_waktu_mengajar($pdo,(string)$target['id'],(string)($data['tahunAkademik']??''));
    } elseif ($action === 'update_luaran') {
        $target = dosen_require_target($pdo, $originalNidn);
        dosen_store_luaran($pdo,(string)$target['id'],$data);
    } elseif (in_array($action,['create_tendik','update_tendik','delete_tendik'],true)) {
        if ($action==='delete_tendik') {
            $stmt=$pdo->prepare('SELECT id,user_id FROM tenaga_kependidikan WHERE id=? AND deleted_at IS NULL LIMIT 1');
            $stmt->execute([(string)($data['id']??'')]);$target=$stmt->fetch(PDO::FETCH_ASSOC);
            if(!$target)throw new RuntimeException('Data tendik aktif tidak ditemukan.');
            $pdo->prepare('UPDATE tenaga_kependidikan SET deleted_at=NOW() WHERE id=?')->execute([$target['id']]);
            if(!empty($target['user_id']))$pdo->prepare('UPDATE users SET is_active=0 WHERE id=? AND role=?')->execute([$target['user_id'],'tendik']);
        } else {
            $profile=tendik_validate_profile($data);
            if ($action==='create_tendik') {
                $id=dosen_uuid();
                $stmt=$pdo->prepare('INSERT INTO tenaga_kependidikan (id,nip,nama,status,jabatan,golongan,pendidikan_d3,pendidikan_s1,pendidikan_s2,pendidikan_s3,sertifikat_kompetensi) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
                $stmt->execute([$id,$profile['nip'],$profile['nama'],$profile['status'],$profile['jabatan'],$profile['golongan'],$profile['pendidikan_d3'],$profile['pendidikan_s1'],$profile['pendidikan_s2'],$profile['pendidikan_s3'],$profile['sertifikat_kompetensi']]);
                tendik_create_account($pdo,$id,$profile['nip'],$profile['nama']);
            } else {
                $stmt=$pdo->prepare('SELECT * FROM tenaga_kependidikan WHERE id=? AND deleted_at IS NULL LIMIT 1');$stmt->execute([(string)($data['id']??'')]);$target=$stmt->fetch(PDO::FETCH_ASSOC);
                if(!$target)throw new RuntimeException('Data tendik aktif tidak ditemukan.');
                if($profile['nip']!==$target['nip']){
                    $duplicate=$pdo->prepare('SELECT COUNT(*) FROM users WHERE LOWER(TRIM(username))=LOWER(TRIM(?)) AND id<>?');$duplicate->execute([$profile['nip'],$target['user_id']??'']);
                    if((int)$duplicate->fetchColumn()>0)throw new RuntimeException('NIP/NITK baru sudah digunakan akun lain.');
                }
                $stmt=$pdo->prepare('UPDATE tenaga_kependidikan SET nip=?,nama=?,status=?,jabatan=?,golongan=?,pendidikan_d3=?,pendidikan_s1=?,pendidikan_s2=?,pendidikan_s3=?,sertifikat_kompetensi=? WHERE id=?');
                $stmt->execute([$profile['nip'],$profile['nama'],$profile['status'],$profile['jabatan'],$profile['golongan'],$profile['pendidikan_d3'],$profile['pendidikan_s1'],$profile['pendidikan_s2'],$profile['pendidikan_s3'],$profile['sertifikat_kompetensi'],$target['id']]);
                if(!empty($target['user_id']))$pdo->prepare('UPDATE users SET username=?,nama=? WHERE id=? AND role=?')->execute([$profile['nip'],$profile['nama'],$target['user_id'],'tendik']);
            }
        }
    } else {
        throw new InvalidArgumentException('Action dosen tidak dikenali.');
    }
    $pdo->commit();
    dosen_json_response(200,['success'=>true,'data'=>['action'=>$action],'message'=>'Data berhasil disimpan ke database.']);
} catch (InvalidArgumentException $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(422,['success'=>false,'error'=>$error->getMessage()]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(409,['success'=>false,'error'=>$error->getMessage()]);
}
