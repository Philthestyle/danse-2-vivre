"use client";

import { useState } from "react";

/**
 * Bouton de confirmation à double-clic : le premier clic passe en état "confirmer",
 * un second (dans les 4s) soumet le formulaire parent. Simple, accessible, sans modale.
 * Utilisé pour les suppressions dans l'admin (brief §17 : confirmation avant suppression).
 */
export function ConfirmSubmit({
  label = "Supprimer",
  confirmLabel = "Confirmer",
  className = "btn-ghost text-danger",
}: {
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [armed, setArmed] = useState(false);

  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!armed) {
          e.preventDefault();
          setArmed(true);
          setTimeout(() => setArmed(false), 4000);
        }
      }}
      aria-label={armed ? confirmLabel : label}
    >
      {armed ? confirmLabel : label}
    </button>
  );
}
