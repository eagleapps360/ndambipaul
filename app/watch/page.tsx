import EventCountdown from "@/components/EventCountdown";
import SectionTitle from "@/components/SectionTitle";
import { funeralEvents } from "@/lib/events";

export const metadata = {
  title: "Watch Live",
  description: "Separate livestream placeholders for the wake service and burial service of Pa Ndambi Paul Angemba.",
};

export default async function WatchPage() {
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Watch Live</p>
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
