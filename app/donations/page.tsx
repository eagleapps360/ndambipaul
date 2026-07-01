import { DonationForm } from "@/components/Forms";
import SectionTitle from "@/components/SectionTitle";
import { donationOptions } from "@/lib/ui-config";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Donations",
  description: "Support the Pa Ndambi memorial with accountable cash, in-kind, mobile money or secure card donations.",
  path: "/donations",
});

export default function DonationsPage() {
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Donations</p>
        <h1>Support the family with accountability</h1>
        <p>Donation preferences include public acknowledgement, anonymous listing or private thanks only. Mobile Money declarations remain pending until manually verified.</p>
      </section>
      <section className="section splitLayout">
        <div>
          <SectionTitle eyebrow="Support Options" title="Practical and financial contributions" />
          <div className="optionList">
            {donationOptions.map((option) => (
              <article key={option.method} className="optionCard">
                <strong>{option.title}</strong>
                <p>{option.description}</p>
              </article>
            ))}
          </div>
        </div>
        <DonationForm />
      </section>
    </main>
  );
}
