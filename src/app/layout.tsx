import "./globals.css";
import type { Metadata } from "next";
import { Header } from "@/components/ui"; // Footer 제거

export const metadata: Metadata = {
  title: "WorkLaw",
  description: "Labor law & wage checker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Header />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
