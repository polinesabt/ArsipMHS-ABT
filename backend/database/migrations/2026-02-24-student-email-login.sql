-- Email login tambahan untuk mahasiswa (soft onboarding, verifikasi link).
-- Menambah kolom kredensial email login terpisah dari email kontak.

ALTER TABLE students
  ADD COLUMN login_email VARCHAR(100) NULL AFTER email,
  ADD COLUMN pending_login_email VARCHAR(100) NULL AFTER login_email,
  ADD COLUMN is_email_login_enabled BOOLEAN NOT NULL DEFAULT 0 AFTER pending_login_email,
  ADD COLUMN email_verified_at TIMESTAMP NULL AFTER is_email_login_enabled,
  ADD COLUMN email_verification_token_hash CHAR(64) NULL AFTER email_verified_at,
  ADD COLUMN email_verification_expires_at DATETIME NULL AFTER email_verification_token_hash,
  ADD COLUMN email_verification_sent_at DATETIME NULL AFTER email_verification_expires_at,
  ADD UNIQUE KEY uq_students_login_email (login_email),
  ADD INDEX idx_students_pending_login_email (pending_login_email),
  ADD INDEX idx_students_email_verification_token_hash (email_verification_token_hash);
