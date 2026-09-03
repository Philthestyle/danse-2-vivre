export type Pack = "classique" | "village";

export const PACK_AMOUNT_EUR: Record<Pack, number> = {
  classique: 250,
  village: 300,
};

export const PACK_AMOUNT_CENTS: Record<Pack, number> = {
  classique: PACK_AMOUNT_EUR.classique * 100,
  village: PACK_AMOUNT_EUR.village * 100,
};

export const PACK_LABEL: Record<Pack, string> = {
  classique: "Forfait Classique — 1 cours/semaine dans la ville choisie",
  village: "Forfait Village — 3 cours/semaine dans les villes de l'association",
};

export const PACK_SHORT_LABEL: Record<Pack, string> = {
  classique: "Forfait Classique",
  village: "Forfait Village",
};

export const CURRENCY = "eur" as const;
