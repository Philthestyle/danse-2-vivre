"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/actualites", label: "Actualités" },
  { href: "/professeurs", label: "Professeur" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/#faq", label: "Question" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        {/* Logo D2V avec icône microphone */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Danse 2 Vivre — Accueil"
          onClick={() => setOpen(false)}
        >
          <MicIcon className="h-8 w-8 text-fg" />
          <span className="font-blaka text-4xl leading-none tracking-wider text-fg">
            D<span className="text-primary">2</span>V
          </span>
        </Link>

        {/* Nav centrale */}
        <nav aria-label="Navigation principale" className="hidden md:flex">
          <ul className="flex items-center gap-8">
            {nav.map((item) => {
              const [pathOnly] = item.href.split("#");
              const active =
                pathOnly === "/"
                  ? pathname === "/"
                  : pathname.startsWith(pathOnly ?? "/");
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      active ? "text-fg" : "text-muted hover:text-fg"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* CTA S'inscrire (contour rouge) + Se connecter (contour blanc) */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <Link
            href="/inscription"
            className="rounded-md border border-primary px-5 py-2 text-sm font-semibold text-fg shadow-[0_0_0_1px_rgba(219,22,47,0.6),inset_0_0_16px_rgba(219,22,47,0.12)] hover:shadow-[0_0_0_2px_rgba(219,22,47,0.8),inset_0_0_20px_rgba(219,22,47,0.2)]"
          >
            S'inscrire
          </Link>
          <Link
            href="/connexion"
            className="rounded-md border border-border px-5 py-2 text-sm font-semibold text-fg hover:border-fg"
          >
            Se connecter
          </Link>
        </div>

        {/* Burger mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn-ghost !p-2 md:hidden"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M3 6h18M3 12h18M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-surface md:hidden">
          <div className="container-page py-4">
            <ul className="flex flex-col gap-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-4 py-3 text-base hover:bg-elevated"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Link
                href="/inscription"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-primary px-4 py-2 text-center text-sm font-semibold"
              >
                S'inscrire
              </Link>
              <Link
                href="/connexion"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-border px-4 py-2 text-center text-sm font-semibold"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/**
 * Icône microphone stylisée du logo D2V — reproduite du composant Figma
 * (nœud 138:446 "microphone 1 (Traced)").
 */
function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </svg>
  );
}
