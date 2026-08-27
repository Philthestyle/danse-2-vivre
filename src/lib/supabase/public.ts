import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase "public" pour lecture au build (SSG) et depuis les composants
 * serveur qui n'ont pas besoin de la session utilisateur. Utilise la clé anon —
 * RLS s'applique donc les tables privées restent inaccessibles.
 *
 * Différent du `createClient` de server.ts (qui lit les cookies session).
 */
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
