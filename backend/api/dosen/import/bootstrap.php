<?php
declare(strict_types=1);

function dosen_import_require_spreadsheet(): void
{
    $autoload = __DIR__ . '/../../../vendor/autoload.php';
    if (!file_exists($autoload)) throw new RuntimeException('PhpSpreadsheet belum terpasang di backend.');
    require_once $autoload;
}

function dosen_import_split_list(string $value): array
{
    $value = trim(str_replace(["\r\n", "\r"], "\n", $value));
    if ($value === '') return [];
    $parts = preg_split('/\s*;\s*|(?:^|\n)\s*\d+[.)]\s*/u', $value, -1, PREG_SPLIT_NO_EMPTY);
    return array_values(array_unique(array_filter(array_map('trim', $parts ?: []))));
}

function dosen_import_cell_text(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, int $column, int $row): string
{
    $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($column);
    $cell = $sheet->getCell("{$colLetter}{$row}");
    $value = $cell->getFormattedValue();
    return trim((string)$value);
}

function dosen_import_log_detail(PDO $pdo, string $logId, int $row, ?string $identity, string $status, string $message, array $payload): void
{
    $stmt = $pdo->prepare('INSERT INTO dosen_import_log_details (import_log_id,row_number,identity_raw,status,message,raw_payload_json) VALUES (?,?,?,?,?,?)');
    $stmt->execute([$logId,$row,$identity,$status,$message,json_encode($payload,JSON_UNESCAPED_UNICODE)]);
}
