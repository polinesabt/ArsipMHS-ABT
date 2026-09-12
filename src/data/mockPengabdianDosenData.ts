export interface PKMItem {
  id: string;
  namaKegiatan: string; // 1. Nama Kegiatan PKM
  kerjasamaInstansi: string; // 2. Kerjasama Instansi/Organisasi / Mitra
  tahun?: string;
  skema?: string; // misal: 'Pemberdayaan Kemitraan Masyarakat', 'Penerapan IPTEK', 'Pengabdian Mandiri'
}

export interface KontribusiPengabdianDosenItem {
  nidn: string; // 0.1 NIDN/NIDK
  nama: string; // 0. Nama Dosen
  avatarColor: string;
  pkm: PKMItem[];
  rekognisi: string[]; // 3. Rekognisi (horizontal wrap)
}

export const INITIAL_PENGABDIAN_DOSEN_DATA: KontribusiPengabdianDosenItem[] = [
  {
    nidn: '0001017806',
    nama: 'Dr. Ahmad Syarif, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    pkm: [
      { id: 'pkm-1', namaKegiatan: 'Penyediaan Infrastruktur Jaringan Wi-Fi Tenaga Surya dan Pemantauan CCTV Berbasis IoT di Area Konservasi Mangrove Tapak Tugurejo', kerjasamaInstansi: 'Kelompok Sadar Wisata (Pokdarwis) Tapak Lestari Semarang', tahun: '2024', skema: 'Pemberdayaan Kemitraan Masyarakat' },
      { id: 'pkm-2', namaKegiatan: 'Pelatihan Otomasi Pengelolaan Data Inventaris Barang Berbasis Web bagi Staf Koperasi Sekolah Menengah Kejuruan', kerjasamaInstansi: 'SMK Negeri 5 Semarang', tahun: '2023', skema: 'Penerapan IPTEK Masyarakat' },
      { id: 'pkm-3', namaKegiatan: 'Digitalisasi Layanan Administrasi Kependudukan Tingkat Kelurahan Menggunakan Sistem Informasi Terpadu', kerjasamaInstansi: 'Kelurahan Tembalang Kota Semarang', tahun: '2022', skema: 'Program Kemitraan Wilayah' },
      { id: 'pkm-4', namaKegiatan: 'Workshop Keamanan Data dan Anti-Phishing bagi Guru dan Tenaga Kependidikan SMK Vokasi', kerjasamaInstansi: 'SMK Negeri 1 Semarang', tahun: '2020', skema: 'Pengabdian Mandiri' },
    ],
    rekognisi: ['Penghargaan Pengabdi Masyarakat Berdampak Lingkungan Kota Semarang (2024)'],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, S.E., M.B.A.',
    avatarColor: 'from-emerald-600 to-teal-600',
    pkm: [
      { id: 'pkm-5', namaKegiatan: 'Workshop Akselerasi Pemasaran Ekspor Digital dan Pembuatan Katalog Interaktif bagi Pengrajin Ukir Jepara', kerjasamaInstansi: 'Paguyuban Pengrajin Ukir Jepara Mandiri', tahun: '2024', skema: 'Pemberdayaan Kemitraan Masyarakat' },
      { id: 'pkm-6', namaKegiatan: 'Pendampingan Onboarding E-Commerce Ekspor dan Pembuatan Akun Alibaba bagi UMKM Kuliner Olahan Ikan', kerjasamaInstansi: 'Koperasi Nelayan Mina Makmur Tambaklorok', tahun: '2023', skema: 'Penerapan IPTEK' },
      { id: 'pkm-7', namaKegiatan: 'Pelatihan Copywriting dan Fotografi Produk dengan Smartphone bagi Pelaku UMKM Pemula', kerjasamaInstansi: 'Rumah BUMN Semarang', tahun: '2022', skema: 'Pengabdian Mandiri' },
    ],
    rekognisi: ['Fasilitator Utama Program Akselerasi Ekspor UMKM Disperindag Jateng (2023–2024)'],
  },
  {
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi Nurhadi, M.T.',
    avatarColor: 'from-violet-600 to-purple-600',
    pkm: [
      { id: 'pkm-8', namaKegiatan: 'Penerapan Ergonomi Stasiun Kerja dan Sistem K3 Berbasis 5S untuk Mengurangi Kelelahan Operator Konveksi', kerjasamaInstansi: 'Sentra Industri Konveksi Kalipancur Semarang', tahun: '2025', skema: 'Penerapan IPTEK Industri' },
      { id: 'pkm-9', namaKegiatan: 'Pelatihan Standardisasi Mutu Produk dan Audit Keselamatan Kerja di Pabrik Pengolahan Tahu Organik', kerjasamaInstansi: 'Kelompok Pengusaha Tahu Lestari Bandungan', tahun: '2024', skema: 'Pemberdayaan Masyarakat' },
      { id: 'pkm-10', namaKegiatan: 'Rancang Bangun Alat Bantu Pemotong Singkong Semi-Otomatis Hemat Energi untuk Produsen Keripik', kerjasamaInstansi: 'Kelompok Wanita Tani (KWT) Makmur Ungaran', tahun: '2022', skema: 'Penerapan Teknologi Tepat Guna' },
      { id: 'pkm-11', namaKegiatan: 'Bimbingan Teknis Efisiensi Penggunaan Energi Listrik dan Perawatan Mesin di Bengkel Las Tradisional', kerjasamaInstansi: 'Asosiasi Bengkel Las Mandiri Semarang', tahun: '2021', skema: 'Pengabdian Mandiri' },
      { id: 'pkm-12', namaKegiatan: 'Edukasi Manajemen Limbah B3 dan P3K di Tempat Kerja bagi Pekerja Sektor Informal', kerjasamaInstansi: 'Puskesmas Rowosari Semarang', tahun: '2019', skema: 'Pemberdayaan Masyarakat' },
    ],
    rekognisi: ['Tokoh Penggerak Penerapan K3 dan Ergonomi UMKM Jawa Tengah (2024)'],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M., Ak., CA',
    avatarColor: 'from-amber-600 to-orange-600',
    pkm: [
      { id: 'pkm-13', namaKegiatan: 'Pendampingan Penyusunan Laporan Keuangan Sederhana Berbasis Aplikasi ' + 'SIAPIK' + ' bagi Pedagang Pasar Tradisional', kerjasamaInstansi: 'Paguyuban Pedagang Pasar Johar Semarang', tahun: '2024', skema: 'Pemberdayaan Kemitraan Masyarakat' },
      { id: 'pkm-14', namaKegiatan: 'Pelatihan Perhitungan Harga Pokok Produksi (HPP) dan Literasi Pembayaran Non-Tunai QRIS bagi UMKM Batik', kerjasamaInstansi: 'Klaster Pengrajin Batik Semarangan', tahun: '2023', skema: 'Penerapan IPTEK' },
      { id: 'pkm-15', namaKegiatan: 'Bimbingan Teknis Pelaporan SPT Tahunan PPh Orang Pribadi & UMKM Berbasis e-Filing DJP Online', kerjasamaInstansi: 'Koperasi Simpan Pinjam Syariah Tembalang', tahun: '2022', skema: 'Pengabdian Mandiri' },
      { id: 'pkm-16', namaKegiatan: 'Sosialisasi Pencegahan Pinjaman Online Ilegal dan Manajemen Utang Usaha bagi Ibu-ibu PKK', kerjasamaInstansi: 'PKK Kecamatan Banyumanik Semarang', tahun: '2021', skema: 'Edukasi Masyarakat' },
    ],
    rekognisi: ['Instruktur Utama Literasi Keuangan Inklusif Bank Indonesia Jateng (2023–2025)'],
  },
  {
    nidn: '0020078005',
    nama: 'Dr. Hendra Setiawan, S.Kom., M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    pkm: [
      { id: 'pkm-17', namaKegiatan: 'Pelatihan Keamanan Siber Terapan, Tata Kelola Password, dan Backup Data Berbasis Google Workspace untuk Guru SMK', kerjasamaInstansi: 'Musyawarah Guru Mata Pelajaran (MGMP) RPL Kota Semarang', tahun: '2024', skema: 'Penerapan IPTEK' },
      { id: 'pkm-18', namaKegiatan: 'Implementasi Sistem Informasi Desa (SID) Terintegrasi Layanan Surat Online Mandiri Warga', kerjasamaInstansi: 'Pemerintah Desa Gedangan Kabupaten Semarang', tahun: '2023', skema: 'Program Kemitraan Wilayah' },
      { id: 'pkm-19', namaKegiatan: 'Workshop Pembuatan Toko Online Mandiri Menggunakan CMS WooCommerce untuk Komunitas Wirausaha Difabel', kerjasamaInstansi: 'Komunitas Sahabat Difabel Semarang', tahun: '2022', skema: 'Pemberdayaan Masyarakat Khusus' },
      { id: 'pkm-20', namaKegiatan: 'Pemberdayaan Santri dalam Pengelolaan Konten Website Dakwah dan Media Sosial Pesantren', kerjasamaInstansi: 'Pondok Pesantren Al-Fattah Semarang', tahun: '2020', skema: 'Pengabdian Mandiri' },
    ],
    rekognisi: ['Mentor Ahli Literasi Digital Vokasi Kemenkominfo (2023)'],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, S.E., M.Si., Ph.D.',
    avatarColor: 'from-rose-600 to-pink-600',
    pkm: [
      { id: 'pkm-21', namaKegiatan: 'Penyuluhan Strategi Kemitraan Rantai Pasok Hijau dan Sertifikasi Carbon Neutral bagi Eksportir Kopi', kerjasamaInstansi: 'Asosiasi Eksportir Kopi Indonesia (AEKI) Jateng', tahun: '2025', skema: 'Program Kemitraan Internasional' },
      { id: 'pkm-22', namaKegiatan: 'Klinik Ekspor Terpadu: Bimbingan Tata Niaga, Letter of Credit (L/C), dan Kepatuhan Pabean bagi UMKM Manufaktur', kerjasamaInstansi: 'Dinas Perindustrian dan Perdagangan Kota Semarang', tahun: '2024', skema: 'Pemberdayaan Kemitraan Masyarakat' },
      { id: 'pkm-23', namaKegiatan: 'Pendampingan Penyusunan Rencana Strategis Koperasi Unit Desa (KUD) Menuju Badan Usaha Mandiri', kerjasamaInstansi: 'KUD Sumber Makmur Ambarawa', tahun: '2023', skema: 'Penerapan IPTEK Manajemen' },
      { id: 'pkm-24', namaKegiatan: 'Workshop Negosiasi Kontrak Ekspor dan Penanganan Klaim Internasional untuk Pengusaha Muda', kerjasamaInstansi: 'HIPMI BPC Kota Semarang', tahun: '2021', skema: 'Pengabdian Mandiri' },
      { id: 'pkm-25', namaKegiatan: 'Sosialisasi Manfaat Kawasan Berikat dan Kemudahan Impor Tujuan Ekspor (KITE) bagi Industri Kerajinan', kerjasamaInstansi: 'Sentra Kerajinan Kulit Magetan', tahun: '2019', skema: 'Penyuluhan Kebijakan' },
    ],
    rekognisi: ['Penghargaan Pengabdi Masyarakat Utama Tingkat Nasional Polines (2023)'],
  },
  {
    nidn: '0008098301',
    nama: 'Dewi Lestari, S.S., M.Hum.',
    avatarColor: 'from-fuchsia-600 to-purple-600',
    pkm: [
      { id: 'pkm-26', namaKegiatan: 'Pelatihan Bahasa Inggris Percakapan Pelayanan Wisata dan Hospitality bagi Pramuwisata Candi Gedongsongo', kerjasamaInstansi: 'Himpunan Pramuwisata Indonesia (HPI) DPC Kab. Semarang', tahun: '2024', skema: 'Pemberdayaan Masyarakat Pariwisata' },
      { id: 'pkm-27', namaKegiatan: 'Bimbingan Penulisan Email Bisnis Berstandar Internasional bagi Staf Administrasi Ekspor Impor', kerjasamaInstansi: 'PT Samudera Indonesia Logistik', tahun: '2023', skema: 'Penerapan IPTEK Komunikasi' },
      { id: 'pkm-28', namaKegiatan: 'Peningkatan Keterampilan Presentasi Produk dalam Bahasa Inggris bagi Pelaku Ekonomi Kreatif', kerjasamaInstansi: 'Komunitas Industri Kreatif Semarang (KIKIS)', tahun: '2021', skema: 'Pengabdian Mandiri' },
    ],
    rekognisi: ['Trainer Kehormatan Dinas Kepemudaan, Olahraga dan Pariwisata Jateng (2024)'],
  },
  {
    nidn: '0014028604',
    nama: 'Bambang Kusuma, S.T., M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    pkm: [
      { id: 'pkm-29', namaKegiatan: 'Penerapan Manajemen Pergudangan FIFO (First In First Out) dan Layout Pallet untuk Mengurangi Kerusakan Stok Gabah', kerjasamaInstansi: 'Gabungan Kelompok Tani (Gapoktan) Makmur Demak', tahun: '2024', skema: 'Penerapan Teknologi Tepat Guna' },
      { id: 'pkm-30', namaKegiatan: 'Pelatihan Standardisasi Pengemasan dan Penanganan Barang Pecah Belah bagi Ekspedisi Lokal', kerjasamaInstansi: 'Paguyuban Jasa Kurir & Angkutan Semarang', tahun: '2023', skema: 'Pemberdayaan Masyarakat' },
      { id: 'pkm-31', namaKegiatan: 'Sosialisasi Keselamatan Pengemudi Angkutan Logistik Muatan Berat di Jalur Pantura', kerjasamaInstansi: 'Dishub Kota Semarang & Satlantas Polrestabes Semarang', tahun: '2022', skema: 'Pengabdian Terpadu' },
    ],
    rekognisi: ['Tenaga Ahli Pendamping Logistik Pangan Badan Ketahanan Pangan Jateng (2023)'],
  },
  {
    nidn: '0025129002',
    nama: 'Nadia Putri, S.Pd., M.Pd.',
    avatarColor: 'from-emerald-600 to-teal-600',
    pkm: [
      { id: 'pkm-32', namaKegiatan: 'Pelatihan Manajemen Etika Perkantoran, Grooming, dan Public Speaking bagi Calon Tenaga Kerja Muda Vokasi', kerjasamaInstansi: 'Balai Latihan Kerja (BLK) Kota Semarang', tahun: '2024', skema: 'Pemberdayaan Masyarakat Tenaga Kerja' },
      { id: 'pkm-33', namaKegiatan: 'Bimbingan Tata Naskah Dinas dan Pengarsipan Digital Surat Resmi bagi Perangkat Desa', kerjasamaInstansi: 'Kecamatan Gunungpati Kota Semarang', tahun: '2023', skema: 'Pengabdian Wilayah' },
    ],
    rekognisi: ['Instruktur Protokol Resmi Upacara Hari Jadi Kota Semarang (2024)'],
  },
  {
    nidn: '0030017903',
    nama: 'Dr. Agus Priyono, S.E., M.Si.',
    avatarColor: 'from-amber-600 to-orange-600',
    pkm: [
      { id: 'pkm-34', namaKegiatan: 'Pendampingan Manajemen Kinerja Karyawan dan Penyusunan Key Performance Indicator (KPI) pada Koperasi Unit Desa', kerjasamaInstansi: 'Koperasi Peternak Sapi Perah Getasan Kab. Semarang', tahun: '2025', skema: 'Penerapan IPTEK Manajemen' },
      { id: 'pkm-35', namaKegiatan: 'Pelatihan Resolusi Konflik Kerja dan Manajemen Stres bagi Pekerja Pabrik Padat Karya', kerjasamaInstansi: 'Serikat Pekerja Nasional (SPN) Cabang Semarang', tahun: '2024', skema: 'Pemberdayaan Kemitraan Tenaga Kerja' },
      { id: 'pkm-36', namaKegiatan: 'Workshop Penilaian Kinerja Karyawan Berbasis 360-Degree Feedback untuk Manajer Tingkat Menengah', kerjasamaInstansi: 'BPR BKK Jawa Tengah', tahun: '2022', skema: 'Penerapan IPTEK' },
      { id: 'pkm-37', namaKegiatan: 'Sosialisasi Regulasi Ketenagakerjaan dan Hak Perlindungan Pekerja Perempuan di Tempat Kerja', kerjasamaInstansi: 'Lembaga Bantuan Hukum (LBH) Asosiasi Perempuan Semarang', tahun: '2020', skema: 'Pengabdian Masyarakat' },
    ],
    rekognisi: ['Konsultan HR & Hubungan Industrial Terpilih BUMN Award Jateng (2024)'],
  },
  {
    nidn: '0018048503',
    nama: 'Ir. Maya Kartika, M.Sc.',
    avatarColor: 'from-cyan-600 to-blue-600',
    pkm: [
      { id: 'pkm-38', namaKegiatan: 'Pendampingan Legalitas Usaha (NIB & PIRT) serta Desain Kemasan Ramah Lingkungan bagi UMKM Olahan Herbal', kerjasamaInstansi: 'Kelompok Pengrajin Jamu Tradisional Kendal', tahun: '2024', skema: 'Pemberdayaan Kemitraan Masyarakat' },
      { id: 'pkm-39', namaKegiatan: 'Bootcamp Business Pitching dan Manajemen Arus Kas bagi Pelaku Usaha Rintisan Pemuda Karang Taruna', kerjasamaInstansi: 'Karang Taruna Kecamatan Pedurungan Semarang', tahun: '2023', skema: 'Penerapan IPTEK Kewirausahaan' },
      { id: 'pkm-40', namaKegiatan: 'Bimbingan Teknis Validasi Pasar dan Prototipe Produk untuk Siswa Sekolah Menengah Kejuruan', kerjasamaInstansi: 'SMK Negeri 8 Semarang', tahun: '2022', skema: 'Pengabdian Mandiri' },
      { id: 'pkm-41', namaKegiatan: 'Pelatihan Pembukuan Keuangan Usaha Rumahan bagi Ibu Rumah Tangga Mandiri', kerjasamaInstansi: 'Aisyiyah Ranting Tembalang', tahun: '2021', skema: 'Pemberdayaan Masyarakat' },
    ],
    rekognisi: ['Pembina Terbaik Kompetisi Bisnis Mahasiswa Jawa Tengah (2023)'],
  },
  {
    nidn: '0005118702',
    nama: 'Rudi Hartono, S.Kom., M.M.',
    avatarColor: 'from-violet-600 to-purple-600',
    pkm: [
      { id: 'pkm-42', namaKegiatan: 'Implementasi Dashboard Monitoring Penjualan Berbasis Looker Studio untuk Pengusaha Retail Tradisional', kerjasamaInstansi: 'Asosiasi Toko Kelontong Modern Semarang', tahun: '2025', skema: 'Penerapan Teknologi Tepat Guna' },
      { id: 'pkm-43', namaKegiatan: 'Pelatihan Analisis Efektivitas Iklan Media Sosial Menggunakan Meta Ads Manager bagi Wirausahawan Muda', kerjasamaInstansi: 'KADIN Muda Kota Semarang', tahun: '2024', skema: 'Pemberdayaan Kemitraan' },
      { id: 'pkm-44', namaKegiatan: 'Workshop Dasar Spreadsheet dan Visualisasi Data untuk Staf Administrasi Yayasan Pendidikan Sosial', kerjasamaInstansi: 'Yayasan Bina Insan Semarang', tahun: '2023', skema: 'Pengabdian Mandiri' },
    ],
    rekognisi: ['Fasilitator Data Analytics Digitalent Kominfo (2024)'],
  },
];
