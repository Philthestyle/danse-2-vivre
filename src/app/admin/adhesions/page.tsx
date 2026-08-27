import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { formatDate } from "@/lib/utils";
import { AutoSubmitSelect } from "@/components/ui/AutoSubmitSelect";
import { updateMembershipStatus } from "./actions";

const STATUS_OPTIONS = [
  { value: "pending", label: "pending" },
  { value: "active", label: "active" },
  { value: "expired", label: "expired" },
  { value: "cancelled", label: "cancelled" },
] as const;

export const metadata: Metadata = {
  title: "Adhésions · Admin",
  robots: { index: false, follow: false },
};

interface Row {
  id: string;
  pack: "classique" | "village";
  status: "pending" | "active" | "expired" | "cancelled";
  starts_on: string | null;
  expires_on: string | null;
  profile: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
}

export default async function AdminMembershipsPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();

  const { data } = await supabase
    .from("memberships")
    .select(
      "id, pack, status, starts_on, expires_on, profile:profiles(first_name, last_name)"
    )
    .order("status");

  const rows: Row[] = (data ?? []) as unknown as Row[];

  return (
    <div>
      <PageHeader
        eyebrow="Adhésions"
        title="Statuts d'adhésion"
        description="Aucun paiement en Phase 1 — les statuts sont fixés à la main jusqu'à l'intégration Stripe (Phase 2)."
      />

      <DataTable
        rows={rows}
        empty="Aucune adhésion enregistrée."
        columns={[
          {
            key: "profile",
            header: "Adhérent",
            render: (r) => {
              const p = Array.isArray(r.profile) ? r.profile[0] : r.profile;
              return (
                <span className="font-medium">
                  {p?.first_name} {p?.last_name}
                </span>
              );
            },
          },
          { key: "pack", header: "Forfait", className: "capitalize" },
          {
            key: "starts_on",
            header: "Début",
            render: (r) => (r.starts_on ? formatDate(r.starts_on) : "—"),
          },
          {
            key: "expires_on",
            header: "Fin",
            render: (r) => (r.expires_on ? formatDate(r.expires_on) : "—"),
          },
          {
            key: "status",
            header: "Statut",
            className: "w-44",
            render: (r) => (
              <form action={updateMembershipStatus}>
                <input type="hidden" name="id" value={r.id} />
                <AutoSubmitSelect
                  name="status"
                  defaultValue={r.status}
                  options={STATUS_OPTIONS}
                  ariaLabel="Changer le statut"
                />
              </form>
            ),
          },
        ]}
      />
    </div>
  );
}
