<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

try {
    $auth = dosen_require_active_auth($pdo);
    $userId = (string)($auth['sub'] ?? '');
    $current = dosen_find_for_user($pdo, $userId);
    if (!$current) {
        dosen_json_response(404, ['success' => false, 'error' => 'Profil dosen aktif tidak ditemukan.']);
    }

    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
        dosen_json_response(200, ['success' => true, 'data' => dosen_profile_from_row($current)]);
    }
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'PUT' && ($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        dosen_json_response(405, ['success' => false, 'error' => 'Method not allowed.']);
    }

    $profile = dosen_validate_profile(dosen_request_json());
    $nidnChanged = $profile['nidn'] !== $current['nidn'];
    $pdo->beginTransaction();
    if ($nidnChanged) {
        $duplicate = $pdo->prepare('SELECT COUNT(*) FROM dosen WHERE nidn = ? AND id <> ?');
        $duplicate->execute([$profile['nidn'], $current['id']]);
        if ((int)$duplicate->fetchColumn() > 0) {
            throw new RuntimeException('NIDN/NIDK baru sudah digunakan dosen lain.');
        }
        $duplicateUser = $pdo->prepare('SELECT COUNT(*) FROM users WHERE LOWER(TRIM(username)) = LOWER(TRIM(?)) AND id <> ?');
        $duplicateUser->execute([$profile['nidn'], $userId]);
        if ((int)$duplicateUser->fetchColumn() > 0) {
            throw new RuntimeException('NIDN/NIDK baru sudah digunakan akun lain.');
        }
    }
    $update = $pdo->prepare('UPDATE dosen SET nidn = ?, nama = ?, status_dosen = ?, jabatan = ?, peran = ?, institusi = ?, pendidikan_pasca_sarjana = ?, bidang_keahlian = ?, sertifikat_pendidik = ?, sertifikat_kompetensi = ?, email = ?, telepon = ?, updated_at = NOW() WHERE id = ?');
    $update->execute([
        $profile['nidn'], $profile['nama'], $profile['status_dosen'], $profile['jabatan'], $profile['peran'], $profile['institusi'],
        $profile['pendidikan_pasca_sarjana'], $profile['bidang_keahlian'], $profile['sertifikat_pendidik'],
        $profile['sertifikat_kompetensi'], $profile['email'], $profile['telepon'], $current['id'],
    ]);
    if ($nidnChanged) {
        $updateUser = $pdo->prepare('UPDATE users SET username = ?, nama = ? WHERE id = ? AND role = ?');
        $updateUser->execute([$profile['nidn'], $profile['nama'], $userId, 'dosen']);
    } else {
        $updateUser = $pdo->prepare('UPDATE users SET nama = ? WHERE id = ? AND role = ?');
        $updateUser->execute([$profile['nama'], $userId, 'dosen']);
    }
    $pdo->commit();

    $updated = dosen_find_for_user($pdo, $userId);
    $response = ['success' => true, 'data' => ['profile' => dosen_profile_from_row($updated), 'nidnChanged' => $nidnChanged]];
    if ($nidnChanged) {
        $response['data'] = array_merge($response['data'], dosen_issue_tokens(['id' => $userId, 'username' => $profile['nidn']]));
    }
    dosen_json_response(200, $response);
} catch (InvalidArgumentException $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(422, ['success' => false, 'error' => $error->getMessage()]);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    dosen_json_response(409, ['success' => false, 'error' => $error->getMessage()]);
}
