<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';

function tendik_backfill_uuid(): string
{
    $data=random_bytes(16);$data[6]=chr((ord($data[6])&0x0f)|0x40);$data[8]=chr((ord($data[8])&0x3f)|0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s',str_split(bin2hex($data),4));
}

$created=0;$linked=0;$conflicts=[];
$rows=$pdo->query('SELECT id,nip,nama,user_id FROM tenaga_kependidikan WHERE deleted_at IS NULL ORDER BY nama')->fetchAll(PDO::FETCH_ASSOC);
foreach($rows as $row){
    if(!empty($row['user_id'])){$linked++;continue;}
    $nip=trim((string)$row['nip']);
    $stmt=$pdo->prepare('SELECT id,role FROM users WHERE LOWER(TRIM(username))=LOWER(TRIM(?)) LIMIT 1');$stmt->execute([$nip]);$existing=$stmt->fetch(PDO::FETCH_ASSOC);
    if($existing){
        if(($existing['role']??'')==='tendik'){
            try{$stmt=$pdo->prepare('UPDATE tenaga_kependidikan SET user_id=? WHERE id=? AND user_id IS NULL');$stmt->execute([$existing['id'],$row['id']]);$linked+=$stmt->rowCount();}
            catch(Throwable $error){$conflicts[]=sprintf('%s (%s): %s',$nip,$row['nama'],$error->getMessage());}
        }else{$conflicts[]=sprintf('%s (%s) dipakai role %s',$nip,$row['nama'],$existing['role']);}
        continue;
    }
    $pdo->beginTransaction();
    try{
        $userId=tendik_backfill_uuid();
        $stmt=$pdo->prepare('INSERT INTO users (id,username,password_hash,nama,role,is_active) VALUES (?,?,?,?,?,1)');
        $stmt->execute([$userId,$nip,password_hash($nip,PASSWORD_BCRYPT),$row['nama'],'tendik']);
        $pdo->prepare('UPDATE tenaga_kependidikan SET user_id=? WHERE id=?')->execute([$userId,$row['id']]);
        $pdo->commit();$created++;
    }catch(Throwable $error){if($pdo->inTransaction())$pdo->rollBack();$conflicts[]=sprintf('%s (%s): %s',$nip,$row['nama'],$error->getMessage());}
}
echo "Akun dibuat: {$created}\nAkun sudah/berhasil ditautkan: {$linked}\nKonflik: ".count($conflicts)."\n";
foreach($conflicts as $conflict){echo "- {$conflict}\n";error_log('TENDIK_BACKFILL_CONFLICT '.$conflict);}
echo json_encode(['created'=>$created,'linked'=>$linked,'conflicts'=>$conflicts],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)."\n";
exit(count($conflicts)>0?2:0);
