import type { Metadata } from "next";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="container-page grid min-h-[80vh] items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl">Mot de passe oublié</h1>
          <p className="mt-3 text-muted">
            Entrez votre email : nous vous envoyons un lien pour réinitialiser.
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <ForgotForm />
        </div>
      </div>
    </div>
  );
}
