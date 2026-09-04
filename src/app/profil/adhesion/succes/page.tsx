import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adhésion confirmée",
  robots: { index: false, follow: false },
};

export default function AdhesionSuccessPage() {
  return (
    <div className="container-page py-16">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Adhésion
        </p>
        <h1 className="mt-2 font-display text-5xl">Merci pour votre soutien</h1>
        <p className="mt-6 text-muted">
          Votre paiement a bien été reçu. L'activation de votre adhésion peut
          prendre quelques secondes le temps que Stripe confirme la transaction.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/profil/adhesion" className="btn-primary">
            Voir mon adhésion
          </Link>
          <a
            href="/api/invoice/paid"
            download
            className="rounded-xl border border-primary/60 bg-primary/5 px-5 py-3 text-sm font-semibold text-fg transition-colors hover:bg-primary/10"
          >
            Télécharger ma facture payée
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">
          Si la facture n'est pas encore disponible, patientez quelques secondes
          puis rafraîchissez — Stripe confirme la transaction en arrière-plan.
        </p>
        <div className="mt-8">
          <Link href="/profil" className="text-sm text-muted hover:text-primary">
            ← Retour à mon profil
          </Link>
        </div>
      </div>
    </div>
  );
}
