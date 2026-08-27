"use client";

/**
 * <select> qui soumet automatiquement le formulaire parent au changement.
 * Utilisé dans les DataTable admin pour éditer un champ en ligne.
 */
export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  ariaLabel,
}: {
  name: string;
  defaultValue: string;
  options: readonly { value: string; label: string }[];
  ariaLabel: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="field !py-1 text-xs capitalize"
      aria-label={ariaLabel}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
