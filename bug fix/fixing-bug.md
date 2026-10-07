# Fixing Bug: ArsipMHS-ABT

Rangkuman semua bug dan temuan dari sesi 7 Oktober 2026 (audit keamanan dan fungsi, uji beban, investigasi "Failed to fetch"), diurutkan dari yang paling parah.

- **PR #2**: https://github.com/polinesabt/ArsipMHS-ABT/pull/2 (draft, belum di-merge)
- **PR #3**: https://github.com/polinesabt/ArsipMHS-ABT/pull/3 (draft, belum di-merge)
- **Anda**: perlu tindakan atau keputusan Anda

Catatan: merge ke `main` langsung deploy ke produksi lewat `.github/workflows/deploy.yml`.

---

## Checklist tindakan Anda (urut prioritas)

1. [ ] **Restore database** dari JetBackup Rumahweb ke backup sebelum **17:10 WIB, 7 Okt 2026** (lihat Insiden di bawah).
2. [ ] **Hapus dari hosting** (cPanel File Manager): `public_html/backend/scripts/`, `public_html/backend/database/`, `public_html/backend/database productin ekspor/`.
3. [ ] **Ganti password admin**, karena password saat ini tertulis di repo publik.
4. [ ] **Jadikan repo private**, hapus dump database produksi dari repo, lalu reset password semua user yang ada di dump itu.
5. [ ] Matikan akun demo publik, atau arahkan ke data contoh.
6. [ ] Review dan merge PR #2 dan PR #3. Setelah itu upload manual `backend/vendor/.htaccess` dan `backend/storage/.htaccess` (workflow deploy tidak mengupload kedua folder itu).
7. [ ] Putuskan item TINGGI #10–#12 di bawah.
8. [ ] Hapus tabel `uji_agent` (tabel uji yang tidak sengaja dibuat, berisi 1 baris).

---

## Insiden: data produksi terhapus saat audit

