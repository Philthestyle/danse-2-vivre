import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Mon profil" />;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/profil");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, role, pack, city:cities(name)")
    .eq("id", user.id)
    .maybeSingle();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("pack, status, starts_on, expires_on, city:cities(name)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const membership = memberships?.[0];

  return (
    <div className="container-page py-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Mon espace
        </p>
        <h1 className="mt-2 text-5xl">
          Bonjour {profile?.first_name ?? user.email}
        </h1>
      </header>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl">Informations</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Nom</dt>
              <dd className="font-medium">
                {profile?.first_name} {profile?.last_name}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Rôle</dt>
              <dd className="font-medium capitalize">{profile?.role ?? "member"}</dd>
            </div>
          </dl>
        </section>

        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Mon adhésion</h2>
            <Link href="/profil/adhesion" className="text-sm text-primary hover:underline">
              Détails →
            </Link>
          </div>
          {membership ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Forfait</dt>
                <dd className="font-medium capitalize">{membership.pack}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Statut</dt>
                <dd>
                  <span className="rounded-pill bg-elevated px-3 py-1 text-xs capitalize">
                    {membership.status}
                  </span>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Aucune adhésion enregistrée pour le moment.
            </p>
          )}
        </section>

        <section className="card p-6 md:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/messagerie" className="btn-outline">
              Messagerie
            </Link>
            {profile?.role === "teacher" && (
              <Link href="/enseignant" className="btn-outline">
                Espace enseignant
              </Link>
            )}
            {profile?.role === "admin" && (
              <Link href="/admin" className="btn-outline">
                Administration
              </Link>
            )}
            <form action="/api/auth/signout" method="post" className="ml-auto">
              <button type="submit" className="btn-ghost text-danger">
                Se déconnecter
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
