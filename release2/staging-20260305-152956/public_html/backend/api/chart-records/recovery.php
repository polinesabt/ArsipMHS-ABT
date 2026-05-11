<?php
/**
 * Recover soft-deleted chart record (set deleted_at = NULL).
 * POST body: {"section": "...", "record_id": "..."}
 * Auth: admin only
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

    $stmt = $pdo->prepare("SELECT * FROM {$table} WHERE id = ? AND deleted_at IS NOT NULL");
    $stmt->execute([$recordId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Record tidak ditemukan atau tidak dalam Recycle Bin.']);
        exit;
    }

    $oldData = $row;
    $newData = $oldData;
    $newData['deleted_at'] = null;

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare("UPDATE {$table} SET deleted_at = NULL, updated_at = NOW() WHERE id = ?");
        $update->execute([$recordId]);

        $logId = bin2hex(random_bytes(18));
        $insLog = $pdo->prepare("INSERT INTO record_change_logs (id, menu_section, record_id, action, admin_id, changed_at, old_data, new_data) VALUES (?, ?, ?, 'recovered', ?, NOW(), ?, ?)");
        $insLog->execute([
            $logId,
            $section,
            $recordId,
            $adminId,
            json_encode($oldData),
            json_encode($newData),
        ]);

        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Data berhasil dipulihkan.',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
