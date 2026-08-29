import Image from "next/image";
import Link from "next/link";
import { seedFaq, seedGallery } from "@/lib/data/seed";
import { FaqAccordion } from "@/components/features/FaqAccordion";
import { ContactSection } from "@/components/features/ContactSection";
import { withBasePath } from "@/lib/paths";
import { getTeachers } from "@/lib/teachers";

export default async function HomePage() {
  const teachers = await getTeachers();

  return (
    <>
      {/* 1. Hero — "Ton Style. Ton Flow. Ton Énergie." (Figma Slide 1) */}
      <section className="border-b border-border">
        <div className="container-page grid gap-16 py-16 md:grid-cols-[1fr_1fr] md:items-center md:py-24">
          <div>
            <h1 className="display-hero text-fg text-balance">
              Ton Style.<br />
              Ton Flow.<br />
              Ton Énergie.
            </h1>
            <p className="mt-10 max-w-md text-base leading-relaxed text-muted">
              L'association Danse 2 Vivre rassemble une communauté autour de la
              scène, du geste et du plaisir de danser dans nos villages.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/inscription" className="btn-primary">
                S'inscrire
              </Link>
              <Link href="/professeurs" className="btn-outline">
                Rencontrer nos profs
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border md:aspect-[3/4]">
            <Image
              src={withBasePath("/images/hero.png")}
              alt="Spectacle Danse 2 Vivre"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* 2. Qui sommes-nous ? */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page grid items-center gap-16 md:grid-cols-2">
          <div>
            <h2 className="display-script text-fg">Qui sommes nous ?</h2>
            <p className="mt-8 text-base leading-relaxed text-muted">
              Danse 2 Vivre rassemble des amateurs, des passionnés et des
              professionnels autour d'une conviction simple : la danse relie.
              Nous animons des cours dans plusieurs villages, montons un
              spectacle chaque année et cultivons une communauté chaleureuse
              toute la saison.
            </p>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat value="200+" label="élèves" />
              <Stat value={String(teachers.length)} label="professeurs" />
              <Stat value="4" label="villages" />
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={withBasePath("/images/community.png")}
              alt="La communauté Danse 2 Vivre"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* 3. Nos professeurs — grille (Figma Slide 11) */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12 flex items-end justify-between gap-4">
            <h2 className="display-script text-fg">Nos professeurs</h2>
            <Link href="/professeurs" className="text-sm text-muted hover:text-fg">
              Voir tous →
            </Link>
          </div>
          {teachers.length === 0 ? (
            <div className="card p-10 text-center text-muted">
              Les profils seront ajoutés depuis l'administration.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                    <p className="mt-1 text-xs text-muted">
                      {t.speciality}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Galerie photo — mosaïque (Figma Slide 1) */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page">
          <h2 className="mb-12 display-script text-fg">Galerie photo</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {seedGallery.map((item, i) => (
              <figure
                key={i}
                className={`relative overflow-hidden rounded-lg border border-border ${
                  i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={withBasePath(item.imageUrl)}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  sizes="(min-width: 640px) 25vw, 50vw"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Questions fréquentes (Figma Slide 12) */}
      <section id="faq" className="border-b border-border py-20 md:py-28">
        <div className="container-page">
          <div className="mb-10 flex items-center justify-between">
            <h2 className="display-script text-fg">Questions fréquentes</h2>
            <Link href="/#faq" className="text-fg" aria-label="Toutes les questions">
              →
            </Link>
          </div>
          <FaqAccordion items={seedFaq} />
        </div>
      </section>

      {/* 6. Nous contacter */}
      <ContactSection />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-blaka text-3xl text-primary sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-muted">
        {label}
      </p>
    </div>
  );
}
