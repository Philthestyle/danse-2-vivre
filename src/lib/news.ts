import { withBasePath } from "@/lib/paths";
import { createPublicClient } from "@/lib/supabase/public";
import { seedNews, type SeedNews } from "@/lib/data/seed";

export interface PublicNews {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl: string | null;
}

/**
 * Résout la source d'une image d'actualité :
 *   - URL absolue (http/https)     → renvoyée telle quelle (Supabase Storage)
 *   - chemin relatif               → sert depuis /public/images/<key>
 *   - null                          → pas d'image
 */
function resolveImage(imageKey: string | null | undefined): string | null {
  if (!imageKey) return null;
  if (/^https?:\/\//.test(imageKey)) return imageKey;
  return withBasePath(imageKey.startsWith("/") ? imageKey : `/images/${imageKey}`);
}

function seedToPublic(n: SeedNews): PublicNews {
  return {
    id: n.slug,
    slug: n.slug,
    title: n.title,
    excerpt: n.excerpt,
    content: n.content,
    author: n.author,
    publishedAt: n.publishedAt,
    imageUrl: n.imageUrl ? withBasePath(n.imageUrl) : null,
  };
}

/**
 * Actualités publiées : lecture Supabase (news where status='published'),
 * fallback sur le seed local si Supabase absent ou aucune actu publiée.
 */
export async function getPublishedNews(): Promise<PublicNews[]> {
  const supabase = createPublicClient();
  if (!supabase) return seedNews.map(seedToPublic);

  const { data, error } = await supabase
    .from("news")
    .select("id, slug, title, excerpt, content, image_key, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data || data.length === 0) return seedNews.map(seedToPublic);

  return data.map((n) => ({
    id: n.id as string,
    slug: n.slug as string,
    title: n.title as string,
    excerpt: (n.excerpt as string) ?? "",
    content: (n.content as string) ?? "",
    author: "L'équipe D2V",
    publishedAt: (n.published_at as string) ?? (n.created_at as string),
    imageUrl: resolveImage(n.image_key as string | null),
  }));
}

export async function getNewsBySlug(slug: string): Promise<PublicNews | null> {
  const all = await getPublishedNews();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const all = await getPublishedNews();
  return all.map((n) => n.slug);
}
