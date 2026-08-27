import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-9xl text-primary">404</p>
        <h1 className="mt-4 text-3xl">Page introuvable</h1>
        <p className="mt-2 text-muted">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link href="/" className="btn-primary mt-8">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
