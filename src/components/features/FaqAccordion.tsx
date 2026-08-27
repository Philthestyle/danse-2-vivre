"use client";

import { useState } from "react";
import type { SeedFaq } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

/**
 * Accordéon FAQ pixel-perfect Figma Slide 12 :
 * - chaque ligne = surface #181818 en carte arrondie
 * - texte Inter 500 22px
 * - chevron ▼ à droite qui tourne à 180°
 * - pas de bordure entre les items (juste espacement)
 */
export function FaqAccordion({ items }: { items: SeedFaq[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="rounded-xl bg-surface border border-border overflow-hidden">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-${idx}`}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-sans text-base font-medium text-fg">
                  {item.question}
                </span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={cn("shrink-0 text-muted transition-transform", isOpen && "rotate-180")}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </h3>
            {isOpen && (
              <div id={`faq-${idx}`} className="px-6 pb-5 text-sm text-muted">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
