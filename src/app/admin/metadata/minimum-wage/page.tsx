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

export default function AdminMinimumWagePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // login form
  const [username, setUsername] = useState<string>("admin");
  const [password, setPassword] = useState<string>("");

  // form
  const [year, setYear] = useState<number>(2025);
  const [amount, setAmount] = useState<number>(10030);
  const [unit, setUnit] = useState<string>("KRW/hour");
  const [editMode, setEditMode] = useState<boolean>(false);

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
    } catch (e: any) {
      alert(`목록 로드 실패: ${e?.response?.data?.detail || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAuthed]);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.year - b.year), [rows]);

  const onLogin = async () => {
    try {
      const res = await adminLogin(username, password);
      setToken(res.access_token);
      setPassword("");
      await load();
    } catch (e: any) {
      alert(`로그인 실패: ${e?.response?.data?.detail || e.message}`);
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
    } catch (e: any) {
      alert(`저장 실패: ${e?.response?.data?.detail || e.message}`);
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
    } catch (e: any) {
      alert(`삭제 실패: ${e?.response?.data?.detail || e.message}`);
    }
  };

  const openHistory = async (y: number) => {
    try {
      const hist = await adminHistoryMinimumWage(y);
      setHistoryYear(y);
      setHistory(hist);
    } catch (e: any) {
      alert(`이력 조회 실패: ${e?.response?.data?.detail || e.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🔐 최저임금 관리자 (JWT)</h1>

      {!isAuthed ? (
        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">로그인</h2>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">아이디</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-3 py-2"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={onLogin} className="px-4 py-2 rounded bg-blue-600 text-white">
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
          <button onClick={onLogout} className="px-3 py-1 rounded bg-gray-200">
            로그아웃
          </button>
        </div>
      )}

      {/* 데이터 폼 & 테이블 (로그인 후) */}
      {isAuthed && (
        <>
          <div className="border rounded-lg p-4 space-y-3">
            <h2 className="font-semibold">{editMode ? "수정" : "신규 등록"}</h2>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">연도</span>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="border rounded px-3 py-2"
                  disabled={editMode}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">금액(원/시간)</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="border rounded px-3 py-2"
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600">단위</span>
                <input
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </label>
            </div>
            <div className="flex gap-2">
              <button onClick={onSubmit} className="px-4 py-2 rounded bg-blue-600 text-white">
                {editMode ? "수정 저장" : "신규 등록"}
              </button>
              {editMode && (
                <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded bg-gray-200">
                  취소
                </button>
              )}
            </div>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2">연도</th>
                  <th className="text-right p-2">금액(원/시간)</th>
                  <th className="text-left p-2">단위</th>
                  <th className="text-right p-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r) => (
                  <tr key={r.year} className="border-t">
                    <td className="p-2">{r.year}</td>
                    <td className="p-2 text-right">{r.amount.toLocaleString()}</td>
                    <td className="p-2">{r.unit}</td>
                    <td className="p-2 text-right space-x-2">
                      <button onClick={() => onEdit(r)} className="px-2 py-1 rounded bg-yellow-400 text-white">
                        수정
                      </button>
                      <button onClick={() => onDelete(r.year)} className="px-2 py-1 rounded bg-red-500 text-white">
                        삭제
                      </button>
                      <button onClick={() => openHistory(r.year)} className="px-2 py-1 rounded bg-gray-700 text-white">
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

          {/* History Drawer */}
          {history && historyYear && (
            <div className="border rounded-lg p-4 bg-white shadow">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">변경 이력 — {historyYear}년 ({history.length}건)</h3>
                <button
                  onClick={() => {
                    setHistory(null);
                    setHistoryYear(null);
                  }}
                  className="px-3 py-1 rounded bg-gray-200"
                >
                  닫기
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">시각</th>
                      <th className="text-left p-2">액션</th>
                      <th className="text-right p-2">금액(이전→이후)</th>
                      <th className="text-left p-2">단위(이전→이후)</th>
                      <th className="text-left p-2">변경자</th>
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
