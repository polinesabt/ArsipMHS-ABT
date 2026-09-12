<?php
/**
 * Database Configuration
 * 
 * Loads database credentials from environment variables
 * Falls back to default values for development
 * Sets default timezone to Asia/Jakarta for audit/export/sync timestamps
 */

// Load environment variables
require_once __DIR__ . '/env.php';

// Default timezone for chart records, audit logs, export logs (Asia/Jakarta)
date_default_timezone_set('Asia/Jakarta');

// Get database credentials from environment or use defaults
$host = getenv('DB_HOST') ?: 'localhost';
$port = getenv('DB_PORT') ?: '3306';
$db = getenv('DB_NAME') ?: 'arsipmhs';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = getenv('DB_CHARSET') ?: 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, // Use native prepared statements
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
    ]);

    // Defense in depth: a valid Demo Mode token always receives a read-only
    // database session. The login endpoint is deliberately anonymous so a
    // stale Demo token cannot make a subsequent real-account login read-only.
    require_once __DIR__ . '/auth.php';
    $requestPath = (string)(parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '');
    $isLoginRequest = preg_match('~/api/auth/login\.php$~', $requestPath) === 1;
    $requestAuth = $isLoginRequest ? null : auth_optional();
    if (auth_is_demo($requestAuth)) {
        try {
            $pdo->exec('SET SESSION TRANSACTION READ ONLY');
        } catch (Throwable $readOnlyError) {
            header('Content-Type: application/json');
            http_response_code(503);
            echo json_encode([
                'success' => false,
                'error' => 'Proteksi read-only Demo Mode tidak dapat diaktifkan.',
                'code' => 'DEMO_READ_ONLY_UNAVAILABLE',
            ]);
            exit();
        }
    }
} catch (PDOException $e) {
    header('Content-Type: application/json');
    http_response_code(503);
    
    // Don't expose database details in production
    $errorMessage = (getenv('APP_ENV') === 'production') 
        ? 'Database connection failed. Please contact administrator.'
        : 'Database connection failed: ' . $e->getMessage();
    
    echo json_encode([
        'success' => false,
        'error' => $errorMessage
    ]);
    exit();
}
