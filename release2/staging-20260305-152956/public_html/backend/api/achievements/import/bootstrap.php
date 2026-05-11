<?php

function prestasi_import_require_spreadsheet(): void {
    $autoload = __DIR__ . '/../../../vendor/autoload.php';
    if (!file_exists($autoload)) {
        throw new Exception('PhpSpreadsheet belum terpasang. Jalankan "composer install" di folder backend.');
    }
    require_once $autoload;
}

function prestasi_import_insert_log_detail(PDO $pdo, string $logId, int $rowNumber, ?string $nimRaw, string $status, ?string $message = null, ?array $payload = null): void {
    $stmt = $pdo->prepare('INSERT INTO prestasi_import_log_details (id, import_log_id, `row_number`, nim_raw, status, message, raw_payload_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([
        bin2hex(random_bytes(18)),
        $logId,
        $rowNumber,
        $nimRaw,
        $status,
        $message,
        $payload ? json_encode($payload) : null,
    ]);
}
