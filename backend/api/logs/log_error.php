<?php
require_once __DIR__ . '/../../config/cors.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

header('Content-Type: application/json; charset=utf-8');

function generate_uuid4(): string {
    $data = random_bytes(16);
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
        exit();
    }

    $requestAuth = auth_optional();
    if (auth_is_demo($requestAuth)) {
        requireProductionWrite($requestAuth);
    }

    // Defensive DB Table Creation
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_error_logs (
          id VARCHAR(36) PRIMARY KEY,
          user_id VARCHAR(36) NULL,
          username VARCHAR(100) NULL,
          role ENUM('student', 'admin', 'developer', 'demo', 'guest') NOT NULL DEFAULT 'guest',
          feature_name VARCHAR(100) NOT NULL,
          error_message TEXT NOT NULL,
          stack_trace TEXT NULL,
          url TEXT NULL,
          user_agent TEXT NULL,
          ip_address VARCHAR(45) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_error_logs_created_at (created_at),
          INDEX idx_error_logs_role (role),
          INDEX idx_error_logs_feature (feature_name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        $input = [];
    }

    $errorMessage = trim((string)($input['error_message'] ?? $input['message'] ?? ''));
    if ($errorMessage === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Error message required']);
        exit();
    }

    $featureName = trim((string)($input['feature_name'] ?? $input['feature'] ?? 'General'));
    $stackTrace = isset($input['stack_trace']) ? (string)$input['stack_trace'] : (isset($input['stack']) ? (string)$input['stack'] : null);
    $url = isset($input['url']) ? (string)$input['url'] : ($_SERVER['HTTP_REFERER'] ?? null);

    // Try extracting auth token payload if available
    $userId = null;
    $username = null;
    $role = 'guest';

    $tokens = auth_get_bearer_tokens();
    if (count($tokens) > 0) {
        foreach ($tokens as $t) {
            $verify = auth_verify_token_detailed($t);
            if ($verify['ok'] ?? false) {
                $payload = $verify['payload'] ?? [];
                $userId = $payload['sub'] ?? null;
                $username = $payload['username'] ?? null;
                $pRole = $payload['role'] ?? 'guest';
                if (in_array($pRole, ['student', 'admin', 'developer'], true)) {
                    $role = $pRole;
                }
                break;
            }
        }
    }

    // Override role if passed in payload and user is guest
    if ($role === 'guest' && isset($input['role'])) {
        $r = trim((string)$input['role']);
        if (in_array($r, ['student', 'admin', 'developer', 'guest'], true)) {
            $role = $r;
        }
    }

    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
    $logId = generate_uuid4();

    $stmt = $pdo->prepare('
        INSERT INTO system_error_logs 
        (id, user_id, username, role, feature_name, error_message, stack_trace, url, user_agent, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ');
    $stmt->execute([
        $logId,
        $userId,
        $username,
        $role,
        $featureName,
        $errorMessage,
        $stackTrace,
        $url,
        $userAgent,
        $ipAddress,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Error log saved',
        'data' => [
            'id' => $logId,
            'feature' => $featureName,
            'role' => $role,
        ],
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save error log: ' . $e->getMessage(),
    ]);
}
