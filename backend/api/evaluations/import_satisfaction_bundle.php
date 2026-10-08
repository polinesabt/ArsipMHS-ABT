<?php
/** Private admin import: resumable small chunks, verified archive, prepared SQL. */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/satisfaction_evidence.php';

const SATISFACTION_CHUNK_BYTES = 524288;
const SATISFACTION_MAX_ARCHIVE_BYTES = 30000000;

function satisfactionImportError(string $message): void {
    throw new InvalidArgumentException($message);
}

function satisfactionImportState(string $root, string $id, string $owner): array {
    if (!preg_match('/^[a-f0-9]{32}$/', $id)) satisfactionImportError('Sesi unggah tidak valid');
    $directory = $root . '/' . $id;
    $state = @json_decode((string)@file_get_contents($directory . '/state.json'), true);
    if (!is_array($state) || !hash_equals((string)($state['owner'] ?? ''), $owner)) {
        satisfactionImportError('Sesi unggah tidak ditemukan');
    }
    return [$directory, $state];
}

function satisfactionImportTables(PDO $pdo): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS import_kepuasan_pengguna (
        id VARCHAR(32) NOT NULL PRIMARY KEY,
        kategori ENUM('bekerja','studi_lanjut','wirausaha') NOT NULL,
        nama_sheet VARCHAR(100) NOT NULL,
        nomor_baris INT NOT NULL,
        nomor_urut INT NOT NULL,
        nama_mahasiswa VARCHAR(255) NOT NULL,
        nim VARCHAR(32) NOT NULL,
        kelas VARCHAR(32) NOT NULL,
        tahun_lulus SMALLINT UNSIGNED NOT NULL,
        nama_bukti VARCHAR(255) DEFAULT NULL,
        gdrive_url TEXT DEFAULT NULL,
        gdrive_file_id VARCHAR(128) DEFAULT NULL,
        bukti_local_path VARCHAR(255) DEFAULT NULL,
        UNIQUE KEY uq_import_kepuasan_baris (kategori, nomor_baris),
        KEY idx_import_kepuasan_nim (nim),
        KEY idx_import_kepuasan_tahun (tahun_lulus)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS import_kepuasan_penilaian (
        record_id VARCHAR(32) NOT NULL,
        indikator VARCHAR(150) NOT NULL,
        label_penilaian ENUM('Sangat Baik','Baik','Cukup Baik','Kurang Baik','Tidak Baik') NOT NULL,
        skor TINYINT UNSIGNED NOT NULL,
        PRIMARY KEY (record_id, indikator),
        CONSTRAINT fk_import_kepuasan_penilaian_record FOREIGN KEY (record_id)
            REFERENCES import_kepuasan_pengguna(id) ON DELETE CASCADE,
        CHECK (skor BETWEEN 1 AND 5)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function satisfactionEncryptedArchive(string $keyHex, string $uploadRoot): string {
    if (!preg_match('/^[a-f0-9]{64}$/i', $keyHex)) satisfactionImportError('Kunci paket harus berisi 64 karakter heksadesimal');
    if (!function_exists('openssl_decrypt')) throw new RuntimeException('Ekstensi OpenSSL PHP belum aktif di hosting');
    $root = __DIR__ . '/../../storage/satisfaction_archive';
    $manifestFile = $root . '/manifest.json';
    if (!is_file($manifestFile) || filesize($manifestFile) > 4096) satisfactionImportError('Paket terenkripsi tidak tersedia');
    $manifest = json_decode((string)file_get_contents($manifestFile), true);
    if (!is_array($manifest) || ($manifest['version'] ?? null) !== 1 || ($manifest['algorithm'] ?? null) !== 'aes-256-gcm'
        || !preg_match('/^[a-f0-9]{24}$/', (string)($manifest['nonce'] ?? ''))
        || !preg_match('/^[a-f0-9]{32}$/', (string)($manifest['tag'] ?? ''))
        || !preg_match('/^[a-f0-9]{64}$/', (string)($manifest['plaintextSha256'] ?? ''))
        || !is_int($manifest['plaintextSize'] ?? null) || $manifest['plaintextSize'] < 1
        || $manifest['plaintextSize'] > SATISFACTION_MAX_ARCHIVE_BYTES
        || !is_array($manifest['parts'] ?? null) || count($manifest['parts']) < 1
        || count($manifest['parts']) > 4) satisfactionImportError('Manifest paket terenkripsi tidak valid');
    $ciphertext = '';
    foreach ($manifest['parts'] as $index => $part) {
        $name = 'part-' . str_pad((string)$index, 2, '0', STR_PAD_LEFT) . '.bin';
        if (!is_array($part) || ($part['name'] ?? null) !== $name
            || !is_int($part['size'] ?? null) || $part['size'] < 1 || $part['size'] > 8000000
            || !preg_match('/^[a-f0-9]{64}$/', (string)($part['sha256'] ?? ''))) {
            satisfactionImportError('Bagian paket terenkripsi tidak valid');
        }
        $file = $root . '/' . $name;
        if (!is_file($file) || filesize($file) !== $part['size']) satisfactionImportError('Berkas paket terenkripsi tidak lengkap');
        $bytes = file_get_contents($file);
        if ($bytes === false || !hash_equals($part['sha256'], hash('sha256', $bytes))) {
            satisfactionImportError('Berkas paket terenkripsi berubah');
        }
        $ciphertext .= $bytes;
        if (strlen($ciphertext) > SATISFACTION_MAX_ARCHIVE_BYTES) satisfactionImportError('Paket terenkripsi terlalu besar');
    }
    $plaintext = openssl_decrypt($ciphertext, 'aes-256-gcm', hex2bin($keyHex), OPENSSL_RAW_DATA,
        hex2bin($manifest['nonce']), hex2bin($manifest['tag']));
    if ($plaintext === false || strlen($plaintext) !== $manifest['plaintextSize']
        || !hash_equals($manifest['plaintextSha256'], hash('sha256', $plaintext))) {
        satisfactionImportError('Kunci paket tidak cocok atau paket berubah');
    }
    $archive = tempnam($uploadRoot, '.satisfaction-archive-');
    if ($archive === false || file_put_contents($archive, $plaintext) !== strlen($plaintext)) {
        if ($archive !== false && is_file($archive)) unlink($archive);
        throw new RuntimeException('Paket tidak dapat disiapkan');
    }
    return $archive;
}

function satisfactionImportArchive(PDO $pdo, string $archivePath): array {
    if (!class_exists('ZipArchive')) throw new RuntimeException('Ekstensi ZIP PHP belum aktif di hosting');
    $zip = new ZipArchive();
    if ($zip->open($archivePath) !== true) satisfactionImportError('Paket ZIP tidak dapat dibaca');
    $temporary = [];
    try {
        $manifestInfo = $zip->statName('manifest.json');
        if (!$manifestInfo || $manifestInfo['size'] > 2000000) satisfactionImportError('Manifest paket tidak valid');
        $manifest = json_decode((string)$zip->getFromName('manifest.json'), true);
        if (!is_array($manifest) || ($manifest['version'] ?? null) !== 1 || !is_array($manifest['records'] ?? null)
            || count($manifest['records']) !== 34) satisfactionImportError('Manifest paket tidak sesuai');

        $records = $manifest['records'];
        $files = [];
        $ids = [];
        $ratingCount = 0;
        $ratedCount = 0;
        foreach ($records as $record) {
            if (!is_array($record)) satisfactionImportError('Baris data tidak valid');
            $id = (string)($record['id'] ?? '');
            $category = (string)($record['category'] ?? '');
            if (!in_array($category, ['bekerja', 'studi_lanjut', 'wirausaha'], true)
                || !preg_match('/^' . preg_quote($category, '/') . ':([0-9]+)$/', $id, $match)
                || (int)$match[1] !== (int)($record['row'] ?? 0) || isset($ids[$id])
                || trim((string)($record['name'] ?? '')) === '' || trim((string)($record['nim'] ?? '')) === '') {
                satisfactionImportError('Identitas mahasiswa dalam paket tidak valid');
            }
            $ids[$id] = true;
            if (!is_array($record['rating'] ?? null)) satisfactionImportError('Penilaian dalam paket tidak valid');
            $ratings = $record['rating'];
            $ratingCount += count($ratings);
            if (count($ratings) > 0) {
                if ($category !== 'bekerja') satisfactionImportError('Kategori penilaian tidak valid');
                $ratedCount++;
            }
            $indicatorSet = [];
            foreach ($ratings as $rating) {
                $indicator = (string)($rating['indicator'] ?? '');
                $score = $rating['score'] ?? null;
                $label = (string)($rating['label'] ?? '');
                if ($indicator === '' || strlen($indicator) > 150 || isset($indicatorSet[$indicator])
                    || !is_int($score) || !in_array($score, [1, 2, 3, 4, 5], true)
                    || $label !== [1 => 'Tidak Baik', 2 => 'Kurang Baik', 3 => 'Cukup Baik', 4 => 'Baik', 5 => 'Sangat Baik'][$score]) {
                    satisfactionImportError('Penilaian indikator tidak valid');
                }
                $indicatorSet[$indicator] = true;
            }
            $proof = $record['proof'] ?? null;
            if ($proof !== null) {
                $path = (string)($proof['path'] ?? '');
                $sha = (string)($proof['sha256'] ?? '');
                if (!preg_match('~^satisfaction_import/[A-Za-z0-9_-]+\.(pdf|png|jpe?g)$~i', $path)
                    || !preg_match('/^[a-f0-9]{64}$/', $sha) || isset($files[$path])) {
                    satisfactionImportError('Rujukan bukti formulir tidak valid');
                }
                $files[$path] = $sha;
            }
            if ($ratings && $proof === null) satisfactionImportError('Bukti penilaian belum lengkap');
        }
        if ($ratingCount !== 260 || $ratedCount !== 26 || count($files) !== 33 || $zip->numFiles !== 34) {
            satisfactionImportError('Jumlah data atau bukti dalam paket tidak sesuai');
        }
        for ($index = 0; $index < $zip->numFiles; $index++) {
            $entry = $zip->getNameIndex($index);
            if ($entry !== 'manifest.json' && !isset($files[$entry])) satisfactionImportError('Paket memuat berkas tak dikenal');
        }

        $targetDir = __DIR__ . '/../../storage/satisfaction_import';
        if (!is_dir($targetDir) && !mkdir($targetDir, 0750, true)) throw new RuntimeException('Folder bukti tidak dapat dibuat');
        $totalUncompressed = 0;
        foreach ($files as $path => $expectedSha) {
            $stat = $zip->statName($path);
            if (!$stat || $stat['size'] > 20000000 || $stat['size'] <= 0) satisfactionImportError('Ukuran berkas bukti tidak valid');
            $totalUncompressed += $stat['size'];
            if ($totalUncompressed > 40000000) satisfactionImportError('Paket bukti terlalu besar');
            $stream = $zip->getStream($path);
            if (!$stream) satisfactionImportError('Berkas bukti tidak dapat dibuka');
            $temp = tempnam($targetDir, '.satisfaction-');
            if ($temp === false) throw new RuntimeException('Folder bukti tidak dapat ditulis');
            $temporary[$path] = $temp;
            $output = fopen($temp, 'wb');
            if (!$output) throw new RuntimeException('Berkas bukti tidak dapat ditulis');
            $copied = stream_copy_to_stream($stream, $output, 20000001);
            fclose($stream);
            fclose($output);
            if ($copied !== $stat['size'] || !hash_equals($expectedSha, hash_file('sha256', $temp))) {
                satisfactionImportError('Isi berkas bukti tidak sesuai manifest');
            }
            // Resolve by declared path after commit; validate signature here before rename.
            $signature = file_get_contents($temp, false, null, 0, 8);
            $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            if (!(($extension === 'pdf' && substr($signature, 0, 5) === '%PDF-')
                || (in_array($extension, ['jpg', 'jpeg'], true) && substr($signature, 0, 3) === "\xFF\xD8\xFF")
                || ($extension === 'png' && $signature === "\x89PNG\r\n\x1A\n"))) {
                satisfactionImportError('Format bukti tidak sesuai ekstensi');
            }
        }

        satisfactionImportTables($pdo);
        $pdo->beginTransaction();
        try {
            $insertRecord = $pdo->prepare('INSERT INTO import_kepuasan_pengguna
                (id, kategori, nama_sheet, nomor_baris, nomor_urut, nama_mahasiswa, nim, kelas, tahun_lulus,
                 nama_bukti, gdrive_url, gdrive_file_id, bukti_local_path)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE nama_mahasiswa=VALUES(nama_mahasiswa), nim=VALUES(nim),
                    kelas=VALUES(kelas), tahun_lulus=VALUES(tahun_lulus), nama_bukti=VALUES(nama_bukti),
                    gdrive_url=VALUES(gdrive_url), gdrive_file_id=VALUES(gdrive_file_id),
                    bukti_local_path=VALUES(bukti_local_path)');
            $insertRating = $pdo->prepare('INSERT INTO import_kepuasan_penilaian
                (record_id, indikator, label_penilaian, skor) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE label_penilaian=VALUES(label_penilaian), skor=VALUES(skor)');
            foreach ($records as $record) {
                $insertRecord->execute([
                    $record['id'], $record['category'], $record['sheet'], (int)$record['row'], (int)$record['number'],
                    $record['name'], $record['nim'], $record['class'], (int)$record['year'],
                    $record['proofName'] ?: null, $record['driveUrl'], $record['driveId'], $record['proof']['path'] ?? null,
                ]);
                foreach ($record['rating'] as $rating) {
                    $insertRating->execute([$record['id'], $rating['indicator'], $rating['label'], $rating['score']]);
                }
            }
            foreach ($temporary as $path => $temp) {
                $destination = $targetDir . '/' . basename($path);
                if (is_file($destination) && hash_equals($files[$path], hash_file('sha256', $destination))) {
                    unlink($temp);
                } elseif (!rename($temp, $destination)) {
                    throw new RuntimeException('Berkas bukti tidak dapat disimpan');
                }
                unset($temporary[$path]);
            }
            $pdo->commit();
        } catch (Throwable $error) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            throw $error;
        }
        return ['students' => 26, 'ratings' => 260, 'proofs' => 33];
    } finally {
        foreach ($temporary as $temp) if (is_file($temp)) unlink($temp);
        $zip->close();
    }
}

try {
    $user = requireAuth('admin');
    requireProductionWrite($user);
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') satisfactionImportError('Metode tidak diizinkan');
    $action = (string)($_POST['action'] ?? '');
    $owner = (string)($user['sub'] ?? '');
    if ($owner === '') satisfactionImportError('Sesi admin tidak valid');
    $root = __DIR__ . '/../../storage/satisfaction_import_uploads';
    if (!is_dir($root) && !mkdir($root, 0700, true)) throw new RuntimeException('Folder unggah tidak dapat dibuat');
    if ($action === 'start') {
        $size = filter_var($_POST['size'] ?? null, FILTER_VALIDATE_INT);
        $sha = strtolower(trim((string)($_POST['sha256'] ?? '')));
        if ($size === false || $size < 1 || $size > SATISFACTION_MAX_ARCHIVE_BYTES
            || !preg_match('/^[a-f0-9]{64}$/', $sha)) satisfactionImportError('Ukuran atau hash paket tidak valid');
        $id = bin2hex(random_bytes(16));
        $directory = $root . '/' . $id;
        if (!mkdir($directory, 0700)) throw new RuntimeException('Sesi unggah tidak dapat dibuat');
        $state = ['owner' => $owner, 'size' => $size, 'sha256' => $sha,
            'chunks' => (int)ceil($size / SATISFACTION_CHUNK_BYTES), 'next' => 0];
        file_put_contents($directory . '/state.json', json_encode($state));
        echo json_encode(['success' => true, 'data' => ['upload_id' => $id, 'chunk_size' => SATISFACTION_CHUNK_BYTES]]);
        exit();
    }
    if ($action === 'import_encrypted') {
        @set_time_limit(120);
        $archive = satisfactionEncryptedArchive(trim((string)($_POST['key'] ?? '')), $root);
        try {
            $result = satisfactionImportArchive($pdo, $archive);
        } finally {
            if (is_file($archive)) unlink($archive);
        }
        echo json_encode(['success' => true, 'data' => $result]);
        exit();
    }
    [$directory, $state] = satisfactionImportState($root, (string)($_POST['upload_id'] ?? ''), $owner);
    if ($action === 'cancel') {
        foreach (['archive.zip', 'state.json'] as $file) if (is_file($directory . '/' . $file)) unlink($directory . '/' . $file);
        rmdir($directory);
        echo json_encode(['success' => true]);
        exit();
    }
    if ($action === 'chunk') {
        $index = filter_var($_POST['index'] ?? null, FILTER_VALIDATE_INT);
        $part = $_FILES['chunk'] ?? null;
        if ($index === false || $index !== $state['next'] || !is_array($part)
            || ($part['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
            || ($part['size'] ?? 0) < 1 || $part['size'] > SATISFACTION_CHUNK_BYTES
            || !is_uploaded_file($part['tmp_name'])) satisfactionImportError('Potongan paket tidak valid');
        $expectedBytes = min(SATISFACTION_CHUNK_BYTES, $state['size'] - $index * SATISFACTION_CHUNK_BYTES);
        if ($part['size'] !== $expectedBytes) satisfactionImportError('Ukuran potongan paket tidak sesuai');
        $output = fopen($directory . '/archive.zip', 'ab');
        $input = fopen($part['tmp_name'], 'rb');
        if (!$output || !$input || !flock($output, LOCK_EX)) throw new RuntimeException('Potongan paket tidak dapat ditulis');
        $copied = stream_copy_to_stream($input, $output);
        fflush($output); flock($output, LOCK_UN); fclose($output); fclose($input);
        if ($copied !== $expectedBytes) throw new RuntimeException('Potongan paket tidak lengkap');
        $state['next']++;
        file_put_contents($directory . '/state.json', json_encode($state));
        echo json_encode(['success' => true, 'data' => ['received' => $state['next'], 'total' => $state['chunks']]]);
        exit();
    }
    if ($action !== 'finish') satisfactionImportError('Aksi unggah tidak valid');
    $archive = $directory . '/archive.zip';
    if ($state['next'] !== $state['chunks'] || !is_file($archive) || filesize($archive) !== $state['size']
        || !hash_equals($state['sha256'], hash_file('sha256', $archive))) {
        satisfactionImportError('Paket belum lengkap atau berubah saat diunggah');
    }
    @set_time_limit(120);
    $result = satisfactionImportArchive($pdo, $archive);
    unlink($archive); unlink($directory . '/state.json'); rmdir($directory);
    echo json_encode(['success' => true, 'data' => $result]);
} catch (Throwable $error) {
    http_response_code(api_exception_status($error));
    echo json_encode(['success' => false, 'error' => api_public_error($error)]);
}
