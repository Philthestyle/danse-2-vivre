import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import {
  CURRENCY,
  PACK_AMOUNT_CENTS,
  PACK_SHORT_LABEL,
  type Pack,
} from "@/lib/pricing";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: membership } = await supabase
    .from("memberships")
    .select("id, pack, status")
    .eq("profile_id", user.id)
    .in("status", ["pending", "expired"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "no_membership" }, { status: 404 });
  }

  const pack = membership.pack as Pack;
  const amount = PACK_AMOUNT_CENTS[pack];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: amount,
          product_data: {
            name: `Adhésion Danse 2 Vivre — ${PACK_SHORT_LABEL[pack]}`,
          },
        },
      },
    ],
    success_url: `${siteUrl}/profil/adhesion/succes?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/profil/adhesion`,
    metadata: {
      membership_id: membership.id,
      profile_id: user.id,
      pack,
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "stripe_no_url" }, { status: 502 });
  }

  const admin = createAdminClient();
  await admin.from("payments").insert({
    membership_id: membership.id,
    amount_cents: amount,
    currency: CURRENCY,
    status: "pending",
    stripe_session_id: session.id,
    stripe_reference: session.id,
  });

  return NextResponse.json({ url: session.url });
}
