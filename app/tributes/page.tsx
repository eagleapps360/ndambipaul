import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import TributeFilters from "@/components/TributeFilters";
import { TributeForm } from "@/components/Forms";
import { getApprovedTributes } from "@/lib/content";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "Tributes",
  description: "Read approved public tributes and share a moderated message, memory or photograph in honour of Pa Ndambi Paul Angemba.",
  path: "/tributes",
});

export default async function TributesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const tributes = await getApprovedTributes();
  const categories = [...new Set(tributes.map((tribute) => tribute.category).filter(Boolean))];
  const params = await searchParams;
  const selectedCategory = params.category || "All";

  return (
    <main className="pageMain">
      <section className="pageHero tributeWallHero">
        <h1>Tributes</h1>
        <p>Words, photographs and memories shared in honour of Pa Ndambi Paul Angemba.</p>
        <div className="pageHeroActions">
          <Link href="/tributes/manage" className="textLink">
            Edit your tribute
          </Link>
        </div>
      </section>
      <section className="section splitLayout">
        <div>
          <SectionTitle eyebrow="Approved Tributes" title="Filter by category" />
          <TributeFilters
            tributes={tributes}
            categories={categories}
            selectedCategory={selectedCategory}
          />
        </div>
        <div>
          <SectionTitle eyebrow="Submit a Tribute" title="Send words and photographs for review" copy="New or updated tributes remain moderated before appearing publicly, and private contact details stay hidden from the public website." />
          <TributeForm />
        </div>
      </section>
    </main>
  );
}
