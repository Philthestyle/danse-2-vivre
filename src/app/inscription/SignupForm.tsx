"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";

interface City {
  id: string;
  name: string;
}

export function SignupForm() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [pack, setPack] = useState<"classique" | "village">("classique");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("cities")
      .select("id, name")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setCities(data ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const input: SignupInput = {
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      emailConfirm: String(form.get("emailConfirm") ?? ""),
      password: String(form.get("password") ?? ""),
      passwordConfirm: String(form.get("passwordConfirm") ?? ""),
      pack,
      cityId: pack === "classique" ? String(form.get("cityId") ?? "") || null : null,
    };

    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error: authErr } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          first_name: input.firstName,
          last_name: input.lastName,
          pack: input.pack,
          city_id: input.cityId,
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);

    if (authErr || !data.user) {
      setError(authErr?.message ?? "Impossible de créer le compte.");
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/profil"), 1500);
  }

  if (success) {
    return (
      <div role="status" className="text-center">
        <p className="font-display text-3xl text-primary">Bienvenue !</p>
        <p className="mt-2 text-muted">
          Un email de confirmation vous a été envoyé. Redirection en cours…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="label">Prénom</label>
          <input id="firstName" name="firstName" required className="field" />
        </div>
        <div>
          <label htmlFor="lastName" className="label">Nom</label>
          <input id="lastName" name="lastName" required className="field" />
        </div>
      </div>

      <fieldset>
        <legend className="label">Forfait</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["classique", "village"] as const).map((p) => (
            <label
              key={p}
              className={`card cursor-pointer p-4 transition-colors ${
                pack === p ? "border-primary bg-primary/5" : ""
              }`}
            >
              <input
                type="radio"
                name="pack"
                value={p}
                checked={pack === p}
                onChange={() => setPack(p)}
                className="sr-only"
              />
              <p className="font-semibold capitalize">{p}</p>
              <p className="mt-1 text-xs text-muted">
                {p === "classique"
                  ? "Accès à une ville de votre choix"
                  : "Accès à toutes les villes"}
              </p>
            </label>
          ))}
        </div>
      </fieldset>

      {pack === "classique" && (
        <div>
          <label htmlFor="cityId" className="label">Ville</label>
          <select id="cityId" name="cityId" required className="field">
            <option value="">— Choisir une ville —</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {cities.length === 0 && (
            <p className="mt-1 text-xs text-muted">
              Chargement des villes… (nécessite une connexion Supabase configurée)
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" />
        </div>
        <div>
          <label htmlFor="emailConfirm" className="label">Confirmer l'email</label>
          <input id="emailConfirm" name="emailConfirm" type="email" required className="field" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="password" className="label">Mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required className="field" />
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="label">Confirmer</label>
          <input id="passwordConfirm" name="passwordConfirm" type="password" required className="field" />
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création du compte…" : "Créer mon compte"}
      </button>

      <p className="text-center text-xs text-muted">
        Aucun paiement n'est demandé à cette étape. Votre forfait sera activé selon les
        règles de l'association.
      </p>
    </form>
  );
}
