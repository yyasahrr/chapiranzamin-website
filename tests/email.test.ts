import assert from "node:assert/strict";
import test from "node:test";
import {
  getEmailConfiguration,
  isEmailConfigured,
  renderCampaignHtml,
} from "../src/lib/email.ts";

test("email sending remains disabled without explicit enable flag", () => {
  const previous = process.env.EMAIL_SEND_ENABLED;
  process.env.EMAIL_SEND_ENABLED = "false";
  assert.equal(isEmailConfigured(), false);
  if (previous === undefined) delete process.env.EMAIL_SEND_ENABLED;
  else process.env.EMAIL_SEND_ENABLED = previous;
});

test("SMTP configuration rejects invalid ports", () => {
  const previous = {
    enabled: process.env.EMAIL_SEND_ENABLED,
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    from: process.env.EMAIL_FROM_ADDRESS,
  };
  process.env.EMAIL_SEND_ENABLED = "true";
  process.env.SMTP_HOST = "smtp.example.test";
  process.env.SMTP_PORT = "70000";
  process.env.EMAIL_FROM_ADDRESS = "mail@example.test";
  assert.equal(getEmailConfiguration(), null);

  for (const [key, value] of Object.entries(previous)) {
    const envKey =
      key === "enabled"
        ? "EMAIL_SEND_ENABLED"
        : key === "host"
          ? "SMTP_HOST"
          : key === "port"
            ? "SMTP_PORT"
            : "EMAIL_FROM_ADDRESS";
    if (value === undefined) delete process.env[envKey];
    else process.env[envKey] = value;
  }
});

test("campaign HTML escapes untrusted content", () => {
  const html = renderCampaignHtml(
    "<script>alert(1)</script>",
    "سلام <img src=x onerror=alert(1)>"
  );
  assert.doesNotMatch(html, /<script>/);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /مدیریت دریافت ایمیل/);
});
