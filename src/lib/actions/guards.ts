import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Vérifie que l'appelant est admin. Retourne le client Supabase authentifié.
 * Lance une exception si non-admin — bloque toute action serveur non-autorisée
 * en plus des policies RLS (defense in depth, brief §10).
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("forbidden");

  return { supabase, user, profile };
}

export async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    throw new Error("forbidden");
  }
  return { supabase, user, profile };
}
