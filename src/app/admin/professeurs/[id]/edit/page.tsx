import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { Uploader } from "@/components/features/Uploader";
import { updateTeacher } from "../../actions";

export const metadata: Metadata = {
  title: "Modifier professeur · Admin",
  robots: { index: false, follow: false },
};

export default async function EditTeacherPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (IS_STATIC_PREVIEW) return null;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, slug, speciality, bio, started_at, photo_key, is_active, profile:profiles(first_name, last_name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!teacher) notFound();

  const profile = Array.isArray(teacher.profile) ? teacher.profile[0] : teacher.profile;
  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();

  return (
    <div>
      <PageHeader
        eyebrow="Équipe"
        title={`Modifier ${fullName || teacher.slug}`}
        description="Modification des informations publiques du professeur."
      />

      <div className="mb-4">
        <Link href="/admin/professeurs" className="text-sm text-muted hover:text-fg">
          ← Retour à la liste
        </Link>
      </div>

      <form action={updateTeacher} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={teacher.id} />

        <div>
          <label htmlFor="speciality" className="label">Spécialité</label>
          <input
            id="speciality"
            name="speciality"
            required
            defaultValue={teacher.speciality}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="slug" className="label">Slug (URL publique)</label>
          <input
            id="slug"
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={teacher.slug}
            className="field"
          />
          <p className="mt-1 text-xs text-muted">
            URL publique : <code>/professeurs/{teacher.slug}</code>
          </p>
        </div>

        <div>
          <label htmlFor="bio" className="label">Bio</label>
          <textarea
            id="bio"
            name="bio"
            className="field"
            rows={5}
            defaultValue={teacher.bio ?? ""}
          />
        </div>

        <div>
          <label htmlFor="started_at" className="label">Date de début</label>
          <input
            id="started_at"
            name="started_at"
            type="date"
            className="field"
            defaultValue={teacher.started_at ?? ""}
          />
        </div>

        <div>
          <label className="label">Photo (laisser vide pour conserver)</label>
          <Uploader category="teacher" hiddenName="photo_key" />
          {teacher.photo_key && (
            <p className="mt-1 text-xs text-muted">
              Photo actuelle : <code>{teacher.photo_key}</code>
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Enregistrer</button>
          <Link href="/admin/professeurs" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
