import test from "node:test";
import assert from "node:assert/strict";
import { POST as stripeWebhookPost } from "../app/api/stripe/webhook/route";
import { POST as donationPost } from "../app/api/donations/route";

test("stripe webhook rejects missing signature when configured", async () => {
  const previousSecret = process.env.STRIPE_SECRET_KEY;
  const previousWebhook = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_SECRET_KEY = "sk_test_demo";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_demo";
  const request = new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" });
  const response = await stripeWebhookPost(request);
  assert.equal(response.status, 400);
  process.env.STRIPE_SECRET_KEY = previousSecret;
  process.env.STRIPE_WEBHOOK_SECRET = previousWebhook;
});

test("mobile money donation submissions remain unverified", async () => {
  const request = new Request("http://localhost/api/donations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      donorName: "Mary",
      method: "mobile-money",
      amount: 5000,
      transactionReference: "MM-222",
      acknowledgement: "public",
    }),
  });
  const response = await donationPost(request);
  const body = await response.json();
  assert.equal(response.status, 202);
  assert.equal(body.verificationState, "unverified");
});
