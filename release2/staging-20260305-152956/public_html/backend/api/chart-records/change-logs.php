<?php
/**
 * List record change logs (audit trail).
 * GET ?section=... (optional) | ?page=1&per_page=20
 * Auth: admin only
 */
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json');

$sectionLabels = [
    'study_period' => 'Masa Studi',
    'waiting_time' => 'Waktu Tunggu',
    'job_relevance' => 'Relevansi Pekerjaan',
    'work_coverage' => 'Cakupan Kerja',
    'user_satisfaction' => 'Kepuasan Pengguna',
    'publications' => 'Diseminasi Ilmiah Mahasiswa',
    'seminar_kegiatan' => 'Diseminasi Ilmiah Mahasiswa',
    'active_students' => 'Mahasiswa Aktif',
    'student_products' => 'Produk Mahasiswa',
    'research_outputs' => 'Luaran Penelitian',
    'student_achievements' => 'Prestasi Mahasiswa',
    'student_accounts' => 'Akun Mahasiswa',
    'achievement_attachments' => 'Lampiran Prestasi',
    'graduate_evaluations' => 'Evaluasi Lulusan',
];

$actionLabels = [
    'created' => 'Tambah Data',
    'updated' => 'Edit Data',
    'deleted' => 'Hapus (ke Recycle Bin)',
    'recovered' => 'Pulihkan Data',
    'permanent_deleted' => 'Hapus Permanen',
];

try {
    requireAuth('admin');

    $section = isset($_GET['section']) ? trim((string)$_GET['section']) : '';
    $page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? min(100, max(10, (int)$_GET['per_page'])) : 20;

    $where = '1=1';
    $params = [];
    if ($section !== '') {
        $where .= ' AND l.menu_section = ?';
        $params[] = $section;
    }

    $countStmt = $pdo->prepare("SELECT COUNT(*) FROM record_change_logs l WHERE {$where}");
    $countStmt->execute($params);
    $total = (int)$countStmt->fetchColumn();

    $offset = ($page - 1) * $perPage;
    $stmt = $pdo->prepare("
        SELECT l.id, l.menu_section, l.record_id, l.action, l.admin_id, l.changed_at, l.old_data, l.new_data,
               u.nama AS admin_nama
        FROM record_change_logs l
        LEFT JOIN users u ON u.id = l.admin_id
        WHERE {$where}
        ORDER BY l.changed_at DESC
        LIMIT " . (int)$perPage . " OFFSET " . (int)$offset
    );
    $stmt->execute($params);
    $rows = [];
    while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $r['section_label'] = $sectionLabels[$r['menu_section']] ?? $r['menu_section'];
        $r['action_label'] = $actionLabels[$r['action']] ?? $r['action'];
        $rows[] = $r;
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'logs' => $rows,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ],
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
