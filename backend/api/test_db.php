<?php
require_once __DIR__ . '/../config/cors.php';
/**
 * Database Connection Test Script
 * Test koneksi ke database lokal
 */


if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load environment variables
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/database.php';

$result = [
    'success' => false,
    'database_config' => [],
    'connection' => [],
    'tables' => [],
    'test_query' => [],
    'errors' => []
];

try {
    // 1. Test Database Config
    $result['database_config'] = [
        'host' => $host ?? 'not set',
        'port' => $port ?? 'not set',
        'database' => $db ?? 'not set',
        'user' => $user ?? 'not set',
        'charset' => $charset ?? 'not set'
    ];

    // 2. Test Connection
    if (isset($pdo) && $pdo instanceof PDO) {
        $result['connection'] = [
            'status' => 'connected',
            'driver' => $pdo->getAttribute(PDO::ATTR_DRIVER_NAME),
            'server_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION)
        ];
        $result['success'] = true;
    } else {
        $result['connection'] = [
            'status' => 'failed',
            'error' => 'PDO object not initialized'
        ];
        $result['errors'][] = 'PDO connection failed';
    }

    // 3. List Tables
    if ($result['success']) {
        try {
            $stmt = $pdo->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            $result['tables'] = [
                'count' => count($tables),
                'list' => $tables
            ];
        } catch (Exception $e) {
            $result['errors'][] = 'Failed to list tables: ' . $e->getMessage();
        }
    }

    // 4. Test Query - Check users table
    if ($result['success']) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $userCount = $stmt->fetch(PDO::FETCH_ASSOC);
            $result['test_query'] = [
                'users_table' => [
                    'exists' => true,
                    'record_count' => (int)$userCount['count']
                ]
            ];
        } catch (Exception $e) {
            $result['test_query'] = [
                'users_table' => [
                    'exists' => false,
                    'error' => $e->getMessage()
                ]
            ];
            $result['errors'][] = 'Users table test failed: ' . $e->getMessage();
        }
    }

    // 5. Test Query - Check students table
    if ($result['success']) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM students");
            $studentCount = $stmt->fetch(PDO::FETCH_ASSOC);
            $result['test_query']['students_table'] = [
                'exists' => true,
                'record_count' => (int)$studentCount['count']
            ];
        } catch (Exception $e) {
            $result['test_query']['students_table'] = [
                'exists' => false,
                'error' => $e->getMessage()
            ];
            $result['errors'][] = 'Students table test failed: ' . $e->getMessage();
        }
    }

} catch (Exception $e) {
    $result['success'] = false;
    $result['errors'][] = 'Exception: ' . $e->getMessage();
}

http_response_code($result['success'] ? 200 : 500);
echo json_encode($result, JSON_PRETTY_PRINT);
?>
