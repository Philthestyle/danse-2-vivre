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
        <p className="font-display text-4xl text-primary">Bienvenue !</p>
        <p className="mt-2 text-muted">
          Un email de confirmation vous a été envoyé. Redirection en cours…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {/* Nom + prénom */}
      <fieldset>
        <legend className="label">Nom et prénom de l'adhérent</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="firstName"
            required
            className="field"
            placeholder="Prénom"
            aria-label="Prénom"
          />
          <input
            name="lastName"
            required
            className="field"
            placeholder="Nom"
            aria-label="Nom"
          />
        </div>
      </fieldset>

      {/* Forfait — toggle */}
      <fieldset>
        <legend className="label">Forfait</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["classique", "village"] as const).map((p) => (
            <label
              key={p}
              className={`cursor-pointer rounded-md border px-4 py-3 text-center text-sm transition-colors ${
                pack === p
                  ? "border-primary bg-primary/10 text-fg"
                  : "border-border bg-surface text-muted hover:border-fg/30"
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
              Forfait {p}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ville */}
      {pack === "classique" && (
        <div>
          <label htmlFor="cityId" className="label">
            Sélectionner la ville d'enseignement
          </label>
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

      {/* Emails */}
      <div>
        <label htmlFor="email" className="label">Entrez votre adresse e-mail</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
        />
      </div>
      <div>
        <label htmlFor="emailConfirm" className="label">Confirmer l'adresse mail</label>
        <input
          id="emailConfirm"
          name="emailConfirm"
          type="email"
          required
          className="field"
        />
      </div>

      {/* Mots de passe */}
      <div>
        <label htmlFor="password" className="label">Entrez votre mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="field"
        />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="label">Confirmer votre mot de passe</label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          className="field"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création du compte…" : "Créer mon compte"}
      </button>

      {/* Section paiement — brief §22 : présente en preview, DÉSACTIVÉE en Phase 1 */}
      <fieldset
        disabled
        aria-disabled="true"
        className="mt-4 rounded-md border border-dashed border-border p-5 opacity-60"
      >
        <legend className="px-2 text-xs uppercase tracking-widest text-muted">
          Méthode de paiement — activation prévue en Phase 2
        </legend>
        <p className="text-sm text-muted">
          Le paiement en ligne n'est pas encore actif. Aucun montant n'est demandé
          à l'inscription. Votre forfait sera activé selon les règles de l'association.
        </p>
        <button
          type="button"
          disabled
          className="btn-primary mt-4 w-full !cursor-not-allowed"
          title="Le paiement en ligne sera activé prochainement"
        >
          Payer — bientôt disponible
        </button>
      </fieldset>
    </form>
  );
}
