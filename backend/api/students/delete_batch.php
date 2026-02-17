<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['ids']) || !is_array($input['ids'])) {
        throw new Exception('ids (array) diperlukan');
    }

    $ids = array_values(array_filter(array_map('trim', $input['ids'])));
    if (empty($ids)) {
        throw new Exception('Minimal satu id mahasiswa diperlukan');
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT id, user_id FROM students WHERE id IN ($placeholders)");
    $stmt->execute($ids);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($students)) {
        throw new Exception('Tidak ada mahasiswa ditemukan untuk id yang diberikan');
    }

    $pdo->beginTransaction();

    foreach ($students as $student) {
        $stmt = $pdo->prepare('DELETE FROM students WHERE id = ?');
        $stmt->execute([$student['id']]);
        if (!empty($student['user_id'])) {
            $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$student['user_id']]);
        }
    }

    $pdo->commit();

    $count = count($students);
    echo json_encode([
        'success' => true,
        'message' => $count === 1 ? 'Mahasiswa berhasil dihapus' : "$count data mahasiswa berhasil dihapus",
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
