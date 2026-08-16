-- =====================================================================
-- KODE SQL: PEMBUATAN / PEMBARUAN AKUN DEVELOPER PRODUCTION
-- =====================================================================
-- Username : developer
-- Password : developer123
-- Role     : developer
-- =====================================================================

SET NAMES utf8mb4;

-- 1. Pastikan kolom ENUM role pada tabel users mendukung role 'developer'
ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'student', 'developer') NOT NULL DEFAULT 'student';

-- 2. Insert atau Update akun Developer
INSERT INTO users (
  id, 
  username, 
  password_hash, 
  nama, 
  role, 
  is_active, 
  created_at
) 
VALUES (
  'dev-001', 
  'developer', 
  '$2y$10$lc6YKf0TaUxWp6UGW2JG5OKBkfyhd6S2/mpsZe9yS6rgnQ8OXezUi', 
  'Developer System', 
  'developer', 
  1, 
  NOW()
)
ON DUPLICATE KEY UPDATE 
  password_hash = '$2y$10$lc6YKf0TaUxWp6UGW2JG5OKBkfyhd6S2/mpsZe9yS6rgnQ8OXezUi',
  nama = 'Developer System',
  role = 'developer',
  is_active = 1;
