<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function dosen_store_text(mixed $value, string $label, int $max, bool $required = false): string
{
    $text = preg_replace('/\s+/u', ' ', trim((string)$value)) ?? '';
    if ($required && $text === '') {
        throw new InvalidArgumentException("{$label} wajib diisi.");
    }
    if (mb_strlen($text) > $max) {
        throw new InvalidArgumentException("{$label} maksimal {$max} karakter.");
    }
    return $text;
}

function dosen_store_year(mixed $value, string $label = 'Tahun'): string
{
    $year = trim((string)$value);
    if (!preg_match('/^(19|20)\d{2}$/', $year)) {
        throw new InvalidArgumentException("{$label} harus berupa 4 digit tahun.");
    }
    return $year;
}

function dosen_store_academic_year(mixed $value): string
{
    $year = trim((string)$value);
    if (!preg_match('/^(19|20)(\d{2})\/(19|20)(\d{2})$/', $year, $matches)) {
        throw new InvalidArgumentException('Tahun akademik harus menggunakan format YYYY/YYYY.');
    }
    if ((int)substr($year, 5, 4) !== (int)substr($year, 0, 4) + 1) {
        throw new InvalidArgumentException('Tahun kedua pada tahun akademik harus berurutan.');
    }
    return $year;
}

function dosen_store_non_negative(mixed $value, string $label, bool $integer = false): int|float
{
    if ($value === '' || $value === null) return 0;
    if (!is_numeric($value) || (float)$value < 0) {
        throw new InvalidArgumentException("{$label} harus berupa angka nol atau lebih.");
    }
    return $integer ? (int)$value : round((float)$value, 1);
}

function dosen_store_recognitions(PDO $pdo, string $dosenId, string $bidang, mixed $items): void
{
    if (!is_array($items)) throw new InvalidArgumentException('Daftar rekognisi tidak valid.');
    $values = [];
    foreach ($items as $item) {
        $value = dosen_store_text($item, 'Rekognisi', 255);
        if ($value !== '') $values[] = $value;
    }
    $pdo->prepare('DELETE FROM dosen_rekognisi WHERE dosen_id = ? AND bidang = ?')->execute([$dosenId, $bidang]);
    $insert = $pdo->prepare('INSERT INTO dosen_rekognisi (dosen_id, bidang, deskripsi) VALUES (?, ?, ?)');
    foreach ($values as $value) $insert->execute([$dosenId, $bidang, $value]);
}

