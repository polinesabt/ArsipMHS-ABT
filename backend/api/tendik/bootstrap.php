<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

function tendik_json_response(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function tendik_request_json(): array
{
    $input = json_decode((string)file_get_contents('php://input'), true);
    if (!is_array($input)) tendik_json_response(400,['success'=>false,'error'=>'Payload JSON tidak valid.']);
    return $input;
}

function tendik_find_for_user(PDO $pdo, string $userId): ?array
{
    $stmt=$pdo->prepare('SELECT * FROM tenaga_kependidikan WHERE user_id=? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row=$stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function tendik_profile_from_row(array $row): array
{
    $certs=json_decode((string)($row['sertifikat_kompetensi']??'[]'),true);
    if(!is_array($certs)) $certs=[];
    return [
        'id'=>(string)$row['id'],
        'userId'=>isset($row['user_id'])?(string)$row['user_id']:null,
        'nip'=>(string)$row['nip'],
        'nama'=>(string)$row['nama'],
        'status'=>(string)$row['status'],
        'jabatan'=>(string)$row['jabatan'],
        'golongan'=>(string)($row['golongan']??''),
        'pendidikanD3'=>(string)($row['pendidikan_d3']??''),
        'pendidikanS1'=>(string)($row['pendidikan_s1']??''),
        'pendidikanS2'=>(string)($row['pendidikan_s2']??''),
        'pendidikanS3'=>(string)($row['pendidikan_s3']??''),
        'sertifikatKompetensi'=>array_values(array_map('strval',$certs)),
    ];
}

function tendik_validate_profile(array $input): array
{
    $text=static function(mixed $value,string $label,int $max,bool $required=false):string {
        $value=preg_replace('/\s+/u',' ',trim((string)$value))??'';
        if($required&&$value==='') throw new InvalidArgumentException("{$label} wajib diisi.");
        if(mb_strlen($value)>$max) throw new InvalidArgumentException("{$label} maksimal {$max} karakter.");
        return $value;
    };
    $nip=$text($input['nip']??'','NIP/NITK',50,true);
    if(!preg_match('/^[A-Za-z0-9.\/-]+$/',$nip)) throw new InvalidArgumentException('NIP/NITK hanya boleh berisi huruf, angka, titik, garis miring, atau tanda hubung.');
    $status=(string)($input['status']??'');
    if(!in_array($status,['Tetap','Tidak Tetap'],true)) throw new InvalidArgumentException('Status tendik harus Tetap atau Tidak Tetap.');
    $certs=$input['sertifikatKompetensi']??[];
    if(!is_array($certs)) throw new InvalidArgumentException('Daftar sertifikat kompetensi tidak valid.');
    $cleanCerts=[];
    foreach($certs as $cert){ $value=$text($cert,'Sertifikat kompetensi',255); if($value!=='')$cleanCerts[]=$value; }
    return [
        'nip'=>$nip,
        'nama'=>$text($input['nama']??'','Nama tendik',150,true),
        'status'=>$status,
        'jabatan'=>$text($input['jabatan']??'','Jabatan',100,true),
        'golongan'=>$text($input['golongan']??'','Golongan',100)?:null,
        'pendidikan_d3'=>$text($input['pendidikanD3']??'','Pendidikan D3',1000),
        'pendidikan_s1'=>$text($input['pendidikanS1']??'','Pendidikan S1',1000),
        'pendidikan_s2'=>$text($input['pendidikanS2']??'','Pendidikan S2',1000),
        'pendidikan_s3'=>$text($input['pendidikanS3']??'','Pendidikan S3',1000),
        'sertifikat_kompetensi'=>json_encode(array_values(array_unique($cleanCerts)),JSON_UNESCAPED_UNICODE),
    ];
}

function tendik_require_active_auth(PDO $pdo): array
{
    $auth=requireAuth('tendik');
    if(!tendik_find_for_user($pdo,(string)($auth['sub']??''))) tendik_json_response(403,['success'=>false,'error'=>'Akun tendik tidak aktif.']);
    return $auth;
}

function tendik_issue_tokens(string $userId,string $username): array
{
    $payload=['sub'=>$userId,'username'=>$username,'role'=>'tendik'];
    $token=auth_generate_token($payload);
    return ['token'=>$token,'jwt'=>$token,'refreshToken'=>auth_generate_token($payload,JWT_REFRESH_EXPIRATION)];
}

function tendik_create_account(PDO $pdo,string $tendikId,string $nip,string $nama): string
{
    $stmt=$pdo->prepare('SELECT id FROM users WHERE LOWER(TRIM(username))=LOWER(TRIM(?)) LIMIT 1');
    $stmt->execute([$nip]);
    if($stmt->fetchColumn())throw new RuntimeException('Username NIP/NITK sudah dipakai akun lain.');
    $data=random_bytes(16);$data[6]=chr((ord($data[6])&0x0f)|0x40);$data[8]=chr((ord($data[8])&0x3f)|0x80);
    $userId=vsprintf('%s%s-%s-%s-%s-%s%s%s',str_split(bin2hex($data),4));
    $stmt=$pdo->prepare('INSERT INTO users (id,username,password_hash,nama,role,is_active) VALUES (?,?,?,?,?,1)');
    $stmt->execute([$userId,$nip,password_hash($nip,PASSWORD_BCRYPT),$nama,'tendik']);
    $stmt=$pdo->prepare('UPDATE tenaga_kependidikan SET user_id=? WHERE id=?');$stmt->execute([$userId,$tendikId]);
    return $userId;
}
