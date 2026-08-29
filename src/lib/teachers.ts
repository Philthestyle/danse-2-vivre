import { withBasePath } from "@/lib/paths";
import { createPublicClient } from "@/lib/supabase/public";
import { seedTeachers } from "@/lib/data/seed";

export interface PublicTeacher {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  speciality: string;
  bio: string;
  startedAt: string | null;
  photoUrl: string | null;
  cities: string[];
}

/**
 * Résout la source d'une photo teacher :
 *   - URL absolue (http/https)             → renvoyée telle quelle (S3 signé, CDN, etc.)
 *   - chemin relatif (teachers/xxx.png)    → sert depuis /public/images/<key>
 *   - null                                  → pas de photo
 */
function resolvePhoto(photoKey: string | null | undefined): string | null {
  if (!photoKey) return null;
  if (/^https?:\/\//.test(photoKey)) return photoKey;
  return withBasePath(`/images/${photoKey}`);
}

/**
 * Récupère la liste publique des professeurs depuis Supabase.
 * Fallback sur le seed local si Supabase n'est pas atteignable
 * (build offline ou preview sans anon key configuré).
 */
export async function getTeachers(): Promise<PublicTeacher[]> {
  const supabase = createPublicClient();
  if (!supabase) return fallbackFromSeed();

  const { data, error } = await supabase
    .from("teachers")
    .select(
      "id, slug, speciality, bio, started_at, photo_key, profile:profiles(first_name, last_name)"
    )
    .order("slug");

  if (error || !data || data.length === 0) return fallbackFromSeed();

  return data.map((t) => {
    const profile = Array.isArray(t.profile) ? t.profile[0] : t.profile;
    return {
      id: t.id as string,
      slug: t.slug as string,
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      speciality: (t.speciality as string) ?? "",
      bio: (t.bio as string) ?? "",
      startedAt: (t.started_at as string) ?? null,
      photoUrl: resolvePhoto(t.photo_key as string | null),
      cities: [],
    };
  });
}

export async function getTeacherBySlug(slug: string): Promise<PublicTeacher | null> {
  const all = await getTeachers();
  return all.find((t) => t.slug === slug) ?? null;
}

/**
 * Email d'un professeur — SERVER-ONLY (utilise service_role).
 * Retourne null si le backend n'est pas configuré ou si le prof est introuvable.
 * Utilisé par la fiche prof pour générer un lien mailto: (brief Allan §3).
 */
export async function getTeacherEmail(slug: string): Promise<string | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const admin = createAdminClient();
    const { data: teacher } = await admin
      .from("teachers")
      .select("profile_id")
      .eq("slug", slug)
      .maybeSingle();
    const profileId = teacher?.profile_id as string | undefined;
    if (!profileId) return null;
    const { data } = await admin.auth.admin.getUserById(profileId);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}

function fallbackFromSeed(): PublicTeacher[] {
  return seedTeachers.map((t) => ({
    id: t.slug,
    slug: t.slug,
    firstName: t.firstName,
    lastName: t.lastName,
    speciality: t.speciality,
    bio: t.bio,
    startedAt: t.startedAt,
    photoUrl: withBasePath(`/images/teachers/${t.slug}.png`),
    cities: t.cities,
  }));
}
