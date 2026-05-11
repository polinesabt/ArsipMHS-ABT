<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../satisfaction-forms/template_resolver.php';

/**
 * Submit custom satisfaction form (when active template is set).
 * Payload: { token, answers: { sectionId: value | value[] } }
 * Updates invitation.submitted_at and inserts into satisfaction_form_responses.
 */
function isEmptyRequiredValue($value): bool
{
    if ($value === null) {
        return true;
    }
    if (is_string($value)) {
        return trim($value) === '';
    }
    if (is_array($value)) {
        return count($value) === 0;
    }
    return false;
}

function normalizeScaleBounds(array $section): array
{
    $rawMin = isset($section['scaleMin']) ? (int)$section['scaleMin'] : 1;
    $rawMax = isset($section['scaleMax']) ? (int)$section['scaleMax'] : 5;
    $min = min($rawMin, $rawMax);
    $max = max($rawMin, $rawMax);
    return [$min, $max];
}

function resolveScaleQuestionIds(PDO $pdo, array $section, ?array &$activeAspectIdsCache): array
{
    $source = strtolower(trim((string)($section['questionSource'] ?? 'template')));
    if ($source === 'evaluation_aspects') {
        if ($activeAspectIdsCache === null) {
            $aspectStmt = $pdo->query('SELECT id FROM evaluation_aspects WHERE is_active = 1 ORDER BY sort_order ASC');
            $activeAspectIdsCache = $aspectStmt ? $aspectStmt->fetchAll(PDO::FETCH_COLUMN) : [];
        }
        $ids = [];
        foreach ($activeAspectIdsCache as $aspectId) {
            $id = trim((string)$aspectId);
            if ($id !== '') {
                $ids[] = $id;
            }
        }
        return $ids;
    }

    $questions = $section['questions'] ?? [];
    if (!is_array($questions)) {
        return [];
    }

    $ids = [];
    foreach ($questions as $question) {
        if (!is_array($question)) {
            continue;
        }
        $id = trim((string)($question['id'] ?? ''));
        if ($id !== '') {
            $ids[] = $id;
        }
    }
    return $ids;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        throw new Exception('Payload tidak valid');
    }

    $token = trim((string)($input['token'] ?? ''));
    $answers = $input['answers'] ?? [];
    $attachmentPath = isset($input['attachment_path']) ? trim((string)$input['attachment_path']) : null;
    if ($attachmentPath !== null && $attachmentPath === '') {
        $attachmentPath = null;
    }

    if ($token === '') {
        throw new Exception('Token survey diperlukan');
    }
    if (!is_array($answers)) {
        throw new Exception('Format jawaban tidak valid');
    }

    $pdo->beginTransaction();

    $invitationStmt = $pdo->prepare('
        SELECT i.*, e.status AS evaluation_status, e.start_at, e.end_at
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        WHERE i.access_token = ?
        FOR UPDATE
    ');
    $invitationStmt->execute([$token]);
    $invitation = $invitationStmt->fetch(PDO::FETCH_ASSOC);

    if (!$invitation) {
        try {
            $blacklistStmt = $pdo->prepare('SELECT 1 FROM evaluation_token_blacklist WHERE token = ? LIMIT 1');
            $blacklistStmt->execute([$token]);
            if ($blacklistStmt->fetchColumn() !== false) {
                $pdo->rollBack();
                http_response_code(410);
                echo json_encode([
                    'success' => false,
                    'error' => 'Link sudah tidak berlaku. Link terbaru telah dikirim ke dashboard dan email Anda.',
                ]);
                return;
            }
        } catch (Throwable $e) {
        }
        throw new Exception('Link survey tidak valid');
    }

    if (($invitation['evaluation_status'] ?? '') !== 'active') {
        throw new Exception('Evaluasi sudah ditutup dan tidak menerima pengisian baru');
    }

    $now = date('Y-m-d H:i:s');
    $startAt = $invitation['start_at'] ?? '';
    $endAt = $invitation['end_at'] ?? null;
    if ($startAt !== '' && $now < $startAt) {
        throw new Exception('Periode evaluasi belum dimulai');
    }
    if ($endAt !== null && trim($endAt) !== '' && $now > $endAt) {
        throw new Exception('Periode evaluasi telah berakhir');
    }

    if (!empty($invitation['submitted_at'])) {
        throw new Exception('Survey pada evaluasi ini sudah pernah dikirim dan terkunci');
    }

    $resolvedTemplate = resolveCurrentSatisfactionTemplate($pdo);
    $template = $resolvedTemplate['template'];
    $definition = is_array($template['definition'] ?? null) ? $template['definition'] : [];
    $sections = is_array($definition['sections'] ?? null) ? $definition['sections'] : [];
    $activeAspectIdsCache = null;
    foreach ($sections as $sec) {
        if (!is_array($sec)) {
            continue;
        }

        $secId = trim((string)($sec['id'] ?? ''));
        if ($secId === '') {
            continue;
        }

        $secTitle = trim((string)($sec['title'] ?? $secId));
        $secType = strtolower(trim((string)($sec['type'] ?? 'open')));
        $required = !empty($sec['required']);
        $hasValue = array_key_exists($secId, $answers);
        $value = $hasValue ? $answers[$secId] : null;

        if ($required && !$hasValue) {
            throw new Exception('Pertanyaan wajib belum diisi: ' . $secTitle);
        }
        if (!$hasValue) {
            continue;
        }

        if ($secType !== 'scale') {
            if ($secType === 'file_upload') {
                if ($required && (empty($value) || !is_string($value) || trim($value) === '')) {
                    throw new Exception('Lampiran wajib diunggah: ' . $secTitle);
                }
                if (is_string($value) && trim($value) !== '') {
                    $path = trim($value);
                    $prefix = 'satisfaction_attachments/' . $invitation['id'] . '/';
                    if (strpos($path, $prefix) !== 0) {
                        throw new Exception('Lampiran tidak valid: ' . $secTitle);
                    }
                    $basePath = __DIR__ . '/../../storage/' . $path;
                    if (!is_file($basePath)) {
                        throw new Exception('File lampiran tidak ditemukan. Silakan unggah ulang.');
                    }
                }
            } elseif ($required && isEmptyRequiredValue($value)) {
                throw new Exception('Pertanyaan wajib belum diisi: ' . $secTitle);
            }
            continue;
        }

        if (!is_array($value)) {
            throw new Exception('Format jawaban skala tidak valid: ' . $secTitle);
        }

        [$scaleMin, $scaleMax] = normalizeScaleBounds($sec);
        $questionIds = resolveScaleQuestionIds($pdo, $sec, $activeAspectIdsCache);
        if ($required && count($questionIds) === 0) {
            throw new Exception('Pertanyaan skala belum tersedia: ' . $secTitle);
        }

        foreach ($questionIds as $questionId) {
            $answerRaw = $value[$questionId] ?? null;
            if ($answerRaw === null || trim((string)$answerRaw) === '') {
                if ($required) {
                    throw new Exception('Pertanyaan wajib belum diisi: ' . $secTitle);
                }
                continue;
            }
            $score = (int)$answerRaw;
            if ($score < $scaleMin || $score > $scaleMax) {
                throw new Exception('Nilai skala tidak valid pada: ' . $secTitle);
            }
        }

        foreach ($value as $answerRaw) {
            if (is_array($answerRaw) || is_object($answerRaw)) {
                throw new Exception('Format jawaban skala tidak valid: ' . $secTitle);
            }
            if (trim((string)$answerRaw) === '') {
                if ($required) {
                    throw new Exception('Pertanyaan wajib belum diisi: ' . $secTitle);
                }
                continue;
            }
            $score = (int)$answerRaw;
            if ($score < $scaleMin || $score > $scaleMax) {
                throw new Exception('Nilai skala tidak valid pada: ' . $secTitle);
            }
        }
    }

    if ($attachmentPath !== null) {
        $prefix = 'satisfaction_attachments/' . $invitation['id'] . '/';
        if (strpos($attachmentPath, $prefix) !== 0) {
            throw new Exception('Lampiran tidak valid.');
        }
        $basePath = __DIR__ . '/../../storage/' . $attachmentPath;
        if (!is_file($basePath)) {
            throw new Exception('File lampiran tidak ditemukan. Silakan unggah ulang.');
        }
        $answers['__attachment'] = $attachmentPath;
    }

    $responseId = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
    $insertStmt = $pdo->prepare('
        INSERT INTO satisfaction_form_responses (id, invitation_id, template_id, answers, submitted_at)
        VALUES (?, ?, ?, ?, NOW())
    ');
    $insertStmt->execute([
        $responseId,
        $invitation['id'],
        $template['id'],
        json_encode($answers),
    ]);

    $updateStmt = $pdo->prepare('UPDATE evaluation_invitations SET submitted_at = NOW(), updated_at = NOW() WHERE id = ?');
    $updateStmt->execute([$invitation['id']]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'data' => [
            'response_id' => $responseId,
            'submitted_at' => $now,
        ],
        'message' => 'Survey berhasil dikirim',
    ]);
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
