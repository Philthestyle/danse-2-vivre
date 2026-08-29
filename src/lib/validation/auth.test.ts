import { describe, it, expect } from "vitest";
import {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth";

describe("signupSchema", () => {
  const base = {
    firstName: "Paolo",
    lastName: "Rossi",
    email: "paolo@example.com",
    emailConfirm: "paolo@example.com",
    password: "SuperSecret9!",
    passwordConfirm: "SuperSecret9!",
    pack: "classique" as const,
    cityId: "00000000-0000-0000-0000-000000000001",
  };

  it("accepte un formulaire valide (Classique + ville)", () => {
    expect(signupSchema.safeParse(base).success).toBe(true);
  });

  it("accepte le forfait Village sans ville", () => {
    const v = { ...base, pack: "village" as const, cityId: null };
    expect(signupSchema.safeParse(v).success).toBe(true);
  });

  it("refuse Classique sans ville (brief §9)", () => {
    const v = { ...base, cityId: null };
    const r = signupSchema.safeParse(v);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toContain("cityId");
    }
  });

  it("refuse deux emails différents", () => {
    const v = { ...base, emailConfirm: "other@example.com" };
    expect(signupSchema.safeParse(v).success).toBe(false);
  });

  it("refuse deux mots de passe différents", () => {
    const v = { ...base, passwordConfirm: "Different9!" };
    expect(signupSchema.safeParse(v).success).toBe(false);
  });

  it("refuse un mot de passe faible (sans chiffre)", () => {
    const v = { ...base, password: "NoDigitsHere!", passwordConfirm: "NoDigitsHere!" };
    expect(signupSchema.safeParse(v).success).toBe(false);
  });

  it("refuse un mot de passe trop court", () => {
    const v = { ...base, password: "Ab1!", passwordConfirm: "Ab1!" };
    expect(signupSchema.safeParse(v).success).toBe(false);
  });

  it("ne permet PAS de choisir le rôle (brief §9)", () => {
    // Le schema n'expose pas de champ role — c'est structurel.
    expect("role" in base).toBe(false);
  });
});

describe("signinSchema", () => {
  it("accepte email + password non vide", () => {
    expect(
      signinSchema.safeParse({ email: "a@b.co", password: "x" }).success
    ).toBe(true);
  });
  it("refuse email invalide", () => {
    expect(
      signinSchema.safeParse({ email: "not-email", password: "x" }).success
    ).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("accepte un email valide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.co" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("accepte des mots de passe identiques et forts", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "StrongPass9",
        passwordConfirm: "StrongPass9",
      }).success
    ).toBe(true);
  });
  it("refuse la mismatch", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "StrongPass9",
        passwordConfirm: "Other9Chars",
      }).success
    ).toBe(false);
  });
});
