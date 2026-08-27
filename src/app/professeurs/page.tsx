import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTeachers } from "@/lib/teachers";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Professeurs",
  description: "Nos professeurs, leur spécialité et leurs villages.",
};

/**
 * Page Professeurs pixel-perfect Figma Slide 11 :
 * - Titre script "Nos professeurs"
 * - Grille de cartes : photo + "Professeur depuis X ans" + prénom en rouge + spécialité
 * - Section "Nous contacter"
 */
export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <>
      <div className="container-page py-16 md:py-20">
        <h1 className="display-script text-fg">Nos professeurs</h1>
        <p className="mt-6 max-w-2xl text-sm text-muted">
          Cinq personnalités, cinq disciplines, une même exigence : transmettre.
        </p>

        {teachers.length === 0 ? (
          <div className="mt-16 card p-10 text-center text-muted">
            Aucun professeur pour le moment.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {teachers.map((t) => (
              <Link
                key={t.slug}
                href={`/professeurs/${t.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-fg/40"
              >
                <div className="relative aspect-[3/4] w-full bg-elevated">
                  {t.photoUrl && (
                    <Image
                      src={t.photoUrl}
                      alt={`${t.firstName} ${t.lastName}`.trim()}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
                    />
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-fg">
                    Professeur depuis 4 ans
                  </p>
                  <p className="mt-1 text-lg font-bold text-primary">
                    {t.firstName}
                  </p>
                  <p className="mt-1 text-xs text-muted">{t.speciality}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ContactSection />
    </>
  );
}
