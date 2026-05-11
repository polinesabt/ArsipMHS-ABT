<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

function auth_login_map_student_data(array $row): array {
    $studentLastLogin = $row['student_last_login'] ?? ($row['last_login'] ?? null);

    return [
        'id' => $row['student_id'] ?? $row['id'],
        'nim' => $row['nim'] ?? null,
        'nama' => $row['student_nama'] ?? ($row['nama'] ?? null),
        'jurusan' => $row['jurusan'] ?? null,
        'prodi' => $row['prodi'] ?? null,
        'status' => $row['status'] ?? null,
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
    $stmt = $pdo->prepare('
        SELECT
            u.id AS user_id, u.username, u.nama AS user_nama, u.role, u.password_hash,
            s.id AS student_id, s.nim, s.nama AS student_nama, s.jurusan, s.prodi, s.status,
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
    ');
    $stmt->execute([$identifierLower, $identifierLower]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function auth_login_fetch_student_by_user_id(PDO $pdo, string $userId): ?array {
    $stmt = $pdo->prepare('SELECT * FROM students WHERE user_id = ? AND deleted_at IS NULL LIMIT 1');
    $stmt->execute([$userId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
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
            }
        }
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        auth_login_fail('Username atau password salah');
    }

    if (($user['role'] ?? '') === 'student' && !$studentData) {
        auth_login_fail('Akun mahasiswa tidak aktif');
    }

    $tokenPayload = [
        'sub' => $user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
    ];
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

    $stmt = $pdo->prepare('UPDATE users SET last_login = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);

    if ($user['role'] === 'student') {
        $stmt = $pdo->prepare('UPDATE students SET last_login = NOW() WHERE user_id = ?');
        $stmt->execute([$user['id']]);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'token' => $accessToken,
            'jwt' => $accessToken,
            'refreshToken' => $refreshToken,
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'nama' => $user['nama'],
                'role' => $user['role'],
                'student' => $studentData,
            ],
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
