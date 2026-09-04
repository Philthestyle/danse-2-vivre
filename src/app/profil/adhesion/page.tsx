import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { formatDate } from "@/lib/utils";
import { IS_STATIC_PREVIEW } from "@/lib/preview";
import { PreviewNotice } from "@/components/PreviewNotice";
import { PACK_AMOUNT_EUR, type Pack } from "@/lib/pricing";
import { PayButton } from "./PayButton";

export const metadata: Metadata = {
  title: "Mon adhésion",
  robots: { index: false, follow: false },
};

export default async function MembershipPage() {
  if (IS_STATIC_PREVIEW) return <PreviewNotice area="Mon adhésion" />;

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion?next=/profil/adhesion");

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if ((viewerProfile?.role ?? "member") !== "member") redirect("/profil");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("pack, status, starts_on, expires_on, city:cities(name)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  const current = memberships?.[0];

  return (
    <div className="container-page py-16">
      <Link href="/profil" className="text-sm text-muted hover:text-primary">
        ← Mon profil
      </Link>

      <header className="mt-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Adhésion
        </p>
        <h1 className="mt-2 text-5xl">Mon adhésion</h1>
      </header>

      {current ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="card p-8">
            <p className="text-sm text-muted">Forfait actuel</p>
            <p className="mt-2 font-display text-5xl text-primary capitalize">
              {current.pack}
            </p>
            <p className="mt-3 text-sm text-muted">
              {current.pack === "village"
                ? "Accès à toutes les villes"
                : `Ville : ${(Array.isArray(current.city) ? current.city[0]?.name : (current.city as { name?: string } | null)?.name) ?? "à confirmer"}`}
            </p>
          </section>

          <section className="card p-8">
            <p className="text-sm text-muted">Statut</p>
            <p className="mt-2 rounded-pill inline-block bg-elevated px-4 py-1.5 text-lg capitalize">
              {current.status}
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Début</dt>
                <dd className="font-medium">
                  {current.starts_on ? formatDate(current.starts_on) : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Expiration</dt>
                <dd className="font-medium">
                  {current.expires_on ? formatDate(current.expires_on) : "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-8 md:col-span-2">
            <h2 className="text-2xl">Paiement</h2>
            {current.status === "active" ? (
              <p className="mt-3 text-muted">
                Votre adhésion est active. Merci pour votre soutien.
              </p>
            ) : (
              <>
                <p className="mt-3 text-muted">
                  Montant à régler :{" "}
                  <span className="font-semibold text-fg">
                    {PACK_AMOUNT_EUR[current.pack as Pack]},00 €
                  </span>{" "}
                  — paiement sécurisé Stripe.
                </p>
                <PayButton />
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="mt-10 card p-8 text-center">
          <p className="text-lg">Aucune adhésion enregistrée pour le moment.</p>
          <p className="mt-2 text-muted">
            Contactez votre professeur ou l'administration pour initier votre adhésion.
          </p>
        </div>
      )}
    </div>
  );
}
