<?php

/**
 * Shared helper untuk recycle bin akun mahasiswa.
 */

function student_recycle_chart_tables(): array {
    return [
        'study_period' => 'menu_study_period_records',
        'waiting_time' => 'menu_waiting_time_records',
        'job_relevance' => 'menu_job_relevance_records',
        'work_coverage' => 'menu_work_coverage_records',
        'user_satisfaction' => 'menu_user_satisfaction_records',
        'publications' => 'menu_publications_records',
        'active_students' => 'menu_active_students_records',
        'student_products' => 'menu_student_products_records',
        'research_outputs' => 'menu_research_outputs_records',
        'student_achievements' => 'menu_student_achievements_records',
    ];
}

function student_recycle_log_action(
    PDO $pdo,
    string $action,
    string $adminId,
    string $studentId,
    array $oldData,
    ?array $newData
): void {
    $actor = trim($adminId) !== '' ? trim($adminId) : 'system';
    $logId = bin2hex(random_bytes(18));
    $stmt = $pdo->prepare("
        INSERT INTO record_change_logs
            (id, menu_section, record_id, action, admin_id, changed_at, old_data, new_data)
        VALUES
            (?, 'student_accounts', ?, ?, ?, NOW(), ?, ?)
    ");
    $stmt->execute([
        $logId,
        $studentId,
        $action,
        $actor,
        json_encode($oldData),
        $newData !== null ? json_encode($newData) : null,
    ]);
}

function student_recycle_find(PDO $pdo, string $studentId): ?array {
    $stmt = $pdo->prepare("
        SELECT
            s.*,
            u.is_active AS user_is_active
        FROM students s
        LEFT JOIN users u ON u.id = s.user_id
        WHERE s.id = ?
        LIMIT 1
    ");
    $stmt->execute([$studentId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function student_recycle_soft_delete(PDO $pdo, string $studentId, string $adminId): array {
    $student = student_recycle_find($pdo, $studentId);
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }
    if (!empty($student['deleted_at'])) {
        throw new Exception('Mahasiswa sudah ada di Recycle Bin');
    }

    $oldData = $student;

    $stmt = $pdo->prepare('UPDATE students SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$adminId, $studentId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Mahasiswa gagal dipindahkan ke Recycle Bin');
    }

    if (!empty($student['user_id'])) {
        $disableUser = $pdo->prepare('UPDATE users SET is_active = 0 WHERE id = ?');
        $disableUser->execute([$student['user_id']]);
    }

    $newData = student_recycle_find($pdo, $studentId) ?: $oldData;
    student_recycle_log_action($pdo, 'deleted', $adminId, $studentId, $oldData, $newData);

    return $newData;
}

function student_recycle_restore(PDO $pdo, string $studentId, string $adminId): array {
    $student = student_recycle_find($pdo, $studentId);
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }
    if (empty($student['deleted_at'])) {
        throw new Exception('Mahasiswa tidak berada di Recycle Bin');
    }

    $oldData = $student;

    $stmt = $pdo->prepare('UPDATE students SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW() WHERE id = ? AND deleted_at IS NOT NULL');
    $stmt->execute([$studentId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Mahasiswa gagal dipulihkan');
    }

    if (!empty($student['user_id'])) {
        $enableUser = $pdo->prepare('UPDATE users SET is_active = 1 WHERE id = ?');
        $enableUser->execute([$student['user_id']]);
    }

    $newData = student_recycle_find($pdo, $studentId) ?: $oldData;
    student_recycle_log_action($pdo, 'recovered', $adminId, $studentId, $oldData, $newData);

    return $newData;
}

function student_recycle_permanent_delete(PDO $pdo, string $studentId, string $adminId): array {
    $student = student_recycle_find($pdo, $studentId);
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }
    if (empty($student['deleted_at'])) {
        throw new Exception('Mahasiswa harus berada di Recycle Bin sebelum dihapus permanen');
    }

    $oldData = $student;
    $nim = trim((string)($student['nim'] ?? ''));
    $chartDeletedBySection = [];
    $chartDeletedTotal = 0;

    if ($nim !== '') {
        foreach (student_recycle_chart_tables() as $section => $table) {
            $deleteChartStmt = $pdo->prepare("DELETE FROM {$table} WHERE snapshot_nim = ?");
            $deleteChartStmt->execute([$nim]);
            $deleted = (int)$deleteChartStmt->rowCount();
            $chartDeletedBySection[$section] = $deleted;
            $chartDeletedTotal += $deleted;
        }
    }

    // Hapus data evaluasi & notifikasi yang mengacu ke mahasiswa (urutan mengikuti FK)
    $selRespStmt = $pdo->prepare('SELECT id FROM evaluation_responses WHERE student_id = ?');
    $selRespStmt->execute([$studentId]);
    $responseIds = array_column($selRespStmt->fetchAll(PDO::FETCH_ASSOC), 'id');
    if (!empty($responseIds)) {
        $placeholders = implode(',', array_fill(0, count($responseIds), '?'));
        $delRatingsStmt = $pdo->prepare("DELETE FROM evaluation_response_ratings WHERE response_id IN ({$placeholders})");
        $delRatingsStmt->execute($responseIds);
    }

    $deleteResponsesStmt = $pdo->prepare('DELETE FROM evaluation_responses WHERE student_id = ?');
    $deleteResponsesStmt->execute([$studentId]);

    $deleteInvitationsStmt = $pdo->prepare('DELETE FROM evaluation_invitations WHERE student_id = ?');
    $deleteInvitationsStmt->execute([$studentId]);

    $deleteNotifStmt = $pdo->prepare('DELETE FROM student_notifications WHERE student_id = ?');
    $deleteNotifStmt->execute([$studentId]);

    $deleteStudentStmt = $pdo->prepare('DELETE FROM students WHERE id = ?');
    $deleteStudentStmt->execute([$studentId]);
    if ($deleteStudentStmt->rowCount() === 0) {
        throw new Exception('Gagal menghapus permanen data mahasiswa');
    }

    if (!empty($student['user_id'])) {
        $deleteUserStmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $deleteUserStmt->execute([$student['user_id']]);
    }

    $permanentPayload = [
        'student_id' => $studentId,
        'nim' => $nim,
        'chart_deleted_total' => $chartDeletedTotal,
        'chart_deleted_by_section' => $chartDeletedBySection,
    ];
    student_recycle_log_action($pdo, 'permanent_deleted', $adminId, $studentId, $oldData, $permanentPayload);

    return $permanentPayload;
}

