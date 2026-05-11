<?php
/**
 * GET: Daftar statistik per semester (untuk input PD-Dikti).
 * PUT/POST: Upsert satu baris (tahun, semester, pd_dikti, aktif optional).
 * DELETE: Hapus satu baris (query: tahun, semester). Auth: admin only.
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'] ?? '';

if ($method === 'GET') {
    try {
        requireAuth('admin');
        $pdo->exec("CREATE TABLE IF NOT EXISTS active_students_semester_stats (
          tahun INT NOT NULL,
          semester ENUM('genap','ganjil') NOT NULL,
          pd_dikti INT NOT NULL DEFAULT 0,
          aktif INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (tahun, semester),
          INDEX idx_tahun (tahun)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $yearFilter = isset($_GET['year']) ? (int)$_GET['year'] : null;
        if ($yearFilter !== null && ($yearFilter < 1900 || $yearFilter > 2100)) {
            $yearFilter = null;
        }
        $sql = "SELECT tahun, semester, pd_dikti, aktif FROM active_students_semester_stats";
        $params = [];
        if ($yearFilter !== null) {
            $sql .= " WHERE tahun = ?";
            $params[] = $yearFilter;
        }
        $sql .= " ORDER BY tahun ASC, semester ASC";
        if ($params) {
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            $stmt = $pdo->query($sql);
        }
        $rows = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $rows[] = [
                'tahun' => (int)$row['tahun'],
                'semester' => $row['semester'],
                'pd_dikti' => (int)$row['pd_dikti'],
                'aktif' => $row['aktif'] !== null ? (int)$row['aktif'] : null,
            ];
        }
        echo json_encode(['success' => true, 'data' => $rows]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    return;
}

if ($method === 'PUT' || $method === 'POST') {
    try {
        requireAuth('admin');
        $input = json_decode(file_get_contents('php://input'), true) ?: [];
        $tahun = isset($input['tahun']) ? (int)$input['tahun'] : null;
        $semester = isset($input['semester']) ? strtolower(trim((string)$input['semester'])) : '';
        if ($tahun === null || $tahun < 1900 || $tahun > 2100) {
            throw new Exception('tahun wajib dan harus 1900–2100.');
        }
        if (!in_array($semester, ['genap', 'ganjil'], true)) {
            throw new Exception('semester harus genap atau ganjil.');
        }
        $pd_dikti = isset($input['pd_dikti']) ? (int)$input['pd_dikti'] : 0;
        if ($pd_dikti < 0) $pd_dikti = 0;
        $aktif = null;
        if (array_key_exists('aktif', $input)) {
            $aktif = $input['aktif'] === null ? null : (int)$input['aktif'];
            if ($aktif !== null && $aktif < 0) $aktif = 0;
        }
        $pdo->exec("CREATE TABLE IF NOT EXISTS active_students_semester_stats (
          tahun INT NOT NULL,
          semester ENUM('genap','ganjil') NOT NULL,
          pd_dikti INT NOT NULL DEFAULT 0,
          aktif INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (tahun, semester),
          INDEX idx_tahun (tahun)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $stmt = $pdo->prepare("SELECT aktif FROM active_students_semester_stats WHERE tahun = ? AND semester = ?");
        $stmt->execute([$tahun, $semester]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        $aktifFinal = $aktif;
        if (!array_key_exists('aktif', $input) && $existing !== false) {
            $aktifFinal = $existing['aktif'] !== null ? (int)$existing['aktif'] : null;
        }
        $stmt = $pdo->prepare("INSERT INTO active_students_semester_stats (tahun, semester, pd_dikti, aktif) VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE pd_dikti = VALUES(pd_dikti), aktif = VALUES(aktif)");
        $stmt->execute([$tahun, $semester, $pd_dikti, $aktifFinal]);
        echo json_encode([
            'success' => true,
            'data' => [
                'tahun' => $tahun,
                'semester' => $semester,
                'pd_dikti' => $pd_dikti,
                'aktif' => $aktifFinal,
            ],
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    return;
}

if ($method === 'DELETE') {
    try {
        requireAuth('admin');
        $tahun = isset($_GET['tahun']) ? (int)$_GET['tahun'] : null;
        $semester = isset($_GET['semester']) ? strtolower(trim((string)$_GET['semester'])) : '';
        if ($tahun === null || $tahun < 1900 || $tahun > 2100) {
            throw new Exception('tahun wajib dan harus 1900–2100.');
        }
        if (!in_array($semester, ['genap', 'ganjil'], true)) {
            throw new Exception('semester harus genap atau ganjil.');
        }
        $stmt = $pdo->prepare("DELETE FROM active_students_semester_stats WHERE tahun = ? AND semester = ?");
        $stmt->execute([$tahun, $semester]);
        echo json_encode(['success' => true, 'deleted' => $stmt->rowCount() > 0]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    return;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
