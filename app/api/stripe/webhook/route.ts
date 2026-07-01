import Stripe from "stripe";
import { NextResponse } from "next/server";
import { DONATION_CURRENCY, toStripeAmount } from "@/lib/payments/currency";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe webhook configuration is incomplete." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ received: true, event: event.type, demoMode: true });
    }
    const service = createServiceRoleSupabaseClient();
    const { data: existing } = await service
      .from("donation_payment_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded" ||
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const donationId = session.metadata?.donation_id || null;
      const isSuccessEvent = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
      await service.from("donation_payment_events").insert({
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        donation_id: donationId,
        payload_json: {
          id: event.id,
          type: event.type,
          session_id: session.id,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
        },
      });
      const { data: donation } = await service
        .from("donations")
        .select("id, amount, currency, internal_status")
        .eq("stripe_checkout_session_id", session.id)
        .maybeSingle();

      if (
        donation &&
        isSuccessEvent &&
        (String(donation.currency || "").toUpperCase() !== DONATION_CURRENCY ||
          toStripeAmount(Number(donation.amount || 0), DONATION_CURRENCY) !== Number(session.amount_total || 0))
      ) {
        return NextResponse.json({ error: "Donation amount mismatch." }, { status: 400 });
      }

      if (donation?.internal_status === "completed" && !isSuccessEvent) {
        return NextResponse.json({ received: true, ignored: "completed-donation" });
      }

      const update =
        isSuccessEvent
          ? {
              provider_payment_status: "paid",
              verification_state: "verified",
              internal_status: "completed",
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
              updated_at: new Date().toISOString(),
            }
          : event.type === "checkout.session.expired"
            ? {
                provider_payment_status: "expired",
                internal_status: "pending",
                updated_at: new Date().toISOString(),
              }
            : {
                provider_payment_status: "failed",
                internal_status: "pending",
                updated_at: new Date().toISOString(),
              };

      if (!donation || donation.internal_status !== "completed" || isSuccessEvent) {
        await service.from("donations").update(update).eq("stripe_checkout_session_id", session.id);
      }
      return NextResponse.json({ received: true, event: event.type });
    }
    return NextResponse.json({ received: true, ignored: event.type });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook signature." }, { status: 400 });
  }
}
