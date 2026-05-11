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

    if (!isset($input['new_password']) || !is_string($input['new_password'])) {
        throw new Exception('new_password diperlukan');
    }

    $new_password = trim($input['new_password']);
    if (strlen($new_password) < 6) {
        throw new Exception('Password minimal 6 karakter');
    }

    $ids = array_values(array_filter(array_map('trim', $input['ids'])));
    if (empty($ids)) {
        throw new Exception('Minimal satu id mahasiswa diperlukan');
    }

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare("SELECT id, user_id FROM students WHERE id IN ($placeholders) AND deleted_at IS NULL AND user_id IS NOT NULL AND user_id != ''");
    $stmt->execute($ids);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $password_hash = password_hash($new_password, PASSWORD_BCRYPT);
    $updated = 0;
    foreach ($students as $student) {
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$password_hash, $student['user_id']]);
        if ($stmt->rowCount() > 0) {
            $updated++;
        }
    }

    $message = $updated === 0
        ? 'Tidak ada akun dengan kredensial yang dapat direset'
        : ($updated === 1 ? '1 password berhasil direset' : "$updated password berhasil direset");

    echo json_encode([
        'success' => true,
        'message' => $message,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
