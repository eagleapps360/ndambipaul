import test from "node:test";
import assert from "node:assert/strict";
import { toStripeAmount } from "../lib/payments/currency";
import { sanitizeText, validateDonationPledge, validateStripeDonation, validateTeamForm } from "../lib/validation";

test("sanitizeText removes angle brackets and trims whitespace", () => {
  assert.equal(sanitizeText("  <Hello>   there "), "Hello there");
});

test("validateStripeDonation rejects invalid payloads", () => {
  const result = validateStripeDonation({ amount: 0, name: "", acknowledgement: "" });
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.errors.length >= 2);
  }
});

test("validateStripeDonation accepts valid donation payload", () => {
  const result = validateStripeDonation({ amount: 5000, name: "Mary", acknowledgement: "public" });
  assert.equal(result.ok, true);
});

test("validateDonationPledge keeps mobile money submissions unverified at validation time", () => {
  const result = validateDonationPledge({
    donorName: "Mary",
    method: "mobile-money",
    amount: 5000,
    transactionReference: "MM-123",
    acknowledgement: "public",
  });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.method, "mobile-money");
  }
});

test("xaf stripe amounts remain zero-decimal", () => {
  assert.equal(toStripeAmount(5000, "XAF"), 5000);
});

test("validateTeamForm rejects submissions without consent", () => {
  const formData = new FormData();
  formData.set("fullName", "Demo Volunteer");
  formData.set("phone", "123456789");
  formData.set("preferredTeam", "ushers");
  const result = validateTeamForm(formData);
  assert.equal(result.ok, false);
});
