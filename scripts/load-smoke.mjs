import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";
const total = Number(process.env.LOAD_REQUESTS || 60);
const concurrency = Number(process.env.LOAD_CONCURRENCY || 10);
const durations = [];
let failures = 0;
let cursor = 0;

async function worker() {
  while (cursor < total) {
    const index = cursor++;
    const path = index % 2 === 0 ? "/api/health" : "/api/services";
    const start = performance.now();
    try {
      const response = await fetch(new URL(path, baseUrl), { cache: "no-store" });
      if (!response.ok) failures += 1;
      await response.arrayBuffer();
    } catch {
      failures += 1;
    }
    durations.push(performance.now() - start);
  }
}

await Promise.all(
  Array.from({ length: Math.min(concurrency, total) }, () => worker())
);

durations.sort((a, b) => a - b);
const percentile = (value) =>
  durations[Math.min(durations.length - 1, Math.ceil(durations.length * value) - 1)];

assert.equal(failures, 0, "load smoke must not produce failed responses");
console.log(
  JSON.stringify({
    total,
    concurrency,
    failures,
    p50Ms: Math.round(percentile(0.5)),
    p95Ms: Math.round(percentile(0.95)),
    maxMs: Math.round(durations.at(-1) || 0),
  })
);
