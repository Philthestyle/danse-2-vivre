import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "Créez votre compte Danse 2 Vivre — sans paiement à l'inscription.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <>
      <div className="container-page py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="display-script text-fg">Inscription</h1>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            Chez nous l'entraide, le respect et la progression collective sont
            au cœur de notre fonctionnement. Intégrez une équipe soudée, portée
            par des valeurs humaines fortes et animée par des professionnels
            polyvalents, reconnus pour leur expertise et leur bienveillance.
          </p>

          <div className="mt-12">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-elevated" />}>
              <SignupForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Déjà membre ?{" "}
            <Link href="/connexion" className="link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
      <ContactSection />
    </>
  );
}
