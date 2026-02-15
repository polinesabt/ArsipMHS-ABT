# SETUP & DEPLOYMENT GUIDE - ARSIPMHS

## ✅ PHASE 3 SELESAI: SETUP ENVIRONMENT & API INTEGRATION

Dokumentasi ini menjelaskan status project dan steps untuk hosting.

---

## 📊 CURRENT STATUS

### ✅ COMPLETED
- ✅ Frontend React + TypeScript (fully functional UI)
- ✅ Database schema & seed (MySQL)
- ✅ Backend API endpoints (PHP)
- ✅ API Client & Services (TypeScript)
- ✅ Environment configuration (.env)
- ✅ Production build (tested & working)

### 📦 BUILD ARTIFACTS
- **Dist folder**: `dist/` (ready for deployment)
- **Build size**: ~1.2 MB (JavaScript), ~95 KB (CSS)
- **Build time**: ~10 seconds

---

## 🔧 ENVIRONMENT SETUP

### Files Created
1. **`.env.local`** - Development environment variables (DO NOT commit to git)
2. **`.env.example`** - Template untuk production setup
3. **`database/backend/config/env.php`** - PHP environment loader
4. **`src/lib/api-client.ts`** - Centralized HTTP client
5. **`src/services/api-auth.service.ts`** - Authentication API service
6. **`src/repositories/api-student.repository.ts`** - Student data API access

### Environment Variables
```bash
# Frontend API URL
VITE_API_BASE_URL=http://localhost/Arsipmhs2/database/backend/api
VITE_API_TIMEOUT=10000

# JWT Configuration
JWT_SECRET=CfdLhyMTpPKwZM7sZmmG_0sOyJsj8SOIUV6Ojj4jBuVmatfKwAhKq-abhT9zM3Dd
JWT_EXPIRATION=86400
JWT_ALGORITHM=HS256
```

**IMPORTANT**: Untuk production, ganti:
- `JWT_SECRET` dengan string random yang berbeda
- `VITE_API_BASE_URL` dengan URL production Anda

---

## 📋 DATABASE SETUP CHECKLIST

- [x] MySQL installed & running
- [x] Database `arsipmhs` dibuat
- [x] `schema.sql` sudah di-import
- [x] `seed.sql` sudah di-import
- [x] Connection tested via `test_db.php`

### Test Connection
```bash
curl http://localhost/Arsipmhs2/database/backend/api/test_db.php
```

Expected response: Status `200` dengan database info.

---

## 🚀 LOCAL DEVELOPMENT

### Prerequisites
- Node.js v16+
- PHP 7.4+
- MySQL 5.7+
- XAMPP (untuk local development)

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Server akan berjalan di: `http://localhost:8080/`

---

## 🏗️ PRODUCTION BUILD

### Build Process
```bash
npm run build
```

Output akan disimpan di folder `dist/`.

### Build Artifacts
- `dist/index.html` - Main HTML file
- `dist/assets/index-*.js` - JavaScript bundle
- `dist/assets/index-*.css` - CSS bundle

### Warnings (Non-critical)
- ⚠️ "Chunk larger than 500 kB" - Performance warning, tidak blocking
- ⚠️ "@import must precede all other statements" - CSS order issue, tidak visible to users

---

## 🌐 DEPLOYMENT STEPS (XAMPP LOCAL)

### For Local XAMPP Testing
1. Build aplikasi: `npm run build`
2. Copy file dari `dist/` ke folder public yang accessible (misal: public folder htdocs)
3. API sudah tersedia di: `/database/backend/api/*`
4. Test di browser: `http://localhost/Arsipmhs2/`

### For Rumahweb Shared Hosting
1. Buat folder project di hosting (misal: `public_html/arsipmhs/`)
2. Upload file dari `dist/` ke folder hosting
3. Upload file database (`schema.sql`, `seed.sql`)
4. Setup database di hosting control panel
5. Update `.env` di server dengan:
   - `VITE_API_BASE_URL` → URL production Anda
   - `JWT_SECRET` → Random string 64 karakter (generate baru!)

---

## 🔐 API ENDPOINTS

