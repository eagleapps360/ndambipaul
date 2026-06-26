import Link from "next/link";
import AnimatedBiographyHeading from "@/components/AnimatedBiographyHeading";
import BiographyImageFrame from "@/components/BiographyImageFrame";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { biographyHero, biographyOpening, biographySections } from "@/lib/biography-content";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildPersonJsonLd } from "@/lib/structured-data";

export const metadata = buildPageMetadata({
  title: "Biography",
  description: "The life story of Pa Ndambi Paul Angemba, teacher, father, mentor, Christian servant and Scout leader.",
  path: "/biography",
});

export default async function BiographyPage() {
  return (
    <main className="pageMain biographyPage">
      <section className="pageHero biographyHero">
        <div className="biographyHeroGlow biographyHeroGlowOne" aria-hidden="true" />
        <div className="biographyHeroGlow biographyHeroGlowTwo" aria-hidden="true" />
        <div className="biographyHeroGrid">
          <div className="biographyHeroCopy">
            <p className="kicker biographyHeroKicker">{biographyHero.kicker}</p>
            <h1>
              <span>The Life Story of</span>
              <strong>{biographyHero.title}</strong>
            </h1>
            <p className="biographyHeroSubtitle">{biographyHero.subtitle}</p>
            <p className="biographyHeroDates">{biographyHero.dates}</p>
          </div>
          <div className="biographyHeroFigure">
            <BiographyImageFrame image={biographyHero.image} priority sizes="(max-width: 900px) 86vw, 34vw" />
          </div>
        </div>
      </section>

      <Reveal>
        <section className="section biographyOpeningCard">
          <AnimatedBiographyHeading
            chapter={biographyOpening.chapter}
            title={biographyOpening.title}
            shimmerWord={biographyOpening.shimmerWord}
          />
          <div className="biographyOpeningText">
            {biographyOpening.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      </Reveal>

      {biographySections.map((section) => {
        const imagePlacement = section.imagePlacement || "right";

        return (
          <Reveal key={section.id}>
            <section className={`section biographyStorySection biographyStorySection${imagePlacement === "left" ? "ImageLeft" : "ImageRight"}`}>
              <div className="biographyStoryMedia">
                {section.image ? (
                  <BiographyImageFrame image={section.image} sizes="(max-width: 768px) 100vw, 45vw" />
                ) : (
                  <div className="biographyPlaceholder" role="img" aria-label={`Awaiting image assignment for ${section.title}`}>
                    <span className="biographyPlaceholderChapter">{section.chapter}</span>
                    <strong>Awaiting image assignment</strong>
                    <p>A future family photograph can be attached to this chapter without changing the page layout.</p>
                  </div>
                )}
              </div>
              <div className="biographyStoryCopy">
                <AnimatedBiographyHeading chapter={section.chapter} title={section.title} shimmerWord={section.shimmerWord} />
                <div className="biographyParagraphs">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        );
      })}

      <Reveal>
        <section className="section biographyLinksSection">
          <AnimatedBiographyHeading chapter="09" title="Continue Remembering" shimmerWord="Remembering" align="center" />
          <p className="biographyLinksIntro">
            Explore more photographs and share words of gratitude, memory and comfort with the family.
          </p>
          <div className="biographyLinkGrid">
            <Link className="biographyLinkCard" href="/gallery">
              <span>Gallery</span>
              <strong>Open the family archive</strong>
              <p>View photographs and visual memories gathered in honour of Pa Ndambi Paul Angemba.</p>
            </Link>
            <Link className="biographyLinkCard" href="/tributes">
              <span>Tributes</span>
              <strong>Read and share reflections</strong>
              <p>Visit the tribute space to remember his life through messages from family, church and friends.</p>
            </Link>
          </div>
        </section>
      </Reveal>
      <JsonLd
        data={[
          buildPersonJsonLd(),
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Biography", path: "/biography" },
          ]),
        ]}
      />
    </main>
  );
}
