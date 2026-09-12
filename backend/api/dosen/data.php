<?php
/**
 * Dosen & Tendik Complete SSOT Data Endpoint
 * Returns all active Dosen and Tendik records along with their Tridharma & Luaran sub-modules.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    requireAuth('admin');
    // 1. Fetch All Active Dosen (Master)
    $stmtDosen = $pdo->query("SELECT * FROM `dosen` WHERE `deleted_at` IS NULL ORDER BY `nama` ASC");
    $rawDosen = $stmtDosen->fetchAll();

    // 2. Fetch Matkul Pengajaran
    $stmtMatkul = $pdo->query("SELECT * FROM `dosen_pengajaran_matkul` ORDER BY `id` ASC");
    $rawMatkul = $stmtMatkul->fetchAll();
    $matkulByDosen = [];
    foreach ($rawMatkul as $m) {
        $matkulByDosen[$m['dosen_id']][] = $m;
    }

    // 3. Fetch Bimbingan
    $stmtBimbingan = $pdo->query("SELECT * FROM `dosen_pengajaran_bimbingan`");
    $rawBimbingan = $stmtBimbingan->fetchAll();
    $bimbinganByDosen = [];
    foreach ($rawBimbingan as $b) {
        $bimbinganByDosen[$b['dosen_id']] = $b;
    }

    // 4. Fetch Bahan Ajar
    $stmtBahanAjar = $pdo->query("SELECT * FROM `dosen_pengajaran_bahan_ajar` ORDER BY `id` ASC");
    $rawBahanAjar = $stmtBahanAjar->fetchAll();
    $bahanAjarByDosen = [];
    foreach ($rawBahanAjar as $ba) {
        $bahanAjarByDosen[$ba['dosen_id']][] = $ba['judul_bahan_ajar'];
    }

    // 5. Fetch Rekognisi
    $stmtRekognisi = $pdo->query("SELECT * FROM `dosen_rekognisi` ORDER BY `id` ASC");
    $rawRekognisi = $stmtRekognisi->fetchAll();
    $rekognisiByDosen = [];
    foreach ($rawRekognisi as $r) {
        $rekognisiByDosen[$r['dosen_id']][$r['bidang']][] = $r['deskripsi'];
    }

    // 6. Fetch Penelitian
    $stmtPenelitian = $pdo->query("SELECT * FROM `dosen_penelitian` ORDER BY `tahun` DESC, `id` ASC");
    $rawPenelitian = $stmtPenelitian->fetchAll();
    $penelitianByDosen = [];
    foreach ($rawPenelitian as $p) {
        $penelitianByDosen[$p['dosen_id']][] = [
            'id' => (string)$p['id'],
            'judul' => $p['judul'],
            'kerjasamaInstansi' => $p['kerjasama_instansi'] ?? 'Mandiri / Internal PT',
            'tahun' => (string)($p['tahun'] ?? ''),
            'skema' => $p['skema'] ?? ''
        ];
    }

    // 7. Fetch Pengabdian
    $stmtPengabdian = $pdo->query("SELECT * FROM `dosen_pengabdian` ORDER BY `tahun` DESC, `id` ASC");
    $rawPengabdian = $stmtPengabdian->fetchAll();
    $pengabdianByDosen = [];
    foreach ($rawPengabdian as $pg) {
        $pengabdianByDosen[$pg['dosen_id']][] = [
            'id' => (string)$pg['id'],
            'namaKegiatan' => $pg['nama_kegiatan'],
            'kerjasamaInstansi' => $pg['kerjasama_instansi'] ?? 'Mandiri / Kelompok Masyarakat',
            'tahun' => (string)($pg['tahun'] ?? ''),
            'skema' => $pg['skema'] ?? ''
        ];
    }

    // 8. Fetch Waktu Mengajar (EWMP)
    $stmtEWMP = $pdo->query("SELECT * FROM `dosen_waktu_mengajar`");
    $rawEWMP = $stmtEWMP->fetchAll();
    $ewmpByDosen = [];
    foreach ($rawEWMP as $e) {
        $ewmpByDosen[$e['dosen_id']][] = $e;
    }

    // 9. Fetch Luaran Penelitian & PKM
    $stmtLuaran = $pdo->query("SELECT * FROM `dosen_luaran_penelitian_pkm` ORDER BY `tahun` DESC, `id` ASC");
    $rawLuaran = $stmtLuaran->fetchAll();
    $luaranByDosen = [];
    foreach ($rawLuaran as $l) {
        $luaranByDosen[$l['dosen_id']][] = [
            'id' => (string)$l['id'],
            'kategori' => $l['kategori'],
            'judul' => $l['judul_luaran'],
            'tahun' => (string)$l['tahun'],
            'sumberPendanaan' => $l['sumber_pendanaan'],
            'jenisPublikasi' => $l['jenis_publikasi'],
            'urlLuaran' => $l['url_luaran'] ?? ''
        ];
    }

    // 10. Fetch Tenaga Kependidikan
    $stmtTendik = $pdo->query("SELECT * FROM `tenaga_kependidikan` WHERE `deleted_at` IS NULL ORDER BY `nama` ASC");
    $rawTendik = $stmtTendik->fetchAll();

    $stmtArchives = $pdo->query("SELECT id, nidn, nama, payload_json, deleted_at, expires_at FROM `dosen_archives` WHERE expires_at > NOW() ORDER BY deleted_at DESC");
    $rawArchives = $stmtArchives->fetchAll();
    $archivedDosenList = [];
    foreach ($rawArchives as $archive) {
        $payload = json_decode((string)$archive['payload_json'], true);
        if (!is_array($payload)) $payload = [];
        $archivedDosenList[] = [
            'id' => (string)$archive['id'],
            'dosen' => $payload,
            'deletedAt' => (string)$archive['deleted_at'],
            'expiresAt' => (string)$archive['expires_at'],
        ];
    }

    // --- TRANSFORM & MAP TO FRONTEND FORMATS ---

    $dosenList = [];
    $kontribusiPengajaranList = [];
    $kontribusiPenelitianList = [];
    $kontribusiPengabdianList = [];
    $waktuMengajarList = [];
    $luaranList = [];

    foreach ($rawDosen as $d) {
        $dId = $d['id'];
        $nidn = $d['nidn'];
        $nama = $d['nama'];
        $avatarColor = $d['avatar_color'] ?? 'from-blue-600 to-indigo-600';

        // Decode JSON array fields
        $pascaSarjana = [];
        if (!empty($d['pendidikan_pasca_sarjana'])) {
            $decoded = json_decode($d['pendidikan_pasca_sarjana'], true);
            if (is_array($decoded)) {
                $pascaSarjana = $decoded;
            }
        }

        // 1. Dosen Master Item
        $dosenList[] = [
            'nidn' => $nidn,
            'nama' => $nama,
            'statusDosen' => $d['status_dosen'],
            'jabatan' => $d['jabatan'],
            'peran' => $d['peran'],
            'institusi' => $d['institusi'],
            'pendidikanPascaSarjana' => $pascaSarjana,
            'bidangKeahlian' => $d['bidang_keahlian'] ?? '',
            'sertifikatPendidik' => $d['sertifikat_pendidik'] ?? '-',
            'sertifikatKompetensi' => $d['sertifikat_kompetensi'] ?? '',
            'email' => $d['email'] ?? '',
            'telepon' => $d['telepon'] ?? '',
            'pengajaran' => count($matkulByDosen[$dId] ?? []),
            'penelitian' => count($penelitianByDosen[$dId] ?? []),
            'pengabdian' => count($pengabdianByDosen[$dId] ?? [])
        ];

        // 2. Kontribusi Pengajaran Item
        $matkulList = $matkulByDosen[$dId] ?? [];
        $matkulABT = [];
        $matkulPSLain = [];
        foreach ($matkulList as $m) {
            if ($m['tipe_ps'] === 'PS_ABT') {
                $matkulABT[] = [
                    'id' => (string)$m['id'],
                    'kode' => $m['kode_matkul'] ?? '',
                    'nama' => $m['nama_matkul'],
                    'sks' => (int)($m['sks'] ?? 3)
                ];
            } else {
                $matkulPSLain[] = [
                    'id' => (string)$m['id'],
                    'kode' => $m['kode_matkul'] ?? '',
                    'nama' => $m['nama_matkul'],
                    'prodi' => $m['prodi_lain'] ?? 'Prodi Lain',
                    'sks' => (int)($m['sks'] ?? 3)
                ];
            }
        }

        $bimb = $bimbinganByDosen[$dId] ?? null;
        $bimbinganStruct = [
            'psABT' => [
                'ps' => (int)($bimb['ps_abt_ps'] ?? 0),
                'ps1' => (int)($bimb['ps_abt_ps1'] ?? 0),
                'ps2' => (int)($bimb['ps_abt_ps2'] ?? 0)
            ],
            'psLain' => [
                'ps' => (int)($bimb['ps_lain_ps'] ?? 0),
                'ps1' => (int)($bimb['ps_lain_ps1'] ?? 0),
                'ps2' => (int)($bimb['ps_lain_ps2'] ?? 0)
            ]
        ];
        $totalBimb = $bimbinganStruct['psABT']['ps'] + $bimbinganStruct['psABT']['ps1'] + $bimbinganStruct['psABT']['ps2'] +
                     $bimbinganStruct['psLain']['ps'] + $bimbinganStruct['psLain']['ps1'] + $bimbinganStruct['psLain']['ps2'];
        $rataBimbingan = $totalBimb > 0 ? round($totalBimb / 3, 1) : 0;

        $kontribusiPengajaranList[] = [
            'nidn' => $nidn,
            'nama' => $nama,
            'matkulABT' => $matkulABT,
            'matkulPSLain' => $matkulPSLain,
            'bahanAjar' => $bahanAjarByDosen[$dId] ?? [],
            'bimbingan' => $bimbinganStruct,
            'rataBimbingan' => $rataBimbingan,
            'rekognisi' => $rekognisiByDosen[$dId]['Pengajaran'] ?? [],
            'avatarColor' => $avatarColor
        ];

        // 3. Kontribusi Penelitian Item
        $kontribusiPenelitianList[] = [
            'nidn' => $nidn,
            'nama' => $nama,
            'avatarColor' => $avatarColor,
            'penelitian' => $penelitianByDosen[$dId] ?? [],
            'rekognisi' => $rekognisiByDosen[$dId]['Penelitian'] ?? []
        ];

        // 4. Kontribusi Pengabdian Item
        $kontribusiPengabdianList[] = [
            'nidn' => $nidn,
            'nama' => $nama,
            'avatarColor' => $avatarColor,
            'pkm' => $pengabdianByDosen[$dId] ?? [],
            'rekognisi' => $rekognisiByDosen[$dId]['Pengabdian'] ?? []
        ];

        // 5. Waktu Mengajar Item
        $ewmpRows = $ewmpByDosen[$dId] ?? [];
        usort($ewmpRows,static fn(array $a,array $b):int=>strcmp((string)$b['tahun_akademik'],(string)$a['tahun_akademik']));
        if ($ewmpRows === []) $ewmpRows = [['tahun_akademik'=>date('Y').'/'.((int)date('Y')+1)]];
        foreach ($ewmpRows as $ewmp) {
            $waktuMengajarList[] = [
                'nidn' => $nidn,
                'nama' => $nama,
                'avatarColor' => $avatarColor,
                'tahunAkademik' => (string)($ewmp['tahun_akademik'] ?? ''),
                'sksPendidikanPS' => (float)($ewmp['pendidikan_ps_abt'] ?? 0),
                'sksPendidikanPSLain' => (float)($ewmp['pendidikan_ps_lain'] ?? 0),
                'sksPendidikanPTLain' => (float)($ewmp['pendidikan_pt_lain'] ?? 0),
                'sksPenelitian' => (float)($ewmp['penelitian'] ?? 0),
                'sksPengabdian' => (float)($ewmp['pkm'] ?? 0),
                'sksTugasTambahan' => (float)($ewmp['tugas_tambahan'] ?? 0)
            ];
        }

        // 6. Luaran Item
        $luaranList[] = [
            'nidn' => $nidn,
            'nama' => $nama,
            'avatarColor' => $avatarColor,
            'luaran' => $luaranByDosen[$dId] ?? []
        ];
    }

    // 7. Tenaga Kependidikan Transform
    $tendikList = [];
    foreach ($rawTendik as $t) {
        $certList = [];
        if (!empty($t['sertifikat_kompetensi'])) {
            $decodedCert = json_decode($t['sertifikat_kompetensi'], true);
            if (is_array($decodedCert)) {
                $certList = $decodedCert;
            }
        }

        $tendikList[] = [
            'id' => (string)$t['id'],
            'nip' => (string)$t['nip'],
            'nama' => $t['nama'],
            'status' => $t['status'],
            'jabatan' => $t['jabatan'],
            'golongan' => $t['golongan'] ?? '',
            'pendidikanD3' => $t['pendidikan_d3'] ?? '-',
            'pendidikanS1' => $t['pendidikan_s1'] ?? '-',
            'pendidikanS2' => $t['pendidikan_s2'] ?? '-',
            'pendidikanS3' => $t['pendidikan_s3'] ?? '-',
            'sertifikatKompetensi' => $certList
        ];
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database connection and data fetch successful.',
        'data' => [
            'dosenList' => $dosenList,
            'kontribusiPengajaranList' => $kontribusiPengajaranList,
            'kontribusiPenelitianList' => $kontribusiPenelitianList,
            'kontribusiPengabdianList' => $kontribusiPengabdianList,
            'waktuMengajarList' => $waktuMengajarList,
            'luaranList' => $luaranList,
            'tendikList' => $tendikList,
            'archivedDosenList' => $archivedDosenList
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
