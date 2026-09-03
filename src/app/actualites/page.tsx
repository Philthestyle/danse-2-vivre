import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedNews } from "@/lib/news";
import { formatDate } from "@/lib/utils";
import { ContactSection } from "@/components/features/ContactSection";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les dernières actualités de l'association Danse 2 Vivre.",
};

export default async function ActualitesPage() {
  const news = await getPublishedNews();

  return (
    <>
      <div className="container-page py-16 md:py-20">
        <h1 className="display-script text-fg">Actualités</h1>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Nouvelles de la saison, retours de spectacles, coulisses et coups de cœur.
        </p>

        {news.length === 0 ? (
          <p className="mt-12 text-muted">Aucune actualité publiée pour le moment.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <article
                key={n.slug}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
              >
                {n.imageUrl && (
                  <Link
                    href={`/actualites/${n.slug}`}
                    className="relative block aspect-[16/10] overflow-hidden"
                  >
                    <Image
                      src={n.imageUrl}
                      alt={n.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs uppercase tracking-widest text-muted">
                    {formatDate(n.publishedAt)} · {n.author}
                  </p>
                  <h2 className="mt-3 font-sans text-xl font-bold text-fg leading-tight">
                    <Link href={`/actualites/${n.slug}`} className="hover:text-primary">
                      {n.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-muted">{n.excerpt}</p>
                  <Link
                    href={`/actualites/${n.slug}`}
                    className="mt-auto pt-6 text-sm font-semibold text-primary hover:underline"
                  >
                    Lire →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ContactSection />
    </>
  );
}
