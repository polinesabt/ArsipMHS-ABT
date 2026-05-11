# Database Arsip Mahasiswa ABT

## Instalasi di phpMyAdmin

1. Buka **phpMyAdmin** (biasanya `http://localhost/phpmyadmin`).
2. Klik tab **"SQL"**.
3. Buka file **`install.sql`** di editor, copy seluruh isinya, paste ke kotak SQL di phpMyAdmin.
4. Klik **"Go"** (atau "Kirim").

Atau:

1. Di phpMyAdmin klik tab **"Import"**.
2. Pilih file **`install.sql`** (dari folder `backend/database/`).
3. Klik **"Go"**.

Skrip akan:

- Membuat database **`arsipmhs`** (jika belum ada).
- Membuat semua tabel yang diperlukan.
- Membuat view untuk laporan.
- Mengisi data awal: 1 akun admin dan 10 aspek evaluasi lulusan.

## Kredensial demo (setelah seed lengkap)

Jika Anda juga menjalankan **`seed.sql`** (data mahasiswa & tracer sample):

- **Admin:** username `admin`, password `admin123`
- **Mahasiswa:** username `20190001` (NIM) atau `s1`, password `student123`

Hanya menjalankan **`install.sql`**: hanya akun admin (`admin` / `admin123`) yang tersedia.

## Seed 10 mahasiswa (opsional)

Untuk mengisi 10 mahasiswa contoh beserta tracer study dan prestasi:

1. Pastikan **install.sql** sudah dijalankan (database dan tabel ada).
2. Di phpMyAdmin pilih database **arsipmhs**, tab **Import** atau **SQL**.
3. Jalankan file **`seed-10-mahasiswa.sql`**.

Isi seed:
- **10 alumni** dengan NIM 20200010–20200019, password: **student123**
- **Tracer:** 4 bekerja, 3 wirausaha, 2 bekerja sambil wirausaha, 1 sedang mencari kerja
- **Prestasi** per mahasiswa (1–3 prestasi), kategori sesuai tabel: lomba, seminar, publikasi, magang, portofolio, wirausaha, pengembangan, organisasi

Login mahasiswa: gunakan **NIM** (mis. 20200010) dan password **student123**.

## Seed evaluasi + mahasiswa aktif (opsional)

Agar chart **Kepuasan Pengguna** dan **Mahasiswa Aktif** di Dashboard Admin terisi:

1. Jalankan **seed-10-mahasiswa.sql** dulu.
2. Lalu jalankan **`seed-evaluasi-dan-aktif.sql`**.

Isi: 1 campaign evaluasi, 3 respons survey (dengan nilai per aspek), dan 2 mahasiswa aktif (NIM 20210010, 20220015).

## Seed cepat untuk tab Pagelaran / Presentasi (Diseminasi)

Jika tab **Diseminasi Ilmiah Mahasiswa -> Pagelaran / Presentasi** masih kosong, jalankan seed ini:

1. Import file **`seed-pagelaran-demo.sql`** ke database `arsipmhs`.
2. Sinkronkan chart records dari root project:
   - `E:\XAMPP\php\php.exe backend/scripts/seed-sync-all-charts.php`

Catatan:
- Seed ini tidak mereset database.
- Seed menambahkan contoh data pagelaran/presentasi untuk NIM demo `20200011`, `20200015`, `20200018` (jika ada).

## Mengisi database agar chart Dashboard Insight terisi

Agar semua chart di **Dashboard Insight** (Admin) menampilkan data, lakukan berurutan:

1. **Instalasi dasar**  
   Jalankan **`install.sql`** di phpMyAdmin (database `arsipmhs`, admin + aspek evaluasi).

2. **Migrasi tabel chart & soft delete**  
   Di phpMyAdmin, pilih database **arsipmhs**, lalu jalankan (tab SQL atau Import) file migrasi berikut:
   - `migrations/2026-02-20-create-chart-records-tables.sql`
   - `migrations/2026-02-21-add-chart-record-visibility.sql`
   - `migrations/2026-02-24-student-soft-delete-recycle-bin.sql` (jika belum)
   - `migrations/2026-02-24-active-students-semester-stats.sql` (untuk chart Mahasiswa Aktif per semester)

