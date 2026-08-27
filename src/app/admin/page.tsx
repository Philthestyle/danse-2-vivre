import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";

export const metadata: Metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  if (IS_STATIC_PREVIEW) return null;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const [{ count: profiles }, { count: teachers }, { count: cities }, { count: news }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("teachers").select("*", { count: "exact", head: true }),
      supabase.from("cities").select("*", { count: "exact", head: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
    ]);

  const stats = [
    { label: "Adhérents", value: profiles ?? 0 },
    { label: "Professeurs", value: teachers ?? 0 },
    { label: "Villes", value: cities ?? 0 },
    { label: "Actualités", value: news ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-4xl">Vue d'ensemble</h1>
      <p className="mt-2 text-muted">
        Tableau de bord de l'administration Danse 2 Vivre.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-6">
            <p className="text-xs uppercase tracking-widest text-muted">{s.label}</p>
            <p className="mt-2 font-display text-5xl text-primary">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 card p-6">
        <h2 className="text-2xl">À implémenter (jalon 4)</h2>
        <p className="mt-2 text-muted">
          Les sections CRUD complètes (professeurs, villes, cours, actualités, galerie,
          FAQ, adhérents, adhésions, groupes) sont scaffoldées dans la navigation
          latérale. L'accès est déjà protégé par middleware + double check server-side
          + RLS. À compléter dans le prochain jalon selon le brief §11.3.
        </p>
      </div>
    </div>
  );
}
