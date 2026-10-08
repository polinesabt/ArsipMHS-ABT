<?php
/** Run with PHP CLI against a local MySQL test server; never uses app .env. */
require_once __DIR__ . '/../backend/api/evaluations/imported_satisfaction.php';

function satisfactionCheck(bool $condition, string $message): void {
    if (!$condition) {
        throw new RuntimeException($message);
    }
}

$host = getenv('TEST_MYSQL_HOST') ?: '127.0.0.1';
if (!in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
    throw new RuntimeException('This test only permits a local MySQL server.');
}
$port = getenv('TEST_MYSQL_PORT') ?: '3306';
$pdo = new PDO(
    "mysql:host=$host;port=$port;charset=utf8mb4",
    getenv('TEST_MYSQL_USER') ?: 'root',
    getenv('TEST_MYSQL_PASSWORD') ?: '',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES => false]
);
$database = 'codex_satisfaction_test_' . bin2hex(random_bytes(8));
$pdo->exec("CREATE DATABASE `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
try {
    $pdo->exec("USE `$database`");
    satisfactionCheck(!loadImportedSatisfaction($pdo)['available'], 'Missing import tables must be optional.');
    $pdo->exec('CREATE TABLE import_kepuasan_pengguna (id VARCHAR(32) PRIMARY KEY, kategori VARCHAR(32))');
    satisfactionCheck(!loadImportedSatisfaction($pdo)['available'], 'Partial import must not break native charts.');
    $pdo->exec('CREATE TABLE import_kepuasan_penilaian (record_id VARCHAR(32), indikator VARCHAR(150), skor INT)');
    $empty = loadImportedSatisfaction($pdo);
    satisfactionCheck($empty['available'] && $empty['respondents'] === 0 && $empty['rating_count'] === 0, 'Empty import is supported.');

    $pdo->exec("INSERT INTO import_kepuasan_pengguna VALUES
        ('work-1', 'bekerja'), ('work-2', 'bekerja'), ('work-empty', 'bekerja'),
        ('work-unknown', 'bekerja'), ('study-1', 'studi_lanjut')");
    $insert = $pdo->prepare('INSERT INTO import_kepuasan_penilaian VALUES (?, ?, ?)');
    foreach ([
        ['work-1', 'Etika', 5], ['work-2', 'etika', 4],
        ['work-1', 'Kemampuan pada Bidang Utama', 3],
        ['work-2', 'Integritasi Diri dalam Pergaulan di Perusahaan', 2],
        ['work-2', 'Kemampuan Mengelola Waktu Kerja', 1],
        ['work-1', 'Etika', 0], ['work-2', 'Etika', 6],
        ['work-unknown', 'Unknown indicator', 5],
        ['study-1', 'Etika', 5], ['orphan', 'Etika', 5],
    ] as $rating) {
        $insert->execute($rating);
    }
    $imported = loadImportedSatisfaction($pdo);
    satisfactionCheck($imported['respondents'] === 2, 'Count only working respondents with valid known ratings.');
    satisfactionCheck($imported['rating_count'] === 5 && count($imported['aspects']) === 4, 'Exclude invalid scores, unknown labels, study rows and orphans.');
    $byCode = array_column($imported['aspects'], null, 'aspect_code');
    satisfactionCheck($byCode['etika']['sangat_baik'] === 1 && $byCode['etika']['baik'] === 1, 'Map score 5 and 4 without reversing the scale.');
    satisfactionCheck($byCode['kompetensi_utama']['cukup_baik'] === 1, 'Map alternate competency heading.');
    satisfactionCheck($byCode['integritas_pergaulan']['kurang_baik'] === 1, 'Map original workbook spelling.');
    satisfactionCheck($byCode['manajemen_waktu']['tidak_baik'] === 1, 'Map score 1 correctly.');

    $pdo->exec("ALTER TABLE import_kepuasan_pengguna
        ADD nama_mahasiswa VARCHAR(255) NOT NULL DEFAULT 'Synthetic student',
        ADD nim VARCHAR(32) NOT NULL DEFAULT '00123',
        ADD tahun_lulus SMALLINT NOT NULL DEFAULT 2021");
    $withRespondents = loadImportedSatisfaction($pdo, true);
    satisfactionCheck(count($withRespondents['respondent_rows']) === 2, 'List only students contributing valid imported ratings.');
    satisfactionCheck(array_sum(array_column($withRespondents['respondent_rows'], 'rating_count')) === 5, 'Listed ratings must match the imported chart.');
    satisfactionCheck($withRespondents['respondent_rows'][0]['nim'] === '00123', 'Preserve NIM as a string including leading zeros.');
    satisfactionCheck($imported['respondent_rows'] === [], 'Do not load student identities unless requested.');

    $native = [[
        'aspect_id' => 'native-ethics', 'aspect_code' => 'etika', 'aspect_name' => 'Native ethics', 'sort_order' => 1,
        'sangat_baik' => 1, 'baik' => 0, 'cukup_baik' => 0, 'kurang_baik' => 0, 'tidak_baik' => 1, 'total' => 2,
    ]];
    $merged = mergeImportedSatisfactionDistribution($native, $imported['aspects']);
    satisfactionCheck(count($merged) === 4 && $merged[0]['aspect_id'] === 'native-ethics', 'Merge stable codes without duplicate indicator rows.');
    satisfactionCheck($merged[0]['total'] === 4 && $merged[0]['sangat_baik'] === 2, 'Native and historical ratings are both retained.');
    satisfactionCheck(array_sum(array_column($merged, 'total')) === 7, 'Merged distribution retains all valid ratings.');
    satisfactionCheck($native[0]['total'] === 2, 'Native input is not changed.');
    satisfactionCheck(mergeImportedSatisfactionDistribution([], $imported['aspects']) === $imported['aspects'], 'Imported charts work without seeded native aspects.');
    echo "PASS: optional imports, valid respondent counts, scale mapping, and native/imported aggregation\n";
} finally {
    $pdo->exec("DROP DATABASE `$database`");
}
