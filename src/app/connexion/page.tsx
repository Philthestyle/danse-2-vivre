import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { SigninForm } from "./SigninForm";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace membre Danse 2 Vivre.",
  robots: { index: false, follow: false },
};

export default function SigninPage() {
  return (
    <div className="container-page grid min-h-[80vh] items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Espace membre
          </p>
          <h1 className="mt-2 text-4xl">Bon retour parmi nous</h1>
        </div>

        <div className="card p-6 sm:p-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-elevated" />}>
            <SigninForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="link">
            Rejoindre l'association
          </Link>
        </p>
      </div>
    </div>
  );
}
