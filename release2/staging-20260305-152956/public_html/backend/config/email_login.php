<?php
/**
 * Helpers untuk aktivasi email login mahasiswa.
 *
 * Catatan:
 * - Verifikasi via link token satu kali pakai.
 * - Driver default pengiriman email: SMTP.
 * - Development fallback: link dicatat ke log agar tetap bisa diuji.
 */

require_once __DIR__ . '/env.php';

if (!function_exists('email_login_env')) {
    function email_login_env(string $key, string $fallback = ''): string {
        if (isset($_ENV[$key]) && is_string($_ENV[$key])) {
            $value = trim((string)$_ENV[$key]);
            if ($value !== '') {
                return $value;
            }
        }
        if (isset($_SERVER[$key]) && is_string($_SERVER[$key])) {
            $value = trim((string)$_SERVER[$key]);
            if ($value !== '') {
                return $value;
            }
        }
        $value = getenv($key);
        if ($value === false) {
            return $fallback;
        }
        $value = trim((string)$value);
        return $value !== '' ? $value : $fallback;
    }
}

if (!function_exists('email_login_is_production')) {
    function email_login_is_production(): bool {
        return strtolower(email_login_env('APP_ENV', 'development')) === 'production';
    }
}

if (!function_exists('email_login_dev_fallback_enabled')) {
    function email_login_dev_fallback_enabled(): bool {
        $value = strtolower(email_login_env('EMAIL_DEV_FALLBACK_ENABLED', '1'));
        return $value === '1' || $value === 'true' || $value === 'yes';
    }
}

if (!function_exists('email_login_token_ttl_seconds')) {
    function email_login_token_ttl_seconds(): int {
        $value = (int)email_login_env('EMAIL_LOGIN_TOKEN_TTL', '1800');
        return $value > 0 ? $value : 1800;
    }
}

if (!function_exists('email_login_cooldown_seconds')) {
    function email_login_cooldown_seconds(): int {
        $value = (int)email_login_env('EMAIL_LOGIN_RESEND_COOLDOWN', '60');
        return $value > 0 ? $value : 60;
    }
}

if (!function_exists('email_login_normalize_email')) {
    function email_login_normalize_email(?string $email): string {
        $value = trim((string)$email);
        if ($value === '') {
            return '';
        }
        return strtolower($value);
    }
}

if (!function_exists('email_login_is_valid_email')) {
    function email_login_is_valid_email(string $email): bool {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }
}

if (!function_exists('email_login_hash_token')) {
    function email_login_hash_token(string $token): string {
        return hash('sha256', trim($token));
    }
}

if (!function_exists('email_login_hash_otp')) {
    function email_login_hash_otp(string $otp): string {
        return hash('sha256', trim($otp));
    }
}

if (!function_exists('email_login_frontend_base_url')) {
    function email_login_frontend_base_url(): string {
        $explicit = rtrim(email_login_env('FRONTEND_BASE_URL', ''), '/');
        if ($explicit !== '') {
            return $explicit;
        }

        $allowedOrigin = trim(email_login_env('ALLOWED_ORIGIN', ''));
        if ($allowedOrigin !== '' && $allowedOrigin !== '*') {
            $origins = array_values(array_filter(array_map('trim', explode(',', $allowedOrigin))));
            if (count($origins) > 0) {
                return rtrim($origins[0], '/');
            }
        }

        $apiBase = rtrim(email_login_env('API_BASE_URL', ''), '/');
        if ($apiBase !== '') {
            $baseFromApi = preg_replace('#/backend/api$#i', '', $apiBase);
            if (is_string($baseFromApi) && trim($baseFromApi) !== '') {
                return rtrim($baseFromApi, '/');
            }
        }

        $host = trim((string)($_SERVER['HTTP_HOST'] ?? ''));
        if ($host !== '') {
            $isHttps = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
            $scheme = $isHttps ? 'https' : 'http';
            $scriptName = (string)($_SERVER['SCRIPT_NAME'] ?? '');
            $basePath = '';
            if ($scriptName !== '') {
                $basePath = (string)preg_replace('#/backend/api/.*$#i', '', $scriptName);
            }
            return rtrim($scheme . '://' . $host . $basePath, '/');
        }

        return 'http://localhost';
    }
}

