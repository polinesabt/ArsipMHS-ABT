<?php
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/store_helper.php';

function achievement_list_has_column(PDO $pdo, string $table, string $column): bool {
    static $cache = [];
    $cacheKey = $table . '.' . $column;
    if (array_key_exists($cacheKey, $cache)) {
        return $cache[$cacheKey];
    }

    $stmt = $pdo->prepare('
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
          AND COLUMN_NAME = ?
        LIMIT 1
    ');
    $stmt->execute([$table, $column]);
    $cache[$cacheKey] = (bool)$stmt->fetchColumn();
    return $cache[$cacheKey];
}

function achievement_list_get_config_from_row(array $row): ?array {
    $category = isset($row['category']) ? trim((string)$row['category']) : '';
    $subcategory = isset($row['subcategory']) ? trim((string)$row['subcategory']) : '';
    if ($category === '') {
        return null;
    }

    return achievement_store_resolve_from_legacy($category, $subcategory);
}

try {
    $category = $_GET['category'] ?? null;
    $student_id = $_GET['student_id'] ?? null;
    $id = $_GET['id'] ?? null;
    $includeAttachmentsRaw = isset($_GET['include_attachments']) ? strtolower(trim((string)$_GET['include_attachments'])) : '';
    $includeAttachments = in_array($includeAttachmentsRaw, ['1', 'true', 'yes', 'on'], true);

    $ppPeranPenulisExpr = achievement_list_has_column($pdo, 'prestasi_publikasi', 'peran_penulis') ? 'pp.peran_penulis' : 'NULL';
    $ppPenulisExpr = achievement_list_has_column($pdo, 'prestasi_publikasi', 'penulis') ? 'pp.penulis' : 'NULL';
    $ppUrlExpr = achievement_list_has_column($pdo, 'prestasi_publikasi', 'url') ? 'pp.url' : 'NULL';
    $ppmLinkProdukExpr = achievement_list_has_column($pdo, 'prestasi_produk_mahasiswa', 'link_produk') ? 'ppm.link_produk' : 'NULL';
    $pkiJenisPerolehanExpr = achievement_list_has_column($pdo, 'prestasi_kekayaan_intelektual', 'jenis_perolehan') ? 'pki.jenis_perolehan' : 'NULL';
    $pkiNamaDosenExpr = achievement_list_has_column($pdo, 'prestasi_kekayaan_intelektual', 'nama_dosen') ? 'pki.nama_dosen' : 'NULL';
    $pkiUrlPublikasiExpr = achievement_list_has_column($pdo, 'prestasi_kekayaan_intelektual', 'url_publikasi') ? 'pki.url_publikasi' : 'NULL';

    $psJenisPerolehanExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'jenis_perolehan') ? 'ps.jenis_perolehan' : 'NULL';
    $psNamaDosenExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'nama_dosen') ? 'ps.nama_dosen' : 'NULL';
    $psPenulisExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'penulis') ? 'ps.penulis' : 'NULL';
    $psJudulPublikasiExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'judul_publikasi') ? 'ps.judul_publikasi' : 'NULL';
    $psLevelSeminarExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'level_seminar') ? 'ps.level_seminar' : 'NULL';
    $psTanggalPublikasiExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'tanggal_publikasi') ? 'ps.tanggal_publikasi' : 'NULL';
    if (achievement_list_has_column($pdo, 'prestasi_seminar', 'nama_seminar_konferensi')) {
        $psNamaSeminarKonferensiExpr = 'ps.nama_seminar_konferensi';
    } elseif (achievement_list_has_column($pdo, 'prestasi_seminar', 'nama_seminar')) {
        $psNamaSeminarKonferensiExpr = 'ps.nama_seminar';
    } else {
        $psNamaSeminarKonferensiExpr = 'NULL';
    }
    $psUrlPublikasiExpr = achievement_list_has_column($pdo, 'prestasi_seminar', 'url_publikasi') ? 'ps.url_publikasi' : 'NULL';
    
    $query = "
        SELECT 
            a.*,
            s.nim,
            s.nama,
            {$ppPeranPenulisExpr} AS peran_penulis,
            COALESCE({$psJenisPerolehanExpr}, {$pkiJenisPerolehanExpr}) AS jenis_perolehan,
            COALESCE({$psNamaDosenExpr}, {$ppPeranPenulisExpr}, {$pkiNamaDosenExpr}) AS nama_dosen,
            COALESCE({$psPenulisExpr}, {$ppPenulisExpr}) AS penulis,
            {$psJudulPublikasiExpr} AS judul_publikasi,
            {$psLevelSeminarExpr} AS level_seminar,
            {$psTanggalPublikasiExpr} AS tanggal_publikasi,
            {$psNamaSeminarKonferensiExpr} AS nama_seminar_konferensi,
            COALESCE({$psUrlPublikasiExpr}, {$ppUrlExpr}, {$pkiUrlPublikasiExpr}) AS url_publikasi,
            {$ppmLinkProdukExpr} AS link_produk
        FROM achievements a
        LEFT JOIN prestasi_publikasi pp ON pp.id_publikasi = a.id
        LEFT JOIN prestasi_seminar ps ON ps.id_seminar = a.id
        LEFT JOIN prestasi_produk_mahasiswa ppm ON ppm.id_produk_mahasiswa = a.id
        LEFT JOIN prestasi_kekayaan_intelektual pki ON pki.id_kekayaan_intelektual = a.id
        JOIN students s ON s.id = a.student_id AND s.deleted_at IS NULL
    ";
    $conditions = [];
    $params = [];
    
    if ($category) {
        $conditions[] = 'a.category = ?';
        $params[] = $category;
    }
    if ($student_id) {
        $conditions[] = 'a.student_id = ?';
        $params[] = $student_id;
    }
    if ($id) {
        $conditions[] = 'a.id = ?';
        $params[] = $id;
    }
    
    if (!empty($conditions)) {
        $query .= ' WHERE ' . implode(' AND ', $conditions);
    }
    
    $query .= ' ORDER BY a.tanggal DESC';
    
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    $achievements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Lampiran selalu diambil dari tabel prestasi_*_attachments (tidak pakai view) agar konsisten di production
    if ($includeAttachments && count($achievements) > 0) {
        $groupedAttachments = [];
        $attachmentGroups = [];
        foreach ($achievements as $row) {
            $aid = $row['id'] ?? null;
            if ($aid === null || $aid === '') {
                continue;
            }
            $config = achievement_list_get_config_from_row($row);
            if (!$config) {
                $groupedAttachments[$aid] = [];
                continue;
            }

            $table = $config['attachment_table'];
            $fk = $config['attachment_fk'];
            $groupKey = $table . '|' . $fk;

            if (!isset($attachmentGroups[$groupKey])) {
                $attachmentGroups[$groupKey] = [
                    'table' => $table,
                    'fk' => $fk,
                    'ids' => [],
                ];
            }
            $attachmentGroups[$groupKey]['ids'][] = $aid;
        }

        foreach ($attachmentGroups as $group) {
            $table = $group['table'];
            $fk = $group['fk'];
            $ids = array_values(array_unique($group['ids']));
            if (count($ids) === 0) {
                continue;
            }

            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sqlWithDeleted = "SELECT id, $fk AS achievement_id, file_name, file_type, file_size, file_path, uploaded_at FROM $table WHERE $fk IN ($placeholders) AND deleted_at IS NULL ORDER BY uploaded_at ASC";
            $sqlNoDeleted = "SELECT id, $fk AS achievement_id, file_name, file_type, file_size, file_path, uploaded_at FROM $table WHERE $fk IN ($placeholders) ORDER BY uploaded_at ASC";

            try {
                $attStmt = $pdo->prepare($sqlWithDeleted);
                $attStmt->execute($ids);
            } catch (Throwable $e) {
                $attStmt = $pdo->prepare($sqlNoDeleted);
                $attStmt->execute($ids);
            }

            while ($attachment = $attStmt->fetch(PDO::FETCH_ASSOC)) {
                $achievementId = $attachment['achievement_id'] ?? null;
                if ($achievementId === null || $achievementId === '') {
                    continue;
                }
                if (!isset($groupedAttachments[$achievementId])) {
                    $groupedAttachments[$achievementId] = [];
                }
                $groupedAttachments[$achievementId][] = $attachment;
            }
        }

        foreach ($achievements as &$achievement) {
            $achievementId = $achievement['id'] ?? '';
            $achievement['attachments'] = $groupedAttachments[$achievementId] ?? [];
        }
        unset($achievement);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $achievements,
        'count' => count($achievements)
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
