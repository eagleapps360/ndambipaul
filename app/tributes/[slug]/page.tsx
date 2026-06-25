import Image from "next/image";
import { notFound } from "next/navigation";
import { getTributeBySlug } from "@/lib/content";

export default async function TributeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tribute = await getTributeBySlug(slug);

  if (!tribute) {
    notFound();
  }

  return (
    <main className="pageMain">
      <section className="pageHero narrowHero">
        <p className="kicker">{tribute.category}</p>
        <h1>{tribute.name}</h1>
        <p>
          {tribute.relationship} · {tribute.location} · {tribute.submittedAt}
        </p>
      </section>
      <section className="section detailShell">
        <article className="readingCard">
          <p>{tribute.message}</p>
        </article>
        <div className="detailMediaGrid">
          {tribute.profileImageUrl ? (
            <div className="detailMedia">
              <Image src={tribute.profileImageUrl} alt={tribute.name} fill sizes="(max-width: 900px) 100vw, 40vw" />
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
