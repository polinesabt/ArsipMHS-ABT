<?php
require_once __DIR__ . '/../../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/auth.php';
require_once __DIR__ . '/../../../config/email_login.php';

function email_login_request_fail(int $statusCode, string $message, string $code, array $extra = []): void {
    http_response_code($statusCode);
    echo json_encode(array_merge([
        'success' => false,
        'error' => $message,
        'code' => $code,
    ], $extra));
    exit();
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        email_login_request_fail(405, 'Method not allowed', 'EMAIL_LOGIN_METHOD_NOT_ALLOWED');
    }

    $auth = requireAuth('student');
    $userId = trim((string)($auth['sub'] ?? ''));
    if ($userId === '') {
        email_login_request_fail(401, 'Token autentikasi tidak valid', 'EMAIL_LOGIN_AUTH_INVALID');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    if ($input !== null && !is_array($input)) {
        email_login_request_fail(400, 'Payload tidak valid', 'EMAIL_LOGIN_INVALID_PAYLOAD');
    }
    if (!is_array($input)) {
        $input = [];
    }

    $sourceRaw = trim((string)($input['source'] ?? 'dashboard'));
    $allowedSources = ['dashboard', 'career_form', 'future_form'];
    $source = in_array($sourceRaw, $allowedSources, true) ? $sourceRaw : 'dashboard';

    $stmtStudent = $pdo->prepare('
        SELECT
            id, email, login_email, pending_login_email, is_email_login_enabled,
            email_verified_at, email_verification_sent_at
        FROM students
        WHERE user_id = ? AND deleted_at IS NULL
        LIMIT 1
    ');
    $stmtStudent->execute([$userId]);
    $student = $stmtStudent->fetch(PDO::FETCH_ASSOC);
    if (!$student) {
        email_login_request_fail(404, 'Akun mahasiswa tidak ditemukan atau tidak aktif', 'EMAIL_LOGIN_STUDENT_NOT_FOUND');
    }

    $providedEmail = trim((string)($input['email'] ?? ''));
    $targetEmail = $providedEmail !== ''
        ? email_login_normalize_email($providedEmail)
        : email_login_normalize_email((string)($student['email'] ?? ''));

    if ($targetEmail === '') {
        email_login_request_fail(
            400,
            'Email kontak belum tersedia. Isi email terlebih dahulu.',
            'EMAIL_LOGIN_CONTACT_EMAIL_REQUIRED'
        );
    }
    if (!email_login_is_valid_email($targetEmail)) {
        email_login_request_fail(400, 'Format email tidak valid', 'EMAIL_LOGIN_EMAIL_INVALID');
    }

    $cooldownSeconds = email_login_cooldown_seconds();
    $sentAtRaw = trim((string)($student['email_verification_sent_at'] ?? ''));
    if ($sentAtRaw !== '') {
        $sentAt = strtotime($sentAtRaw);
        if ($sentAt !== false) {
            $elapsed = time() - $sentAt;
            $remaining = $cooldownSeconds - $elapsed;
            if ($remaining > 0) {
                email_login_request_fail(
                    429,
                    'Permintaan terlalu sering. Coba lagi dalam ' . $remaining . ' detik.',
                    'EMAIL_LOGIN_COOLDOWN',
                    ['retry_after_seconds' => $remaining]
                );
            }
        }
    }

    $studentId = (string)$student['id'];

    $stmtExistingLoginEmail = $pdo->prepare('
        SELECT id
        FROM students
        WHERE id <> ? AND deleted_at IS NULL AND LOWER(TRIM(login_email)) = ?
        LIMIT 1
    ');
    $stmtExistingLoginEmail->execute([$studentId, $targetEmail]);
    if ($stmtExistingLoginEmail->fetch(PDO::FETCH_ASSOC)) {
        email_login_request_fail(409, 'Email sudah digunakan akun mahasiswa lain', 'EMAIL_LOGIN_ALREADY_USED');
    }

    $stmtExistingPending = $pdo->prepare('
        SELECT id
        FROM students
        WHERE id <> ? AND deleted_at IS NULL AND LOWER(TRIM(pending_login_email)) = ?
        LIMIT 1
    ');
    $stmtExistingPending->execute([$studentId, $targetEmail]);
    if ($stmtExistingPending->fetch(PDO::FETCH_ASSOC)) {
        email_login_request_fail(
            409,
            'Email sedang menunggu verifikasi pada akun lain',
            'EMAIL_LOGIN_PENDING_ALREADY_USED'
        );
    }

    $stmtUserCollision = $pdo->prepare('
        SELECT id
        FROM users
        WHERE LOWER(TRIM(username)) = ? AND is_active = 1
        LIMIT 1
    ');
    $stmtUserCollision->execute([$targetEmail]);
    $userCollision = $stmtUserCollision->fetch(PDO::FETCH_ASSOC);
    if ($userCollision && (string)$userCollision['id'] !== $userId) {
        email_login_request_fail(
            409,
            'Email tidak dapat digunakan karena bentrok dengan identifier akun lain',
            'EMAIL_LOGIN_IDENTIFIER_CONFLICT'
        );
    }

    $token = bin2hex(random_bytes(32));
    $tokenHash = email_login_hash_token($token);
    $otpCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $otpHash = email_login_hash_otp($otpCode);
    $expiresAt = date('Y-m-d H:i:s', time() + email_login_token_ttl_seconds());
    $verificationUrl = email_login_build_verification_url($token);

    $pdo->beginTransaction();

    $stmtUpdate = $pdo->prepare('
        UPDATE students
        SET email = ?,
            pending_login_email = ?,
            email_verification_token_hash = ?,
            email_verification_otp_hash = ?,
            email_verification_expires_at = ?,
            email_verification_sent_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
    ');
    $stmtUpdate->execute([
        $targetEmail,
        $targetEmail,
        $tokenHash,
        $otpHash,
        $expiresAt,
        $studentId,
    ]);

    $sendResult = email_login_send_verification_email($targetEmail, $verificationUrl, $source, $otpCode);
    if (!($sendResult['sent'] ?? false)) {
        $reason = trim((string)($sendResult['error_reason'] ?? 'unknown'));
        $driver = trim((string)($sendResult['delivery_driver'] ?? email_login_driver()));
        error_log(sprintf(
            '[email_login] request_verification_send_failed student_id=%s source=%s driver=%s reason=%s',
            $studentId,
            $source,
            $driver,
            $reason
        ));
        throw new Exception('Gagal mengirim email verifikasi. Silakan coba lagi.');
    }

    $pdo->commit();

    $responseData = [
        'requested_email' => $targetEmail,
        'login_email' => $student['login_email'] ?? null,
        'pending_login_email' => $targetEmail,
        'is_email_login_enabled' => (bool)($student['is_email_login_enabled'] ?? false),
        'email_verified_at' => $student['email_verified_at'] ?? null,
        'expires_at' => $expiresAt,
        'cooldown_seconds' => $cooldownSeconds,
        'source' => $source,
    ];

    $debugUrl = $sendResult['debug_verification_url'] ?? null;
    if (!email_login_is_production() && is_string($debugUrl) && $debugUrl !== '') {
        $responseData['debug_verification_url'] = $debugUrl;
    }

    echo json_encode([
        'success' => true,
        'data' => $responseData,
        'message' => 'Link verifikasi berhasil dikirim',
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'code' => 'EMAIL_LOGIN_REQUEST_ERROR',
    ]);
}
?>
