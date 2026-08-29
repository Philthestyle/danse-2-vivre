"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupInput } from "@/lib/validation/auth";

interface City {
  id: string;
  name: string;
}

/**
 * Formulaire d'inscription pixel-perfect Figma Slide 3-4.
 * Champs (dans l'ordre Figma) :
 * - Nom et prénom de l'adhérent
 * - Forfait (Classique / Village en toggle)
 * - Sélectionner la ville d'enseignement (dropdown)
 * - Email + confirmation
 * - Mot de passe + confirmation
 *
 * Note : la mention paiement a été retirée (retour Allan 2026-08-28) — le
 * paiement vivra dans le profil membre en phase 2.
 */
export function SignupForm() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [pack, setPack] = useState<"classique" | "village">("classique");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
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

    const firstAndLast = String(form.get("fullName") ?? "").trim().split(/\s+/);
    const firstName = firstAndLast[0] ?? "";
    const lastName = firstAndLast.slice(1).join(" ");

    const input: SignupInput = {
      firstName,
      lastName,
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

    const supabase = createClient();
    if (!supabase) {
      setError("Backend non configuré dans cette preview.");
      return;
    }
    setLoading(true);
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
    setTimeout(() => router.push("/inscription/merci" as never), 800);
  }

  if (success) {
    return (
      <div role="status" className="rounded-xl border border-border bg-surface p-8 text-center">
        <p className="display-script text-fg">Bienvenue !</p>
        <p className="mt-3 text-muted">Redirection…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <Field label="Nom et prénom de l'adhérent" name="fullName" required />

      {/* Forfait — 2 boutons côte à côte */}
      <div>
        <label className="label">Forfait</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {(["classique", "village"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPack(p)}
              className={`rounded-md border px-4 py-3 text-sm font-semibold capitalize transition-colors ${
                pack === p
                  ? "border-primary text-fg shadow-[0_0_0_1px_rgba(219,22,47,0.6),inset_0_0_16px_rgba(219,22,47,0.12)]"
                  : "border-border text-muted hover:text-fg hover:border-fg"
              }`}
            >
              Forfait {p}
            </button>
          ))}
        </div>
      </div>

      {/* Ville — seulement si Classique */}
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
        </div>
      )}

      <Field label="Entrez votre adresse e-mail" name="email" type="email" required />
      <Field label="Confirmer l'adresse mail" name="emailConfirm" type="email" required />
      <Field label="Entrez votre mot de passe" name="password" type="password" required autoComplete="new-password" />
      <Field label="Confirmer votre mot de passe" name="passwordConfirm" type="password" required autoComplete="new-password" />

      {error && (
        <p role="alert" className="rounded-md border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Création du compte…" : "Créer mon compte"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="field"
      />
    </div>
  );
}

