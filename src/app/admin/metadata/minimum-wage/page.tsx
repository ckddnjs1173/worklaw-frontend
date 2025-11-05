"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adminCreateMinimumWage,
  adminDeleteMinimumWage,
  adminHistoryMinimumWage,
  adminListMinimumWage,
  adminLogin,
  adminUpdateMinimumWage,
  getToken,
  setToken,
  clearToken,
} from "@/lib/api";

/** UI Types */
type Row = { year: number; amount: number; unit: string };
type HistoryRow = {
  year: number;
  old_amount: number | null;
  new_amount: number | null;
  old_unit: string | null;
  new_unit: string | null;
  action: string;
  changed_by: string;
  changed_at: string;
};

/** Admin 응답 예상 키(옵셔널) */
type AdminHistoryRow = {
  year?: number | string;
  target_year?: number | string;
  y?: number | string;
  old_amount?: number | string;
  before_amount?: number | string;
  prev_amount?: number | string;
  new_amount?: number | string;
  after_amount?: number | string;
  next_amount?: number | string;
  old_unit?: string;
  before_unit?: string;
  unit_before?: string;
  new_unit?: string;
  after_unit?: string;
  unit_after?: string;
  unit?: string;
  action?: string;
  op?: string;
  changed_by?: string;
  editor?: string;
  user?: string;
  changed_at?: string;
  created_at?: string;
  updated_at?: string;
};
type AdminHistoryPayload = AdminHistoryRow[] | { items: AdminHistoryRow[] } | unknown;

