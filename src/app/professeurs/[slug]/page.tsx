import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTeachers, getTeacherBySlug, getTeacherEmail } from "@/lib/teachers";
import { formatDate } from "@/lib/utils";
import { ContactSection } from "@/components/features/ContactSection";
import { ContactTeacherButton } from "@/components/features/ContactTeacherButton";

export async function generateStaticParams() {
  const teachers = await getTeachers();
  return teachers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTeacherBySlug(slug);
  if (!t) return {};
  return {
    title: `${t.firstName} — ${t.speciality}`,
    description: t.bio || `Profil de ${t.firstName}, professeur de ${t.speciality}.`,
  };
}

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTeacherBySlug(slug);
  if (!t) notFound();

  const email = await getTeacherEmail(slug);
  const mailtoHref = email
    ? `mailto:${email}?subject=${encodeURIComponent(
        `Contact via Danse 2 Vivre — ${t.firstName}`
      )}`
    : "mailto:contact@danse2vivre.fr";

  return (
    <>
      <div className="container-page py-16 md:py-20">
        <Link href="/professeurs" className="text-sm text-muted hover:text-fg">
          ← Tous les professeurs
        </Link>

        <div className="mt-8 grid gap-12 md:grid-cols-[2fr_3fr]">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-border bg-elevated">
            {t.photoUrl && (
              <Image
                src={t.photoUrl}
                alt={`${t.firstName} ${t.lastName}`.trim()}
                fill
                priority
                className="object-cover"
                sizes="(min-width: 768px) 40vw, 100vw"
              />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted">
              {t.speciality}
            </p>
            <h1 className="mt-3 display-hero text-fg">{t.firstName}</h1>
            {t.bio && (
              <p className="mt-6 text-base leading-relaxed text-muted">{t.bio}</p>
            )}

            <dl className="mt-10 space-y-4 border-t border-border pt-8">
              {t.startedAt && (
                <div className="flex justify-between gap-4">
                  <dt className="text-sm text-muted">À Danse 2 Vivre depuis</dt>
                  <dd className="text-right text-sm font-semibold text-fg">
                    {formatDate(t.startedAt)}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/calendrier" className="btn-outline">
                Voir ses cours
              </Link>
              <ContactTeacherButton teacherSlug={slug} />
              <a href={mailtoHref} className="btn-ghost">
                ou par email
              </a>
            </div>
          </div>
        </div>
      </div>

      <ContactSection />
    </>
  );
}