function dosen_store_pengajaran(PDO $pdo, string $dosenId, array $data): void
{
    $abtItems = $data['matkulABT'] ?? [];
    $otherItems = $data['matkulPSLain'] ?? [];
    $materials = $data['bahanAjar'] ?? [];
    if (!is_array($abtItems) || !is_array($otherItems) || !is_array($materials)) {
        throw new InvalidArgumentException('Data pengajaran tidak valid.');
    }

    $courses = [];
    foreach ([['items'=>$abtItems,'type'=>'PS_ABT'], ['items'=>$otherItems,'type'=>'PS_LAIN']] as $group) {
        foreach ($group['items'] as $item) {
            if (!is_array($item)) throw new InvalidArgumentException('Baris mata kuliah tidak valid.');
            $name = dosen_store_text($item['nama'] ?? '', 'Nama mata kuliah', 150, true);
            $code = dosen_store_text($item['kode'] ?? '', 'Kode mata kuliah', 30);
            $sks = dosen_store_non_negative($item['sks'] ?? 3, 'SKS mata kuliah', true);
            if ($sks < 1 || $sks > 6) throw new InvalidArgumentException('SKS mata kuliah harus antara 1 dan 6.');
            $prodi = null;
            if ($group['type'] === 'PS_LAIN') {
                $prodi = dosen_store_text($item['prodi'] ?? '', 'Program studi lain', 150, true);
            }
            $courses[] = ['type'=>$group['type'],'code'=>$code ?: null,'name'=>$name,'sks'=>$sks,'prodi'=>$prodi];
        }
    }

    $cleanMaterials = [];
    foreach ($materials as $material) {
        $value = dosen_store_text($material, 'Judul bahan ajar', 255, true);
        $cleanMaterials[] = $value;
    }

    $bimbingan = is_array($data['bimbingan'] ?? null) ? $data['bimbingan'] : [];
    $abt = is_array($bimbingan['psABT'] ?? null) ? $bimbingan['psABT'] : [];
    $other = is_array($bimbingan['psLain'] ?? null) ? $bimbingan['psLain'] : [];
    $counts = [
        dosen_store_non_negative($abt['ps'] ?? 0, 'Bimbingan PS ABT', true),
        dosen_store_non_negative($abt['ps1'] ?? 0, 'Bimbingan PS-1 ABT', true),
        dosen_store_non_negative($abt['ps2'] ?? 0, 'Bimbingan PS-2 ABT', true),
        dosen_store_non_negative($other['ps'] ?? 0, 'Bimbingan PS lain', true),
        dosen_store_non_negative($other['ps1'] ?? 0, 'Bimbingan PS-1 lain', true),
        dosen_store_non_negative($other['ps2'] ?? 0, 'Bimbingan PS-2 lain', true),
    ];

    $pdo->prepare('DELETE FROM dosen_pengajaran_matkul WHERE dosen_id = ?')->execute([$dosenId]);
    $insertCourse = $pdo->prepare('INSERT INTO dosen_pengajaran_matkul (id,dosen_id,tipe_ps,kode_matkul,nama_matkul,sks,prodi_lain) VALUES (?,?,?,?,?,?,?)');
    foreach ($courses as $course) {
        $insertCourse->execute([dosen_uuid(),$dosenId,$course['type'],$course['code'],$course['name'],$course['sks'],$course['prodi']]);
    }
    $pdo->prepare('DELETE FROM dosen_pengajaran_bahan_ajar WHERE dosen_id = ?')->execute([$dosenId]);
    $insertMaterial = $pdo->prepare('INSERT INTO dosen_pengajaran_bahan_ajar (dosen_id,judul_bahan_ajar) VALUES (?,?)');
    foreach ($cleanMaterials as $material) $insertMaterial->execute([$dosenId,$material]);
    $stmt = $pdo->prepare('INSERT INTO dosen_pengajaran_bimbingan (id,dosen_id,ps_abt_ps,ps_abt_ps1,ps_abt_ps2,ps_lain_ps,ps_lain_ps1,ps_lain_ps2) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE ps_abt_ps=VALUES(ps_abt_ps),ps_abt_ps1=VALUES(ps_abt_ps1),ps_abt_ps2=VALUES(ps_abt_ps2),ps_lain_ps=VALUES(ps_lain_ps),ps_lain_ps1=VALUES(ps_lain_ps1),ps_lain_ps2=VALUES(ps_lain_ps2)');
    $stmt->execute(array_merge([dosen_uuid(),$dosenId],$counts));
    dosen_store_recognitions($pdo,$dosenId,'Pengajaran',$data['rekognisi'] ?? []);
}

