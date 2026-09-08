import type { Metadata } from "next";
import { seedCourses } from "@/lib/data/seed";
import { ContactSection } from "@/components/features/ContactSection";
import { CalendarInteractive } from "@/components/features/CalendarInteractive";

export const metadata: Metadata = {
  title: "Calendrier",
  description: "Le calendrier des cours et événements de Danse 2 Vivre.",
};

/**
 * Page Calendrier — Figma Slide 6.
 * Grille mois interactive (nav mois + sélection de jour) déléguée à
 * CalendarInteractive (client). Données : seedCourses (bascule Supabase
 * quand la table events sera peuplée).
 */
export default function CalendrierPage() {
  return (
    <>
      <div className="container-page py-16 md:py-20">
        <h1 className="display-script text-fg">Calendrier artistique</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Retrouvez ici tous les événements, cours, stages, organisés par notre
          association. Ce calendrier est votre outil essentiel pour ne rien
          manquer !
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-6">
          <CategoryDot color="bg-primary" label="Événements" />
          <CategoryDot color="bg-accent" label="Cours" />
          <CategoryDot color="bg-success" label="Stage" />
        </div>

        <CalendarInteractive courses={seedCourses} />
      </div>

      <ContactSection />
    </>
  );
}

function CategoryDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-fg">
      <span
        className={`inline-block h-3 w-3 rounded-full ${color}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
