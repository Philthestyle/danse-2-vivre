import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-border bg-elevated/40">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-display text-4xl text-primary">Danse 2 Vivre</p>
            <p className="mt-3 max-w-md text-sm text-muted">
              L'association qui fait vibrer les villages et rassemble une communauté
              autour de la danse — sur scène et dans la vie.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Explorer
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-primary" href="/actualites">Actualités</Link></li>
              <li><Link className="hover:text-primary" href="/professeurs">Professeurs</Link></li>
              <li><Link className="hover:text-primary" href="/calendrier">Calendrier</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
              Communauté
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link className="hover:text-primary" href="/inscription">Rejoindre</Link></li>
              <li><Link className="hover:text-primary" href="/connexion">Espace membre</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-border pt-6 text-xs text-muted md:flex-row">
          <p>© {year} Danse 2 Vivre — Association loi 1901</p>
          <p>Site conçu avec ❤ pour la communauté</p>
        </div>
      </div>
    </footer>
  );
}
