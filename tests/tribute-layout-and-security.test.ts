import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeStoragePath } from "../lib/media/resolve-public-media";
import { buildObjectPosition, getInitials, sanitizeObjectPosition } from "../lib/tribute-helpers";
import { getApprovedTributesUncached } from "../lib/content";
import { createEditToken, hashToken } from "../lib/tribute-security";

const stylesSource = readFileSync(resolve("app/globals.css"), "utf8");

test("homepage funeral events and livestreams default to one column on mobile", () => {
  assert.equal(stylesSource.includes(".memorialEventGrid"), true);
  assert.equal(stylesSource.includes(".memorialStreamGrid"), true);
  assert.equal(stylesSource.includes("grid-template-columns: 1fr;"), true);
});

test("tribute cards default to one column on mobile and restore two columns above mobile", () => {
  assert.equal(stylesSource.includes(".tributeGrid"), true);
  assert.equal(stylesSource.includes("@media (max-width: 1080px)"), true);
  assert.equal(stylesSource.includes("@media (min-width: 721px) and (max-width: 1080px)"), true);
});

test("object positions are sanitized and clamped safely", () => {
  assert.equal(sanitizeObjectPosition("150% -20%"), "50% 50%");
  assert.equal(sanitizeObjectPosition("101% 17%"), "100% 17%");
  assert.equal(buildObjectPosition(32.2, 88.8), "32% 89%");
});

test("edit tokens are random-looking and only stored by hash", () => {
  const token = createEditToken();
  assert.ok(token.length > 20);
  assert.notEqual(hashToken(token), token);
});

test("public tribute loader omits private email fields while preserving profile and gallery media", async () => {
  const tributes = await getApprovedTributesUncached();
  assert.ok(tributes.length > 0);
  assert.equal("privateEmail" in tributes[0], false);
  assert.equal("privatePhone" in tributes[0], false);
  assert.ok(Array.isArray(tributes[0].media));
});

test("initials fallback remains available when no profile image exists", () => {
  assert.equal(getInitials("Marforh Angemba"), "MA");
});

test("profile storage paths normalise safely for signed-url resolution", () => {
  assert.equal(
    normalizeStoragePath("/tributes/demo/profile/file.webp", "memorial-private-submissions"),
    "tributes/demo/profile/file.webp",
  );
  assert.equal(
    normalizeStoragePath("memorial-private-submissions/tributes/demo/profile/file.webp", "memorial-private-submissions"),
    "tributes/demo/profile/file.webp",
  );
  assert.equal(
    normalizeStoragePath(
      "https://example.supabase.co/storage/v1/object/sign/memorial-private-submissions/tributes/demo/profile/file.webp?token=123",
      "memorial-private-submissions",
    ),
    "tributes/demo/profile/file.webp",
  );
  assert.equal(normalizeStoragePath("../escape.webp", "memorial-private-submissions"), null);
});
