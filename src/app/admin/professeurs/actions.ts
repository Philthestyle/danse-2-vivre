"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

const teacherUpdateSchema = z.object({
  speciality: z.string().min(1).max(240),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  bio: z.string().max(4000).optional(),
  started_at: z.string().optional(),
  photo_key: z.string().optional(),
});

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

export async function updateTeacher(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing_id");

  const parsed = teacherUpdateSchema.parse({
    speciality: formData.get("speciality"),
    slug: formData.get("slug"),
    bio: (formData.get("bio") as string) || undefined,
    started_at: (formData.get("started_at") as string) || undefined,
    photo_key: (formData.get("photo_key") as string) || undefined,
  });

  const { error } = await supabase
    .from("teachers")
    .update({
      speciality: parsed.speciality,
      slug: parsed.slug,
      bio: parsed.bio ?? null,
      started_at: parsed.started_at || null,
      photo_key: parsed.photo_key || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/professeurs");
  revalidatePath("/professeurs");
  revalidatePath(`/professeurs/${parsed.slug}`);
  redirect("/admin/professeurs");
}

export async function toggleTeacher(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  const { error } = await supabase
    .from("teachers")
    .update({ is_active: next })
    .eq("id", id);
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
