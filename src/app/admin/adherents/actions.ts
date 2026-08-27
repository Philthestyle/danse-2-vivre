"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const roleSchema = z.enum(["member", "teacher", "admin"]);

export async function updateRole(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = roleSchema.parse(formData.get("role"));
  const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/adherents");
}
