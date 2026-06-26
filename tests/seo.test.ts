import test from "node:test";
import assert from "node:assert/strict";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { absoluteUrl, buildPageMetadata, getSiteUrl, truncateDescription } from "../lib/seo";

test("SEO helpers use the production domain fallback when the environment URL is absent", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.equal(getSiteUrl(), "https://ndambi.org");
  assert.equal(absoluteUrl("/livestreams"), "https://ndambi.org/livestreams");
  process.env.NEXT_PUBLIC_SITE_URL = previous;
});

test("page metadata builds canonical URLs and noindex rules for private routes", () => {
  const metadata = buildPageMetadata({
    title: "Manage Tribute",
    path: "/tributes/manage",
    noindex: true,
  });

  assert.equal(metadata.alternates?.canonical, "https://ndambi.org/tributes/manage");
  assert.deepEqual(metadata.robots, {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "none",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  });
});

test("descriptions are trimmed for search-friendly snippets", () => {
  const longText =
    "Pa Ndambi Paul Angemba is remembered with gratitude for a life of service, faith, teaching, fatherhood, encouragement, counsel, hospitality and steadfast care across many communities and generations.";
  assert.ok(truncateDescription(longText, 120).length <= 120);
  assert.ok(truncateDescription(longText, 120).endsWith("..."));
});

test("robots disallows private memorial routes and points at the production sitemap", () => {
  const config = robots();
  const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
  assert.ok(Array.isArray(rules.disallow));
  assert.ok(rules.disallow.includes("/admin/"));
  assert.ok(rules.disallow.includes("/api/"));
  assert.ok(rules.disallow.includes("/tributes/manage/"));
  assert.equal(config.sitemap, "https://ndambi.org/sitemap.xml");
});

test("sitemap only includes public routes, including livestreams instead of watch", async () => {
  const entries = await sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.ok(urls.includes("https://ndambi.org/livestreams"));
  assert.equal(urls.some((url) => url.includes("/watch")), false);
  assert.equal(urls.some((url) => url.includes("/admin")), false);
  assert.equal(urls.some((url) => url.includes("/tributes/manage")), false);
});
