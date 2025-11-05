import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("wl_token")?.value || "";
    if (!token) {
      const loginUrl = new URL("/admin/metadata/minimum-wage", req.url); // 기존 관리자 로그인 흐름 페이지
      // 로그인 페이지가 따로 있다면 그 경로로 교체
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
