<?php
/**
 * Script Seeder Database Multi-Year Dosen, Tendik & Luaran (2019 - 2026)
 * Menjalankan sinkronisasi data dummy lengkap ke database MySQL 'arsipmhs'
 */

require_once __DIR__ . '/../config/database.php';

try {
    echo "=== MEMULAI SEEDING MULTI-YEAR DATASET (2019 - 2026) ===\n";

    // 1. SEED DOSEN (12 Dosen)
    $dosenData = [
        ['dosen-0001017806', '0001017806', 'Dr. Ahmad Syarif, S.T., M.T.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister Terapan (S2 Terapan)', 'Doktor Terapan (S3 Terapan)']), 'Sistem Informasi Bisnis & Rekayasa Otomasi', '191071004523', 'Asesor Kompetensi BNSP, Cisco Certified Network Professional (CCNP)', 'ahmad.syarif@polines.ac.id', '081234567801', 'from-blue-600 to-indigo-600'],
        ['dosen-0004058804', '0004058804', 'Rina Wijaya, S.E., M.B.A.', 'Tidak Tetap', 'Asisten Ahli', 'Praktisi', 'PT Solusi Bisnis Ekspor Asia', json_encode(['Magister (S2)']), 'Pemasaran Digital & Bisnis Internasional', '-', 'Certified Professional Marketer (CPM Asia)', 'rina.wijaya@partner.polines.ac.id', '081234567802', 'from-emerald-600 to-teal-600'],
        ['dosen-0012087501', '0012087501', 'Dr. Ir. Fauzi Nurhadi, M.T.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)', 'Doktor (S3)']), 'Manajemen Rekayasa Industri & Lean Manufacturing', '181071003211', 'Ahli Rekayasa Manufaktur BNSP, Lead Auditor ISO 9001:2015', 'fauzi.nurhadi@polines.ac.id', '081234567803', 'from-violet-600 to-purple-600'],
        ['dosen-0015038202', '0015038202', 'Siti Aminah, S.E., M.M., Ak., CA', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)']), 'Akuntansi Manajemen & Keuangan Bisnis Terapan', '201071005890', 'Certified Public Accountant (CPA), Chartered Accountant (CA)', 'siti.aminah@polines.ac.id', '081234567804', 'from-amber-600 to-orange-600'],
        ['dosen-0020078005', '0020078005', 'Dr. Hendra Setiawan, S.Kom., M.Kom.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)', 'Doktor (S3)']), 'Enterprise Resource Planning (ERP) & Cloud Computing', '191071004122', 'AWS Certified Solutions Architect, ITIL 4 Managing Professional', 'hendra.setiawan@polines.ac.id', '081234567805', 'from-cyan-600 to-blue-600'],
        ['dosen-0022117003', '0022117003', 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.', 'Tetap', 'Guru Besar', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)', 'Doktor (S3)']), 'Ekonomi Terapan & Strategi Bisnis Global', '151071001008', 'Konsultan Manajemen Strategik BNSP, Lead Auditor ISO 14001', 'budi.raharjo@polines.ac.id', '081234567806', 'from-rose-600 to-pink-600'],
        ['dosen-0008098301', '0008098301', 'Dewi Lestari, S.S., M.Hum.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)']), 'Komunikasi Bisnis Internasional & Public Relations', '211071006741', 'Certified English for Specific Purposes (ESP) Practitioner', 'dewi.lestari@polines.ac.id', '081234567807', 'from-fuchsia-600 to-purple-600'],
        ['dosen-0014028604', '0014028604', 'Bambang Kusuma, S.T., M.T.', 'Tetap', 'Asisten Ahli', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister Terapan (S2 Terapan)']), 'Logistik Terapan & Manajemen Rantai Pasok (SCM)', '221071007812', 'Certified Supply Chain Professional (CSCP)', 'bambang.kusuma@polines.ac.id', '081234567808', 'from-blue-600 to-indigo-600'],
        ['dosen-0025129002', '0025129002', 'Nadia Putri, S.Pd., M.Pd.', 'Tidak Tetap', 'Tenaga Pendidik', 'Praktisi', 'Lembaga Sertifikasi Profesi Administrasi Perkantoran', json_encode(['Magister (S2)']), 'Keprotokolan & Otomasi Tata Kelola Perkantoran Modern', '-', 'Certified Professional Secretary (CPS)', 'nadia.putri@partner.polines.ac.id', '081234567809', 'from-emerald-600 to-teal-600'],
        ['dosen-0030017903', '0030017903', 'Dr. Agus Priyono, S.E., M.Si.', 'Tetap', 'Lektor Kepala', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)', 'Doktor (S3)']), 'Manajemen Sumber Daya Manusia & Kepemimpinan Organisasi', '171071002934', 'Certified Human Resource Professional (CHRP)', 'agus.priyono@polines.ac.id', '081234567810', 'from-amber-600 to-orange-600'],
        ['dosen-0018048503', '0018048503', 'Ir. Maya Kartika, M.Sc.', 'Tetap', 'Lektor', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)']), 'Kewirausahaan Digital & Inkubasi Bisnis Rintisan', '201071005112', 'Certified Entrepreneurship Educator (CEE)', 'maya.kartika@polines.ac.id', '081234567811', 'from-cyan-600 to-blue-600'],
        ['dosen-0005118702', '0005118702', 'Rudi Hartono, S.Kom., M.M.', 'Tetap', 'Asisten Ahli', 'Akademisi', 'Politeknik Negeri Semarang', json_encode(['Magister (S2)']), 'Analisis Data Bisnis & Strategi E-Commerce', '231071008901', 'Certified Data Analyst (CDA), Google Analytics Certified', 'rudi.hartono@polines.ac.id', '081234567812', 'from-violet-600 to-purple-600'],
    ];

    $stmtDosen = $pdo->prepare("
        INSERT INTO `dosen` (`id`, `nidn`, `nama`, `status_dosen`, `jabatan`, `peran`, `institusi`, `pendidikan_pasca_sarjana`, `bidang_keahlian`, `sertifikat_pendidik`, `sertifikat_kompetensi`, `email`, `telepon`, `avatar_color`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            `avatar_color` = VALUES(`avatar_color`)
    ");

    foreach ($dosenData as $d) {
        $stmtDosen->execute($d);
    }
    echo "✔ Seeding 12 Dosen Berhasil.\n";

    // 2. SEED WAKTU MENGAJAR (EWMP)
    $ewmpData = [
        ['ewmp-0001017806', 'dosen-0001017806', '2024/2025', 8.0, 2.0, 0.0, 3.5, 2.0, 2.0],
        ['ewmp-0004058804', 'dosen-0004058804', '2024/2025', 8.0, 2.0, 2.0, 1.5, 1.0, 0.0],
        ['ewmp-0012087501', 'dosen-0012087501', '2024/2025', 6.0, 2.0, 0.0, 4.0, 2.5, 4.0],
        ['ewmp-0015038202', 'dosen-0015038202', '2024/2025', 9.0, 2.0, 0.0, 2.5, 2.0, 0.0],
        ['ewmp-0020078005', 'dosen-0020078005', '2024/2025', 7.5, 3.0, 0.0, 3.5, 2.0, 2.0],
        ['ewmp-0022117003', 'dosen-0022117003', '2024/2025', 5.0, 1.5, 1.0, 5.5, 2.5, 6.0],
        ['ewmp-0008098301', 'dosen-0008098301', '2024/2025', 8.5, 2.5, 0.0, 2.5, 2.0, 0.0],
        ['ewmp-0014028604', 'dosen-0014028604', '2024/2025', 9.5, 2.5, 0.0, 2.0, 1.5, 0.0],
        ['ewmp-0025129002', 'dosen-0025129002', '2024/2025', 6.0, 0.0, 4.0, 1.0, 1.0, 0.0],
        ['ewmp-0030017903', 'dosen-0030017903', '2024/2025', 7.0, 2.0, 0.0, 3.5, 2.5, 3.0],
        ['ewmp-0018048503', 'dosen-0018048503', '2024/2025', 8.0, 2.0, 0.0, 3.0, 2.5, 0.0],
        ['ewmp-0005118702', 'dosen-0005118702', '2024/2025', 9.0, 3.0, 0.0, 2.5, 1.5, 0.0],
    ];

    $stmtEWMP = $pdo->prepare("
        INSERT INTO `dosen_waktu_mengajar` (`id`, `dosen_id`, `tahun_akademik`, `pendidikan_ps_abt`, `pendidikan_ps_lain`, `pendidikan_pt_lain`, `penelitian`, `pkm`, `tugas_tambahan`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `pendidikan_ps_abt` = VALUES(`pendidikan_ps_abt`),
            `pendidikan_ps_lain` = VALUES(`pendidikan_ps_lain`),
            `pendidikan_pt_lain` = VALUES(`pendidikan_pt_lain`),
            `penelitian` = VALUES(`penelitian`),
            `pkm` = VALUES(`pkm`),
            `tugas_tambahan` = VALUES(`tugas_tambahan`)
    ");

    foreach ($ewmpData as $ew) {
        $stmtEWMP->execute($ew);
    }
    echo "✔ Seeding Waktu Mengajar (EWMP) Berhasil.\n";

    // 3. SEED DOSEN LUARAN PENELITIAN & PKM (60 records across 2019-2025)
    $luaranData = [
        ['luaran-1', 'dosen-0001017806', 'Penelitian', 'IoT-Based Smart Attendance and Environmental Quality Monitoring for Vocational Office Automation', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional', 'https://doi.org/10.1088/1742-6596/2421/1/012015'],
        ['luaran-2', 'dosen-0001017806', 'Penelitian', 'Design and Performance Evaluation of LoRaWAN-Based Telemetry Systems in Industrial Park Logistics', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Internasional', 'https://ieeexplore.ieee.org/document/9982311'],
        ['luaran-3', 'dosen-0001017806', 'PKM', 'Penyediaan Akses Internet Surya dan Pemantauan Wilayah Berbasis IoT di Area Wisata Konservasi', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/teknik/ahmad-solar-cctv'],
        ['luaran-4', 'dosen-0001017806', 'Penelitian', 'Machine Learning Classification for Anomaly Traffic in Digital Business Financial Networks', '2022', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=2140'],
        ['luaran-5', 'dosen-0001017806', 'PKM', 'Pelatihan Tata Kelola Keamanan Data Sekolah Berbasis Cloud Workspace untuk Pendidik Vokasi', '2021', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/pkm/ahmad-cloud-edu'],
        ['luaran-6', 'dosen-0001017806', 'Penelitian', 'Evaluasi Protokol Jaringan Sensor Nirkabel untuk Efisiensi Daya pada Perangkat Cerdas Perkantoran', '2020', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=1890'],

        ['luaran-7', 'dosen-0004058804', 'Penelitian', 'Omnichannel Strategy and Artificial Intelligence Chatbot Adoption on B2B Export Consumer Loyalty', '2024', 'Lembaga Luar Negeri', 'Jurnal Internasional', 'https://doi.org/10.1080/08911762.2024.2389100'],
        ['luaran-8', 'dosen-0004058804', 'PKM', 'Workshop Akselerasi Ekspor Digital dan Kepatuhan Bea Cukai bagi Pengrajin Ukir Jepara', '2024', 'Perguruan Tinggi / Mandiri', 'Tulisan di Media Massa Nasional', 'https://kompas.id/baca/ekonomi/2024/07/12/akselerasi-ekspor-jepara'],
        ['luaran-9', 'dosen-0004058804', 'Penelitian', 'Digital Export Readiness Assessment of Indonesian Furniture SMEs in Post-Pandemic European Market', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=4321'],
        ['luaran-10', 'dosen-0004058804', 'PKM', 'Pendampingan Pemasaran Global Cross-Border E-Commerce bagi Pelaku UMKM Pesisir Semarang', '2022', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah', 'https://polines.ac.id/expo-pkm/rina-ecommerce'],

        ['luaran-11', 'dosen-0012087501', 'Penelitian', 'Model Optimasi Tata Letak Fasilitas dan Ergonomi Berbasis Lean Manufacturing pada Industri Garmen Ekspor', '2025', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=1290'],
        ['luaran-12', 'dosen-0012087501', 'Penelitian', 'Application of Value Stream Mapping and Six Sigma to Minimize Waste in Textile Assembly Lines', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.ijpe.2024.109200'],
        ['luaran-13', 'dosen-0012087501', 'PKM', 'Implementasi Sistem Keselamatan Kerja dan Ergonomi Stasiun Kerja pada Sentra Konveksi Kalipancur', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/semnas/fauzi-k3'],
        ['luaran-14', 'dosen-0012087501', 'Penelitian', 'Simulation-Based Facility Layout Optimization Using CRAFT Algorithm in Automotive Component Manufacturing', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Seminar Internasional', 'https://ieeexplore.ieee.org/document/10123980'],
        ['luaran-15', 'dosen-0012087501', 'PKM', 'Rancang Bangun dan Diseminasi Alat Pemotong Singkong Semi Otomatis bagi Kelompok Wanita Tani', '2022', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional', 'https://polines.ac.id/expo-ttg/fauzi-singkong'],
        ['luaran-16', 'dosen-0012087501', 'Penelitian', 'Integrasi Total Productive Maintenance (TPM) untuk Peningkatan Nilai OEE Mesin Press Logam', '2021', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=1102'],
        ['luaran-17', 'dosen-0012087501', 'Penelitian', 'Analisis Postur Kerja Operator Perakitan Komponen Elektronik Menggunakan Metode RULA dan REBA', '2019', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/rekayasa/fauzi-rula-2019'],

        ['luaran-18', 'dosen-0015038202', 'Penelitian', 'Analisis Determinan Minat Penggunaan Quick Response Code Indonesian Standard (QRIS) pada Usaha Mikro Kuliner', '2024', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=3450'],
        ['luaran-19', 'dosen-0015038202', 'PKM', 'Pendampingan Penyusunan Laporan Keuangan SAK EMKM dan Digital Payment bagi Pedagang Pasar Johar', '2024', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah', 'https://polines.ac.id/expo-pkm/siti-sak-emkm'],
        ['luaran-20', 'dosen-0015038202', 'Penelitian', 'Cloud-Based Financial Accounting Standard Adoption Among Micro and Small Enterprises in Central Java', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional', 'https://doi.org/10.14707/ajbr.230150'],
        ['luaran-21', 'dosen-0015038202', 'PKM', 'Sosialisasi Literasi Pajak UMKM dan Tata Cara Pelaporan SPT Tahunan melalui DJP Online', '2022', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/pajak/siti-djp'],
        ['luaran-22', 'dosen-0015038202', 'Penelitian', 'Pengaruh Akuntabilitas dan Transparansi Laporan Keuangan terhadap Kepercayaan Anggota Koperasi Syariah', '2021', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=2890'],

        ['luaran-23', 'dosen-0020078005', 'Penelitian', 'Scalable Microservices Architecture for Academic Record Management in Higher Vocational Education Systems', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1109/ACCESS.2024.3361280'],
        ['luaran-24', 'dosen-0020078005', 'Penelitian', 'Blockchain-Enabled Digital Credential Verification Framework for Higher Vocational Institutions', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Seminar Internasional', 'https://ieeexplore.ieee.org/document/10398211'],
        ['luaran-25', 'dosen-0020078005', 'PKM', 'Pelatihan Tata Kelola Keamanan Siber, Proteksi Phishing, dan Backup Cloud untuk Guru SMK Kota Semarang', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/pkm/hendra-cybersec'],
        ['luaran-26', 'dosen-0020078005', 'PKM', 'Implementasi Sistem Informasi Desa (SID) Terintegrasi Layanan Administrasi Surat Kependudukan Mandiri', '2023', 'Perguruan Tinggi / Mandiri', 'Tulisan di Media Massa Nasional', 'https://suaramerdeka.com/pendidikan/2023/11/15/sid-gedangan-polines'],
        ['luaran-27', 'dosen-0020078005', 'Penelitian', 'Performance Benchmarking of Relational vs Document-Oriented NoSQL Databases in Large Scale Log Processing', '2022', 'Perguruan Tinggi / Mandiri', 'Jurnal Internasional', 'https://doi.org/10.11591/eei.v11i4.3820'],
        ['luaran-28', 'dosen-0020078005', 'Penelitian', 'Desain dan Implementasi Progressive Web Application (PWA) untuk Monitoring Beban Kerja Dosen', '2020', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=1980'],

        ['luaran-29', 'dosen-0022117003', 'Penelitian', 'Impact of Green Export Tax Incentives on Competitiveness of Furniture Industry: Empirical Evidence from Indonesian SMEs', '2025', 'Lembaga Luar Negeri', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.jclepro.2024.139820'],
        ['luaran-30', 'dosen-0022117003', 'Penelitian', 'Supply Chain Resilience and Circular Economy Strategies in Indonesian Export-Oriented Manufacturing Sectors', '2024', 'Lembaga Luar Negeri', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.ijpe.2023.108920'],
        ['luaran-31', 'dosen-0022117003', 'PKM', 'Penyuluhan Kebijakan Rantai Pasok Hijau dan Sertifikasi Carbon Neutral bagi Eksportir Kopi Spesialti', '2025', 'Lembaga Luar Negeri', 'Tulisan di Media Massa Internasional', 'https://thejakartapost.com/opinion/2025/01/18/greening-indonesian-coffee-supply-chain.html'],
        ['luaran-32', 'dosen-0022117003', 'PKM', 'Klinik Ekspor Terpadu: Pendampingan Letter of Credit (L/C) dan Akselerasi Bea Cukai bagi Pengusaha Muda', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Tulisan di Media Massa Nasional', 'https://bisnis.com/opini/2024/08/20/akselerasi-ekspor-vokasi'],
        ['luaran-33', 'dosen-0022117003', 'Penelitian', 'Halal Export Product Competitiveness and Digital Trade Hub Penetration in Middle East Markets', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.jbusres.2023.113902'],
        ['luaran-34', 'dosen-0022117003', 'Penelitian', 'Evaluasi Efektivitas Perjanjian Perdagangan Bebas AANZFTA terhadap Ekspor Industri Manufaktur Jawa Tengah', '2021', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=3301'],
        ['luaran-35', 'dosen-0022117003', 'Penelitian', 'Logistics Service Performance Determinants at Tanjung Emas Seaport Container Terminal', '2020', 'Perguruan Tinggi / Mandiri', 'Seminar Internasional', 'https://ieeexplore.ieee.org/document/9281740'],
        ['luaran-36', 'dosen-0022117003', 'PKM', 'Pameran Produk Inovasi Vokasi Berorientasi Ekspor pada Trade Expo Indonesia (TEI)', '2019', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional', 'https://tradeexpoindonesia.com/archive/2019/polines-exhibition'],

        ['luaran-37', 'dosen-0008098301', 'Penelitian', 'Standardization of English Business Correspondence Modules for Vocational Students in ASEAN Trade Integration', '2024', 'Lembaga Luar Negeri', 'Jurnal Internasional', 'https://doi.org/10.1080/01434632.2024.2319080'],
        ['luaran-38', 'dosen-0008098301', 'PKM', 'Pelatihan Bahasa Inggris Hospitality dan Komunikasi Pelayanan bagi Pramuwisata Kawasan Candi Gedongsongo', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/pkm/dewi-gedongsongo'],
        ['luaran-39', 'dosen-0008098301', 'Penelitian', 'Virtual Reality-Based English for Specific Purposes Simulation for Cross-Border Export Negotiations', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Internasional', 'https://doi.org/10.1145/3589883.3589920'],
        ['luaran-40', 'dosen-0008098301', 'Penelitian', 'Crisis Communication Discourse Analysis in Multinational Export Processing Zone Enterprises', '2022', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=4901'],

        ['luaran-41', 'dosen-0014028604', 'Penelitian', 'Evaluasi Kinerja Vendor Logistik Menggunakan Metode Analytic Hierarchy Process (AHP) di Kawasan Industri Candi', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/rekayasa/bambang-ahp'],
        ['luaran-42', 'dosen-0014028604', 'Penelitian', 'Genetic Algorithm Optimization for Perishable Food Cold Chain Distribution Routing in Central Java', '2023', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional', 'https://doi.org/10.1016/j.promfg.2023.08.012'],
        ['luaran-43', 'dosen-0014028604', 'PKM', 'Penerapan Sistem Manajemen Pergudangan FIFO dan Tata Letak Palet Gabah bagi Gapoktan Demak', '2024', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional', 'https://polines.ac.id/expo-pkm/bambang-fifo'],
        ['luaran-44', 'dosen-0014028604', 'Penelitian', 'Rancang Bangun Modul Pelacak Kontainer Ekspor Berbasis RFID dan GPS Tracker', '2022', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=3772'],

        ['luaran-45', 'dosen-0025129002', 'Penelitian', 'Standardisasi Prosedur Operasional Keprotokolan Berbasis Budaya Pelayanan Prima pada Instansi Pemerintahan', '2024', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=5120'],
        ['luaran-46', 'dosen-0025129002', 'PKM', 'Pelatihan Manajemen Grooming, Tata Krama Perkantoran, dan Public Speaking bagi Calon Tenaga Kerja Vokasi', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/pkm/nadia-grooming'],
        ['luaran-47', 'dosen-0025129002', 'Penelitian', 'Efektivitas Penggunaan Platform Digital Event Management dalam Penyelenggaraan Sidang Terbuka Senat', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/humas/nadia-event'],

        ['luaran-48', 'dosen-0030017903', 'Penelitian', 'Pengaruh Kepemimpinan Transformasional dan Budaya Organisasi Agile terhadap Retensi Talenta Gen-Z pada Sektor Perbankan', '2025', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=5610'],
        ['luaran-49', 'dosen-0030017903', 'Penelitian', 'Measuring Upskilling Training Effectiveness for Vocational Labor Force Using Kirkpatrick Four-Level Model', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1080/03075079.2024.2341908'],
        ['luaran-50', 'dosen-0030017903', 'PKM', 'Pendampingan Penyusunan Key Performance Indicator (KPI) Berbasis Balanced Scorecard pada Koperasi Peternak Sapi', '2025', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/semnas/agus-kpi-koperasi'],
        ['luaran-51', 'dosen-0030017903', 'PKM', 'Workshop Resolusi Konflik Hubungan Industrial dan Manajemen Stres Kerja di Lingkungan Pabrik Padat Karya', '2023', 'Perguruan Tinggi / Mandiri', 'Tulisan di Media Massa Nasional', 'https://suaramerdeka.com/ekonomi/2023/09/22/resolusi-konflik-industri-semarang'],
        ['luaran-52', 'dosen-0030017903', 'Penelitian', 'Faktor-Faktor Determinan Kepuasan Kerja dan Work-Life Balance pada Skema Kerja Hibrida Tenaga Pendidik', '2022', 'Perguruan Tinggi / Mandiri', 'Jurnal Nasional Terakreditasi', 'https://sinta.kemdikbud.go.id/journals/detail?id=4590'],

        ['luaran-53', 'dosen-0018048503', 'Penelitian', 'Campus Accelerator Incubation Model Efficacy on Vocational Student Startup Sustainability and Growth', '2024', 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)', 'Jurnal Internasional', 'https://doi.org/10.1108/ET-08-2023-0342'],
        ['luaran-54', 'dosen-0018048503', 'PKM', 'Pendampingan Sertifikasi NIB dan Desain Kemasan Ramah Lingkungan bagi Pengrajin Jamu Tradisional Kendal', '2024', 'Perguruan Tinggi / Mandiri', 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional', 'https://polines.ac.id/expo-pkm/maya-jamu-kendal'],
        ['luaran-55', 'dosen-0018048503', 'Penelitian', 'Analisis Faktor Kunci Keberhasilan Kampanye Crowdfunding Produk Inovasi Mahasiswa Politeknik', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Nasional', 'https://prosiding.polines.ac.id/kwu/maya-crowdfunding'],
        ['luaran-56', 'dosen-0018048503', 'PKM', 'Bootcamp Business Model Canvas dan Pitching Investor untuk Pemuda Wirausaha Karang Taruna', '2022', 'Perguruan Tinggi / Mandiri', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/pkm/maya-bmc'],

        ['luaran-57', 'dosen-0005118702', 'Penelitian', 'Customer Lifetime Value (CLV) Modeling and Churn Prediction in B2C E-Commerce Platforms Using Random Forest', '2025', 'Perguruan Tinggi / Mandiri', 'Jurnal Internasional Bereputasi', 'https://doi.org/10.1016/j.eswa.2024.123980'],
        ['luaran-58', 'dosen-0005118702', 'Penelitian', 'Sentiment Analysis of Indonesian FinTech App Reviews Using Fine-Tuned IndoBERT Architecture', '2024', 'Perguruan Tinggi / Mandiri', 'Seminar Internasional', 'https://doi.org/10.1109/ICDMW60847.2024.00045'],
        ['luaran-59', 'dosen-0005118702', 'PKM', 'Implementasi Dashboard Monitoring Penjualan Berbasis Looker Studio untuk Retail Tradisional Menuju Pasar Modern', '2025', 'Perguruan Tinggi / Mandiri', 'Tulisan di Media Massa Nasional', 'https://republika.co.id/berita/ekonomi/2025/02/10/dashboard-penjualan-umkm'],
        ['luaran-60', 'dosen-0005118702', 'PKM', 'Pelatihan Analisis Efektivitas Iklan Media Sosial dan Meta Ads bagi Wirausahawan Muda Kota Semarang', '2023', 'Perguruan Tinggi / Mandiri', 'Seminar Wilayah, Lokal, Perguruan Tinggi', 'https://prosiding.polines.ac.id/pkm/rudi-meta-ads'],
    ];

    $stmtLuaran = $pdo->prepare("
        INSERT INTO `dosen_luaran_penelitian_pkm` (`id`, `dosen_id`, `kategori`, `judul_luaran`, `tahun`, `sumber_pendanaan`, `jenis_publikasi`, `url_luaran`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `kategori` = VALUES(`kategori`),
            `judul_luaran` = VALUES(`judul_luaran`),
            `tahun` = VALUES(`tahun`),
            `sumber_pendanaan` = VALUES(`sumber_pendanaan`),
            `jenis_publikasi` = VALUES(`jenis_publikasi`),
            `url_luaran` = VALUES(`url_luaran`)
    ");

    foreach ($luaranData as $l) {
        $stmtLuaran->execute($l);
    }
    echo "✔ Seeding 60 Luaran Penelitian & PKM (2019-2025) Berhasil.\n";

    // 4. SEED TENAGA KEPENDIDIKAN (8 Tendik)
    $tendikData = [
        ['tendik-1', '198805122014041001', 'Agus Setiawan, A.Md.Kom.', 'Tetap', 'Teknisi Laboratorium Komputer Gol. III/b', 'D3 Manajemen Informatika', 'S1 Sistem Informasi', '-', '-', json_encode(['Jaringan Komputer (CCNA)', 'Hardware & Network Maintenance BNSP', 'IT Support Specialist Google'])],
        ['tendik-2', '198503222009122003', 'Sri Wahyuni, S.Sos., M.M.', 'Tetap', 'Arsiparis Ahli Muda Gol. III/c', '-', 'S1 Ilmu Administrasi Negara', 'S2 Magister Manajemen', '-', json_encode(['Manajemen Kearsipan Digital ANRI', 'Sistem Kearsipan Elektronik Lembaga', 'Pengelolaan Dokumen Rahasia Negara'])],
        ['tendik-3', '199201152019031008', 'Bambang Pratama, S.Kom., M.Kom.', 'Tetap', 'Pranata Komputer Ahli Pertama Gol. III/a', '-', 'S1 Teknik Informatika', 'S2 Magister Ilmu Komputer', '-', json_encode(['Database Administrator Oracle', 'Web Security & Penetration Testing', 'Cloud Practitioner AWS'])],
        ['tendik-4', '199008102015052002', 'Dina Kusuma, S.E.', 'Tetap', 'Pengadministrasi Akademik Gol. III/a', 'D3 Kesekretariatan', 'S1 Manajemen Bisnis', '-', '-', json_encode(['Pelayanan Prima Administrasi Akademik', 'Sertifikasi Operator PDDIKTI Kemenristekdikti'])],
        ['tendik-5', '198711042010121004', 'Eko Santoso, S.E., Ak.', 'Tetap', 'Pengelola Keuangan & Anggaran Gol. III/b', '-', 'S1 Akuntansi Keuangan', '-', '-', json_encode(['Bendahara Pengeluaran APBN Kemenkeu RI', 'Sertifikasi Pengadaan Barang dan Jasa Pemerintah (PBJP)'])],
        ['tendik-6', '199507192022042006', 'Ratna Sari, S.I.Pust.', 'Tidak Tetap', 'Pustakawan & Pengelola Repositori Gol. II/c', 'D3 Perpustakaan', 'S1 Ilmu Perpustakaan & Informasi', '-', '-', json_encode(['Pengelolaan Repositori Institusi EPrints', 'Katalogisasi Standar Perpustakaan Nasional RI'])],
        ['tendik-7', '199304182020121002', 'Wahyu Nugroho, A.Md.T.', 'Tetap', 'Teknisi Laboratorium Perkantoran Gol. II/c', 'D3 Teknik Komputer', '-', '-', '-', json_encode(['Maintenance Alat Perkantoran & Audio Visual', 'K3 Lingkungan Kerja Laboratorium'])],
        ['tendik-8', '199610252023022005', 'Anisa Rahmawati, S.Tr.Kom.', 'Tidak Tetap', 'Pranata Media Informasi & Humas Gol. II/b', '-', 'D4 Animasi & Desain Multimedia', '-', '-', json_encode(['Desain Komunikasi Visual BNSP', 'Content Creator & Social Media Strategist'])],
    ];

    $stmtTendik = $pdo->prepare("
        INSERT INTO `tenaga_kependidikan` (`id`, `nip`, `nama`, `status`, `jabatan`, `pendidikan_d3`, `pendidikan_s1`, `pendidikan_s2`, `pendidikan_s3`, `sertifikat_kompetensi`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `nip` = VALUES(`nip`),
            `nama` = VALUES(`nama`),
            `status` = VALUES(`status`),
            `jabatan` = VALUES(`jabatan`),
            `pendidikan_d3` = VALUES(`pendidikan_d3`),
            `pendidikan_s1` = VALUES(`pendidikan_s1`),
            `pendidikan_s2` = VALUES(`pendidikan_s2`),
            `pendidikan_s3` = VALUES(`pendidikan_s3`),
            `sertifikat_kompetensi` = VALUES(`sertifikat_kompetensi`)
    ");

    foreach ($tendikData as $t) {
        $stmtTendik->execute($t);
    }
    echo "✔ Seeding 8 Tenaga Kependidikan Berhasil.\n";

    // 5. SEED DOSEN PENGAJARAN BIMBINGAN
    $bimbinganData = [
        ['bimb-0001017806', 'dosen-0001017806', 8, 6, 7, 2, 2, 1],
        ['bimb-0004058804', 'dosen-0004058804', 5, 4, 3, 0, 0, 0],
        ['bimb-0012087501', 'dosen-0012087501', 9, 8, 8, 3, 2, 2],
        ['bimb-0015038202', 'dosen-0015038202', 7, 6, 6, 1, 1, 0],
        ['bimb-0020078005', 'dosen-0020078005', 8, 7, 7, 2, 2, 1],
        ['bimb-0022117003', 'dosen-0022117003', 10, 9, 9, 4, 3, 3],
        ['bimb-0008098301', 'dosen-0008098301', 6, 5, 5, 1, 0, 0],
        ['bimb-0014028604', 'dosen-0014028604', 6, 5, 5, 1, 1, 0],
        ['bimb-0025129002', 'dosen-0025129002', 3, 2, 2, 0, 0, 0],
        ['bimb-0030017903', 'dosen-0030017903', 8, 7, 7, 2, 2, 1],
        ['bimb-0018048503', 'dosen-0018048503', 7, 6, 6, 1, 1, 1],
        ['bimb-0005118702', 'dosen-0005118702', 6, 6, 5, 1, 1, 0],
    ];

    $stmtBimb = $pdo->prepare("
        INSERT INTO `dosen_pengajaran_bimbingan` (`id`, `dosen_id`, `ps_abt_ps`, `ps_abt_ps1`, `ps_abt_ps2`, `ps_lain_ps`, `ps_lain_ps1`, `ps_lain_ps2`)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `ps_abt_ps` = VALUES(`ps_abt_ps`),
            `ps_abt_ps1` = VALUES(`ps_abt_ps1`),
            `ps_abt_ps2` = VALUES(`ps_abt_ps2`),
            `ps_lain_ps` = VALUES(`ps_lain_ps`),
            `ps_lain_ps1` = VALUES(`ps_lain_ps1`),
            `ps_lain_ps2` = VALUES(`ps_lain_ps2`)
    ");

    foreach ($bimbinganData as $b) {
        $stmtBimb->execute($b);
    }
    echo "✔ Seeding Bimbingan Tugas Akhir Berhasil.\n";

    echo "=== SEEDING MULTI-YEAR DATASET SELESAI DENGAN SUKSES ===\n";

} catch (Exception $e) {
    echo "❌ Error Seeding: " . $e->getMessage() . "\n";
}

