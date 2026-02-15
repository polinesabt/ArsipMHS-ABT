# PRODUCTION DEPLOYMENT GUIDE

Panduan lengkap untuk deploy aplikasi ke production environment.

---

## 📋 PREREQUISITES

Sebelum deploy, pastikan:
- [ ] Server hosting sudah siap (Rumahweb/shared hosting)
- [ ] Domain sudah dikonfigurasi
- [ ] SSL certificate sudah terinstall (HTTPS)
- [ ] Database MySQL sudah dibuat
- [ ] PHP version >= 7.4
- [ ] Node.js sudah terinstall (untuk build)

---

## 🔧 STEP 1: PREPARE ENVIRONMENT

### 1.1 Generate JWT Secret

```bash
# Generate random 64-character string
openssl rand -hex 32

# Atau gunakan online generator:
# https://randomkeygen.com/
```

**PENTING:** Simpan JWT secret ini dengan aman!

### 1.2 Create Production Environment File

1. Copy `.env.example` ke `.env.production`
2. Update semua nilai:

```bash
# Application Environment
APP_ENV=production

# Frontend API URL (ganti dengan domain Anda)
VITE_API_BASE_URL=https://arsipmhs-abt.com/api

# Database Configuration
DB_HOST=localhost
DB_NAME=arsipmhs_prod
DB_USER=your_db_user
DB_PASS=your_secure_password

# JWT Configuration
JWT_SECRET=<paste-random-64-char-string-di-sini>
JWT_ALGORITHM=HS256
JWT_EXPIRATION=86400

# CORS Configuration
ALLOWED_ORIGIN=https://arsipmhs-abt.com
```

### 1.3 Build Frontend

```bash
# Install dependencies (jika belum)
npm install

# Build untuk production
npm run build
```

Output akan ada di folder `dist/`

---

## 📦 STEP 2: UPLOAD FILES

### 2.1 Upload Frontend Files

Upload semua file dari folder `dist/` ke:
```
public_html/
├── index.html
├── assets/
│   ├── index-*.js
│   └── index-*.css
└── ...
```

### 2.2 Upload Backend Files

Upload folder `database/backend/` ke:
```
public_html/database/backend/
├── api/
│   ├── auth/
│   ├── tracer/
│   ├── achievements/
│   └── ...
├── config/
│   ├── cors.php
│   ├── database.php
│   ├── env.php
│   └── security.php
└── ...
```

### 2.3 Upload Environment File

**PENTING:** Upload `.env.production` ke server, tapi:
- Jangan upload ke public folder!
- Upload ke folder yang tidak accessible dari web
- Atau rename menjadi `.env` dan pastikan tidak bisa diakses via browser

Lokasi yang disarankan:
```
/home/username/.env.production
```

Atau di dalam `database/backend/config/` (pastikan `.htaccess` protect file ini)

---

## 🗄️ STEP 3: SETUP DATABASE

### 3.1 Create Database

1. Login ke cPanel atau hosting control panel
2. Buat database baru: `arsipmhs_prod`
3. Buat user database dengan password kuat
4. Grant all privileges ke user tersebut

### 3.2 Import Schema

1. Login ke phpMyAdmin
2. Pilih database `arsipmhs_prod`
3. Import file `database/schema.sql`
4. Import file `database/seed.sql` (atau data awal)

### 3.3 Update Database Config

Pastikan `database/backend/config/database.php` atau `.env.production` sudah menggunakan:
- Database name yang benar
- Database user yang benar
- Database password yang benar

---

## ⚙️ STEP 4: CONFIGURE SERVER

### 4.1 Apache Configuration (.htaccess)

Buat file `.htaccess` di root public_html:

```apache
# Enable Rewrite Engine
RewriteEngine On

# Redirect to HTTPS (jika SSL sudah aktif)
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# SPA Routing - redirect semua request ke index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Protect .env files
<FilesMatch "\.env$">
    Order allow,deny
    Deny from all
</FilesMatch>

# PHP Configuration
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
</IfModule>
```

