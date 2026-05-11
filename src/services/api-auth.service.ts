/**
 * API Authentication Service
 * Handles all authentication operations via API
 */

import { apiClient, ApiResponse } from '@/lib/api-client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'student';
  email?: string;
  name?: string;
  nama?: string;
  student?: StudentData;
}

export interface StudentData {
  id: string;
  nim: string;
  nama: string;
  jurusan?: string;
  prodi?: string;
  status?: string;
  tahun_masuk?: number;
  tahun_lulus?: number | null;
  email?: string | null;
  login_email?: string | null;
  pending_login_email?: string | null;
  is_email_login_enabled?: boolean | number;
  email_verified_at?: string | null;
  is_first_login?: boolean;
  no_hp?: string | null;
  alamat?: string | null;
  has_credentials?: boolean | number;
  last_login?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  user: AuthUser;
  role: 'admin' | 'student';
  student?: StudentData;
  token?: string;
  jwt?: string;
  refreshToken?: string;
}

export type EmailLoginSource = 'dashboard' | 'career_form' | 'future_form';

export interface EmailLoginRequestPayload {
  email?: string;
  source?: EmailLoginSource;
}

export interface EmailLoginRequestResponse {
  requested_email: string;
  login_email?: string | null;
  pending_login_email?: string | null;
  is_email_login_enabled: boolean;
  email_verified_at?: string | null;
  expires_at?: string | null;
  cooldown_seconds: number;
  source: EmailLoginSource;
  debug_verification_url?: string | null;
}

export interface EmailLoginVerifyResponse {
  login_email: string;
  is_email_login_enabled: boolean;
  email_verified_at?: string | null;
}

/**
 * Login sebagai Admin via API
 */
export async function loginAdmin(
  username: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<LoginResponse>('auth/login.php', {
    username,
    password,
    role: 'admin',
  });

  if (response.success && response.data) {
    const token = response.data.jwt || response.data.token;
    if (token) {
      apiClient.setToken(token);
      if (response.data.refreshToken) apiClient.setRefreshToken(response.data.refreshToken);
    }
  }

  return response;
}

/**
 * Login sebagai Student via API
 */
export async function loginStudent(
  username: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<LoginResponse>('auth/login.php', {
    username,
    password,
    role: 'student',
  });

  if (response.success && response.data) {
    const token = response.data.jwt || response.data.token;
    if (token) {
      apiClient.setToken(token);
      if (response.data.refreshToken) apiClient.setRefreshToken(response.data.refreshToken);
    }
  }

  return response;
}

/**
 * Login satu form: username/NIM + password, tanpa role.
 * Backend mengembalikan role (admin/student); gunakan untuk redirect.
 * Username case-insensitive, boleh huruf atau angka.
 */
export async function login(
  identifier: string,
  password: string
): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<LoginResponse>('auth/login.php', {
    username: identifier.trim(),
    password,
  });

  if (response.success && response.data) {
    const token = response.data.jwt || response.data.token;
    if (token) {
      apiClient.setToken(token);
      if (response.data.refreshToken) apiClient.setRefreshToken(response.data.refreshToken);
    }
  }

  return response;
}

/**
 * Logout - clear authentication (access + refresh token)
 */
export function logout(): void {
  apiClient.clearToken();
  localStorage.removeItem('currentUser');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!apiClient.getToken();
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser(): AuthUser | null {
  const user = localStorage.getItem('currentUser');
  if (user) {
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Set current user in localStorage
 */
export function setCurrentUser(user: AuthUser): void {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Request email login activation link (student auth required)
 */
export async function requestEmailLoginVerification(
  payload: EmailLoginRequestPayload
): Promise<ApiResponse<EmailLoginRequestResponse>> {
  return apiClient.post<EmailLoginRequestResponse>('auth/email_login/request_verification.php', payload);
}

/**
 * Verify email login by token (link) or OTP. Public when using token; requires auth when using otp.
 */
export async function verifyEmailLogin(payload: {
  token?: string;
  otp?: string;
}): Promise<ApiResponse<EmailLoginVerifyResponse>> {
  return apiClient.post<EmailLoginVerifyResponse>('auth/email_login/verify.php', payload);
}

/**
 * Verify email login token from link (public endpoint)
 */
export async function verifyEmailLoginToken(
  token: string
): Promise<ApiResponse<EmailLoginVerifyResponse>> {
  return verifyEmailLogin({ token });
}
