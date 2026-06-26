"use client";

import Link from "next/link";
import TributeCard from "@/components/TributeCard";
import type { TributeSummary } from "@/lib/public-types";

export default function TributeFilters({
  tributes,
  categories,
  relationships,
  selectedCategory,
  selectedRelationship,
}: {
  tributes: TributeSummary[];
  categories: string[];
  relationships: string[];
  selectedCategory: string;
  selectedRelationship: string;
}) {
  function buildHref(key: string, value: string) {
    const params = new URLSearchParams();
    if (selectedCategory !== "All" && key !== "category") {
      params.set("category", selectedCategory);
    }
    if (selectedRelationship !== "All" && key !== "relationship") {
      params.set("relationship", selectedRelationship);
    }
    if (value === "All") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    return `/tributes${params.toString() ? `?${params.toString()}` : ""}`;
  }

  const filtered = tributes.filter((tribute) => {
    const categoryOk = selectedCategory === "All" || tribute.category === selectedCategory;
    const relationshipOk = selectedRelationship === "All" || tribute.relationship === selectedRelationship;
    return categoryOk && relationshipOk;
  });

  return (
    <div className="tributeFilterShell">
      <div className="filterBar">
        <div>
          <span className="filterLabel">Category</span>
          <div className="filterOptions">
            {["All", ...categories].map((category) => (
              <Link key={category} href={buildHref("category", category)} className={selectedCategory === category ? "active" : ""}>
                {category}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <span className="filterLabel">Relationship</span>
          <div className="filterOptions">
            {["All", ...relationships].map((relationship) => (
              <Link
                key={relationship}
                href={buildHref("relationship", relationship)}
                className={selectedRelationship === relationship ? "active" : ""}
              >
                {relationship}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="tributeGrid">
        {filtered.map((tribute) => (
          <TributeCard key={tribute.slug} tribute={tribute} />
        ))}
      </div>
    </div>
  );
}
