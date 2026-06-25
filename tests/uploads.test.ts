import test from "node:test";
import assert from "node:assert/strict";
import { inspectFiles } from "../lib/uploads";

test("inspectFiles accepts a valid png signature", async () => {
  const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00]);
  const file = new File([pngBytes], "photo.png", { type: "image/png" });
  const result = await inspectFiles([file]);
  assert.equal(result.errors.length, 0);
  assert.equal(result.metadata[0]?.kind, "image");
});

test("inspectFiles rejects mismatched file signatures", async () => {
  const badBytes = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
  const file = new File([badBytes], "photo.png", { type: "image/png" });
  const result = await inspectFiles([file]);
  assert.ok(result.errors.length > 0);
});
