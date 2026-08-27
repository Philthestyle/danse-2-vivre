import type { Metadata } from "next";
import { seedCourses } from "@/lib/data/seed";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Calendrier",
  description: "Le calendrier des cours et événements de Danse 2 Vivre.",
};

const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

/**
 * Page Calendrier pixel-perfect Figma Slide 6 :
 * - Titre "Calendrier artistique" en script
 * - 3 catégories colorées : Événements (rouge), Cours (crème), Stage (vert)
 * - Grille mois : 7 colonnes (LUN..DIM) x N semaines
 * - "Aujourd'hui" : liste des sessions du jour avec catégorie + horaire + adresse
 * - Section contact
 */
export default function CalendrierPage() {
  const now = new Date();
  const monthName = now.toLocaleDateString("fr-FR", { month: "long" });
  const monthCapitalized = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const today = now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <>
      <div className="container-page py-16 md:py-20">
        <h1 className="display-script text-fg">Calendrier artistique</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Retrouvez ici tous les événements, cours, stages, organisés par notre
          association. Ce calendrier est votre outil essentiel pour ne rien
          manquer !
        </p>

        {/* Légende catégories */}
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <CategoryDot color="bg-primary" label="Événements" />
          <CategoryDot color="bg-accent" label="Cours" />
          <CategoryDot color="bg-success" label="Stage" />
        </div>

        {/* Grille du mois */}
        <MonthGrid monthName={monthCapitalized} />

        {/* Aujourd'hui */}
        <div className="mt-12">
          <h2 className="font-sans text-lg font-semibold text-fg">
            Aujourd'hui - {today}
          </h2>
          <div className="mt-6 space-y-6">
            {seedCourses.slice(0, 3).map((c, i) => (
              <EventCard
                key={i}
                category={i === 0 ? "event" : "course"}
                time={`${new Date(c.startsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${new Date(c.endsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                title={c.title}
                description={c.description}
                location={c.city}
              />
            ))}
          </div>
        </div>
      </div>

      <ContactSection />
    </>
  );
}

function CategoryDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-fg">
      <span className={`inline-block h-3 w-3 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function MonthGrid({ monthName }: { monthName: string }) {
  // Grille factice 4 semaines de 7 jours (le seed ne fournit pas encore les vrais dates)
  const weeks = Array.from({ length: 4 }, () => Array.from({ length: 7 }, (_, i) => i + 1));

  return (
    <div className="mt-10 rounded-xl border border-border bg-surface p-4 sm:p-6">
      {/* Header mois + nav */}
      <div className="mb-4 flex items-center justify-between">
        <p className="font-semibold text-fg">{monthName}</p>
        <div className="flex gap-2">
          <ArrowBtn dir="prev" />
          <ArrowBtn dir="next" />
        </div>
      </div>

      {/* Jours en tête */}
      <div className="grid grid-cols-7 gap-1 border-b border-border pb-2">
        {DAYS.map((d) => (
          <p key={d} className="text-center text-xs font-semibold uppercase tracking-widest text-muted">
            {d}
          </p>
        ))}
      </div>

      {/* Cellules */}
      <div className="mt-2 grid grid-cols-7 gap-1">
        {weeks.flat().map((day, i) => (
          <div
            key={i}
            className="aspect-[1.2/1] rounded-md p-2 text-fg hover:bg-elevated/40"
          >
            <p className="text-sm">{day}</p>
            {i === 0 && (
              <div className="mt-1 flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="h-2 w-2 rounded-full bg-accent" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ArrowBtn({ dir }: { dir: "prev" | "next" }) {
  return (
    <button type="button" className="rounded-md p-1 text-muted hover:text-fg" aria-label={dir === "prev" ? "Précédent" : "Suivant"}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        {dir === "prev" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
      </svg>
    </button>
  );
}

function EventCard({
  category,
  time,
  title,
  description,
  location,
}: {
  category: "event" | "course" | "stage";
  time: string;
  title: string;
  description?: string;
  location?: string;
}) {
  const dotColor =
    category === "event"
      ? "bg-primary"
      : category === "course"
        ? "bg-accent"
        : "bg-success";
  return (
    <article className="border-b border-border pb-6 last:border-0">
      <div className="flex items-center gap-3">
        <span className={`inline-block h-3 w-3 rounded-full ${dotColor}`} aria-hidden="true" />
        <p className="text-sm font-semibold text-fg">{time}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-fg">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted">{description}</p>
      )}
      {location && (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted">
          <FlagIcon className="h-4 w-4" />
          {location}
        </p>
      )}
    </article>
  );
}

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 21V4l14 4-14 5" />
    </svg>
  );
}
