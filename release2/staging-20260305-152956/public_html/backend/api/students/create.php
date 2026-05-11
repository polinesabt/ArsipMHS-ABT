<?php
require_once __DIR__ . '/../../config/cors.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (
        !$input ||
        !isset($input['nim']) ||
        !isset($input['nama']) ||
        !isset($input['password']) ||
        !isset($input['status']) ||
        !isset($input['tahun_masuk'])
    ) {
        throw new Exception('nim, nama, password, status, dan tahun_masuk diperlukan');
    }
    
    $nim = trim($input['nim']);
    $nama = trim($input['nama']);
    $password = $input['password'];
    $status = $input['status'];
    $tahun_masuk = (int)$input['tahun_masuk'];
    $tahun_lulus = isset($input['tahun_lulus']) ? (int)$input['tahun_lulus'] : null;
    $email = $input['email'] ?? null;
    $no_hp = $input['no_hp'] ?? null;
    $alamat = $input['alamat'] ?? null;
    $jurusan = $input['jurusan'] ?? 'Administrasi Bisnis';
    $prodi = $input['prodi'] ?? 'Administrasi Bisnis Terapan';
    
    if (strlen($nim) < 4) {
        throw new Exception('NIM tidak valid');
    }
    if (strlen($password) < 6) {
        throw new Exception('Password minimal 6 karakter');
    }
    
    $pdo->beginTransaction();
    
    // Check duplicate NIM or email
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM students WHERE nim = ?');
    $stmt->execute([$nim]);
    if ($stmt->fetchColumn() > 0) {
        $pdo->rollBack();
        throw new Exception('NIM sudah terdaftar');
    }
    
    if ($email) {
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM students WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() > 0) {
            $pdo->rollBack();
            throw new Exception('Email sudah terdaftar');
        }
    }
    
    $user_id = bin2hex(random_bytes(18));
    $student_id = bin2hex(random_bytes(18));
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    // Create user
    $stmt = $pdo->prepare('
        INSERT INTO users (id, username, password_hash, nama, role, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    ');
    $stmt->execute([$user_id, $nim, $password_hash, $nama, 'student']);
    
    // Create student profile
    $stmt = $pdo->prepare('
        INSERT INTO students (
            id, nim, nama, jurusan, prodi, status, tahun_masuk, tahun_lulus,
            email, no_hp, alamat, user_id, has_credentials, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW()
        )
    ');
    $stmt->execute([
        $student_id,
        $nim,
        $nama,
        $jurusan,
        $prodi,
        $status,
        $tahun_masuk,
        $tahun_lulus,
        $email,
        $no_hp,
        $alamat,
        $user_id
    ]);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $student_id,
            'nim' => $nim,
            'nama' => $nama,
            'jurusan' => $jurusan,
            'prodi' => $prodi,
            'status' => $status,
            'tahun_masuk' => $tahun_masuk,
            'tahun_lulus' => $tahun_lulus,
            'email' => $email,
            'no_hp' => $no_hp,
            'alamat' => $alamat,
            'user_id' => $user_id,
            'has_credentials' => true
        ],
        'message' => 'Mahasiswa berhasil ditambahkan'
    ]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
