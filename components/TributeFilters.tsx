"use client";

import Link from "next/link";
import TributeCard from "@/components/TributeCard";
import type { TributeSummary } from "@/lib/public-types";

export default function TributeFilters({
  tributes,
  categories,
  selectedCategory,
}: {
  tributes: TributeSummary[];
  categories: string[];
  selectedCategory: string;
}) {
  function buildHref(value: string) {
    const params = new URLSearchParams();
    if (selectedCategory !== "All" && value !== "All") {
      params.set("category", selectedCategory);
    }
    if (value === "All") {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    return `/tributes${params.toString() ? `?${params.toString()}` : ""}`;
  }

  const filtered = tributes.filter((tribute) => {
    return selectedCategory === "All" || tribute.category === selectedCategory;
  });

  return (
    <div className="tributeFilterShell">
      <div className="filterBar">
        <div className="filterBlock">
          <p className="filterHeading">Category</p>
          <span className="filterLabel">Category</span>
          <div className="filterOptions">
            {["All", ...categories].map((category) => (
              <Link key={category} href={buildHref(category)} className={selectedCategory === category ? "active" : ""}>
                {category === "All" ? "All Categories" : category}
              </Link>
            ))}
          </div>
        </div>
        <div className="filterMetaRow">
          <span className="activeFilterText">
            {selectedCategory === "All" ? "Showing all approved tribute categories." : `Showing ${selectedCategory} tributes.`}
          </span>
          {selectedCategory !== "All" ? (
            <Link href="/tributes" className="filterResetLink">
              Reset filter
            </Link>
          ) : null}
        </div>
      </div>

      <div className="tributeGrid">
        {filtered.map((tribute) => (
          <TributeCard key={tribute.slug} tribute={tribute} />
        ))}
      </div>
      {filtered.length === 0 ? <p className="subtle activeFilterText">No approved tributes match this category yet.</p> : null}
    </div>
  );
}
