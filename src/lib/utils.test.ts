import { describe, it, expect } from "vitest";
import { slugify, cn } from "./utils";

describe("slugify", () => {
  it("transforme en kebab-case ASCII", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });
  it("supprime les accents", () => {
    expect(slugify("Café à Bordéaux")).toBe("cafe-a-bordeaux");
  });
  it("supprime la ponctuation", () => {
    expect(slugify("Salut !!! ça va ?")).toBe("salut-ca-va");
  });
  it("gère les strings vides", () => {
    expect(slugify("")).toBe("");
  });
});

describe("cn", () => {
  it("merge les classes tailwind conflictuelles", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("ignore les valeurs falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
