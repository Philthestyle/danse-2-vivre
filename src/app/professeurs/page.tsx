import Link from "next/link";
import type { Metadata } from "next";
import { seedTeachers } from "@/lib/data/seed";

export const metadata: Metadata = {
  title: "Professeurs",
  description: "Nos cinq professeurs, leur spécialité et leurs villages.",
};

export default function TeachersPage() {
  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          L'équipe
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Nos professeurs</h1>
        <p className="mt-4 text-lg text-muted">
          Cinq personnalités, cinq disciplines, une même exigence : transmettre.
        </p>
      </header>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {seedTeachers.map((t) => (
          <Link
            key={t.slug}
            href={`/professeurs/${t.slug}`}
            className="card group overflow-hidden transition-shadow hover:shadow-stage"
          >
            <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-primary/25 via-accent/20 to-stage/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-[9rem] leading-none text-primary/50">
                  {t.firstName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-3xl">{t.firstName}</h2>
              <p className="text-primary">{t.speciality}</p>
              <p className="mt-2 text-sm text-muted">{t.cities.join(" · ")}</p>
              <p className="mt-3 text-sm text-muted line-clamp-2">{t.bio}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
