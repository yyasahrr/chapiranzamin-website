import assert from "node:assert/strict";
import test from "node:test";
import { readApiResponse } from "../src/lib/client-api.ts";

test("valid JSON response is returned", async () => {
  const result = await readApiResponse<{ ok: boolean }>(
    Response.json({ ok: true })
  );
  assert.equal(result.ok, true);
});

test("empty or malformed server responses produce a controlled error", async () => {
  await assert.rejects(
    readApiResponse(new Response("", { status: 500 })),
    /انجام درخواست ناموفق بود/
  );
  await assert.rejects(
    readApiResponse(new Response("{", { status: 500 })),
    /پاسخ نامعتبر/
  );
});

test("API error message is preserved", async () => {
  await assert.rejects(
    readApiResponse(Response.json({ message: "ورودی نامعتبر" }, { status: 422 })),
    /ورودی نامعتبر/
  );
});