if (!function_exists('email_login_build_verification_url')) {
    function email_login_build_verification_url(string $token): string {
        $base = email_login_frontend_base_url();
        return rtrim($base, '/') . '/validasi?email_verify_token=' . rawurlencode($token);
    }
}

if (!function_exists('email_login_write_fallback_log')) {
    function email_login_write_fallback_log(string $message): void {
        error_log($message);
        $logDir = dirname(__DIR__) . '/storage/logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0777, true);
        }
        $logFile = $logDir . '/email_login.log';
        $line = '[' . date('Y-m-d H:i:s') . '] ' . $message . PHP_EOL;
        @file_put_contents($logFile, $line, FILE_APPEND);
    }
}

if (!function_exists('email_login_driver')) {
    function email_login_driver(): string {
        $driver = strtolower(email_login_env('EMAIL_DRIVER', 'smtp'));
        if ($driver !== 'smtp' && $driver !== 'mail') {
            return 'smtp';
        }
        return $driver;
    }
}

if (!function_exists('email_login_mask_email')) {
    function email_login_mask_email(string $email): string {
        $value = trim($email);
        if ($value === '' || strpos($value, '@') === false) {
            return '***';
        }
        [$local, $domain] = explode('@', $value, 2);
        $local = trim($local);
        $domain = trim($domain);
        if ($local === '' || $domain === '') {
            return '***';
        }
        if (strlen($local) <= 2) {
            return substr($local, 0, 1) . '*@' . $domain;
        }
        return substr($local, 0, 2) . str_repeat('*', max(1, strlen($local) - 2)) . '@' . $domain;
    }
}

if (!function_exists('email_login_send_via_mail')) {
    function email_login_send_via_mail(string $toEmail, string $subject, string $body, string $from): array {
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        if ($from !== '') {
            $headers .= 'From: ' . $from . "\r\n";
        }

        $sent = false;
        if (function_exists('mail')) {
            $sent = @mail($toEmail, $subject, $body, $headers);
        }

        return [
            'sent' => $sent,
            'error_reason' => $sent ? null : 'mail_send_failed',
            'error_detail' => null,
        ];
    }
}

if (!function_exists('email_login_send_via_smtp')) {
    function email_login_send_via_smtp(
        string $toEmail,
        string $subject,
        string $body,
        string $fromEmail,
        string $fromName
    ): array {
        $autoload = dirname(__DIR__) . '/vendor/autoload.php';
        if (!file_exists($autoload)) {
            return [
                'sent' => false,
                'error_reason' => 'composer_autoload_missing',
                'error_detail' => null,
            ];
        }

        require_once $autoload;

        if (!class_exists(\PHPMailer\PHPMailer\PHPMailer::class)) {
            return [
                'sent' => false,
                'error_reason' => 'phpmailer_not_installed',
                'error_detail' => null,
            ];
        }

        $host = trim(email_login_env('EMAIL_SMTP_HOST', 'smtp.gmail.com'));
        $port = (int)email_login_env('EMAIL_SMTP_PORT', '587');
        $secure = strtolower(trim(email_login_env('EMAIL_SMTP_SECURE', 'tls')));
        $username = trim(email_login_env('EMAIL_SMTP_USER', ''));
        $password = (string)email_login_env('EMAIL_SMTP_PASS', '');

        if ($host === '') {
            return [
                'sent' => false,
                'error_reason' => 'smtp_host_missing',
                'error_detail' => null,
            ];
        }

        if ($username === '' || $password === '') {
            return [
                'sent' => false,
                'error_reason' => 'smtp_credentials_missing',
                'error_detail' => null,
            ];
        }

        try {
            $mailer = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mailer->isSMTP();
            $mailer->Host = $host;
            $mailer->SMTPAuth = true;
            $mailer->Username = $username;
            $mailer->Password = $password;
            $mailer->Port = $port > 0 ? $port : 587;
            $mailer->CharSet = 'UTF-8';
            $mailer->Timeout = 15;

            if ($secure === 'ssl') {
                $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
            } elseif ($secure === 'tls' || $secure === 'starttls') {
                $mailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            }

            $mailer->setFrom($fromEmail !== '' ? $fromEmail : $username, $fromName);
            $mailer->addAddress($toEmail);
            $mailer->Subject = $subject;
            $mailer->Body = $body;
            $mailer->isHTML(false);

            $mailer->send();

            return [
                'sent' => true,
                'error_reason' => null,
                'error_detail' => null,
            ];
        } catch (Throwable $e) {
            return [
                'sent' => false,
                'error_reason' => 'smtp_send_failed',
                'error_detail' => trim($e->getMessage()) !== '' ? trim($e->getMessage()) : null,
            ];
        }
    }
}

