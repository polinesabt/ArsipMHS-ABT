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
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    penelitian: [
      {
        id: 'p-fauzi-1',
        judul: 'Model Optimasi Manajemen Rantai Pasok Berbasis Lean Six Sigma pada Industri Manufaktur Logam Jawa Tengah',
        kerjasamaInstansi: 'PT Industri Kereta Api (Persero) & Disperindag Jateng',
        tahun: '2024',
        skema: 'Hibah Riset Terapan DRTPM',
      },
      {
        id: 'p-fauzi-2',
        judul: 'Pengembangan Kerangka Kerja Mitigasi Risiko Operasional Logistik Maritim Pelabuhan Tanjung Emas Semarang',
        kerjasamaInstansi: 'PT Pelabuhan Indonesia (Pelindo) Regional 3',
        tahun: '2023',
        skema: 'Kerjasama Industri',
      },
      {
        id: 'p-fauzi-3',
        judul: 'Evaluasi Efisiensi Tata Letak Fasilitas Pabrik Konveksi Menggunakan Algoritma CRAFT di Kawasan Industri Wijayakusuma',
        kerjasamaInstansi: 'Mandiri / Internal PT',
        tahun: '2023',
        skema: 'Penelitian Dosen Pemula (PDP)',
      },
      {
        id: 'p-fauzi-4',
        judul: 'Perancangan Sistem Pelacakan Kontainer Terintegrasi QR-Code untuk Mempercepat Dwelling Time Bongkar Muat',
        kerjasamaInstansi: 'PT Samudera Indonesia Tbk Cabang Semarang',
        tahun: '2022',
        skema: 'Kerjasama Industri',
      },
    ],
    rekognisi: [
      'Paten Sederhana Terdaftar: Alat Penata Alur Material Semi-Otomatis (No. IDS000005432)',
      'Best Paper Award di International Conference on Applied Science and Technology (iCAST 2023)',
    ],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    avatarColor: 'from-emerald-600 to-teal-600',
    penelitian: [
      {
        id: 'p-aminah-1',
        judul: 'Analisis Faktor Determinan Niat Beli Konsumen Generasi Z pada Platform Social Commerce Menggunakan Model UTAUT2',
        kerjasamaInstansi: 'Asosiasi E-Commerce Indonesia (idEA)',
        tahun: '2024',
        skema: 'Hibah Riset Fundamental DRTPM',
      },
      {
        id: 'p-aminah-2',
        judul: 'Strategi Re-Branding Produk Kopi Lokal Temanggung Menembus Pasar Retail Modern dan Ekspor',
        kerjasamaInstansi: 'Dinas Koperasi dan UKM Kabupaten Temanggung',
        tahun: '2023',
        skema: 'Riset Terapan Unggulan PT',
      },
    ],
    rekognisi: [
      'Hak Cipta Modul: Panduan Praktis Audit Brand Digital bagi Pelaku UMKM (EC00202310892)',
    ],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    avatarColor: 'from-violet-600 to-purple-600',
    penelitian: [
      {
        id: 'p-budi-1',
        judul: 'Dampak Perjanjian Kemitraan Ekonomi Komprehensif Regional (RCEP) Terhadap Kinerja Ekspor Komoditas Non-Migas Indonesia',
        kerjasamaInstansi: 'Kementerian Perdagangan Republik Indonesia',
        tahun: '2024',
        skema: 'Hibah Penelitian Kolaborasi Internasional',
      },
      {
        id: 'p-budi-2',
        judul: 'Analisis Daya Saing Komparatif dan Kompetitif Produk Mebel Ukir Jepara di Pasar Uni Eropa Pasca-Regulasi EUDR',
        kerjasamaInstansi: 'Himpunan Industri Mebel dan Kerajinan Indonesia (HIMKI)',
        tahun: '2023',
        skema: 'Penelitian Terapan Unggulan Perguruan Tinggi',
      },
      {
        id: 'p-budi-3',
        judul: 'Estimasi Elastisitas Transmisi Nilai Tukar Rupiah Terhadap Harga Ekspor Manufaktur Jawa Tengah',
        kerjasamaInstansi: 'Bank Indonesia Kantor Perwakilan Jawa Tengah',
        tahun: '2022',
        skema: 'Kerjasama Riset Lembaga Negara',
      },
    ],
    rekognisi: [
      'Narasumber Ahli Badan Kebijakan Fiskal Kementerian Keuangan RI 2024',
      'Penghargaan Peneliti Terproduktif Bidang Soshum Polines 2023',
    ],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    avatarColor: 'from-amber-600 to-orange-600',
    penelitian: [
      {
        id: 'p-rina-1',
        judul: 'Strategi Penetrasi Pasar Ekspor Produk Olahan Singkong ke Pasar Timur Tengah Melalui Skema B2B Matchmaking',
        kerjasamaInstansi: 'Indonesian Trade Promotion Center (ITPC) Dubai',
        tahun: '2024',
        skema: 'Penelitian Dosen Pemula (PDP)',
      },
    ],
    rekognisi: [
      'Narasumber Webinar Nasional Kemenparekraf: Go Global UMKM Ekspor',
    ],
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    penelitian: [
      {
        id: 'p-hendra-1',
        judul: 'Rancang Bangun Dashboard Business Intelligence Berbasis Power BI untuk Monitoring KPI Penjualan Ekspor Real-Time',
        kerjasamaInstansi: 'PT Apparel One Indonesia Semarang',
        tahun: '2024',
        skema: 'Hibah Matching Fund Kedaireka',
      },
      {
        id: 'p-hendra-2',
        judul: 'Penerapan Algoritma Random Forest dalam Klasifikasi Profil Risiko Kredit Pelanggan B2B pada Perusahaan Distribusi',
        kerjasamaInstansi: 'PT Wicaksana Overseas International Tbk',
        tahun: '2023',
        skema: 'Penelitian Terapan Unggulan PT',
      },
      {
        id: 'p-hendra-3',
        judul: 'Sistem Informasi Pengelolaan Dokumen Ekspor (PEB & COO) Terintegrasi Cloud Server untuk Efisiensi Birokrasi Kargo',
        kerjasamaInstansi: 'PT Sarana Citranusa Kencana',
        tahun: '2022',
        skema: 'Kerjasama Industri',
      },
    ],
    rekognisi: [
      'Hak Cipta Source Code: Sistem Dashboard Ekspor V.2.1 Terdaftar di DJKI (000492182)',
    ],
  },
];
