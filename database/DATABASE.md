# Database Documentation - Arsip Mahasiswa Prodi ABT

## 📋 Database Overview

Comprehensive MySQL database schema untuk aplikasi "Arsip Mahasiswa Prodi ABT Politeknik Negeri Semarang" - sistem manajemen data mahasiswa, alumni, tracer study, dan prestasi non-akademik.

**Database Name**: `arsip_mahasiswa_abt`  
**Type**: MySQL 5.7+  
**Charset**: utf8mb4  
**Collation**: utf8mb4_unicode_ci  

---

## 🏗️ Database Architecture

### **Entity Relationship Diagram**

```
??????????????????????????????????????????????????????????????????????
?                         USERS                                       ?
?  (id, username, password_hash, nama, role)                          ?
??????????????????????????????????????????????????????????????????????
                          ?
                 ???????????????????
                 ?                 ?
    ??????????????????????    ????????????????????
    ?     ADMINS         ?    ?     STUDENTS     ? ? Main Hub
    ?   (FK to users)    ?    ?   (nim, status)  ?
    ??????????????????????    ????????????????????
                                  ?
                    ?????????????????????????????
                    ?             ?             ?
        ????????????????????????  ???????????????????????????
        ?    TRACER_STUDY      ?  ?      ACHIEVEMENTS       ?
        ?    (alumni only)     ?  ?      (all users)        ?
        ????????????????????????  ???????????????????????????
                                                ?
                                   ???????????????????????????
                                   ? ACHIEVEMENT_ATTACHMENTS ?
                                   ?    (file metadata)      ?
                                   ???????????????????????????
```

---

## 📊 Table Specifications

### **1. USERS** - Unified Authentication

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK | UUID v4 |
| username | VARCHAR(50) | UNIQUE | Login username |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| nama | VARCHAR(100) | NOT NULL | Full name |
| role | ENUM('admin', 'student') | NOT NULL | User role |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation |
| last_login | TIMESTAMP | NULL | Last login time |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |

**Indexes**: username, role, created_at  
**Purpose**: Unified authentication for admin & student login

---

### **2. STUDENTS** - Central Profile Hub

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK | UUID v4 |
| nim | VARCHAR(20) | UNIQUE | Student ID number |
| nama | VARCHAR(100) | NOT NULL | Full name |
| jurusan | VARCHAR(50) | NOT NULL | Department (fixed: Administrasi Bisnis) |
| prodi | VARCHAR(100) | NOT NULL | Study Program (fixed: ABT) |
| status | ENUM(4) | NOT NULL | active, on_leave, dropout, alumni |
| tahun_masuk | INT | NOT NULL | Year of enrollment |
| tahun_lulus | INT | NULL | Year of graduation |
| email | VARCHAR(100) | NULL UNIQUE | Email address |
| no_hp | VARCHAR(20) | NULL | Phone number |
| alamat | TEXT | NULL | Address |
| user_id | VARCHAR(36) | UNIQUE FK | Reference to users |
| has_credentials | BOOLEAN | DEFAULT FALSE | Has login account |
| last_login | TIMESTAMP | NULL | Last login |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update |

**Indexes**: nim, status, tahun_lulus, email, status+tahun_lulus  
**Constraints**: tahun_lulus >= tahun_masuk  
**Purpose**: Central hub untuk semua data mahasiswa/alumni

---

### **3. ADMINS** - Admin Role Mapping

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK FK | FK to users.id |
| created_at | TIMESTAMP | DEFAULT NOW() | Admin creation date |

**Purpose**: Maps users with role='admin' to admins table for strong typing

---

### **4. TRACER_STUDY** - Alumni Career Tracking (Alumni Only)

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK | UUID v4 |
| student_id | VARCHAR(36) | UNIQUE FK | FK to students (one per student) |
| email | VARCHAR(100) | NOT NULL | Contact email |
| no_hp | VARCHAR(20) | NOT NULL | Phone number |
| media_sosial | VARCHAR(255) | NULL | Social media handle |
| linkedin | VARCHAR(255) | NULL | LinkedIn URL |
| career_status | ENUM(4) | NOT NULL | working, job_seeking, entrepreneur, further_study |
| tahun_pengisian | INT | NOT NULL | Year of submission |
| employment_data | JSON | NULL | Employment details (conditional) |
| job_seeking_data | JSON | NULL | Job seeking details (conditional) |
| entrepreneurship_data | JSON | NULL | Business details (conditional) |
| further_study_data | JSON | NULL | Further study details (conditional) |
| ringkasan_karir | TEXT | NULL | Career summary |
| bersedia_dihubungi | BOOLEAN | DEFAULT FALSE | Willing to be contacted |
| saran_komentar | TEXT | NULL | Suggestions/comments |
| created_at | TIMESTAMP | DEFAULT NOW() | Submission date |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update |

**Indexes**: career_status, tahun_pengisian, student_id  
**Polymorphic Pattern**: Only ONE of the 4 JSON fields is populated based on career_status  
**Constraint**: student_id harus punya status='alumni'  
**Purpose**: Track alumni career trajectory

**JSON Schemas**:

```json
// employment_data (career_status='working')
{
  "nama_perusahaan": "string",
  "lokasi_perusahaan": "string",
  "bidang_industri": "string",
  "jabatan": "string",
  "tahun_mulai_kerja": number,
  "tahun_selesai_kerja": number | null,
  "masih_aktif_kerja": boolean,
  "relevansi_kompetensi": "enum(5)",
  "kontak_profesional": "string | null"
}

// job_seeking_data (career_status='job_seeking')
{
  "lokasi_tujuan": "string",
  "bidang_diincar": "string",
  "lama_mencari": number // months
}

// entrepreneurship_data (career_status='entrepreneur')
{
  "nama_usaha": "string",
  "jenis_usaha": "string",
  "lokasi_usaha": "string",
  "tahun_mulai_usaha": number,
  "punya_karyawan": boolean,
  "jumlah_karyawan": number | null,
  "usaha_aktif": boolean,
  "relevansi_kompetensi": "enum(5)",
  "sosial_media_usaha": ["string", ...]
}

// further_study_data (career_status='further_study')
{
  "nama_kampus": "string",
  "program_studi": "string",
  "jenjang": "S1|S2|S3",
  "lokasi_kampus": "string",
  "tahun_mulai_studi": number,
  "tahun_selesai_studi": number | null,
  "masih_aktif_studi": boolean,
  "relevansi_kompetensi": "enum(5)"
}
```

---

### **5. ACHIEVEMENTS** - Non-Academic Achievement Records

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK | UUID v4 |
| student_id | VARCHAR(36) | FK | Reference to students |
| category | VARCHAR(50) | NOT NULL | Achievement category |
| subcategory | VARCHAR(50) | NOT NULL | Achievement subcategory |
| title | VARCHAR(255) | NOT NULL | Achievement title |
| description | TEXT | NULL | Detailed description |
| tanggal | DATE | NOT NULL | Achievement date |
| lokasi | VARCHAR(255) | NULL | Location |
| penyelenggara | VARCHAR(255) | NULL | Organizer/institution |
| tingkat | ENUM(4) | NULL | lokal, regional, nasional, internasional |
| peringkat | VARCHAR(100) | NULL | Ranking (e.g., Juara 1, Finalist) |
| verified | BOOLEAN | DEFAULT FALSE | Admin verified |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Last update |

**Indexes**: category, subcategory, student_id, tanggal DESC, student_id+category  
**Purpose**: Record non-academic achievements for all students

**Categories**:
- event_participation (seminar, competition, award, conference)
- scientific_work (journal_publication, proceedings, book_chapter, research_paper)
- intellectual_property (patent, copyright, trademark, industrial_design)
- applied_academic (internship, course_portfolio, entrepreneurship_course, ecommerce_project, ocai_assessment)
- entrepreneurship (active_business, past_business)
- self_development (student_exchange, certification, workshop, volunteer)

---

### **6. ACHIEVEMENT_ATTACHMENTS** - File Storage Metadata

| Column | Type | Constraint | Description |
|--------|------|-----------|---|
| id | VARCHAR(36) | PK | UUID v4 |
| achievement_id | VARCHAR(36) | FK | Reference to achievements |
| file_name | VARCHAR(255) | NOT NULL | Original filename |
| file_type | VARCHAR(50) | NOT NULL | MIME type (application/pdf, image/jpeg) |
| file_size | INT | NOT NULL | File size in bytes |
| file_path | VARCHAR(500) | NOT NULL | URL or server path to file |
| uploaded_at | TIMESTAMP | DEFAULT NOW() | Upload timestamp |

**Indexes**: achievement_id  
**Constraints**: file_size > 0  
**Purpose**: Store metadata for uploaded files (certificates, photos, documents)

---

---

## 🔄 Relationships

| Relation | Type | Cardinality | Behavior |
|----------|------|-------------|----------|
| users ↔ admins | 1:1 | 0..1 : 1 | CASCADE |
| users ↔ students | 1:1 | 0..1 : 1 | SET NULL |
| students ↔ tracer_study | 1:1 | 1 : 0..1 | CASCADE |
| students ↔ achievements | 1:N | 1 : 0..* | CASCADE |
| achievements ↔ achievement_attachments | 1:N | 1 : 0..* | CASCADE |

---

## 📈 Data Volume & Performance

**Expected Data Volumes**:
- Students: 100-1000
- Achievements: 500-5000
- Tracer Study: 50-500

**Performance Considerations**:
- Indexes on frequently queried columns
- JSON extraction for polymorphic tracer_study data
- Views untuk reporting & analytics

---

## 🔒 Security Notes

1. **Password Hashing**: Gunakan bcrypt di server (min cost 10)
2. **SQL Injection Prevention**: Always use prepared statements
3. **Data Validation**: Validate pada backend sebelum insert/update
4. **Access Control**: Implement role-based authorization
5. **Sensitive Data**: Consider encryption untuk phone/email jika diperlukan

---

## 📝 Common Queries

### Get Alumni dengan Tracer Study & Achievement Count
```sql
SELECT 
  s.id, s.nim, s.nama, s.tahun_lulus,
  t.career_status,
  COUNT(DISTINCT a.id) as achievement_count
FROM students s
LEFT JOIN tracer_study t ON s.id = t.student_id
LEFT JOIN achievements a ON s.id = a.student_id
WHERE s.status = 'alumni'
GROUP BY s.id
ORDER BY s.tahun_lulus DESC;
```

---

## 📦 Deployment Checklist

- [ ] Database created di XAMPP lokal
- [ ] schema.sql imported successfully
- [ ] seed.sql imported successfully
- [ ] All tables created & populated
- [ ] Foreign key constraints verified
- [ ] Demo login credentials tested
- [ ] Ready untuk Phase 3: PHP Backend API

---

## 📞 Support

**Questions atau Issues?**
- Check IMPORT_GUIDE.md untuk step-by-step import instructions
- Verify data dengan sample queries di section "Common Queries"
- Check troubleshooting section di IMPORT_GUIDE.md

---

**Database Status**: ✅ Ready for Production Deployment  
**Last Updated**: 2026-02-03  
**Version**: 1.0