if (!function_exists('email_login_send_verification_email')) {
    /**
     * @param string $toEmail
     * @param string $verificationUrl
     * @param string $source
     * @param string $otpCode Optional 6-digit OTP to include in email (empty = link only)
     */
    function email_login_send_verification_email(string $toEmail, string $verificationUrl, string $source = 'dashboard', string $otpCode = ''): array {
        $subject = 'Verifikasi Email Login ARSIP MAHASISWA ABT';
        $ttlMinutes = (int)(email_login_token_ttl_seconds() / 60);
        $lines = [
            'Halo,',
            '',
            'Klik link berikut untuk mengaktifkan email sebagai metode login tambahan:',
            $verificationUrl,
            '',
            'Link ini berlaku ' . $ttlMinutes . ' menit.',
        ];
        if ($otpCode !== '') {
            $lines[] = '';
            $lines[] = 'Atau gunakan kode OTP: ' . $otpCode;
            $lines[] = 'Kode OTP berlaku ' . $ttlMinutes . ' menit. Masukkan kode di dashboard setelah klik "Kirim Verifikasi".';
        }
        $lines[] = '';
        $lines[] = 'Jika Anda tidak meminta aktivasi ini, abaikan email ini.';
        $lines[] = '';
        $lines[] = 'Sumber aktivasi: ' . $source;
        $body = implode("\n", $lines);

        $fromEmail = trim(email_login_env('EMAIL_FROM', 'no-reply@arsipmhs.local'));
        $fromName = trim(email_login_env('EMAIL_FROM_NAME', 'Arsip Mahasiswa ABT'));
        $driver = email_login_driver();

        if ($driver === 'mail') {
            $transportResult = email_login_send_via_mail($toEmail, $subject, $body, $fromEmail);
        } else {
            $transportResult = email_login_send_via_smtp($toEmail, $subject, $body, $fromEmail, $fromName);
        }

        if (($transportResult['sent'] ?? false) === true) {
            return [
                'sent' => true,
                'fallback_logged' => false,
                'debug_verification_url' => null,
                'error_reason' => null,
                'delivery_driver' => $driver,
            ];
        }

        $reason = trim((string)($transportResult['error_reason'] ?? 'unknown_delivery_error'));
        $detail = trim((string)($transportResult['error_detail'] ?? ''));
        $maskedTo = email_login_mask_email($toEmail);
        $safeLog = sprintf(
            '[email_login] delivery_failed driver=%s to=%s source=%s reason=%s',
            $driver,
            $maskedTo,
            $source,
            $reason
        );
        if ($detail !== '') {
            $safeLog .= ' detail=' . $detail;
        }
        email_login_write_fallback_log($safeLog);

        if (!email_login_is_production() && email_login_dev_fallback_enabled()) {
            $fallbackLog = sprintf(
                '[email_login] fallback_link to=%s source=%s url=%s',
                $toEmail,
                $source,
                $verificationUrl
            );
            email_login_write_fallback_log($fallbackLog);

            return [
                'sent' => true,
                'fallback_logged' => true,
                'debug_verification_url' => $verificationUrl,
                'error_reason' => $reason,
                'delivery_driver' => $driver,
            ];
        }

        return [
            'sent' => false,
            'fallback_logged' => false,
            'debug_verification_url' => null,
            'error_reason' => $reason,
            'delivery_driver' => $driver,
        ];
    }
}
