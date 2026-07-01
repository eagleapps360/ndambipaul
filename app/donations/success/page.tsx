import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Donation Received",
  description: "Donation confirmation page for the Pa Ndambi memorial.",
  path: "/donations/success",
  noindex: true,
});

export default function DonationSuccessPage() {
  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">Donation Received</p>
        <h1>Thank you for your support</h1>
        <p>Your payment return has been received. Stripe webhook confirmation, not this browser page alone, is used as the final source of truth for completed card donations.</p>
      </section>
    </main>
  );
}
