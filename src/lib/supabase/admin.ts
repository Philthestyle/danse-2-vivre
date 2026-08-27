import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase admin (service_role) — SERVER-ONLY.
 *
 * ⚠️  Ne JAMAIS importer ce module depuis un composant client. La clé
 * service_role bypass RLS. Réservé aux server actions/routes API qui ont
 * validé le rôle admin en amont.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquant — refusé côté serveur uniquement."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
