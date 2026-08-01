import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const adminPhone = process.env.ADMIN_PHONE;
const adminPassword = process.env.ADMIN_PASSWORD;
assert.ok(adminPhone && adminPassword, "admin credentials are required");

const call = (path, init) =>
  fetch(new URL(path, baseUrl), { redirect: "manual", ...init });

const adminLogin = await call("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    phone: adminPhone,
    password: adminPassword,
    scope: "staff",
  }),
});
assert.equal(adminLogin.status, 200);
const adminCookie = adminLogin.headers.get("set-cookie")?.split(";")[0];
assert.ok(adminCookie);

const initialCampaigns = await call("/api/admin/email-campaigns", {
  headers: { Cookie: adminCookie },
});
assert.equal(initialCampaigns.status, 200);

const suffix = Date.now().toString().slice(-8);
const customerPhone = `09${suffix.padStart(9, "0").slice(-9)}`;
const customerEmail = `smoke-${suffix}@example.test`;
const customerPassword = `${randomBytes(12).toString("base64url")}!Aa9`;
const registration = await call("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "کاربر تست موقت",
    phone: customerPhone,
    email: customerEmail,
    password: customerPassword,
    emailOptIn: true,
  }),
});
assert.equal(registration.status, 201);
const customerCookie = registration.headers.get("set-cookie")?.split(";")[0];
assert.ok(customerCookie);

const dashboard = await call("/api/dashboard/overview", {
  headers: { Cookie: customerCookie },
});
assert.equal(dashboard.status, 200);
const dashboardBody = await dashboard.json();
assert.equal(dashboardBody.user.emailOptIn, true);
assert.equal(Array.isArray(dashboardBody.orders), true);

const profile = await call("/api/account/profile", {
  method: "PATCH",
  headers: {
    Cookie: customerCookie,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "کاربر تست ویرایش‌شده",
    email: customerEmail,
    emailOptIn: true,
  }),
});
assert.equal(profile.status, 200);

const draft = await call("/api/admin/email-campaigns", {
  method: "POST",
  headers: {
    Cookie: adminCookie,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    subject: "کمپین آزمایشی",
    body: "این پیام فقط در دیتابیس موقت تست ذخیره می‌شود.",
    audience: "customers",
    sendNow: false,
    alsoNotify: false,
    idempotencyKey: randomUUID(),
  }),
});
assert.equal(draft.status, 201);
const draftBody = await draft.json();
assert.equal(draftBody.campaign.status, "draft");
assert.ok(draftBody.campaign.recipientCount >= 1);

console.log(
  "Feature smoke passed: customer dashboard, profile consent, email audience and draft campaign"
);
