import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function redirectBack(request: NextRequest) {
  return Response.redirect(
    new URL("/dashboard?payment=unsupported", request.url),
    303
  );
}

export function GET(request: NextRequest) {
  return redirectBack(request);
}

export function POST(request: NextRequest) {
  return redirectBack(request);
}
