import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { updateCourse } from "../../actions";

export const metadata: Metadata = {
  title: "Modifier cours · Admin",
  robots: { index: false, follow: false },
};

// Convertit ISO UTC en local datetime-local (YYYY-MM-DDTHH:MM)
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (IS_STATIC_PREVIEW) return null;
  const { id } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [{ data: course }, { data: teachers }, { data: cities }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, description, starts_at, ends_at, teacher_id, city_id")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("teachers").select("id, slug, profile:profiles(first_name)").order("slug"),
    supabase.from("cities").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!course) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title={`Modifier « ${course.title} »`}
        description="Édition d'un cours planifié."
      />

      <div className="mb-4">
        <Link href="/admin/cours" className="text-sm text-muted hover:text-fg">
          ← Retour à la liste
        </Link>
      </div>

      <form action={updateCourse} className="card p-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={course.id} />

        <div className="sm:col-span-2">
          <label htmlFor="title" className="label">Titre</label>
          <input id="title" name="title" required defaultValue={course.title} className="field" />
        </div>

        <div>
          <label htmlFor="teacher_id" className="label">Professeur</label>
          <select id="teacher_id" name="teacher_id" required defaultValue={course.teacher_id} className="field">
            {(teachers ?? []).map((t) => {
              const p = Array.isArray(t.profile) ? t.profile[0] : t.profile;
              return (
                <option key={t.id} value={t.id}>
                  {p?.first_name} ({t.slug})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label htmlFor="city_id" className="label">Ville</label>
          <select id="city_id" name="city_id" defaultValue={course.city_id ?? ""} className="field">
            <option value="">— Aucune —</option>
            {(cities ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="starts_at" className="label">Début</label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(course.starts_at)}
            className="field"
          />
        </div>

        <div>
          <label htmlFor="ends_at" className="label">Fin</label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            required
            defaultValue={toLocalInput(course.ends_at)}
            className="field"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={course.description ?? ""}
            className="field"
          />
        </div>

        <div className="sm:col-span-2 flex gap-3">
          <button type="submit" className="btn-primary">Enregistrer</button>
          <Link href="/admin/cours" className="btn-ghost">Annuler</Link>
        </div>
      </form>
    </div>
  );
}
