<?php
/**
 * Helper untuk mengirim email link survey evaluasi lulusan.
 * Menggunakan konfigurasi dan driver yang sama dengan email_login (SMTP/mail).
 */

require_once __DIR__ . '/email_login.php';

if (!function_exists('evaluation_send_survey_email')) {
    /**
     * Kirim email berisi link survey evaluasi ke mahasiswa.
     *
     * @param string $toEmail Alamat email tujuan
     * @param string $studentName Nama mahasiswa (untuk salam)
     * @param string $evaluationTitle Judul evaluasi
     * @param string $surveyUrl URL penuh ke form evaluasi (domain + /evaluasi?token=...)
     * @return array{ sent: bool, error_reason: ?string, error_detail: ?string }
     */
    function evaluation_send_survey_email(
        string $toEmail,
        string $studentName,
        string $evaluationTitle,
        string $surveyUrl
    ): array {
        $subject = 'Evaluasi Lulusan: ' . trim($evaluationTitle);
        if ($subject === 'Evaluasi Lulusan:') {
            $subject = 'Evaluasi Lulusan — Mohon Isi Survey';
        }

        $nama = trim($studentName) !== '' ? trim($studentName) : 'Mahasiswa';
        $lines = [
            'Halo ' . $nama . ',',
            '',
            'Anda diundang untuk mengisi survey evaluasi lulusan.',
            '',
            'Judul: ' . trim($evaluationTitle),
            '',
            'Link survey (unik untuk Anda, tidak perlu login):',
            $surveyUrl,
            '',
            'Silakan buka link di atas dan isi form sebelum periode evaluasi berakhir.',
            '',
            'Terima kasih.',
        ];
        $body = implode("\n", $lines);

        $fromEmail = trim(email_login_env('EMAIL_FROM', 'no-reply@arsipmhs.local'));
        $fromName = trim(email_login_env('EMAIL_FROM_NAME', 'Arsip Mahasiswa ABT'));
        $driver = email_login_driver();

        if ($driver === 'mail') {
            $result = email_login_send_via_mail($toEmail, $subject, $body, $fromEmail);
        } else {
            $result = email_login_send_via_smtp($toEmail, $subject, $body, $fromEmail, $fromName);
        }

        return [
            'sent' => (bool)($result['sent'] ?? false),
            'error_reason' => $result['error_reason'] ?? null,
            'error_detail' => $result['error_detail'] ?? null,
        ];
    }
}
