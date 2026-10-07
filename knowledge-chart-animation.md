# Knowledge: Referensi Animasi Chart Dashboard

Dokumen ini menjabarkan pola animasi dan interaksi chart berdasarkan video referensi `d5320f00-57ad-4154-bd4c-2f2416687e6c.mp4`. Tujuannya adalah menjadi acuan perilaku (*motion behavior*) saat membangun dashboard website, bukan untuk menyalin tampilan visualnya secara persis.

> Catatan: durasi pada dokumen ini merupakan estimasi dari rekaman layar. Detail seperti *easing* dan angka milidetik tidak dapat diketahui langsung dari video, sehingga bagian spesifikasi implementasi menggunakan nilai yang disarankan agar menghasilkan gerakan serupa.

## 1. Ringkasan Karakter Animasi

Animasi chart pada video memiliki karakter berikut:

- Gerak sederhana, cepat, dan berorientasi pada keterbacaan data.
- Chart masuk dari titik asal datanya, bukan dengan efek dekoratif acak.
- Seluruh chart tidak bergerak terus-menerus setelah selesai dimuat.
- Interaksi utama terjadi melalui hover dan tooltip.
- Beberapa chart ditampilkan bersamaan dalam satu dashboard, tetapi gerakannya tetap tenang.
- Perpindahan halaman terasa seperti pemuatan ulang data: konten kosong sesaat, kemudian KPI dan chart terbentuk.

Prinsip utamanya:

> Animasi harus membantu pengguna memahami dari mana nilai berasal dan ke mana nilainya bergerak.

## 2. Urutan yang Terlihat pada Video

### 2.1 Dashboard publikasi

Sekitar detik 0–16, dashboard menampilkan:

- kartu KPI dengan angka total;
- vertical bar chart untuk tren publikasi per tahun;
- doughnut chart untuk komposisi kuartil;
- horizontal bar chart untuk jenis publikasi;
- tooltip saat pointer berada di atas batang atau segmen doughnut.

Urutan perilakunya:

1. Halaman dashboard tampil.
2. Nilai pada kartu KPI berubah menuju nilai akhirnya.
3. Batang vertikal tumbuh dari garis dasar sumbu Y.
4. Doughnut terbentuk mengikuti arah melingkar.
5. Batang horizontal memanjang dari kiri ke kanan.
6. Setelah animasi masuk selesai, chart menjadi statis.
7. Saat pengguna mengarahkan pointer, tooltip muncul di dekat elemen aktif.

### 2.2 Dashboard tenaga kependidikan

Sekitar detik 17–44, halaman berisi beberapa chart dalam grid:

- horizontal bar chart berdasarkan jabatan atau unit kerja;
- vertical bar chart berdasarkan pangkat/golongan atau rentang data;
- pie chart berdasarkan status kepegawaian;
- pie chart berdasarkan status keaktifan;
- pie chart pendidikan terakhir;
- pie chart distribusi jenis kelamin;
- vertical bar chart distribusi usia.

Perilaku yang terlihat:

- Pergantian halaman tidak memakai transisi besar antarlayout.
- Chart tampil setelah halaman selesai memuat.
- Halaman digulir untuk memperlihatkan chart lain.
- Tooltip mengikuti chart yang sedang di-hover.
- Segmen pie yang aktif menjadi fokus, sedangkan tooltip menampilkan kategori dan nilai.

### 2.3 Dashboard kemahasiswaan

Sekitar detik 49–56, halaman menampilkan:

- kartu KPI;
- vertical bar chart untuk sebaran angkatan;
- horizontal bar chart untuk sebaran jenjang;
- doughnut chart komposisi jenjang;
- doughnut chart distribusi jenis kelamin.

Polanya sama: chart melakukan animasi masuk sekali, lalu interaksi selanjutnya hanya terjadi saat hover.

### 2.4 Peta choropleth

Sekitar detik 56–66, peta wilayah ditampilkan dengan variasi warna hijau.

Interaksi yang terlihat:

