import Image from "next/image";
import Link from "next/link";
import { seedTeachers, seedFaq, seedGallery } from "@/lib/data/seed";
import { FaqAccordion } from "@/components/features/FaqAccordion";
import { withBasePath } from "@/lib/paths";

export default function HomePage() {
  return (
    <>
      {/* 1. Hero — "Ton Style. Ton Flow. Ton Énergie." (Figma Slide 16:9 #1) */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container-page relative grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="relative z-10">
            <h1 className="display-hero text-fg">
              Ton Style. <br />
              Ton Flow. <br />
              <span className="text-primary">Ton Énergie.</span>
            </h1>
            <p className="mt-8 max-w-md text-lg text-muted">
              L'association Danse 2 Vivre rassemble une communauté autour de la scène,
              du geste et du plaisir de danser dans nos villages.
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

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border shadow-stage md:aspect-square">
            <Image
              src={withBasePath("/images/hero.png")}
              alt="Spectacle Danse 2 Vivre — scène et communauté"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 2. Qui sommes-nous ? — Figma slide 1, section 2 */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="font-display text-4xl text-primary sm:text-5xl">
              Qui sommes nous ?
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              Danse 2 Vivre rassemble des amateurs, des passionnés et des professionnels
              autour d'une conviction simple : la danse relie. Nous animons des cours dans
              plusieurs villages, montons un spectacle chaque année et cultivons une
              communauté chaleureuse toute la saison.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <p className="font-display text-4xl text-primary">200+</p>
                <p className="text-xs uppercase tracking-widest text-muted">élèves</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">5</p>
                <p className="text-xs uppercase tracking-widest text-muted">professeurs</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">4</p>
                <p className="text-xs uppercase tracking-widest text-muted">villages</p>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border">
            <Image
              src={withBasePath("/images/community.png")}
              alt="La communauté Danse 2 Vivre"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
        </div>
      </section>

      {/* 3. Nos professeurs — grid 4 colonnes avec vraies cartes (Figma slide 11) */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12 text-center">
            <p className="font-display text-4xl text-primary sm:text-5xl">
              Nos professeurs
            </p>
            <p className="mt-3 text-muted">Cinq personnalités, cinq disciplines.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {seedTeachers.map((t) => (
              <Link
                key={t.slug}
                href={`/professeurs/${t.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-primary/60 hover:-translate-y-1"
              >
                <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-elevated to-surface">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-8xl text-primary/70">
                      {t.firstName.charAt(0)}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <p className="font-display text-2xl text-white">{t.firstName}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-primary">{t.speciality}</p>
                  <p className="mt-1 text-xs text-muted">Commence {new Date(t.startedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Galerie photo — mosaïque (Figma slide 1, section galerie) */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="container-page">
          <div className="mb-12">
            <p className="font-display text-4xl text-primary sm:text-5xl">Galerie photo</p>
          </div>
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

      {/* 5. Questions fréquentes — accordion (Figma slide 1) */}
      <section id="faq" className="border-b border-border py-20 md:py-28">
        <div className="container-page mx-auto max-w-3xl">
          <div className="mb-10">
            <p className="font-display text-4xl text-primary sm:text-5xl">
              Questions fréquentes
            </p>
          </div>
          <FaqAccordion items={seedFaq} />
        </div>
      </section>

      {/* 6. Nous contacter — Figma slide 1, footer */}
      <section className="py-20 md:py-24">
        <div className="container-page mx-auto max-w-3xl text-center">
          <p className="font-display text-4xl text-primary sm:text-5xl">
            Nous contacter
          </p>
          <p className="mt-4 text-muted">
            Pour toute question, merci de nous contacter par email :
          </p>
          <a
            href="mailto:secretariat.dansedevivre@gmail.com"
            className="mt-6 inline-flex items-center gap-3 rounded-md border border-border bg-surface px-5 py-3 text-fg hover:border-primary hover:text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M3 7l9 6 9-6" />
            </svg>
            secretariat.dansedevivre@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
