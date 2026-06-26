import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { biographyHero, biographySections } from "../lib/biography-content";

const pageSource = readFileSync(resolve("app/biography/page.tsx"), "utf8");
const componentSource = readFileSync(resolve("components/BiographyImageFrame.tsx"), "utf8");
const stylesSource = readFileSync(resolve("app/globals.css"), "utf8");

test("biography section images default to contain", () => {
  const images = biographySections.flatMap((section) => (section.image ? [section.image] : []));
  assert.ok(images.length > 0);
  for (const image of images) {
    assert.equal(image.fit, "contain");
  }
});

test("blue hero photograph uses cover with its own crop settings", () => {
  assert.equal(biographyHero.image.src, "/images/pa-ndambi/hero-pa-ndambi-blue-regalia.jpg");
  assert.equal(biographyHero.image.fit, "cover");
  assert.equal(biographyHero.image.objectPosition, "center 18%");
});

test("every configured biography image keeps independent object positioning and alt text", () => {
  const images = [biographyHero.image, ...biographySections.flatMap((section) => (section.image ? [section.image] : []))];
  for (const image of images) {
    assert.ok(image.alt.trim().length > 0);
    assert.ok(image.objectPosition);
  }
});

test("biography image styles and component never use fill mode", () => {
  assert.equal(componentSource.includes("object-fit: fill"), false);
  assert.equal(stylesSource.includes("object-fit: fill"), false);
  assert.equal(stylesSource.includes("object-fit: contain"), true);
  assert.equal(stylesSource.includes("object-fit: cover"), true);
});

test("missing biography images still show the existing placeholder", () => {
  assert.equal(pageSource.includes("Awaiting image assignment"), true);
});

test("hero image remains prioritised while lower biography images stay lazy-loaded", () => {
  assert.equal(pageSource.includes("<BiographyImageFrame image={biographyHero.image} priority"), true);
  assert.equal(componentSource.includes('loading={priority ? undefined : "lazy"}'), true);
});

test("mobile biography styles do not force every image into a square frame", () => {
  assert.equal(stylesSource.includes("@media (max-width: 768px)"), true);
  assert.equal(stylesSource.includes("aspect-ratio: auto;"), true);
  assert.equal(stylesSource.includes(".biographyImageFrame--square"), true);
});
