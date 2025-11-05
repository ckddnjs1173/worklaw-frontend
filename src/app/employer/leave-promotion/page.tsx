"use client";

import { useState } from "react";
import api from "@/lib/api";

type MinimumWageItem = { year: number; amount: number; unit: string };
type MinimumWageResponse = MinimumWageItem | { items: MinimumWageItem[] } | { error: string } | null;

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function LeavePromotionPage() {
  const [month, setMonth] = useState("2025-10");
  const [result, setResult] = useState<MinimumWageResponse>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await api.get("/metadata/minimum-wage", { params: { year: 2025 } });
      setResult(res.data as MinimumWageResponse);
    } catch {
      setResult({ error: "요청 실패" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 text-center">
      <h1 className="mb-4 text-2xl font-bold">🏖 연차촉진센터 (더미)</h1>

      <div className="flex flex-col items-center space-y-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded border px-3 py-2"
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "계산 중..." : "대상 산정 (더미 호출)"}
        </button>

        {result !== null && (
          <pre className="w-full max-w-md whitespace-pre-wrap wrap-break-word rounded bg-gray-100 p-3 text-left text-sm">
            {safeStringify(result)}
          </pre>
        )}
      </div>
    </main>
  );
}
