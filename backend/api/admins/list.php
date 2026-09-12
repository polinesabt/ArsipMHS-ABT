<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $payload = requireAuth('developer');

    if (!auth_is_demo($payload)) {
        // Defensive table & column check
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS admins (
              id VARCHAR(36) PRIMARY KEY COMMENT 'FK to users.id',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Admin creation date',
              can_edit_dosen TINYINT(1) NOT NULL DEFAULT 1,
              can_edit_mahasiswa TINYINT(1) NOT NULL DEFAULT 1,
              FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        // Sync any unmapped admin users into admins table
        $pdo->exec("
            INSERT IGNORE INTO admins (id, created_at, can_edit_dosen, can_edit_mahasiswa)
            SELECT id, NOW(), 1, 1
            FROM users
            WHERE role = 'admin'
        ");
    }

    $sql = "
        SELECT 
            u.id,
            u.username,
            u.nama,
            u.role,
            u.is_active,
            u.created_at,
            u.last_login,
            COALESCE(a.can_edit_dosen, 1) AS can_edit_dosen,
            COALESCE(a.can_edit_mahasiswa, 1) AS can_edit_mahasiswa
        FROM users u
        LEFT JOIN admins a ON u.id = a.id
        WHERE u.role = 'admin' AND u.is_active = 1
        ORDER BY u.created_at DESC
    ";

    $stmt = $pdo->query($sql);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $admins = array_map(function ($row) {
        return [
            'id' => (string)$row['id'],
            'username' => (string)$row['username'],
            'nama' => (string)($row['nama'] ?? $row['username']),
            'role' => (string)$row['role'],
            'is_active' => (bool)$row['is_active'],
            'created_at' => $row['created_at'],
            'last_login' => $row['last_login'],
            'can_edit_dosen' => (bool)$row['can_edit_dosen'],
            'can_edit_mahasiswa' => (bool)$row['can_edit_mahasiswa'],
        ];
    }, $rows);

    echo json_encode([
        'success' => true,
        'data' => $admins,
        'total' => count($admins),
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}
