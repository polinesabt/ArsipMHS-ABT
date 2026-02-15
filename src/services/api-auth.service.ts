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
