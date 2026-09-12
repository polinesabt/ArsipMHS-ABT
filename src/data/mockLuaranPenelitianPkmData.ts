export type KategoriLuaran = 'Penelitian' | 'PKM';

export type SumberPendanaan =
  | 'Perguruan Tinggi / Mandiri'
  | 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)'
  | 'Lembaga Luar Negeri';

export type JenisPublikasi =
  | 'Jurnal Nasional Tidak Terakreditasi'
  | 'Jurnal Nasional Terakreditasi'
  | 'Jurnal Internasional'
  | 'Jurnal Internasional Bereputasi'
  | 'Seminar Wilayah, Lokal, Perguruan Tinggi'
  | 'Seminar Nasional'
  | 'Seminar Internasional'
  | 'Tulisan di Media Massa Nasional'
  | 'Tulisan di Media Massa Internasional'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional'
  | 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional';

export interface LuaranItem {
  id: string;
  kategori: KategoriLuaran;
  judul: string;
  tahun: string;
  sumberPendanaan: SumberPendanaan;
  jenisPublikasi: JenisPublikasi;
  urlLuaran?: string;
}

export interface DosenLuaranItem {
  nidn: string;
  nama: string;
  avatarColor: string;
  luaran: LuaranItem[];
}

export const SUMBER_PENDANAAN_OPTIONS: SumberPendanaan[] = [
  'Perguruan Tinggi / Mandiri',
  'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
  'Lembaga Luar Negeri',
];

export const JENIS_PUBLIKASI_GROUPS: { groupName: string; options: JenisPublikasi[] }[] = [
  {
    groupName: 'Jurnal Ilmiah',
    options: [
      'Jurnal Nasional Tidak Terakreditasi',
      'Jurnal Nasional Terakreditasi',
      'Jurnal Internasional',
      'Jurnal Internasional Bereputasi',
    ],
  },
  {
    groupName: 'Seminar / Prosiding',
    options: [
      'Seminar Wilayah, Lokal, Perguruan Tinggi',
      'Seminar Nasional',
      'Seminar Internasional',
    ],
  },
  {
    groupName: 'Tulisan Media Massa',
    options: [
      'Tulisan di Media Massa Nasional',
      'Tulisan di Media Massa Internasional',
    ],
  },
  {
    groupName: 'Pagelaran / Pameran / Forum Ilmiah',
    options: [
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah',
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional',
    ],
  },
];

export function calculatePenelitianCount(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.filter((l) => l.kategori === 'Penelitian').length;
}

export function calculatePkmCount(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.filter((l) => l.kategori === 'PKM').length;
}

export function calculateTotalLuaran(dosen: DosenLuaranItem): number {
  if (!dosen || !dosen.luaran) return 0;
  return dosen.luaran.length;
}

