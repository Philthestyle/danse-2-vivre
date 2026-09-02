"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const citySchema = z.object({
  name: z.string().min(1).max(120),
  is_active: z.coerce.boolean().default(true),
});

export async function createCity(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = citySchema.parse({
    name: formData.get("name"),
    is_active: formData.get("is_active") === "on",
  });
  const { error } = await supabase.from("cities").insert(parsed);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/villes");
}

export async function toggleCity(id: string, next: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("cities")
    .update({ is_active: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/villes");
}

export async function toggleCityForm(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  await toggleCity(id, next);
}

export async function deleteCity(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/villes");
}
