/**
 * Détecte si le build est en mode "static preview" (GitHub Pages).
 * En preview, les pages privées et l'admin doivent rendre un placeholder
 * expliquant que le backend (Supabase, Auth, S3) n'est disponible qu'en local
 * ou en production réelle (cf. docs/AUDIT.md §9).
 */
export const IS_STATIC_PREVIEW = process.env.STATIC_EXPORT === "1";