function dosen_store_kegiatan(PDO $pdo, string $dosenId, array $data, bool $research): void
{
    $key = $research ? 'penelitian' : 'pkm';
    $items = $data[$key] ?? [];
    if (!is_array($items)) throw new InvalidArgumentException('Daftar kegiatan tidak valid.');
    $clean = [];
    foreach ($items as $item) {
        if (!is_array($item)) throw new InvalidArgumentException('Baris kegiatan tidak valid.');
        $clean[] = [
            'title' => dosen_store_text($item[$research ? 'judul' : 'namaKegiatan'] ?? '', $research ? 'Judul penelitian' : 'Nama kegiatan PKM', 1000, true),
            'partner' => dosen_store_text($item['kerjasamaInstansi'] ?? '', 'Instansi atau mitra', 255) ?: ($research ? 'Mandiri / Internal PT' : 'Mandiri / Kelompok Masyarakat'),
            'year' => dosen_store_year($item['tahun'] ?? ''),
            'scheme' => dosen_store_text($item['skema'] ?? '', 'Skema', 100),
        ];
    }
    $table = $research ? 'dosen_penelitian' : 'dosen_pengabdian';
    $pdo->prepare("DELETE FROM {$table} WHERE dosen_id = ?")->execute([$dosenId]);
    $insert = $research
        ? $pdo->prepare('INSERT INTO dosen_penelitian (id,dosen_id,judul,kerjasama_instansi,tahun,skema) VALUES (?,?,?,?,?,?)')
        : $pdo->prepare('INSERT INTO dosen_pengabdian (id,dosen_id,nama_kegiatan,kerjasama_instansi,tahun,skema) VALUES (?,?,?,?,?,?)');
    foreach ($clean as $item) $insert->execute([dosen_uuid(),$dosenId,$item['title'],$item['partner'],$item['year'],$item['scheme'] ?: null]);
    dosen_store_recognitions($pdo,$dosenId,$research ? 'Penelitian' : 'Pengabdian',$data['rekognisi'] ?? []);
}

function dosen_store_luaran(PDO $pdo, string $dosenId, array $data): void
{
    $funding = ['Perguruan Tinggi / Mandiri','Lembaga Dalam Negeri (di luar Perguruan Tinggi)','Lembaga Luar Negeri'];
    $publication = ['Jurnal Nasional Tidak Terakreditasi','Jurnal Nasional Terakreditasi','Jurnal Internasional','Jurnal Internasional Bereputasi','Seminar Wilayah, Lokal, Perguruan Tinggi','Seminar Nasional','Seminar Internasional','Tulisan di Media Massa Nasional','Tulisan di Media Massa Internasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional'];
    $items = $data['luaran'] ?? [];
    if (!is_array($items)) throw new InvalidArgumentException('Daftar luaran tidak valid.');
    $clean = [];
    foreach ($items as $item) {
        if (!is_array($item)) throw new InvalidArgumentException('Baris luaran tidak valid.');
        $category = ($item['kategori'] ?? '') === 'PKM' ? 'PKM' : 'Penelitian';
        $source = (string)($item['sumberPendanaan'] ?? '');
        $type = (string)($item['jenisPublikasi'] ?? '');
        if (!in_array($source,$funding,true)) throw new InvalidArgumentException('Sumber pendanaan tidak valid.');
        if (!in_array($type,$publication,true)) throw new InvalidArgumentException('Jenis publikasi tidak valid.');
        $clean[] = [
            'category'=>$category,
            'title'=>dosen_store_text($item['judul'] ?? '', 'Judul luaran', 1000, true),
            'year'=>dosen_store_year($item['tahun'] ?? ''),
            'source'=>$source,
            'type'=>$type,
            'url'=>dosen_store_text($item['urlLuaran'] ?? '', 'URL luaran', 255) ?: null,
        ];
    }
    $pdo->prepare('DELETE FROM dosen_luaran_penelitian_pkm WHERE dosen_id = ?')->execute([$dosenId]);
    $insert = $pdo->prepare('INSERT INTO dosen_luaran_penelitian_pkm (id,dosen_id,kategori,judul_luaran,tahun,sumber_pendanaan,jenis_publikasi,url_luaran) VALUES (?,?,?,?,?,?,?,?)');
    foreach ($clean as $item) $insert->execute([dosen_uuid(),$dosenId,$item['category'],$item['title'],$item['year'],$item['source'],$item['type'],$item['url']]);
}

