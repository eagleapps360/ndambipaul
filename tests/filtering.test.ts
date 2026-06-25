import test from "node:test";
import assert from "node:assert/strict";
import { getApprovedTributesUncached, getPublishedGalleryUncached } from "../lib/content";

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
