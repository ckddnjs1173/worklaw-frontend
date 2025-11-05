import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,   // Next 16: top-level 옵션
  reactCompiler: true, // 사용 중이므로 유지
};

export default nextConfig;
