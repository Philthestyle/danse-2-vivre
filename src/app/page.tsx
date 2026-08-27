import Image from "next/image";
import Link from "next/link";
import { seedTeachers, seedFaq, seedGallery } from "@/lib/data/seed";
import { TeacherCarousel } from "@/components/features/TeacherCarousel";
import { FaqAccordion } from "@/components/features/FaqAccordion";

export default function HomePage() {
  return (
    <>
      {/* 1. Rejoindre la communauté — Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero.png"
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stage/80 via-stage/60 to-bg" />
        </div>

        <div className="container-page relative flex min-h-[75vh] flex-col items-center justify-center py-24 text-center">
          <p className="mb-4 rounded-pill border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur">
            Association Danse 2 Vivre
          </p>
          <h1 className="font-display text-5xl leading-[1.05] text-white sm:text-7xl md:text-8xl">
            Rejoindre <br className="sm:hidden" />
            la communauté
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-white/85">
            Une association, cinq professeurs, plusieurs villages et une même passion :
            faire vibrer la scène et la vie quotidienne au rythme de la danse.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscription" className="btn-primary text-base">
              Rejoindre l'aventure
            </Link>
            <Link
              href="/professeurs"
              className="btn-outline border-white/30 text-white text-base hover:!text-white hover:!border-white"
            >
              Rencontrer nos profs
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Qui sommes-nous ? */}
      <section className="container-page py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-card shadow-stage md:aspect-[4/3]">
            <Image
              src="/images/community.png"
              alt="La communauté Danse 2 Vivre"
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Qui sommes-nous ?
            </p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Une famille qui danse.</h2>
            <p className="mt-6 text-lg text-muted">
              Danse 2 Vivre rassemble des amateurs, des passionnés et des professionnels
              autour d'une conviction simple : la danse relie. Nous animons des cours dans
              plusieurs villages, montons un spectacle chaque année et cultivons une
              communauté chaleureuse toute la saison.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8">
              <div>
                <p className="font-display text-4xl text-primary">200+</p>
                <p className="text-xs text-muted">élèves actifs</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">5</p>
                <p className="text-xs text-muted">professeurs passionnés</p>
              </div>
              <div>
                <p className="font-display text-4xl text-primary">4</p>
                <p className="text-xs text-muted">villages animés</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Professeurs — Carrousel */}
      <section className="bg-elevated/40 py-24">
        <div className="container-page">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Nos professeurs
              </p>
              <h2 className="mt-2 text-4xl sm:text-5xl">Cinq styles, une passion.</h2>
            </div>
            <Link href="/professeurs" className="hidden text-sm text-primary hover:underline sm:inline">
              Voir tous les profils →
            </Link>
          </div>
          <TeacherCarousel teachers={seedTeachers} />
        </div>
      </section>

      {/* 4. Galerie */}
      <section className="container-page py-24">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Galerie
          </p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Des moments qui restent.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {seedGallery.map((item, i) => (
            <figure
              key={i}
              className="group relative aspect-[4/3] overflow-hidden rounded-card"
            >
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-sm text-white">
                {item.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="container-page pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Vos questions, nos réponses.</h2>
          </div>
          <FaqAccordion items={seedFaq} />
        </div>
      </section>
    </>
  );
}