### 4.2 Protect Backend Config

Buat `.htaccess` di `database/backend/config/`:

```apache
# Deny access to config files
Order deny,allow
Deny from all
```

---

## 🔍 STEP 5: VERIFY DEPLOYMENT

### 5.1 Test Frontend

1. Buka `https://arsipmhs-abt.com`
2. Pastikan halaman load tanpa error
3. Check browser console untuk error
4. Test navigation

### 5.2 Test API

```bash
# Test database connection
curl https://arsipmhs-abt.com/api/test_db.php

# Test login (ganti dengan credentials yang benar)
curl -X POST https://arsipmhs-abt.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 5.3 Test Full Flow

1. Login sebagai admin
2. Login sebagai student
3. Test semua fitur utama
4. Test import/export Excel
5. Check error logs

---

## 🔐 STEP 6: SECURITY HARDENING

### 6.1 File Permissions

```bash
# Files: 644
find public_html -type f -exec chmod 644 {} \;

# Folders: 755
find public_html -type d -exec chmod 755 {} \;

# Config files: 600 (readable only by owner)
chmod 600 database/backend/config/.env.production
```

### 6.2 Disable Directory Listing

Tambahkan di `.htaccess`:
```apache
Options -Indexes
```

### 6.3 Remove Development Files

Pastikan file berikut **TIDAK** ada di production:
- `.env.local`
- `node_modules/`
- `src/` (source code)
- `package.json`, `package-lock.json`
- `vite.config.ts`
- `tsconfig.json`

---

## 📊 STEP 7: MONITORING

### 7.1 Error Logging

Setup error logging di PHP:
```php
// Di php.ini atau .htaccess
log_errors = On
error_log = /path/to/error.log
```

### 7.2 Monitor Logs

- Check Apache error logs
- Check PHP error logs
- Check application logs (jika ada)

### 7.3 Performance Monitoring

- Monitor server CPU, memory, disk usage
- Monitor database performance
- Setup alerts untuk resource usage tinggi

---

## 🔄 STEP 8: BACKUP STRATEGY

### 8.1 Database Backup

Setup automated backup:
- Daily backup database
- Keep last 7 days
- Store backup di lokasi aman

### 8.2 File Backup

- Backup `dist/` folder
- Backup `database/backend/` folder
- Backup `.env.production`

---

## 🚨 TROUBLESHOOTING

### Problem: 500 Internal Server Error

**Solution:**
1. Check PHP error logs
2. Check file permissions
3. Check `.htaccess` syntax
4. Check database connection

### Problem: CORS Error

**Solution:**
1. Check `ALLOWED_ORIGIN` di `.env.production`
2. Verify domain match dengan request origin
3. Check CORS headers di response

### Problem: Database Connection Failed

**Solution:**
1. Verify database credentials
2. Check database user permissions
3. Check database host (localhost vs IP)
4. Test connection via phpMyAdmin

### Problem: JWT Token Invalid

**Solution:**
1. Verify `JWT_SECRET` sama di frontend dan backend
2. Check token expiration
3. Verify token format

### Problem: Import Excel Error

**Solution:**
1. Check file size limit
2. Verify Excel format sesuai template
3. Check PHP memory limit
4. Check upload permissions

---

## ✅ POST-DEPLOYMENT CHECKLIST

- [ ] Frontend accessible via HTTPS
- [ ] API endpoints working
- [ ] Login berfungsi
- [ ] Database connection OK
- [ ] Import/Export Excel bekerja
- [ ] Error handling bekerja
- [ ] Security headers aktif
- [ ] CORS configured correctly
- [ ] File permissions correct
- [ ] Backup strategy setup
- [ ] Monitoring setup
- [ ] Documentation updated

---

## 📞 SUPPORT

Jika ada masalah:
1. Check error logs
2. Check browser console
3. Check network tab
4. Contact development team

---

**Last Updated:** $(date)
**Version:** 1.0.0
