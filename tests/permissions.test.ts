import assert from "node:assert/strict";
import test from "node:test";
import { canAccess, isStaff } from "../src/lib/permissions.ts";

const user = (role: string) =>
  ({
    id: 1,
    name: "Test",
    phone: "test",
    email: null,
    role,
    passwordHash: "not-used",
    createdAt: new Date(),
  }) as never;

test("customers never gain staff access", () => {
  assert.equal(isStaff(user("customer")), false);
  assert.equal(canAccess(user("customer"), "orders"), false);
});

test("content admins are restricted to content areas", () => {
  assert.equal(canAccess(user("content_admin"), "cms"), true);
  assert.equal(canAccess(user("content_admin"), "orders"), false);
  assert.equal(canAccess(user("content_admin"), "users"), false);
});

test("support can work with tickets but cannot manage finance", () => {
  assert.equal(canAccess(user("support"), "tickets"), true);
  assert.equal(canAccess(user("support"), "crm"), true);
  assert.equal(canAccess(user("support"), "finance"), false);
});

test("admin can access every known area", () => {
  for (const area of ["overview", "users", "finance", "settings", "cms"]) {
    assert.equal(canAccess(user("admin"), area), true);
  }
});