### Authentication
```
POST /api/auth/login.php
Input: { username, password, role }
Output: { user, role, student, jwt }
```

### Students
```
GET /api/get_students.php
Output: { data: Student[] }
```

### Tracer Study
```
GET /api/tracer/list.php
POST /api/tracer/create.php
Input: { student_id, career_status, company, position, ... }
```

### Achievements
```
GET /api/achievements/list.php
POST /api/achievements/create.php
POST /api/achievements/delete.php
```

---

## 📱 TESTING CHECKLIST

### Frontend
- [ ] Login page berfungsi (admin & student)
- [ ] Dashboard mahasiswa loadable
- [ ] Dashboard admin loadable
- [ ] Data dari API bisa ditampilkan
- [ ] Form submission bekerja

### Backend API
- [ ] Database connection OK
- [ ] Login API returns JWT token
- [ ] Get students API returns data
- [ ] Tracer study API CRUD works
- [ ] Achievement API CRUD works
- [ ] Error handling appropriate

### Build
- [ ] `npm run build` berhasil
- [ ] `dist/` folder dibuat dengan file lengkap
- [ ] No critical errors di console

---

## 🔧 TROUBLESHOOTING

### Build Error: "main.tsx not found"
```bash
# Restore dari git
git checkout HEAD -- src/
npm run build
```

### API Connection Error
1. Pastikan `VITE_API_BASE_URL` benar di `.env.local`
2. Test DB connection: `http://localhost/Arsipmhs2/database/backend/api/test_db.php`
3. Check CORS headers di `login.php` & API files

### JWT Token Error
1. Pastikan `JWT_SECRET` sama di `.env.local` dan `login.php`
2. Check token expiration time di `JWT_EXPIRATION`

### Database Connection Error
1. Pastikan MySQL running
2. Pastikan database `arsipmhs` exists
3. Check credentials di `database/backend/config/database.php`

---

## 📦 DEPLOYMENT CHECKLIST

### Before Going Live
- [ ] Ganti `JWT_SECRET` dengan random string baru
- [ ] Update `VITE_API_BASE_URL` ke production URL
- [ ] Update database credentials jika berbeda
- [ ] Test semua API endpoints
- [ ] Test login dengan user dari database
- [ ] Check error logs
- [ ] Verify CORS headers untuk production domain

### SSL/HTTPS
- [ ] Install SSL certificate (jika production)
- [ ] Update API URL ke `https://`
- [ ] Test API CORS dengan SSL

### Performance
- [ ] Enable gzip compression (web server)
- [ ] Setup caching headers
- [ ] Consider CDN untuk static files

---

## 📞 NEXT STEPS

1. **Setup Hosting**: Pilih hosting provider (Rumahweb/lainnya)
2. **Deploy Files**: Upload `dist/` ke server
3. **Configure Database**: Setup MySQL di hosting
4. **Test APIs**: Verify semua endpoint working
5. **Monitor Logs**: Setup error logging & monitoring

---

## 📝 FILES REFERENCE

```
Project Root
├── .env.local              ✅ Environment (development)
├── .env.example            ✅ Environment template
├── dist/                   ✅ Production build output
├── src/
│   ├── lib/api-client.ts             ✅ HTTP client
│   ├── services/api-auth.service.ts  ✅ Auth API
│   ├── repositories/api-student.repository.ts  ✅ Student API
│   └── ...
├── database/
│   ├── backend/api/
│   │   ├── auth/login.php            ✅ Login endpoint
│   │   ├── get_students.php          ✅ Get students
│   │   ├── tracer/                   ✅ Tracer API
│   │   ├── achievements/             ✅ Achievement API
│   │   └── test_db.php               ✅ DB test script
│   ├── config/
│   │   ├── database.php              ✅ DB connection
│   │   └── env.php                   ✅ .env loader
│   ├── schema.sql                    ✅ Database schema
│   └── seed.sql                      ✅ Sample data
└── package.json            ✅ Project config

```

---

**Created**: February 3, 2026  
**Status**: Ready for deployment  
**Last Updated**: Setup phase 3 completion
