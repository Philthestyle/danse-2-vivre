import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SigninForm } from "./SigninForm";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace membre Danse 2 Vivre.",
  robots: { index: false, follow: false },
};

export default function SigninPage() {
  return (
    <>
      <div className="container-page grid min-h-[60vh] items-center py-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="display-script text-fg">Connexion</h1>
          <p className="mt-4 text-sm text-muted">
            Bon retour parmi nous.
          </p>

          <div className="mt-10">
            <Suspense
              fallback={<div className="h-40 animate-pulse rounded-xl bg-elevated" />}
            >
              <SigninForm />
            </Suspense>
          </div>

          <p className="mt-8 text-center text-sm text-muted">
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="link">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
      <ContactSection />
    </>
  );
}
