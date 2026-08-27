import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase pour le navigateur.
 * Utilise UNIQUEMENT la clé anon (NEXT_PUBLIC_*). Ne jamais y injecter service_role.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
