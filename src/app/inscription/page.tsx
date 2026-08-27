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
        <div className="mb-10">
          <h1 className="font-display text-6xl text-primary sm:text-7xl">Inscription</h1>
          <p className="mt-4 text-muted">
            Chez nous l'entraide, le respect et la progression collective sont au cœur
            de notre fonctionnement. Intégrez une équipe soudée, portée par des valeurs
            humaines fortes et animée par des professionnels polyvalents, reconnus pour
            leur expertise et leur bienveillance.
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
