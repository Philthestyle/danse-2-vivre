import { NextResponse } from "next/server";

/**
 * Expose la config Supabase publique à l'outil QA (public/qa/index.html).
 * Uniquement URL + anon key — ces valeurs sont déjà publiques côté navigateur.
 * Permet à un fichier HTML statique de découvrir dynamiquement les env vars
 * sans devoir les baker au build.
 */
export function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
  return NextResponse.json(
    { url, anonKey },
    { headers: { "Cache-Control": "public, max-age=60, s-maxage=60" } }
  );
}