- Setiap wilayah memiliki warna berdasarkan besaran nilai.
- Saat pointer masuk ke wilayah, tooltip gelap muncul di dekat pointer.
- Tooltip memuat nama wilayah dan beberapa metrik.
- Wilayah aktif memperoleh penekanan visual dibanding wilayah lain.
- Tooltip berpindah mengikuti wilayah yang sedang ditunjuk.
- Ketika pointer keluar, tooltip menghilang dan wilayah kembali ke keadaan normal.

## 3. Spesifikasi Motion yang Disarankan

### 3.1 Motion tokens

Gunakan token berikut agar semua chart memiliki rasa gerak yang konsisten.

| Token | Nilai yang disarankan | Penggunaan |
| --- | ---: | --- |
| `motion-instant` | 80 ms | Respons mikro yang hampir langsung |
| `motion-hover` | 140 ms | Perubahan warna atau opacity saat hover |
| `motion-tooltip` | 160 ms | Tooltip muncul dan menghilang |
| `motion-fast` | 240 ms | Pergantian state ringan |
| `motion-chart` | 800 ms | Animasi masuk chart utama |
| `motion-count` | 900 ms | Count-up angka KPI |
| `motion-stagger` | 50 ms | Jeda antarelemen dalam satu seri |
| `ease-standard` | `cubic-bezier(0.22, 1, 0.36, 1)` | Animasi masuk yang cepat di awal dan lembut di akhir |
| `ease-hover` | `cubic-bezier(0.2, 0, 0, 1)` | Hover dan tooltip |

### 3.2 Aturan umum

- Jalankan animasi masuk hanya satu kali ketika chart pertama kali terlihat atau setelah dataset benar-benar berubah.
- Jangan mengulang animasi hanya karena komponen mengalami re-render.
- Jangan menganimasikan semua chart secara berurutan terlalu lama. Maksimum jeda total antarkartu sekitar 250–350 ms.
- Pertahankan posisi sumbu, judul, dan grid selama data berubah agar pengguna dapat membandingkan keadaan awal dan akhir.
- Gunakan transformasi dan opacity untuk elemen UI; gunakan interpolasi nilai untuk bentuk chart.
- Tooltip harus muncul cepat dan tidak menghalangi titik data yang sedang diperiksa.
- Hindari efek memantul, berputar berlebihan, atau overshoot pada dashboard analitik.

## 4. Perilaku per Jenis Chart

### 4.1 Kartu KPI

#### Keadaan awal

- Kartu sudah berada pada posisi akhirnya.
- Label langsung terlihat.
- Nilai dimulai dari `0` atau dari nilai sebelumnya.

#### Animasi masuk

- Angka berubah secara bertahap sampai nilai akhir.
- Durasi: 700–900 ms.
- Gunakan format angka pada setiap frame, misalnya pemisah ribuan tetap aktif.
- Jika tersedia nilai lama, interpolasikan dari nilai lama ke nilai baru, bukan selalu dari nol.

#### Contoh

```text
0 → 3.728
0 → 643
0 → 2.075
```

#### Larangan

- Jangan mengubah lebar kartu saat angka bertambah.
- Jangan menggunakan efek putar atau angka acak seperti mesin slot.
- Jangan menjalankan count-up saat pengguna hanya melakukan hover.

### 4.2 Vertical bar chart

#### Keadaan awal

- Sumbu dan label dapat langsung terlihat.
- Setiap batang memiliki tinggi `0` pada baseline.

#### Animasi masuk

- Batang tumbuh dari bawah ke atas.
- Durasi dasar: 700–850 ms.
- Batang dapat memakai stagger 30–50 ms dari kiri ke kanan.
- Label nilai muncul setelah batang mencapai sekitar 70–80% tinggi akhirnya atau sesudah animasi selesai.

#### Hover

- Batang aktif menjadi sedikit lebih terang atau lebih solid.
- Batang lain boleh turun ke opacity sekitar `0.65–0.8`, tetapi jangan dibuat terlalu redup.
- Tooltip muncul di atas atau di samping batang aktif.
- Posisi tooltip harus dibatasi agar tidak keluar dari container.

#### Pembaruan data

- Batang bergerak dari tinggi lama ke tinggi baru.
- Skala sumbu boleh berubah, tetapi transisinya harus dilakukan bersamaan dengan perubahan batang.
- Jangan mengembalikan semua batang ke nol kecuali dataset memang diganti sepenuhnya.

