<?php
/**
 * Daftar lampiran form kepuasan (form bertanda tangan) - untuk admin.
 * GET ?evaluation_id= optional
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    requireAuth('admin');

    $evaluationId = isset($_GET['evaluation_id']) ? trim((string)$_GET['evaluation_id']) : null;

    $items = [];

    $hasAttachmentCol = false;
    try {
        $checkCol = $pdo->query("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'evaluation_responses' AND COLUMN_NAME = 'attachment_path'");
        $hasAttachmentCol = $checkCol && $checkCol->fetch();
    } catch (Throwable $e) {
    }

    if ($hasAttachmentCol) {
        $legacySql = '
            SELECT
                r.id AS response_id,
                r.evaluation_id,
                e.title AS evaluation_title,
                r.student_id,
                s.nim,
                s.nama,
                r.submitted_at,
                r.attachment_path,
                NULL AS file_name
            FROM evaluation_responses r
            JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
            WHERE r.attachment_path IS NOT NULL AND r.attachment_path != ""
        ';
        $legacyParams = [];
        if ($evaluationId !== null && $evaluationId !== '') {
            $legacySql .= ' AND r.evaluation_id = ?';
            $legacyParams[] = $evaluationId;
        }
        $legacySql .= ' ORDER BY r.submitted_at DESC';
        $legacyStmt = $pdo->prepare($legacySql);
        $legacyStmt->execute($legacyParams);
        while ($row = $legacyStmt->fetch(PDO::FETCH_ASSOC)) {
            $items[] = [
                'response_id' => $row['response_id'],
                'type' => 'legacy',
                'evaluation_id' => $row['evaluation_id'],
                'evaluation_title' => $row['evaluation_title'],
                'student_id' => $row['student_id'],
                'nim' => $row['nim'],
                'nama' => $row['nama'],
                'submitted_at' => $row['submitted_at'],
                'attachment_path' => $row['attachment_path'],
                'file_name' => $row['file_name'] ?? basename($row['attachment_path']),
            ];
        }
    }

    $customSql = '
        SELECT
            sfr.id AS response_id,
            sfr.invitation_id,
            sfr.template_id,
            sfr.answers,
            sfr.submitted_at,
            i.evaluation_id,
            e.title AS evaluation_title,
            st.id AS student_id,
            st.nim,
            st.nama
        FROM satisfaction_form_responses sfr
        JOIN evaluation_invitations i ON i.id = sfr.invitation_id
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        JOIN students st ON st.id = i.student_id AND st.deleted_at IS NULL
        WHERE 1=1
    ';
    $customParams = [];
    if ($evaluationId !== null && $evaluationId !== '') {
        $customSql .= ' AND i.evaluation_id = ?';
        $customParams[] = $evaluationId;
    }
    $customSql .= ' ORDER BY sfr.submitted_at DESC';
    $customStmt = $pdo->prepare($customSql);
    $customStmt->execute($customParams);
    while ($row = $customStmt->fetch(PDO::FETCH_ASSOC)) {
        $answers = json_decode($row['answers'], true);
        if (!is_array($answers)) {
            continue;
        }
        foreach ($answers as $sectionId => $value) {
            if (!is_string($value) || trim($value) === '') {
                continue;
            }
            $path = trim($value);
            if (strpos($path, 'satisfaction_attachments/') !== 0) {
                continue;
            }
            $items[] = [
                'response_id' => $row['response_id'],
                'type' => 'custom',
                'evaluation_id' => $row['evaluation_id'],
                'evaluation_title' => $row['evaluation_title'],
                'student_id' => $row['student_id'],
                'nim' => $row['nim'],
                'nama' => $row['nama'],
                'submitted_at' => $row['submitted_at'],
                'attachment_path' => $path,
                'file_name' => basename($path),
            ];
        }
    }

    usort($items, function ($a, $b) {
        return strcmp($b['submitted_at'], $a['submitted_at']);
    });

    echo json_encode([
        'success' => true,
        'data' => $items,
        'count' => count($items),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
