import api from "@/lib/api";

/** ========= Types (유지) ========= */
export type LawItem = {
  law_name: string;
  law_code: string;
};

export type LawArticle = {
  article_id: string;
  article_no: string;
  title: string;
};

export type LawArticleVersion = {
  article_no: string;
  version_date: string; // YYYY-MM-DD
  content_html: string;
};

/** ========= Type Guards ========= */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

/** ========= Normalizers (백엔드 응답 변형/누락 대응) ========= */
function normalizeLawItem(raw: unknown): LawItem | null {
  if (!isRecord(raw)) return null;
  const law_name = String(raw.law_name ?? raw["lawName"] ?? "");
  const law_code = String(raw.law_code ?? raw["lawCode"] ?? "");
  if (!law_name) return null;
  // law_code가 비어있을 수도 있으므로 기본값 허용
  return { law_name, law_code };
}

function normalizeArticle(raw: unknown): LawArticle | null {
  if (!isRecord(raw)) return null;
  const article_id = String(
    raw.article_id ?? raw["articleId"] ?? raw["id"] ?? ""
  );
  const article_no = String(raw.article_no ?? raw["articleNo"] ?? "");
  const titleVal = raw.title ?? raw["articleTitle"];
  const title =
    typeof titleVal === "string" ? titleVal : (titleVal ? String(titleVal) : "");
  if (!article_no) return null;
  // article_id가 없을 수 있어도 UI 키 충돌을 피하려고 fallback 생성
  const safeId = article_id || `${article_no}-${title || "no-title"}`;
  return { article_id: safeId, article_no, title };
}

function normalizeVersion(raw: unknown): LawArticleVersion | null {
  if (!isRecord(raw)) return null;
  const article_no = String(raw.article_no ?? raw["articleNo"] ?? "");
  const version_date = String(
    raw.version_date ??
      raw["versionDate"] ??
      raw["date"] ??
      raw["version"] ??
      ""
  );
  const content_html = String(
    raw.content_html ?? raw["contentHtml"] ?? raw["html"] ?? raw["content"] ?? ""
  );
  if (!article_no || !version_date) return null;
  return { article_no, version_date, content_html };
}

/** ========= API Calls (시그니처 유지) ========= */

/**
 * 법령 목록 조회
 * - 예상 응답: { items: LawItem[] } | LawItem[]
 */
export async function fetchLawList(q: string): Promise<LawItem[]> {
  const res = await api.get("/law/list", { params: { q } });
  const data = res.data;

  const rawItems = isArray(data?.items) ? data.items : (isArray(data) ? data : []);
  return rawItems
    .map(normalizeLawItem)
    .filter(Boolean) as LawItem[];
}

/**
 * 특정 법령명의 조문 목록 조회
 * - 예상 응답: { items: LawArticle[] } | LawArticle[]
 */
export async function fetchArticlesByLawName(lawName: string): Promise<LawArticle[]> {
  const res = await api.get("/law/articles", { params: { law_name: lawName } });
  const data = res.data;

  const rawItems = isArray(data?.items) ? data.items : (isArray(data) ? data : []);
  return rawItems
    .map(normalizeArticle)
    .filter(Boolean) as LawArticle[];
}

/**
 * 조문 버전 목록 조회
 * - 일반 케이스: GET /law/articles?law_name=...&article_no=...&versions=true
 *   응답 형태가 아래 둘 중 하나일 수 있음:
 *   A) { versions: LawArticleVersion[] }
 *   B) { items: [{ versions: LawArticleVersion[] }, ...] } 또는 { items: LawArticle[] } (각 article에 versions 내장)
 *   C) LawArticleVersion[] (직접 배열)
 */
export async function fetchArticleVersions(
  lawName: string,
  articleNo: string
): Promise<LawArticleVersion[]> {
  const res = await api.get("/law/articles", {
    params: { law_name: lawName, article_no: articleNo, versions: true }
  });
  const data = res.data;

  // Case C: 배열 자체가 버전 목록
  if (isArray(data)) {
    return data.map(normalizeVersion).filter(Boolean) as LawArticleVersion[];
  }

  // Case A: 최상위 versions
  if (isArray(data?.versions)) {
    return data.versions.map(normalizeVersion).filter(Boolean) as LawArticleVersion[];
  }

  // Case B-1: items[0].versions
  if (isArray(data?.items) && data.items.length > 0) {
    const first = data.items[0];
    if (isRecord(first) && isArray(first.versions)) {
      return first.versions.map(normalizeVersion).filter(Boolean) as LawArticleVersion[];
    }
    // Case B-2: items가 조문 배열이라면 그 중 article_no 매칭되는 항목의 versions 시도
    const match = (data.items as unknown[])
      .map((x) => (isRecord(x) ? x : null))
      .find((x) => x && String(x.article_no ?? x["articleNo"] ?? "") === articleNo);
    if (match && isArray(match.versions)) {
      return match.versions.map(normalizeVersion).filter(Boolean) as LawArticleVersion[];
    }
  }

  // 적합한 형태가 없으면 빈 배열
  return [];
}
