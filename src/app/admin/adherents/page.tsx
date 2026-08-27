import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { updateRole } from "./actions";

const ROLE_OPTIONS = [
  { value: "member", label: "member" },
  { value: "teacher", label: "teacher" },
  { value: "admin", label: "admin" },
] as const;

export const metadata: Metadata = {
  title: "Adhérents · Admin",
  robots: { index: false, follow: false },
};

interface MemberRow {
  id: string;
  first_name: string;
  last_name: string;
  role: "member" | "teacher" | "admin";
  pack: "classique" | "village" | null;
  created_at: string;
  city: { name: string } | { name: string }[] | null;
}

export default async function AdminMembersPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, role, pack, created_at, city:cities(name)")
    .order("created_at", { ascending: false });

  const members: MemberRow[] = (data ?? []) as unknown as MemberRow[];

  return (
    <div>
      <PageHeader
        eyebrow="Communauté"
        title="Adhérents"
        description="Liste des comptes. Changer le rôle est possible uniquement ici (les triggers Supabase empêchent l'auto-promotion)."
      />

      <DataTable
        rows={members}
        empty="Aucun adhérent."
        columns={[
          {
            key: "name",
            header: "Nom",
            render: (m) => (
              <span className="font-medium">
                {m.first_name} {m.last_name}
              </span>
            ),
          },
          {
            key: "pack",
            header: "Forfait",
            render: (m) => m.pack ?? "—",
            className: "w-32 capitalize",
          },
          {
            key: "city",
            header: "Ville",
            render: (m) => {
              const c = Array.isArray(m.city) ? m.city[0] : m.city;
              return c?.name ?? "—";
            },
          },
          {
            key: "created_at",
            header: "Inscrit le",
            render: (m) => <span className="text-sm">{formatDate(m.created_at)}</span>,
          },
          {
            key: "role",
            header: "Rôle",
            className: "w-40",
            render: (m) => (
              <form action={updateRole} className="flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <AutoSubmitSelect
                  name="role"
                  defaultValue={m.role}
                  options={ROLE_OPTIONS}
                  ariaLabel={`Rôle de ${m.first_name}`}
                />
              </form>
            ),
          },
        ]}
      />
    </div>
  );
}
