import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import TributeMediaLightbox from "@/components/TributeMediaLightbox";
import { getInitials } from "@/lib/tribute-helpers";
import { getTributeBySlug } from "@/lib/content";
import { absoluteUrl, buildPageMetadata, truncateDescription } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildTributeJsonLd } from "@/lib/structured-data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tribute = await getTributeBySlug(slug);

  if (!tribute) {
    return buildPageMetadata({
      title: "Tributes",
      description: "Tribute detail",
      path: `/tributes/${slug}`,
      noindex: true,
    });
  }

  const image = tribute.profileImage?.url || tribute.media[0]?.url || undefined;

  return buildPageMetadata({
    title: `Tribute from ${tribute.name}`,
    description: truncateDescription(tribute.message, 150),
    path: `/tributes/${tribute.slug}`,
    image,
    imageAlt: image ? `Tribute image shared by ${tribute.name}` : undefined,
    type: "article",
  });
}

export default async function TributeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tribute = await getTributeBySlug(slug);

  if (!tribute) {
    notFound();
  }

  return (
    <main className="pageMain">
      <section className="pageHero narrowHero tributeDetailHero">
        <p className="kicker">{tribute.category}</p>
        <h1>{tribute.name}</h1>
        <p>
          {tribute.relationship}
          {tribute.location ? ` · ${tribute.location}` : ""}
        </p>
        <Link href="/tributes" className="textLink">
          Back to Tributes
        </Link>
      </section>
      <section className="section tributeDetailShell">
        <article className="readingCard tributeDetailCard">
          <div className="tributeDetailIdentity">
            {tribute.profileImage?.url ? (
              <div className="tributeDetailProfile">
                <Image
                  src={tribute.profileImage.url}
                  alt={`${tribute.name} tribute profile image`}
                  fill
                  sizes="120px"
                  className="tributeAvatarPhoto"
                  unoptimized={!tribute.profileImage.url.startsWith("/")}
                  style={{ objectPosition: tribute.profileImage.objectPosition }}
                />
              </div>
            ) : (
              <div className="tributeDetailProfile tributeAvatarFallback" aria-label={`${tribute.name} initials`}>
                <span>{getInitials(tribute.name)}</span>
              </div>
            )}
            <div className="tributeDetailByline">
              <strong>{tribute.name}</strong>
              <span>{tribute.relationship}</span>
              {tribute.location ? <span>{tribute.location}</span> : null}
              <small>
                Shared {new Date(tribute.publishedAt || tribute.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </small>
            </div>
          </div>
          <p>{tribute.message}</p>
        </article>

        {tribute.media.length ? (
          <section className="tributeDetailGallery">
            <div className="sectionHead">
              <span>Shared photographs</span>
              <h2>Memories in pictures</h2>
              <p>Tap any image to view it in full while preserving its original proportions.</p>
            </div>
            <TributeMediaLightbox items={tribute.media} />
          </section>
        ) : null}
      </section>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Tributes", path: "/tributes" },
            { name: tribute.name, path: `/tributes/${tribute.slug}` },
          ]),
          buildTributeJsonLd({
            name: tribute.name,
            relationship: tribute.relationship,
            location: tribute.location,
            path: `/tributes/${tribute.slug}`,
            description: tribute.message,
            image: tribute.profileImage?.url ? absoluteUrl(tribute.profileImage.url) : undefined,
          }),
        ]}
      />
    </main>
  );
}
