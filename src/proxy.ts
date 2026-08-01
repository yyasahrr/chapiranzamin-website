import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const MAX_API_BODY_BYTES = 1_000_000;

export function proxy(request: NextRequest) {
  if (!MUTATING_METHODS.has(request.method)) return NextResponse.next();

  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > MAX_API_BODY_BYTES) {
    return Response.json(
      { message: "حجم درخواست بیش از حد مجاز است." },
      { status: 413 }
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  const origin = request.headers.get("origin");
  if (
    (fetchSite && !["same-origin", "none"].includes(fetchSite)) ||
    (origin && origin !== request.nextUrl.origin)
  ) {
    return Response.json(
      { message: "مبدأ درخواست معتبر نیست." },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
