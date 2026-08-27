import type { Metadata } from "next";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="container-page grid min-h-[80vh] items-center py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl">Nouveau mot de passe</h1>
          <p className="mt-3 text-muted">
            Définissez un mot de passe fort (10+ caractères, majuscule, minuscule,
            chiffre).
          </p>
        </div>
        <div className="card p-6 sm:p-8">
          <ResetForm />
        </div>
      </div>
    </div>
  );
}
