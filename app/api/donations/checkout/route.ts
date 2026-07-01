import Stripe from "stripe";
import { NextResponse } from "next/server";
import { DONATION_CURRENCY, toStripeAmount, validateDonationAmount } from "@/lib/payments/currency";
import { DONATION_METHODS, buildDonationMethodFields } from "@/lib/payments/donation-methods";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { validateStripeDonation } from "@/lib/validation";
import { isSupabaseConfigured } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe is not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const result = validateStripeDonation(body);

  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const amount = validateDonationAmount(result.data.amount, DONATION_CURRENCY);
  const reference = `memorial-${Date.now()}`;
  let donationId: string | null = null;

  if (isSupabaseConfigured()) {
    const service = createServiceRoleSupabaseClient();
    const { data, error } = await service
      .from("donations")
      .insert({
        ...buildDonationMethodFields(DONATION_METHODS.CARD),
        donor_name: result.data.name,
        donor_email: result.data.email || null,
        donor_phone: result.data.phone || null,
        currency: DONATION_CURRENCY,
        amount,
        transaction_reference: reference,
        acknowledgement_preference: result.data.acknowledgement,
        anonymous_public_display: result.data.anonymous,
        donor_submission_status: "submitted",
        provider_payment_status: "pending",
        verification_state: "unverified",
        internal_status: "pending",
      })
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ errors: [error.message] }, { status: 500 });
    }
    donationId = data.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: reference,
    metadata: {
      donation_id: donationId || "",
      donor_name: result.data.name,
      donation_reference: reference,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: DONATION_CURRENCY.toLowerCase(),
          unit_amount: toStripeAmount(amount, DONATION_CURRENCY),
          product_data: {
            name: "Memorial family support",
            description: `Donation from ${result.data.name}`,
          },
        },
      },
    ],
    success_url: `${absoluteUrl("/donations/success")}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${absoluteUrl("/donations")}?payment=cancelled`,
  });

  if (isSupabaseConfigured() && donationId) {
    const service = createServiceRoleSupabaseClient();
    await service
      .from("donations")
      .update({ stripe_checkout_session_id: session.id, updated_at: new Date().toISOString() })
      .eq("id", donationId);
  }

  return NextResponse.json({ url: session.url, reference });
}
