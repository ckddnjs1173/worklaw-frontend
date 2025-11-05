"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import LawSearch from "@/components/admin/law/LawSearch";
import LawList from "@/components/admin/law/LawList";
import ArticleList from "@/components/admin/law/ArticleList";
import ArticlePreview from "@/components/admin/law/ArticlePreview";
import {
  fetchArticlesByLawName,
  fetchLawList,
  type LawArticle,
  type LawItem,
} from "@/services/law";

export default function AdminLawPage() {
  // 검색어
  const [query, setQuery] = useState("");
  // 법령 목록
  const [laws, setLaws] = useState<LawItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lawError, setLawError] = useState<string | null>(null);

  // 선택된 법령/조문
  const [selectedLaw, setSelectedLaw] = useState<LawItem | null>(null);
  const [articles, setArticles] = useState<LawArticle[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [articlesError, setArticlesError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<LawArticle | null>(null);

  // 토큰 체크 (JWT 보호 UX)
  const token = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("worklaw_admin_jwt");
  }, []);

  const goLogin = useCallback(() => {
    // 관리자 로그인 경로 가정: /admin/metadata/minimum-wage
    window.location.href = "/admin/metadata/minimum-wage";
  }, []);

  // 검색 → 법령 목록 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      setIsLoading(true);
      setLawError(null);
      try {
        const list = await fetchLawList(query);
        if (alive) {
          setLaws(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (alive) setLawError((e as Error).message ?? "법령 목록 조회 중 오류");
      } finally {
        if (alive) setIsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [query]);

  // 법령 선택 → 조문 목록 로드
  useEffect(() => {
    let alive = true;

    // 선택 해제 시 초기화
    if (!selectedLaw) {
      setArticles([]);
      setSelectedArticle(null);
      setArticlesError(null);
      setArticlesLoading(false);
      return () => {
        alive = false;
      };
    }

    (async () => {
      setArticlesLoading(true);
      setArticlesError(null);
      setSelectedArticle(null);
      try {
        // 서비스 시그니처 유지: fetchArticlesByLawName(law_name)
        const list = await fetchArticlesByLawName(selectedLaw.law_name);
        if (alive) {
          setArticles(Array.isArray(list) ? list : []);
        }
      } catch (e) {
        if (alive) setArticlesError((e as Error).message ?? "조문 목록 조회 중 오류");
      } finally {
        if (alive) setArticlesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [selectedLaw]);

  // 콜백들 (exhaustive-deps 경고 방지)
  const onSearch = useCallback((q: string) => {
    setQuery(q.trim());
  }, []);

  const onPickLaw = useCallback((item: LawItem) => {
    setSelectedLaw(item);
  }, []);

  const onPickArticle = useCallback((a: LawArticle) => {
    setSelectedArticle(a);
  }, []);

  // 미로그인 UX
  if (!token) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-xl font-semibold">법령 관리자</h1>
        <p className="mt-3 text-sm text-gray-600">
          관리자 로그인이 필요합니다. 로그인 후 다시 시도하세요.
        </p>
        <button
          onClick={goLogin}
          className="mt-4 rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          로그인 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">법령 관리자</h1>

      <LawSearch onSearch={onSearch} placeholder="법령/키워드 검색" />

      {/* 3단 레이아웃: 법령 목록 / 조문 목록 / 본문 미리보기 */}
      <div className="grid grid-cols-12 gap-6">
        <section className="col-span-4">
          <h2 className="mb-2 text-sm font-medium">법령 목록</h2>
          <LawList
            items={laws}
            isLoading={isLoading}
            error={lawError}
            onSelect={onPickLaw}
            selectedLaw={selectedLaw}
          />
        </section>

        <section className="col-span-4">
          <h2 className="mb-2 text-sm font-medium">
            {selectedLaw ? `${selectedLaw.law_name} · 조문` : "조문 목록"}
          </h2>
          <ArticleList
            lawName={selectedLaw?.law_name ?? ""}
            articles={articles}
            isLoading={articlesLoading}
            error={articlesError}
            onSelect={onPickArticle}
            selectedArticleId={selectedArticle?.article_id ?? ""}
          />
        </section>

        <section className="col-span-4">
          <h2 className="mb-2 text-sm font-medium">본문 미리보기</h2>
          <ArticlePreview
            lawName={selectedLaw?.law_name ?? ""}
            article={selectedArticle}
          />
        </section>
      </div>
    </div>
  );
}