export const INITIAL_DOSEN_LUARAN_DATA: DosenLuaranItem[] = [
  {
    nidn: '0001017806',
    nama: 'Dr. Ahmad Syarif, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    luaran: [
      {
        id: 'luaran-1',
        kategori: 'Penelitian',
        judul: 'IoT-Based Smart Attendance and Environmental Quality Monitoring for Vocational Office Automation',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-2',
        kategori: 'Penelitian',
        judul: 'Design and Performance Evaluation of LoRaWAN-Based Telemetry Systems in Industrial Park Logistics',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-3',
        kategori: 'PKM',
        judul: 'Penyediaan Akses Internet Surya dan Pemantauan Wilayah Berbasis IoT di Area Wisata Konservasi',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
      {
        id: 'luaran-4',
        kategori: 'Penelitian',
        judul: 'Machine Learning Classification for Anomaly Traffic in Digital Business Financial Networks',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-5',
        kategori: 'PKM',
        judul: 'Pelatihan Tata Kelola Keamanan Data Sekolah Berbasis Cloud Workspace untuk Pendidik Vokasi',
        tahun: '2021',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-6',
        kategori: 'Penelitian',
        judul: 'Evaluasi Protokol Jaringan Sensor Nirkabel untuk Efisiensi Daya pada Perangkat Cerdas Perkantoran',
        tahun: '2020',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, S.E., M.B.A.',
    avatarColor: 'from-emerald-600 to-teal-600',
    luaran: [
      {
        id: 'luaran-7',
        kategori: 'Penelitian',
        judul: 'Omnichannel Strategy and Artificial Intelligence Chatbot Adoption on B2B Export Consumer Loyalty',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-8',
        kategori: 'PKM',
        judul: 'Workshop Akselerasi Ekspor Digital dan Kepatuhan Bea Cukai bagi Pengrajin Ukir Jepara',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
      {
        id: 'luaran-9',
        kategori: 'Penelitian',
        judul: 'Digital Export Readiness Assessment of Indonesian Furniture SMEs in Post-Pandemic European Market',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-10',
        kategori: 'PKM',
        judul: 'Pendampingan Pemasaran Global Cross-Border E-Commerce bagi Pelaku UMKM Pesisir Semarang',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah',
      },
    ],
  },
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi Nurhadi, M.T.',
    avatarColor: 'from-violet-600 to-purple-600',
    luaran: [
      {
        id: 'luaran-11',
        kategori: 'Penelitian',
        judul: 'Model Optimasi Tata Letak Fasilitas dan Ergonomi Berbasis Lean Manufacturing pada Industri Garmen Ekspor',
        tahun: '2025',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-12',
        kategori: 'Penelitian',
        judul: 'Application of Value Stream Mapping and Six Sigma to Minimize Waste in Textile Assembly Lines',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-13',
        kategori: 'PKM',
        judul: 'Implementasi Sistem Keselamatan Kerja dan Ergonomi Stasiun Kerja pada Sentra Konveksi Kalipancur',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-14',
        kategori: 'Penelitian',
        judul: 'Simulation-Based Facility Layout Optimization Using CRAFT Algorithm in Automotive Component Manufacturing',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-15',
        kategori: 'PKM',
        judul: 'Rancang Bangun dan Diseminasi Alat Pemotong Singkong Semi Otomatis bagi Kelompok Wanita Tani',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      },
      {
        id: 'luaran-16',
        kategori: 'Penelitian',
        judul: 'Integrasi Total Productive Maintenance (TPM) untuk Peningkatan Nilai OEE Mesin Press Logam',
        tahun: '2021',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-17',
        kategori: 'Penelitian',
        judul: 'Analisis Postur Kerja Operator Perakitan Komponen Elektronik Menggunakan Metode RULA dan REBA',
        tahun: '2019',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
    ],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M., Ak., CA',
    avatarColor: 'from-amber-600 to-orange-600',
    luaran: [
      {
        id: 'luaran-18',
        kategori: 'Penelitian',
        judul: 'Analisis Determinan Minat Penggunaan Quick Response Code Indonesian Standard (QRIS) pada Usaha Mikro Kuliner',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-19',
        kategori: 'PKM',
        judul: 'Pendampingan Penyusunan Laporan Keuangan SAK EMKM dan Digital Payment bagi Pedagang Pasar Johar',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Wilayah',
      },
      {
        id: 'luaran-20',
        kategori: 'Penelitian',
        judul: 'Cloud-Based Financial Accounting Standard Adoption Among Micro and Small Enterprises in Central Java',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-21',
        kategori: 'PKM',
        judul: 'Sosialisasi Literasi Pajak UMKM dan Tata Cara Pelaporan SPT Tahunan melalui DJP Online',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-22',
        kategori: 'Penelitian',
        judul: 'Pengaruh Akuntabilitas dan Transparansi Laporan Keuangan terhadap Kepercayaan Anggota Koperasi Syariah',
        tahun: '2021',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0020078005',
    nama: 'Dr. Hendra Setiawan, S.Kom., M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    luaran: [
      {
        id: 'luaran-23',
        kategori: 'Penelitian',
        judul: 'Scalable Microservices Architecture for Academic Record Management in Higher Vocational Education Systems',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-24',
        kategori: 'Penelitian',
        judul: 'Blockchain-Enabled Digital Credential Verification Framework for Higher Vocational Institutions',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-25',
        kategori: 'PKM',
        judul: 'Pelatihan Tata Kelola Keamanan Siber, Proteksi Phishing, dan Backup Cloud untuk Guru SMK Kota Semarang',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-26',
        kategori: 'PKM',
        judul: 'Implementasi Sistem Informasi Desa (SID) Terintegrasi Layanan Administrasi Surat Kependudukan Mandiri',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
      {
        id: 'luaran-27',
        kategori: 'Penelitian',
        judul: 'Performance Benchmarking of Relational vs Document-Oriented NoSQL Databases in Large Scale Log Processing',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-28',
        kategori: 'Penelitian',
        judul: 'Desain dan Implementasi Progressive Web Application (PWA) untuk Monitoring Beban Kerja Dosen',
        tahun: '2020',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.',
    avatarColor: 'from-rose-600 to-pink-600',
    luaran: [
      {
        id: 'luaran-29',
        kategori: 'Penelitian',
        judul: 'Impact of Green Export Tax Incentives on Competitiveness of Furniture Industry: Empirical Evidence from Indonesian SMEs',
        tahun: '2025',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-30',
        kategori: 'Penelitian',
        judul: 'Supply Chain Resilience and Circular Economy Strategies in Indonesian Export-Oriented Manufacturing Sectors',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-31',
        kategori: 'PKM',
        judul: 'Penyuluhan Kebijakan Rantai Pasok Hijau dan Sertifikasi Carbon Neutral bagi Eksportir Kopi Spesialti',
        tahun: '2025',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Tulisan di Media Massa Internasional',
      },
      {
        id: 'luaran-32',
        kategori: 'PKM',
        judul: 'Klinik Ekspor Terpadu: Pendampingan Letter of Credit (L/C) dan Akselerasi Bea Cukai bagi Pengusaha Muda',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
      {
        id: 'luaran-33',
        kategori: 'Penelitian',
        judul: 'Halal Export Product Competitiveness and Digital Trade Hub Penetration in Middle East Markets',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-34',
        kategori: 'Penelitian',
        judul: 'Evaluasi Efektivitas Perjanjian Perdagangan Bebas AANZFTA terhadap Ekspor Industri Manufaktur Jawa Tengah',
        tahun: '2021',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-35',
        kategori: 'Penelitian',
        judul: 'Logistics Service Performance Determinants at Tanjung Emas Seaport Container Terminal',
        tahun: '2020',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-36',
        kategori: 'PKM',
        judul: 'Pameran Produk Inovasi Vokasi Berorientasi Ekspor pada Trade Expo Indonesia (TEI)',
        tahun: '2019',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Internasional',
      },
    ],
  },
  {
    nidn: '0008098301',
    nama: 'Dewi Lestari, S.S., M.Hum.',
    avatarColor: 'from-fuchsia-600 to-purple-600',
    luaran: [
      {
        id: 'luaran-37',
        kategori: 'Penelitian',
        judul: 'Standardization of English Business Correspondence Modules for Vocational Students in ASEAN Trade Integration',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Luar Negeri',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-38',
        kategori: 'PKM',
        judul: 'Pelatihan Bahasa Inggris Hospitality dan Komunikasi Pelayanan bagi Pramuwisata Kawasan Candi Gedongsongo',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
      {
        id: 'luaran-39',
        kategori: 'Penelitian',
        judul: 'Virtual Reality-Based English for Specific Purposes Simulation for Cross-Border Export Negotiations',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-40',
        kategori: 'Penelitian',
        judul: 'Crisis Communication Discourse Analysis in Multinational Export Processing Zone Enterprises',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0014028604',
    nama: 'Bambang Kusuma, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    luaran: [
      {
        id: 'luaran-41',
        kategori: 'Penelitian',
        judul: 'Evaluasi Kinerja Vendor Logistik Menggunakan Metode Analytic Hierarchy Process (AHP) di Kawasan Industri Candi',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-42',
        kategori: 'Penelitian',
        judul: 'Genetic Algorithm Optimization for Perishable Food Cold Chain Distribution Routing in Central Java',
        tahun: '2023',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-43',
        kategori: 'PKM',
        judul: 'Penerapan Sistem Manajemen Pergudangan FIFO dan Tata Letak Palet Gabah bagi Gapoktan Demak',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      },
      {
        id: 'luaran-44',
        kategori: 'Penelitian',
        judul: 'Rancang Bangun Modul Pelacak Kontainer Ekspor Berbasis RFID dan GPS Tracker',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0025129002',
    nama: 'Nadia Putri, S.Pd., M.Pd.',
    avatarColor: 'from-emerald-600 to-teal-600',
    luaran: [
      {
        id: 'luaran-45',
        kategori: 'Penelitian',
        judul: 'Standardisasi Prosedur Operasional Keprotokolan Berbasis Budaya Pelayanan Prima pada Instansi Pemerintahan',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-46',
        kategori: 'PKM',
        judul: 'Pelatihan Manajemen Grooming, Tata Krama Perkantoran, dan Public Speaking bagi Calon Tenaga Kerja Vokasi',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-47',
        kategori: 'Penelitian',
        judul: 'Efektivitas Penggunaan Platform Digital Event Management dalam Penyelenggaraan Sidang Terbuka Senat',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
    ],
  },
  {
    nidn: '0030017903',
    nama: 'Dr. Agus Priyono, S.E., M.Si.',
    avatarColor: 'from-amber-600 to-orange-600',
    luaran: [
      {
        id: 'luaran-48',
        kategori: 'Penelitian',
        judul: 'Pengaruh Kepemimpinan Transformasional dan Budaya Organisasi Agile terhadap Retensi Talenta Gen-Z pada Sektor Perbankan',
        tahun: '2025',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
      {
        id: 'luaran-49',
        kategori: 'Penelitian',
        judul: 'Measuring Upskilling Training Effectiveness for Vocational Labor Force Using Kirkpatrick Four-Level Model',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-50',
        kategori: 'PKM',
        judul: 'Pendampingan Penyusunan Key Performance Indicator (KPI) Berbasis Balanced Scorecard pada Koperasi Peternak Sapi',
        tahun: '2025',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-51',
        kategori: 'PKM',
        judul: 'Workshop Resolusi Konflik Hubungan Industrial dan Manajemen Stres Kerja di Lingkungan Pabrik Padat Karya',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
      {
        id: 'luaran-52',
        kategori: 'Penelitian',
        judul: 'Faktor-Faktor Determinan Kepuasan Kerja dan Work-Life Balance pada Skema Kerja Hibrida Tenaga Pendidik',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Nasional Terakreditasi',
      },
    ],
  },
  {
    nidn: '0018048503',
    nama: 'Ir. Maya Kartika, M.Sc.',
    avatarColor: 'from-cyan-600 to-blue-600',
    luaran: [
      {
        id: 'luaran-53',
        kategori: 'Penelitian',
        judul: 'Campus Accelerator Incubation Model Efficacy on Vocational Student Startup Sustainability and Growth',
        tahun: '2024',
        sumberPendanaan: 'Lembaga Dalam Negeri (di luar Perguruan Tinggi)',
        jenisPublikasi: 'Jurnal Internasional',
      },
      {
        id: 'luaran-54',
        kategori: 'PKM',
        judul: 'Pendampingan Sertifikasi NIB dan Desain Kemasan Ramah Lingkungan bagi Pengrajin Jamu Tradisional Kendal',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Pagelaran / Pameran / Presentasi dalam Forum di Tingkat Nasional',
      },
      {
        id: 'luaran-55',
        kategori: 'Penelitian',
        judul: 'Analisis Faktor Kunci Keberhasilan Kampanye Crowdfunding Produk Inovasi Mahasiswa Politeknik',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Nasional',
      },
      {
        id: 'luaran-56',
        kategori: 'PKM',
        judul: 'Bootcamp Business Model Canvas dan Pitching Investor untuk Pemuda Wirausaha Karang Taruna',
        tahun: '2022',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
    ],
  },
  {
    nidn: '0005118702',
    nama: 'Rudi Hartono, S.Kom., M.M.',
    avatarColor: 'from-violet-600 to-purple-600',
    luaran: [
      {
        id: 'luaran-57',
        kategori: 'Penelitian',
        judul: 'Customer Lifetime Value (CLV) Modeling and Churn Prediction in B2C E-Commerce Platforms Using Random Forest',
        tahun: '2025',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Jurnal Internasional Bereputasi',
      },
      {
        id: 'luaran-58',
        kategori: 'Penelitian',
        judul: 'Sentiment Analysis of Indonesian FinTech App Reviews Using Fine-Tuned IndoBERT Architecture',
        tahun: '2024',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Internasional',
      },
      {
        id: 'luaran-59',
        kategori: 'PKM',
        judul: 'Implementasi Dashboard Monitoring Penjualan Berbasis Looker Studio untuk Retail Tradisional Menuju Pasar Modern',
        tahun: '2025',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Tulisan di Media Massa Nasional',
      },
      {
        id: 'luaran-60',
        kategori: 'PKM',
        judul: 'Pelatihan Analisis Efektivitas Iklan Media Sosial dan Meta Ads bagi Wirausahawan Muda Kota Semarang',
        tahun: '2023',
        sumberPendanaan: 'Perguruan Tinggi / Mandiri',
        jenisPublikasi: 'Seminar Wilayah, Lokal, Perguruan Tinggi',
      },
    ],
  },
];
