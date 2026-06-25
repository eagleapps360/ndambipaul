import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getPublishedBiography, getPublishedTimeline } from "@/lib/content";

export const metadata = {
  title: "Biography",
  description: "Biography and life timeline for Pa Ndambi Paul Angemba.",
};

export default async function BiographyPage() {
  const [biographySections, timeline] = await Promise.all([getPublishedBiography(), getPublishedTimeline()]);
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Biography</p>
        <h1>The life and legacy of Pa Ndambi Paul Angemba</h1>
        <p>A data-driven life story arranged in chapters the family can refine from the administration area.</p>
      </section>

      <Reveal>
        <section className="section readingGrid">
          <div>
            <SectionTitle eyebrow="Life Story" title="A faithful life across family, work, faith and community" />
          </div>
          <div className="biographyStack">
            {biographySections.map((section) => (
              <article key={section.id} className="readingCard">
                <h2>{section.title}</h2>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <SectionTitle eyebrow="Timeline" title="Chronological milestones" />
          <div className="timelineRail">
            {timeline.map((item) => (
              <article key={item.year} className="timelineCard">
                <span>{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  );
}
