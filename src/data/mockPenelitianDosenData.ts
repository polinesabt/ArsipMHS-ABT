export interface PenelitianItem {
  id: string;
  judul: string;
  kerjasamaInstansi: string; // Nama instansi/organisasi kerjasama atau 'Mandiri / Internal'
  tahun?: string;
  skema?: string; // misal: 'Hibah Terapan', 'Kerjasama Industri', 'Riset Internal', 'DRTPM'
}

export interface KontribusiPenelitianDosenItem {
  nidn: string;
  nama: string;
  avatarColor: string;
  penelitian: PenelitianItem[];
  rekognisi: string[];
}

export const INITIAL_PENELITIAN_DOSEN_DATA: KontribusiPenelitianDosenItem[] = [
  {
    nidn: '0001017806',
    nama: 'Dr. Ahmad Syarif, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    penelitian: [
      { id: 'lit-1', judul: 'Pengembangan Smart Office Automation Berbasis IoT dan Edge Computing untuk Efisiensi Energi Perkantoran', kerjasamaInstansi: 'PT Telekomunikasi Indonesia Tbk', tahun: '2024', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-2', judul: 'Sistem Deteksi Anomali Jaringan Transaksi Keuangan Menggunakan Algoritma Machine Learning pada UMKM Digital', kerjasamaInstansi: 'Dinas Koperasi & UMKM Jawa Tengah', tahun: '2023', skema: 'Hibah Terapan Vokasi' },
      { id: 'lit-3', judul: 'Rancang Bangun Gateway IoT Multi-Sensor untuk Pemantauan Kualitas Lingkungan Kerja Terpadu', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2022', skema: 'Riset Internal Terapan' },
      { id: 'lit-4', judul: 'Analisis Keandalan Infrastruktur Jaringan Nirkabel pada Kawasan Industri Terpadu Kendal', kerjasamaInstansi: 'PT Kawasan Industri Kendal', tahun: '2021', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-5', judul: 'Optimasi Routing Protokol Low-Power WAN untuk Pengelolaan Aset Pergudangan', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2020', skema: 'Riset Fundamental' },
    ],
    rekognisi: ['Keynote Speaker: International Conference on Vocational Engineering & Technology (2024)', 'Reviewer Hibah Riset Terapan Kemendikbudristek (2023)'],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, S.E., M.B.A.',
    avatarColor: 'from-emerald-600 to-teal-600',
    penelitian: [
      { id: 'lit-6', judul: 'Strategi Omnichannel Marketing dan Adopsi AI Chatbot terhadap Loyalitas Konsumen B2B Ekspor', kerjasamaInstansi: 'PT Solusi Bisnis Ekspor Asia', tahun: '2024', skema: 'Riset Terapan Industri' },
      { id: 'lit-7', judul: 'Evaluasi Kesiapan Digital UMKM Furnitur Jepara dalam Menembus Pasar Uni Eropa Pasca Pandemi', kerjasamaInstansi: 'KADIN Jawa Tengah', tahun: '2023', skema: 'Hibah Terapan Vokasi' },
      { id: 'lit-8', judul: 'Model Penerimaan Teknologi Platform Cross-Border E-Commerce pada Eksportir Muda', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2021', skema: 'Riset Dosen Pemula' },
    ],
    rekognisi: ['Best Paper Award: ASEAN Marketing Association Annual Summit (2023)'],
  },
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi Nurhadi, M.T.',
    avatarColor: 'from-violet-600 to-purple-600',
    penelitian: [
      { id: 'lit-9', judul: 'Implementasi Value Stream Mapping dan Lean Six Sigma untuk Reduksi Lead Time Produksi Garmen Ekspor', kerjasamaInstansi: 'PT Ungaran Sari Garments', tahun: '2025', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-10', judul: 'Model Ergonomi Stasiun Kerja Operator Berbasis Analisis Rapid Upper Limb Assessment (RULA)', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2024', skema: 'Riset Terapan' },
      { id: 'lit-11', judul: 'Optimasi Tata Letak Pabrik Manufaktur Otomotif Menggunakan Algoritma CRAFT dan Simulasi FlexSim', kerjasamaInstansi: 'PT Astra Daihatsu Motor', tahun: '2023', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-12', judul: 'Integrasi Total Productive Maintenance (TPM) dan OEE pada Mesin Cetak Logam Presisi', kerjasamaInstansi: 'PT Pindad (Persero)', tahun: '2022', skema: 'DRTPM Terapan' },
      { id: 'lit-13', judul: 'Studi Reduksi Pemborosan Material Kemasan Ekspor Menggunakan Metode 5S & Kaizen', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2020', skema: 'Riset Internal' },
      { id: 'lit-14', judul: 'Perancangan Meja Kerja Ergonomis untuk Industri Perakitan Elektronik', kerjasamaInstansi: 'PT Hartono Istana Teknologi (Polytron)', tahun: '2019', skema: 'Riset Terapan Industri' },
    ],
    rekognisi: ['Reviewer Nasional Jurnal Sinta 2 Rekayasa Industri (2022–2025)', 'Anggota Tim Akreditasi Program Studi Keteknikan LAM Teknik (2024)'],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M., Ak., CA',
    avatarColor: 'from-amber-600 to-orange-600',
    penelitian: [
      { id: 'lit-15', judul: 'Determinan Adopsi Standar Akuntansi Keuangan Entitas Mikro Kecil Menengah (SAK EMKM) Berbasis Cloud', kerjasamaInstansi: 'Dinas Koperasi & UMKM Kota Semarang', tahun: '2024', skema: 'Hibah Terapan Vokasi' },
      { id: 'lit-16', judul: 'Pengaruh Penggunaan Sistem Pembayaran Non-Tunai QRIS terhadap Akurasi Arus Kas Usaha Kuliner', kerjasamaInstansi: 'Bank Indonesia Perwakilan Jawa Tengah', tahun: '2023', skema: 'Riset Kerjasama Instansi' },
      { id: 'lit-17', judul: 'Analisis Tingkat Kepatuhan Wajib Pajak Badan UMKM Pasca Penerapan UU Harmonisasi Peraturan Perpajakan', kerjasamaInstansi: 'KPP Pratama Semarang Barat', tahun: '2022', skema: 'Riset Terapan' },
      { id: 'lit-18', judul: 'Efektivitas Pengendalian Internal Berbasis COSO Framework pada Koperasi Simpan Pinjam Syariah', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2021', skema: 'Riset Dosen Pemula' },
    ],
    rekognisi: ['Pemakalah Terbaik Seminar Nasional Akuntansi Vokasi (SNAV) X (2023)'],
  },
  {
    nidn: '0020078005',
    nama: 'Dr. Hendra Setiawan, S.Kom., M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    penelitian: [
      { id: 'lit-19', judul: 'Arsitektur Microservices dan Event-Driven Processing untuk Sinkronisasi Data Riwayat Akademik Vokasi', kerjasamaInstansi: 'Kementerian Komunikasi dan Informatika RI', tahun: '2024', skema: 'DRTPM Riset Terapan' },
      { id: 'lit-20', judul: 'Implementasi Algoritma Enkripsi Hybrid RSA-AES pada Modul Audit Logbook Dokumen Digital Perkantoran', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2024', skema: 'Riset Internal' },
      { id: 'lit-21', judul: 'Model Prediksi Kebutuhan Kapasitas Server Cloud Menggunakan Recurrent Neural Networks (RNN)', kerjasamaInstansi: 'PT Telkom Data Ekosistem (NeutraDC)', tahun: '2023', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-22', judul: 'Pengembangan Sistem Manajemen Dokumen Elektronik Berbasis Blockchain untuk Integritas Ijazah', kerjasamaInstansi: 'LLDIKTI Wilayah VI Jawa Tengah', tahun: '2022', skema: 'Hibah Inovasi Vokasi' },
      { id: 'lit-23', judul: 'Analisis Performa Database NoSQL MongoDB vs PostgreSQL pada Data Transaksi Skala Besar', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2021', skema: 'Riset Fundamental' },
      { id: 'lit-24', judul: 'Sistem Informasi Monitoring Kinerja Dosen Berbasis Web Responsive dan PWA', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2019', skema: 'Riset Dosen Pemula' },
    ],
    rekognisi: ['Senior Member of IEEE Computer Society (2023–sekarang)', 'Associate Editor Jurnal Internasional Terindeks Scopus (2024)'],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.',
    avatarColor: 'from-rose-600 to-pink-600',
    penelitian: [
      { id: 'lit-25', judul: 'Green Supply Chain Management and Carbon Footprint Reduction in Central Java Furniture Industry', kerjasamaInstansi: 'Erasmus+ European Union Consortium', tahun: '2025', skema: 'Riset Internasional Kolaboratif' },
      { id: 'lit-26', judul: 'Dampak Kebijakan Pajak Ekspor dan Standar Sertifikasi SVLK terhadap Daya Saing Industri Kayu Indonesia', kerjasamaInstansi: 'Kementerian Perdagangan RI', tahun: '2024', skema: 'DRTPM Riset Terapan Unggulan' },
      { id: 'lit-27', judul: 'Resiliensi Rantai Pasok Global dan Strategi Substitusi Impor Bahan Baku Industri Manufaktur', kerjasamaInstansi: 'KADIN Jawa Tengah', tahun: '2023', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-28', judul: 'Model Akselerasi Ekspor Produk Halal UMKM ke Pasar Timur Tengah Melalui Digital Hub', kerjasamaInstansi: 'Bank Indonesia Jawa Tengah', tahun: '2022', skema: 'Hibah Terapan Vokasi' },
      { id: 'lit-29', judul: 'Evaluasi Kebijakan Tarif Preferensial ASEAN-Australia-New Zealand Free Trade Area (AANZFTA)', kerjasamaInstansi: 'Kementerian Luar Negeri RI', tahun: '2021', skema: 'Riset Kebijakan Strategis' },
      { id: 'lit-30', judul: 'Strategi Penetrasi Pasar Ekspor Kopi Spesialti Jawa Tengah ke Pasar Eropa Kontinental', kerjasamaInstansi: 'Dinas Perindustrian & Perdagangan Jateng', tahun: '2020', skema: 'Riset Terapan' },
      { id: 'lit-31', judul: 'Analisis Faktor Determinan Produktivitas Tenaga Kerja Sektor Jasa Logistik di Pelabuhan Tanjung Emas', kerjasamaInstansi: 'PT Pelabuhan Indonesia (Pelindo)', tahun: '2019', skema: 'Riset Kerjasama BUMN' },
      { id: 'lit-32', judul: 'Studi Kelayakan Pengembangan Pusat Distribusi Ekspor Vokasi Terpadu di Jawa Tengah Bagian Utara', kerjasamaInstansi: 'Bappeda Provinsi Jawa Tengah', tahun: '2019', skema: 'Riset Kerjasama Pemprov' },
    ],
    rekognisi: ['Peneliti Terbaik Bidang Sosial Humaniora Kemendikbudristek (2023)', 'Staf Ahli Komite Ekonomi Terapan Jawa Tengah (2021–2025)'],
  },
  {
    nidn: '0008098301',
    nama: 'Dewi Lestari, S.S., M.Hum.',
    avatarColor: 'from-fuchsia-600 to-purple-600',
    penelitian: [
      { id: 'lit-33', judul: 'Analisis Komparatif Wacana Korespondensi Bisnis Ekspor Berbahasa Inggris pada Mitra Dagang Asia Timur', kerjasamaInstansi: 'Japan External Trade Organization (JETRO)', tahun: '2024', skema: 'Riset Internasional' },
      { id: 'lit-34', judul: 'Pengembangan Modul ESP Berbasis Simulasi Virtual Reality untuk Negosiasi Bisnis Ekspor Vokasi', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2023', skema: 'Hibah Inovasi Pembelajaran' },
      { id: 'lit-35', judul: 'Strategi Komunikasi Krisis Perusahaan Manufaktur Multinasional di Kawasan Berikat', kerjasamaInstansi: 'PT SAMI (Semarang Autocomp Manufacturing)', tahun: '2022', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-36', judul: 'Pola Komunikasi Lintas Budaya dalam Penyelesaian Sengketa Kontrak Dagang Internasional', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2020', skema: 'Riset Humaniora Terapan' },
    ],
    rekognisi: ['Visiting Researcher di Nanyang Technological University Singapore (2024)'],
  },
  {
    nidn: '0014028604',
    nama: 'Bambang Kusuma, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    penelitian: [
      { id: 'lit-37', judul: 'Model Optimasi Rute Distribusi Armada Logistik Cold Chain Menggunakan Algoritma Genetika dan GIS', kerjasamaInstansi: 'PT Pos Logistik Indonesia', tahun: '2024', skema: 'Riset Terapan BUMN' },
      { id: 'lit-38', judul: 'Evaluasi Efisiensi Bongkar Muat Petikemas di Terminal Pelabuhan Tanjung Emas Menggunakan Metode Data Envelopment Analysis (DEA)', kerjasamaInstansi: 'PT Pelindo Terminal Petikemas Semarang', tahun: '2023', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-39', judul: 'Perancangan Sistem Manajemen Pergudangan Otomatis Berbasis RFID Tag untuk Suku Cadang Mesin', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2022', skema: 'Riset Terapan' },
    ],
    rekognisi: ['Ketua Tim Peneliti Konsorsium Logistik Vokasi Maritim Jawa Tengah (2024)'],
  },
  {
    nidn: '0025129002',
    nama: 'Nadia Putri, S.Pd., M.Pd.',
    avatarColor: 'from-emerald-600 to-teal-600',
    penelitian: [
      { id: 'lit-40', judul: 'Standardisasi Standar Operasional Prosedur (SOP) Keprotokolan Berbasis Budaya Layanan Prima', kerjasamaInstansi: 'Sekretariat Daerah Provinsi Jawa Tengah', tahun: '2024', skema: 'Riset Kerjasama Pemda' },
      { id: 'lit-41', judul: 'Efektivitas Media Digital Event Management dalam Penyelenggaraan Konferensi Internasional Hybrid', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2023', skema: 'Riset Dosen Pemula' },
    ],
    rekognisi: ['Narasumber Protokoler Nasional Asosiasi Perkantoran Indonesia (2023)'],
  },
  {
    nidn: '0030017903',
    nama: 'Dr. Agus Priyono, S.E., M.Si.',
    avatarColor: 'from-amber-600 to-orange-600',
    penelitian: [
      { id: 'lit-42', judul: 'Pengaruh Budaya Organisasi Agile dan Employee Well-Being terhadap Kinerja Karyawan Generasi Z', kerjasamaInstansi: 'PT Bank Pembangunan Daerah Jawa Tengah (Bank Jateng)', tahun: '2025', skema: 'Riset Terapan Perbankan' },
      { id: 'lit-43', judul: 'Model Pengukuran Efektivitas Program Upskilling Tenaga Kerja Vokasi Berbasis Kirkpatrick Four-Level Model', kerjasamaInstansi: 'Balai Besar Pelatihan Vokasi dan Produktivitas (BBPVP) Semarang', tahun: '2024', skema: 'DRTPM Terapan' },
      { id: 'lit-44', judul: 'Strategi Manajemen Talenta dan Retensi Karyawan Kunci pada Industri Manufaktur Padat Karya', kerjasamaInstansi: 'Asosiasi Pengusaha Indonesia (APINDO) Jateng', tahun: '2023', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-45', judul: 'Analisis Faktor Kepuasan Kerja dan Burnout pada Pekerja Kantor dengan Model Remote Working', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2022', skema: 'Riset Terapan' },
      { id: 'lit-46', judul: 'Karakteristik Kepemimpinan Transformasional Kepala Cabang dalam Transformasi Digital Layanan', kerjasamaInstansi: 'PT Pos Indonesia (Persero)', tahun: '2020', skema: 'Riset Terapan BUMN' },
    ],
    rekognisi: ['Narasumber Ahli Manajemen Talenta Kementerian Ketenagakerjaan RI (2024)'],
  },
  {
    nidn: '0018048503',
    nama: 'Ir. Maya Kartika, M.Sc.',
    avatarColor: 'from-cyan-600 to-blue-600',
    penelitian: [
      { id: 'lit-47', judul: 'Efektivitas Model Inkubasi Akselerator Kampus Vokasi terhadap Keberlanjutan Startup Mahasiswa', kerjasamaInstansi: 'Kementerian Investasi / BKPM RI', tahun: '2024', skema: 'Hibah Inovasi Kewirausahaan' },
      { id: 'lit-48', judul: 'Analisis Ekosistem Kewirausahaan Digital Berkelanjutan pada Sentra Industri Kreatif Jawa Tengah', kerjasamaInstansi: 'Dinas Kepemudaan, Olahraga dan Pariwisata Jateng', tahun: '2023', skema: 'Riset Terapan Pemprov' },
      { id: 'lit-49', judul: 'Model Pendanaan Crowdfunding dan Angel Investor bagi Usaha Rintisan Mahasiswa Politeknik', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2022', skema: 'Riset Dosen Pemula' },
      { id: 'lit-50', judul: 'Karakteristik Mindset Wirausaha Mahasiswa Tingkat Akhir Program Diploma Empat', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2021', skema: 'Riset Terapan' },
    ],
    rekognisi: ['Juri Nasional Kompetisi Wirausaha Mahasiswa Vokasi (PWMV) Kemendikbudristek (2023)'],
  },
  {
    nidn: '0005118702',
    nama: 'Rudi Hartono, S.Kom., M.M.',
    avatarColor: 'from-violet-600 to-purple-600',
    penelitian: [
      { id: 'lit-51', judul: 'Pemanfaatan Customer Lifetime Value (CLV) Modeling untuk Segmentasi Pelanggan E-Commerce B2C', kerjasamaInstansi: 'PT Toko Digital Nusantara', tahun: '2025', skema: 'Riset Kerjasama Industri' },
      { id: 'lit-52', judul: 'Analisis Sentimen Ulasan Pengguna Aplikasi FinTech Menggunakan Algoritma BERT dan RoBERTa', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2024', skema: 'Riset Terapan AI' },
      { id: 'lit-53', judul: 'Dashboard Analitik Real-Time untuk Prediksi Churn Rate Konsumen Belanja Online', kerjasamaInstansi: 'Mandiri / Internal Polines', tahun: '2023', skema: 'Riset Dosen Pemula' },
    ],
    rekognisi: ['Pemakalah Terbaik Konferensi Sains Data Bisnis Indonesia (2024)'],
  },
];
