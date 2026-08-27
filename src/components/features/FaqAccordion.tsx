"use client";

import { useState } from "react";
import type { SeedFaq } from "@/lib/data/seed";
import { cn } from "@/lib/utils";

export function FaqAccordion({ items }: { items: SeedFaq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="card overflow-hidden">
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${idx}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-medium hover:bg-elevated"
              >
                <span className="font-sans">{item.question}</span>
                <svg
                  width="20" height="20" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </h3>
            <div
              id={`faq-panel-${idx}`}
              role="region"
              hidden={!isOpen}
              className="px-5 pb-5 text-muted"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
