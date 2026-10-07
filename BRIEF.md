# Brief: ARSIP MAHASISWA ABT

Sistem arsip digital & tracer study untuk Program Studi Administrasi Bisnis Terapan (ABT), Politeknik Negeri Semarang.

## Tujuan Utama

Menyatukan data mahasiswa aktif, cuti, dropout, dan alumni dalam satu sistem terintegrasi — menggantikan pencatatan manual/tersebar — agar prodi punya data valid dan terstruktur untuk kebutuhan **akreditasi** dan **tracer study** (pelacakan karier lulusan).

## Fitur per Peran

**Publik**
- `/validasi` — verifikasi identitas mahasiswa/alumni sebelum mengisi data (cegah data palsu)
- `/evaluasi` — survei evaluasi lulusan via link token (diisi pengguna lulusan/stakeholder, tanpa login)

**Mahasiswa/Alumni** (`/student`)
- Dashboard pribadi, form data diri, input prestasi (akademik & non-akademik: lomba, publikasi, HAKI, magang), riwayat karier pasca-lulus

**Dosen** (`/dosen`)
- Self-service profil, pengajaran, penelitian, pengabdian, waktu mengajar, luaran — dosen input data kinerjanya sendiri

**Tenaga Kependidikan** (`/tendik`)
- Profil tendik

**Admin** — dua sub-dashboard besar:
- *Kelola Dosen*: pengelolaan data dosen, kontribusi (pengajaran/penelitian/pengabdian), tenaga kependidikan, luaran penelitian & PKM, waktu mengajar
- *Kelola Mahasiswa*: insight dashboard (statistik mahasiswa/alumni), pengelolaan data, **AI Insight** (laporan naratif otomatis), evaluasi lulusan, form kustom (builder survei kepuasan), history logbook

**Developer** (`/developer/dashboard`)
- Panel teknis/maintenance tingkat developer

## Kelebihan Utama

1. **Data tervalidasi** — hanya mahasiswa/alumni terverifikasi yang bisa mengisi
2. **Proses cepat** — pengisian data 3–5 menit, form bergaya kuesioner interaktif
3. **Database terintegrasi** — satu sumber data untuk seluruh status mahasiswa
4. **AI Insight** — analisis otomatis jadi laporan naratif, langsung pakai untuk akreditasi
5. **Rekam prestasi lengkap** — akademik & non-akademik dalam satu portofolio
6. **Siap ekspor untuk akreditasi** — data terstruktur, tinggal ambil untuk pelaporan
