<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

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

    $user = null;
    $studentData = null;

    if ($role === 'student') {
        $stmt = $pdo->prepare('
            SELECT
                u.id AS user_id, u.username, u.nama AS user_nama, u.role, u.password_hash,
                s.id AS student_id, s.nim, s.nama AS student_nama, s.jurusan, s.prodi, s.status,
                s.tahun_masuk, s.tahun_lulus, s.email, s.no_hp, s.alamat, s.has_credentials, s.last_login AS student_last_login,
                s.created_at AS student_created_at, s.updated_at AS student_updated_at
            FROM students s
            JOIN users u ON s.user_id COLLATE utf8mb4_unicode_ci = u.id
            WHERE s.nim = ? AND u.is_active = 1
            LIMIT 1
        ');
        $stmt->execute([$username]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $user = [
                'id' => $row['user_id'],
                'username' => $row['username'],
                'nama' => $row['user_nama'],
                'role' => $row['role'],
                'password_hash' => $row['password_hash'],
            ];
            $studentData = [
                'id' => $row['student_id'],
                'nim' => $row['nim'],
                'nama' => $row['student_nama'],
                'jurusan' => $row['jurusan'],
                'prodi' => $row['prodi'],
                'status' => $row['status'],
                'tahun_masuk' => $row['tahun_masuk'],
                'tahun_lulus' => $row['tahun_lulus'],
                'email' => $row['email'],
                'no_hp' => $row['no_hp'],
                'alamat' => $row['alamat'],
                'has_credentials' => (bool)$row['has_credentials'],
                'last_login' => $row['student_last_login'],
                'created_at' => $row['student_created_at'],
                'updated_at' => $row['student_updated_at'],
            ];
        }

        if (!$user) {
            $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE username = ? AND role = ? AND is_active = 1');
            $stmt->execute([$username, 'student']);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                $stmt = $pdo->prepare('SELECT * FROM students WHERE user_id = ?');
                $stmt->execute([$user['id']]);
                $studentData = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
            }
        }
    } elseif ($role === 'admin') {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE username = ? AND role = ? AND is_active = 1');
        $stmt->execute([$username, 'admin']);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt = $pdo->prepare('SELECT id, username, nama, role, password_hash FROM users WHERE username = ? AND is_active = 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
    }

    if (!$user || !password_verify($password, $user['password_hash'])) {
        auth_login_fail('Username atau password salah');
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
