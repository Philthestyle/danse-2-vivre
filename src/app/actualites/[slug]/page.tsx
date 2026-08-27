import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { seedNews } from "@/lib/data/seed";
import { formatDate } from "@/lib/utils";
import { withBasePath } from "@/lib/paths";

export function generateStaticParams() {
  return seedNews.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = seedNews.find((n) => n.slug === slug);
  if (!news) return {};
  return {
    title: news.title,
    description: news.excerpt,
    openGraph: {
      title: news.title,
      description: news.excerpt,
      images: news.imageUrl ? [{ url: news.imageUrl }] : undefined,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = seedNews.find((n) => n.slug === slug);
  if (!news) notFound();

  return (
    <article className="container-page py-16">
      <Link href="/actualites" className="text-sm text-muted hover:text-primary">
        ← Toutes les actualités
      </Link>

      <header className="mx-auto mt-8 max-w-3xl text-center">
        <p className="text-xs uppercase tracking-widest text-muted">
          {formatDate(news.publishedAt)} · {news.author}
        </p>
        <h1 className="mt-3 text-5xl sm:text-6xl leading-[1.05]">{news.title}</h1>
        <p className="mt-6 text-xl text-muted">{news.excerpt}</p>
      </header>

      {news.imageUrl && (
        <figure className="mx-auto mt-10 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-card">
            <Image
              src={withBasePath(news.imageUrl)}
              alt={news.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 1024px, 100vw"
              priority
            />
          </div>
        </figure>
      )}

      <div className="prose mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-fg">
        <p>{news.content}</p>
      </div>
    </article>
  );
}
