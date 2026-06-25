import test from "node:test";
import assert from "node:assert/strict";
import { demoProgrammeEvents, demoSiteSettings, demoTributes } from "../lib/demo-content";
import { funeralDateRangeDisplay, funeralEvents, formatEventDateTime, getFuneralEventBySlug } from "../lib/events";

test("wake service details match the confirmed memorial schedule", () => {
  const wake = funeralEvents[0];
  assert.equal(wake.title, "Wake Service / Camp Fire");
  assert.equal(wake.shortDate, "2 July 2026");
  assert.equal(wake.time, "15:00");
  assert.equal(wake.venue, "Family Residence, Mbengwi");
  assert.equal(wake.locationNote, "Below Mbon Market");
  assert.equal(wake.dateTime, "2026-07-02T15:00:00+01:00");
});

test("burial service details match the confirmed memorial schedule", () => {
  const burial = funeralEvents[1];
  assert.equal(burial.title, "Burial Service");
  assert.equal(burial.shortDate, "3 July 2026");
  assert.equal(burial.time, "07:30");
  assert.equal(burial.venue, "PC Njembeng");
  assert.equal(burial.locationNote, null);
  assert.equal(burial.dateTime, "2026-07-03T07:30:00+01:00");
});

test("wake and burial countdown targets remain distinct", () => {
  assert.notEqual(funeralEvents[0].dateTime, funeralEvents[1].dateTime);
});

test("featured biography highlights show the corrected public event details", () => {
  assert.deepEqual(demoSiteSettings.venueHighlights, [
    {
      label: "Wake Service / Camp Fire",
      venue: "Family Residence, Mbengwi",
      date: "2 July 2026 · 15:00",
    },
    {
      label: "Burial Service",
      venue: "PC Njembeng",
      date: "3 July 2026 · 07:30",
    },
  ]);
});

test("placeholder eulogy attribution uses Marforh, Angemba and removes Mary Angemba from public tribute fallbacks", () => {
  const featuredTribute = demoTributes.find((tribute) => tribute.featured);
  assert.equal(featuredTribute?.name, "Marforh, Angemba");
  assert.equal(featuredTribute?.relationship, "Daughter");
  assert.equal(featuredTribute?.location, "Yaounde, Cameroon");
  assert.equal(demoTributes.some((tribute) => tribute.name === "Mary Angemba"), false);
});

test("public fallback programme contains only the confirmed wake and burial events", () => {
  assert.equal(demoProgrammeEvents.length, 2);
  assert.equal(demoProgrammeEvents.some((event) => /Saturday/i.test(event.title)), false);
  assert.equal(demoProgrammeEvents.some((event) => /thanksgiving/i.test(event.slug)), false);
});

test("central funeral event helpers expose the corrected slugs and public formatting", () => {
  assert.equal(getFuneralEventBySlug("wake-service-camp-fire")?.title, "Wake Service / Camp Fire");
  assert.equal(formatEventDateTime("2026-07-03T07:30:00+01:00"), "Friday, 3 July 2026 at 07:30");
  assert.equal(funeralDateRangeDisplay, "2–3 July 2026");
});
