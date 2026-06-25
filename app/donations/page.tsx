import { DonationForm } from "@/components/Forms";
import SectionTitle from "@/components/SectionTitle";
import { donationOptions } from "@/lib/ui-config";

export const metadata = {
  title: "Donations",
  description: "Donation options for cash, in kind, mobile money and secure card payments.",
};

export default function DonationsPage() {
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Donations</p>
        <h1>Support the family with accountability</h1>
        <p>Donation preferences include public acknowledgement, anonymous listing or private thanks only.</p>
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
