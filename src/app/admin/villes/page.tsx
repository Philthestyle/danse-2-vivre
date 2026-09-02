import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmSubmit } from "@/components/ui/ConfirmSubmit";
import { createCity, deleteCity, toggleCityForm } from "./actions";

export const metadata: Metadata = {
  title: "Villes · Admin",
  robots: { index: false, follow: false },
};

interface City {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export default async function AdminCitiesPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("cities")
    .select("id, name, is_active, created_at")
    .order("name");
  const cities: City[] = (data ?? []) as City[];

  return (
    <div>
      <PageHeader
        eyebrow="Référentiel"
        title="Villes"
        description="Villes actives affichées dans le formulaire d'inscription et la liste des professeurs."
      />

      <form action={createCity} className="card mb-8 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="name" className="label">Nouvelle ville</label>
          <input id="name" name="name" required className="field" placeholder="Nom de la ville" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked className="h-4 w-4" />
          Active
        </label>
        <button type="submit" className="btn-primary">Ajouter</button>
      </form>

      <DataTable
        rows={cities}
        empty="Aucune ville pour le moment."
        columns={[
          { key: "name", header: "Nom" },
          {
            key: "is_active",
            header: "Statut",
            render: (c) => (
              <span
                className={`rounded-pill px-3 py-1 text-xs ${
                  c.is_active
                    ? "bg-success/15 text-success"
                    : "bg-elevated text-muted"
                }`}
              >
                {c.is_active ? "Active" : "Inactive"}
              </span>
            ),
          },
        ]}
        actions={(c) => (
          <>
            <form action={toggleCityForm}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="next" value={c.is_active ? "false" : "true"} />
              <button type="submit" className="btn-ghost">
                {c.is_active ? "Désactiver" : "Activer"}
              </button>
            </form>
            <form action={deleteCity}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmSubmit />
            </form>
          </>
        )}
      />
    </div>
  );
}
