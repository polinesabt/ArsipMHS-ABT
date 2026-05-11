<?php
/**
 * Update chart record (Edit Data).
 * POST body: {"section": "...", "record_id": "...", "tahun_pelaporan": 2024, "payload": {...}, "included_in_chart": true}
 * Untuk section achievement-based: juga bisa "category", "subcategory", "tanggal", "verified"
 * Auth: admin only
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../insight/sync_helpers.php';
require_once __DIR__ . '/../achievements/classification_helper.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$sectionToTable = [
    'study_period' => 'menu_study_period_records',
    'waiting_time' => 'menu_waiting_time_records',
    'job_relevance' => 'menu_job_relevance_records',
    'work_coverage' => 'menu_work_coverage_records',
    'user_satisfaction' => 'menu_user_satisfaction_records',
    'publications' => 'menu_publications_records',
    'seminar_kegiatan' => 'menu_publications_records',
    'active_students' => 'menu_active_students_records',
    'student_products' => 'menu_student_products_records',
    'research_outputs' => 'menu_research_outputs_records',
    'student_achievements' => 'menu_student_achievements_records',
];

$achievementSections = ['student_achievements', 'publications', 'seminar_kegiatan', 'student_products', 'research_outputs'];

function parseBoolean($value): ?int {
    if (is_bool($value)) return $value ? 1 : 0;
    if (is_int($value)) return $value === 1 ? 1 : ($value === 0 ? 0 : null);
    if (is_string($value)) {
        $normalized = strtolower(trim($value));
        if (in_array($normalized, ['1', 'true', 'yes', 'on'], true)) return 1;
        if (in_array($normalized, ['0', 'false', 'no', 'off'], true)) return 0;
    }
    return null;
}

try {
    $auth = requireAuth('admin');
    $adminId = $auth['sub'] ?? '';

    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $section = isset($input['section']) ? trim((string)$input['section']) : '';
    $recordId = isset($input['record_id']) ? trim((string)$input['record_id']) : '';

    if ($section === '' || $recordId === '') {
        throw new Exception('Parameter section dan record_id wajib diisi.');
    }

    if (!isset($sectionToTable[$section])) {
        throw new Exception('Section tidak valid.');
    }

    $table = $sectionToTable[$section];

    $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE id = ? AND (deleted_at IS NULL OR deleted_at = '')");
    $stmt->execute([$recordId]);
    $oldRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$oldRow) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Record tidak ditemukan.']);
        exit;
    }

    $updates = [];
    $params = [];
    $newPayload = json_decode($oldRow['payload'], true) ?: [];

    if (isset($input['tahun_pelaporan']) && is_numeric($input['tahun_pelaporan'])) {
        $tahun = (int)$input['tahun_pelaporan'];
        if ($tahun >= 1900 && $tahun <= 2100) {
            $updates[] = 'tahun_pelaporan = ?';
            $params[] = $tahun;
        }
    }

    if (isset($input['payload']) && is_array($input['payload'])) {
        $newPayload = array_merge($newPayload, $input['payload']);
    }

    if (array_key_exists('included_in_chart', $input)) {
        $included = parseBoolean($input['included_in_chart']);
        if ($included === null) {
            throw new Exception('Nilai included_in_chart tidak valid.');
        }
        $updates[] = 'included_in_chart = ?';
        $params[] = $included;
    }

    $updates[] = 'payload = ?';
    $params[] = json_encode($newPayload);
    $params[] = $recordId;

    $chartSync = null;
    $pdo->beginTransaction();
    try {
        $sql = "UPDATE {$table} SET " . implode(', ', $updates) . ", updated_at = NOW() WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $newRow = $oldRow;
        $newRow['payload'] = $newPayload;
        if (!empty($input['tahun_pelaporan'])) {
            $newRow['tahun_pelaporan'] = (int)$input['tahun_pelaporan'];
        }
        if (array_key_exists('included_in_chart', $input)) {
            $newRow['included_in_chart'] = parseBoolean($input['included_in_chart']) ?? ($oldRow['included_in_chart'] ?? 1);
        }

        if (in_array($section, $achievementSections, true) && ($oldRow['source_table'] ?? '') === 'achievements') {
            $achId = $oldRow['source_id'] ?? '';
            $achUpdates = [];
            $achParams = [];
            $categoryUpdated = false;
            $subcategoryUpdated = false;
            $nextCategory = '';
            $nextSubcategory = '';

            $achCurrentStmt = $pdo->prepare('SELECT category, subcategory FROM achievements WHERE id = ? LIMIT 1');
            $achCurrentStmt->execute([$achId]);
            $achCurrent = $achCurrentStmt->fetch(PDO::FETCH_ASSOC);
            if ($achCurrent) {
                $nextCategory = trim((string)($achCurrent['category'] ?? ''));
                $nextSubcategory = trim((string)($achCurrent['subcategory'] ?? ''));
            }

            if (isset($input['category']) && trim((string)$input['category']) !== '') {
                $achUpdates[] = 'category = ?';
                $nextCategory = trim((string)$input['category']);
                $achParams[] = $nextCategory;
                $categoryUpdated = true;
            }
            if (isset($input['subcategory']) && trim((string)$input['subcategory']) !== '') {
                $achUpdates[] = 'subcategory = ?';
                $nextSubcategory = trim((string)$input['subcategory']);
                $achParams[] = $nextSubcategory;
                $subcategoryUpdated = true;
            }
            if (isset($input['tanggal']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$input['tanggal'])) {
                $achUpdates[] = 'tanggal = ?';
                $achParams[] = $input['tanggal'];
            }
            if (isset($input['verified'])) {
                $achUpdates[] = 'verified = ?';
                $achParams[] = (bool)$input['verified'] ? 1 : 0;
            }

            $achUpdates[] = 'achievement_type = ?';
            $achParams[] = deriveAchievementTypeFromCategory($nextCategory, $nextSubcategory);

            if (!empty($achUpdates)) {
                $achParams[] = $achId;
                $achSql = "UPDATE achievements SET " . implode(', ', $achUpdates) . ", updated_at = NOW() WHERE id = ?";
                $achStmt = $pdo->prepare($achSql);
                $achStmt->execute($achParams);

                if ($categoryUpdated || $subcategoryUpdated) {
                    $chartSync = syncAchievementDerivedRecords($pdo, $achId);
                }
            }
        }

        $logId = bin2hex(random_bytes(18));
        $insLog = $pdo->prepare("INSERT INTO record_change_logs (id, menu_section, record_id, action, admin_id, changed_at, old_data, new_data) VALUES (?, ?, ?, 'updated', ?, NOW(), ?, ?)");
        $insLog->execute([
            $logId,
            $section,
            $recordId,
            $adminId,
            json_encode($oldRow),
            json_encode($newRow),
        ]);

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Data berhasil diperbarui.',
        'chart_sync' => $chartSync,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
