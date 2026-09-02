import { NextResponse } from "next/server";
import { z } from "zod";
import { generateInvoicePdf } from "@/lib/invoice/generate";

const querySchema = z.object({
  name: z.string().min(1).max(240),
  pack: z.enum(["classique", "village"]),
  city: z.string().max(120).optional(),
  email: z.string().email().max(240).optional(),
});

/**
 * Génère et retourne une facture d'adhésion PDF pro-forma.
 * Les paramètres viennent de l'URL (self-serve depuis /inscription/merci).
 * Sécurité : facture pro-forma sans preuve de paiement — impact minimal si tamperé.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    name: searchParams.get("name"),
    pack: searchParams.get("pack"),
    city: searchParams.get("city") ?? undefined,
    email: searchParams.get("email") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad_request", details: parsed.error.issues },
      { status: 400 },
    );
  }

  const pdf = await generateInvoicePdf({
    fullName: parsed.data.name,
    pack: parsed.data.pack,
    cityName: parsed.data.city ?? null,
    email: parsed.data.email ?? null,
  });

  const safeName = parsed.data.name.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `facture-adhesion-D2V-${safeName}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
