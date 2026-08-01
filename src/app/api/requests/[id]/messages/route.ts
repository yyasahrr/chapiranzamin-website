import type { NextRequest } from "next/server";
import { proxyPhpRequest } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPhpRequest(request, `/api/requests/${id}/messages`);
}
