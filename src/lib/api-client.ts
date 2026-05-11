/**
 * API Client - Centralized HTTP client for all API requests
 * Handles authentication, error handling, and request/response transformations
 */

/** Base path dari Vite (tanpa trailing slash): "" atau "/Arsipmhs2". */
const getBasePath = (): string => (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

/** URL API: dari VITE_API_BASE_URL (build) atau fallback origin + base path. */
export const getApiBaseUrl = (): string => {
  const envApiBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
  if (typeof window === 'undefined') return envApiBase;

  const origin = window.location.origin;
  const hostname = window.location.hostname.toLowerCase();
  const basePath = getBasePath();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDevServer = isLocalhost && /^https?:\/\/(localhost|127\.0\.0\.1):8080$/i.test(origin);

  if (isDevServer) return `${origin}/api`;
  if (envApiBase) return envApiBase;
  return `${origin}${basePath}/backend/api`;
};
const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT, 10) : 10000;
const AUTH_INVALIDATION_CODES = new Set([
  'AUTH_TOKEN_MALFORMED',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID_SIGNATURE',
  'AUTH_TOKEN_MISSING',
]);

/** 401 from these endpoints will not trigger global logout (e.g. dashboard chart; admin stays logged in) */
const IGNORE_LOGOUT_ENDPOINTS = new Set([
  'insight/stats.php',
  'achievements/stats.php',
  'insight/records.php',
]);

/** Endpoint dashboard chart yang boleh retry auth sekali lagi untuk meredam race antar-request */
const TRANSIENT_AUTH_RETRY_ENDPOINTS = new Set([
  'insight/stats.php',
  'achievements/stats.php',
  'insight/records.php',
]);

const UNAUTHORIZED_LOGOUT_DELAY_MS = 400;

let pendingUnauthorizedLogoutId: ReturnType<typeof setTimeout> | null = null;

function cancelPendingUnauthorizedLogout(): void {
  if (pendingUnauthorizedLogoutId !== null) {
    clearTimeout(pendingUnauthorizedLogoutId);
    pendingUnauthorizedLogoutId = null;
  }
}

function scheduleUnauthorizedLogout(client: ApiClient, endpoint?: string): void {
  cancelPendingUnauthorizedLogout();
  pendingUnauthorizedLogoutId = setTimeout(() => {
    pendingUnauthorizedLogoutId = null;
    client.clearToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { endpoint } }));
    }
  }, UNAUTHORIZED_LOGOUT_DELAY_MS);
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  code?: string;
}

const REFRESH_TOKEN_KEY = 'refreshToken';
const REFRESH_ENDPOINT = 'auth/refresh.php';

/** Detik sebelum expiry di mana kita refresh token proaktif */
const REFRESH_BEFORE_EXPIRY_SEC = 5 * 60; // 5 menit

/**
 * Ambil klaim exp dari JWT (tanpa verifikasi) untuk cek kadaluarsa.
 */