function dosen_store_waktu_mengajar(PDO $pdo, string $dosenId, array $data): string
{
    $year = dosen_store_academic_year($data['tahunAkademik'] ?? '');
    $values = [
        dosen_store_non_negative($data['sksPendidikanPS'] ?? 0,'SKS pendidikan PS ABT'),
        dosen_store_non_negative($data['sksPendidikanPSLain'] ?? 0,'SKS pendidikan PS lain'),
        dosen_store_non_negative($data['sksPendidikanPTLain'] ?? 0,'SKS pendidikan PT lain'),
        dosen_store_non_negative($data['sksPenelitian'] ?? 0,'SKS penelitian'),
        dosen_store_non_negative($data['sksPengabdian'] ?? 0,'SKS pengabdian'),
        dosen_store_non_negative($data['sksTugasTambahan'] ?? 0,'SKS tugas tambahan'),
    ];
    $stmt = $pdo->prepare('INSERT INTO dosen_waktu_mengajar (id,dosen_id,tahun_akademik,pendidikan_ps_abt,pendidikan_ps_lain,pendidikan_pt_lain,penelitian,pkm,tugas_tambahan) VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE pendidikan_ps_abt=VALUES(pendidikan_ps_abt),pendidikan_ps_lain=VALUES(pendidikan_ps_lain),pendidikan_pt_lain=VALUES(pendidikan_pt_lain),penelitian=VALUES(penelitian),pkm=VALUES(pkm),tugas_tambahan=VALUES(tugas_tambahan)');
    $stmt->execute(array_merge([dosen_uuid(),$dosenId,$year],$values));
    return $year;
}

function dosen_delete_waktu_mengajar(PDO $pdo, string $dosenId, string $year): void
{
    $year = dosen_store_academic_year($year);
    $stmt = $pdo->prepare('DELETE FROM dosen_waktu_mengajar WHERE dosen_id = ? AND tahun_akademik = ?');
    $stmt->execute([$dosenId,$year]);
    if ($stmt->rowCount() === 0) throw new RuntimeException('Data EWMP tidak ditemukan.');
}

