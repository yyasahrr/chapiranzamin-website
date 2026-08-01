import { STATIC_SERVICES } from "@/lib/static-services";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { services: STATIC_SERVICES.filter((service) => service.active) },
    { headers: { "Cache-Control": "no-store" } }
  );
}
