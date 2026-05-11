<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/security.php';
require_once __DIR__ . '/status_effective_sql.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        throw new Exception('id diperlukan');
    }
    
    $student_id = $input['id'];
    
    $stmt = $pdo->prepare('SELECT * FROM students WHERE id = ? AND deleted_at IS NULL');
    $stmt->execute([$student_id]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        throw new Exception('Mahasiswa tidak ditemukan');
    }

    if (array_key_exists('nim', $input)) {
        $input['nim'] = trim((string)$input['nim']);
        if (!validateNIM($input['nim'])) {
            throw new Exception('NIM hanya boleh berisi angka dan titik, dengan panjang 4 sampai 20 karakter');
        }
    }
    
    $fields = [];
    $params = [];

    $validStatuses = ['active', 'alumni', 'on_leave', 'dropout'];
    if (array_key_exists('status', $input) && !in_array($input['status'], $validStatuses, true)) {
        throw new Exception('Status mahasiswa tidak valid');
    }
    if (array_key_exists('status_mode', $input)) {
        $mode = trim((string)$input['status_mode']);
        if ($mode === '') {
            unset($input['status_mode']);
        } elseif (!in_array($mode, ['manual', 'auto'], true)) {
            throw new Exception('status_mode tidak valid');
        } else {
            $input['status_mode'] = $mode;
        }
    }

    if (array_key_exists('status', $input)) {
        // If status_mode is omitted, infer it from status (auto except cuti/dropout).
        if (!array_key_exists('status_mode', $input)) {
            $input['status_mode'] = in_array($input['status'], ['on_leave', 'dropout'], true) ? 'manual' : 'auto';
        }
    }

    // Safety: cuti/dropout must be manual override (auto mode would ignore these statuses).
    $nextStatus = array_key_exists('status', $input) ? $input['status'] : ($student['status'] ?? null);
    if (in_array($nextStatus, ['on_leave', 'dropout'], true)) {
        $input['status_mode'] = 'manual';
    }
    
    $allowedFields = [
        'nim' => 'nim',
        'nama' => 'nama',
        'jurusan' => 'jurusan',
        'prodi' => 'prodi',
        'status' => 'status',
        'status_mode' => 'status_mode',
        'tahun_masuk' => 'tahun_masuk',
        'tahun_lulus' => 'tahun_lulus',
        'email' => 'email',
        'no_hp' => 'no_hp',
        'alamat' => 'alamat'
    ];
    
    foreach ($allowedFields as $inputKey => $dbField) {
        if (array_key_exists($inputKey, $input)) {
            $fields[] = "$dbField = ?";
            $params[] = $input[$inputKey];
        }
    }
    
    if (empty($fields)) {
        throw new Exception('Tidak ada data untuk diperbarui');
    }
    
    $pdo->beginTransaction();
    
    $params[] = $student_id;
    $query = 'UPDATE students SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL';
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    // If NIM updated, sync with users.username
    if (array_key_exists('nim', $input) && $student['user_id']) {
        $stmt = $pdo->prepare('UPDATE users SET username = ? WHERE id = ?');
        $stmt->execute([$input['nim'], $student['user_id']]);
    }
    
    $pdo->commit();
    
    $statusEffectiveExpr = student_status_effective_expr('s');
    $stmt = $pdo->prepare('SELECT s.*, (' . $statusEffectiveExpr . ') AS status_effective FROM students s WHERE s.id = ? AND s.deleted_at IS NULL');
    $stmt->execute([$student_id]);
    $updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $updated,
        'message' => 'Mahasiswa berhasil diperbarui'
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
