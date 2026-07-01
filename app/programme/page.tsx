import Image from "next/image";
import Link from "next/link";
import ProgrammePrintButton from "@/components/ProgrammePrintButton";
import SectionTitle from "@/components/SectionTitle";
import { getPublishedLivestreams } from "@/lib/content";
import { getMemorialObjectPosition } from "@/lib/memorial-images";
import {
  burialSalutation,
  burialSchedule,
  churchServiceOrderGroups,
  departureInformation,
  eulogies,
  funeralOfficiatingMinisters,
  memorialHymn,
  openingHymn,
  openingSentence,
  participatingGroups,
  programmeDownloads,
  programmeHero,
  programmeNavigator,
  programmeOverviewEvents,
  responsivePsalm,
  wakeHymnReferences,
  wakeOfficiatingMinisters,
  wakeParticipatingGroups,
  wakeServiceOrder,
} from "@/lib/programme-content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Funeral Programme",
  description: "Confirmed wake service, funeral and burial programme information for Pa Ndambi Paul Angemba from 2 to 4 July 2026.",
  path: "/programme",
});

function getLivestreamAction(stream: Awaited<ReturnType<typeof getPublishedLivestreams>>[number] | undefined) {
  if (!stream) {
    return null;
  }

  const watchUrl = stream.externalUrl || stream.embedUrl || null;
  if (stream.status === "live" && watchUrl) {
    return { href: watchUrl, label: "Watch Live Now" };
  }

  if (stream.status === "ended" && stream.recordingUrl) {
    return { href: stream.recordingUrl, label: "Watch Replay" };
  }

  if (watchUrl) {
    return { href: watchUrl, label: "View Livestream Details" };
  }

  return null;
}

