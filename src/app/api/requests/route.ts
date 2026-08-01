import type { NextRequest } from "next/server";
import { proxyPhpRequest } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return proxyPhpRequest(request, "/api/requests");
}

export function POST(request: NextRequest) {
  return proxyPhpRequest(request, "/api/requests");
}
