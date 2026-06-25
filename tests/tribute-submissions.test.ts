import test from "node:test";
import assert from "node:assert/strict";
import { buildTributeInsert, DEFAULT_TRIBUTE_CATEGORY, TRIBUTE_SUBMISSION_FAILURE_MESSAGE } from "../lib/validation";

test("tribute insert builder injects the default category and preserves the relationship fields", () => {
  const insert = buildTributeInsert(
    {
      name: "Mbah Thomas",
      relationship: "Friend",
      location: "Mbengwi",
      email: "friend@example.com",
      phone: "+237670000000",
      message: "Pa Ndambi's kindness shaped our family for many years.",
    },
    "tribute-ref-123",
  );

  assert.equal(insert.category, DEFAULT_TRIBUTE_CATEGORY);
  assert.equal(insert.relationship, "Friend");
  assert.equal(insert.relationship_category, "Friend");
  assert.equal(insert.name, "Mbah Thomas");
  assert.equal(insert.contributor_name, "Mbah Thomas");
});

test("tribute insert builder keeps trusted submission defaults under server control", () => {
  const insert = buildTributeInsert(
    {
      name: "Ngum Lydia",
      relationship: "Niece",
      location: "",
      email: "",
      phone: "",
      message: "He welcomed every generation with steady wisdom and practical care.",
    },
    "tribute-ref-456",
  );

  assert.equal(insert.status, "pending");
  assert.equal(insert.moderation_status, "pending");
  assert.equal(insert.featured, false);
  assert.equal(insert.private_email, null);
  assert.equal(insert.private_phone, null);
  assert.deepEqual(insert.private_contact, { email: null, phone: null });
  assert.equal(insert.location, null);
});

test("tribute submission failures use a safe public-facing error message", () => {
  assert.equal(TRIBUTE_SUBMISSION_FAILURE_MESSAGE, "We could not submit your tribute right now. Please try again shortly.");
  assert.equal(TRIBUTE_SUBMISSION_FAILURE_MESSAGE.includes("null value in column"), false);
  assert.equal(TRIBUTE_SUBMISSION_FAILURE_MESSAGE.includes("tributes.category"), false);
});