### 4.3 Horizontal bar chart

#### Keadaan awal

- Batang dimulai dari titik nol pada sumbu X.
- Label kategori sudah tersedia agar pengguna mengetahui konteks sebelum gerakan selesai.

#### Animasi masuk

- Batang memanjang dari kiri ke kanan.
- Durasi: 750–900 ms.
- Gunakan stagger 30–50 ms dari baris pertama ke baris berikutnya.
- Angka di ujung batang mengikuti posisi panjang batang.

#### Hover

- Tingkatkan brightness atau saturation batang aktif sekitar 5–10%.
- Tampilkan tooltip berisi marker warna, kategori, dan nilai.
- Jangan memperbesar ketebalan batang karena dapat menggeser layout.

#### Daftar kategori panjang

- Jika kategori melebihi ruang, gunakan scroll di dalam area chart atau tampilkan kategori teratas.
- Animasi tidak boleh berjalan ulang setiap kali pengguna menggulir daftar internal.

### 4.4 Pie chart

#### Animasi masuk

- Pie terbuka melalui sweep melingkar dari sudut awal yang konsisten.
- Rekomendasi sudut awal: posisi pukul 12 atau `-90deg`.
- Durasi: 750–900 ms.
- Semua segmen mengikuti satu timeline agar komposisi total tetap terbaca.

#### Hover

- Segmen aktif boleh bergeser keluar 2–4 px atau sedikit diperbesar, tetapi pilih salah satu saja.
- Perubahan warna berlangsung sekitar 140 ms.
- Tooltip menampilkan nama kategori, nilai, dan persentase jika tersedia.
- Label luar harus tetap stabil agar tidak bergetar ketika segmen aktif berubah.

### 4.5 Doughnut chart

Perilakunya sama dengan pie chart, dengan ketentuan tambahan:

- Ketebalan cincin tidak berubah saat hover.
- Jika bagian tengah menampilkan total, total melakukan fade-in setelah sweep mencapai sekitar 60%.
- Segmen aktif dapat diberi offset kecil 2–3 px.
- Hindari rotasi seluruh cincin ketika pengguna mengarahkan pointer.

### 4.6 Choropleth map

#### Animasi masuk

- Peta dapat menggunakan fade-in ringan 250–400 ms.
- Semua wilayah muncul bersama; hindari animasi satu per satu karena jumlah wilayah banyak.
- Legenda warna tampil bersamaan dengan peta.

#### Hover wilayah

- Transisi fill atau brightness: 120–160 ms.
- Tambahkan outline tipis pada wilayah aktif.
- Naikkan wilayah aktif secara visual tanpa mengubah geometri peta.
- Tooltip tampil di dekat pointer dengan offset sekitar 12–16 px.
- Tooltip harus berpindah tanpa efek keluar-masuk penuh saat pointer langsung berpindah ke wilayah tetangga.

#### Isi tooltip peta

Urutan informasi yang disarankan:

1. nama wilayah;
2. metrik utama;
3. metrik pendukung;
4. status atau tingkat urgensi jika digunakan pada website.

## 5. Tooltip

Tooltip adalah interaksi yang paling sering muncul dalam video.

### 5.1 Struktur

```text
[marker warna] Nama kategori
Nilai: 123
Persentase: 24,5%
```

### 5.2 Perilaku

- Trigger desktop: `pointerenter` atau perpindahan pointer ke elemen data.
- Trigger perangkat sentuh: tap pertama membuka tooltip; tap di luar menutup tooltip.
- Fade dan scale ringan dari `0.98` ke `1` selama 140–160 ms.
- Jarak dari pointer: 10–14 px untuk chart dan 12–16 px untuk peta.
- Tooltip menggunakan `pointer-events: none` agar tidak berkedip saat dilewati pointer.
- Tooltip harus memiliki batas viewport dan membalik posisi jika ruang tidak cukup.
- Jika pengguna bergerak antardata dengan cepat, perbarui isi tooltip pada container yang sama agar tidak terjadi flicker.

### 5.3 Gaya visual

- Latar tooltip kontras terhadap chart.
- Radius: 6–8 px.
- Shadow tipis, bukan glow besar.
- Teks kategori lebih tebal daripada nilai pendukung.
- Marker menggunakan warna yang sama dengan elemen chart.

