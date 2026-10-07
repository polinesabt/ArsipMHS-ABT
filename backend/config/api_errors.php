<?php

function api_exception_status(Throwable $error): int {
    if ($error instanceof PDOException) {
        return 500;
    }
    $current = (int)http_response_code();
    if ($current >= 400 && $current < 500) {
        return $current;
    }
    if ($error instanceof InvalidArgumentException) {
        return 400;
    }
    $message = mb_strtolower($error->getMessage());
    if (preg_match('/tidak ditemukan|not found/', $message)) {
        return 404;
    }
    if (preg_match('/akses ditolak|tidak berhak|forbidden|permission/', $message)) {
        return 403;
    }
    if (preg_match('/diperlukan|wajib|tidak valid|invalid|kosong|format|terlalu besar|tidak boleh|harus|melebihi|belum diisi/', $message)) {
        return 400;
    }
    return 500;
}

function api_public_error(Throwable $error): string {
    if ((int)http_response_code() >= 500) {
        error_log('API_ERROR ' . get_class($error) . ': ' . $error->getMessage());
        return 'Terjadi kesalahan server';
    }
    return $error->getMessage();
}