3. **Seed data master**  
   **Opsi A – Satu file:** Jalankan **`seed-demo-charts.sql`** (berisi 10 alumni + tracer + prestasi + evaluasi + 2 mahasiswa aktif + data semester).  
   **Opsi B – Terpisah:** Jalankan **`seed-10-mahasiswa.sql`**, lalu **`seed-evaluasi-dan-aktif.sql`**.

4. **Sinkronisasi chart**  
   Dari root project, jalankan:
   ```bash
   php backend/scripts/seed-sync-all-charts.php
   ```
   Atau lewat API (setelah login admin): POST ke endpoint insight sync dengan body `{"section":"all"}`.  
   Script/API ini mengisi tabel `menu_*_records` dari data master sehingga chart bisa tampil.

Setelah itu, login admin (`admin` / `admin123`) dan buka **Dashboard Insight** untuk melihat chart.

## Konfigurasi .env

Pastikan di `.env` (atau konfigurasi backend):

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=arsipmhs
DB_USER=root
DB_PASS=
```

Sesuaikan `DB_USER` dan `DB_PASS` jika MySQL Anda memakai user lain.

## Konfigurasi SMTP Gmail (Email Verifikasi Login)

Untuk fitur aktivasi email login mahasiswa, backend memakai SMTP (default) melalui PHPMailer.

Pastikan dependency backend sudah terpasang:
- `cd backend`
- `php composer.phar install`

Tambahkan variabel berikut di `.env` server:

```env
EMAIL_DRIVER=smtp
EMAIL_FROM=no-reply@arsipmhs-abt.com
EMAIL_FROM_NAME=Arsip Mahasiswa ABT
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_SECURE=tls
EMAIL_SMTP_USER=your-gmail-address@gmail.com
EMAIL_SMTP_PASS=your-gmail-app-password
EMAIL_DEV_FALLBACK_ENABLED=0
```

Catatan Gmail:
- Gunakan **App Password** (bukan password login akun Google).
- Aktifkan 2-Step Verification pada akun Gmail pengirim sebelum membuat App Password.
- Pada production, `EMAIL_DEV_FALLBACK_ENABLED` harus `0` agar kegagalan SMTP tidak dianggap sukses.

## Export full database untuk production (unggah ke hosting)

Untuk membuat **satu file SQL** yang berisi **seluruh skema + seluruh data** database saat ini (untuk diunggah ke hosting production):

1. Pastikan MySQL berjalan dan `.env` di root project sudah berisi `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`.
2. Jalankan salah satu:
   - **Windows (XAMPP):** double-click **`export_production_dump.bat`** atau dari CMD:  
     `E:\XAMPP\php\php.exe backend\database\export_full_for_production.php`
   - **Atau dari terminal (jika PHP di PATH):**  
     `php backend/database/export_full_for_production.php`
3. File hasil: **`backend/database/production_full_dump.sql`**.  
   (Bisa ganti nama output: `php export_full_for_production.php nama_file.sql`)
4. Di hosting production: buat database kosong (jika belum), lalu **Import** file `production_full_dump.sql` lewat phpMyAdmin atau `mysql -u user -p nama_db < production_full_dump.sql`.

File SQL yang dihasilkan sudah memuat:
- `CREATE DATABASE` + `USE`
- Semua tabel (DROP IF EXISTS + CREATE + INSERT data)
- Semua view
- `SET NAMES utf8mb4` dan `FOREIGN_KEY_CHECKS` agar import aman

## Refactor Prestasi SSOT (Import Excel per Kategori)

Untuk mengaktifkan skema prestasi per kategori + endpoint import Excel:

1. Install dependency backend (PhpSpreadsheet):
   - `cd backend`
   - `composer install`
2. Jalankan migration refactor:
   - `php backend/scripts/migrate-prestasi-ssot.php`

Migration ini akan:
- membuat tabel prestasi per kategori dan tabel lampiran per kategori,
- membuat tabel log import (`prestasi_import_logs`, `prestasi_import_log_details`),
- memigrasikan data legacy dari `achievements` ke tabel baru,
- membuat compatibility view `achievements` dan `achievement_attachments`.
