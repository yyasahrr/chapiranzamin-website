import { fetchPhpJson, phpBackendConfigured } from "@/lib/php-backend";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!phpBackendConfigured()) {
    return Response.json({
      ok: true,
      backend: "unconfigured",
      mode: "frontend-only",
    });
  }

  const data = await fetchPhpJson<{ service?: string }>("/health");
  if (!data) return Response.json({ ok: false }, { status: 502 });

  return Response.json({ ok: true, backend: data.service ?? "php-backend" });
}