## 6. Page Load, Route Change, dan Scroll

### 6.1 Page load

Di dalam video terdapat jeda kosong saat halaman dimuat ulang. Untuk implementasi website produksi, gunakan alur berikut:

1. Render struktur dashboard dan ukuran kartu.
2. Tampilkan skeleton di area KPI dan chart.
3. Setelah data tersedia, pertahankan ukuran container.
4. Lakukan crossfade skeleton selama 160–220 ms.
5. Jalankan animasi KPI dan chart.

Jangan menampilkan halaman putih kosong saat berpindah dashboard karena akan terasa seperti website terputus.

### 6.2 Route change

- Navbar tetap berada di tempatnya.
- Konten lama dapat fade-out 120–160 ms.
- Konten baru fade-in 180–240 ms setelah data minimum tersedia.
- Jangan memakai slide horizontal besar untuk dashboard yang setara.
- Simpan posisi scroll hanya jika pengguna kembali ke halaman yang sama.

### 6.3 Scroll reveal

Video memperlihatkan chart melalui scrolling, tetapi tidak cukup bukti bahwa setiap chart memakai animasi reveal khusus. Untuk implementasi:

- Boleh menjalankan animasi masuk ketika minimal 20–30% chart memasuki viewport.
- Gunakan `IntersectionObserver`.
- Animasi hanya satu kali per dataset.
- Jika chart sudah terlihat saat halaman dibuka, jalankan segera setelah data siap.

## 7. State Model

Setiap chart sebaiknya memiliki state berikut:

| State | Perilaku |
| --- | --- |
| `loading` | Skeleton mempertahankan ukuran chart |
| `entering` | Data bergerak dari keadaan awal menuju nilai akhir |
| `idle` | Chart statis dan siap menerima interaksi |
| `hovering` | Satu elemen aktif dan tooltip tampil |
| `updating` | Nilai lama bertransisi menuju nilai baru |
| `empty` | Pesan data kosong ditampilkan tanpa chart palsu |
| `error` | Pesan kegagalan dan tombol coba lagi |

Alur normal:

```text
loading → entering → idle ↔ hovering
                         ↓
                      updating → idle
```

## 8. Spesifikasi Implementasi Library-Agnostic

Gunakan konfigurasi konsep berikut pada library chart apa pun:

```ts
const chartMotion = {
  initialDuration: 800,
  updateDuration: 450,
  hoverDuration: 140,
  tooltipDuration: 160,
  stagger: 40,
  easing: [0.22, 1, 0.36, 1],
  animateOnce: true,
};
```

Logika dasarnya:

```ts
if (prefersReducedMotion) {
  renderFinalState();
} else if (isFirstVisible && dataReady) {
  playEnterAnimation();
} else if (datasetChanged) {
  interpolatePreviousToNext();
}
```

Untuk tooltip:

```ts
function showTooltip(datum, anchor) {
  updateTooltipContent(datum);
  placeTooltipWithinViewport(anchor);
  animateTooltipIn();
}

function moveToAnotherDatum(datum, anchor) {
  updateTooltipContent(datum);
  moveExistingTooltip(anchor);
}
```

## 9. Responsivitas

### Desktop

- Gunakan hover sebagai interaksi utama.
- Tooltip mengikuti pointer atau pusat elemen aktif.
- Grid chart dapat terdiri dari dua kolom atau lebih.

### Tablet

- Kurangi jumlah label luar pie/doughnut.
- Tooltip dibuka dengan tap.
- Pastikan target interaksi minimal 40 × 40 px secara efektif.

### Mobile

- Susun chart dalam satu kolom.
- Jangan memaksa tooltip mengikuti jari; pasang tooltip di atas chart atau sebagai panel ringkas.
- Horizontal bar lebih disarankan untuk kategori yang panjang.
- Kurangi stagger menjadi 20–30 ms.
- Batasi durasi animasi chart sekitar 600–700 ms.

## 10. Aksesibilitas dan Reduced Motion

