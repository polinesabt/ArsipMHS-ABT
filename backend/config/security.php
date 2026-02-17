<?php
/**
 * Security Configuration & Helper Functions
 * 
 * Provides security headers, input sanitization, and validation helpers
 */

/**
 * Set security headers untuk production
 */
function setSecurityHeaders() {
    // Content Security Policy (CSP)
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;");
    
    // X-Frame-Options: Prevent clickjacking
    header("X-Frame-Options: DENY");
    
    // X-Content-Type-Options: Prevent MIME type sniffing
    header("X-Content-Type-Options: nosniff");
    
    // X-XSS-Protection: Enable XSS filter
    header("X-XSS-Protection: 1; mode=block");
    
    // Referrer-Policy: Control referrer information
    header("Referrer-Policy: strict-origin-when-cross-origin");
    
    // Permissions-Policy: Control browser features
    header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
}

/**
 * Sanitize string input
 */
function sanitizeInput($input, $type = 'string') {
    if ($input === null) {
        return null;
    }
    
    switch ($type) {
        case 'string':
            return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
        case 'email':
            $email = filter_var(trim($input), FILTER_SANITIZE_EMAIL);
            return filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : null;
        case 'int':
            return filter_var($input, FILTER_SANITIZE_NUMBER_INT);
        case 'float':
            return filter_var($input, FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
        case 'url':
            return filter_var(trim($input), FILTER_SANITIZE_URL);
        default:
            return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}

/**
 * Validate email format
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate NIM format (8 digits)
 */
function validateNIM($nim) {
    return preg_match('/^\d{8}$/', $nim) === 1;
}

/**
 * Validate phone number (Indonesian format)
 */
function validatePhone($phone) {
    // Remove spaces and dashes
    $phone = preg_replace('/[\s\-]/', '', $phone);
    // Check if it's 10-13 digits
    return preg_match('/^(\+62|62|0)[0-9]{9,12}$/', $phone) === 1;
}

/**
 * Rate limiting helper (simple in-memory, untuk production gunakan Redis/Memcached)
 */
class SimpleRateLimiter {
    private static $attempts = [];
    private static $maxAttempts = 5;
    private static $windowSeconds = 300; // 5 minutes
    
    public static function check($identifier, $maxAttempts = null, $windowSeconds = null) {
        $maxAttempts = $maxAttempts ?? self::$maxAttempts;
        $windowSeconds = $windowSeconds ?? self::$windowSeconds;
        
        $now = time();
        $key = md5($identifier);
        
        // Clean old entries
        if (isset(self::$attempts[$key])) {
            self::$attempts[$key] = array_filter(
                self::$attempts[$key],
                function($timestamp) use ($now, $windowSeconds) {
                    return ($now - $timestamp) < $windowSeconds;
                }
            );
        } else {
            self::$attempts[$key] = [];
        }
        
        // Check if limit exceeded
        if (count(self::$attempts[$key]) >= $maxAttempts) {
            return false;
        }
        
        // Record attempt
        self::$attempts[$key][] = $now;
        return true;
    }
    
    public static function reset($identifier) {
        $key = md5($identifier);
        unset(self::$attempts[$key]);
    }
}

/**
 * Get client IP address
 */
function getClientIP() {
    $ipKeys = ['HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR'];
    foreach ($ipKeys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (explode(',', $_SERVER[$key]) as $ip) {
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}
?>
