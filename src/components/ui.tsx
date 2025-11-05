import Link from "next/link";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold">
          WorkLaw
        </Link>
        <nav className="space-x-4 text-sm font-medium">
          <Link href="/worker" className="hover:text-blue-600">근로자</Link>
          <Link href="/employer" className="hover:text-blue-600">사업주</Link>
          <Link href="/policies" className="hover:text-blue-600">정책</Link>
          <Link href="/legal-news" className="hover:text-blue-600">노동 뉴스</Link>
          <Link href="/mypage" className="hover:text-blue-600">마이페이지</Link>
        </nav>
      </div>
    </header>
  );
}
