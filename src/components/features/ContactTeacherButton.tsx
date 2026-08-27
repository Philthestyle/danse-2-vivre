"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ContactTeacherButton({ teacherSlug }: { teacherSlug: string }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setState("loading");
    setError(null);
    const res = await fetch("/api/conversations/private", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherSlug }),
    });
    if (!res.ok) {
      setState("error");
      const err = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/connexion?next=/professeurs/${teacherSlug}`);
        return;
      }
      setError(err.error ?? "Impossible de démarrer la conversation.");
      return;
    }
    const { id } = (await res.json()) as { id: string };
    router.push(`/messagerie/${id}`);
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        disabled={state === "loading"}
        className="btn-primary"
      >
        {state === "loading" ? "…" : "Contacter"}
      </button>
      {state === "error" && error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
