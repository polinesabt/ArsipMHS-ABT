<?php
declare(strict_types=1);

require_once __DIR__ . '/../../../config/cors.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(200); exit; }
require_once __DIR__ . '/../store_helper.php';
require_once __DIR__ . '/../../tendik/bootstrap.php';
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/definitions.php';
header('Content-Type: application/json; charset=utf-8');

function import_year(string $value, string $label): string
{
    if (!preg_match('/^(19|20)\d{2}$/', $value)) throw new InvalidArgumentException("{$label} harus berupa empat digit tahun.");
    return $value;
}

function import_sks(string $value, string $label): float
{
    if ($value === '') return 0.0;
    $normalized = str_replace(',', '.', $value);
    if (!is_numeric($normalized) || (float)$normalized < 0) throw new InvalidArgumentException("{$label} harus berupa angka nol atau lebih.");
    return (float)$normalized;
}

function import_dosen_identity(PDO $pdo, array $row): array
{
    $nidn = trim((string)($row['nidn'] ?? ''));
    $nama = trim((string)($row['nama'] ?? ''));
    if ($nidn === '') throw new InvalidArgumentException('NIDN/NIDK wajib diisi.');
    $dosen = dosen_find_by_nidn($pdo, $nidn);
    if (!$dosen) throw new InvalidArgumentException('NIDN/NIDK tidak ditemukan pada data dosen aktif.');
    if ($nama === '' || dosen_normalize_text($nama) !== dosen_normalize_text((string)$dosen['nama'])) {
        throw new InvalidArgumentException('Nama dosen tidak cocok dengan NIDN/NIDK aktif.');
    }
    return $dosen;
}

function import_duplicate(PDO $pdo, string $sql, array $params): bool
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return (int)$stmt->fetchColumn() > 0;
}

function import_insert_recognition(PDO $pdo, string $dosenId, string $bidang, string $value): bool
{
    $value = trim($value);
    if ($value === '') return false;
    if (import_duplicate($pdo,'SELECT COUNT(*) FROM dosen_rekognisi WHERE dosen_id=? AND bidang=? AND LOWER(TRIM(deskripsi))=LOWER(TRIM(?))',[$dosenId,$bidang,$value])) return false;
    $pdo->prepare('INSERT INTO dosen_rekognisi (dosen_id,bidang,deskripsi) VALUES (?,?,?)')->execute([$dosenId,$bidang,$value]);
    return true;
}