- Hormati `prefers-reduced-motion: reduce`.
- Dalam mode reduced motion, tampilkan keadaan akhir dengan fade maksimal 100 ms atau tanpa animasi.
- Jangan menyampaikan makna hanya melalui warna.
- Sediakan ringkasan teks atau tabel data untuk chart penting.
- Elemen data yang interaktif harus dapat diakses melalui keyboard.
- Fokus keyboard harus memunculkan informasi yang sama dengan hover.
- Gunakan `aria-live="polite"` hanya untuk pembaruan penting; jangan membacakan setiap frame count-up.
- Tooltip harus memiliki kontras teks yang cukup.

Contoh CSS:

```css
@media (prefers-reduced-motion: reduce) {
  .chart,
  .chart *,
  .chart-tooltip {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```

## 11. Performance

- Gunakan SVG untuk chart dengan jumlah elemen kecil hingga sedang.
- Pertimbangkan Canvas untuk ribuan titik data atau peta kompleks.
- Jangan mengubah state framework pada setiap `pointermove`; gunakan mekanisme internal library atau `requestAnimationFrame`.
- Gunakan transform dan opacity untuk tooltip.
- Pertahankan instance chart ketika data berubah; lakukan update dataset, bukan membuat ulang seluruh chart.
- Tunda chart di bawah viewport, tetapi pertahankan tinggi containernya agar layout tidak melompat.
- Hentikan animasi saat tab browser tidak aktif.

## 12. Hal yang Harus Dihindari

- Menjalankan ulang animasi setiap kali pengguna scroll sedikit.
- Membuat seluruh dashboard bergerak dalam waktu bersamaan lebih dari satu detik.
- Tooltip berkedip ketika pointer berpindah antarelemen.
- Mengubah urutan kategori secara mendadak tanpa transisi.
- Pie chart berputar terus-menerus.
- Bar memantul melewati nilai akhirnya.
- Menggeser layout saat label nilai muncul.
- Menampilkan halaman putih kosong selama pengambilan data.
- Menggunakan animasi yang menghambat pengguna membaca angka akhir.

## 13. Acceptance Criteria

Implementasi dianggap sesuai referensi jika:

- [ ] KPI melakukan count-up satu kali setelah data siap.
- [ ] Vertical bar tumbuh dari baseline ke atas.
- [ ] Horizontal bar memanjang dari kiri ke kanan.
- [ ] Pie dan doughnut terbentuk melalui sweep melingkar.
- [ ] Durasi animasi chart utama berada di kisaran 700–900 ms pada desktop.
- [ ] Tooltip muncul maksimal sekitar 160 ms setelah interaksi.
- [ ] Tooltip tidak keluar dari batas viewport atau container.
- [ ] Hover tidak mengubah ukuran layout chart.
- [ ] Pembaruan data bergerak dari nilai lama ke nilai baru.
- [ ] Chart tidak dianimasikan ulang karena re-render biasa.
- [ ] Peta menyorot wilayah aktif dan memperbarui tooltip tanpa flicker.
- [ ] Perangkat sentuh memiliki interaksi tap yang setara dengan hover.
- [ ] `prefers-reduced-motion` dihormati.
- [ ] State loading, empty, dan error tersedia.
- [ ] Animasi tetap lancar dan tidak menghambat scroll.

## 14. Prioritas Implementasi

### P0 — Wajib

- Animasi masuk sesuai arah chart.
- Tooltip desktop dan mobile.
- Update data tanpa reset yang tidak perlu.
- Reduced motion.
- Loading skeleton dengan ukuran stabil.

### P1 — Disarankan

- Stagger ringan antarelemen.
- Fokus keyboard yang setara dengan hover.
- Scroll reveal satu kali.
- Transisi halus pada choropleth map.

### P2 — Opsional

- Count-up dari nilai lama ke nilai baru.
- Panel detail setelah wilayah peta dipilih.
- Sinkronisasi highlight antara legenda dan chart.

## 15. Kesimpulan

Animasi dalam video menggunakan pendekatan fungsional: nilai bergerak dari titik asal yang logis, berhenti setelah terbentuk, kemudian memberikan respons singkat melalui hover dan tooltip. Untuk mendapatkan hasil serupa di website, fokuskan implementasi pada konsistensi durasi, arah gerak berdasarkan jenis chart, tooltip yang stabil, transisi data yang tidak mereset konteks pengguna, serta dukungan reduced motion.
