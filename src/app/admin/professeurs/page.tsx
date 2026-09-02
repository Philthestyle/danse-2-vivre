import Link from "next/link";
import type { Metadata, Route } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { Uploader } from "@/components/features/Uploader";
import { createTeacher, deleteTeacher, toggleTeacher } from "./actions";

export const metadata: Metadata = {
  title: "Professeurs · Admin",
  robots: { index: false, follow: false },
};

interface TeacherRow {
  id: string;
  slug: string;
  speciality: string;
  started_at: string | null;
  is_active: boolean;
  profile: { id: string; first_name: string; last_name: string } | { id: string; first_name: string; last_name: string }[] | null;
}

interface Member {
  id: string;
  first_name: string;
  last_name: string;
}

export default async function AdminTeachersPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const [{ data: teachersData }, { data: members }] = await Promise.all([
    supabase
      .from("teachers")
      .select("id, slug, speciality, started_at, is_active, profile:profiles(id, first_name, last_name)")
      .order("slug"),
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "member")
      .order("first_name"),
  ]);

  const teachers: TeacherRow[] = (teachersData ?? []) as TeacherRow[];
  const availableMembers: Member[] = (members ?? []) as Member[];

  return (
    <div>
      <PageHeader
        eyebrow="Équipe"
        title="Professeurs"
        description="Promotion d'un adhérent en professeur : choisir un compte existant, définir spécialité + photo."
      />

      <details className="card mb-8 p-5">
        <summary className="cursor-pointer text-lg font-semibold">
          Ajouter un professeur
        </summary>
        <form action={createTeacher} className="mt-4 space-y-3">
          <div>
            <label htmlFor="profile_id" className="label">Membre à promouvoir</label>
            <select id="profile_id" name="profile_id" required className="field">
              <option value="">— Choisir un adhérent —</option>
              {availableMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.first_name} {m.last_name}
                </option>
              ))}
            </select>
            {availableMembers.length === 0 && (
              <p className="mt-1 text-xs text-muted">
                Aucun adhérent disponible. Un professeur doit d'abord s'inscrire comme membre.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="speciality" className="label">Spécialité</label>
            <input id="speciality" name="speciality" required className="field" placeholder="Salsa & Bachata" />
          </div>
          <div>
            <label htmlFor="slug" className="label">Slug (optionnel)</label>
            <input id="slug" name="slug" pattern="[a-z0-9-]+" className="field" placeholder="paolo" />
          </div>
          <div>
            <label htmlFor="started_at" className="label">Date de début</label>
            <input id="started_at" name="started_at" type="date" className="field" />
          </div>
          <div>
            <label htmlFor="bio" className="label">Bio</label>
            <textarea id="bio" name="bio" className="field" rows={3} />
          </div>
          <div>
            <label className="label">Photo</label>
            <Uploader category="teacher" hiddenName="photo_key" />
          </div>
          <button type="submit" className="btn-primary">Créer le professeur</button>
        </form>
      </details>

      <DataTable
        rows={teachers}
        empty="Aucun professeur pour le moment."
        columns={[
          {
            key: "name",
            header: "Nom",
            render: (t) => {
              const p = Array.isArray(t.profile) ? t.profile[0] : t.profile;
              return (
                <div>
                  <p className="font-medium">
                    {p?.first_name} {p?.last_name}
                  </p>
                  <p className="text-xs text-muted font-mono">/{t.slug}</p>
                </div>
              );
            },
          },
          { key: "speciality", header: "Spécialité" },
          {
            key: "started_at",
            header: "Depuis",
            render: (t) => (t.started_at ? new Date(t.started_at).getFullYear() : "—"),
            className: "w-24",
          },
          {
            key: "is_active",
            header: "Statut",
            className: "w-28",
            render: (t) => (
              <span
                className={`rounded-pill px-3 py-1 text-xs ${
                  t.is_active
                    ? "bg-success/15 text-success"
                    : "bg-elevated text-muted"
                }`}
              >
                {t.is_active ? "Actif" : "Inactif"}
              </span>
            ),
          },
        ]}
        actions={(t) => (
          <>
            <Link
              href={`/admin/professeurs/${t.id}/edit` as Route}
              className="btn-ghost text-primary"
            >
              Modifier
            </Link>
            <form action={toggleTeacher}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="next" value={t.is_active ? "false" : "true"} />
              <button type="submit" className="btn-ghost">
                {t.is_active ? "Désactiver" : "Activer"}
              </button>
            </form>
            <form action={deleteTeacher}>
              <input type="hidden" name="id" value={t.id} />
              <ConfirmSubmit />
            </form>
          </>
        )}
      />
    </div>
  );
}
