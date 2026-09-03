import { describe, expect, it } from "vitest";
import {
  CURRENCY,
  PACK_AMOUNT_CENTS,
  PACK_AMOUNT_EUR,
  PACK_LABEL,
  PACK_SHORT_LABEL,
} from "./pricing";

describe("pricing", () => {
  it("classique = 250€ = 25000 cents", () => {
    expect(PACK_AMOUNT_EUR.classique).toBe(250);
    expect(PACK_AMOUNT_CENTS.classique).toBe(25_000);
  });

  it("village = 300€ = 30000 cents", () => {
    expect(PACK_AMOUNT_EUR.village).toBe(300);
    expect(PACK_AMOUNT_CENTS.village).toBe(30_000);
  });

  it("labels et devise", () => {
    expect(CURRENCY).toBe("eur");
    expect(PACK_LABEL.classique).toMatch(/1 cours/i);
    expect(PACK_LABEL.village).toMatch(/3 cours/i);
    expect(PACK_SHORT_LABEL.classique).toBe("Forfait Classique");
    expect(PACK_SHORT_LABEL.village).toBe("Forfait Village");
  });

  it("cents = euros * 100 (invariant)", () => {
    for (const pack of ["classique", "village"] as const) {
      expect(PACK_AMOUNT_CENTS[pack]).toBe(PACK_AMOUNT_EUR[pack] * 100);
    }
  });
});