export default async function ProgrammePage() {
  const livestreams = await getPublishedLivestreams();
  const wakeStream = livestreams.find((item) => item.eventSlug === "wake-service-camp-fire" || item.slug.includes("wake"));
  const burialStream = livestreams.find((item) => item.eventSlug === "burial-service" || item.slug.includes("burial"));
  const wakeAction = getLivestreamAction(wakeStream);
  const burialAction = getLivestreamAction(burialStream);
  const portraitSrc = "/images/pa-ndambi/pa-ndambi-traditional-blue.jpg";

  return (
    <main className="pageMain programmePage">
      <section className="pageHero programmeHeroPage">
        <div className="programmeHeroCopy">
          <p className="kicker">{programmeHero.eyebrow}</p>
          <h1>{programmeHero.title}</h1>
          <p>{programmeHero.copy}</p>
          <div className="programmeHeroMeta">
            <span>{programmeHero.dateRange}</span>
            <span>Mbengwi, Cameroon</span>
          </div>
          <div className="cardActions programmeActionStack">
            <Link className="button" href="/livestreams">
              Open Livestreams
            </Link>
            <Link className="button ghost darkButton" href="/gallery">
              Visit Memorial Gallery
            </Link>
            <ProgrammePrintButton />
          </div>
        </div>
        <div className="programmeHeroImage">
          <div className="programmeHeroImageFrame">
            <Image
              src={portraitSrc}
              alt="Pa Ndambi Paul Angemba in traditional blue regalia"
              fill
              priority
              sizes="(max-width: 920px) 84vw, 28rem"
              style={{ objectPosition: getMemorialObjectPosition(portraitSrc) }}
            />
          </div>
        </div>
      </section>

      <nav className="programmeDayNav" aria-label="Programme sections">
        {programmeNavigator.map((item) => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
      </nav>

      <section id="overview" className="section programmeSection">
        <SectionTitle
          eyebrow="At a glance"
          title="Programme overview"
          copy="A quick guide to the main memorial gatherings before the detailed service order below."
        />
        <div className="programmeOverviewGrid">
          {programmeOverviewEvents.map((event) => (
            <article key={event.id} className="programmeOverviewCard">
              <span>{event.eyebrow}</span>
              <h2>{event.title}</h2>
              <p className="programmeOverviewTime">{event.time}</p>
              <p>{event.venue}</p>
              <p className="subtle">{event.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="wake-service" className="section programmeSection">
        <SectionTitle
          eyebrow="Thursday, 2 July 2026"
          title="Wake Service"
          copy="Family and friends gather at the family residence in Mbengwi for prayers, worship and words of comfort."
        />
        <div className="programmeContentGrid">
          <article className="programmeFeatureCard">
            <div className="programmeFeatureHeader">
              <strong>Thursday, 2 July 2026 - 4:00 PM</strong>
              <span>Family Residence, Mbengwi</span>
            </div>
            <ol className="programmeOrderedList">
              {wakeServiceOrder.map((item) => (
                <li key={item} className={item.includes("The Word") ? "programmeOrderItem programmeOrderItemEmphasis" : "programmeOrderItem"}>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>
          <div className="programmeStack">
            <article className="programmeFeatureCard">
              <h3>Officiating Ministers</h3>
              <div className="programmeMinisterGrid">
                {wakeOfficiatingMinisters.map((minister) => (
                  <div key={minister} className="programmeMinisterCard">
                    {minister}
                  </div>
                ))}
              </div>
            </article>
            <article className="programmeFeatureCard">
              <h3>Participating Groups</h3>
              <ul className="programmeSimpleList">
                {wakeParticipatingGroups.map((group) => (
                  <li key={group}>{group}</li>
                ))}
              </ul>
            </article>
            <article className="programmeFeatureCard">
              <h3>Livestream</h3>
              <p>Wake service stream updates will continue to appear on the dedicated livestream page.</p>
              <div className="cardActions">
                {wakeAction ? (
                  <a className="button" href={wakeAction.href} target="_blank" rel="noreferrer">
                    {wakeAction.label}
                  </a>
                ) : (
                  <Link className="button ghost darkButton" href="/livestreams#wake-service-camp-fire">
                    View Livestream Details
                  </Link>
                )}
              </div>
            </article>
          </div>
        </div>
        <div className="programmeReferenceGrid">
          {wakeHymnReferences.map((hymn) => (
            <article key={hymn.title} className="programmeReferenceCard">
              <span>{hymn.reference}</span>
              <h3>{hymn.title}</h3>
              <p>{hymn.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="funeral-day" className="section programmeSection">
        <SectionTitle
          eyebrow="Friday, 3 July 2026"
          title="Funeral Day Schedule"
          copy="The day begins at Mbengwi Mortuary and moves through the family residence, church service, burial and reception."
        />
        <div className="programmeTimeline">
          {burialSchedule.map((item) => (
            <article key={`${item.time}-${item.title}`} className="programmeTimelineItem">
              <div className="programmeTimelineMarker" aria-hidden="true" />
              <div className="programmeTimelineContent">
                <span>{item.time}</span>
                <h3>{item.title}</h3>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="church-service" className="section programmeSection">
        <SectionTitle
          eyebrow="Presbyterian Church Njembeng"
          title="Church Service Order"
          copy="Published order of worship for the funeral service, with hymn references and responsive portions preserved for use on the day."
        />

        <div className="programmeContentGrid">
          <article className="programmeFeatureCard">
            <h3>The Salutation</h3>
            <div className="programmeResponseStack">
              {burialSalutation.map((line) => (
                <div key={`${line.leader}-${line.response}`} className="programmeResponseLine">
                  <strong>{line.leader}</strong>
                  <p>{line.response}</p>
                </div>
              ))}
            </div>
          </article>
          <article className="programmeFeatureCard programmeScriptureCallout">
            <span>{openingSentence.reference}</span>
            <h3>Opening Sentence</h3>
            <p>{openingSentence.text}</p>
            <p className="programmeReferenceInline">
              Opening Hymn: {openingHymn.title} ({openingHymn.reference})
            </p>
          </article>
        </div>

        <details className="programmeFeatureCard">
          <summary>Responsive Psalm reference: {responsivePsalm.reference}</summary>
          <div className="programmeResponseStack">
            {responsivePsalm.lines.map((line) => (
              <div key={`${line.leader}-${line.response}`} className="programmeResponseLine">
                <strong>{line.leader}</strong>
                <p>{line.response}</p>
              </div>
            ))}
          </div>
        </details>

        <div className="programmeSectionGroupGrid">
          {churchServiceOrderGroups.map((group) => (
            <article key={group.title} className="programmeFeatureCard">
              <h3>{group.title}</h3>
              <ul className="programmeSimpleList">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="programmeContentGrid">
          <article className="programmeFeatureCard">
            <h3>Officiating Ministers</h3>
            <div className="programmeMinisterGrid">
              {funeralOfficiatingMinisters.map((minister) => (
                <div key={minister} className="programmeMinisterCard">
                  {minister}
                </div>
              ))}
            </div>
          </article>
          <article className="programmeFeatureCard">
            <h3>Eulogies and Participating Groups</h3>
            <p className="programmeOrderItemEmphasis">Eulogies</p>
            <ul className="programmeSimpleList">
              {eulogies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="programmeOrderItemEmphasis">Groups</p>
            <ul className="programmeSimpleList">
              {participatingGroups.map((group) => (
                <li key={group}>{group}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="programmeReferenceGrid">
          <article className="programmeReferenceCard programmeReferenceCardStatic">
            <span>{openingHymn.reference}</span>
            <h3>{openingHymn.title}</h3>
            <p>Opening hymn reference for the church service.</p>
          </article>
          <article className="programmeReferenceCard programmeReferenceCardStatic">
            <span>{memorialHymn.reference}</span>
            <h3>{memorialHymn.title}</h3>
            <p>Hymn placed before the sermon and ministry sequence.</p>
          </article>
        </div>

        <article className="programmeFeatureCard">
          <h3>Burial Service Livestream</h3>
          <p>The funeral and burial livestream remains available through the dedicated livestream page and will update as broadcast information changes.</p>
          <div className="cardActions">
            {burialAction ? (
              <a className="button" href={burialAction.href} target="_blank" rel="noreferrer">
                {burialAction.label}
              </a>
            ) : (
              <Link className="button ghost darkButton" href="/livestreams#burial-service">
                View Livestream Details
              </Link>
            )}
          </div>
        </article>
      </section>

      <section id="departure" className="section programmeSection">
        <SectionTitle eyebrow={departureInformation.date} title={departureInformation.title} />
        <article className="programmeFeatureCard">
          <p>{departureInformation.note}</p>
        </article>
      </section>

      <section id="downloads" className="section programmeSection">
        <SectionTitle
          eyebrow="Documents"
          title="Downloads and quick actions"
          copy="You can download the original programme documents or use the links below for livestream and gallery access."
        />
        <div className="programmeContentGrid">
          <article className="programmeFeatureCard">
            <h3>Programme Documents</h3>
            <div className="programmeStack">
              {programmeDownloads.map((item) => (
                <div key={item.href} className="programmeDownloadRow">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.format} download</p>
                  </div>
                  <a className="button ghost darkButton" href={item.href}>
                    Download
                  </a>
                </div>
              ))}
            </div>
          </article>
          <article className="programmeFeatureCard">
            <h3>Memorial Links</h3>
            <div className="programmeStack">
              <Link className="button" href="/livestreams">
                Open Livestreams
              </Link>
              <Link className="button ghost darkButton" href="/gallery">
                Browse Gallery
              </Link>
              <Link className="button ghost darkButton" href="/tributes">
                Read Tributes
              </Link>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
