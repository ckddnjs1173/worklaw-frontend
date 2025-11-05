"use client";

import { useEffect, useState } from "react";
import { getHealth, getMinimumWage } from "@/lib/api";

type UnknownJson = unknown;

function safeStringify(value: UnknownJson): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function DebugPage() {
  const [health, setHealth] = useState<UnknownJson>(null);
  const [wage, setWage] = useState<UnknownJson>(null);
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ error: "health 실패" }));
    getMinimumWage(year).then(setWage).catch(() => setWage({ error: "wage 실패" }));
  }, [year]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-10">
      <h1 className="mb-6 text-2xl font-bold">🧩 API Debug Page</h1>

      <div className="w-full max-w-md space-y-4 rounded bg-white p-6 shadow">
        <div>
          <h2 className="mb-2 font-semibold text-gray-700">Health Check</h2>
          <pre className="rounded bg-gray-100 p-3 text-sm">
            {health === null ? "Loading..." : safeStringify(health)}
          </pre>
        </div>

        <div>
          <h2 className="mb-2 font-semibold text-gray-700">Minimum Wage</h2>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="mb-2 w-full rounded border px-2 py-1"
          />
          <pre className="whitespace-pre-wrap wrap-break-word rounded bg-gray-100 p-3 text-sm">
            {wage === null ? "Loading..." : safeStringify(wage)}
          </pre>
        </div>
      </div>
    </main>
  );
}
