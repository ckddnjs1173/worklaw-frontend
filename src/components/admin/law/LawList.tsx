"use client";

import type { LawItem } from "@/services/law";
import EmptyState from "./EmptyState";

type LawItemExtra = LawItem & {
  updated_at?: string;
  law_id?: string;
};

type Props = {
  items: LawItemExtra[];
  isLoading: boolean;
  onSelect: (item: LawItemExtra) => void;
  selectedLaw: LawItemExtra | null;
  error?: string | null;
};

export default function LawList({ items, isLoading, onSelect, selectedLaw, error }: Props) {
  if (isLoading) return <EmptyState title="불러오는 중…" tone="hint" className="min-h-[120px]" />;
  if (error)
    return (
      <EmptyState
        title="목록을 불러오지 못했습니다"
        description={error}
        tone="error"
        className="min-h-[120px]"
      />
    );
  if (items.length === 0) return <EmptyState title="검색 결과가 없습니다" tone="hint" className="min-h-[120px]" />;

  return (
    <div className="min-h-[480px] rounded-xl border border-gray-200">
      <div className="border-b px-4 py-2 text-sm font-medium">법령 목록</div>
      <ul className="divide-y">
        {items.map((it) => {
          const isActive = it.law_name === selectedLaw?.law_name;
          const displayKey = `${it.law_name}-${it.law_code ?? it.law_id ?? "no-code"}`;
          return (
            <li
              key={displayKey}
              className={`cursor-pointer px-4 py-3 text-sm hover:bg-gray-50 ${isActive ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(it)}
              role="button"
              aria-label={`${it.law_name} 선택`}
            >
              <div className="font-medium">{it.law_name}</div>
              {it.updated_at && (
                <div className="text-xs text-gray-500">
                  최근 동기화: {new Date(it.updated_at).toLocaleString()}
                </div>
              )}
              {it.law_code && <div className="text-xs text-gray-500">{it.law_code}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
