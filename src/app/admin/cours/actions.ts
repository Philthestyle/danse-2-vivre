"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const courseSchema = z
  .object({
    teacher_id: z.string().uuid(),
    city_id: z.string().uuid().nullable().optional(),
    title: z.string().min(1).max(240),
    description: z.string().max(2000).optional(),
    starts_at: z.string().min(1),
    ends_at: z.string().min(1),
  })
  .refine((v) => new Date(v.ends_at) > new Date(v.starts_at), {
    message: "ends_at doit être postérieur à starts_at",
    path: ["ends_at"],
  });

export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = courseSchema.parse({
    teacher_id: formData.get("teacher_id"),
    city_id: (formData.get("city_id") as string) || null,
    title: formData.get("title"),
    description: (formData.get("description") as string) || undefined,
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });
  const { error } = await supabase.from("courses").insert({
    ...parsed,
    city_id: parsed.city_id || null,
    starts_at: new Date(parsed.starts_at).toISOString(),
    ends_at: new Date(parsed.ends_at).toISOString(),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cours");
  revalidatePath("/calendrier");
}

export async function updateCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing_id");

  const parsed = courseSchema.parse({
    teacher_id: formData.get("teacher_id"),
    city_id: (formData.get("city_id") as string) || null,
    title: formData.get("title"),
    description: (formData.get("description") as string) || undefined,
    starts_at: formData.get("starts_at"),
    ends_at: formData.get("ends_at"),
  });

  const { error } = await supabase
    .from("courses")
    .update({
      teacher_id: parsed.teacher_id,
      city_id: parsed.city_id || null,
      title: parsed.title,
      description: parsed.description ?? null,
      starts_at: new Date(parsed.starts_at).toISOString(),
      ends_at: new Date(parsed.ends_at).toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/cours");
  revalidatePath("/calendrier");
  redirect("/admin/cours");
}

export async function deleteCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cours");
  revalidatePath("/calendrier");
}
