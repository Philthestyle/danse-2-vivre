"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const gallerySchema = z.object({
  title: z.string().min(1).max(240),
  description: z.string().max(1000).optional(),
  media_key: z.string().min(1),
  order_index: z.coerce.number().int().min(0).default(0),
  is_active: z.coerce.boolean().default(true),
});

export async function createGalleryItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = gallerySchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    media_key: formData.get("media_key"),
    order_index: formData.get("order_index") ?? 0,
    is_active: formData.get("is_active") === "on",
  });
  const { error } = await supabase.from("gallery").insert(parsed);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/galerie");
  revalidatePath("/");
}

export async function deleteGalleryItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("gallery").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/galerie");
  revalidatePath("/");
}
