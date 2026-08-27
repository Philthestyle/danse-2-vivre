import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Mode Preview GitHub Pages (public pages uniquement — cf. docs/AUDIT.md §9)
  ...(isStaticExport && {
    output: "export",
    trailingSlash: true,
    basePath,
    assetPrefix: basePath || undefined,
    images: { unoptimized: true },
  }),
  ...(!isStaticExport && {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "danse-2-vivre.s3.eu-west-3.amazonaws.com",
        },
        {
          protocol: "https",
          hostname: "hgndfwjsyukamkcvubsf.supabase.co",
        },
      ],
    },
  }),
  typedRoutes: !isStaticExport,
  eslint: {
    // Le build de preview ne doit pas casser sur des lints — le vrai gate est le CI
    ignoreDuringBuilds: isStaticExport,
  },
} as NextConfig;

export default nextConfig;
