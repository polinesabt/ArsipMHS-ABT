<?php
require_once __DIR__ . '/../../config/cors.php';

require_once __DIR__ . '/../../config/database.php';

try {
    $id = $_GET['id'] ?? null;
    $nim = $_GET['nim'] ?? null;
    $status = $_GET['status'] ?? null;
    $tahun_masuk = isset($_GET['tahun_masuk']) ? (int) $_GET['tahun_masuk'] : null;
    $tahun_lulus = isset($_GET['tahun_lulus']) ? (int) $_GET['tahun_lulus'] : null;
    $career_status = $_GET['career_status'] ?? null;
    $search = isset($_GET['search']) ? trim($_GET['search']) : null;
    $jurusan = isset($_GET['jurusan']) ? trim($_GET['jurusan']) : null;
    $prodi = isset($_GET['prodi']) ? trim($_GET['prodi']) : null;
    $limit = isset($_GET['limit']) ? max(1, min(100, (int) $_GET['limit'])) : null;
    $offset = isset($_GET['offset']) ? max(0, (int) $_GET['offset']) : null;

    $valid_career = ['working', 'job_seeking', 'entrepreneur', 'further_study'];
    if ($career_status !== null && $career_status !== '' && !in_array($career_status, $valid_career)) {
        $career_status = null;
    }

    $join = '';
    $conditions = [];
    $params = [];

    if ($career_status !== null && $career_status !== '') {
        $join = ' INNER JOIN tracer_study t ON s.id = t.student_id AND t.career_status = ?';
        $params[] = $career_status;
    }

    if ($id) {
        $conditions[] = 's.id = ?';
        $params[] = $id;
    }
    if ($nim) {
        $conditions[] = 's.nim = ?';
        $params[] = $nim;
    }
    if ($status !== null && $status !== '' && in_array($status, ['active', 'alumni', 'on_leave', 'dropout'])) {
        $conditions[] = 's.status = ?';
        $params[] = $status;
    }
    if ($tahun_masuk !== null && $tahun_masuk > 0) {
        $conditions[] = 's.tahun_masuk = ?';
        $params[] = $tahun_masuk;
    }
    if ($tahun_lulus !== null && $tahun_lulus > 0) {
        $conditions[] = 's.tahun_lulus = ?';
        $params[] = $tahun_lulus;
    }
    if ($search !== null && $search !== '') {
        $conditions[] = '(s.nama LIKE ? OR s.nim LIKE ?)';
        $term = '%' . $search . '%';
        $params[] = $term;
        $params[] = $term;
    }
    if ($jurusan !== null && $jurusan !== '') {
        $conditions[] = 's.jurusan = ?';
        $params[] = $jurusan;
    }
    if ($prodi !== null && $prodi !== '') {
        $conditions[] = 's.prodi = ?';
        $params[] = $prodi;
    }

    $where = empty($conditions) ? '' : ' WHERE ' . implode(' AND ', $conditions);
    $order = ' ORDER BY s.updated_at DESC';

    $countSql = 'SELECT COUNT(*) AS total FROM students s' . $join . $where;
    $stmtCount = $pdo->prepare($countSql);
    $stmtCount->execute($params);
    $total = (int) $stmtCount->fetch(PDO::FETCH_ASSOC)['total'];

    $dataQuery = 'SELECT s.* FROM students s' . $join . $where . $order;
    if ($limit !== null) {
        $dataQuery .= ' LIMIT ' . (int) $limit;
        if ($offset !== null) {
            $dataQuery .= ' OFFSET ' . (int) $offset;
        }
    }
    $stmt = $pdo->prepare($dataQuery);
    $stmt->execute($params);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $students,
        'total' => $total,
        'count' => count($students),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
