-- ==========================================================
-- SEED DATA DOSEN & TENAGA KEPENDIDIKAN (ARSIP MHS ABT)
-- Dapat diimpor langsung melalui menu Import / SQL di phpMyAdmin
-- ==========================================================

-- 1. SEED DOSEN (10 Dosen)
INSERT INTO `dosen` (`id`, `nidn`, `nama`, `status_dosen`, `jabatan`, `peran`, `institusi`, `pendidikan_pasca_sarjana`, `bidang_keahlian`, `sertifikat_pendidik`, `sertifikat_kompetensi`, `email`, `telepon`, `avatar_color`) VALUES
('dosen-0001017806', '0001017806', 'Ahmad Syarif, M.T.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister Terapan (S2 Terapan)", "Doktor Terapan (S3 Terapan)"]', 'Teknik Rekayasa Komputer & Jaringan', '191071004523', 'Asesor Kompetensi BNSP, Cisco Certified Network Professional (CCNP)', 'ahmad.syarif@polines.ac.id', '081234567801', 'from-blue-600 to-indigo-600'),
('dosen-0004058804', '0004058804', 'Rina Wijaya, M.B.A.', 'Tidak Tetap', 'Asisten Ahli', 'Praktisi', 'PT Solusi Bisnis Digital', '["Magister (S2)"]', 'Bisnis Internasional & Bahasa Inggris Bisnis', '-', 'Certified Professional Marketer (CPM Asia)', 'rina.wijaya@partner.polines.ac.id', '081234567802', 'from-emerald-600 to-teal-600'),
('dosen-0012087501', '0012087501', 'Dr. Ir. Fauzi, M.T.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)", "Doktor (S3)"]', 'Manajemen Rekayasa Industri & Otomasi', '181071003211', 'Ahli Rekayasa Manufaktur BNSP', 'fauzi@polines.ac.id', '081234567803', 'from-violet-600 to-purple-600'),
('dosen-0015038202', '0015038202', 'Siti Aminah, S.E., M.M.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)"]', 'Akuntansi Manajemen & Keuangan Syariah', '201071005890', 'Certified Public Accountant (CPA)', 'siti.aminah@polines.ac.id', '081234567804', 'from-amber-600 to-orange-600'),
('dosen-0020078005', '0020078005', 'Hendra Setiawan, M.Kom.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)", "Doktor (S3)"]', 'Sistem Informasi Enterprise & Cloud Computing', '191071004122', 'AWS Certified Solutions Architect, ITIL 4 Managing Professional', 'hendra.setiawan@polines.ac.id', '081234567805', 'from-cyan-600 to-blue-600'),
('dosen-0022117003', '0022117003', 'Prof. Budi Raharjo, Ph.D.', 'Tetap', 'Guru Besar', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)", "Doktor (S3)"]', 'Ekonomi Terapan & Strategi Bisnis Global', '151071001008', 'Lead Auditor ISO 9001:2015, Konsultan Manajemen Strategik', 'budi.raharjo@polines.ac.id', '081234567806', 'from-rose-600 to-pink-600'),
('dosen-0008098301', '0008098301', 'Dewi Lestari, S.S., M.Hum.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)"]', 'Komunikasi Bisnis & Korespondensi Ekspor-Impor', '211071006741', 'Certified English for Specific Purposes (ESP) Instructor', 'dewi.lestari@polines.ac.id', '081234567807', 'from-fuchsia-600 to-purple-600'),
('dosen-0014028604', '0014028604', 'Bambang Kusuma, S.T., M.T.', 'Tetap', 'Asisten Ahli', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister Terapan (S2 Terapan)"]', 'Logistik & Manajemen Rantai Pasok (SCM)', '221071007812', 'Certified Supply Chain Professional (CSCP)', 'bambang.kusuma@polines.ac.id', '081234567808', 'from-blue-600 to-indigo-600'),
('dosen-0025129002', '0025129002', 'Nadia Putri, S.Pd., M.Pd.', 'Tidak Tetap', 'Tenaga Pendidik', 'Praktisi', 'Lembaga Pelatihan Ekspor Jawa Tengah', '["Magister (S2)"]', 'Keprotokolan & Administrasi Perkantoran Modern', '-', 'Certified Professional Secretary (CPS)', 'nadia.putri@partner.polines.ac.id', '081234567809', 'from-emerald-600 to-teal-600'),
('dosen-0030017903', '0030017903', 'Dr. Agus Priyono, S.E., M.Si.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', '["Magister (S2)", "Doktor (S3)"]', 'Manajemen Sumber Daya Manusia & Kepemimpinan', '171071002934', 'Certified Human Resource Professional (CHRP)', 'agus.priyono@polines.ac.id', '081234567810', 'from-amber-600 to-orange-600')
ON DUPLICATE KEY UPDATE
  `nama` = VALUES(`nama`),
  `status_dosen` = VALUES(`status_dosen`),
  `jabatan` = VALUES(`jabatan`),
  `peran` = VALUES(`peran`),
  `institusi` = VALUES(`institusi`),
  `pendidikan_pasca_sarjana` = VALUES(`pendidikan_pasca_sarjana`),
  `bidang_keahlian` = VALUES(`bidang_keahlian`),
  `sertifikat_pendidik` = VALUES(`sertifikat_pendidik`),
  `sertifikat_kompetensi` = VALUES(`sertifikat_kompetensi`),
  `email` = VALUES(`email`),
  `telepon` = VALUES(`telepon`),
  `avatar_color` = VALUES(`avatar_color`);

-- 2. SEED DOSEN WAKTU MENGAJAR (EWMP)
INSERT INTO `dosen_waktu_mengajar` (`id`, `dosen_id`, `tahun_akademik`, `pendidikan_ps_abt`, `pendidikan_ps_lain`, `pendidikan_pt_lain`, `penelitian`, `pkm`, `tugas_tambahan`) VALUES
('ewmp-0001017806', 'dosen-0001017806', '2024/2025', 7.5, 2.0, 0.0, 3.0, 2.0, 2.0),
('ewmp-0004058804', 'dosen-0004058804', '2024/2025', 8.0, 2.0, 2.0, 1.0, 1.0, 0.0),
('ewmp-0012087501', 'dosen-0012087501', '2024/2025', 6.0, 2.0, 0.0, 4.0, 2.0, 4.0),
('ewmp-0015038202', 'dosen-0015038202', '2024/2025', 9.0, 1.5, 0.0, 2.0, 1.5, 0.0),
('ewmp-0020078005', 'dosen-0020078005', '2024/2025', 7.0, 3.0, 0.0, 3.0, 2.0, 2.0),
('ewmp-0022117003', 'dosen-0022117003', '2024/2025', 5.0, 1.0, 1.0, 5.0, 2.0, 6.0),
('ewmp-0008098301', 'dosen-0008098301', '2024/2025', 8.5, 2.0, 0.0, 2.0, 1.5, 0.0),
('ewmp-0014028604', 'dosen-0014028604', '2024/2025', 9.0, 2.5, 0.0, 1.5, 1.0, 0.0),
('ewmp-0025129002', 'dosen-0025129002', '2024/2025', 6.0, 0.0, 4.0, 0.5, 1.0, 0.0),
('ewmp-0030017903', 'dosen-0030017903', '2024/2025', 6.5, 2.0, 0.0, 3.5, 2.0, 3.0)
ON DUPLICATE KEY UPDATE
  `pendidikan_ps_abt` = VALUES(`pendidikan_ps_abt`),
  `pendidikan_ps_lain` = VALUES(`pendidikan_ps_lain`),
  `pendidikan_pt_lain` = VALUES(`pendidikan_pt_lain`),
  `penelitian` = VALUES(`penelitian`),
  `pkm` = VALUES(`pkm`),
  `tugas_tambahan` = VALUES(`tugas_tambahan`);

-- 3. SEED DOSEN PENGAJARAN BIMBINGAN
INSERT INTO `dosen_pengajaran_bimbingan` (`id`, `dosen_id`, `ps_abt_ps`, `ps_abt_ps1`, `ps_abt_ps2`, `ps_lain_ps`, `ps_lain_ps1`, `ps_lain_ps2`) VALUES
('bimb-0001017806', 'dosen-0001017806', 8, 6, 7, 2, 2, 1),
('bimb-0004058804', 'dosen-0004058804', 4, 3, 2, 0, 0, 0),
('bimb-0012087501', 'dosen-0012087501', 9, 8, 8, 3, 2, 2),
('bimb-0015038202', 'dosen-0015038202', 6, 6, 5, 1, 1, 0),
('bimb-0020078005', 'dosen-0020078005', 7, 7, 6, 2, 2, 1),
('bimb-0022117003', 'dosen-0022117003', 10, 9, 9, 4, 3, 3),
('bimb-0008098301', 'dosen-0008098301', 5, 5, 4, 1, 0, 0),
('bimb-0014028604', 'dosen-0014028604', 5, 4, 4, 0, 0, 0),
('bimb-0025129002', 'dosen-0025129002', 2, 0, 0, 0, 0, 0),
('bimb-0030017903', 'dosen-0030017903', 8, 7, 7, 2, 1, 1)
ON DUPLICATE KEY UPDATE
  `ps_abt_ps` = VALUES(`ps_abt_ps`),
  `ps_abt_ps1` = VALUES(`ps_abt_ps1`),
  `ps_abt_ps2` = VALUES(`ps_abt_ps2`),
  `ps_lain_ps` = VALUES(`ps_lain_ps`),
  `ps_lain_ps1` = VALUES(`ps_lain_ps1`),
  `ps_lain_ps2` = VALUES(`ps_lain_ps2`);

-- 4. SEED DOSEN LUARAN PENELITIAN & PKM
INSERT INTO `dosen_luaran_penelitian_pkm` (`id`, `dosen_id`, `kategori`, `judul_luaran`, `tahun`, `sumber_pendanaan`, `jenis_publikasi`, `url_luaran`) VALUES
('luaran-1', 'dosen-0001017806', 'Penelitian', 'IoT-Based Smart Attendance and Environmental Quality Monitoring for Office Automation', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional', 'https://doi.org/10.1088/1742-6596/2421/1/012015'),
('luaran-2', 'dosen-0001017806', 'PKM', 'Penyediaan Akses Internet Surya dan Pemantauan Wilayah Berbasis IoT di Area Wisata Konservasi', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/teknik/ahmad-solar-cctv'),
('luaran-3', 'dosen-0022117003', 'Penelitian', 'Impact of Green Export Tax Incentives on Competitiveness of Furniture Industry: Empirical Evidence from Indonesian SMEs', '2024', 'Lembaga Luar Negeri', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.jclepro.2024.139820'),
('luaran-4', 'dosen-0022117003', 'Penelitian', 'Supply Chain Resilience and Circular Economy Strategies in Indonesian Export-Oriented Manufacturing', '2023', 'Lembaga Luar Negeri', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.ijpe.2023.108920'),
('luaran-5', 'dosen-0022117003', 'PKM', 'Workshop Akselerasi Ekspor Digital dan Kepatuhan Bea Cukai bagi Pengrajin Ukir Jepara', '2024', 'Perguruan Tinggi / Mandiri', 'Tulisan di Media Massa Nasional', 'https://kompas.id/baca/ekonomi/2024/07/12/akselerasi-ekspor-jepara'),
('luaran-6', 'dosen-0012087501', 'Penelitian', 'Model Optimasi Tata Letak Fasilitas dan Ergonomi Berbasis Lean Manufacturing pada Industri Garmen', '2024', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=1290'),
('luaran-7', 'dosen-0012087501', 'PKM', 'Implementasi Sistem Keselamatan Kerja dan Ergonomi Stasiun Kerja pada Sentra Konveksi Ungaran', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/semnas/fauzi-k3'),
('luaran-8', 'dosen-0020078005', 'Penelitian', 'Scalable Microservices Architecture for Academic Record Management in Higher Vocational Education', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1109/ACCESS.2024.3361280'),
('luaran-9', 'dosen-0020078005', 'PKM', 'Pelatihan Tata Kelola Keamanan Siber dan Backup Cloud untuk UMKM Binaan Kadin Kota Semarang', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/pkm/hendra-cybersec'),
('luaran-10', 'dosen-0015038202', 'Penelitian', 'Analisis Determinan Minat Penggunaan Quick Response Code Indonesian Standard (QRIS) pada Usaha Mikro', '2023', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=3450'),
('luaran-11', 'dosen-0015038202', 'PKM', 'Pendampingan Penyusunan Laporan Keuangan SAK EMKM dan Digital Payment bagi Pedagang Kuliner', '2024', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah', 'https://polines.ac.id/expo-pkm/siti-sak-emkm'),
('luaran-12', 'dosen-0008098301', 'Penelitian', 'Standardization of English Business Correspondence Modules for Vocational Students in ASEAN Trade Integration', '2024', 'Lembaga Luar Negeri', 'Jurnal Internasional', 'https://doi.org/10.1080/01434632.2024.2319080'),
('luaran-13', 'dosen-0014028604', 'Penelitian', 'Evaluasi Kinerja Vendor Logistik Menggunakan Metode Analytic Hierarchy Process (AHP) di Kawasan Industri Candi', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/rekayasa/bambang-ahp'),
('luaran-14', 'dosen-0030017903', 'Penelitian', 'Pengaruh Kepemimpinan Transformasional dan Budaya Organisasi Agile terhadap Retensi Talenta Gen-Z', '2024', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=5610')
ON DUPLICATE KEY UPDATE
  `kategori` = VALUES(`kategori`),
  `judul_luaran` = VALUES(`judul_luaran`),
  `tahun` = VALUES(`tahun`),
  `sumber_pendanaan` = VALUES(`sumber_pendanaan`),
  `jenis_publikasi` = VALUES(`jenis_publikasi`),
  `url_luaran` = VALUES(`url_luaran`);

-- 5. SEED TENAGA KEPENDIDIKAN (6 Tendik)
INSERT INTO `tenaga_kependidikan` (`id`, `nip`, `nama`, `status`, `jabatan`, `pendidikan_d3`, `pendidikan_s1`, `pendidikan_s2`, `pendidikan_s3`, `sertifikat_kompetensi`) VALUES
('tendik-1', '198805122014041001', 'Agus Setiawan, A.Md.Kom.', 'Tetap', 'Teknisi Laboratorium Komputer Gol. III/b', 'D3 Manajemen Informatika', 'S1 Sistem Informasi', '-', '-', '["Jaringan Komputer (CCNA)", "Hardware & Network Maintenance BNSP", "IT Support Specialist"]'),
('tendik-2', '198503222009122003', 'Sri Wahyuni, S.Sos., M.M.', 'Tetap', 'Arsiparis Ahli Muda Gol. III/c', '-', 'S1 Ilmu Administrasi Negara', 'S2 Magister Manajemen', '-', '["Manajemen Kearsipan Digital ANRI", "Sistem Kearsipan Elektronik", "Pengelolaan Dokumen Lembaga"]'),
('tendik-3', '199201152019031008', 'Bambang Pratama, S.Kom., M.Kom.', 'Tetap', 'Pranata Komputer Ahli Pertama Gol. III/a', '-', 'S1 Teknik Informatika', 'S2 Magister Ilmu Komputer', '-', '["Database Administrator Oracle", "Web Security & Pen Testing", "Cloud Practitioner AWS"]'),
('tendik-4', '199008042018012002', 'Ratna Dewi, S.E.', 'Tetap', 'Pengadministrasi Akademik & Kemahasiswaan Gol. III/a', '-', 'S1 Akuntansi Perbankan', '-', '-', '["Tata Kelola Administrasi Akademik Perguruan Tinggi", "Pelayanan Prima Kemahasiswaan"]'),
('tendik-5', '199511202022032014', 'Nurul Hidayah, S.I.Pust.', 'Tidak Tetap', 'Pustakawan Pelaksana Gol. II/c', 'D3 Perpustakaan', 'S1 Ilmu Perpustakaan & Informasi', '-', '-', '["Klasifikasi Dewey Decimal (DDC) & E-Library Otomasi", "Konservasi & Preservasi Koleksi Ilmiah"]'),
('tendik-6', '199307182020121005', 'Dedi Kurniawan, A.Md.T.', 'Tidak Tetap', 'Teknisi Studio Multimedia & Audio Visual Gol. II/c', 'D3 Teknik Telekomunikasi', '-', '-', '-', '["Broadcast Audio Visual Production", "Live Streaming Management & Maintenance Multimedia"]')
ON DUPLICATE KEY UPDATE
  `nama` = VALUES(`nama`),
  `status` = VALUES(`status`),
  `jabatan` = VALUES(`jabatan`),
  `pendidikan_d3` = VALUES(`pendidikan_d3`),
  `pendidikan_s1` = VALUES(`pendidikan_s1`),
  `pendidikan_s2` = VALUES(`pendidikan_s2`),
  `pendidikan_s3` = VALUES(`pendidikan_s3`),
  `sertifikat_kompetensi` = VALUES(`sertifikat_kompetensi`);