| | |
|---|---|
| Waktu | 7 Okt 2026, sekitar 17:10 WIB (10:10 UTC) |
| Penyebab langsung | Saat mengecek URL apa saja yang terbuka untuk publik, Claude mengirim GET ke `/backend/scripts/clean-all-dummy-data.php`. Hosting langsung menjalankan file .php apa pun di folder itu. |
| Akar masalah | Folder `backend/scripts` dan `backend/database` ikut ter-deploy ke `public_html` tanpa pembatasan akses (bug KRITIS #1). Siapa pun di internet bisa memicu hal yang sama. |
| Dampak | Terhapus: semua data mahasiswa beserta akun login mahasiswa, `tracer_study`, `evaluasi_lulusan`, `satisfaction_form_responses`, `chart_records`, `system_error_logs`. Data dosen, tendik, dan admin tidak tersentuh. Script lain yang ikut terjalankan: `run_uji_agent.php` (membuat tabel `uji_agent`), `replace-admin-account.php` (password admin di-set ke nilai yang sama), dan `seed_rich_multiyear_dataset.php` (sepertinya gagal, tapi bisa jadi sempat menambah 12 data dosen contoh). |
| Pemulihan | Restore DB dari backup (Checklist #1). |
| Pelajaran | Jangan pernah membuka file .php non-API di situs live. Script perawatan tidak boleh ada di folder web. |
| Status | Script `clean-all-dummy-data.php` sudah dihapus dari repo (PR #3). Folder sudah diblokir lewat `.htaccess` (PR #3). Penghapusan di server masih menunggu Anda. |

---

## KRITIS

### 1. Script perawatan bisa dijalankan siapa pun dari browser
- **Lokasi:** `backend/scripts/*.php`, `backend/database/*.php` di hosting
- **Reproduksi:** buka `https://arsipmhs-abt.com/backend/scripts/<nama>.php`. Script langsung jalan (hapus data, seed data, ganti akun admin).
- **Dampak:** siapa pun bisa menghapus atau merusak seluruh database. Ini yang memicu insiden di atas.
- **Fix:** `.htaccess` deny-all di kedua folder, dan script hapus data dihapus dari repo (**PR #3**). Hapus kedua folder dari hosting (**Anda**).

### 2. Dump database produksi bisa diunduh publik, dan ada di repo publik
- **Lokasi:** `backend/database productin ekspor/arsw7919_arsipmhs.sql` (939 KB), di hosting dan di GitHub
- **Reproduksi:** buka URL file tersebut, atau lihat repo di GitHub.
- **Dampak:** sekitar 267 hash password user dan data pribadi mahasiswa bocor.
- **Fix:** akses web diblokir (**PR #3**). Hapus file dari hosting dan repo, jadikan repo private, dan reset password user (**Anda**).

### 3. Password admin tertulis di repo publik
- **Lokasi:** `backend/scripts/replace-admin-account.php`, `backend/database/migrations/2026-03-05-replace-admin-accounts-hard-remap.sql`, `install.sql`, `database_full_structure.sql`
- **Dampak:** siapa pun yang membaca repo bisa login sebagai admin.
- **Fix:** ganti password admin sekarang dan jadikan repo private (**Anda**).

### 4. Akun login apa pun bisa mengubah data mahasiswa lain (IDOR)
- **Lokasi:** `backend/api/students/update.php`
- **Reproduksi:** login sebagai mahasiswa A (atau dosen/tendik), lalu POST `{id: <id mahasiswa B>, nim: ..., status: ...}`.
- **Dampak:** NIM (username login), status, dan data pribadi mahasiswa mana pun bisa diubah.
- **Fix:** endpoint hanya untuk admin (**PR #3**).

### 5. Mahasiswa bisa membuat, mengubah, atau menghapus tracer study dan prestasi milik orang lain
- **Lokasi:** `api/tracer/create.php`, `api/tracer/update.php`, `api/achievements/create.php`, `update.php`, `delete.php`
- **Reproduksi:** login sebagai mahasiswa, lalu kirim `student_id`/`id` milik mahasiswa lain.
- **Fix:** ada pengecekan kepemilikan lewat `requireStudentWriteAccess()`. Admin/developer boleh semua, mahasiswa hanya datanya sendiri, role lain ditolak (**PR #3**).

### 6. Daftar mahasiswa, tracer, dan prestasi bisa dibaca tanpa login
- **Lokasi:** `api/students/list.php`, `api/tracer/list.php`, `api/achievements/list.php`
- **Reproduksi:** buka URL tanpa token. Seluruh data langsung dikembalikan.
- **Fix:** wajib login. Mahasiswa hanya melihat datanya sendiri, dan hash token verifikasi email tidak lagi dikirim (**PR #2**).

---

## TINGGI

### 7. Directory listing aktif, dan file lampiran bisa diunduh tanpa login
- **Lokasi:** `backend/storage/`, `backend/vendor/`, `backend/database/backups/`, `composer.phar`, `composer.json`
- **Fix:** `.htaccess` deny-all dan `Options -Indexes` (**PR #3**). Untuk `storage` dan `vendor`, `.htaccess`-nya perlu diupload manual (**Anda**).

### 8. Upload lampiran prestasi menyimpan ekstensi asli file, sehingga berisiko eksekusi kode
- **Lokasi:** `api/achievements/attachments/upload.php`
- **Dampak:** file berisi kode PHP yang lolos cek MIME bisa tersimpan dengan ekstensi `.php` di folder yang bisa diakses web.
- **Fix:** nama file di disk memakai ekstensi dari jenis file (MIME), dan folder storage diblokir (**PR #3**).

### 9. Dosen/tendik bisa melihat dan mengunggah lampiran prestasi mahasiswa
- **Lokasi:** `api/achievements/attachments/list.php`, `serve.php`, `upload.php`
- **Fix:** akses dibatasi ke admin dan mahasiswa pemiliknya (**PR #3**).

### 10. Tidak ada pembatasan percobaan login (brute force)
- **Lokasi:** `api/auth/login.php`
- **Fix usulan:** batasi jumlah percobaan per IP/username lewat tabel DB baru. **Anda** perlu memutuskan karena butuh migrasi.

### 11. Refresh token tidak pernah benar-benar berakhir
- **Lokasi:** `api/auth/refresh.php`, `config/auth.php`
- **Dampak:** refresh token identik dengan access token, dan saat refresh tidak ada pengecekan ke DB. Akun yang sudah dihapus atau dinonaktifkan tetap bisa memperpanjang sesi tanpa batas.
- **Fix usulan:** tambah klaim `typ`, lalu cek `users.is_active` saat refresh. **Anda** perlu memutuskan karena ini mengubah alur login.

### 12. Izin admin `can_edit_mahasiswa` / `can_edit_dosen` hanya dicek di frontend
- **Lokasi:** `api/students/*`, `api/dosen/save.php`
- **Fix usulan:** tambah pengecekan di server. **Anda** perlu mengonfirmasi aturannya.

### 13. Akun demo publik bisa membaca semua data asli
- **Dampak:** kredensial demo tercantum di repo publik, dan akun itu bisa membaca seluruh data mahasiswa.
- **Fix usulan:** matikan akun demo, atau isi mode demo dengan data contoh (**Anda**).

---

## Performa dan "Failed to fetch"

### 14. API backend jenuh di sekitar 30–45 request/detik
- **Bukti (uji beban 7 Okt, autocannon dari cloud, 30 detik per halaman):**
  - 15 user: 0 error, p99 daftar mahasiswa 2,0 detik
  - 50 user: 0 error, tapi API jenuh di sekitar 26–45 req/s dan p99 daftar mahasiswa naik ke 3,6 detik
  - Homepage statis tetap lancar (60 → 210 req/s)
- **Perkiraan:** di atas 100 user bersamaan, sebagian request akan timeout. Batas ini berasal dari limit PHP/MySQL di shared hosting Rumahweb.
- **Fix:** kurangi beban per request (#15, #16). Untuk beban yang lebih besar, upgrade paket hosting (**Anda**).

### 15. Response daftar mahasiswa terlalu besar (~492 KB per request)
- **Lokasi:** `api/students/list.php`. Login mahasiswa ikut memuat payload sekitar 3 MB.
- **Fix:** mahasiswa hanya mengambil datanya sendiri, sehingga payload login jadi kecil, dan filter prestasi dipercepat (**PR #2**).

### 16. Pesan "Failed to fetch" saat banyak user login bersamaan
- **Penyebab:** banyak login bersamaan dengan payload besar (#15) menabrak batas proses/CPU per akun di Rumahweb, sehingga koneksi diputus.
- **Fix:** payload diperkecil, ada satu kali retry otomatis, dan pesan error diganti menjadi "Koneksi ke server terputus" (**PR #2**).

---

## SEDANG / RENDAH

| # | Bug | Lokasi | Fix usulan | Status |
|---|---|---|---|---|
| 17 | `JWT_SECRET` punya nilai default bawaan jika `.env` kosong | `config/auth.php` | Pastikan `.env` produksi berisi secret acak ≥32 karakter; tolak jalan jika kosong | Anda |
| 18 | CORS memantulkan origin apa pun dengan `Allow-Credentials` jika `ALLOWED_ORIGIN` kosong | `config/cors.php` | Set `ALLOWED_ORIGIN=https://arsipmhs-abt.com` di `.env` | Anda |
| 19 | Error validasi biasa dikembalikan sebagai HTTP 500 dengan pesan exception mentah | hampir semua `api/*.php` | Bedakan 400 vs 500, sembunyikan detail DB | Belum |
| 20 | Judul template form kepuasan masuk ke HTML tanpa escape saat export PDF (XSS terbatas ke admin) | `src/pages/AdminKustomFormKepuasanPage.tsx:43` | Escape teks | Belum |
| 21 | `getClientIP()` mempercayai header `X-Forwarded-For` | `config/security.php` | Pakai `REMOTE_ADDR` | Belum |

Tidak ditemukan SQL injection. Semua query memakai prepared statement, dan nilai yang disisipkan langsung ke SQL sudah di-cast ke integer.

## Belum diuji
Uji fungsional lewat browser (alur UI admin dan mahasiswa, export, form) dihentikan setelah insiden supaya situs live tidak tersentuh lagi. Sebaiknya dilanjutkan di salinan lokal atau staging.
