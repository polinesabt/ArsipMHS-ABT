<?php
/** Resolve a survey proof inside its allowed storage folder. Never expose paths in JSON. */
function resolveSatisfactionEvidence(?string $path, ?string $storagePath = null): ?array {
    $path = trim((string)$path);
    if (!preg_match('~^(satisfaction_import/[A-Za-z0-9_-]+|satisfaction_attachments/[A-Za-z0-9_-]+/[A-Za-z0-9_.-]+)\.(pdf|png|jpe?g)$~i', $path)
        || strpos($path, '..') !== false) {
        return null;
    }
    $base = realpath($storagePath ?? (__DIR__ . '/../../storage'));
    $full = $base === false ? false : realpath($base . DIRECTORY_SEPARATOR . $path);
    if ($base === false || $full === false || strpos($full, $base . DIRECTORY_SEPARATOR) !== 0
        || !is_file($full) || !is_readable($full)) {
        return null;
    }
    $signature = file_get_contents($full, false, null, 0, 8);
    if ($signature === false) return null;
    $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    $mime = null;
    if ($extension === 'pdf' && substr($signature, 0, 5) === '%PDF-') $mime = 'application/pdf';
    if (in_array($extension, ['jpg', 'jpeg'], true) && substr($signature, 0, 3) === "\xFF\xD8\xFF") $mime = 'image/jpeg';
    if ($extension === 'png' && $signature === "\x89PNG\r\n\x1A\n") $mime = 'image/png';
    if ($mime === null) return null;
    return ['full_path' => $full, 'mime' => $mime, 'file_name' => basename($path), 'format' => $mime === 'application/pdf' ? 'pdf' : 'image'];
}

function satisfactionEvidenceMetadata(?string $path): array {
    $evidence = resolveSatisfactionEvidence($path);
    return ['evidence_available' => $evidence !== null, 'evidence_format' => $evidence['format'] ?? null];
}

function customSatisfactionEvidencePath(array $answers): ?string {
    $values = array_merge([$answers['__attachment'] ?? null], array_values($answers));
    foreach ($values as $value) {
        if (is_string($value) && strpos(trim($value), 'satisfaction_attachments/') === 0) return trim($value);
    }
    return null;
}

function legacySatisfactionHasAttachmentColumn(PDO $pdo): bool {
    return (bool)$pdo->query("SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_responses'
          AND COLUMN_NAME = 'attachment_path'")->fetchColumn();
}
