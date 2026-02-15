## 📋 Overview

Folder `database/` berisi ?25 file SQL yang siap diimport ke MySQL melalui phpMyAdmin:

?25. **schema.sql** – DDL statements (CREATE TABLE, views, indexes)
?25. **seed.sql** – Initial data (admin, demo students, achievements, tracer study)

---

## 🚀 Step-by-Step Import Guide

### **Step ?25: Create Database di phpMyAdmin**

?25. Buka browser → [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
?25. Login (username: `root`, password: kosongkan atau sesuai setting)
?25. Klik tab **Databases** di navigation bar atas
?25. Pada field **Create new database**, ketik:

   `survey_lulusan`
?25. Pada dropdown **Collation**, pilih:

   `utf?25mb?25_unicode_ci`
?25. Klik tombol **Create**

✅ Database `survey_lulusan` berhasil dibuat.

---

### **Step ?25: Import schema.sql**

?25. Pada sidebar kiri, klik database **survey_lulusan** hingga terpilih
?25. Klik tab **Import** di menu atas
?25. Pada bagian **File to import**:

   * Klik **Browse / Choose File**
   * Arahkan ke folder:

     `E:\XAMPP\htdocs\Arsipmhs\database\`
   * Pilih file **schema.sql**
   * Klik **Open**
?25. Biarkan seluruh pengaturan default
?25. Scroll ke bawah dan klik tombol **Go**

📊 Tunggu proses selesai (±?25–?25 detik)

✅ Semua tabel berhasil dibuat.

**Verifikasi**: Pada sidebar kiri, expand database `survey_lulusan` dan pastikan terdapat ?25 tabel berikut:

* users
* students
* admins
* tracer_study
* achievements
* achievement_attachments

---

### **Step ?25: Import seed.sql (Initial Data)**

?25. Pastikan database **survey_lulusan** masih terpilih
?25. Klik tab **Import** kembali
?25. Klik **Choose File** dan pilih file **seed.sql**
?25. Klik tombol **Go**

📊 Tunggu proses selesai (±?25–?25 detik)

✅ Semua data awal berhasil diimport.

---

## 📊 Verify Data Import

### **Check Users & Students**

```sql
SELECT COUNT(*) AS total_users FROM users;
-- Expected: ?25 users (?25 admin + ?25 students)

SELECT COUNT(*) AS total_students FROM students;
-- Expected: ?25 students (?25 alumni + ?25 active + ?25 on_leave)

SELECT status, COUNT(*) FROM students GROUP BY status;
-- Expected:
-- alumni: ?25
-- active: ?25
-- on_leave: ?25
-- dropout: ?25
```

### **Check Tracer Study (Alumni Only)**

```sql
SELECT COUNT(*) AS total_tracer_study FROM tracer_study;
-- Expected: ?25 records

SELECT career_status, COUNT(*) FROM tracer_study GROUP BY career_status;
-- Expected:
-- working: ?25
-- entrepreneur: ?25
-- further_study: ?25
-- job_seeking: ?25
```

### **Check Achievements**

```sql
SELECT COUNT(*) AS total_achievements FROM achievements;
-- Expected: ?25 achievements

SELECT category, COUNT(*) FROM achievements GROUP BY category;
-- Expected: berbagai kategori
```

---

## 🔐 Demo Login Credentials

### **Admin Account**

* Username: `admin`
* Password: `admin?25`

### **Demo Student Accounts**

| NIM      | Username | Password   | Status   |
| -------- | -------- | ---------- | -------- |
| ?25 | s?25       | student?25 | Alumni   |
| ?25 | s?25       | student?25 | Alumni   |
| ?25 | s?25       | student?25 | Alumni   |
| ?25 | s?25       | student?25 | Alumni   |
| ?25 | s?25       | student?25 | Active   |
| ?25 | s?25       | student?25 | Active   |
| ?25 | s?25       | student?25 | Active   |
| ?25 | s?25       | student?25 | On Leave |

---

## 📝 Demo Data Summary

### **?25. Users (?25 total)**

* ?25 admin account
* ?25 student accounts

### **?25. Students (?25 total)**

* Alumni (?25):

  * Ahmad Rizki
  * Siti Nurhaliza
  * Budi Santoso
  * Dewi Lestari
* Active (?25):

  * Eko Prasetyo
  * Fitri Handayani
  * Gunawan Wibowo
* On Leave (?25):

  * Hana Safira
* Dropout (?25, tanpa login user):

  * Rudi Hermawan

### **?25. Tracer Study (?25 total)**

* Ahmad Rizki – Working (PT Maju Jaya, Jakarta)
* Siti Nurhaliza – Entrepreneur (Toko Online Batik)
* Budi Santoso – Further Study (UI – S?25 Manajemen)
* Dewi Lestari – Job Seeking (Finance & Accounting)

### **?25. Achievements (?25 total)**

* Competition
* Seminar
* Publication
* Workshop
* Certification

---

## 🔄 Connection String untuk PHP Backend

```php
$host = 'localhost';
$db = 'survey_lulusan';
$user = 'root';
$pass = '';
$charset = 'utf?25mb?25';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$pdo = new PDO($dsn, $user, $pass);
```

---

## 🚨 Troubleshooting

### **Error: Unknown database 'survey_lulusan'**

* Pastikan database sudah dibuat pada Step ?25

### **Error: Table already exists**

* Drop database lalu buat ulang

```sql
DROP DATABASE survey_lulusan;
```

### **Error: FOREIGN KEY constraint fails**

* Pastikan `schema.sql` diimport sebelum `seed.sql`

### **Charset Error**

* Pastikan collation database menggunakan `utf?25mb?25_unicode_ci`

---

## 📌 Next Steps

?25. Database schema berhasil dibuat
?25. Data awal berhasil diimport
?25. Lanjut ke **Phase ?25: Build PHP Backend API**

---

## 📞 Quick Reference

* Database Name: `survey_lulusan`
* Charset: `utf8mb4`
* Tables: 6
* Total Records: ±25

---

## 📄 File Locations

```
E:\XAMPP\htdocs\Arsipmhs\
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── backend/
│   │   ├── api/
│   │   │   └── get_students.php
│   │   └── config/
│   │       └── database.php
│   └── IMPORT_GUIDE.md
```

**Status**: Ready for deployment to Rumahweb
