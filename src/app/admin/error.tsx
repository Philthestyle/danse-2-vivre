"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/error]", error);
  }, [error]);

  return (
    <div className="card p-6 mt-6 border border-danger/40">
      <h2 className="text-lg font-semibold text-danger mb-2">
        Une erreur est survenue
      </h2>
      <p className="text-sm text-muted mb-4">
        L&apos;action admin n&apos;a pas pu aboutir. Détail technique ci-dessous
        — merci de l&apos;envoyer à Faustin si le problème persiste.
      </p>
      <pre className="mt-2 p-3 bg-elevated rounded text-xs overflow-x-auto whitespace-pre-wrap break-words">
        {error.message}
        {error.digest && `\n\n[digest: ${error.digest}]`}
      </pre>
      <div className="mt-4 flex gap-2">
        <button onClick={reset} className="btn-primary">
          Réessayer
        </button>
        <a href="/admin" className="btn-ghost">
          Retour admin
        </a>
      </div>
    </div>
  );
}
