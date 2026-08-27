/**
 * Footer minimaliste — le Figma n'a pas de gros footer, juste la section
 * "Nous contacter" à la fin de chaque écran. On garde ici un footer légal
 * discret pour respect brief §17 (mentions).
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-bg">
      <div className="container-page py-8 text-xs text-muted">
        <div className="flex flex-col justify-between gap-2 sm:flex-row">
          <p>© {year} Danse 2 Vivre — Association loi 1901</p>
          <p>Fait avec passion pour la communauté</p>
        </div>
      </div>
    </footer>
  );
}
