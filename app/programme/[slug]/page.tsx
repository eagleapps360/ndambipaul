import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildCalendarLink, getProgramme } from "@/lib/content";
import { formatEventDateTime } from "@/lib/events";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildProgrammeEventJsonLd } from "@/lib/structured-data";
import JsonLd from "@/components/JsonLd";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getProgramme(slug);

  if (!event) {
    return buildPageMetadata({
      title: "Programme",
      description: "Funeral programme details for the Pa Ndambi memorial.",
      path: `/programme/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: event.title,
    description: `${event.description} ${event.venue ? `Venue: ${event.venue}.` : ""}`,
    path: `/programme/${event.slug}`,
    type: "article",
  });
}

export default async function ProgrammeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getProgramme(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="pageMain printShell">
      <section className="pageHero narrowHero">
        <p className="kicker">Programme Detail</p>
        <h1>{event.title}</h1>
        <p>{formatEventDateTime(event.startTime, event.timezone)} · {event.venue}</p>
      </section>
      <section className="section programmeDetail">
        <p>{event.description}</p>
        <ol className="orderedProgramme">
          {event.items.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <div className="cardActions">
          <a className="button" href={buildCalendarLink(event)} target="_blank" rel="noreferrer">
            Add to calendar
          </a>
          {event.pdfUrl ? (
            <a className="button ghost darkButton" href={event.pdfUrl}>
              Download PDF
            </a>
          ) : (
            <span className="subtle">Downloadable PDF will appear here when uploaded by administrators.</span>
          )}
        </div>
      </section>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Programme", path: "/programme" },
            { name: event.title, path: `/programme/${event.slug}` },
          ]),
          buildProgrammeEventJsonLd({
            title: event.title,
            description: event.description,
            path: `/programme/${event.slug}`,
            startDate: event.startTime,
            locationName: event.venue,
          }),
        ]}
      />
    </main>
  );
}
