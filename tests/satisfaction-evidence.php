<?php
/** CLI filesystem checks with synthetic evidence; no app environment or database. */
require_once __DIR__ . '/../backend/api/evaluations/satisfaction_evidence.php';
function evidenceCheck(bool $condition, string $message): void {
    if (!$condition) throw new RuntimeException($message);
}
$root = sys_get_temp_dir() . '/satisfaction_evidence_' . bin2hex(random_bytes(8));
mkdir($root . '/satisfaction_import/source', 0777, true);
mkdir($root . '/satisfaction_attachments/invitation-test', 0777, true);
$fixtures = [
    'satisfaction_import/proof.pdf' => "%PDF-1.4\nsynthetic evidence",
    'satisfaction_import/photo.jpg' => "\xFF\xD8\xFFsynthetic JPEG",
    'satisfaction_attachments/invitation-test/proof.png' => "\x89PNG\r\n\x1A\nsynthetic PNG",
    'satisfaction_import/invalid.pdf' => '<html>not a PDF</html>',
    'satisfaction_import/source/private.pdf' => "%PDF-1.4\nprivate source",
];
try {
    foreach ($fixtures as $path => $content) file_put_contents($root . '/' . $path, $content);
    evidenceCheck(resolveSatisfactionEvidence('satisfaction_import/proof.pdf', $root)['mime'] === 'application/pdf', 'Resolve an original imported PDF.');
    evidenceCheck(resolveSatisfactionEvidence('satisfaction_import/photo.jpg', $root)['format'] === 'image', 'Imported JPEG must be offered for PDF conversion.');
    evidenceCheck(resolveSatisfactionEvidence('satisfaction_attachments/invitation-test/proof.png', $root)['mime'] === 'image/png', 'Resolve uploaded form PNG.');
    foreach ([null, '', 'satisfaction_import/missing.pdf', 'satisfaction_import/invalid.pdf',
        'satisfaction_import/source/private.pdf', 'satisfaction_import/../source/private.pdf',
        'satisfaction_import/..\\source\\private.pdf', '../proof.pdf', '/satisfaction_import/proof.pdf'] as $path) {
        evidenceCheck(resolveSatisfactionEvidence($path, $root) === null, 'Reject missing, spoofed, private source or traversal path.');
    }
    $answers = ['upload' => 'satisfaction_attachments/invitation-test/other.pdf', '__attachment' => 'satisfaction_attachments/invitation-test/proof.png'];
    evidenceCheck(customSatisfactionEvidencePath($answers) === $answers['__attachment'], 'Prefer the signed form over other custom attachments.');
    evidenceCheck(customSatisfactionEvidencePath(['upload' => $answers['upload']]) === $answers['upload'], 'Support custom form file-upload sections.');
    evidenceCheck(customSatisfactionEvidencePath(['ratings' => ['a1' => 5]]) === null, 'No attachment is a supported state.');
    evidenceCheck(satisfactionEvidenceMetadata(null) === ['evidence_available' => false, 'evidence_format' => null], 'Missing evidence must disable downloads without exposing a storage path.');
    echo "PASS: PDF/image proof resolution, private source exclusion, path validation, file signatures and missing proof metadata\n";
} finally {
    foreach (array_keys($fixtures) as $path) if (is_file($root . '/' . $path)) unlink($root . '/' . $path);
    rmdir($root . '/satisfaction_import/source'); rmdir($root . '/satisfaction_import');
    rmdir($root . '/satisfaction_attachments/invitation-test'); rmdir($root . '/satisfaction_attachments'); rmdir($root);
}
