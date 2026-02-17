<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

try {
    $auth = requireAuth('admin');

    $input = json_decode(file_get_contents('php://input'), true);

    if (!is_array($input)) {
        throw new Exception('Payload tidak valid');
    }

    $title = trim((string)($input['title'] ?? ''));
    $shortMessage = isset($input['short_message']) ? trim((string)$input['short_message']) : null;
    $status = (string)($input['status'] ?? 'active');
    $startAt = trim((string)($input['start_at'] ?? ''));
    $endAtRaw = isset($input['end_at']) ? trim((string)$input['end_at']) : null;
    $reminderEnabled = isset($input['reminder_enabled']) ? (bool)$input['reminder_enabled'] : true;
    $intervalDays = isset($input['reminder_interval_days']) ? (int)$input['reminder_interval_days'] : 7;

    if ($title === '') {
        throw new Exception('Judul evaluasi wajib diisi');
    }
    if ($startAt === '') {
        throw new Exception('Tanggal mulai evaluasi wajib diisi');
    }
    if (!in_array($status, ['active', 'closed'], true)) {
        throw new Exception('Status evaluasi tidak valid');
    }
    if ($intervalDays < 1 || $intervalDays > 365) {
        throw new Exception('Interval reminder harus antara 1 sampai 365 hari');
    }

    $startDate = new DateTime($startAt);
    $endDate = null;
    if ($endAtRaw !== null && $endAtRaw !== '') {
        $endDate = new DateTime($endAtRaw);
        if ($endDate < $startDate) {
            throw new Exception('Tanggal akhir tidak boleh lebih awal dari tanggal mulai');
        }
    }

    $id = bin2hex(random_bytes(18));
    $closedBy = $status === 'closed' ? ($auth['sub'] ?? null) : null;
    $closedAt = $status === 'closed' ? (new DateTime())->format('Y-m-d H:i:s') : null;

    $stmt = $pdo->prepare('
        INSERT INTO evaluations (
            id, title, short_message, status, start_at, end_at,
            reminder_enabled, reminder_interval_days, created_by,
            closed_by, closed_at, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
        )
    ');

    $stmt->execute([
        $id,
        $title,
        $shortMessage,
        $status,
        $startDate->format('Y-m-d H:i:s'),
        $endDate ? $endDate->format('Y-m-d H:i:s') : null,
        $reminderEnabled ? 1 : 0,
        $intervalDays,
        $auth['sub'] ?? null,
        $closedBy,
        $closedAt,
    ]);

    $fetch = $pdo->prepare('SELECT * FROM evaluations WHERE id = ? LIMIT 1');
    $fetch->execute([$id]);
    $evaluation = $fetch->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $evaluation,
        'message' => 'Evaluasi berhasil dibuat',
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
?>
