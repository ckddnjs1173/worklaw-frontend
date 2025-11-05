"use client";

import React, { useState } from "react";
import api from "@/lib/api";

export default function EmployerCheckPage() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      // 실제 API 연결 전 더미 호출
      const res = await api.get("/health");
      setScore(Math.floor(Math.random() * 100));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-10 text-center">
      <h1 className="text-2xl font-bold mb-4">🏢 사업주 법준수 자가진단</h1>
      <p className="mb-6">아래 버튼을 눌러 더미 결과를 확인하세요.</p>

      <button
        onClick={handleCheck}
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {loading ? "진단 중..." : "자가진단 시작 (더미)"}
      </button>

      {score !== null && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">결과 점수: {score} / 100</h2>
          <p className="text-gray-600 mt-2">
            {score >= 70 ? "✅ 양호한 수준입니다." : "⚠ 개선이 필요합니다."}
          </p>
        </div>
      )}
    </main>
  );
}
