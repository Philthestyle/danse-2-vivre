"use client";

import { useRef } from "react";
import Link from "next/link";
import type { SeedTeacher } from "@/lib/data/seed";

export function TeacherCarousel({ teachers }: { teachers: SeedTeacher[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: "prev" | "next") => {
    const el = scroller.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * (dir === "next" ? 1 : -1);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
        aria-label="Carrousel des professeurs"
      >
        {teachers.map((t) => (
          <article
            key={t.slug}
            className="card group flex min-w-[280px] max-w-[280px] snap-start flex-col overflow-hidden sm:min-w-[320px] sm:max-w-[320px]"
          >
            <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-8xl text-primary/40">
                  {t.firstName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-2xl">{t.firstName}</h3>
              <p className="text-sm text-primary">{t.speciality}</p>
              <p className="mt-2 text-xs text-muted">
                {t.cities.join(" · ")}
              </p>
              <Link
                href={`/professeurs/${t.slug}`}
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Voir le profil →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll("prev")}
          className="btn-ghost !p-2 !rounded-full"
          aria-label="Précédent"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scroll("next")}
          className="btn-ghost !p-2 !rounded-full"
          aria-label="Suivant"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
