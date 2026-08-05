import assert from "node:assert/strict";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

async function request(path, init) {
  return fetch(new URL(path, baseUrl), {
    redirect: "manual",
    ...init,
  });
}

const checks = [];
for (const path of ["/", "/services", "/blog", "/request", "/login"]) {
  const response = await request(path);
  assert.equal(response.status, 200, `${path} must return 200`);
  checks.push(`${path}:200`);
}

const health = await request("/api/health");
assert.equal(health.status, 200);
const healthBody = await health.json();
assert.equal(healthBody.ok, true, "health must report ok=true");
assert.match(health.headers.get("content-security-policy") || "", /default-src 'self'/);
assert.equal(health.headers.get("x-content-type-options"), "nosniff");
checks.push("health:ok", "security-headers:ok");

const unauthorized = await request("/api/admin/overview");
// The PHP backend answers 401 for anonymous users; a Next-side guard would
// answer 403. Both prove the admin overview is not public.
assert.ok([401, 403].includes(unauthorized.status), `expected 401/403, got ${unauthorized.status}`);
assert.equal(typeof (await unauthorized.json()).message, "string");
checks.push("admin-authorization:ok");

const malformedLogin = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{",
});
// Next may reject malformed JSON with 400 before proxying; the PHP API
// validates the decoded payload and answers 422.
assert.ok([400, 422].includes(malformedLogin.status), `expected 400/422, got ${malformedLogin.status}`);
checks.push("invalid-json:ok");

const crossSite = await request("/api/auth/logout", {
  method: "POST",
  headers: {
    Origin: "https://attacker.invalid",
    "Sec-Fetch-Site": "cross-site",
  },
});
assert.equal(crossSite.status, 403);
checks.push("cross-site-mutation:blocked");

const adminPhone = process.env.ADMIN_PHONE;
const adminPassword = process.env.ADMIN_PASSWORD;
if (adminPhone && adminPassword) {
  const login = await request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: adminPhone,
      password: adminPassword,
      scope: "staff",
    }),
  });
  assert.equal(login.status, 200, "configured admin login must succeed");
  const loginBody = await login.json();
  assert.ok(["admin", "content_admin", "support"].includes(loginBody.user?.role));
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "login must set a session cookie");

  const overview = await request("/api/admin/overview", {
    headers: { Cookie: cookie },
  });
  assert.equal(overview.status, 200);
  assert.equal(typeof (await overview.json()).metrics, "object");
  checks.push("staff-login:ok", "admin-overview:ok");
} else {
  checks.push("staff-login:skipped(no credentials)");
}

console.log(`Smoke checks passed: ${checks.join(", ")}`);
