<?php
declare(strict_types=1);

function dosen_import_definitions(): array
{
    $funding = ['Perguruan Tinggi / Mandiri','Lembaga Dalam Negeri (di luar Perguruan Tinggi)','Lembaga Luar Negeri'];
    $publication = ['Jurnal Nasional Tidak Terakreditasi','Jurnal Nasional Terakreditasi','Jurnal Internasional','Jurnal Internasional Bereputasi','Seminar Wilayah, Lokal, Perguruan Tinggi','Seminar Nasional','Seminar Internasional','Tulisan di Media Massa Nasional','Tulisan di Media Massa Internasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional','Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional'];
    $simple = static fn(string $key, string $label, array $options = []): array => ['key'=>$key,'label'=>$label,'options'=>$options];
    return [
        'pengelolaan' => ['title'=>'Pengelolaan Dosen','prefill'=>false,'columns'=>[
            $simple('nama','Nama'),$simple('nidn','NIDN/NIDK'),$simple('status','Status Dosen',['Tetap','Tidak Tetap']),$simple('jabatan','Jabatan'),$simple('institusi','Institusi'),
            ['key'=>'s2','label'=>'Magister (S2)','group'=>'Kualifikasi Pascasarjana','options'=>['Ya','Tidak']],
            ['key'=>'s3','label'=>'Doktor (S3)','group'=>'Kualifikasi Pascasarjana','options'=>['Ya','Tidak']],
            ['key'=>'s2_terapan','label'=>'Magister Terapan (S2 Terapan)','group'=>'Kualifikasi Pascasarjana','options'=>['Ya','Tidak']],
            ['key'=>'s3_terapan','label'=>'Doktor Terapan (S3 Terapan)','group'=>'Kualifikasi Pascasarjana','options'=>['Ya','Tidak']],
            ['key'=>'sp1','label'=>'Spesialis (Sp-1)','group'=>'Kualifikasi Pascasarjana','options'=>['Ya','Tidak']],
            $simple('bidang','Bidang Keahlian'),$simple('serdos','Sertifikat Pendidik (Serdos)'),$simple('sertifikat','Sertifikat Kompetensi'),
        ]],
        'pengajaran' => ['title'=>'Kontribusi Intelektual - Pengajaran','prefill'=>true,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Dosen'),$simple('nidn','NIDN/NIDK'),$simple('matkul_abt','Mata Kuliah PS ABT'),$simple('matkul_lain','Mata Kuliah PS Lain'),$simple('bahan_ajar','Daftar Judul Bahan Ajar'),
            ['key'=>'abt_ps1','label'=>'PS-1','group'=>'Bimbingan PS ABT'],['key'=>'abt_ps2','label'=>'PS-2','group'=>'Bimbingan PS ABT'],
            ['key'=>'lain_ps1','label'=>'PS-1','group'=>'Bimbingan PS Lain'],['key'=>'lain_ps2','label'=>'PS-2','group'=>'Bimbingan PS Lain'],
            $simple('rekognisi','Rekognisi / Pengakuan Keahlian'),
        ]],
        'penelitian' => ['title'=>'Kontribusi Intelektual - Penelitian','prefill'=>true,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Dosen'),$simple('nidn','NIDN/NIDK'),
            ['key'=>'judul','label'=>'Judul Penelitian','group'=>'Judul Penelitian & Kerjasama Instansi'],['key'=>'kerjasama','label'=>'Kerjasama Instansi / Organisasi','group'=>'Judul Penelitian & Kerjasama Instansi'],['key'=>'tahun','label'=>'Tahun','group'=>'Judul Penelitian & Kerjasama Instansi'],['key'=>'skema','label'=>'Skema','group'=>'Judul Penelitian & Kerjasama Instansi'],$simple('rekognisi','Rekognisi & Kepakaran Dosen'),
        ]],
        'pengabdian' => ['title'=>'Kontribusi Intelektual - Pengabdian','prefill'=>true,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Dosen'),$simple('nidn','NIDN/NIDK'),
            ['key'=>'judul','label'=>'Judul Kegiatan PKM','group'=>'Nama Kegiatan PKM'],['key'=>'kerjasama','label'=>'Kerjasama Instansi / Organisasi','group'=>'Nama Kegiatan PKM'],['key'=>'tahun','label'=>'Tahun','group'=>'Nama Kegiatan PKM'],['key'=>'skema','label'=>'Skema','group'=>'Nama Kegiatan PKM'],$simple('rekognisi','Rekognisi & Kepakaran Dosen'),
        ]],
        'waktu_mengajar' => ['title'=>'Waktu Mengajar','prefill'=>true,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Dosen'),$simple('nidn','NIDN/NIDK'),$simple('tahun_akademik','Tahun Akademik'),$simple('pt_abt','PT ABT'),$simple('ps_lain','PS Lain (Internal PT)'),$simple('pt_lain','PT Lain (Eksternal PT)'),$simple('penelitian','Penelitian'),$simple('pkm','PKM (Pengabdian)'),$simple('tugas','Tugas Tambahan / Penunjang'),
        ]],
        'tendik' => ['title'=>'Tenaga Kependidikan','prefill'=>false,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Tendik'),$simple('nip','NIP/NIDN'),$simple('status','Status',['Tetap','Tidak Tetap']),$simple('jabatan','Jabatan'),$simple('golongan','Golongan'),$simple('pendidikan','Pendidikan yang Ditempuh'),$simple('sertifikat','Sertifikat Kompetensi'),
        ]],
        'luaran' => ['title'=>'Luaran Penelitian/PKM','prefill'=>true,'columns'=>[
            $simple('no','No'),$simple('nama','Nama Dosen'),$simple('nidn','NIDN/NIDK'),$simple('kategori','Penelitian/PKM',['Penelitian','PKM']),$simple('judul','Judul Luaran / Publikasi'),$simple('tahun','Tahun'),$simple('pendanaan','Sumber Pendanaan',$funding),$simple('jenis','Jenis Publikasi',$publication),
        ]],
    ];
}

function dosen_import_definition(string $module): ?array
{
    return dosen_import_definitions()[$module] ?? null;
}
