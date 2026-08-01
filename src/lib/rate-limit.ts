import type { NextRequest } from "next/server";

type Entry = { count: number; resetAt: number };

const globalForRateLimit = globalThis as typeof globalThis & {
  __chapIranRateLimits?: Map<string, Entry>;
};

const buckets =
  globalForRateLimit.__chapIranRateLimits ?? new Map<string, Entry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.__chapIranRateLimits = buckets;
}

export function requestClientKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || request.headers.get("x-real-ip") || "unknown";
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count <= limit) return { allowed: true, retryAfter: 0 };

  return {
    allowed: false,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfter: number): Response {
  return Response.json(
    { message: "تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد تلاش کنید." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    }
  );
}
