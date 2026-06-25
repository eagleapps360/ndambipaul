import Stripe from "stripe";
import { NextResponse } from "next/server";
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

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_failed" || event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      await service.from("donation_payment_events").insert({
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        donation_id: session.metadata?.donationId || null,
        payload_json: event,
      });
      await service
        .from("donations")
        .update({
          provider_payment_status:
            event.type === "checkout.session.completed"
              ? "paid"
              : event.type === "checkout.session.expired"
                ? "expired"
                : "failed",
          internal_status: event.type === "checkout.session.completed" ? "completed" : "pending",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_checkout_session_id", session.id);
      return NextResponse.json({ received: true, event: event.type });
    }
    return NextResponse.json({ received: true, ignored: event.type });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid webhook signature." }, { status: 400 });
  }
}
