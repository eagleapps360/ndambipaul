import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import SiteLogo from "@/components/SiteLogo";
import SectionTitle from "@/components/SectionTitle";
import { DonationForm, TeamForm } from "@/components/Forms";
import EventCountdown from "@/components/EventCountdown";
import HomePhotoConstellation from "@/components/HomePhotoConstellation";
import JsonLd from "@/components/JsonLd";
import { getMemorialObjectPosition } from "@/lib/memorial-images";
import TributeCard from "@/components/TributeCard";
import {
  getApprovedGalleryItems,
  getFeaturedTributes,
  getPublicCoordinators,
  getPublicSiteSettings,
  getActiveTeams,
} from "@/lib/content";
import { funeralDateRangeDisplay, funeralEvents } from "@/lib/events";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildPersonJsonLd, buildProgrammeEventJsonLd, buildWebsiteJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  title: "Life and Legacy",
  description:
    "Celebrate the life and enduring legacy of Pa Ndambi Paul Angemba through his biography, tributes, gallery, funeral programme, livestreams, coordinators, volunteering and support information.",
  path: "/",
});

export default async function HomePage() {
  const [site, featuredTributes, featuredGallery, coordinatorGroups, teams] = await Promise.all([
    getPublicSiteSettings(),
    getFeaturedTributes(),
    getApprovedGalleryItems(),
    getPublicCoordinators(),
    getActiveTeams(),
  ]);
  const portraitSrc = "/images/pa-ndambi/pa-ndambi-blue-cutout.png";
  const heroParticles = Array.from({ length: 10 }, (_, index) => index);

  return (
    <main>
      <section className="hero memorialHero">
        <div className="memorialBackground" aria-hidden="true">
          <div className="memorialLight memorialLightOne" />
          <div className="memorialLight memorialLightTwo" />
          <div className="memorialSweep" />
          <div className="memorialCorner memorialCornerTopLeft" />
          <div className="memorialCorner memorialCornerBottomRight" />
          <div className="memorialLine" />
          <div className="memorialParticles">
            {heroParticles.map((particle) => (
              <span key={particle} className={`memorialParticle memorialParticle${particle + 1}`} />
            ))}
          </div>
        </div>
        <div className="heroContent memorialHeroContent">
          <div className="heroCopy memorialHeroCopy">
            <p className="kicker memorialKicker">In Loving Memory</p>
            <h1 className="memorialHeading">
              <span className="memorialHeadingIntro">Celebrating the Life and Legacy of</span>
              <span className="memorialHeadingName">Pa Ndambi Paul Angemba</span>
            </h1>
            <p className="subtitle memorialSubtitle">A life of love, wisdom, faith, and legacy.</p>
            <div className="memorialMeta" aria-label="Memorial dates and funeral information">
              <p className="dates memorialDates">14 September 1951 – 7 June 2026</p>
              <p className="memorialFuneralLine">Wake Service / Camp Fire and Burial Service · {funeralDateRangeDisplay}</p>
            </div>
            <div className="actions memorialActions">
              <Link className="button memorialButton" href="/biography">
                Explore His Story
              </Link>
              <Link className="button ghost memorialButton memorialButtonGhost" href="/tributes">
                Leave a Tribute
              </Link>
            </div>
            <div className="memorialSecondaryActions" aria-label="Additional memorial links">
              <Link href="/programme">View Funeral Programme</Link>
              <Link href="/livestreams">Watch Live</Link>
            </div>
            <div className="scrollIndicator" aria-hidden="true">
              <span>Scroll to remember</span>
              <div className="scrollIndicatorTrack">
                <div className="scrollIndicatorDot" />
              </div>
              <div className="scrollIndicatorArrow" />
            </div>
          </div>
          <div className="heroPortrait memorialHeroPortrait">
            <div className="memorialPortraitStage" aria-hidden="true">
              <span className="memorialRing memorialRingOne" />
              <span className="memorialRing memorialRingTwo" />
              <span className="memorialRing memorialRingThree" />
              <span className="memorialHalo" />
              <span className="memorialPlatform" />
            </div>
            <div className="portraitFrame memorialPortraitFrame">
              <Image
                src={portraitSrc}
                alt="Portrait of Pa Ndambi Paul Angemba in blue regalia"
                fill
                priority
                sizes="(max-width: 720px) 88vw, (max-width: 1080px) 68vw, 40vw"
                style={{ objectPosition: getMemorialObjectPosition(portraitSrc) }}
              />
            </div>
          </div>
        </div>
      </section>

      <Reveal>
        <HomePhotoConstellation />
      </Reveal>

      <Reveal>
        <section className="section introGrid">
          <div>
            <SectionTitle eyebrow="Featured Biography" title="A legacy written in people" copy={site.hero.biographyExcerpt} />
            <Link className="textLink" href="/biography">
              Continue to the full biography
            </Link>
          </div>
          <div className="memorialFacts">
            {site.venueHighlights.map((item) => (
              <article key={item.label} className="featuredBiographyEvent">
                <span>{item.label}</span>
                <p className="featuredBiographyVenue">{item.venue}</p>
                <p className="featuredBiographyDate">{item.date}</p>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <SectionTitle eyebrow="Featured Tributes" title="Words from family, church and friends" />
          <div className="tributeGrid">
            {featuredTributes.map((tribute) => (
              <TributeCard key={tribute.slug} tribute={{ ...tribute, createdAt: tribute.publishedAt || tribute.submittedAt }} compact />
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <SectionTitle eyebrow="Gallery Preview" title="Photographs and video memories" />
          <div className="previewGrid">
            {featuredGallery.slice(0, 4).map((item) => (
              <article key={item.id} className="previewCard">
                <div className="previewMedia">
                  <Image
                    src={item.posterUrl}
                    alt={item.altText || item.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 25vw"
                    style={{ objectPosition: getMemorialObjectPosition(item.posterUrl) }}
                  />
                </div>
                <div className="previewCopy">
                  <strong>{item.title}</strong>
                  <span>{item.albumTitle}</span>
                </div>
              </article>
            ))}
          </div>
          <div className="sectionActions">
            <Link className="button darkButton" href="/gallery">
              Open full gallery
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section memorialEventsSection">
          <SectionTitle
            eyebrow="Upcoming Funeral Events"
            title="Upcoming Funeral Events"
            copy="Join the family in Mbengwi as we gather to honour, remember and lay Pa Ndambi Paul Angemba to rest."
          />
          <div className="memorialEventGrid">
            {funeralEvents.map((event) => (
              <article
                key={event.id}
                className={event.variant === "wake" ? "memorialEventCard memorialEventCardWake" : "memorialEventCard memorialEventCardBurial"}
              >
                <div className="memorialEventTopLine" />
                <div className="memorialEventLabelRow">
                  <span className="memorialEventLabel">{event.label}</span>
                  <span className="memorialEventIcon" aria-hidden="true">
                    {event.variant === "wake" ? "✦" : "✝"}
                  </span>
                </div>
                <h3>{event.title}</h3>
                <time className="memorialEventDateTime" dateTime={event.dateTime}>
                  {event.displayDateTime}
                </time>
                <p className="memorialEventVenue">
                  <span>{event.venue}</span>
                  {event.locationNote ? <span>{event.locationNote}</span> : null}
                </p>
                <p className="memorialEventDescription">{event.description}</p>
                <EventCountdown
                  targetDate={event.dateTime}
                  label={event.countdownLabel}
                  completedLabel={event.completedLabel}
                  inverse={event.variant === "burial"}
                />
                <div className="cardActions">
                  <Link className={event.variant === "wake" ? "button memorialEventButton" : "button memorialEventButton memorialEventButtonInverse"} href="/programme">
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal>
        <section className="section memorialStreamsSection">
          <SectionTitle eyebrow="Livestreams" title="Service livestreams" copy="Each service will have its own livestream space once broadcast links are ready." />
          <div className="memorialStreamGrid">
            {funeralEvents.map((event) => {
              return (
                <article key={`${event.id}-stream`} className="memorialStreamCard">
                  <div className="memorialStreamHeader">
                    <span className="memorialStreamStatus">{event.streamStatusUpcoming}</span>
                    <h3>{event.title}</h3>
                  </div>
                  <time className="memorialStreamDateTime" dateTime={event.dateTime}>
                    {event.displayDateTime}
                  </time>
                  <div className="memorialStreamPlaceholder" aria-hidden="true">
                    <span />
                  </div>
                  <p className="memorialStreamCopy">Livestream link will be available here</p>
                  <div className="cardActions">
                    <Link className="textLink" href="/livestreams">
                      Open livestream page
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </Reveal>

      <section className="band">
        <div>
          <strong>Share a memory with the family</strong>
          <span>Tributes and gallery uploads are reviewed before they become public.</span>
        </div>
        <a className="button light" href={site.socialLinks.whatsapp} target="_blank" rel="noreferrer">
          Share via WhatsApp
        </a>
      </section>

      <Reveal>
        <section className="section splitLayout">
          <div>
            <SectionTitle eyebrow="Join a Team" title="Serve with warmth, dignity and care" copy="Volunteer support is organised by coordinators and all registrations begin as pending." />
          </div>
          <TeamForm teams={teams} />
        </section>
      </Reveal>

      <Reveal>
        <section className="section splitLayout">
          <div>
            <SectionTitle eyebrow="Support the Family" title="Cash, in kind, mobile money or card" copy="Donation information is organised with accountability in mind and should never expose private finance details publicly." />
          </div>
          <DonationForm />
        </section>
      </Reveal>

      <Reveal>
        <section className="section">
          <SectionTitle eyebrow="Coordinators" title="Public-facing departments" copy="Only contacts marked public appear on the memorial website." />
          <div className="coordinatorGrid">
            {coordinatorGroups.slice(0, 6).map((group) => (
              <article key={group.title} className="coordinatorCard">
                <span className="avatar">{group.title[0]}</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                {group.contacts.filter((contact) => contact.publicPhone || contact.publicEmail).map((contact) => (
                  <small key={contact.id}>
                    {contact.name} · {contact.phone}
                  </small>
                ))}
              </article>
            ))}
          </div>
          <div className="sectionActions">
            <Link className="textLink" href="/coordinators">
              View all departments
            </Link>
          </div>
        </section>
      </Reveal>

      <footer className="footer">
        <div className="footerBrand">
          <SiteLogo label={site.memorialName} />
        </div>
        <p>{site.subtitle}</p>
        <Link href="/admin">Administrator area</Link>
      </footer>
      <JsonLd
        data={[
          buildWebsiteJsonLd(),
          buildPersonJsonLd(),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
          ]),
          ...funeralEvents.map((event) =>
            buildProgrammeEventJsonLd({
              title: event.title,
              description: event.description,
              path: `/programme/${event.slug}`,
              startDate: event.dateTime,
              locationName: event.venue,
            }),
          ),
        ]}
      />
    </main>
  );
}
