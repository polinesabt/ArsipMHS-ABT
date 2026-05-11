-- =====================================================================
-- Seed: Evaluasi Lulusan (respons + rating) + Mahasiswa Aktif
-- Agar chart Kepuasan Pengguna & Mahasiswa Aktif terisi
-- =====================================================================
-- Jalankan setelah install.sql dan seed-10-mahasiswa.sql
-- =====================================================================

USE arsipmhs;

SET NAMES utf8mb4;

SET @pwd_student = '$2y$10$q9MR0ZYrGD6LVKDyJvQ9O.uHKrfVzLZCZcKDLVrfYqPdLLDzAFJnG';

-- =====================================================================
-- 1. EVALUASI (1 campaign + 3 undangan + 3 respons + 30 rating)
-- =====================================================================
INSERT INTO evaluations (id, title, short_message, status, start_at, end_at, reminder_enabled, reminder_interval_days, created_by, created_at, updated_at) VALUES
('ev-1', 'Evaluasi Kepuasan Lulusan 2024', 'Mohon mengisi survey kepuasan untuk perbaikan prodi.', 'active', '2024-09-01 00:00:00', '2025-12-31 23:59:59', TRUE, 7, 'admin-001', NOW(), NOW());

INSERT INTO evaluation_invitations (id, evaluation_id, student_id, access_token, first_sent_at, last_sent_at, send_count, submitted_at, created_by, created_at, updated_at) VALUES
('inv-1', 'ev-1', 'm1', 'token-m1-abc123', NOW(), NOW(), 1, NOW(), 'admin-001', NOW(), NOW()),
('inv-2', 'ev-1', 'm2', 'token-m2-def456', NOW(), NOW(), 1, NOW(), 'admin-001', NOW(), NOW()),
('inv-3', 'ev-1', 'm3', 'token-m3-ghi789', NOW(), NOW(), 1, NOW(), 'admin-001', NOW(), NOW());

INSERT INTO evaluation_responses (id, evaluation_id, invitation_id, student_id, company_name, company_address, employee_name, graduation_year, study_program, current_work_division, major_job_match, submitted_at, created_at) VALUES
('resp-1', 'ev-1', 'inv-1', 'm1', 'PT Bank Mandiri', 'Jakarta', 'Andi Wijaya', 2024, 'Administrasi Bisnis Terapan', 'Operasional', 'ya', NOW(), NOW()),
('resp-2', 'ev-1', 'inv-2', 'm2', 'PT Telkom Indonesia', 'Bandung', 'Bella Kusuma', 2024, 'Administrasi Bisnis Terapan', 'Customer Service', 'ya', NOW(), NOW()),
('resp-3', 'ev-1', 'inv-3', 'm3', 'PT Astra International', 'Jakarta', 'Cahyo Pratama', 2024, 'Administrasi Bisnis Terapan', 'Sales Admin', 'ya', NOW(), NOW());

-- Rating per aspek (1-5). Beri nilai 4-5 agar rata-rata terlihat (asp-001 s/d asp-010)
INSERT INTO evaluation_response_ratings (id, response_id, aspect_id, score, created_at) VALUES
('rr-1-1', 'resp-1', 'asp-001', 5, NOW()), ('rr-1-2', 'resp-1', 'asp-002', 5, NOW()), ('rr-1-3', 'resp-1', 'asp-003', 4, NOW()), ('rr-1-4', 'resp-1', 'asp-004', 5, NOW()), ('rr-1-5', 'resp-1', 'asp-005', 5, NOW()),
('rr-1-6', 'resp-1', 'asp-006', 4, NOW()), ('rr-1-7', 'resp-1', 'asp-007', 5, NOW()), ('rr-1-8', 'resp-1', 'asp-008', 5, NOW()), ('rr-1-9', 'resp-1', 'asp-009', 4, NOW()), ('rr-1-10', 'resp-1', 'asp-010', 5, NOW()),
('rr-2-1', 'resp-2', 'asp-001', 4, NOW()), ('rr-2-2', 'resp-2', 'asp-002', 4, NOW()), ('rr-2-3', 'resp-2', 'asp-003', 4, NOW()), ('rr-2-4', 'resp-2', 'asp-004', 5, NOW()), ('rr-2-5', 'resp-2', 'asp-005', 4, NOW()),
('rr-2-6', 'resp-2', 'asp-006', 5, NOW()), ('rr-2-7', 'resp-2', 'asp-007', 4, NOW()), ('rr-2-8', 'resp-2', 'asp-008', 4, NOW()), ('rr-2-9', 'resp-2', 'asp-009', 5, NOW()), ('rr-2-10', 'resp-2', 'asp-010', 4, NOW()),
('rr-3-1', 'resp-3', 'asp-001', 5, NOW()), ('rr-3-2', 'resp-3', 'asp-002', 5, NOW()), ('rr-3-3', 'resp-3', 'asp-003', 5, NOW()), ('rr-3-4', 'resp-3', 'asp-004', 4, NOW()), ('rr-3-5', 'resp-3', 'asp-005', 5, NOW()),
('rr-3-6', 'resp-3', 'asp-006', 4, NOW()), ('rr-3-7', 'resp-3', 'asp-007', 5, NOW()), ('rr-3-8', 'resp-3', 'asp-008', 5, NOW()), ('rr-3-9', 'resp-3', 'asp-009', 4, NOW()), ('rr-3-10', 'resp-3', 'asp-010', 5, NOW());

-- =====================================================================
-- 2. MAHASISWA AKTIF (2 orang agar chart Mahasiswa Aktif terisi)
-- =====================================================================
INSERT INTO users (id, username, password_hash, nama, role, created_at, is_active) VALUES
('u-aktif1', '20210010', @pwd_student, 'Kartika Sari', 'student', NOW(), TRUE),
('u-aktif2', '20220015', @pwd_student, 'Lutfi Rahman', 'student', NOW(), TRUE);

INSERT INTO students (id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus, email, no_hp, user_id, has_credentials, created_at, updated_at) VALUES
('aktif1', '20210010', 'Kartika Sari', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2021, NULL, 'kartika.sari@student.polines.ac.id', '081234560020', 'u-aktif1', TRUE, NOW(), NOW()),
('aktif2', '20220015', 'Lutfi Rahman', 'Administrasi Bisnis', 'Administrasi Bisnis Terapan', 'active', 2022, NULL, 'lutfi.rahman@student.polines.ac.id', '081234560021', 'u-aktif2', TRUE, NOW(), NOW());
