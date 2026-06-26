import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { funeralEvents } from "@/lib/events";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Programme",
  description: "Confirmed funeral programme information for the wake service and burial service of Pa Ndambi Paul Angemba in Mbengwi and Oshie.",
  path: "/programme",
});

export default async function ProgrammePage() {
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Programme</p>
        <h1>Memorial events and service order</h1>
        <p>The confirmed programme below reflects the currently available funeral service details for Mbengwi.</p>
      </section>
      <section className="section">
        <SectionTitle eyebrow="Events" title="Confirmed primary events" />
        <div className="programmeList">
          {funeralEvents.map((event) => (
            <article key={event.id} className="programmeCard programmeCardMemorial">
              <span>{event.displayCompactDateTime}</span>
              <h2>{event.title}</h2>
              <p>
                {event.venue}
                {event.locationNote ? <><br />{event.locationNote}</> : null}
              </p>
              <div className="cardActions">
                <Link className="textLink" href="/">
                  Return to memorial homepage
                </Link>
                <button className="button ghost darkButton programmeSoonButton" type="button" disabled aria-disabled="true">
                  Full programme PDF coming soon
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
