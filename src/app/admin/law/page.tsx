"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LawSearch from "@/components/admin/law/LawSearch";
import LawList from "@/components/admin/law/LawList";
import ArticleList from "@/components/admin/law/ArticleList";
import ArticlePreview from "@/components/admin/law/ArticlePreview";
import EmptyState from "@/components/admin/law/EmptyState";
import {
  fetchArticlesByLawName,
  fetchLawList,
  type LawArticle,
  type LawItem,
} from "@/services/law";

export default function AdminLawPage() {
  const [query, setQuery] = useState("");
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lawError, setLawError] = useState<string | null>(null);

  const [selectedLaw, setSelectedLaw] = useState<LawItem | null>(null);
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LawArticle | null>(null);

  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("worklaw_admin_jwt");
  }, []);

  const goLogin = useCallback(() => {
    window.location.href = "/admin/metadata/minimum-wage";
  }, []);

  // 검색 → 법령 목록
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setLawError(null);
      try {
        const list = await fetchLawList(query);
        if (alive) setLaws(Array.isArray(list) ? list : []);
      } catch (e) {
        if (alive) setLawError((e as Error).message ?? "법령 목록 조회 중 오류");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [query]);

  // 법령 선택 → 조문 목록
  useEffect(() => {
    let alive = true;
    if (!selectedLaw) {
      setArticles([]);
      setSelectedArticle(null);
      setArticlesError(null);
      setArticlesLoading(false);
      return () => { alive = false; };
    }
    (async () => {
      setArticlesLoading(true);
      setArticlesError(null);
      setSelectedArticle(null);
      try {
        const list = await fetchArticlesByLawName(selectedLaw.law_name);
        if (alive) setArticles(Array.isArray(list) ? list : []);
      } catch (e) {
        if (alive) setArticlesError((e as Error).message ?? "조문 목록 조회 중 오류");
      } finally {
        if (alive) setArticlesLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [selectedLaw]);

  const onSearch = useCallback((q: string) => setQuery(q.trim()), []);
  const onPickLaw = useCallback((item: LawItem) => setSelectedLaw(item), []);
  const onPickArticle = useCallback((a: LawArticle) => setSelectedArticle(a), []);

  if (!token) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-semibold mb-3">법령 관리자</h1>
        <EmptyState
          title="관리자 로그인이 필요합니다"
          description="JWT가 없어 관리자 화면에 접근할 수 없습니다."
          action={{ label: "로그인 페이지로 이동", onClick: goLogin }}
          tone="hint"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">법령 관리자</h1>

      <LawSearch onSearch={onSearch} placeholder="법령/키워드 검색" />

      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-4">
          <LawList
            items={laws}
            isLoading={isLoading}
            error={lawError}
            onSelect={onPickLaw}
            selectedLaw={selectedLaw}
          />
        </section>

        <section className="col-span-4">
          {selectedLaw ? (
            <ArticleList
              lawName={selectedLaw.law_name}
              articles={articles}
              isLoading={articlesLoading}
              error={articlesError}
              onSelect={onPickArticle}
              selectedArticleId={selectedArticle?.article_id ?? ""}
            />
          ) : (
            <EmptyState
              title="법령을 선택해 주세요"
              description="좌측 목록에서 법령을 먼저 선택하면 조문이 표시됩니다."
              tone="hint"
              className="min-h-[480px]"
            />
          )}
        </section>

        <section className="col-span-4">
          <h2 className="mb-2 text-sm font-medium">본문 미리보기</h2>
          {!selectedArticle ? (
            <EmptyState
              title="조문을 선택해 주세요"
              description="가운데에서 조문을 클릭하면 버전과 본문이 표시됩니다."
              tone="hint"
              className="min-h-[220px]"
            />
          ) : (
            <ArticlePreview lawName={selectedLaw?.law_name ?? ""} article={selectedArticle} />
          )}
        </section>
      </div>
    </div>
  );
}
