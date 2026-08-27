"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signinSchema } from "@/lib/validation/auth";

export function SigninForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/profil";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const parsed = signinSchema.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setError(
        "Backend non configuré dans cette preview. La connexion réelle est disponible en local ou en production."
      );
      return;
    }
    setLoading(true);
    const { error: authErr } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (authErr) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(next as never);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="password" className="label !mb-0">Mot de passe</label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-primary hover:underline">
            Oublié ?
          </Link>
        </div>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
