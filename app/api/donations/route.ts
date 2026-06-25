import { NextResponse } from "next/server";
import { createServiceRoleSupabaseClient } from "@/lib/supabase";
import { validateDonationPledge } from "@/lib/validation";
import { isSupabaseConfigured } from "@/lib/env";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = validateDonationPledge(body);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }

  const reference = `donation-${Date.now()}`;
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: true, reference, demoMode: true, verificationState: "unverified" }, { status: 202 });
  }

  const service = createServiceRoleSupabaseClient();
  const { error } = await service.from("donations").insert({
    donor_name: result.data.donorName,
    donor_phone: result.data.phone || null,
    donor_email: result.data.email || null,
    anonymous_public_display: result.data.anonymous,
    donation_method: result.data.method,
    currency: "XAF",
    amount: result.data.amount,
    item_description: result.data.itemDescription || null,
    quantity: result.data.quantity || null,
    estimated_value: Number.isFinite(result.data.estimatedValue) ? result.data.estimatedValue : null,
    transaction_reference: result.data.transactionReference || reference,
    donor_submission_status: "submitted",
    provider_payment_status: result.data.method === "mobile-money" ? "pending" : "not_applicable",
    verification_state: "unverified",
    internal_status: "pending",
    acknowledgement_preference: result.data.acknowledgement,
    private_notes: result.data.notes || null,
    provider_name: result.data.provider || null,
    sent_at: result.data.sentAt || null,
  });

  if (error) {
    return NextResponse.json({ errors: [error.message] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, reference, verificationState: "unverified" }, { status: 202 });
}
