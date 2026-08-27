import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { createGroup, deleteGroup, toggleMode } from "./actions";

export const metadata: Metadata = {
  title: "Groupes · Admin",
  robots: { index: false, follow: false },
};

interface GroupRow {
  id: string;
  name: string;
  mode: "normal" | "announcement_only";
  course: { title: string } | { title: string }[] | null;
}

export default async function AdminGroupsPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [{ data: groupsData }, { data: courses }] = await Promise.all([
    supabase
      .from("course_groups")
      .select("id, name, mode, course:courses(title)")
      .order("name"),
    supabase.from("courses").select("id, title").order("title"),
  ]);

  const groups: GroupRow[] = (groupsData ?? []) as unknown as GroupRow[];

  return (
    <div>
      <PageHeader
        eyebrow="Communauté"
        title="Groupes de cours"
        description="Chaque groupe a une conversation associée. Mode annonces = seuls prof et admin écrivent."
      />

      <details className="card mb-8 p-5">
        <summary className="cursor-pointer text-lg font-semibold">Nouveau groupe</summary>
        <form action={createGroup} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="course_id" className="label">Cours</label>
            <select id="course_id" name="course_id" required className="field">
              <option value="">— Choisir un cours —</option>
              {(courses ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="name" className="label">Nom du groupe</label>
            <input id="name" name="name" required className="field" placeholder="Groupe débutants" />
          </div>
          <div>
            <label htmlFor="mode" className="label">Mode</label>
            <select id="mode" name="mode" className="field" defaultValue="normal">
              <option value="normal">Normal (tous écrivent)</option>
              <option value="announcement_only">Annonces (prof/admin seuls)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary sm:col-span-2">Créer</button>
        </form>
      </details>

      <DataTable
        rows={groups}
        empty="Aucun groupe."
        columns={[
          {
            key: "course",
            header: "Cours",
            render: (g) => {
              const c = Array.isArray(g.course) ? g.course[0] : g.course;
              return <span className="font-medium">{c?.title ?? "—"}</span>;
            },
          },
          { key: "name", header: "Groupe" },
          {
            key: "mode",
            header: "Mode",
            className: "w-40",
            render: (g) => (
              <span
                className={`rounded-pill px-3 py-1 text-xs ${
                  g.mode === "announcement_only"
                    ? "bg-accent/20 text-accent-fg"
                    : "bg-elevated"
                }`}
              >
                {g.mode === "announcement_only" ? "Annonces" : "Normal"}
              </span>
            ),
          },
        ]}
        actions={(g) => (
          <>
            <form action={toggleMode}>
              <input type="hidden" name="id" value={g.id} />
              <input
                type="hidden"
                name="next"
                value={g.mode === "announcement_only" ? "normal" : "announcement_only"}
              />
              <button type="submit" className="btn-ghost text-primary">
                {g.mode === "announcement_only" ? "→ Normal" : "→ Annonces"}
              </button>
            </form>
            <form action={deleteGroup}>
              <input type="hidden" name="id" value={g.id} />
              <ConfirmSubmit />
            </form>
          </>
        )}
      />
    </div>
  );
}
