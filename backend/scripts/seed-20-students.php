<?php
/**
 * One-off script: insert 20 student records with random nama, no_hp, email.
 * Varied tahun_masuk and tahun_lulus (some same, some different).
 * Run from project root: php backend/scripts/seed-20-students.php
 */

require_once __DIR__ . '/../config/database.php';

$namaDepan = [
    'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gita', 'Hendra', 'Indah', 'Joko',
    'Kartika', 'Lukman', 'Maya', 'Nurul', 'Oki', 'Putri', 'Rina', 'Siti', 'Taufik', 'Wulan'
];
$namaBelakang = [
    'Santoso', 'Wijaya', 'Kusuma', 'Pratama', 'Saputra', 'Hartono', 'Dewanto', 'Susanto',
    'Rahman', 'Firmansyah', 'Hidayat', 'Nugroho', 'Purnomo', 'Setiawan', 'Utomo'
];

function randomNim(int $tahunMasuk): string {
    $angka = str_pad((string) random_int(100000, 999999), 6, '0');
    $kelas = ['A', 'B', 'C', 'D'][random_int(0, 3)];
    return (string) $tahunMasuk . $angka . $kelas;
}

function randomEmail(string $nama): string {
    $base = strtolower(preg_replace('/\s+/', '', $nama));
    return $base . random_int(1, 999) . '@example.ac.id';
}

function randomNoHp(): string {
    return '08' . random_int(11, 99) . random_int(10000000, 99999999);
}

// Variasi tahun: beberapa sama, beberapa beda (untuk filter)
// tahun_masuk: 2018 (4), 2019 (5), 2020 (6), 2021 (5)
// tahun_lulus: 2022 (5), 2023 (8), 2024 (7)
$tahunMasukPool = [2018, 2018, 2018, 2018, 2019, 2019, 2019, 2019, 2019, 2020, 2020, 2020, 2020, 2020, 2020, 2021, 2021, 2021, 2021, 2021];
$tahunLulusPool = [2022, 2022, 2022, 2022, 2022, 2023, 2023, 2023, 2023, 2023, 2023, 2023, 2023, 2024, 2024, 2024, 2024, 2024, 2024, 2024];
shuffle($tahunMasukPool);
shuffle($tahunLulusPool);

$jurusan = 'Administrasi Bisnis';
$prodi = 'Administrasi Bisnis Terapan';
$status = 'alumni';

$usedNims = [];
$usedEmails = [];

$stmt = $pdo->prepare("
    INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, has_credentials, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())
");

$inserted = 0;
for ($i = 0; $i < 20; $i++) {
    $tahunMasuk = $tahunMasukPool[$i];
    $tahunLulus = $tahunLulusPool[$i];
    if ($tahunLulus < $tahunMasuk) {
        $tahunLulus = $tahunMasuk + random_int(3, 5);
    }

    $nama = $namaDepan[$i] . ' ' . $namaBelakang[array_rand($namaBelakang)];
    do {
        $nim = randomNim($tahunMasuk);
    } while (isset($usedNims[$nim]));
    $usedNims[$nim] = true;

    do {
        $email = randomEmail($nama);
    } while (isset($usedEmails[$email]));
    $usedEmails[$email] = true;

    $noHp = randomNoHp();
    $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0x0fff) | 0x4000, random_int(0, 0x3fff) | 0x8000, random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff));

    try {
        $stmt->execute([$id, $nim, $nama, $jurusan, $prodi, $status, $tahunMasuk, $tahunLulus, $email, $noHp]);
        $inserted++;
        echo "OK: {$nim} {$nama} | {$tahunMasuk} -> {$tahunLulus} | {$email} | {$noHp}\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate') !== false) {
            $i--;
            continue;
        }
        echo "Error: " . $e->getMessage() . "\n";
    }
}

echo "\nSelesai. {$inserted} data mahasiswa dimasukkan ke database.\n";
