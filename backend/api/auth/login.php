<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../students/status_effective_sql.php';

function auth_login_map_student_data(array $row): array {
    $studentLastLogin = $row['student_last_login'] ?? ($row['last_login'] ?? null);

    return [
        'id' => $row['student_id'] ?? $row['id'],
        'nim' => $row['nim'] ?? null,
        'nama' => $row['student_nama'] ?? ($row['nama'] ?? null),
        'jurusan' => $row['jurusan'] ?? null,
        'prodi' => $row['prodi'] ?? null,
        'status' => $row['status'] ?? null,
        'status_mode' => $row['status_mode'] ?? null,
        'status_effective' => $row['status_effective'] ?? ($row['status'] ?? null),
        'tahun_masuk' => $row['tahun_masuk'] ?? null,
        'tahun_lulus' => $row['tahun_lulus'] ?? null,
        'email' => $row['email'] ?? null,
        'no_hp' => $row['no_hp'] ?? null,
        'alamat' => $row['alamat'] ?? null,
        'has_credentials' => (bool)($row['has_credentials'] ?? false),
        'last_login' => $studentLastLogin,
        'created_at' => $row['student_created_at'] ?? ($row['created_at'] ?? null),
        'updated_at' => $row['student_updated_at'] ?? ($row['updated_at'] ?? null),
        'login_email' => $row['login_email'] ?? null,
        'pending_login_email' => $row['pending_login_email'] ?? null,
        'is_email_login_enabled' => (bool)($row['is_email_login_enabled'] ?? false),
        'email_verified_at' => $row['email_verified_at'] ?? null,
        'is_first_login' => empty($studentLastLogin),
    ];
}

