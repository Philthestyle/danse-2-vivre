import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generateInvoicePdf } from "./generate";

const PDF_MAGIC = "%PDF-";

describe("generateInvoicePdf", () => {
  it("produit un PDF valide en mode pro-forma (défaut)", async () => {
    const bytes = await generateInvoicePdf({
      fullName: "Jean Dupont",
      pack: "classique",
      invoiceNumber: "D2V-TEST-0001",
    });
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(1000);
    const head = new TextDecoder().decode(bytes.slice(0, 5));
    expect(head).toBe(PDF_MAGIC);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("produit un PDF valide en mode payé avec transaction Stripe", async () => {
    const bytes = await generateInvoicePdf({
      fullName: "Marie Curie",
      pack: "village",
      email: "marie@example.com",
      cityName: "Lieusaint",
      paid: true,
      paidAt: new Date("2026-09-04T10:30:00Z"),
      paymentIntent: "pi_3TestIntent",
      invoiceNumber: "D2V-TEST-0002",
    });
    expect(bytes.length).toBeGreaterThan(1000);
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });

  it("les deux variantes produisent des bytes différents (statut distinct)", async () => {
    const base = {
      fullName: "Test User",
      pack: "classique" as const,
      invoiceNumber: "D2V-TEST-DIFF",
      issuedAt: new Date("2026-09-04"),
    };
    const proforma = await generateInvoicePdf(base);
    const paid = await generateInvoicePdf({
      ...base,
      paid: true,
      paidAt: new Date("2026-09-04"),
      paymentIntent: "pi_abc",
    });
    expect(paid).not.toEqual(proforma);
  });

  it("accepte les champs pack (village) sans crasher", async () => {
    const bytes = await generateInvoicePdf({
      fullName: "Alice",
      pack: "village",
      invoiceNumber: "D2V-TEST-VILLAGE",
    });
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
  });
});
