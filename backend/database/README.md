# Database Arsip Mahasiswa ABT

## Instalasi lokal atau staging

1. Jalankan `install.sql` pada database kosong.
2. Terapkan migrasi yang relevan sesuai versi skema. Untuk patch keamanan terbaru,
   periksa `docs/security-remediation-checklist.md` sebelum deploy.
3. Buat atau perbarui akun admin dari CLI dengan
   `php backend/scripts/bootstrap-admin.php` dan variabel environment
   `ADMIN_BOOTSTRAP_PASSWORD` minimal 16 karakter.
4. Gunakan fixture sintetis yang disimpan di luar repositori untuk pengujian.

Dump produksi, backup, data seed yang menyertakan kredensial, dan script perawatan
berisiko sengaja tidak dilacak Git. Jangan menambahkan file tersebut ke commit atau
mengunggahnya ke web root. Script `bootstrap-admin.php` hanya untuk CLI dan tidak
termasuk paket deploy.

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
