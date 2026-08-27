import type { MetadataRoute } from "next";
import { seedNews, seedTeachers } from "@/lib/data/seed";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/actualites", "/professeurs", "/calendrier"];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...seedNews.map((n) => ({
      url: `${base}/actualites/${n.slug}`,
      lastModified: new Date(n.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...seedTeachers.map((t) => ({
      url: `${base}/professeurs/${t.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
