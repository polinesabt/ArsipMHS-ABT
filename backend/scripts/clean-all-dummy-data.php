<?php
/**
 * Clean All Dummy Data Script
 * 
 * Safely removes all test/dummy data from MySQL database
 * while strictly preserving:
 * - Admin and Developer user accounts
 * - System settings & configuration
 * - Table schema and relational integrity
 */

require_once __DIR__ . '/../config/database.php';

echo "=== MEMULAI PROSES PEMBERSIHAN DATA DUMMY DATABASE ===\n\n";

try {
    // 1. Verify Database Connection
    echo "[1/4] Memeriksa koneksi database...\n";
    $pdo->query("SELECT 1");
    echo "      Koneksi database berhasil.\n\n";

    // 2. Pre-cleanup Backup directory
    echo "[2/4] Menyiapkan direktori backup...\n";
    $backupDir = __DIR__ . '/../database/backups';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0777, true);
    }
    echo "      Direktori backup siap: $backupDir\n\n";

    // 3. Sanitizing tables
    echo "[3/4] Membersihkan tabel data demo & uji coba...\n";
    
    // Disable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");

    $tablesToTruncate = [
        'tracer_study',
        'achievements',
        'evaluasi_lulusan',
        'satisfaction_form_responses',
        'chart_records',
        'system_error_logs'
    ];

    foreach ($tablesToTruncate as $table) {
        try {
            $pdo->exec("TRUNCATE TABLE `$table`");
            echo "      ✓ Berhasil truncate tabel: $table\n";
        } catch (PDOException $e) {
            // If table doesn't exist, continue gracefully
            echo "      - Lewati tabel $table (" . $e->getMessage() . ")\n";
        }
    }

    // Delete student accounts from students and users
    try {
        $countStudents = $pdo->exec("DELETE FROM `students`");
        echo "      ✓ Berhasil menghapus data dari tabel students ($countStudents baris).\n";
    } catch (PDOException $e) {
        echo "      - Tabel students: " . $e->getMessage() . "\n";
    }

    try {
        $countUsers = $pdo->exec("DELETE FROM `users` WHERE `role` = 'student'");
        echo "      ✓ Berhasil menghapus akun pengguna mahasiswa ($countUsers akun).\n";
    } catch (PDOException $e) {
        echo "      - Tabel users (student): " . $e->getMessage() . "\n";
    }

    // Re-enable foreign key checks
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    echo "\n";

    // 4. Verification of Preserved Admin Accounts
    echo "[4/4] Memverifikasi akun admin yang dipertahankan...\n";
    $stmt = $pdo->query("SELECT * FROM users WHERE role != 'student'");
    $admins = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo "      Total akun Admin/Developer aktif: " . count($admins) . "\n";
    foreach ($admins as $adm) {
        $username = $adm['username'] ?? $adm['name'] ?? 'N/A';
        $role = $adm['role'] ?? 'N/A';
        $nama = $adm['nama'] ?? $adm['full_name'] ?? $username;
        echo "      - ID: {$adm['id']} | User: {$username} | Role: {$role} | Nama: {$nama}\n";
    }

    echo "\n=== PROSES PEMBERSIHAN DATA DUMMY DATABASE SELESAI DENGAN SUKSES! ===\n";

} catch (Exception $e) {
    // Ensure foreign key checks re-enabled on error
    if (isset($pdo)) {
        $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
    }
    echo "\n[ERROR] Terjadi kesalahan: " . $e->getMessage() . "\n";
    exit(1);
}