/** Helpers (any/unknown 안전 처리) */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
type AxiosLikeError = { response?: { data?: { detail?: string } }; message?: string };
function getErrorMessage(e: unknown): string {
  const x = e as AxiosLikeError;
  if (x?.response?.data?.detail) return x.response.data.detail;
  if (x?.message) return x.message;
  return "알 수 없는 오류";
}
function toNumOrNull(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
function toStrOrNull(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  return null;
}
function normalizeAdminHistoryRow(a: AdminHistoryRow): HistoryRow {
  const year =
    toNumOrNull(a.year) ?? toNumOrNull(a.target_year) ?? toNumOrNull(a.y) ?? 0;

  const old_amount =
    toNumOrNull(a.old_amount) ??
    toNumOrNull(a.before_amount) ??
    toNumOrNull(a.prev_amount) ??
    null;

  const new_amount =
    toNumOrNull(a.new_amount) ??
    toNumOrNull(a.after_amount) ??
    toNumOrNull(a.next_amount) ??
    null;

  const old_unit =
    toStrOrNull(a.old_unit) ??
    toStrOrNull(a.before_unit) ??
    toStrOrNull(a.unit_before) ??
    null;

  const new_unit =
    toStrOrNull(a.new_unit) ??
    toStrOrNull(a.after_unit) ??
    toStrOrNull(a.unit_after) ??
    toStrOrNull(a.unit) ??
    null;

  const action = a.action ?? a.op ?? "UPDATE";
  const changed_by = a.changed_by ?? a.editor ?? a.user ?? "-";
  const changed_at =
    a.changed_at ?? a.created_at ?? a.updated_at ?? new Date().toISOString();

  return {
    year,
    old_amount,
    new_amount,
    old_unit,
    new_unit,
    action,
    changed_by,
    changed_at,
  };
}
function normalizeAdminHistory(payload: AdminHistoryPayload): HistoryRow[] {
  if (Array.isArray(payload)) return payload.map(normalizeAdminHistoryRow);
  if (isRecord(payload) && Array.isArray((payload as { items?: AdminHistoryRow[] }).items)) {
    return ((payload as { items: AdminHistoryRow[] }).items).map(normalizeAdminHistoryRow);
  }
  return [];
}

/** Page */
export default function AdminMinimumWagePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  // login form
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");

  // form
  const [year, setYear] = useState(2025);
  const [amount, setAmount] = useState(10030);
  const [unit, setUnit] = useState("KRW/hour");
  const [editMode, setEditMode] = useState(false);

  // history
  const [historyYear, setHistoryYear] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryRow[] | null>(null);

  const token = getToken();
  const isAuthed = !!token;

  const load = async () => {
    if (!isAuthed) return;
    setLoading(true);
    try {
      const list = await adminListMinimumWage();
      setRows(list);
    } catch (e: unknown) {
      alert(`목록 로드 실패: ${getErrorMessage(e)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.year - b.year), [rows]);

  const onLogin = async () => {
    try {
      const res = await adminLogin(username, password);
      setToken(res.access_token);
      setPassword("");
      await load();
    } catch (e: unknown) {
      alert(`로그인 실패: ${getErrorMessage(e)}`);
    }
  };

  const onLogout = () => {
    clearToken();
    setRows([]);
  };

  const onSubmit = async () => {
    try {
      if (editMode) {
        await adminUpdateMinimumWage(year, { amount, unit });
      } else {
        await adminCreateMinimumWage({ year, amount, unit });
      }
      setEditMode(false);
      await load();
    } catch (e: unknown) {
      alert(`저장 실패: ${getErrorMessage(e)}`);
    }
  };

  const onEdit = (r: Row) => {
    setYear(r.year);
    setAmount(r.amount);
    setUnit(r.unit);
    setEditMode(true);
  };

  const onDelete = async (y: number) => {
    if (!confirm(`${y}년 기록을 삭제할까요?`)) return;
    try {
      await adminDeleteMinimumWage(y);
      await load();
    } catch (e: unknown) {
      alert(`삭제 실패: ${getErrorMessage(e)}`);
    }
  };

  const openHistory = async (y: number) => {
    try {
      const hist = await adminHistoryMinimumWage(y);
      const normalized = normalizeAdminHistory(hist); // ✅ 정규화
      setHistoryYear(y);
      setHistory(normalized);                           // ✅ 타입 일치
    } catch (e: unknown) {
      alert(`이력 조회 실패: ${getErrorMessage(e)}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">🔐 최저임금 관리자 (JWT)</h1>

      {!isAuthed ? (
        <div className="space-y-3 rounded-lg border p-4">
          <h2 className="font-semibold">로그인</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">아이디</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded border px-3 py-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded border px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogin} className="rounded bg-blue-600 px-4 py-2 text-white">
              로그인
            </button>
          </div>
          <p className="text-xs text-gray-500">
            * 서버 환경변수 <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD_HASH</code> 로 계정 제어
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">로그인됨</span>
          <button onClick={onLogout} className="rounded bg-gray-200 px-3 py-1">
            로그아웃
          </button>
        </div>
      )}

      {isAuthed && (
        <>
          <div className="space-y-3 rounded-lg border p-4">
            <h2 className="font-semibold">{editMode ? "수정" : "신규 등록"}</h2>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">연도</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="rounded border px-3 py-2"
                  disabled={editMode}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">금액(원/시간)</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="rounded border px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">단위</span>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="rounded border px-3 py-2"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={onSubmit} className="rounded bg-blue-600 px-4 py-2 text-white">
                {editMode ? "수정 저장" : "신규 등록"}
              </button>
              {editMode && (
                <button onClick={() => setEditMode(false)} className="rounded bg-gray-200 px-4 py-2">
                  취소
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-2 text-left">연도</th>
                  <th className="p-2 text-right">금액(원/시간)</th>
                  <th className="p-2 text-left">단위</th>
                  <th className="p-2 text-right">작업</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.year} className="border-t">
                    <td className="p-2">{r.year}</td>
                    <td className="p-2 text-right">{r.amount.toLocaleString()}</td>
                    <td className="p-2">{r.unit}</td>
                    <td className="space-x-2 p-2 text-right">
                      <button onClick={() => onEdit(r)} className="rounded bg-yellow-400 px-2 py-1 text-white">
                        수정
                      </button>
                      <button onClick={() => onDelete(r.year)} className="rounded bg-red-500 px-2 py-1 text-white">
                        삭제
                      </button>
                      <button onClick={() => openHistory(r.year)} className="rounded bg-gray-700 px-2 py-1 text-white">
                        이력
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && sorted.length === 0 && (
                  <tr>
                    <td className="p-3 text-center text-gray-500" colSpan={4}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {history && historyYear && (
            <div className="rounded-lg border bg-white p-4 shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  변경 이력 — {historyYear}년 ({history.length}건)
                </h3>
                <button
                  onClick={() => {
                    setHistory(null);
                    setHistoryYear(null);
                  }}
                  className="rounded bg-gray-200 px-3 py-1"
                >
                  닫기
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">시각</th>
                      <th className="p-2 text-left">액션</th>
                      <th className="p-2 text-right">금액(이전→이후)</th>
                      <th className="p-2 text-left">단위(이전→이후)</th>
                      <th className="p-2 text-left">변경자</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">{new Date(h.changed_at).toLocaleString()}</td>
                        <td className="p-2">{h.action}</td>
                        <td className="p-2 text-right">
                          {(h.old_amount ?? "-").toString()} → {(h.new_amount ?? "-").toString()}
                        </td>
                        <td className="p-2">
                          {(h.old_unit ?? "-")} → {(h.new_unit ?? "-")}
                        </td>
                        <td className="p-2">{h.changed_by}</td>
                      </tr>
                    ))}
                    {history.length === 0 && (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={5}>
                          이력이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
