import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seedTeachers } from "@/lib/data/seed";
import { formatDate } from "@/lib/utils";
import { ContactTeacherButton } from "@/components/features/ContactTeacherButton";

export function generateStaticParams() {
  return seedTeachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = seedTeachers.find((x) => x.slug === slug);
  if (!t) return {};
  return {
    title: `${t.firstName} — ${t.speciality}`,
    description: t.bio,
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = seedTeachers.find((x) => x.slug === slug);
  if (!t) notFound();

  return (
    <div className="container-page py-16">
      <Link href="/professeurs" className="text-sm text-muted hover:text-primary">
        ← Tous les professeurs
      </Link>

      <div className="mt-8 grid gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-card bg-gradient-to-br from-primary/30 via-accent/25 to-stage/15 shadow-stage md:aspect-[4/5]">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-[14rem] leading-none text-primary/60">
              {t.firstName.charAt(0)}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {t.speciality}
          </p>
          <h1 className="mt-2 text-6xl sm:text-7xl">{t.firstName}</h1>
          <p className="mt-6 text-lg leading-relaxed text-muted">{t.bio}</p>

          <dl className="mt-10 space-y-4 border-t border-border pt-8">
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-muted">Villes d'intervention</dt>
              <dd className="text-right font-medium">{t.cities.join(", ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-muted">À Danse 2 Vivre depuis</dt>
              <dd className="text-right font-medium">{formatDate(t.startedAt)}</dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/calendrier" className="btn-outline">
              Voir ses cours
            </Link>
            <ContactTeacherButton teacherSlug={t.slug} />
          </div>
          <p className="mt-3 text-xs text-muted">
            Un adhérent peut contacter un professeur en privé. Les échanges membre ↔ membre ne sont pas autorisés.
          </p>
        </div>
      </div>
    </div>
  );
}
