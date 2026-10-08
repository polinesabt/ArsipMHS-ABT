# Data historis kepuasan pengguna

Dashboard Kepuasan Pengguna membaca formulir evaluasi dan tabel `import_kepuasan_pengguna` / `import_kepuasan_penilaian`. Pemanggilan `evaluations/charts.php?evaluation_id=all&include_imported=1` menambahkan penilaian historis. Pemanggilan biasa dan evaluasi per periode tetap memakai respons formulir saja.

SQL yang sudah diimpor memuat 34 baris alumni dan 260 penilaian dari 26 pengisi, pada 10 indikator. Baris tanpa penilaian, studi lanjut, dan wirausaha tidak menambah jumlah pengisi grafik kepuasan. Spreadsheet tidak memuat jawaban kesesuaian jurusan; data historis tidak menambah grafik tersebut.

Tampilan menggunakan dua tab: Kepuasan Pengguna dan Kesesuaian Jurusan dengan Pekerjaan. Di bawah grafik kepuasan terdapat daftar mahasiswa dengan NIM, tahun lulus, sumber/periode evaluasi, dan jumlah indikator yang dinilai. Daftar hanya memuat respons dengan penilaian valid yang masuk ke grafik, dapat dicari, dan ditampilkan 10 baris per halaman. Mahasiswa dapat tercatat pada beberapa sumber/periode; satu baris mewakili satu respons. Identitas diambil dari database melalui API yang memerlukan autentikasi admin.

Daftar mahasiswa hanya ditampilkan pada modul Kepuasan Pengguna. Ringkasan semua modul/overview menampilkan grafik tanpa daftar mahasiswa. Kolom Sumber Data menyediakan tombol Unduh PDF yang mengambil bukti formulir dari folder privat melalui endpoint admin `evaluations/download_satisfaction_evidence.php`. PDF asli diunduh langsung; bukti JPEG/PNG dikonversi menjadi satu halaman PDF di browser. Jika berkas belum tersedia di hosting, tombol nonaktif dengan keterangan. Dokumen tidak dibuat dari jawaban atau formulir kosong sebagai pengganti bukti.

Paket berisi manifest 34 baris, 260 penilaian, dan 33 bukti asli yang dicocokkan berdasarkan ID baris spreadsheet. Karena repositori GitHub publik, paket tersebut disimpan di codebase sebagai arsip AES-256-GCM di `backend/storage/satisfaction_archive/`. Kunci 256 bit hanya ada di workspace lokal, dalam `kepuasan pengguna/hasil/kunci-paket-kepuasan.txt` yang diabaikan Git. Setelah deploy, masuk sebagai admin production, buka modul **Kepuasan Pengguna**, tempel isi berkas kunci pada kartu **Impor formulir historis**, lalu klik **Impor dari codebase**. Server membuka arsip sementara, memverifikasi hash setiap bukti, menulis dua tabel impor pada database aplikasi, dan menyimpan bukti di folder privat `backend/storage/satisfaction_import/`. Setelah selesai, daftar akan memuat ulang: 26 mahasiswa historis mempunyai tombol unduh. Baris M Hafiidh Lutvi (2021) tidak memiliki penilaian maupun bukti sesuai instruksi pengguna. Jangan commit kunci, ZIP, spreadsheet, SQL berisi data asli, atau berkas bukti terbuka.

Untuk memperbarui arsip dari workspace yang menyimpan sumber asli, jalankan `python scripts/package-kepuasan-private.py` kemudian `node scripts/package-satisfaction-encrypted.mjs`. Simpan salinan kunci di luar repositori; tanpa kunci, salinan terenkripsi di Git tidak dapat dipulihkan. Sebagai alternatif, admin masih dapat memilih ZIP lokal dan klik **Unggah dan hubungkan formulir**.

## Production

1. Deploy frontend dan backend dari commit yang sama. Workflow `Deploy Website` berjalan manual lewat GitHub Actions, bukan otomatis setelah push. Ikuti prasyarat production dalam `docs/security-remediation-checklist.md` sebelum menjalankannya.
2. Impor arsip terenkripsi melalui kartu admin dengan kunci lokal. Proses ini membuat tabel jika belum ada dan dapat diulang tanpa menggandakan baris.
3. Setelah pesan berhasil, grafik memuat 26 pengisi historis, 10 indikator, dan 260 penilaian, ditambah respons lain yang sudah ada. Tombol unduh mengambil bukti dari storage privat melalui API admin.

Spreadsheet, SQL berisi data asli, ZIP terbuka, kunci, dan 33 berkas bukti berada di workspace lokal dan dikecualikan dari Git. Generator data berada di `scripts/build-kepuasan-import.cjs` dan pengunduh di `scripts/download-kepuasan-proofs.py`.

## Verifikasi lokal

Jalankan `php tests/imported-satisfaction-chart.php` pada MySQL lokal. Tes membuat database sementara berisi data sintetis dan menghapusnya setelah selesai. Tes tidak membaca kredensial `.env` aplikasi. Jika diperlukan, set `TEST_MYSQL_HOST`, `TEST_MYSQL_PORT`, `TEST_MYSQL_USER`, dan `TEST_MYSQL_PASSWORD` untuk server test lokal.
