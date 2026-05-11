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
$db = getenv('DB_NAME') ?: 'arsipmhs';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = getenv('DB_CHARSET') ?: 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false, // Use native prepared statements
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES $charset"
    ]);
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
