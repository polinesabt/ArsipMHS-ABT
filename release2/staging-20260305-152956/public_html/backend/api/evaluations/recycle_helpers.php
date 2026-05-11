<?php

function evaluation_recycle_actor_id(string $actorId): string
{
    $actor = trim($actorId);
    return $actor !== '' ? $actor : 'system';
}

function evaluation_recycle_log_action(
    PDO $pdo,
    string $action,
    string $actorId,
    string $evaluationId,
    array $oldData,
    ?array $newData
): void {
    $stmt = $pdo->prepare("
        INSERT INTO record_change_logs
            (id, menu_section, record_id, action, admin_id, changed_at, old_data, new_data)
        VALUES
            (?, 'graduate_evaluations', ?, ?, ?, NOW(), ?, ?)
    ");
    $stmt->execute([
        bin2hex(random_bytes(18)),
        $evaluationId,
        $action,
        evaluation_recycle_actor_id($actorId),
        json_encode($oldData),
        $newData !== null ? json_encode($newData) : null,
    ]);
}

function evaluation_recycle_find(PDO $pdo, string $evaluationId): ?array
{
    $stmt = $pdo->prepare("
        SELECT
            e.*,
            creator.nama AS created_by_name,
            deleter.nama AS deleted_by_name
        FROM evaluations e
        LEFT JOIN users creator ON creator.id = e.created_by
        LEFT JOIN users deleter ON deleter.id = e.deleted_by
        WHERE e.id = ?
        LIMIT 1
    ");
    $stmt->execute([$evaluationId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function evaluation_recycle_soft_delete(PDO $pdo, string $evaluationId, string $actorId): array
{
    $record = evaluation_recycle_find($pdo, $evaluationId);
    if (!$record) {
        throw new Exception('Evaluasi tidak ditemukan.');
    }
    if (!empty($record['deleted_at'])) {
        throw new Exception('Evaluasi sudah berada di Recycle Bin.');
    }

    $stmt = $pdo->prepare('
        UPDATE evaluations
        SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL
    ');
    $stmt->execute([evaluation_recycle_actor_id($actorId), $evaluationId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Gagal memindahkan evaluasi ke Recycle Bin.');
    }

    $syncStmt = $pdo->prepare("
        UPDATE menu_user_satisfaction_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        SET m.deleted_at = NOW(), m.updated_at = NOW()
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
          AND m.deleted_at IS NULL
    ");
    $syncStmt->execute([$evaluationId]);
    $softDeletedSatisfaction = (int)$syncStmt->rowCount();

    $jobRelStmt = $pdo->prepare("
        UPDATE menu_job_relevance_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        SET m.deleted_at = NOW(), m.updated_at = NOW()
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
          AND m.deleted_at IS NULL
    ");
    $jobRelStmt->execute([$evaluationId]);
    $softDeletedJobRelevance = (int)$jobRelStmt->rowCount();

    $newData = evaluation_recycle_find($pdo, $evaluationId) ?: $record;
    $payload = $newData;
    $payload['satisfaction_records_soft_deleted'] = $softDeletedSatisfaction;
    $payload['job_relevance_records_soft_deleted'] = $softDeletedJobRelevance;

    evaluation_recycle_log_action($pdo, 'deleted', $actorId, $evaluationId, $record, $payload);
    return $payload;
}

function evaluation_recycle_restore(PDO $pdo, string $evaluationId, string $actorId): array
{
    $record = evaluation_recycle_find($pdo, $evaluationId);
    if (!$record) {
        throw new Exception('Evaluasi tidak ditemukan.');
    }
    if (empty($record['deleted_at'])) {
        throw new Exception('Evaluasi tidak berada di Recycle Bin.');
    }

    $stmt = $pdo->prepare('
        UPDATE evaluations
        SET deleted_at = NULL, deleted_by = NULL, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NOT NULL
    ');
    $stmt->execute([$evaluationId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Gagal memulihkan evaluasi.');
    }

    $syncStmt = $pdo->prepare("
        UPDATE menu_user_satisfaction_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        SET m.deleted_at = NULL, m.updated_at = NOW()
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
          AND m.deleted_at IS NOT NULL
    ");
    $syncStmt->execute([$evaluationId]);
    $restoredSatisfaction = (int)$syncStmt->rowCount();

    $jobRelStmt = $pdo->prepare("
        UPDATE menu_job_relevance_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        SET m.deleted_at = NULL, m.updated_at = NOW()
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
          AND m.deleted_at IS NOT NULL
    ");
    $jobRelStmt->execute([$evaluationId]);
    $restoredJobRelevance = (int)$jobRelStmt->rowCount();

    $newData = evaluation_recycle_find($pdo, $evaluationId) ?: $record;
    $payload = $newData;
    $payload['satisfaction_records_restored'] = $restoredSatisfaction;
    $payload['job_relevance_records_restored'] = $restoredJobRelevance;

    evaluation_recycle_log_action($pdo, 'recovered', $actorId, $evaluationId, $record, $payload);
    return $payload;
}

function evaluation_recycle_permanent_delete(PDO $pdo, string $evaluationId, string $actorId): array
{
    $record = evaluation_recycle_find($pdo, $evaluationId);
    if (!$record) {
        throw new Exception('Evaluasi tidak ditemukan.');
    }
    if (empty($record['deleted_at'])) {
        throw new Exception('Evaluasi harus berada di Recycle Bin sebelum dihapus permanen.');
    }

    $deleteSatisfaction = $pdo->prepare("
        DELETE m
        FROM menu_user_satisfaction_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
    ");
    $deleteSatisfaction->execute([$evaluationId]);
    $deletedSatisfaction = (int)$deleteSatisfaction->rowCount();

    $deleteJobRelevance = $pdo->prepare("
        DELETE m
        FROM menu_job_relevance_records m
        INNER JOIN evaluation_responses r ON r.id = m.source_id
        WHERE m.source_table = 'evaluation_responses'
          AND r.evaluation_id = ?
    ");
    $deleteJobRelevance->execute([$evaluationId]);
    $deletedJobRelevance = (int)$deleteJobRelevance->rowCount();

    $deleteRatings = $pdo->prepare('
        DELETE rr
        FROM evaluation_response_ratings rr
        INNER JOIN evaluation_responses r ON r.id = rr.response_id
        WHERE r.evaluation_id = ?
    ');
    $deleteRatings->execute([$evaluationId]);
    $deletedRatings = (int)$deleteRatings->rowCount();

    $deleteResponses = $pdo->prepare('DELETE FROM evaluation_responses WHERE evaluation_id = ?');
    $deleteResponses->execute([$evaluationId]);
    $deletedResponses = (int)$deleteResponses->rowCount();

    $deleteNotifications = $pdo->prepare('DELETE FROM student_notifications WHERE evaluation_id = ?');
    $deleteNotifications->execute([$evaluationId]);
    $deletedNotifications = (int)$deleteNotifications->rowCount();

    $deleteInvitations = $pdo->prepare('DELETE FROM evaluation_invitations WHERE evaluation_id = ?');
    $deleteInvitations->execute([$evaluationId]);
    $deletedInvitations = (int)$deleteInvitations->rowCount();

    $deleteEvaluation = $pdo->prepare('DELETE FROM evaluations WHERE id = ? AND deleted_at IS NOT NULL');
    $deleteEvaluation->execute([$evaluationId]);
    if ($deleteEvaluation->rowCount() === 0) {
        throw new Exception('Gagal menghapus permanen evaluasi.');
    }

    $payload = [
        'evaluation_id' => $evaluationId,
        'deleted_invitations' => $deletedInvitations,
        'deleted_responses' => $deletedResponses,
        'deleted_ratings' => $deletedRatings,
        'deleted_notifications' => $deletedNotifications,
        'deleted_satisfaction_records' => $deletedSatisfaction,
        'deleted_job_relevance_records' => $deletedJobRelevance,
    ];
    evaluation_recycle_log_action($pdo, 'permanent_deleted', $actorId, $evaluationId, $record, $payload);
    return $payload;
}

function evaluation_recycle_list(PDO $pdo, int $page, int $perPage, string $search = ''): array
{
    $where = 'WHERE e.deleted_at IS NOT NULL';
    $params = [];

    if ($search !== '') {
        $where .= ' AND e.title LIKE ?';
        $params[] = '%' . $search . '%';
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM evaluations e {$where}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $perPage;
    $sql = "
        SELECT
            e.*,
            creator.nama AS created_by_name,
            deleter.nama AS deleted_by_name,
            COUNT(DISTINCT CASE WHEN s.id IS NOT NULL THEN i.id END) AS total_targets,
            COUNT(DISTINCT CASE WHEN s.id IS NOT NULL AND i.submitted_at IS NOT NULL THEN i.id END) AS total_submitted
        FROM evaluations e
        LEFT JOIN users creator ON creator.id = e.created_by
        LEFT JOIN users deleter ON deleter.id = e.deleted_by
        LEFT JOIN evaluation_invitations i ON i.evaluation_id = e.id
        LEFT JOIN students s ON s.id = i.student_id AND s.deleted_at IS NULL
        {$where}
        GROUP BY e.id
        ORDER BY e.deleted_at DESC, e.title ASC
        LIMIT " . (int)$perPage . " OFFSET " . (int)$offset;

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    return [
        'records' => $stmt->fetchAll(PDO::FETCH_ASSOC),
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
    ];
}
