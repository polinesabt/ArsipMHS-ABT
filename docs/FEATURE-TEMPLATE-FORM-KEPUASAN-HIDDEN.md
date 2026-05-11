# Fitur "Atur Template Form Kepuasan Pengguna" — Disembunyikan Sementara

**Status:** Fitur dan tombol **Atur Template Form Kepuasan** (Kustom Formulir Kepuasan Pengguna) saat ini **disembunyikan** dari UI. Backend dan rute tetap ada; hanya akses dari antarmuka admin yang dihilangkan.

**Tanggal disembunyikan:** 2026-03-03

---

## Yang disembunyikan

1. **Tombol "Atur Template Form Kepuasan"**  
   Sebelumnya ada di halaman **Admin → Evaluasi Lulusan** (Manajemen Evaluasi Lulusan), mengarah ke halaman Kustom Formulir Kepuasan.

2. **Teks penjelasan**  
   Paragraf: *"Form kepuasan yang dikirim ke mahasiswa mengikuti template aktif di Kustom Formulir Kepuasan Pengguna."*

3. **Menu sidebar admin**  
   Submenu **"Kustom Formulir"** di bawah **Evaluasi Lulusan** (link ke `/admin/kustom-form-kepuasan`) tidak ditampilkan. "Evaluasi Lulusan" sekarang hanya satu item yang mengarah ke `/admin/evaluasi-lulusan`.

---

## Yang tidak diubah

- Rute `/admin/kustom-form-kepuasan`, `/admin/kustom-form-kepuasan/new`, `/admin/kustom-form-kepuasan/edit/:id`, `/admin/kustom-form-kepuasan/preview/:id` tetap terdaftar di `App.tsx`. Jika user mengakses URL langsung, halaman tetap bisa dibuka.
- Backend API dan halaman: `AdminKustomFormKepuasanPage`, `AdminKustomFormBuilderPage`, `AdminKustomFormPreviewPage` tidak dihapus.
- Tab "Template Form Kepuasan Pengguna" di **Riwayat Logbook** (recycle bin) tetap ada.

---

## Cara mengaktifkan kembali

Saat fitur ini akan diaktifkan lagi:

1. **`src/pages/AdminEvaluasiLulusanPage.tsx`**  
   - Kembalikan tombol "Atur Template Form Kepuasan" di bagian header (di samping tombol Refresh Data).  
   - Kembalikan paragraf: *"Form kepuasan yang dikirim ke mahasiswa mengikuti template aktif di Kustom Formulir Kepuasan Pengguna."*  
   - Hapus atau sesuaikan komentar yang merujuk ke dokumen ini.

2. **`src/components/admin/admin-nav.config.ts`**  
   - Pada item **Evaluasi Lulusan**, tambahkan lagi `children` dengan submenu **Kustom Formulir**:  
     - `path`: `/admin/kustom-form-kepuasan`  
     - `icon`: `Pencil` (import dari `lucide-react`).  
   - Pastikan import `Pencil` ada di bagian atas file.

Setelah dua perubahan di atas, fitur dan tombol "Atur Template Form Kepuasan" akan tampil lagi di UI admin.

---

## Referensi file

| File | Peran |
|------|--------|
| `src/pages/AdminEvaluasiLulusanPage.tsx` | Tombol + teks penjelasan template form kepuasan |
| `src/components/admin/admin-nav.config.ts` | Submenu "Kustom Formulir" di sidebar |
| `src/App.tsx` | Rute halaman kustom form kepuasan (tidak diubah) |
| `src/pages/AdminKustomFormKepuasanPage.tsx` | Halaman utama Kustom Formulir Kepuasan |
| `src/pages/AdminKustomFormBuilderPage.tsx` | Halaman buat/edit template |
| `src/pages/AdminKustomFormPreviewPage.tsx` | Halaman preview template |
