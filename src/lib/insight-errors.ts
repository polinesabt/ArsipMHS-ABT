/**
 * Pesan error ramah untuk section insight.
 * Menyembunyikan pesan teknis "token tidak valid/kadaluarsa" dan mengganti dengan instruksi yang jelas.
 */

const AUTH_ERROR_PATTERNS = [
  'token tidak valid',
  'token tidak ditemukan',
  'kadaluarsa',
  'expired',
  'invalid_signature',
  'AUTH_TOKEN',
];

const FRIENDLY_SESSION_MESSAGE =
  'Sesi berakhir. Silakan muat ulang halaman atau keluar lalu masuk kembali.';

/**
 * Jika error dari backend berisi pesan auth/token, kembalikan pesan ramah.
 * Selain itu kembalikan fallback atau error asli.
 */
export function getInsightErrorMessage(
  error: string | undefined,
  fallback = 'Gagal memuat data'
): string {
  if (!error || typeof error !== 'string') return fallback;
  const lower = error.toLowerCase();
  const isAuthError = AUTH_ERROR_PATTERNS.some((p) => lower.includes(p.toLowerCase()));
  return isAuthError ? FRIENDLY_SESSION_MESSAGE : (error || fallback);
}
