"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const groupSchema = z.object({
  course_id: z.string().uuid(),
  name: z.string().min(1).max(120),
  mode: z.enum(["normal", "announcement_only"]).default("normal"),
});

export async function createGroup(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = groupSchema.parse({
    course_id: formData.get("course_id"),
    name: formData.get("name"),
    mode: formData.get("mode") ?? "normal",
  });
  const { data: group, error } = await supabase
    .from("course_groups")
    .insert(parsed)
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  // Crée la conversation de groupe associée
  const { error: convErr } = await supabase.from("conversations").insert({
    kind: "group",
    group_id: group.id,
  });
  if (convErr) throw new Error(convErr.message);

  revalidatePath("/admin/groupes");
}

export async function toggleMode(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const next = String(formData.get("next") ?? "normal") as "normal" | "announcement_only";
  const { error } = await supabase
    .from("course_groups")
    .update({ mode: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groupes");
}

export async function deleteGroup(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("course_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groupes");
}
