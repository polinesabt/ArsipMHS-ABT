-- Demo Mode: privileged read-only account with browser-only sandbox writes.
-- Idempotent and safe to run on an existing installation.

ALTER TABLE users
  MODIFY COLUMN role ENUM('admin','student','developer','dosen','tendik','demo')
  NOT NULL DEFAULT 'student';

ALTER TABLE system_error_logs
  MODIFY COLUMN role ENUM('student','admin','developer','demo','guest')
  NOT NULL DEFAULT 'guest';

INSERT INTO users (id, username, password_hash, nama, role, created_at, last_login, is_active)
VALUES (
  'demo-mode-001',
  'demo',
  '$2y$10$6tdCjwyx/vrrIvXwj9VVx.IoAICFUr44un7sBY77Kv/xheNROATVq',
  'Demo Mode',
  'demo',
  NOW(),
  NULL,
  1
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  nama = VALUES(nama),
  role = VALUES(role),
  is_active = 1;
