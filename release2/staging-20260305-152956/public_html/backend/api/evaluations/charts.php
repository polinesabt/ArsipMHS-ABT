<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

/**
 * Extract aspect scores from custom form answers using template definition.
 * Only scale sections with questionSource === 'evaluation_aspects' are used.
 * Returns array of [aspect_id => score] for one response.
 */
function extractAspectScoresFromCustomAnswers(array $answers, array $definition, array $activeAspectIds): array {
    $result = [];
    $sections = isset($definition['sections']) && is_array($definition['sections']) ? $definition['sections'] : [];
    foreach ($sections as $sec) {
        if (!is_array($sec)) {
            continue;
        }
        $secType = strtolower(trim((string)($sec['type'] ?? 'open')));
        if ($secType !== 'scale') {
            continue;
        }
        $source = strtolower(trim((string)($sec['questionSource'] ?? 'template')));
        if ($source !== 'evaluation_aspects') {
            continue;
        }
        $secId = trim((string)($sec['id'] ?? ''));
        if ($secId === '' || !array_key_exists($secId, $answers)) {
            continue;
        }
        $value = $answers[$secId];
        if (!is_array($value)) {
            continue;
        }
        foreach ($activeAspectIds as $aspectId) {
            $aid = (string)$aspectId;
            if (array_key_exists($aid, $value)) {
                $score = (int)$value[$aid];
                if ($score >= 1 && $score <= 5) {
                    $result[$aid] = $score;
                }
            }
        }
    }
    return $result;
}

/**
 * Extract single ya/tidak from custom answers (e.g. kesesuaian jurusan).
 * Returns 'ya', 'tidak', or null.
 */
function extractJobMatchFromCustomAnswers(array $answers): ?string {
    if (array_key_exists('major_job_match', $answers)) {
        $v = $answers['major_job_match'];
        if (is_string($v)) {
            $v = strtolower(trim($v));
            if ($v === 'ya' || $v === 'tidak') {
                return $v;
            }
        }
    }
    foreach ($answers as $v) {
        if (is_string($v)) {
            $v = strtolower(trim($v));
            if ($v === 'ya' || $v === 'tidak') {
                return $v;
            }
        }
    }
    return null;
}

