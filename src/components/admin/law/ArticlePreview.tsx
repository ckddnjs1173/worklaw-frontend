"use client";

import { useEffect, useState } from "react";
import type { LawArticle, LawArticleVersion } from "@/services/law";
import { fetchArticleVersions } from "@/services/law";

type Props = {
  lawName: string;
  article: LawArticle | null;
};

export default function ArticlePreview({ lawName, article }: Props) {
  const [versions, setVersions] = useState<LawArticleVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!lawName || !article) {
      setVersions([]);
      setErr(null);
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const v = await fetchArticleVersions(lawName, article.article_no);
        if (alive) setVersions(Array.isArray(v) ? v : []);
      } catch (e) {
        if (alive) setErr((e as Error).message ?? "버전 정보를 불러오지 못했습니다");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [lawName, article]);

  if (!article) {
    return (
      <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-500">
        조문을 선택하면 우측에 미리보기가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4 min-h-[480px]">
      <div className="mb-2 text-sm text-gray-500">
        {lawName} — {article.article_no}
      </div>
      {article.title && <div className="mb-3 text-lg font-semibold">{article.title}</div>}

      {loading ? (
        <div className="text-sm text-gray-500">내용을 불러오는 중…</div>
      ) : err ? (
        <div className="text-sm text-red-600">{err}</div>
      ) : versions.length === 0 ? (
        <div className="text-sm text-gray-500">해당 조문의 버전 정보가 없습니다.</div>
      ) : (
        <div className="space-y-6">
          {versions.map((v) => (
            <div key={`${v.article_no}-${v.version_date}`} className="space-y-2">
              <div className="text-sm font-medium">{v.version_date}</div>
              {/* 서버에서 안전하게 생성된 HTML만 신뢰. XSS 주의! */}
              { }
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: v.content_html }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