function dosen_self_data(PDO $pdo, array $dosen): array
{
    $id = (string)$dosen['id'];
    $nidn = (string)$dosen['nidn'];
    $nama = (string)$dosen['nama'];
    $avatar = (string)($dosen['avatar_color'] ?? 'from-blue-600 to-indigo-600');

    $stmt = $pdo->prepare('SELECT * FROM dosen_pengajaran_matkul WHERE dosen_id=? ORDER BY id'); $stmt->execute([$id]);
    $abt=[]; $other=[];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $item=['id'=>(string)$row['id'],'kode'=>(string)($row['kode_matkul']??''),'nama'=>(string)$row['nama_matkul'],'sks'=>(int)$row['sks']];
        if ($row['tipe_ps']==='PS_LAIN') { $item['prodi']=(string)($row['prodi_lain']??''); $other[]=$item; } else $abt[]=$item;
    }
    $stmt=$pdo->prepare('SELECT judul_bahan_ajar FROM dosen_pengajaran_bahan_ajar WHERE dosen_id=? ORDER BY id'); $stmt->execute([$id]);
    $materials=array_map(static fn(array $r):string=>(string)$r['judul_bahan_ajar'],$stmt->fetchAll(PDO::FETCH_ASSOC));
    $stmt=$pdo->prepare('SELECT * FROM dosen_pengajaran_bimbingan WHERE dosen_id=? LIMIT 1'); $stmt->execute([$id]); $b=$stmt->fetch(PDO::FETCH_ASSOC)?:[];
    $stmt=$pdo->prepare('SELECT bidang,deskripsi FROM dosen_rekognisi WHERE dosen_id=? ORDER BY id'); $stmt->execute([$id]);
    $rec=['Pengajaran'=>[],'Penelitian'=>[],'Pengabdian'=>[]]; foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) if(isset($rec[$r['bidang']])) $rec[$r['bidang']][]=(string)$r['deskripsi'];

    $stmt=$pdo->prepare('SELECT * FROM dosen_penelitian WHERE dosen_id=? ORDER BY tahun DESC,id'); $stmt->execute([$id]);
    $research=array_map(static fn(array $r):array=>['id'=>(string)$r['id'],'judul'=>(string)$r['judul'],'kerjasamaInstansi'=>(string)$r['kerjasama_instansi'],'tahun'=>(string)$r['tahun'],'skema'=>(string)($r['skema']??'')],$stmt->fetchAll(PDO::FETCH_ASSOC));
    $stmt=$pdo->prepare('SELECT * FROM dosen_pengabdian WHERE dosen_id=? ORDER BY tahun DESC,id'); $stmt->execute([$id]);
    $service=array_map(static fn(array $r):array=>['id'=>(string)$r['id'],'namaKegiatan'=>(string)$r['nama_kegiatan'],'kerjasamaInstansi'=>(string)$r['kerjasama_instansi'],'tahun'=>(string)$r['tahun'],'skema'=>(string)($r['skema']??'')],$stmt->fetchAll(PDO::FETCH_ASSOC));
    $stmt=$pdo->prepare('SELECT * FROM dosen_waktu_mengajar WHERE dosen_id=? ORDER BY tahun_akademik DESC'); $stmt->execute([$id]);
    $ewmp=array_map(static fn(array $r):array=>['nidn'=>$nidn,'nama'=>$nama,'tahunAkademik'=>(string)$r['tahun_akademik'],'sksPendidikanPS'=>(float)$r['pendidikan_ps_abt'],'sksPendidikanPSLain'=>(float)$r['pendidikan_ps_lain'],'sksPendidikanPTLain'=>(float)$r['pendidikan_pt_lain'],'sksPenelitian'=>(float)$r['penelitian'],'sksPengabdian'=>(float)$r['pkm'],'sksTugasTambahan'=>(float)$r['tugas_tambahan']],$stmt->fetchAll(PDO::FETCH_ASSOC));
    $stmt=$pdo->prepare('SELECT * FROM dosen_luaran_penelitian_pkm WHERE dosen_id=? ORDER BY tahun DESC,id'); $stmt->execute([$id]);
    $outputs=array_map(static fn(array $r):array=>['id'=>(string)$r['id'],'kategori'=>(string)$r['kategori'],'judul'=>(string)$r['judul_luaran'],'tahun'=>(string)$r['tahun'],'sumberPendanaan'=>(string)$r['sumber_pendanaan'],'jenisPublikasi'=>(string)$r['jenis_publikasi'],'urlLuaran'=>(string)($r['url_luaran']??'')],$stmt->fetchAll(PDO::FETCH_ASSOC));

    $teaching=['nidn'=>$nidn,'nama'=>$nama,'avatarColor'=>$avatar,'matkulABT'=>$abt,'matkulPSLain'=>$other,'bahanAjar'=>$materials,'bimbingan'=>['psABT'=>['ps'=>(int)($b['ps_abt_ps']??0),'ps1'=>(int)($b['ps_abt_ps1']??0),'ps2'=>(int)($b['ps_abt_ps2']??0)],'psLain'=>['ps'=>(int)($b['ps_lain_ps']??0),'ps1'=>(int)($b['ps_lain_ps1']??0),'ps2'=>(int)($b['ps_lain_ps2']??0)]],'rataBimbingan'=>0,'rekognisi'=>$rec['Pengajaran']];
    $sum=array_sum(array_values($teaching['bimbingan']['psABT']))+array_sum(array_values($teaching['bimbingan']['psLain'])); $teaching['rataBimbingan']=$sum>0?round($sum/3,1):0;
    return ['profile'=>dosen_profile_from_row($dosen),'pengajaran'=>$teaching,'penelitian'=>['nidn'=>$nidn,'nama'=>$nama,'avatarColor'=>$avatar,'penelitian'=>$research,'rekognisi'=>$rec['Penelitian']],'pengabdian'=>['nidn'=>$nidn,'nama'=>$nama,'avatarColor'=>$avatar,'pkm'=>$service,'rekognisi'=>$rec['Pengabdian']],'waktuMengajar'=>$ewmp,'luaran'=>['nidn'=>$nidn,'nama'=>$nama,'avatarColor'=>$avatar,'luaran'=>$outputs]];
}
