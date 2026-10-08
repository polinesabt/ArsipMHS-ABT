# Data historis kepuasan pengguna

Dashboard Kepuasan Pengguna membaca formulir evaluasi dan tabel `import_kepuasan_pengguna` / `import_kepuasan_penilaian`. Pemanggilan `evaluations/charts.php?evaluation_id=all&include_imported=1` menambahkan penilaian historis. Pemanggilan biasa dan evaluasi per periode tetap memakai respons formulir saja.

SQL yang sudah diimpor memuat 34 baris alumni dan 260 penilaian dari 26 pengisi, pada 10 indikator. Baris tanpa penilaian, studi lanjut, dan wirausaha tidak menambah jumlah pengisi grafik kepuasan. Spreadsheet tidak memuat jawaban kesesuaian jurusan; data historis tidak menambah grafik tersebut.

Tampilan menggunakan dua tab: Kepuasan Pengguna dan Kesesuaian Jurusan dengan Pekerjaan. Di bawah grafik kepuasan terdapat daftar mahasiswa dengan NIM, tahun lulus, sumber/periode evaluasi, dan jumlah indikator yang dinilai. Daftar hanya memuat respons dengan penilaian valid yang masuk ke grafik, dapat dicari, dan ditampilkan 10 baris per halaman. Mahasiswa dapat tercatat pada beberapa sumber/periode; satu baris mewakili satu respons. Identitas diambil dari database melalui API yang memerlukan autentikasi admin.

Daftar mahasiswa hanya ditampilkan pada modul Kepuasan Pengguna. Ringkasan semua modul/overview menampilkan grafik tanpa daftar mahasiswa. Kolom Sumber Data menyediakan tombol Unduh PDF yang mengambil bukti formulir dari folder privat melalui endpoint admin `evaluations/download_satisfaction_evidence.php`. PDF asli diunduh langsung; bukti JPEG/PNG dikonversi menjadi satu halaman PDF di browser. Jika berkas belum tersedia di hosting, tombol nonaktif dengan keterangan. Dokumen tidak dibuat dari jawaban atau formulir kosong sebagai pengganti bukti.

## Production

1. Pastikan SQL sudah diimpor ke database yang dipakai oleh `DB_NAME` pada hosting.
2. Deploy frontend dan backend dari commit yang sama. Workflow `Deploy Website` berjalan manual lewat GitHub Actions, bukan otomatis setelah push. Ikuti prasyarat production dalam `docs/security-remediation-checklist.md` sebelum menjalankannya.
3. Buka dashboard Kepuasan Pengguna dan muat ulang halaman. Jika belum ada respons formulir lainnya, hasilnya 26 pengisi, 10 indikator, dan 260 penilaian.
4. Bukti PDF/gambar memakai folder privat `backend/storage/satisfaction_import/`. ZIP bukti di workspace dapat diekstrak ke `public_html`; dokumen ini tidak dikirim melalui GitHub.

Spreadsheet, SQL berisi data asli, manifest, dan 33 berkas bukti berada di workspace lokal dan dikecualikan dari Git. Generator berada di `scripts/build-kepuasan-import.cjs` dan pengunduh di `scripts/download-kepuasan-proofs.py`.

## Verifikasi lokal

Jalankan `php tests/imported-satisfaction-chart.php` pada MySQL lokal. Tes membuat database sementara berisi data sintetis dan menghapusnya setelah selesai. Tes tidak membaca kredensial `.env` aplikasi. Jika diperlukan, set `TEST_MYSQL_HOST`, `TEST_MYSQL_PORT`, `TEST_MYSQL_USER`, dan `TEST_MYSQL_PASSWORD` untuk server test lokal.
