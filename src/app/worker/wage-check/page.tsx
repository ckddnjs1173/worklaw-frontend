"use client";

import { useState } from "react";
import { getMinimumWage } from "@/lib/api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface WageResult {
  totalWage: number;
  difference: number;
  ratio: number;
  minimumWage: number;
}

export default function WageCheckPage() {
  const [year, setYear] = useState<number>(2025);
  const [hourlyWage, setHourlyWage] = useState<number>(10000);
  const [regularHours, setRegularHours] = useState<number>(40);
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [nightHours, setNightHours] = useState<number>(0);
  const [holidayHours, setHolidayHours] = useState<number>(0);
  const [result, setResult] = useState<WageResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ 임금 계산 함수
  const calculateWage = async () => {
    setLoading(true);
    try {
      const data = await getMinimumWage(year);
      const minWage = data.minimum_wage ?? 9860;

      // 법정 가산율
      const overtimeRate = 1.5;
      const nightRate = 1.5;
      const holidayRate = 1.5;

      const totalWage =
        regularHours * hourlyWage +
        overtimeHours * hourlyWage * overtimeRate +
        nightHours * hourlyWage * nightRate +
        holidayHours * hourlyWage * holidayRate;

      const totalHours = regularHours + overtimeHours + nightHours + holidayHours;
      const minimumWageTotal = totalHours * minWage;
      const difference = totalWage - minimumWageTotal;
      const ratio = ((totalWage / minimumWageTotal) * 100 - 100).toFixed(1);

      setResult({
        totalWage,
        difference,
        ratio: parseFloat(ratio),
        minimumWage: minWage,
      });
    } catch (err) {
      console.error("Error calculating wage:", err);
      alert("최저임금 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const chartData = result
    ? {
        labels: ["최저임금 기준", "실제 임금"],
        datasets: [
          {
            label: "총 임금 (원)",
            data: [
              (regularHours + overtimeHours + nightHours + holidayHours) *
                result.minimumWage,
              result.totalWage,
            ],
            backgroundColor: ["#E5E7EB", "#3B82F6"],
          },
        ],
      }
    : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "임금 비교 그래프 (단위: 원)" },
    },
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-4">
        💰 임금 계산 및 최저임금 비교
      </h1>

      {/* 입력 폼 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">기준 연도</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">시급 (원)</span>
          <input
            type="number"
            value={hourlyWage}
            onChange={(e) => setHourlyWage(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">주당 근로시간</span>
          <input
            type="number"
            value={regularHours}
            onChange={(e) => setRegularHours(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">연장근로</span>
          <input
            type="number"
            value={overtimeHours}
            onChange={(e) => setOvertimeHours(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">야간근로</span>
          <input
            type="number"
            value={nightHours}
            onChange={(e) => setNightHours(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-600 mb-1">휴일근로</span>
          <input
            type="number"
            value={holidayHours}
            onChange={(e) => setHolidayHours(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
        </label>
      </div>

      <button
        onClick={calculateWage}
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition"
      >
        {loading ? "계산 중..." : "계산하기"}
      </button>

      {/* 결과 카드 & 차트 */}
      {result && (
        <div className="space-y-6 mt-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl text-center shadow">
              <h3 className="text-sm text-gray-500">총 임금</h3>
              <p className="text-xl font-bold text-blue-700">
                {result.totalWage.toLocaleString()} 원
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center shadow">
              <h3 className="text-sm text-gray-500">최저임금 기준</h3>
              <p className="text-xl font-bold text-green-700">
                {result.minimumWage.toLocaleString()} 원/시간
              </p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-center shadow">
              <h3 className="text-sm text-gray-500">차액</h3>
              <p
                className={`text-xl font-bold ${
                  result.difference >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.difference.toLocaleString()} 원
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center shadow">
              <h3 className="text-sm text-gray-500">비율 차이</h3>
              <p
                className={`text-xl font-bold ${
                  result.ratio >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.ratio >= 0 ? "+" : ""}
                {result.ratio}%
              </p>
            </div>
          </div>

          {/* 막대 그래프 */}
          <div className="bg-white p-4 rounded-xl shadow">
            {chartData && <Bar data={chartData} options={chartOptions} />}
          </div>
        </div>
      )}
    </div>
  );
}
