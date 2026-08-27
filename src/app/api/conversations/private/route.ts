import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  teacherSlug: z.string().min(1).max(120),
});

/**
 * Crée (ou récupère) une conversation privée entre le user courant (member)
 * et le professeur ciblé. La contrainte member↔member est doublement bloquée :
 * - par la fonction SQL private_conversation_is_allowed (RLS)
 * - par cette route qui vérifie le rôle prof.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Récupère le profile_id du prof cible
  const { data: teacher } = await supabase
    .from("teachers")
    .select("profile_id, profile:profiles(role)")
    .eq("slug", parsed.data.teacherSlug)
    .maybeSingle();

  if (!teacher) {
    return NextResponse.json({ error: "teacher_not_found" }, { status: 404 });
  }
  const teacherProfile = Array.isArray(teacher.profile) ? teacher.profile[0] : teacher.profile;
  if (!teacherProfile || teacherProfile.role === "member") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (teacher.profile_id === user.id) {
    return NextResponse.json({ error: "cannot_message_self" }, { status: 400 });
  }

  // Cherche une conversation existante (either direction)
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("kind", "private")
    .or(
      `and(member_a.eq.${user.id},member_b.eq.${teacher.profile_id}),and(member_a.eq.${teacher.profile_id},member_b.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ id: existing.id });
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({
      kind: "private",
      member_a: user.id,
      member_b: teacher.profile_id,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Ajoute les deux membres à conversation_members
  await supabase.from("conversation_members").insert([
    { conversation_id: created.id, profile_id: user.id },
    { conversation_id: created.id, profile_id: teacher.profile_id },
  ]);

  return NextResponse.json({ id: created.id });
}