function auth_login_fetch_student_join_by_identifier(PDO $pdo, string $identifierLower): ?array {
    $statusEffectiveExpr = student_status_effective_expr('s');
    $sql = '
        SELECT
            u.id AS user_id, u.username, u.nama AS user_nama, u.role, u.password_hash,
            s.id AS student_id, s.nim, s.nama AS student_nama, s.jurusan, s.prodi, s.status, s.status_mode,
            (' . $statusEffectiveExpr . ') AS status_effective,
            s.tahun_masuk, s.tahun_lulus, s.email, s.no_hp, s.alamat, s.has_credentials,
            s.last_login AS student_last_login, s.created_at AS student_created_at, s.updated_at AS student_updated_at,
            s.login_email, s.pending_login_email, s.is_email_login_enabled, s.email_verified_at
        FROM students s
        JOIN users u ON s.user_id = u.id AND u.is_active = 1
        WHERE s.deleted_at IS NULL
          AND (
            LOWER(TRIM(s.nim)) = ?
            OR (
                s.is_email_login_enabled = 1
                AND s.login_email IS NOT NULL
                AND LOWER(TRIM(s.login_email)) = ?
            )
          )
        LIMIT 1
    ';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$identifierLower, $identifierLower]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function auth_login_fetch_student_by_user_id(PDO $pdo, string $userId): ?array {
    $statusEffectiveExpr = student_status_effective_expr('s');
    $stmt = $pdo->prepare('SELECT s.*, (' . $statusEffectiveExpr . ') AS status_effective FROM students s WHERE s.user_id = ? AND s.deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function auth_login_fetch_dosen_by_user_id(PDO $pdo, string $userId): ?array {
    $stmt = $pdo->prepare('SELECT * FROM dosen WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;
    $qualifications = json_decode((string)($row['pendidikan_pasca_sarjana'] ?? '[]'), true);
    if (!is_array($qualifications)) $qualifications = [];
    return [
        'id' => (string)$row['id'],
        'userId' => (string)$row['user_id'],
        'nidn' => (string)$row['nidn'],
        'nama' => (string)$row['nama'],
        'statusDosen' => (string)$row['status_dosen'],
        'jabatan' => (string)$row['jabatan'],
        'institusi' => (string)$row['institusi'],
        'pendidikanPascaSarjana' => array_values($qualifications),
        'bidangKeahlian' => (string)($row['bidang_keahlian'] ?? ''),
        'sertifikatPendidik' => (string)($row['sertifikat_pendidik'] ?? ''),
        'sertifikatKompetensi' => (string)($row['sertifikat_kompetensi'] ?? ''),
        'peran' => (string)($row['peran'] ?? 'Akademisi'),
        'email' => (string)($row['email'] ?? ''),
        'telepon' => (string)($row['telepon'] ?? ''),
    ];
}

function auth_login_fetch_tendik_by_user_id(PDO $pdo, string $userId): ?array {
    $stmt = $pdo->prepare('SELECT * FROM tenaga_kependidikan WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) return null;
    $certificates = json_decode((string)($row['sertifikat_kompetensi'] ?? '[]'), true);
    if (!is_array($certificates)) $certificates = [];
    return [
        'id' => (string)$row['id'],
        'userId' => (string)$row['user_id'],
        'nip' => (string)$row['nip'],
        'nama' => (string)$row['nama'],
        'status' => (string)$row['status'],
        'jabatan' => (string)$row['jabatan'],
        'golongan' => (string)($row['golongan'] ?? ''),
        'pendidikanD3' => (string)($row['pendidikan_d3'] ?? ''),
        'pendidikanS1' => (string)($row['pendidikan_s1'] ?? ''),
        'pendidikanS2' => (string)($row['pendidikan_s2'] ?? ''),
        'pendidikanS3' => (string)($row['pendidikan_s3'] ?? ''),
        'sertifikatKompetensi' => array_values(array_map('strval', $certificates)),
    ];
}

function auth_login_fail(string $message): void {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'code' => 'AUTH_LOGIN_INVALID_CREDENTIALS',
    ]);
    exit();
}

function auth_login_issue_fail(string $reason, string $userId): void {
    error_log('AUTH_ISSUE_TOKEN_FAILED reason=' . $reason . ' user_id=' . $userId);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Gagal membuat sesi autentikasi',
        'code' => 'AUTH_ISSUE_TOKEN_FAILED',
    ]);
    exit();
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['username']) || !isset($input['password'])) {
        throw new Exception('Username dan password diperlukan');
    }

    $username = trim((string)$input['username']);
    $password = (string)$input['password'];
    $role = isset($input['role']) ? trim((string)$input['role']) : null;

    $usernameLower = mb_strtolower($username);

    $user = null;
    $studentData = null;
    $dosenData = null;
    $tendikData = null;

    if ($role === 'student') {
        $row = auth_login_fetch_student_join_by_identifier($pdo, $usernameLower);

        if ($row) {
            $user = [
                'id' => $row['user_id'],
                'username' => $row['username'],
                'nama' => $row['user_nama'],
                'role' => $row['role'],
                'password_hash' => $row['password_hash'],
            ];
            $studentData = auth_login_map_student_data($row);
        }

        if (!$user) {
            $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
            $stmt->execute([$usernameLower, 'student']);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $studentRow = auth_login_fetch_student_by_user_id($pdo, (string)$user['id']);
                $studentData = $studentRow ? auth_login_map_student_data($studentRow) : null;
            }
        }
    } elseif ($role === 'dosen') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower, 'dosen']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            $stmtD = $pdo->prepare('SELECT u.id, u.username, u.nama, u.role, u.password_hash FROM dosen d JOIN users u ON d.user_id = u.id WHERE d.deleted_at IS NULL AND u.role = \'dosen\' AND u.is_active = 1 AND (LOWER(TRIM(d.nidn)) = ? OR (d.email IS NOT NULL AND LOWER(TRIM(d.email)) = ?)) LIMIT 1');
            $stmtD->execute([$usernameLower, $usernameLower]);
            $user = $stmtD->fetch(PDO::FETCH_ASSOC);
        }
        if ($user) $dosenData = auth_login_fetch_dosen_by_user_id($pdo, (string)$user['id']);
    } elseif ($role === 'tendik') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower, 'tendik']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) $tendikData = auth_login_fetch_tendik_by_user_id($pdo, (string)$user['id']);
    } elseif ($role === 'demo') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower, 'demo']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($role === 'developer') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower, 'developer']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } elseif ($role === 'admin') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND role = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower, 'admin']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE LOWER(TRIM(username)) = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$usernameLower]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && $user['role'] === 'student') {
            $studentRow = auth_login_fetch_student_by_user_id($pdo, (string)$user['id']);
            $studentData = $studentRow ? auth_login_map_student_data($studentRow) : null;
        }
        if ($user && $user['role'] === 'dosen') {
            $dosenData = auth_login_fetch_dosen_by_user_id($pdo, (string)$user['id']);
        }
        if ($user && $user['role'] === 'tendik') {
            $tendikData = auth_login_fetch_tendik_by_user_id($pdo, (string)$user['id']);
        }

        if (!$user) {
            $row = auth_login_fetch_student_join_by_identifier($pdo, $usernameLower);
            if ($row) {
                $user = [
                    'id' => $row['user_id'],
                    'username' => $row['username'],
                    'nama' => $row['user_nama'],
                    'role' => $row['role'],
                    'password_hash' => $row['password_hash'],
                ];
                $studentData = auth_login_map_student_data($row);
            } else {
                $stmtD = $pdo->prepare('SELECT u.id, u.username, u.nama, u.role, u.password_hash FROM dosen d JOIN users u ON d.user_id = u.id WHERE d.deleted_at IS NULL AND u.role = \'dosen\' AND u.is_active = 1 AND (LOWER(TRIM(d.nidn)) = ? OR (d.email IS NOT NULL AND LOWER(TRIM(d.email)) = ?)) LIMIT 1');
                $stmtD->execute([$usernameLower, $usernameLower]);
                $user = $stmtD->fetch(PDO::FETCH_ASSOC);
                if ($user && $user['role'] === 'dosen') {
                    $dosenData = auth_login_fetch_dosen_by_user_id($pdo, (string)$user['id']);
                }
            }
        }
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        auth_login_fail('Username atau password salah');
    }

    if (($user['role'] ?? '') === 'student' && !$studentData) {
        auth_login_fail('Akun mahasiswa tidak aktif');
    }
    if (($user['role'] ?? '') === 'dosen' && !$dosenData) {
        auth_login_fail('Akun dosen tidak aktif');
    }
    if (($user['role'] ?? '') === 'tendik' && !$tendikData) {
        auth_login_fail('Akun tendik tidak aktif');
    }

    $tokenPayload = [
        'sub' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
    ];
    if ($user['role'] === 'demo') {
        $tokenPayload['demo_mode'] = true;
        $tokenPayload['sid'] = bin2hex(random_bytes(18));
    }
    $accessToken = auth_generate_token($tokenPayload);
    $refreshToken = auth_generate_token($tokenPayload, JWT_REFRESH_EXPIRATION);

    $verify = auth_verify_token_detailed($accessToken);
    if (!($verify['ok'] ?? false)) {
        auth_login_issue_fail((string)($verify['reason'] ?? 'unknown'), (string)$user['id']);
    }

    $verifiedPayload = $verify['payload'] ?? null;
    if (!is_array($verifiedPayload) || ($verifiedPayload['sub'] ?? null) !== $user['id']) {
        auth_login_issue_fail('self_check_payload_mismatch', (string)$user['id']);
    }

    if ($user['role'] !== 'demo') {
        $stmt = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
        $stmt->execute([$user['id']]);
    }

    if ($user['role'] === 'student') {
        $stmt = $pdo->prepare('UPDATE students SET last_login = NOW() WHERE user_id = ?');
        $stmt->execute([$user['id']]);
    }

    $canEditDosen = null;
    $canEditMahasiswa = null;
    if ($user['role'] === 'admin' || $user['role'] === 'demo') {
        try {
            if ($user['role'] === 'demo') {
                $canEditDosen = true;
                $canEditMahasiswa = true;
            } else {
            $stmtAdmin = $pdo->prepare('SELECT can_edit_dosen, can_edit_mahasiswa FROM admins WHERE id = ? LIMIT 1');
            $stmtAdmin->execute([$user['id']]);
            $adminRow = $stmtAdmin->fetch(PDO::FETCH_ASSOC);
            if ($adminRow) {
                $canEditDosen = (bool)$adminRow['can_edit_dosen'];
                $canEditMahasiswa = (bool)$adminRow['can_edit_mahasiswa'];
            } else {
                $canEditDosen = true;
                $canEditMahasiswa = true;
            }
            }
        } catch (Throwable $ignore) {
            $canEditDosen = true;
            $canEditMahasiswa = true;
        }
    }

    $userResponse = [
        'id' => $user['id'],
        'username' => $user['username'],
        'nama' => $user['nama'],
        'role' => $user['role'],
        'student' => $studentData,
    ];
    if ($user['role'] === 'dosen') {
        $userResponse['dosen'] = $dosenData;
    }
    if ($user['role'] === 'tendik') {
        $userResponse['tendik'] = $tendikData;
    }
    if ($user['role'] === 'admin' || $user['role'] === 'demo') {
        $userResponse['can_edit_dosen'] = $canEditDosen ?? true;
        $userResponse['can_edit_mahasiswa'] = $canEditMahasiswa ?? true;
    }
    if ($user['role'] === 'demo') {
        $userResponse['demo_mode'] = true;
        $userResponse['demo_session_id'] = $tokenPayload['sid'];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $accessToken,
            'jwt' => $accessToken,
            'refreshToken' => $refreshToken,
            'user' => $userResponse,
            'role' => $user['role'],
        ],
        'message' => 'Login berhasil',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