try {
    requireAuth('admin');

    $evaluationId = isset($_GET['evaluation_id']) ? trim((string)$_GET['evaluation_id']) : 'all';
    $isAll = ($evaluationId === '' || strtolower($evaluationId) === 'all');

    $evaluationInfo = null;
    if (!$isAll) {
        $evalStmt = $pdo->prepare('SELECT id, title, status, start_at, end_at FROM evaluations WHERE id = ? AND deleted_at IS NULL LIMIT 1');
        $evalStmt->execute([$evaluationId]);
        $evaluationInfo = $evalStmt->fetch(PDO::FETCH_ASSOC);
        if (!$evaluationInfo) {
            throw new Exception('Evaluasi tidak ditemukan');
        }
    }

    $aspectQuery = '
        SELECT
            a.id,
            a.code,
            a.name,
            a.sort_order,
            SUM(CASE WHEN t.score = 5 THEN 1 ELSE 0 END) AS sangat_baik,
            SUM(CASE WHEN t.score = 4 THEN 1 ELSE 0 END) AS baik,
            SUM(CASE WHEN t.score = 3 THEN 1 ELSE 0 END) AS cukup_baik,
            SUM(CASE WHEN t.score = 2 THEN 1 ELSE 0 END) AS kurang_baik,
            SUM(CASE WHEN t.score = 1 THEN 1 ELSE 0 END) AS tidak_baik,
            COUNT(t.score) AS total
        FROM evaluation_aspects a
        LEFT JOIN (
            SELECT rr.aspect_id, rr.score
            FROM evaluation_response_ratings rr
            JOIN evaluation_responses r ON r.id = rr.response_id
            JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
            JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
    ';

    $aspectParams = [];
    if (!$isAll) {
        $aspectQuery .= ' WHERE r.evaluation_id = ? ';
        $aspectParams[] = $evaluationId;
    }

    $aspectQuery .= '
        ) t ON t.aspect_id = a.id
        WHERE a.is_active = 1
        GROUP BY a.id, a.code, a.name, a.sort_order
        ORDER BY a.sort_order ASC
    ';

    $aspectStmt = $pdo->prepare($aspectQuery);
    $aspectStmt->execute($aspectParams);
    $aspectRows = $aspectStmt->fetchAll(PDO::FETCH_ASSOC);

    $activeAspectIds = array_column($aspectRows, 'id');

    $customAspectCounts = [];
    foreach ($activeAspectIds as $id) {
        $customAspectCounts[(string)$id] = [
            'sangat_baik' => 0,
            'baik' => 0,
            'cukup_baik' => 0,
            'kurang_baik' => 0,
            'tidak_baik' => 0,
            'total' => 0,
        ];
    }

    $customJobMatchYa = 0;
    $customJobMatchTidak = 0;

    $customSql = '
        SELECT sfr.answers, sfr.template_id, t.definition
        FROM satisfaction_form_responses sfr
        JOIN evaluation_invitations i ON i.id = sfr.invitation_id
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        JOIN satisfaction_form_templates t ON t.id = sfr.template_id AND t.deleted_at IS NULL
    ';
    $customParams = [];
    if (!$isAll) {
        $customSql .= ' WHERE i.evaluation_id = ?';
        $customParams[] = $evaluationId;
    }
    $customStmt = $pdo->prepare($customSql);
    $customStmt->execute($customParams);
    while ($row = $customStmt->fetch(PDO::FETCH_ASSOC)) {
        $answers = json_decode($row['answers'] ?? '{}', true);
        if (!is_array($answers)) {
            continue;
        }
        $definition = isset($row['definition']) && is_string($row['definition'])
            ? json_decode($row['definition'], true)
            : [];
        if (!is_array($definition)) {
            $definition = [];
        }
        $scores = extractAspectScoresFromCustomAnswers($answers, $definition, $activeAspectIds);
        foreach ($scores as $aspectId => $score) {
            $key = (string)$aspectId;
            if (!isset($customAspectCounts[$key])) {
                continue;
            }
            $customAspectCounts[$key]['total']++;
            switch ($score) {
                case 5: $customAspectCounts[$key]['sangat_baik']++; break;
                case 4: $customAspectCounts[$key]['baik']++; break;
                case 3: $customAspectCounts[$key]['cukup_baik']++; break;
                case 2: $customAspectCounts[$key]['kurang_baik']++; break;
                case 1: $customAspectCounts[$key]['tidak_baik']++; break;
            }
        }
        $jobVal = extractJobMatchFromCustomAnswers($answers);
        if ($jobVal === 'ya') {
            $customJobMatchYa++;
        } elseif ($jobVal === 'tidak') {
            $customJobMatchTidak++;
        }
    }

    $matchQuery = '
        SELECT r.major_job_match, COUNT(*) AS total
        FROM evaluation_responses r
        JOIN evaluations e ON e.id = r.evaluation_id AND e.deleted_at IS NULL
        JOIN students s ON s.id = r.student_id AND s.deleted_at IS NULL
    ';
    $matchParams = [];

    if (!$isAll) {
        $matchQuery .= ' WHERE r.evaluation_id = ?';
        $matchParams[] = $evaluationId;
    }

    $matchQuery .= ' GROUP BY r.major_job_match';

    $matchStmt = $pdo->prepare($matchQuery);
    $matchStmt->execute($matchParams);
    $matchRows = $matchStmt->fetchAll(PDO::FETCH_ASSOC);

    $jobMatch = ['ya' => 0, 'tidak' => 0];
    foreach ($matchRows as $row) {
        $key = $row['major_job_match'] === 'ya' ? 'ya' : 'tidak';
        $jobMatch[$key] = (int)$row['total'];
    }
    $jobMatch['ya'] += $customJobMatchYa;
    $jobMatch['tidak'] += $customJobMatchTidak;

    $progressQuery = '
        SELECT
            COUNT(*) AS total_targets,
            SUM(CASE WHEN i.first_sent_at IS NOT NULL THEN 1 ELSE 0 END) AS total_sent,
            SUM(CASE WHEN i.submitted_at IS NOT NULL THEN 1 ELSE 0 END) AS total_submitted
        FROM evaluation_invitations i
        JOIN evaluations e ON e.id = i.evaluation_id AND e.deleted_at IS NULL
        JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
    ';
    $progressParams = [];

    if (!$isAll) {
        $progressQuery .= ' WHERE i.evaluation_id = ?';
        $progressParams[] = $evaluationId;
    }

    $progressStmt = $pdo->prepare($progressQuery);
    $progressStmt->execute($progressParams);
    $progressRow = $progressStmt->fetch(PDO::FETCH_ASSOC) ?: [];

    $targets = (int)($progressRow['total_targets'] ?? 0);
    $sent = (int)($progressRow['total_sent'] ?? 0);
    $submitted = (int)($progressRow['total_submitted'] ?? 0);

    $aspectDistribution = [];
    foreach ($aspectRows as $row) {
        $aid = (string)$row['id'];
        $custom = $customAspectCounts[$aid] ?? [
            'sangat_baik' => 0, 'baik' => 0, 'cukup_baik' => 0, 'kurang_baik' => 0, 'tidak_baik' => 0, 'total' => 0,
        ];
        $aspectDistribution[] = [
            'aspect_id' => $row['id'],
            'aspect_code' => $row['code'],
            'aspect_name' => $row['name'],
            'sort_order' => (int)$row['sort_order'],
            'sangat_baik' => (int)$row['sangat_baik'] + (int)$custom['sangat_baik'],
            'baik' => (int)$row['baik'] + (int)$custom['baik'],
            'cukup_baik' => (int)$row['cukup_baik'] + (int)$custom['cukup_baik'],
            'kurang_baik' => (int)$row['kurang_baik'] + (int)$custom['kurang_baik'],
            'tidak_baik' => (int)$row['tidak_baik'] + (int)$custom['tidak_baik'],
            'total' => (int)$row['total'] + (int)$custom['total'],
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'scope' => $isAll ? 'all' : 'single',
            'evaluation' => $evaluationInfo,
            'progress' => [
                'total_targets' => $targets,
                'total_sent' => $sent,
                'total_submitted' => $submitted,
                'response_rate' => $targets > 0 ? round(($submitted / $targets) * 100, 2) : 0,
            ],
            'job_match' => [
                ['label' => 'Ya', 'key' => 'ya', 'value' => $jobMatch['ya']],
                ['label' => 'Tidak', 'key' => 'tidak', 'value' => $jobMatch['tidak']],
            ],
            'aspect_distribution' => $aspectDistribution,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
