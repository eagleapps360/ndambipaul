import EventCountdown from "@/components/EventCountdown";
import SectionTitle from "@/components/SectionTitle";
import { getPublishedLivestreams } from "@/lib/content";
import { funeralEvents } from "@/lib/events";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Livestreams",
  description: "Join the wake service and burial service livestreams for Pa Ndambi Paul Angemba from anywhere once the family publishes the broadcast links.",
  path: "/livestreams",
});

export default async function LivestreamsPage() {
  const livestreams = await getPublishedLivestreams();
  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Livestreams</p>
        <h1>Join the memorial services from anywhere</h1>
        <p>Each service has its own dedicated livestream space and will appear here once the family publishes the broadcast links.</p>
      </section>

      <section className="section livestreamStack">
        {funeralEvents.map((event) => {
          const stream =
            livestreams.find((item) => item.eventSlug === event.slug) ||
            livestreams.find((item) => item.slug.includes(event.variant));
          const watchUrl = stream?.externalUrl || stream?.embedUrl || null;
          const replayUrl = stream?.recordingUrl || null;
          const statusLabel = stream?.status === "live" ? "LIVE NOW" : stream?.status === "ended" ? "REPLAY" : event.streamStatusUpcoming;

          return (
            <article key={event.id} id={event.slug} className="streamCard memorialWatchCard">
              <div>
                <SectionTitle eyebrow={statusLabel} title={event.title} copy="Livestream link will be available here" />
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
                  {stream?.status === "live" && watchUrl ? (
                    <a className="button" href={watchUrl} target="_blank" rel="noreferrer">
                      Watch Live Now
                    </a>
                  ) : stream?.status === "ended" && replayUrl ? (
                    <a className="button" href={replayUrl} target="_blank" rel="noreferrer">
                      Watch Replay
                    </a>
                  ) : watchUrl ? (
                    <a className="button ghost" href={watchUrl} target="_blank" rel="noreferrer">
                      View Livestream Details
                    </a>
                  ) : (
                    <span className="subtle">A viewing link will appear here when the livestream is ready.</span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
