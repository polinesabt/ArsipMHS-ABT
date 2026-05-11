-- Add OTP hash column for email login verification (link + OTP option).
ALTER TABLE students
  ADD COLUMN email_verification_otp_hash CHAR(64) NULL COMMENT 'SHA-256 hash of 6-digit OTP' AFTER email_verification_sent_at,
  ADD INDEX idx_email_verification_otp_hash (email_verification_otp_hash);
