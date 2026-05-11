<?php
require_once __DIR__ . '/../../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/email_login.php';

function email_login_verify_fail(int $statusCode, string $message, string $code): void {
    http_response_code($statusCode);
    echo json_encode([
        'success' => false,
        'error' => $message,
        'code' => $code,
    ]);
    exit();
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        email_login_verify_fail(405, 'Method not allowed', 'EMAIL_LOGIN_VERIFY_METHOD_NOT_ALLOWED');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        email_login_verify_fail(400, 'Payload tidak valid', 'EMAIL_LOGIN_VERIFY_INVALID_PAYLOAD');
    }

    $token = trim((string)($input['token'] ?? ''));
    $otp = trim((string)($input['otp'] ?? ''));
    if ($token === '' && $otp === '') {
        email_login_verify_fail(400, 'Token atau kode OTP verifikasi diperlukan', 'EMAIL_LOGIN_VERIFY_TOKEN_REQUIRED');
    }
    if ($token !== '' && $otp !== '') {
        email_login_verify_fail(400, 'Berikan hanya token atau hanya kode OTP', 'EMAIL_LOGIN_VERIFY_BOTH_PROVIDED');
    }

    $student = null;
    $studentId = null;

    if ($token !== '') {
        $tokenHash = email_login_hash_token($token);
        $stmtStudent = $pdo->prepare('
            SELECT
                id, user_id, email, login_email, pending_login_email,
                email_verification_expires_at, email_verification_token_hash
            FROM students
            WHERE email_verification_token_hash = ? AND deleted_at IS NULL
            LIMIT 1
        ');
        $stmtStudent->execute([$tokenHash]);
        $student = $stmtStudent->fetch(PDO::FETCH_ASSOC);
        if (!$student) {
            email_login_verify_fail(400, 'Token verifikasi tidak valid', 'EMAIL_LOGIN_VERIFY_TOKEN_INVALID');
        }
        $studentId = (string)$student['id'];
    } else {
        require_once __DIR__ . '/../../../config/auth.php';
        $auth = requireAuth('student');
        $userId = trim((string)($auth['sub'] ?? ''));
        if ($userId === '') {
            email_login_verify_fail(401, 'Anda harus login sebagai mahasiswa untuk verifikasi dengan OTP', 'EMAIL_LOGIN_VERIFY_OTP_AUTH_REQUIRED');
        }
        $otpHash = email_login_hash_otp($otp);
        $stmtStudent = $pdo->prepare('
            SELECT
                id, user_id, email, login_email, pending_login_email,
                email_verification_expires_at, email_verification_otp_hash
            FROM students
            WHERE user_id = ? AND deleted_at IS NULL
              AND pending_login_email IS NOT NULL
              AND email_verification_otp_hash = ?
            LIMIT 1
        ');
        $stmtStudent->execute([$userId, $otpHash]);
        $student = $stmtStudent->fetch(PDO::FETCH_ASSOC);
        if (!$student) {
            email_login_verify_fail(400, 'Kode OTP tidak valid atau sudah digunakan', 'EMAIL_LOGIN_VERIFY_OTP_INVALID');
        }
        $studentId = (string)$student['id'];
    }

    $pendingLoginEmail = email_login_normalize_email((string)($student['pending_login_email'] ?? ''));
    if ($pendingLoginEmail === '' || !email_login_is_valid_email($pendingLoginEmail)) {
        email_login_verify_fail(
            400,
            'Email verifikasi tidak ditemukan. Ulangi proses aktivasi.',
            'EMAIL_LOGIN_VERIFY_PENDING_EMAIL_INVALID'
        );
    }

    $expiresAtRaw = trim((string)($student['email_verification_expires_at'] ?? ''));
    $expiresAtTs = $expiresAtRaw !== '' ? strtotime($expiresAtRaw) : false;
    if ($expiresAtTs === false || $expiresAtTs < time()) {
        $stmtClearExpired = $pdo->prepare('
            UPDATE students
            SET email_verification_token_hash = NULL,
                email_verification_otp_hash = NULL,
                email_verification_expires_at = NULL,
                email_verification_sent_at = NULL,
                updated_at = NOW()
            WHERE id = ?
        ');
        $stmtClearExpired->execute([$studentId]);
        email_login_verify_fail(400, 'Token verifikasi sudah kedaluwarsa', 'EMAIL_LOGIN_VERIFY_TOKEN_EXPIRED');
    }

    $stmtExistingLoginEmail = $pdo->prepare('
        SELECT id
        FROM students
        WHERE id <> ? AND deleted_at IS NULL AND LOWER(TRIM(login_email)) = ?
        LIMIT 1
    ');
    $stmtExistingLoginEmail->execute([$studentId, $pendingLoginEmail]);
    if ($stmtExistingLoginEmail->fetch(PDO::FETCH_ASSOC)) {
        email_login_verify_fail(409, 'Email sudah digunakan akun mahasiswa lain', 'EMAIL_LOGIN_VERIFY_EMAIL_IN_USE');
    }

    $stmtUserCollision = $pdo->prepare('
        SELECT id
        FROM users
        WHERE LOWER(TRIM(username)) = ? AND is_active = 1
        LIMIT 1
    ');
    $stmtUserCollision->execute([$pendingLoginEmail]);
    $userCollision = $stmtUserCollision->fetch(PDO::FETCH_ASSOC);
    $studentUserId = trim((string)($student['user_id'] ?? ''));
    if ($userCollision && (string)$userCollision['id'] !== $studentUserId) {
        email_login_verify_fail(
            409,
            'Email tidak dapat digunakan karena bentrok dengan identifier akun lain',
            'EMAIL_LOGIN_VERIFY_IDENTIFIER_CONFLICT'
        );
    }

    $pdo->beginTransaction();

    $stmtActivate = $pdo->prepare('
        UPDATE students
        SET email = ?,
            login_email = ?,
            pending_login_email = NULL,
            is_email_login_enabled = 1,
            email_verified_at = NOW(),
            email_verification_token_hash = NULL,
            email_verification_otp_hash = NULL,
            email_verification_expires_at = NULL,
            email_verification_sent_at = NULL,
            updated_at = NOW()
        WHERE id = ?
    ');
    $stmtActivate->execute([
        $pendingLoginEmail,
        $pendingLoginEmail,
        $studentId,
    ]);

    $stmtFetch = $pdo->prepare('
        SELECT login_email, is_email_login_enabled, email_verified_at
        FROM students
        WHERE id = ?
        LIMIT 1
    ');
    $stmtFetch->execute([$studentId]);
    $updated = $stmtFetch->fetch(PDO::FETCH_ASSOC);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'login_email' => $updated['login_email'] ?? $pendingLoginEmail,
            'is_email_login_enabled' => (bool)($updated['is_email_login_enabled'] ?? true),
            'email_verified_at' => $updated['email_verified_at'] ?? null,
        ],
        'message' => 'Email berhasil diverifikasi dan diaktifkan sebagai metode login',
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => 'EMAIL_LOGIN_VERIFY_ERROR',
    ]);
}
?>
