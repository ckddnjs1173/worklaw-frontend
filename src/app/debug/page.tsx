"use client";

import React, { useEffect, useState } from "react";
import { getHealth, getMinimumWage } from "@/lib/api";

export default function DebugPage() {
  const [health, setHealth] = useState<any>(null);
  const [wage, setWage] = useState<any>(null);
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    getHealth().then(setHealth).catch(console.error);
    getMinimumWage(year).then(setWage).catch(console.error);
  }, [year]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
      <h1 className="text-2xl font-bold mb-6">🧩 API Debug Page</h1>

      <div className="bg-white shadow rounded p-6 w-full max-w-md space-y-4">
        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Health Check</h2>
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {health ? JSON.stringify(health, null, 2) : "Loading..."}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Minimum Wage</h2>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1 w-full mb-2"
          />
          <pre className="bg-gray-100 p-3 rounded text-sm">
            {wage ? JSON.stringify(wage, null, 2) : "Loading..."}
          </pre>
        </div>
      </div>
    </main>
  );
}
