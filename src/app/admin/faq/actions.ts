"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/actions/guards";

const faqSchema = z.object({
  question: z.string().min(1).max(240),
  answer: z.string().min(1).max(4000),
  order_index: z.coerce.number().int().min(0).default(0),
  is_active: z.coerce.boolean().default(true),
});

export async function createFaq(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = faqSchema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    order_index: formData.get("order_index") ?? 0,
    is_active: formData.get("is_active") === "on",
  });
  const { error } = await supabase.from("faq").insert(parsed);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faq");
  revalidatePath("/");
}

export async function updateFaq(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("missing_id");
  const parsed = faqSchema.parse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    order_index: formData.get("order_index") ?? 0,
    is_active: formData.get("is_active") === "on",
  });
  const { error } = await supabase.from("faq").update(parsed).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faq");
  revalidatePath("/");
  redirect("/admin/faq");
}

export async function deleteFaq(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const { error } = await supabase.from("faq").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/faq");
  revalidatePath("/");
}
