"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export function ForgotForm() {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    const form = new FormData(e.currentTarget);
    const parsed = forgotPasswordSchema.safeParse({ email: form.get("email") });
    if (!parsed.success) {
      setState("error");
      setMessage(parsed.error.issues[0]?.message ?? "Email invalide");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    if (error) {
      setState("error");
      setMessage(error.message);
      return;
    }
    setState("sent");
    setMessage(
      "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation."
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required className="field" />
      </div>
      {state === "error" && (
        <p role="alert" className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {message}
        </p>
      )}
      {state === "sent" && (
        <p role="status" className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {message}
        </p>
      )}
      <button type="submit" disabled={state === "loading"} className="btn-primary w-full">
        {state === "loading" ? "Envoi…" : "Envoyer le lien"}
      </button>
    </form>
  );
}
