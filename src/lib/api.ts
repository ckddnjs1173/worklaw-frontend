// worklaw-frontend/src/lib/api.ts
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

/** ----------------------------------------------------------------
 * Axios Instance
 * ---------------------------------------------------------------- */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

/** ----------------------------------------------------------------
 * Token Helpers (localStorage)
 * ---------------------------------------------------------------- */
const TOKEN_KEY = "worklaw_admin_jwt";

export const getToken = (): string | null =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (t: string): void => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, t);
};

export const clearToken = (): void => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

/** ----------------------------------------------------------------
 * Interceptors
 * ---------------------------------------------------------------- */
// Attach Authorization safely (headers undefined 경고 방지)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    (config.headers as AxiosRequestConfig["headers"]) ||= {};
    (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// (선택) 401 자동 처리: 토큰 제거
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    if (err.response?.status === 401) clearToken();
    return Promise.reject(err);
  }
);

/** ----------------------------------------------------------------
 * Public API types
 * ---------------------------------------------------------------- */
export type HealthResponse = { status: string; env?: string };

export type MinimumWagePublic = {
  year: number;
  minimum_wage: number; // KRW/hour
  unit: string; // "KRW/hour"
};

/** ----------------------------------------------------------------
 * Admin API types (JWT)
 * ---------------------------------------------------------------- */
export type AdminLoginResponse = {
  access_token: string;
  token_type: string;
  expires_in_minutes: number;
};

export type AdminWageRow = {
  year: number;
  amount: number;
  unit: string;
};

export type AdminCreateWagePayload = {
  year: number;
  amount: number;
  unit: string;
};

export type AdminUpdateWagePayload = {
  amount?: number;
  unit?: string;
};

export type AdminHistoryRow = {
  id: number;
  year: number;
  from_amount: number | null;
  to_amount: number;
  changed_at: string; // ISO
  changed_by?: string | null;
};

/** ----------------------------------------------------------------
 * Public APIs
 * ---------------------------------------------------------------- */
export const getHealth = async (): Promise<HealthResponse> => {
  const res = await api.get<HealthResponse>("/health");
  return res.data;
};

export const getMinimumWage = async (year: number): Promise<MinimumWagePublic> => {
  const res = await api.get<MinimumWagePublic>("/metadata/minimum-wage", { params: { year } });
  return res.data;
};

/** ----------------------------------------------------------------
 * Auth
 * ---------------------------------------------------------------- */
export const adminLogin = async (
  username: string,
  password: string
): Promise<AdminLoginResponse> => {
  const res = await api.post<AdminLoginResponse>("/auth/login", { username, password });
  return res.data;
};

/** ----------------------------------------------------------------
 * Admin (JWT-protected)
 *  - 네가 준 “RESTful 경로” 그대로 사용:
 *    GET  /admin/metadata/minimum-wage
 *    POST /admin/metadata/minimum-wage
 *    PUT  /admin/metadata/minimum-wage/:year
 *    DELETE /admin/metadata/minimum-wage/:year
 *    GET  /admin/metadata/minimum-wage/:year/history
 * ---------------------------------------------------------------- */
export const adminListMinimumWage = async (): Promise<AdminWageRow[]> => {
  const res = await api.get<AdminWageRow[]>("/admin/metadata/minimum-wage");
  return res.data;
};

export const adminCreateMinimumWage = async (
  payload: AdminCreateWagePayload
): Promise<unknown> => {
  const res = await api.post("/admin/metadata/minimum-wage", payload);
  return res.data;
};

export const adminUpdateMinimumWage = async (
  year: number,
  payload: AdminUpdateWagePayload
): Promise<unknown> => {
  const res = await api.put(`/admin/metadata/minimum-wage/${year}`, payload);
  return res.data;
};

export const adminDeleteMinimumWage = async (year: number): Promise<void> => {
  await api.delete(`/admin/metadata/minimum-wage/${year}`);
};

export const adminHistoryMinimumWage = async (year: number): Promise<AdminHistoryRow[]> => {
  const res = await api.get<AdminHistoryRow[]>(`/admin/metadata/minimum-wage/${year}/history`);
  return res.data;
};

export default api;
