<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('student');

    $studentStmt = $pdo->prepare('SELECT id FROM students WHERE user_id = ? LIMIT 1');
    $studentStmt->execute([$auth['sub'] ?? '']);
    $student = $studentStmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        throw new Exception('Data mahasiswa tidak ditemukan untuk sesi login ini');
    }

    $unreadOnly = isset($_GET['unread_only']) && (string)$_GET['unread_only'] === '1';

    $query = '
        SELECT
            id,
            student_id,
            evaluation_id,
            invitation_id,
            type,
            title,
            message,
            link_path,
            is_read,
            read_at,
            created_at
        FROM student_notifications
        WHERE student_id = ?
    ';

    $params = [$student['id']];

    if ($unreadOnly) {
        $query .= ' AND is_read = 0';
    }

    $query .= ' ORDER BY created_at DESC';

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countStmt = $pdo->prepare('
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) AS unread
        FROM student_notifications
        WHERE student_id = ?
    ');
    $countStmt->execute([$student['id']]);
    $counts = $countStmt->fetch(PDO::FETCH_ASSOC) ?: ['total' => 0, 'unread' => 0];

    echo json_encode([
        'success' => true,
        'data' => [
            'items' => array_map(function ($row) {
                $row['is_read'] = (bool)$row['is_read'];
                return $row;
            }, $rows),
            'total' => (int)$counts['total'],
            'unread' => (int)$counts['unread'],
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
