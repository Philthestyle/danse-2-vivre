"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";
import { slugify } from "@/lib/utils";

const teacherSchema = z.object({
  profile_id: z.string().uuid(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  speciality: z.string().min(1).max(240),
  bio: z.string().max(4000).optional(),
  started_at: z.string().optional(),
  photo_key: z.string().optional(),
});

/**
 * Crée un teacher lié à un profile existant. Promeut le profile à role=teacher.
 * Ne PAS confondre avec l'inscription d'un membre : le teacher doit d'abord avoir
 * un compte auth (créé via inscription normale), puis un admin le promeut ici.
 */
export async function createTeacher(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = teacherSchema.parse({
    profile_id: formData.get("profile_id"),
    slug: (formData.get("slug") as string) || undefined,
    speciality: formData.get("speciality"),
    bio: (formData.get("bio") as string) || undefined,
    started_at: (formData.get("started_at") as string) || undefined,
    photo_key: (formData.get("photo_key") as string) || undefined,
  });

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", parsed.profile_id)
    .maybeSingle();
  if (!profile) throw new Error("profile_not_found");

  const slug =
    parsed.slug ??
    slugify(`${profile.first_name} ${profile.last_name}`.trim() || parsed.speciality);

  // Promotion role=teacher (autorisée car l'appelant est admin ; trigger valide)
  const { error: promoteErr } = await supabase
    .from("profiles")
    .update({ role: "teacher" })
    .eq("id", parsed.profile_id);
  if (promoteErr) throw new Error(promoteErr.message);

  const { error } = await supabase.from("teachers").insert({
    profile_id: parsed.profile_id,
    slug,
    speciality: parsed.speciality,
    bio: parsed.bio,
    started_at: parsed.started_at || null,
    photo_key: parsed.photo_key || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/professeurs");
  revalidatePath("/professeurs");
}

export async function deleteTeacher(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/professeurs");
  revalidatePath("/professeurs");
}
