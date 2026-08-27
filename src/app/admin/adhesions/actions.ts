"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const statusSchema = z.enum(["pending", "active", "expired", "cancelled"]);

export async function updateMembershipStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = statusSchema.parse(formData.get("status"));
  const patch: Record<string, unknown> = { status };
  if (status === "active") {
    patch.starts_on = new Date().toISOString().slice(0, 10);
  }
  const { error } = await supabase.from("memberships").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/adhesions");
}