function getJwtExp(token: string | null): number | null {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
    const json = atob(padded);
    const obj = JSON.parse(json) as { exp?: number };
    return typeof obj.exp === 'number' ? obj.exp : null;
  } catch {
    return null;
  }
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private token: string | null = null;
  private refreshPromise: Promise<{ token: string; refreshToken: string } | null> | null = null;

  constructor(baseURL: string = API_BASE_URL, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) this.token = savedToken;
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return this.token;
  }

  setRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  getRefreshToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  }

  /**
   * Clear only refresh token (e.g. when rotating fails)
   */
  clearRefreshToken(): void {
    if (typeof window !== 'undefined') localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Build headers dengan authentication
   */
  private buildHeaders(
    headers: Record<string, string> = {},
    tokenOverride?: string | null,
    includeJsonContentType: boolean = true
  ): Record<string, string> {
    const defaultHeaders: Record<string, string> = {};

    if (includeJsonContentType) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const activeToken = tokenOverride !== undefined ? tokenOverride : this.token;
    if (activeToken) {
      defaultHeaders['Authorization'] = `Bearer ${activeToken}`;
      // Fallback agar backend tetap dapat token jika Apache/proxy strip header Authorization
      defaultHeaders['X-Auth-Token'] = activeToken;
    }

    return { ...defaultHeaders, ...headers };
  }

  /**
   * Call refresh endpoint (raw fetch). Returns new access + refresh or null.
   * Single in-flight refresh shared across concurrent 401s.
   */
  private async tryRefreshAndGetNewTokens(): Promise<{ token: string; refreshToken: string } | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;
    if (this.refreshPromise) return this.refreshPromise;
    this.refreshPromise = (async () => {
      try {
        const url = `${this.baseURL}/${REFRESH_ENDPOINT}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success && data?.data?.token) {
          return {
            token: data.data.token,
            refreshToken: data.data.refreshToken ?? data.data.token,
          };
        }
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();
    return this.refreshPromise;
  }

  /**
   * Make HTTP request dengan timeout. On 401 auth error, tries refresh once and retries.
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string | number | boolean>;
      /** Override timeout untuk request ini (ms). Berguna untuk operasi lama seperti kirim notifikasi banyak. */
      timeout?: number;
      _retriedAfterRefresh?: boolean;
      _retriedWithLatestToken?: boolean;
      _retriedTransientAuth?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { _retriedAfterRefresh, _retriedWithLatestToken, _retriedTransientAuth, timeout: requestTimeout, ...requestOptions } = options;
    const effectiveTimeout = requestTimeout ?? this.timeout;
    const url = new URL(`${this.baseURL}/${endpoint}`);
    // Browser: localStorage jadi single source of truth agar token in-memory tidak usang.
    let tokenAtRequestStart: string | null =
      typeof window !== 'undefined'
        ? localStorage.getItem('authToken')
        : (this.token ?? null);
    this.token = tokenAtRequestStart;

    // Refresh proaktif jika token akan kadaluarsa dalam 5 menit (agar tidak pernah kirim token expired)
    if (
      tokenAtRequestStart &&
      this.getRefreshToken() &&
      endpoint !== REFRESH_ENDPOINT &&
      !_retriedAfterRefresh
    ) {
      const exp = getJwtExp(tokenAtRequestStart);
      const now = Math.floor(Date.now() / 1000);
      if (exp != null && exp - now < REFRESH_BEFORE_EXPIRY_SEC) {
        const newTokens = await this.tryRefreshAndGetNewTokens();
        if (newTokens) {
          this.setToken(newTokens.token);
          this.setRefreshToken(newTokens.refreshToken);
          tokenAtRequestStart = newTokens.token;
        }
      }
    }

    if (requestOptions.params) {
      Object.entries(requestOptions.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

    const isSurveyEndpoint = endpoint === 'evaluations/survey.php' || url.toString().includes('survey.php');
    const fetchInit: RequestInit = {
      method,
      headers: this.buildHeaders(
        requestOptions.headers,
        tokenAtRequestStart,
        requestOptions.body !== undefined
      ),
      body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
      signal: controller.signal,
    };
    if (method === 'GET' && isSurveyEndpoint) {
      fetchInit.cache = 'no-store';
    }

    try {
      const response = await fetch(url.toString(), fetchInit);

      clearTimeout(timeoutId);

      // Handle response: baca body sebagai text dulu agar bisa deteksi HTML (error PHP)
      const contentType = response.headers.get('content-type');
      const rawText = await response.text();

      let data: unknown;
      if (contentType?.includes('application/json')) {
        const trimmed = rawText.trim();
        if (trimmed.startsWith('<')) {
          // Server mengembalikan HTML (biasanya error PHP), bukan JSON
          data = {
            success: false,
            error: 'Server mengembalikan respons bukan JSON (mungkin error PHP). Periksa log server.',
            code: 'INVALID_JSON_RESPONSE',
          };
        } else {
          try {
            data = JSON.parse(rawText);
          } catch {
            data = {
              success: false,
              error: 'Respons server tidak valid (bukan JSON).',
              code: 'INVALID_JSON_RESPONSE',
            };
          }
        }
      } else {
        data = rawText;
      }

      // Check if response is successful
      if (!response.ok) {
        const dataRecord =
          typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>)
            : null;
        const errorCode =
          dataRecord && typeof dataRecord.code === 'string'
            ? dataRecord.code
            : undefined;

        const isAuth401 =
          response.status === 401 &&
          typeof errorCode === 'string' &&
          AUTH_INVALIDATION_CODES.has(errorCode) &&
          Boolean(tokenAtRequestStart);

        // Saat request paralel, token bisa sudah dirotasi oleh request lain.
        // Coba sekali lagi dengan token terbaru sebelum memaksa refresh token.
        if (isAuth401 && !_retriedWithLatestToken) {
          const latestToken =
            typeof window !== 'undefined' ? localStorage.getItem('authToken') : this.token;
          if (latestToken && latestToken !== tokenAtRequestStart) {
            this.token = latestToken;
            cancelPendingUnauthorizedLogout();
            return this.makeRequest<T>(method, endpoint, {
              ...requestOptions,
              timeout: requestTimeout,
              _retriedAfterRefresh,
              _retriedWithLatestToken: true,
            });
          }
        }

        if (
          isAuth401 &&
          !_retriedAfterRefresh &&
          this.getRefreshToken() &&
          endpoint !== REFRESH_ENDPOINT
        ) {
          const newTokens = await this.tryRefreshAndGetNewTokens();
          if (newTokens) {
            this.setToken(newTokens.token);
            this.setRefreshToken(newTokens.refreshToken);
            cancelPendingUnauthorizedLogout();
            return this.makeRequest<T>(method, endpoint, {
              ...requestOptions,
              timeout: requestTimeout,
              _retriedAfterRefresh: true,
              _retriedWithLatestToken,
              _retriedTransientAuth,
            });
          }
        }

        // Retry sekali lagi khusus endpoint chart untuk meredam 401 transient akibat race/concurrency.
        if (
          isAuth401 &&
          TRANSIENT_AUTH_RETRY_ENDPOINTS.has(endpoint) &&
          !_retriedTransientAuth
        ) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          const latestToken =
            typeof window !== 'undefined' ? localStorage.getItem('authToken') : this.token;
          this.token = latestToken ?? null;
          cancelPendingUnauthorizedLogout();
          return this.makeRequest<T>(method, endpoint, {
            ...requestOptions,
            timeout: requestTimeout,
            _retriedAfterRefresh,
            _retriedWithLatestToken,
            _retriedTransientAuth: true,
          });
        }

        if (isAuth401) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              'lastUnauthorizedEvent',
              JSON.stringify({
                endpoint,
                status: response.status,
                code: errorCode,
                at: new Date().toISOString(),
              })
            );
          }
          if (!IGNORE_LOGOUT_ENDPOINTS.has(endpoint)) {
            scheduleUnauthorizedLogout(this, endpoint);
          }
        }

        return {
          success: false,
          error: dataRecord && typeof dataRecord.error === 'string'
            ? dataRecord.error
            : `HTTP Error: ${response.status}`,
          message: dataRecord && typeof dataRecord.message === 'string'
            ? dataRecord.message
            : undefined,
          code: errorCode,
        };
      }

      // Request sukses: batalkan jadwal logout yang dipicu 401 dari request lain (race)
      cancelPendingUnauthorizedLogout();

      // Return formatted response
      return typeof data === 'object' && data !== null
        ? (data as ApiResponse<T>)
        : {
            success: true,
            data: data as T,
          };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: `Request timeout after ${effectiveTimeout}ms`,
        };
      }

      // Handle network errors
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<Parameters<typeof this.makeRequest>[2], 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: unknown, options?: Omit<Parameters<typeof this.makeRequest>[2], 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: unknown, options?: Omit<Parameters<typeof this.makeRequest>[2], 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<Parameters<typeof this.makeRequest>[2], 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, options);
  }
}

// Export default instance
export const apiClient = new ApiClient();
