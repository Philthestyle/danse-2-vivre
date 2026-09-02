import type { Metadata } from "next";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Merci pour votre inscription",
  robots: { index: false, follow: false },
};

/**
 * Écran de remerciement post-inscription — Figma Slide 5.
 * Bouton "Télécharger votre facture" activé si les params d'inscription
 * (name, pack, city) sont passés en URL par SignupForm.
 */
export default async function InscriptionMerciPage({
  searchParams,
}: {
  searchParams: Promise<{
    name?: string;
    pack?: string;
    city?: string;
    email?: string;
  }>;
}) {
  const params = await searchParams;
  const canDownload =
    !!params.name && (params.pack === "classique" || params.pack === "village");

  const downloadUrl = canDownload
    ? `/api/invoice/download?${new URLSearchParams({
        name: params.name!,
        pack: params.pack!,
        ...(params.city ? { city: params.city } : {}),
        ...(params.email ? { email: params.email } : {}),
      }).toString()}`
    : null;

  return (
    <>
      <div className="container-page py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="display-script text-fg">
            Merci pour votre inscription
          </h1>

          <p className="mt-8 text-sm leading-relaxed text-muted">
            Félicitations vous êtes désormais inscrit à l&apos;association Danse 2
            Vivre. Un e-mail de confirmation vous a été envoyé à l&apos;adresse
            que vous avez indiquée. Pensez à vérifier vos spams ou courriers
            indésirables si vous ne le voyez pas dans votre boîte principale.
          </p>

          <p className="mt-8 font-semibold text-fg">À très vite parmi nous !</p>

          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="mt-8 flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/60 bg-primary/5 p-5 text-left transition-colors hover:bg-primary/10"
            >
              <PdfIcon className="h-8 w-8 shrink-0" />
              <span className="text-sm font-semibold text-fg">
                Télécharger votre facture
              </span>
            </a>
          ) : (
            <div
              className="mt-8 flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-transparent p-5 text-left opacity-60"
              title="Facture non disponible — rechargez la page depuis le formulaire d'inscription"
            >
              <PdfIcon className="h-8 w-8 shrink-0" />
              <span className="text-sm font-semibold text-fg">
                Télécharger votre facture
              </span>
            </div>
          )}
        </div>
      </div>
      <ContactSection />
    </>
  );
}

function PdfIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="2" width="14" height="20" rx="2" fill="#db162f" />
      <path d="M17 2v6h4l-4-6z" fill="#a01021" />
      <text
        x="10"
        y="16"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="#fff"
        fontFamily="Inter, sans-serif"
      >
        PDF
      </text>
    </svg>
  );
}
