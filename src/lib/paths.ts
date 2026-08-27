/**
 * Préfixe un chemin absolu (/images/...) avec le basePath de l'app.
 *
 * En dev : NEXT_PUBLIC_BASE_PATH est vide → path renvoyé tel quel.
 * En preview GH Pages : NEXT_PUBLIC_BASE_PATH = "/danse-2-vivre" → prefix appliqué.
 *
 * À utiliser pour :
 * - background-image en CSS inline (next/image applique déjà basePath, mais pas
 *   le CSS custom)
 * - URLs stockées dans du texte / JSON servi à un <img> non-Next
 *
 * ⚠️ Ne pas appliquer manuellement aux src de <Image> de next/image :
 * Next le fait déjà automatiquement.
 */
export function withBasePath(path: string): string {
  if (!path.startsWith("/")) return path;
  const bp = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${bp}${path}`;
}
