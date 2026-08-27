"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validation/auth";

export function ResetForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = resetPasswordSchema.safeParse({
      password: form.get("password"),
      passwordConfirm: form.get("passwordConfirm"),
    });
    if (!parsed.success) {
      setState("error");
      setMessage(parsed.error.issues[0]?.message ?? "Formulaire invalide");
      return;
    }
    setState("loading");
    const supabase = createClient();
    if (!supabase) {
      setState("error");
      setMessage("Backend non configuré dans cette preview.");
      return;
    }
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });
    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }
    router.push("/profil");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="password" className="label">Nouveau mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className="field" />
      </div>
      <div>
        <label htmlFor="passwordConfirm" className="label">Confirmer</label>
        <input id="passwordConfirm" name="passwordConfirm" type="password" required className="field" />
      </div>
      {state === "error" && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {message}
        </p>
      )}
      <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
        {state === "loading" ? "Mise à jour…" : "Valider le nouveau mot de passe"}
      </button>
    </form>
  );
}
