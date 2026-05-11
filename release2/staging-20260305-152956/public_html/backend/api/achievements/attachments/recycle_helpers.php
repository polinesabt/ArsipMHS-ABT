<?php

require_once __DIR__ . '/../store_helper.php';

function attachment_recycle_actor_id(string $actorId): string
{
    $actor = trim($actorId);
    return $actor !== '' ? $actor : 'system';
}

function attachment_recycle_log_action(
    PDO $pdo,
    string $action,
    string $actorId,
    string $attachmentId,
    array $oldData,
    ?array $newData
): void {
    $stmt = $pdo->prepare("
        INSERT INTO record_change_logs
            (id, menu_section, record_id, action, admin_id, changed_at, old_data, new_data)
        VALUES
            (?, 'achievement_attachments', ?, ?, ?, NOW(), ?, ?)
    ");
    $stmt->execute([
        bin2hex(random_bytes(18)),
        $attachmentId,
        $action,
        attachment_recycle_actor_id($actorId),
        json_encode($oldData),
        $newData !== null ? json_encode($newData) : null,
    ]);
}

function attachment_recycle_find(PDO $pdo, string $attachmentId): ?array
{
    $found = achievement_store_find_attachment($pdo, $attachmentId);
    if (!$found) {
        return null;
    }

    $config = $found['config'];
    $row = $found['row'];
    $achievementId = (string)($row['achievement_id'] ?? '');
    $achievement = $achievementId !== '' ? achievement_store_find_record($pdo, $achievementId) : null;
    if (!$achievement) {
        return null;
    }

    $achievementRow = $achievement['row'];
    $studentId = (string)($achievementRow['id_mahasiswa'] ?? '');
    $studentStmt = $pdo->prepare('SELECT id, nim, nama, deleted_at FROM students WHERE id = ? LIMIT 1');
    $studentStmt->execute([$studentId]);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC) ?: null;

    return [
        'id' => (string)($row['id'] ?? $attachmentId),
        'achievement_id' => $achievementId,
        'achievement_key' => $config['key'],
        'attachment_table' => $config['attachment_table'],
        'attachment_fk' => $config['attachment_fk'],
        'file_name' => (string)($row['file_name'] ?? ''),
        'file_type' => (string)($row['file_type'] ?? ''),
        'file_size' => (int)($row['file_size'] ?? 0),
        'file_path' => (string)($row['file_path'] ?? ''),
        'uploaded_at' => $row['uploaded_at'] ?? null,
        'deleted_at' => $row['deleted_at'] ?? null,
        'deleted_by' => $row['deleted_by'] ?? null,
        'student_id' => $studentId,
        'student_nim' => $student['nim'] ?? null,
        'student_nama' => $student['nama'] ?? null,
        'student_deleted_at' => $student['deleted_at'] ?? null,
    ];
}

function attachment_recycle_assert_visible_record(array $record): void
{
    if (!empty($record['student_deleted_at'])) {
        throw new Exception('Lampiran terkait akun yang sedang berada di Recycle Bin tidak dapat dikelola terpisah.');
    }
}

function attachment_recycle_soft_delete(PDO $pdo, string $attachmentId, string $actorId): array
{
    $record = attachment_recycle_find($pdo, $attachmentId);
    if (!$record) {
        throw new Exception('Lampiran tidak ditemukan.');
    }
    if (!empty($record['deleted_at'])) {
        throw new Exception('Lampiran sudah berada di Recycle Bin.');
    }

    attachment_recycle_assert_visible_record($record);

    $table = $record['attachment_table'];
    $sqlSoft = sprintf(
        'UPDATE %s SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL',
        $table
    );
    try {
        $stmt = $pdo->prepare($sqlSoft);
        $stmt->execute([attachment_recycle_actor_id($actorId), $attachmentId]);
        if ($stmt->rowCount() === 0) {
            throw new Exception('Gagal memindahkan lampiran ke Recycle Bin.');
        }
        $newData = attachment_recycle_find($pdo, $attachmentId) ?: $record;
        try {
            attachment_recycle_log_action($pdo, 'deleted', $actorId, $attachmentId, $record, $newData);
        } catch (Throwable $logEx) {
            // record_change_logs bisa belum ada; abaikan supaya hapus tetap sukses
        }
        return $newData;
    } catch (Throwable $e) {
        // Kolom deleted_at/deleted_by belum ada (migrasi recycle bin belum dijalankan): hapus permanen dari tabel
        $msg = $e->getMessage();
        $isColumnMissing = (strpos($msg, 'Unknown column') !== false || strpos($msg, 'deleted_at') !== false);
        if ($isColumnMissing) {
            $sqlHard = sprintf('DELETE FROM %s WHERE id = ?', $table);
            $stmt = $pdo->prepare($sqlHard);
            $stmt->execute([$attachmentId]);
            if ($stmt->rowCount() > 0) {
                attachment_recycle_delete_file((string)($record['file_path'] ?? ''));
                return $record;
            }
        }
        throw $e;
    }
}