function import_process_row(PDO $pdo, string $module, array $row): array
{
    if ($module === 'pengelolaan') {
        $nidn=trim((string)$row['nidn']);
        if ($nidn==='' || trim((string)$row['nama'])==='') throw new InvalidArgumentException('Nama dan NIDN/NIDK wajib diisi.');
        if (dosen_find_by_nidn($pdo,$nidn,true)) return ['skipped','NIDN/NIDK sudah terdaftar dan tidak ditimpa.',$nidn];
        $qualifications=[];
        $qualificationMap=['s2'=>'Magister (S2)','s3'=>'Doktor (S3)','s2_terapan'=>'Magister Terapan (S2 Terapan)','s3_terapan'=>'Doktor Terapan (S3 Terapan)','sp1'=>'Spesialis (Sp-1)'];
        foreach ($qualificationMap as $key=>$label) {
            $value=mb_strtolower(trim((string)($row[$key]??'')));
            if ($value!=='' && !in_array($value,['ya','tidak'],true)) throw new InvalidArgumentException("Nilai {$label} harus Ya atau Tidak.");
            if ($value==='ya') $qualifications[]=$label;
        }
        $profile=dosen_validate_profile(['nidn'=>$nidn,'nama'=>$row['nama'],'statusDosen'=>$row['status'],'jabatan'=>$row['jabatan'],'institusi'=>$row['institusi'],'pendidikanPascaSarjana'=>$qualifications,'bidangKeahlian'=>$row['bidang'],'sertifikatPendidik'=>$row['serdos'],'sertifikatKompetensi'=>$row['sertifikat']]);
        $id=dosen_uuid();
        $stmt=$pdo->prepare('INSERT INTO dosen (id,nidn,nama,status_dosen,jabatan,peran,institusi,pendidikan_pasca_sarjana,bidang_keahlian,sertifikat_pendidik,sertifikat_kompetensi) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$id,$profile['nidn'],$profile['nama'],$profile['status_dosen'],$profile['jabatan'],'Akademisi',$profile['institusi'],$profile['pendidikan_pasca_sarjana'],$profile['bidang_keahlian'],$profile['sertifikat_pendidik'],$profile['sertifikat_kompetensi']]);
        dosen_create_account($pdo,$id,$profile['nidn'],$profile['nama']);
        return ['inserted','Dosen dan akun login berhasil dibuat.',$nidn];
    }

    if ($module === 'tendik') {
        $nip=trim((string)$row['nip']);
        $nama=trim((string)$row['nama']);
        if ($nip==='' || $nama==='') throw new InvalidArgumentException('Nama Tendik dan NIP/NIDN wajib diisi.');
        if (!in_array($row['status'],['Tetap','Tidak Tetap'],true)) throw new InvalidArgumentException('Status harus Tetap atau Tidak Tetap.');
        if (import_duplicate($pdo,'SELECT COUNT(*) FROM tenaga_kependidikan WHERE nip=?',[$nip])) return ['skipped','NIP/NIDN tendik sudah terdaftar dan tidak ditimpa.',$nip];
        $education=['d3'=>[],'s1'=>[],'s2'=>[],'s3'=>[]];
        foreach (dosen_import_split_list((string)$row['pendidikan']) as $item) {
            $key=preg_match('/^D3\b/i',$item)?'d3':(preg_match('/^(S1|D4)\b/i',$item)?'s1':(preg_match('/^S2\b/i',$item)?'s2':(preg_match('/^S3\b/i',$item)?'s3':'s1')));
            $education[$key][]=$item;
        }
        $id=dosen_uuid();
        $stmt=$pdo->prepare('INSERT INTO tenaga_kependidikan (id,nip,nama,status,jabatan,golongan,pendidikan_d3,pendidikan_s1,pendidikan_s2,pendidikan_s3,sertifikat_kompetensi) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$id,$nip,$nama,$row['status'],trim((string)$row['jabatan']),trim((string)$row['golongan'])?:null,implode('; ',$education['d3'])?:'-',implode('; ',$education['s1'])?:'-',implode('; ',$education['s2'])?:'-',implode('; ',$education['s3'])?:'-',json_encode(dosen_import_split_list((string)$row['sertifikat']),JSON_UNESCAPED_UNICODE)]);
        tendik_create_account($pdo,$id,$nip,$nama);
        return ['inserted','Tenaga kependidikan dan akun login berhasil ditambahkan.',$nip];
    }

    $dosen=import_dosen_identity($pdo,$row);
    $dosenId=(string)$dosen['id'];
    $nidn=(string)$dosen['nidn'];
    $inserted=0;

    if ($module === 'pengajaran') {
        foreach ([['matkul_abt','PS_ABT'],['matkul_lain','PS_LAIN']] as [$key,$type]) {
            $name=trim((string)$row[$key]);
            if ($name!=='' && !import_duplicate($pdo,'SELECT COUNT(*) FROM dosen_pengajaran_matkul WHERE dosen_id=? AND tipe_ps=? AND LOWER(TRIM(nama_matkul))=LOWER(TRIM(?))',[$dosenId,$type,$name])) {
                $pdo->prepare('INSERT INTO dosen_pengajaran_matkul (id,dosen_id,tipe_ps,nama_matkul,sks,prodi_lain) VALUES (?,?,?,?,3,?)')->execute([dosen_uuid(),$dosenId,$type,$name,$type==='PS_LAIN'?'Prodi Lain':null]);
                $inserted++;
            }
        }
        $book=trim((string)$row['bahan_ajar']);
        if ($book!=='' && !import_duplicate($pdo,'SELECT COUNT(*) FROM dosen_pengajaran_bahan_ajar WHERE dosen_id=? AND LOWER(TRIM(judul_bahan_ajar))=LOWER(TRIM(?))',[$dosenId,$book])) {
            $pdo->prepare('INSERT INTO dosen_pengajaran_bahan_ajar (dosen_id,judul_bahan_ajar) VALUES (?,?)')->execute([$dosenId,$book]);
            $inserted++;
        }
        $guidanceKeys=['abt_ps1','abt_ps2','lain_ps1','lain_ps2'];
        $hasGuidance=false;
        foreach ($guidanceKeys as $key) if (trim((string)$row[$key])!=='') $hasGuidance=true;
        if ($hasGuidance) {
            $values=[];
            foreach ($guidanceKeys as $key) {
                $raw=trim((string)$row[$key]);
                if ($raw!=='' && (!ctype_digit($raw) || (int)$raw<0)) throw new InvalidArgumentException('Nilai bimbingan harus berupa bilangan bulat nol atau lebih.');
                $values[$key]=$raw===''?0:(int)$raw;
            }
            $existing=$pdo->prepare('SELECT * FROM dosen_pengajaran_bimbingan WHERE dosen_id=? LIMIT 1');
            $existing->execute([$dosenId]);
            $current=$existing->fetch(PDO::FETCH_ASSOC);
            if (!$current || ((int)$current['ps_abt_ps1']===0 && (int)$current['ps_abt_ps2']===0 && (int)$current['ps_lain_ps1']===0 && (int)$current['ps_lain_ps2']===0)) {
                $pdo->prepare('INSERT INTO dosen_pengajaran_bimbingan (id,dosen_id,ps_abt_ps1,ps_abt_ps2,ps_lain_ps1,ps_lain_ps2) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ps_abt_ps1=VALUES(ps_abt_ps1),ps_abt_ps2=VALUES(ps_abt_ps2),ps_lain_ps1=VALUES(ps_lain_ps1),ps_lain_ps2=VALUES(ps_lain_ps2)')->execute([dosen_uuid(),$dosenId,$values['abt_ps1'],$values['abt_ps2'],$values['lain_ps1'],$values['lain_ps2']]);
                $inserted++;
            }
        }
        foreach (dosen_import_split_list((string)$row['rekognisi']) as $recognition) if (import_insert_recognition($pdo,$dosenId,'Pengajaran',$recognition)) $inserted++;
    } elseif ($module === 'penelitian' || $module === 'pengabdian') {
        $title=trim((string)$row['judul']);
        $year=trim((string)$row['tahun']);
        if ($title!=='') {
            import_year($year,'Tahun');
            $table=$module==='penelitian'?'dosen_penelitian':'dosen_pengabdian';
            $titleColumn=$module==='penelitian'?'judul':'nama_kegiatan';
            if (!import_duplicate($pdo,"SELECT COUNT(*) FROM {$table} WHERE dosen_id=? AND LOWER(TRIM({$titleColumn}))=LOWER(TRIM(?)) AND tahun=?",[$dosenId,$title,$year])) {
                $sql=$module==='penelitian'?'INSERT INTO dosen_penelitian (id,dosen_id,judul,kerjasama_instansi,tahun,skema) VALUES (?,?,?,?,?,?)':'INSERT INTO dosen_pengabdian (id,dosen_id,nama_kegiatan,kerjasama_instansi,tahun,skema) VALUES (?,?,?,?,?,?)';
                $pdo->prepare($sql)->execute([dosen_uuid(),$dosenId,$title,trim((string)$row['kerjasama'])?:($module==='penelitian'?'Mandiri / Internal PT':'Mandiri / Kelompok Masyarakat'),$year,trim((string)$row['skema'])?:null]);
                $inserted++;
            }
        }
        $recognition=trim((string)$row['rekognisi']);
        if ($recognition!=='' && import_insert_recognition($pdo,$dosenId,$module==='penelitian'?'Penelitian':'Pengabdian',$recognition)) $inserted++;
    } elseif ($module === 'waktu_mengajar') {
        $academicYear=dosen_store_academic_year($row['tahun_akademik']);
        if (import_duplicate($pdo,'SELECT COUNT(*) FROM dosen_waktu_mengajar WHERE dosen_id=? AND tahun_akademik=?',[$dosenId,$academicYear])) return ['skipped','Data waktu mengajar untuk tahun akademik tersebut sudah ada.',$nidn];
        $pdo->prepare('INSERT INTO dosen_waktu_mengajar (id,dosen_id,tahun_akademik,pendidikan_ps_abt,pendidikan_ps_lain,pendidikan_pt_lain,penelitian,pkm,tugas_tambahan) VALUES (?,?,?,?,?,?,?,?,?)')->execute([dosen_uuid(),$dosenId,$academicYear,import_sks($row['pt_abt'],'PT ABT'),import_sks($row['ps_lain'],'PS Lain'),import_sks($row['pt_lain'],'PT Lain'),import_sks($row['penelitian'],'Penelitian'),import_sks($row['pkm'],'PKM'),import_sks($row['tugas'],'Tugas Tambahan')]);
        $inserted++;
    } elseif ($module === 'luaran') {
        $category=trim((string)$row['kategori']);
        $title=trim((string)$row['judul']);
        $year=import_year(trim((string)$row['tahun']),'Tahun');
        $funding=['Perguruan Tinggi / Mandiri','Lembaga Dalam Negeri (di luar Perguruan Tinggi)','Lembaga Luar Negeri'];
        $publications=dosen_import_definition('luaran')['columns'][7]['options'];
        if (!in_array($category,['Penelitian','PKM'],true)) throw new InvalidArgumentException('Kategori harus Penelitian atau PKM.');
        if ($title==='') throw new InvalidArgumentException('Judul Luaran/Publikasi wajib diisi.');
        if (!in_array($row['pendanaan'],$funding,true)) throw new InvalidArgumentException('Sumber Pendanaan tidak valid.');
        if (!in_array($row['jenis'],$publications,true)) throw new InvalidArgumentException('Jenis Publikasi tidak valid.');
        if (import_duplicate($pdo,'SELECT COUNT(*) FROM dosen_luaran_penelitian_pkm WHERE dosen_id=? AND kategori=? AND LOWER(TRIM(judul_luaran))=LOWER(TRIM(?)) AND tahun=?',[$dosenId,$category,$title,$year])) return ['skipped','Luaran yang sama sudah terdaftar.',$nidn];
        $pdo->prepare('INSERT INTO dosen_luaran_penelitian_pkm (id,dosen_id,kategori,judul_luaran,tahun,sumber_pendanaan,jenis_publikasi) VALUES (?,?,?,?,?,?,?)')->execute([dosen_uuid(),$dosenId,$category,$title,$year,$row['pendanaan'],$row['jenis']]);
        $inserted++;
    }

    return $inserted>0?['inserted',"{$inserted} item baru berhasil ditambahkan.",$nidn]:['skipped','Semua data pada baris sudah ada atau kosong.',$nidn];
}

 $logId = null;
try {
    $auth=requireAuth('admin');
    requireProductionWrite($auth);
    dosen_import_require_spreadsheet();
    $module=trim((string)($_POST['module']??''));
    $definition=dosen_import_definition($module);
    if (!$definition) throw new InvalidArgumentException('Modul impor tidak valid.');
    if (!isset($_FILES['file']) || $_FILES['file']['error']!==UPLOAD_ERR_OK) throw new InvalidArgumentException('File Excel wajib diunggah.');
    $file=$_FILES['file'];
    $name=(string)($file['name']??'');
    if (!str_ends_with(mb_strtolower($name),'.xlsx')) throw new InvalidArgumentException('Hanya file .xlsx yang didukung.');
    if ((int)$file['size']<=0 || (int)$file['size']>10*1024*1024) throw new InvalidArgumentException('Ukuran file harus lebih dari 0 dan maksimal 10 MB.');
    $reader=new \PhpOffice\PhpSpreadsheet\Reader\Xlsx();
    $reader->setReadDataOnly(true);
    $book=$reader->load($file['tmp_name']);
    $meta=$book->getSheetByName('_meta');
    $version = trim((string)($meta ? $meta->getCell('B1')->getValue() : ''));
    if (!$meta || !in_array($version, ['1.0', '1'], true) || trim((string)$meta->getCell('B2')->getValue())!==$module) throw new InvalidArgumentException('Template tidak sesuai modul atau versinya sudah tidak didukung.');
    $sheet=$book->getSheet(0);
    $columns=$definition['columns'];
    foreach ($columns as $index=>$column) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($index + 1);
        $headerRow = empty($column['group']) ? 8 : 9;
        $actual = trim((string)$sheet->getCell("{$colLetter}{$headerRow}")->getValue());
        if ($actual!==$column['label']) throw new InvalidArgumentException('Header template berubah pada kolom '.$column['label'].'. Unduh template terbaru.');
    }
    $logId=dosen_uuid();
    $pdo->prepare('INSERT INTO dosen_import_logs (id,module,uploaded_by,file_name,status) VALUES (?,?,?,?,?)')->execute([$logId,$module,(string)$auth['sub'],$name,'processing']);
    $summary=['module'=>$module,'total_rows'=>0,'inserted'=>0,'skipped'=>0,'failed'=>0,'affected_dosen'=>0,'details'=>[]];
    $affected=[];
    for ($rowNumber=10;$rowNumber<=$sheet->getHighestDataRow();$rowNumber++) {
        $row=[];
        foreach ($columns as $index=>$column) $row[$column['key']]=dosen_import_cell_text($sheet,$index+1,$rowNumber);
        $payloadKeys=array_column($columns,'key');
        $payloadKeys=array_values(array_diff($payloadKeys,['no','nama','nidn']));
        $hasPayload=$module==='pengelolaan'||$module==='tendik';
        foreach ($payloadKeys as $key) if (($row[$key]??'')!=='') $hasPayload=true;
        if (!$hasPayload) continue;
        $summary['total_rows']++;
        $pdo->beginTransaction();
        try {
            [$status,$message,$identity]=import_process_row($pdo,$module,$row);
            $pdo->commit();
            $summary[$status]++;
            if ($status==='inserted' && $identity) $affected[$identity]=true;
        } catch (Throwable $rowError) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            $status='error'; $identity=$row['nidn']??$row['nip']??null; $message=$rowError->getMessage();
            $summary['failed']++;
        }
        dosen_import_log_detail($pdo,$logId,$rowNumber,$identity,$status,$message,$row);
        $summary['details'][]=['row'=>$rowNumber,'identity'=>$identity,'status'=>$status,'message'=>$message];
    }
    $summary['affected_dosen']=count($affected);
    $status=$summary['failed']>0?'completed_with_errors':'completed';
    $pdo->prepare('UPDATE dosen_import_logs SET total_rows=?,success_rows=?,skipped_rows=?,failed_rows=?,affected_dosen=?,status=?,finished_at=NOW() WHERE id=?')->execute([$summary['total_rows'],$summary['inserted'],$summary['skipped'],$summary['failed'],$summary['affected_dosen'],$status,$logId]);
    $summary['import_log_id']=$logId;
    dosen_json_response(200,['success'=>true,'data'=>$summary,'message'=>'Impor Excel selesai diproses.']);
} catch (InvalidArgumentException $error) {
    if ($logId && $pdo->inTransaction()) $pdo->rollBack();
    if ($logId) { try { $pdo->prepare("UPDATE dosen_import_logs SET status='failed', finished_at=NOW() WHERE id=?")->execute([$logId]); } catch (Throwable $ignore) {} }
    dosen_json_response(422,['success'=>false,'error'=>$error->getMessage()]);
} catch (Throwable $error) {
    if ($logId && $pdo->inTransaction()) $pdo->rollBack();
    if ($logId) { try { $pdo->prepare("UPDATE dosen_import_logs SET status='failed', finished_at=NOW() WHERE id=?")->execute([$logId]); } catch (Throwable $ignore) {} }
    dosen_json_response(500,['success'=>false,'error'=>'Impor gagal: '.$error->getMessage()]);
}
