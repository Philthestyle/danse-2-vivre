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
  if (error) {
    console.error("[createGroup] course_groups insert failed", { parsed, error });
    throw new Error(`Création groupe échouée: ${error.message} (code=${error.code ?? "?"})`);
  }

  const { error: convErr } = await supabase.from("conversations").insert({
    kind: "group",
    group_id: group.id,
  });
  if (convErr) {
    console.error("[createGroup] conversation insert failed", {
      group_id: group.id,
      convErr,
    });
    throw new Error(
      `Groupe créé mais conversation associée échouée: ${convErr.message} (code=${convErr.code ?? "?"})`,
    );
  }

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
