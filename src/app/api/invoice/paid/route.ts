import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateInvoicePdf } from "@/lib/invoice/generate";
import type { Pack } from "@/lib/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Facture PDF « PAYÉE » — récupère le paiement Stripe succeeded le plus récent
 * pour l'utilisateur authentifié et rend une facture avec n° de transaction.
 * Renvoie 404 tant que le webhook Stripe n'a pas marqué le paiement.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, city:cities(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, pack, status")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "no_membership" }, { status: 404 });
  }

  const { data: payment } = await supabase
    .from("payments")
    .select("stripe_payment_intent, paid_at")
    .eq("membership_id", membership.id)
    .eq("status", "succeeded")
    .order("paid_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "not_paid_yet" }, { status: 404 });
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();
  const cityName =
    profile.city && typeof profile.city === "object" && "name" in profile.city
      ? (profile.city as { name: string }).name
      : null;

  const pdf = await generateInvoicePdf({
    fullName,
    pack: membership.pack as Pack,
    cityName,
    email: user.email ?? null,
    paid: true,
    paidAt: payment.paid_at ? new Date(payment.paid_at) : new Date(),
    paymentIntent: payment.stripe_payment_intent,
  });

  const safeName = fullName.replace(/[^a-zA-Z0-9-_]/g, "_");
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
