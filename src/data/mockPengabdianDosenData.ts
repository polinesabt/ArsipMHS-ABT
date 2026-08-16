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
    nidn: '0012087501',
    nama: 'Dr. Ir. Fauzi, M.T.',
    avatarColor: 'from-blue-600 to-indigo-600',
    pkm: [
      {
        id: 'pkm-fauzi-1',
        namaKegiatan: 'Pelatihan dan Pendampingan Penerapan Standardisasi Tata Kelola Operasional bagi Pengrajin Logam Ceper Klaten',
        kerjasamaInstansi: 'Koperasi Batur Jaya Ceper & Dinas Perindustrian Klaten',
        tahun: '2024',
        skema: 'Program Kemitraan Masyarakat (PKM)',
      },
      {
        id: 'pkm-fauzi-2',
        namaKegiatan: 'Peningkatan Produktivitas Bengkel Bubut dan Las Melalui Penerapan Budaya Kerja 5S di Kaligawe Semarang',
        kerjasamaInstansi: 'Paguyuban Bengkel Logam Kaligawe',
        tahun: '2023',
        skema: 'Penerapan IPTEK Masyarakat',
      },
      {
        id: 'pkm-fauzi-3',
        namaKegiatan: 'Edukasi K3 (Keselamatan dan Kesehatan Kerja) dan Efisiensi Energi untuk Industri Rumahan Pengolahan Kayu',
        kerjasamaInstansi: 'Mandiri / Kelompok Usaha Warga Banyumanik',
        tahun: '2022',
        skema: 'Pengabdian Mandiri',
      },
    ],
    rekognisi: [
      'Piagam Penghargaan Pembina UMKM Unggulan Dinas Koperasi & UKM Jateng 2024',
      'Narasumber Sosialisasi K3 Industri Kecil Menengah Kota Semarang',
    ],
  },
  {
    nidn: '0015038202',
    nama: 'Siti Aminah, S.E., M.M.',
    avatarColor: 'from-emerald-600 to-teal-600',
    pkm: [
      {
        id: 'pkm-aminah-1',
        namaKegiatan: 'Pendampingan Digital Marketing & Onboarding Toko Online bagi Pengrajin Batik Pewarna Alami di Desa Wisata Jarum Klaten',
        kerjasamaInstansi: 'Kelompok Pengrajin Batik Jarum Lestari',
        tahun: '2024',
        skema: 'Program Kemitraan Masyarakat Wilayah (PKMW)',
      },
      {
        id: 'pkm-aminah-2',
        namaKegiatan: 'Pelatihan Manajemen Keuangan Sederhana dan Pembukuan Berbasis Aplikasi Smartphone untuk Pedagang Pasar Peterongan',
        kerjasamaInstansi: 'Paguyuban Pedagang Pasar Tradisional Semarang',
        tahun: '2023',
        skema: 'Pemberdayaan Masyarakat Pemula',
      },
    ],
    rekognisi: [
      'Fasilitator Nasional Pelatihan Digital Enterpreneurship Academy (DEA) Kominfo',
    ],
  },
  {
    nidn: '0022117003',
    nama: 'Prof. Budi Raharjo, Ph.D.',
    avatarColor: 'from-violet-600 to-purple-600',
    pkm: [
      {
        id: 'pkm-budi-1',
        namaKegiatan: 'Workshop Kesiapan Dokumen Ekspor & Sertifikasi Halal bagi Pelaku Industri Makanan Minuman Olahan Ekspor Jawa Tengah',
        kerjasamaInstansi: 'Dinas Perindustrian dan Perdagangan Provinsi Jawa Tengah',
        tahun: '2024',
        skema: 'Program Pengembangan Produk Ekspor (PPPE)',
      },
      {
        id: 'pkm-budi-2',
        namaKegiatan: 'Pendampingan Pembentukan Koperasi Produsen Kopi Arabika Gunung Kelir Ambarawa Menuju Pasar Ekspor Eropa',
        kerjasamaInstansi: 'Gabungan Kelompok Tani (Gapoktan) Ambarawa',
        tahun: '2023',
        skema: 'Penerapan Riset Pengabdian Unggulan PT',
      },
    ],
    rekognisi: [
      'Penasehat Ahli Forum Komunikasi Eksportir Jawa Tengah (FOKUS Jateng)',
    ],
  },
  {
    nidn: '0004058804',
    nama: 'Rina Wijaya, M.B.A.',
    avatarColor: 'from-amber-600 to-orange-600',
    pkm: [
      {
        id: 'pkm-rina-1',
        namaKegiatan: 'Pelatihan Korespondensi Email Bisnis Bahasa Inggris & Etiket Penawaran Harga kepada Calon Buyer Luar Negeri',
        kerjasamaInstansi: 'Komunitas Eksportir Muda Indonesia (KEMI) Chapter Jateng',
        tahun: '2024',
        skema: 'Program Kemitraan Masyarakat (PKM)',
      },
    ],
    rekognisi: [
      'Trainer Bahasa Inggris Bisnis Bersertifikat Cambridge English',
    ],
  },
  {
    nidn: '0020078005',
    nama: 'Hendra Setiawan, M.Kom.',
    avatarColor: 'from-cyan-600 to-blue-600',
    pkm: [
      {
        id: 'pkm-hendra-1',
        namaKegiatan: 'Penerapan Sistem Point of Sale (POS) Berbasis Cloud dan Manajemen Inventori Kasir untuk Koperasi Karyawan Polines',
        kerjasamaInstansi: 'Koperasi Konsumen Pegawai Polines',
        tahun: '2024',
        skema: 'Pengabdian Terapan Berbasis Teknologi',
      },
      {
        id: 'pkm-hendra-2',
        namaKegiatan: 'Pelatihan Literasi Keamanan Siber & Pencegahan Phishing Data Pelanggan bagi Karyawan Logistik Ekspedisi',
        kerjasamaInstansi: 'Asosiasi Logistik & Forwarder Indonesia (ALFI/ILFA) Semarang',
        tahun: '2023',
        skema: 'Pemberdayaan Masyarakat',
      },
    ],
    rekognisi: [
      'Instruktur Keamanan Informasi Komunitas Penggiat Linux Semarang (KPLS)',
    ],
  },
];
