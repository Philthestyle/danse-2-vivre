import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { PACK_AMOUNT_EUR, PACK_LABEL, type Pack } from "@/lib/pricing";

export interface InvoiceInput {
  fullName: string;
  pack: Pack;
  cityName?: string | null;
  email?: string | null;
  issuedAt?: Date;
  invoiceNumber?: string;
}

const ASSOCIATION = {
  name: "Danse 2 Vivre",
  addr1: "5 Impasse du Moulin à Vent",
  addr2: "77127 Lieusaint",
  email: "contact@danse2vivre.fr",
};

/**
 * Génère une facture pro-forma d'adhésion au format PDF.
 * Statut « À régler » — le paiement se fait en Phase 2 (Stripe / virement).
 */
export async function generateInvoicePdf(input: InvoiceInput): Promise<Uint8Array> {
  const issuedAt = input.issuedAt ?? new Date();
  const invoiceNumber =
    input.invoiceNumber ??
    `D2V-${issuedAt.getFullYear()}-${String(issuedAt.getMonth() + 1).padStart(2, "0")}${String(issuedAt.getDate()).padStart(2, "0")}-${Math.floor(Math.random() * 9000 + 1000)}`;

  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4 portrait (points, 72 DPI)
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const black = rgb(0.05, 0.05, 0.05);
  const muted = rgb(0.45, 0.45, 0.45);
  const primary = rgb(0.859, 0.086, 0.184); // #db162f
  const border = rgb(0.85, 0.85, 0.87);

  const marginX = 50;
  let y = 800;

  // ================== HEADER ==================
  page.drawText(ASSOCIATION.name, {
    x: marginX,
    y,
    size: 22,
    font: helveticaBold,
    color: primary,
  });
  y -= 20;
  page.drawText(ASSOCIATION.addr1, { x: marginX, y, size: 9, font: helvetica, color: muted });
  y -= 12;
  page.drawText(ASSOCIATION.addr2, { x: marginX, y, size: 9, font: helvetica, color: muted });
  y -= 12;
  page.drawText(ASSOCIATION.email, { x: marginX, y, size: 9, font: helvetica, color: muted });

  // Facture # + date (colonne droite)
  const rightX = 400;
  page.drawText("FACTURE", { x: rightX, y: 800, size: 14, font: helveticaBold, color: black });
  page.drawText(`N° ${invoiceNumber}`, {
    x: rightX,
    y: 780,
    size: 9,
    font: helvetica,
    color: muted,
  });
  page.drawText(
    `Émise le ${issuedAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
    { x: rightX, y: 766, size: 9, font: helvetica, color: muted },
  );

  y = 720;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: border,
  });

  // ================== ADHÉRENT ==================
  y -= 28;
  page.drawText("Adhérent", { x: marginX, y, size: 10, font: helveticaBold, color: muted });
  y -= 18;
  page.drawText(input.fullName, { x: marginX, y, size: 14, font: helveticaBold, color: black });
  if (input.email) {
    y -= 14;
    page.drawText(input.email, { x: marginX, y, size: 10, font: helvetica, color: muted });
  }
  if (input.cityName) {
    y -= 14;
    page.drawText(`Ville : ${input.cityName}`, { x: marginX, y, size: 10, font: helvetica, color: muted });
  }

  // ================== TABLEAU ==================
  y -= 40;
  const tableTop = y;
  const col1 = marginX;
  const col2 = 460;

  // Header row
  page.drawRectangle({
    x: marginX,
    y: y - 6,
    width: 495,
    height: 24,
    color: rgb(0.97, 0.97, 0.98),
  });
  page.drawText("Description", {
    x: col1 + 6,
    y: y + 4,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  page.drawText("Montant TTC", {
    x: col2,
    y: y + 4,
    size: 10,
    font: helveticaBold,
    color: black,
  });
  y -= 22;

  // Line item
  page.drawText(`Adhésion ${issuedAt.getFullYear()}-${issuedAt.getFullYear() + 1}`, {
    x: col1 + 6,
    y,
    size: 11,
    font: helveticaBold,
    color: black,
  });
  y -= 14;
  page.drawText(PACK_LABEL[input.pack], {
    x: col1 + 6,
    y,
    size: 9,
    font: helvetica,
    color: muted,
  });

  const amount = PACK_AMOUNT_EUR[input.pack];
  page.drawText(`${amount},00 €`, {
    x: col2,
    y: y + 14,
    size: 11,
    font: helveticaBold,
    color: black,
  });

  // Divider
  y -= 18;
  page.drawLine({
    start: { x: marginX, y },
    end: { x: 545, y },
    thickness: 0.5,
    color: border,
  });

  // Total
  y -= 24;
  page.drawText("Total à régler", {
    x: 350,
    y,
    size: 12,
    font: helveticaBold,
    color: black,
  });
  page.drawText(`${amount},00 €`, {
    x: col2,
    y,
    size: 14,
    font: helveticaBold,
    color: primary,
  });

  // ================== STATUT ==================
  y -= 50;
  page.drawRectangle({
    x: marginX,
    y: y - 6,
    width: 495,
    height: 40,
    color: rgb(1, 0.95, 0.92),
    borderColor: primary,
    borderWidth: 0.5,
  });
  page.drawText("Statut : EN ATTENTE DE PAIEMENT", {
    x: marginX + 12,
    y: y + 16,
    size: 10,
    font: helveticaBold,
    color: primary,
  });
  page.drawText(
    "Paiement acceptés en 3 fois maximum : virement, chèque ou espèces.",
    { x: marginX + 12, y: y + 2, size: 8, font: helvetica, color: muted },
  );

  // ================== FOOTER ==================
  const footerY = 60;
  page.drawLine({
    start: { x: marginX, y: footerY + 20 },
    end: { x: 545, y: footerY + 20 },
    thickness: 0.5,
    color: border,
  });
  page.drawText(
    `${ASSOCIATION.name} — ${ASSOCIATION.addr1}, ${ASSOCIATION.addr2} — ${ASSOCIATION.email}`,
    { x: marginX, y: footerY + 6, size: 7, font: helvetica, color: muted },
  );
  page.drawText("Association loi 1901 — Document généré automatiquement", {
    x: marginX,
    y: footerY - 4,
    size: 7,
    font: helvetica,
    color: muted,
  });

  return await doc.save();
}
