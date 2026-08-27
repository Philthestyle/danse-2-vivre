import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { seedNews } from "@/lib/data/seed";
import { formatDate } from "@/lib/utils";
import { withBasePath } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Les dernières actualités de l'association Danse 2 Vivre.",
};

export default function ActualitesPage() {
  return (
    <div className="container-page py-16">
      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Le journal
        </p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Actualités</h1>
        <p className="mt-4 text-lg text-muted">
          Nouvelles de la saison, retours de spectacles, coulisses et coups de cœur.
        </p>
      </header>

      <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {seedNews.map((n) => (
          <article key={n.slug} className="group flex flex-col">
            {n.imageUrl && (
              <Link
                href={`/actualites/${n.slug}`}
                className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-card"
              >
                <Image
                  src={withBasePath(n.imageUrl)}
                  alt={n.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                />
              </Link>
            )}
            <p className="text-xs uppercase tracking-widest text-muted">
              {formatDate(n.publishedAt)} · {n.author}
            </p>
            <h2 className="mt-2 text-2xl leading-tight">
              <Link href={`/actualites/${n.slug}`} className="hover:text-primary">
                {n.title}
              </Link>
            </h2>
            <p className="mt-2 text-muted">{n.excerpt}</p>
            <Link
              href={`/actualites/${n.slug}`}
              className="mt-auto pt-4 text-sm text-primary hover:underline"
            >
              Lire l'article →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
