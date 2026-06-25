import test from "node:test";
import assert from "node:assert/strict";
import { canManageAdminUsers, canManageContent, canManageFinance, canManageModeration } from "../lib/auth";

const moderator = {
  userId: "1",
  email: "mod@example.org",
  displayName: "Moderator",
  role: "moderator" as const,
  isActive: true,
};

const finance = {
  userId: "2",
  email: "finance@example.org",
  displayName: "Finance",
  role: "finance" as const,
  isActive: true,
};

test("moderators can manage tribute moderation but not finance", () => {
  assert.equal(canManageModeration(moderator), true);
  assert.equal(canManageFinance(moderator), false);
});

test("finance admins can manage finance but not admin users", () => {
  assert.equal(canManageFinance(finance), true);
  assert.equal(canManageAdminUsers(finance), false);
  assert.equal(canManageContent(finance), false);
});