function attachment_recycle_restore(PDO $pdo, string $attachmentId, string $actorId): array
{
    $record = attachment_recycle_find($pdo, $attachmentId);
    if (!$record) {
        throw new Exception('Lampiran tidak ditemukan.');
    }
    if (empty($record['deleted_at'])) {
        throw new Exception('Lampiran tidak berada di Recycle Bin.');
    }

    attachment_recycle_assert_visible_record($record);

    $sql = sprintf(
        'UPDATE %s SET deleted_at = NULL, deleted_by = NULL WHERE id = ? AND deleted_at IS NOT NULL',
        $record['attachment_table']
    );
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$attachmentId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Gagal memulihkan lampiran.');
    }

    $newData = attachment_recycle_find($pdo, $attachmentId) ?: $record;
    attachment_recycle_log_action($pdo, 'recovered', $actorId, $attachmentId, $record, $newData);
    return $newData;
}

function attachment_recycle_delete_file(string $relativePath): bool
{
    $relative = trim(str_replace('\\', '/', $relativePath));
    if ($relative === '') {
        return true;
    }
    $relative = ltrim($relative, '/');
    if ($relative === '' || strpos($relative, '..') !== false) {
        return false;
    }

    $basePath = __DIR__ . '/../../../storage';
    $baseReal = realpath($basePath);
    if ($baseReal === false) {
        return false;
    }

    $fullPath = $basePath . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative);
    $fullDir = realpath(dirname($fullPath));
    if ($fullDir === false || strpos($fullDir, $baseReal) !== 0) {
        return false;
    }

    if (!is_file($fullPath)) {
        return true;
    }

    return @unlink($fullPath);
}

function attachment_recycle_permanent_delete(
    PDO $pdo,
    string $attachmentId,
    string $actorId,
    bool $enforceVisibility = true
): array {
    $record = attachment_recycle_find($pdo, $attachmentId);
    if (!$record) {
        throw new Exception('Lampiran tidak ditemukan.');
    }
    if (empty($record['deleted_at'])) {
        throw new Exception('Lampiran harus berada di Recycle Bin sebelum dihapus permanen.');
    }
    if ($enforceVisibility) {
        attachment_recycle_assert_visible_record($record);
    }

    $fileDeleted = attachment_recycle_delete_file((string)$record['file_path']);
    if (!$fileDeleted) {
        throw new Exception('Gagal menghapus file lampiran dari storage.');
    }

    $sql = sprintf('DELETE FROM %s WHERE id = ? AND deleted_at IS NOT NULL', $record['attachment_table']);
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$attachmentId]);
    if ($stmt->rowCount() === 0) {
        throw new Exception('Gagal menghapus permanen lampiran.');
    }

    $newData = [
        'attachment_id' => $attachmentId,
        'achievement_id' => $record['achievement_id'],
        'file_path' => $record['file_path'],
        'file_deleted' => $fileDeleted,
    ];
    attachment_recycle_log_action($pdo, 'permanent_deleted', $actorId, $attachmentId, $record, $newData);
    return $newData;
}

function attachment_recycle_list(PDO $pdo, int $page, int $perPage, string $search = ''): array
{
    $parts = [];
    foreach (achievement_store_configs() as $config) {
        $parts[] = sprintf(
            "SELECT
                a.id,
                a.%s AS achievement_id,
                '%s' AS achievement_key,
                a.file_name,
                a.file_type,
                a.file_size,
                a.file_path,
                a.uploaded_at,
                a.deleted_at,
                a.deleted_by,
                r.id_mahasiswa AS student_id,
                s.nim AS student_nim,
                s.nama AS student_nama
             FROM %s a
             INNER JOIN %s r ON r.%s = a.%s
             INNER JOIN students s ON s.id = r.id_mahasiswa
             WHERE a.deleted_at IS NOT NULL
               AND s.deleted_at IS NULL",
            $config['attachment_fk'],
            $config['key'],
            $config['attachment_table'],
            $config['table'],
            $config['id_col'],
            $config['attachment_fk']
        );
    }

    $unionSql = implode(" UNION ALL ", $parts);
    $where = ' WHERE 1=1';
    $params = [];
    if ($search !== '') {
        $where .= ' AND (x.file_name LIKE ? OR x.student_nim LIKE ? OR x.student_nama LIKE ?)';
        $term = '%' . $search . '%';
        $params[] = $term;
        $params[] = $term;
        $params[] = $term;
    }

    $countSql = "SELECT COUNT(*) FROM ({$unionSql}) x {$where}";
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $perPage;
    $listSql = "SELECT *
                FROM ({$unionSql}) x
                {$where}
                ORDER BY x.deleted_at DESC, x.file_name ASC
                LIMIT " . (int)$perPage . " OFFSET " . (int)$offset;
    $listStmt = $pdo->prepare($listSql);
    $listStmt->execute($params);

    return [
        'records' => $listStmt->fetchAll(PDO::FETCH_ASSOC),
        'total' => $total,
        'page' => $page,
        'per_page' => $perPage,
    ];
}
