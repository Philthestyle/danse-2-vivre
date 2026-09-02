"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  teacherSlug: string;
  className?: string;
  label?: string;
}

export function ContactTeacherButton({
  teacherSlug,
  className = "btn-primary",
  label = "Envoyer un message",
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/conversations/private", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherSlug }),
      });
      if (res.status === 401) {
        router.push(`/connexion?next=/professeurs/${teacherSlug}`);
        return;
      }
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) {
        setError(data.error || "Impossible d'ouvrir la conversation.");
        setLoading(false);
        return;
      }
      router.push(`/messagerie/${data.id}`);
    } catch {
      setError("Erreur réseau.");
      setLoading(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
      >
        {loading ? "Ouverture…" : label}
      </button>
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
