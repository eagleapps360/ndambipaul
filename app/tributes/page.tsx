import SectionTitle from "@/components/SectionTitle";
import TributeFilters from "@/components/TributeFilters";
import { TributeForm } from "@/components/Forms";
import { getApprovedTributes } from "@/lib/content";

export const metadata = {
  title: "Tributes",
  description: "Approved public tributes and moderated tribute submission form.",
};

export default async function TributesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; relationship?: string }>;
}) {
  const tributes = await getApprovedTributes();
  const categories = [...new Set(tributes.map((tribute) => tribute.category))];
  const relationships = [...new Set(tributes.map((tribute) => tribute.relationship))];
  const params = await searchParams;
  const selectedCategory = params.category || "All";
  const selectedRelationship = params.relationship || "All";

  return (
    <main className="pageMain">
      <section className="pageHero">
        <p className="kicker">Tribute Wall</p>
        <h1>Messages of comfort, gratitude and remembrance</h1>
        <p>Only approved tributes appear publicly. Contact details remain private for administrators.</p>
      </section>
      <section className="section splitLayout">
        <div>
          <SectionTitle eyebrow="Approved Tributes" title="Filter by category or relationship" />
          <TributeFilters
            tributes={tributes}
            categories={categories}
            relationships={relationships}
            selectedCategory={selectedCategory}
            selectedRelationship={selectedRelationship}
          />
        </div>
        <div>
          <SectionTitle eyebrow="Submit a Tribute" title="Send words, photos and video clips for review" copy="All new submissions default to pending, include friendly validation and support multiple uploads." />
          <TributeForm />
        </div>
      </section>
    </main>
  );
}
