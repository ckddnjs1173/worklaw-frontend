"use client";

import type { LawItem } from "@/services/law";

type Props = {
  items: LawItem[];
  isLoading: boolean;
  onSelect: (item: LawItem) => void;
  selectedLaw: LawItem | null;
  error?: string | null; // page.tsx에서 전달 가능
};

export default function LawList({ items, isLoading, onSelect, selectedLaw, error }: Props) {
  return (
    <div className="min-h-[480px] rounded-xl border border-gray-200">
      <div className="border-b px-4 py-2 text-sm font-medium">법령 목록</div>

      {isLoading ? (
        <div className="p-4 text-sm text-gray-500">불러오는 중…</div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600">목록을 불러오지 못했습니다: {error}</div>
      ) : items.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">검색 결과가 없습니다.</div>
      ) : (
        <ul className="divide-y">
          {items.map((it) => {
            const isActive = it.law_name === selectedLaw?.law_name;
            return (
              <li
                key={`${it.law_name}-${it.law_code ?? it.law_id ?? "no-code"}`}
                className={`cursor-pointer px-4 py-3 text-sm hover:bg-gray-50 ${
                  isActive ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelect(it)}
                role="button"
                aria-label={`${it.law_name} 선택`}
              >
                <div className="font-medium">{it.law_name}</div>
                {(it as any).updated_at && (
                  <div className="text-xs text-gray-500">
                    최근 동기화: {new Date((it as any).updated_at).toLocaleString()}
                  </div>
                )}
                {(it as any).law_code && (
                  <div className="text-xs text-gray-500">{(it as any).law_code}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
