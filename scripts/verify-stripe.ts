import Stripe from "stripe";

function requireEnv(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

async function main() {
  const secretKey = requireEnv("STRIPE_SECRET_KEY");
  const webhookSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
  const currency = (process.env.STRIPE_DONATION_CURRENCY || "usd").toLowerCase();
  const siteUrl = requireEnv("NEXT_PUBLIC_SITE_URL");

  if (!secretKey.startsWith("sk_")) {
    throw new Error("Stripe secret key format is invalid.");
  }
  if (!webhookSecret.startsWith("whsec_")) {
    throw new Error("Stripe webhook secret format is invalid.");
  }
  if (!/^[a-z]{3}$/.test(currency)) {
    throw new Error("Stripe donation currency must be a 3-letter ISO code.");
  }

  try {
    new URL(siteUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL is not a valid URL.");
  }

  const stripe = new Stripe(secretKey);
  await stripe.balance.retrieve();

  console.log("Stripe verification passed.");
  console.log(`Currency: ${currency.toUpperCase()}`);
  console.log(`Success URL: ${siteUrl}/donations/success`);
  console.log(`Cancel URL: ${siteUrl}/donations/cancelled`);
}

main().catch((error) => {
  console.error(`Stripe verification failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
