import Link from "next/link";
import type { Metadata, Route } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { formatDateTime } from "@/lib/utils";
import { createCourse, deleteCourse } from "./actions";

export const metadata: Metadata = {
  title: "Cours · Admin",
  robots: { index: false, follow: false },
};

interface CourseRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  teacher: { slug: string; profile: { first_name: string } | { first_name: string }[] } | null;
  city: { name: string } | { name: string }[] | null;
}

export default async function AdminCoursesPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [{ data: coursesData }, { data: teachers }, { data: cities }] = await Promise.all([
    supabase
      .from("courses")
      .select(
        "id, title, starts_at, ends_at, teacher:teachers(slug, profile:profiles(first_name)), city:cities(name)"
      )
      .order("starts_at", { ascending: false }),
    supabase.from("teachers").select("id, slug, profile:profiles(first_name)").order("slug"),
    supabase.from("cities").select("id, name").eq("is_active", true).order("name"),
  ]);

  const courses: CourseRow[] = (coursesData ?? []) as unknown as CourseRow[];

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Cours & calendrier"
        description="Création des cours. Chaque cours est rattaché à un professeur et une ville."
      />

      <details className="card mb-8 p-5">
        <summary className="cursor-pointer text-lg font-semibold">Nouveau cours</summary>
        <form action={createCourse} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="label">Titre</label>
            <input id="title" name="title" required className="field" />
          </div>
          <div>
            <label htmlFor="teacher_id" className="label">Professeur</label>
            <select id="teacher_id" name="teacher_id" required className="field">
              <option value="">— Choisir —</option>
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
            <select id="city_id" name="city_id" className="field">
              <option value="">— Aucune —</option>
              {(cities ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="starts_at" className="label">Début</label>
            <input id="starts_at" name="starts_at" type="datetime-local" required className="field" />
          </div>
          <div>
            <label htmlFor="ends_at" className="label">Fin</label>
            <input id="ends_at" name="ends_at" type="datetime-local" required className="field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="description" className="label">Description</label>
            <textarea id="description" name="description" className="field" rows={2} />
          </div>
          <button type="submit" className="btn-primary sm:col-span-2">Créer le cours</button>
        </form>
      </details>

      <DataTable
        rows={courses}
        empty="Aucun cours planifié."
        columns={[
          { key: "title", header: "Titre", render: (c) => <span className="font-medium">{c.title}</span> },
          {
            key: "teacher",
            header: "Professeur",
            render: (c) => {
              const t = c.teacher;
              const p = t && (Array.isArray(t.profile) ? t.profile[0] : t.profile);
              return p?.first_name ?? "—";
            },
          },
          {
            key: "city",
            header: "Ville",
            render: (c) => {
              const city = Array.isArray(c.city) ? c.city[0] : c.city;
              return city?.name ?? "—";
            },
          },
          {
            key: "starts_at",
            header: "Début",
            render: (c) => <span className="text-sm">{formatDateTime(c.starts_at)}</span>,
          },
        ]}
        actions={(c) => (
          <>
            <Link
              href={`/admin/cours/${c.id}/edit` as Route}
              className="btn-ghost text-primary"
            >
              Modifier
            </Link>
            <form action={deleteCourse}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit />
            </form>
          </>
        )}
      />
    </div>
  );
}
