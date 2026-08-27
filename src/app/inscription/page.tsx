import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "Créez votre compte Danse 2 Vivre — sans paiement, sans engagement à l'inscription.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Rejoindre l'aventure
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Créer mon compte</h1>
          <p className="mt-3 text-muted">
            Aucun paiement à l'inscription. Vous choisirez votre forfait et pourrez
            l'ajuster avec votre professeur ou l'administration.
          </p>
        </div>

        <div className="card p-6 sm:p-8">
          <SignupForm />
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà membre ?{" "}
          <Link href="/connexion" className="link">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
