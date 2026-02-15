/**
 * API Client - Centralized HTTP client for all API requests
 * Handles authentication, error handling, and request/response transformations
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost/Arsipmhs2/database/backend/api' : '');
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000;
const AUTH_INVALIDATION_CODES = new Set([
  'AUTH_TOKEN_MALFORMED',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_TOKEN_INVALID_SIGNATURE',
  'AUTH_TOKEN_MISSING',
]);

const UNAUTHORIZED_LOGOUT_DELAY_MS = 400;

let pendingUnauthorizedLogoutId: ReturnType<typeof setTimeout> | null = null;

function cancelPendingUnauthorizedLogout(): void {
  if (pendingUnauthorizedLogoutId !== null) {
    clearTimeout(pendingUnauthorizedLogoutId);
    pendingUnauthorizedLogoutId = null;
  }
}

function scheduleUnauthorizedLogout(client: ApiClient): void {
  cancelPendingUnauthorizedLogout();
  pendingUnauthorizedLogoutId = setTimeout(() => {
    pendingUnauthorizedLogoutId = null;
    client.clearToken();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
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
      _retriedAfterRefresh?: boolean;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { _retriedAfterRefresh, ...requestOptions } = options;
    const url = new URL(`${this.baseURL}/${endpoint}`);
    const tokenFromStorage =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const tokenAtRequestStart = this.token ?? tokenFromStorage;
    if (!this.token && tokenAtRequestStart) this.token = tokenAtRequestStart;

    if (requestOptions.params) {
      Object.entries(requestOptions.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: this.buildHeaders(
          requestOptions.headers,
          tokenAtRequestStart,
          requestOptions.body !== undefined
        ),
        body: requestOptions.body ? JSON.stringify(requestOptions.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle response
      let data: unknown;
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
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
          errorCode &&
          AUTH_INVALIDATION_CODES.has(errorCode) &&
          tokenAtRequestStart &&
          this.token === tokenAtRequestStart;

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
            return this.makeRequest<T>(method, endpoint, { ...requestOptions, _retriedAfterRefresh: true });
          }
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
          scheduleUnauthorizedLogout(this);
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
          error: `Request timeout after ${this.timeout}ms`,
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
