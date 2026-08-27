import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur.
 * Utilise UNIQUEMENT la clé anon (NEXT_PUBLIC_*). Ne jamais y injecter service_role.
 *
 * Renvoie null si les env vars ne sont pas configurés (build preview sans secrets)
 * pour éviter un crash client — les callers gèrent le fallback.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== "undefined") {
      console.warn(
        "[Supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY manquants — client non initialisé."
      );
    }
    return null;
  }
  return createBrowserClient(url, key);
}

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Backend Supabase non configuré dans cette preview. Les fonctions Auth / DB / Realtime nécessitent un déploiement complet."
    );
    this.name = "SupabaseNotConfiguredError";
  }
}
