"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";
import { slugify } from "@/lib/utils";

const newsSchema = z.object({
  title: z.string().min(1).max(240),
  slug: z.string().min(1).max(240).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  image_key: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

const newsUpdateSchema = z.object({
  title: z.string().min(1).max(240),
  slug: z.string().min(1).max(240).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1),
  image_key: z.string().optional(),
  status: z.enum(["draft", "published"]),
});

export async function createNews(formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const title = String(formData.get("title") ?? "");
  const status = String(formData.get("status") ?? "draft");
  const parsed = newsSchema.parse({
    title,
    slug: String(formData.get("slug") ?? "") || slugify(title),
    excerpt: formData.get("excerpt") ?? undefined,
    content: formData.get("content"),
    image_key: (formData.get("image_key") as string) || undefined,
    status,
  });
  const { error } = await supabase.from("news").insert({
    ...parsed,
    slug: parsed.slug ?? slugify(title),
    author_id: user.id,
    published_at: parsed.status === "published" ? new Date().toISOString() : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
}

export async function updateNews(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing_id");

  const parsed = newsUpdateSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: (formData.get("excerpt") as string) || undefined,
    content: formData.get("content"),
    image_key: (formData.get("image_key") as string) || undefined,
    status: formData.get("status"),
  });

  const { data: existing } = await supabase
    .from("news")
    .select("status, published_at, image_key")
    .eq("id", id)
    .maybeSingle();
  if (!existing) throw new Error("news_not_found");

  const wasPublished = existing.status === "published";
  const nowPublished = parsed.status === "published";
  const published_at = nowPublished
    ? (wasPublished ? existing.published_at : new Date().toISOString())
    : null;

  const { error } = await supabase
    .from("news")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt ?? null,
      content: parsed.content,
      image_key: parsed.image_key ?? existing.image_key ?? null,
      status: parsed.status,
      published_at,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
  revalidatePath(`/actualites/${parsed.slug}`);
  redirect("/admin/actualites");
}

export async function togglePublish(id: string, next: "draft" | "published") {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("news")
    .update({
      status: next,
      published_at: next === "published" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
}

export async function togglePublishForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "draft") as "draft" | "published";
  await togglePublish(id, next);
}

export async function deleteNews(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/actualites");
  revalidatePath("/actualites");
}
