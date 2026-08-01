import type { NextRequest } from "next/server";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getPhpBackendBaseUrl() {
  const configured =
    process.env.PHP_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim() ||
    "";
  return configured ? trimTrailingSlash(configured) : "";
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

  const response = await fetch(targetUrl, {
    method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

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

  const response = await fetch(target, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

export function notImplementedPhpRoute(message: string) {
  return Response.json({ message }, { status: 501 });
}
