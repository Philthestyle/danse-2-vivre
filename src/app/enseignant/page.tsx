import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Espace professeur",
  robots: { index: false, follow: false },
};

interface CourseRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  city: { name: string } | { name: string }[] | null;
}

interface GroupRow {
  id: string;
  name: string;
  mode: string;
  course: { title: string } | { title: string }[] | null;
}

export default async function TeacherSpacePage() {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Espace professeur" />;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/enseignant");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile.role !== "teacher" && profile.role !== "admin")) {
    redirect("/profil");
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, slug, speciality")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!teacher) {
    return (
      <div className="container-page py-16">
        <PageHeader
          eyebrow="Bienvenue"
          title="Espace professeur"
          description="Votre compte enseignant n'a pas encore été rattaché à un profil professeur. Contactez l'administration."
        />
      </div>
    );
  }

  const [{ data: coursesData }, { data: groupsData }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, starts_at, ends_at, city:cities(name)")
      .eq("teacher_id", teacher.id)
      .order("starts_at", { ascending: false })
      .limit(20),
    supabase
      .from("course_groups")
      .select("id, name, mode, course:courses(title)")
      .in(
        "course_id",
        (
          await supabase.from("courses").select("id").eq("teacher_id", teacher.id)
        ).data?.map((c) => c.id) ?? []
      ),
  ]);

  const courses: CourseRow[] = (coursesData ?? []) as unknown as CourseRow[];
  const groups: GroupRow[] = (groupsData ?? []) as unknown as GroupRow[];

  return (
    <div className="container-page py-16">
      <PageHeader
        eyebrow={`Bonjour ${profile.first_name}`}
        title="Espace professeur"
        description={`Vous enseignez : ${teacher.speciality}. Ci-dessous vos cours et groupes.`}
        actions={
          <Link href="/messagerie" className="btn-outline">
            Messagerie
          </Link>
        }
      />

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-2xl">Mes cours</h2>
          {courses.length === 0 ? (
            <div className="card p-6 text-center text-muted">
              Aucun cours planifié. L'administration peut vous en attribuer.
            </div>
          ) : (
            <ul className="space-y-3">
              {courses.map((c) => {
                const city = Array.isArray(c.city) ? c.city[0] : c.city;
                return (
                  <li key={c.id} className="card p-4">
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted">
                      {city?.name ?? "—"} · {formatDateTime(c.starts_at)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-2xl">Mes groupes</h2>
          {groups.length === 0 ? (
            <div className="card p-6 text-center text-muted">
              Aucun groupe pour l'instant.
            </div>
          ) : (
            <ul className="space-y-3">
              {groups.map((g) => {
                const c = Array.isArray(g.course) ? g.course[0] : g.course;
                return (
                  <li key={g.id} className="card p-4">
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted">
                      {c?.title} · mode{" "}
                      <span className="font-mono">{g.mode}</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
