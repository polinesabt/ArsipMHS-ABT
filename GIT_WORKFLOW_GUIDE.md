# 📌 Panduan Alur Kerja Git (Git Workflow Guide)
Proyek: **ArsipMHS-ABT**

Dokumen ini menjelaskan aturan main dan langkah praktis untuk mengelola kode secara paralel antara **pengembangan fitur baru** dan **perbaikan bug (hotfix)** menggunakan model Git yang sederhana namun kokoh.

---

## 🔑 Rumus & Aturan Dasar (STRICT)

Kita menggunakan 3 tipe branch (cabang):
*   **`main` (atau `master`)** $\rightarrow$ Cabang stabil yang sudah di-deploy/dipakai pengguna.
*   **`feature/*`** $\rightarrow$ Cabang untuk membuat fitur baru.
*   **`hotfix/*`** $\rightarrow$ Cabang untuk memperbaiki bug darurat dari production.

### ⚠️ Aturan Wajib
1. **Dilarang keras commit langsung ke `main`**.
2. Semua branch baru (`feature` maupun `hotfix`) **harus dibuat dari `main` versi terbaru**.
3. **Jangan pernah mencampur** kode fitur dan perbaikan bug dalam satu branch.
4. Ketika sebuah hotfix selesai di-merge ke `main`, branch fitur yang sedang aktif **wajib melakukan sinkronisasi (merge `main`)** agar mendapatkan perbaikan bug terbaru tersebut.

---

## 🚀 Studi Kasus & Cara Kerja Praktis

### 📂 Studi Kasus 1: Anda Ingin Membuat Fitur "Export PDF" (`feature/export-pdf`)
*Anda ingin fokus membuat fitur export PDF dari awal tanpa mengganggu kode utama.*

**Langkah-langkah:**
1. Masuk ke branch `main` dan ambil update terbaru:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch baru untuk fitur tersebut:
   ```bash
   git checkout -b feature/export-pdf
   ```
3. Kerjakan fitur Anda di branch ini, dan lakukan commit jika ada progress:
   ```bash
   git add .
   git commit -m "feat: tambahkan library PDF dan layout dasar"
   ```

---

### 📂 Studi Kasus 2: Ada Bug Login Error di Server Live (Saat Fitur PDF Belum Selesai)
*Ketika Anda sedang asyik membuat fitur PDF (di branch `feature/export-pdf`), tiba-tiba ada laporan bahwa user tidak bisa login di server live.*

**Langkah-langkah:**

**Bagian A: Amankan file fitur PDF yang belum selesai**
```bash
# Simpan pekerjaan PDF Anda ke dalam 'laci' sementara
git stash
```

**Bagian B: Buat branch perbaikan bug (`hotfix/fix-login`) dari `main`**
1. Pindah ke `main`:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch hotfix:
   ```bash
   git checkout -b hotfix/fix-login
   ```
3. Cari file yang rusak, perbaiki kodenya, lalu commit:
   ```bash
   git add .
   git commit -m "fix: perbaiki session expire saat login"
   ```
4. Merge perbaikan tersebut langsung ke `main` agar live:
   ```bash
   git checkout main
   git merge hotfix/fix-login
   git push origin main
   ```
5. Hapus branch hotfix karena sudah selesai:
   ```bash
   git branch -d hotfix/fix-login
   ```

**Bagian C: Kembali ke pengerjaan Fitur PDF & Sinkronisasi**
1. Kembali ke branch fitur PDF:
   ```bash
   git checkout feature/export-pdf
   ```
2. Ambil kembali pekerjaan PDF Anda yang tadi disimpan di stash:
   ```bash
   git stash pop
   ```
3. **PENTING!** Ambil perbaikan bug login tadi ke dalam branch PDF agar sinkron:
   ```bash
   git merge main
   ```
   *(Sekarang, branch fitur PDF Anda sudah memiliki perbaikan bug login terbaru dan Anda siap melanjutkan coding).*

---

### 📂 Studi Kasus 3: Fitur "Export PDF" Selesai dan Siap Digunakan
*Fitur export PDF di branch `feature/export-pdf` sudah selesai Anda buat dan sudah Anda tes berjalan dengan lancar.*

**Langkah-langkah:**
1. Pastikan semua file sudah di-commit di branch fitur Anda.
2. Pindah ke `main` dan pastikan kodenya paling update:
   ```bash
   git checkout main
   git pull origin main
   ```
3. Gabungkan branch fitur PDF ke `main`:
   ```bash
   git merge feature/export-pdf
   ```
4. Upload perubahan ke server/remote repository:
   ```bash
   git push origin main
   ```
5. Hapus branch fitur yang sudah selesai tersebut:
   ```bash
   git branch -d feature/export-pdf
   ```

---

## 💡 Ringkasan Perintah Penyelamat

*   **`git status`** $\rightarrow$ Untuk cek saat ini ada di branch mana dan file apa saja yang berubah.
*   **`git stash`** $\rightarrow$ Menyelamatkan perubahan setengah matang agar bisa pindah branch dengan aman.
*   **`git stash pop`** $\rightarrow$ Mengembalikan perubahan yang diselamatkan tadi ke workspace Anda.
