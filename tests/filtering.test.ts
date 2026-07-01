import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getApprovedTributesUncached, getPublishedGalleryUncached } from "../lib/content";

const tributePageSource = readFileSync(resolve("app/tributes/page.tsx"), "utf8");
const tributeFiltersSource = readFileSync(resolve("components/TributeFilters.tsx"), "utf8");

test("public tribute listing contains approved tributes only", async () => {
  const tributes = await getApprovedTributesUncached();
  assert.ok(tributes.every((tribute) => tribute.status === "approved"));
  assert.equal(tributes.length, 3);
});

test("gallery listing contains approved items with contributor metadata", async () => {
  const items = await getPublishedGalleryUncached();
  assert.ok(items.length > 0);
  assert.ok(items.every((item) => Boolean(item.contributor)));
});

test("public tribute filters only expose category filtering", () => {
  assert.equal(tributePageSource.includes("selectedRelationship"), false);
  assert.equal(tributeFiltersSource.includes("Relationship"), false);
  assert.equal(tributeFiltersSource.includes("All Categories"), true);
});
