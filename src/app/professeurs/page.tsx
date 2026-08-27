import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getTeachers } from "@/lib/teachers";

export const metadata: Metadata = {
  title: "Professeurs",
  description: "Nos cinq professeurs, leur spécialité et leurs villages.",
};

export default async function TeachersPage() {
  const teachers = await getTeachers();

  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          L'équipe
        </p>
        <h1 className="mt-2 font-display text-5xl text-primary sm:text-6xl">
          Nos professeurs
        </h1>
        <p className="mt-4 text-lg text-muted">
          Cinq personnalités, cinq disciplines, une même exigence : transmettre.
        </p>
      </header>

      {teachers.length === 0 ? (
        <div className="mx-auto mt-16 max-w-lg card p-10 text-center text-muted">
          Aucun professeur pour le moment.
        </div>
      ) : (
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <Link
              key={t.slug}
              href={`/professeurs/${t.slug}`}
              className="card group overflow-hidden transition-shadow hover:border-primary/60"
            >
              <div className="relative aspect-[4/5] w-full bg-gradient-to-br from-primary/25 via-accent/20 to-stage/10">
                {t.photoUrl ? (
                  <Image
                    src={t.photoUrl}
                    alt={`${t.firstName} ${t.lastName}`.trim()}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-[9rem] leading-none text-primary/50">
                      {t.firstName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h2 className="font-display text-3xl">{t.firstName}</h2>
                <p className="text-primary">{t.speciality}</p>
                {t.bio && <p className="mt-3 text-sm text-muted line-clamp-2">{t.bio}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
