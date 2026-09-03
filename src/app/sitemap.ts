import type { MetadataRoute } from "next";
import { getPublishedNews } from "@/lib/news";
import { seedTeachers } from "@/lib/data/seed";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticRoutes = ["", "/actualites", "/professeurs", "/calendrier"];
  const news = await getPublishedNews();

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.8,
    })),
    ...news.map((n) => ({
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
