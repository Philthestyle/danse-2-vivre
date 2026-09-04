import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getWebhookSecret } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (err) {
    const message = err instanceof Error ? err.message : "invalid_signature";
    return NextResponse.json({ error: "invalid_signature", message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await activateMembership(session);
  }

  return NextResponse.json({ received: true });
}

async function activateMembership(session: Stripe.Checkout.Session) {
  const membershipId = session.metadata?.membership_id;
  if (!membershipId) return;

  const admin = createAdminClient();
  const now = new Date();
  const startsOn = now.toISOString().slice(0, 10);
  const expiresOn = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
    .toISOString()
    .slice(0, 10);

  await admin
    .from("payments")
    .update({
      status: "succeeded",
      paid_at: now.toISOString(),
      stripe_payment_intent:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    })
    .eq("stripe_session_id", session.id);

  await admin
    .from("memberships")
    .update({
      status: "active",
      starts_on: startsOn,
      expires_on: expiresOn,
      updated_at: now.toISOString(),
    })
    .eq("id", membershipId);
}
