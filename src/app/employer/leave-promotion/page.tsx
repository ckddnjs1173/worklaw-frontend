"use client";

import React, { useState } from "react";
import api from "@/lib/api";

export default function LeavePromotionPage() {
  const [month, setMonth] = useState("2025-10");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      // 더미 호출
      const res = await api.get("/metadata/minimum-wage?year=2025");
      setResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">🏖 연차촉진센터 (더미)</h1>

      <div className="flex flex-col items-center space-y-4">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "계산 중..." : "대상 산정 (더미 호출)"}
        </button>

        {result && (
          <pre className="bg-gray-100 p-3 rounded text-sm w-full max-w-md text-left">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </main>
  );
}
