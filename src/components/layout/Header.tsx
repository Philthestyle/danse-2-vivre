"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

const publicNav: readonly NavItem[] = [
  { href: "/actualites", label: "Actualités" },
  { href: "/professeurs", label: "Professeur" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/#faq", label: "Question" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Danse 2 Vivre — Accueil"
          onClick={() => setOpen(false)}
        >
          <span className="font-display text-3xl leading-none tracking-wide text-fg">
            D<span className="text-primary">2</span>V
          </span>
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {publicNav.map((item) => {
              const [pathOnly] = item.href.split("#");
              const active =
                pathOnly === "/"
                  ? pathname === "/"
                  : pathname.startsWith(pathOnly ?? "");
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "text-primary"
                        : "text-muted hover:text-fg"
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

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/inscription" className="btn-primary !py-2">
            S'inscrire
          </Link>
          <Link href="/connexion" className="btn-outline !py-2">
            Se connecter
          </Link>
        </div>

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
              {publicNav.map((item) => (
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
              <Link href="/inscription" onClick={() => setOpen(false)} className="btn-primary flex-1">
                S'inscrire
              </Link>
              <Link href="/connexion" onClick={() => setOpen(false)} className="btn-outline flex-1">
                Se connecter
              </Link>
            </div>
            <div className="mt-4 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
