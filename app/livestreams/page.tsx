import EventCountdown from "@/components/EventCountdown";
import SectionTitle from "@/components/SectionTitle";
import { funeralEvents } from "@/lib/events";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Livestreams",
  description: "Join the wake service and burial service livestreams for Pa Ndambi Paul Angemba from anywhere once the family publishes the broadcast links.",
  path: "/livestreams",
});

export default async function LivestreamsPage() {
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Livestreams</p>
        <h1>Join the memorial services from anywhere</h1>
        <p>Each service has its own dedicated livestream space and will appear here once the family publishes the broadcast links.</p>
      </section>

      <section className="section livestreamStack">
        {funeralEvents.map((event) => {
          return (
            <article key={event.id} className="streamCard memorialWatchCard">
              <div>
                <SectionTitle eyebrow={event.streamStatusUpcoming} title={event.title} copy="Livestream link will be available here" />
                <time className="memorialStreamDateTime" dateTime={event.dateTime}>
                  {event.displayDateTime}
                </time>
                <EventCountdown
                  targetDate={event.dateTime}
                  label={event.countdownLabel}
                  completedLabel={event.completedLabel}
                />
              </div>
              <div className="streamEmbed memorialStreamEmbedPlaceholder">
                <div className="memorialStreamPlaceholder memorialStreamPlaceholderLarge" aria-hidden="true">
                  <span />
                </div>
                <div className="cardActions">
                  <span className="subtle">A viewing link will appear here when the livestream is ready.</span>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
