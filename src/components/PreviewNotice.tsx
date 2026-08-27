import Link from "next/link";

export function PreviewNotice({ area }: { area: string }) {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16">
      <div className="mx-auto max-w-lg card p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Preview GitHub Pages
        </p>
        <h1 className="mt-2 text-3xl">Backend non disponible</h1>
        <p className="mt-3 text-muted">
          La section <strong>{area}</strong> nécessite le backend (Supabase Auth,
          RLS, S3). GitHub Pages n'héberge que du statique — cette partie n'est
          fonctionnelle qu'en local ({" "}
          <code className="font-mono text-sm">npm run dev</code>) ou sur la
          production OVH.
        </p>
        <p className="mt-4 text-sm text-muted">
          Détails et alternatives dans{" "}
          <code className="font-mono text-xs">docs/AUDIT.md §9</code>.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
