import type { NextRequest } from "next/server";

// `npm run backend` serves the PHP API here in local development, so the
// frontend works with zero env setup. Production must still set
// PHP_API_BASE_URL explicitly.
const DEV_PHP_API_FALLBACK_URL = "http://localhost:8080";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getPhpBackendBaseUrl() {
  const configured =
    process.env.PHP_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    "";
  if (configured) return trimTrailingSlash(configured);
  if (process.env.NODE_ENV !== "production") return DEV_PHP_API_FALLBACK_URL;
  return "";
}

export function phpBackendConfigured() {
  return Boolean(getPhpBackendBaseUrl());
}

export function buildPhpBackendUrl(path: string) {
  const base = getPhpBackendBaseUrl();
  if (!base) return null;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function backendUnavailableResponse(message = "اتصال بک‌اند PHP تنظیم نشده است.") {
  return Response.json({ message }, { status: 503 });
}

export function backendUnreachableResponse() {
  const hint =
    process.env.NODE_ENV !== "production"
      ? " «npm run backend» را اجرا کرده‌اید؟"
      : "";
  return Response.json(
    { message: `پاسخی از بک‌اند دریافت نشد.${hint}` },
    { status: 503 }
  );
}

export async function proxyPhpRequest(
  request: NextRequest,
  path: string,
  init?: { method?: string }
) {
  const target = buildPhpBackendUrl(path);
  if (!target) return backendUnavailableResponse();

  const url = new URL(request.url);
  const query = url.search ? url.search : "";
  const targetUrl = `${target}${query}`;
  const method = init?.method || request.method;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (cookie) headers.set("cookie", cookie);

  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  let response: Response;
  try {
    response = await fetch(targetUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch {
    return backendUnreachableResponse();
  }

  const responseHeaders = new Headers();
  const forwarded = ["content-type", "set-cookie", "location", "cache-control"];
  for (const header of forwarded) {
    const value = response.headers.get(header);
    if (value) responseHeaders.set(header, value);
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function fetchPhpJson<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const target = buildPhpBackendUrl(path);
  if (!target) return null;

  try {
    const response = await fetch(target, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchPhpJsonFromRequest<T>(
  request: NextRequest,
  path: string,
  init?: RequestInit
): Promise<T | null> {
  const target = buildPhpBackendUrl(path);
  if (!target) return null;

  const headers = new Headers(init?.headers ?? {});
  const cookie = request.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);
  headers.set("accept", "application/json");

  try {
    const response = await fetch(target, {
      ...init,
      cache: "no-store",
      headers,
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export function notImplementedPhpRoute(message: string) {
  return Response.json({ message }, { status: 501 });
}
