"use client";

import type { LawArticle } from "@/services/law";
import EmptyState from "./EmptyState";

type Props = {
  lawName: string;
  articles: LawArticle[];
  isLoading: boolean;
  onSelect: (a: LawArticle) => void;
  selectedArticleId?: string;
  error?: string | null;
};

export default function ArticleList({
  lawName,
  articles,
  isLoading,
  onSelect,
  selectedArticleId,
  error
}: Props) {
  if (isLoading) {
    return <EmptyState title="조문을 불러오는 중…" tone="hint" className="min-h-[120px]" />;
  }
  if (error) {
    return <EmptyState title="조문을 불러오지 못했습니다" description={error} tone="error" className="min-h-[120px]" />;
  }
  if (articles.length === 0) {
    return <EmptyState title={lawName ? "조문이 없습니다" : "법령을 먼저 선택해 주세요"} tone="hint" className="min-h-[120px]" />;
  }

  return (
    <div className="min-h-[480px] rounded-xl border border-gray-200">
      <div className="border-b px-4 py-2 text-sm font-medium">
        {lawName ? `${lawName} · 조문` : "조문"}
      </div>
      <ul className="max-h-[420px] overflow-auto divide-y">
        {articles.map((a) => {
          const active = a.article_id === selectedArticleId;
          return (
            <li
              key={a.article_id ?? `${a.article_no}-${a.title ?? "no-title"}`}
              className={`cursor-pointer px-4 py-2 text-sm hover:bg-gray-50 ${active ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(a)}
              role="button"
              aria-label={`${a.article_no} 선택`}
            >
              <div className="font-medium">{a.article_no}</div>
              <div className="line-clamp-2 text-xs text-gray-500">{a.title}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
