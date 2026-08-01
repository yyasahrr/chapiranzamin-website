import type { NextRequest } from "next/server";
import {
  fetchPhpJsonFromRequest,
  notImplementedPhpRoute,
  phpBackendConfigured,
} from "@/lib/php-backend";
import { STATIC_SERVICES } from "@/lib/static-services";

type PhpMe = {
  user?: { role?: string };
};

type PhpStats = {
  totalRequests: number;
  customerCount: number;
  byStatus: { status: string; count: number | string }[];
};

type PhpRequest = {
  id: number;
  tracking_code: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string | null;
  status: string;
  priority: string;
  created_at: string;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!phpBackendConfigured()) {
    return notImplementedPhpRoute(
      "بخش مدیریت به بک‌اند PHP متصل نیست. متغیر PHP_API_BASE_URL را تنظیم کنید."
    );
  }

  const me = await fetchPhpJsonFromRequest<PhpMe>(request, "/api/auth/me");
  if (!me?.user) {
    return Response.json({ message: "ابتدا وارد شوید." }, { status: 401 });
  }
  if (!["admin", "content_admin", "support"].includes(me.user.role ?? "")) {
    return Response.json({ message: "دسترسی غیرمجاز." }, { status: 403 });
  }

  const [stats, requests] = await Promise.all([
    fetchPhpJsonFromRequest<PhpStats>(request, "/api/admin/stats"),
    fetchPhpJsonFromRequest<{ requests: PhpRequest[] }>(request, "/api/admin/requests"),
  ]);

  const normalizedRequests =
    requests?.requests?.map((item) => ({
      id: item.id,
      trackingCode: item.tracking_code,
      contactName: item.contact_name,
      contactPhone: item.contact_phone,
      contactEmail: item.contact_email ?? null,
      status: item.status,
      priority: item.priority,
      createdAt: item.created_at,
    })) ?? [];

  return Response.json(
    {
      users: [],
      requests: normalizedRequests,
      services: STATIC_SERVICES,
      invoices: [],
      notifications: [],
      organizations: [],
      metrics: {
        users: stats?.customerCount ?? 0,
        openOrders:
          stats?.byStatus?.reduce((sum, row) => {
            const count = Number(row.count) || 0;
            return ["completed", "cancelled", "delivered"].includes(row.status)
              ? sum
              : sum + count;
          }, 0) ?? 0,
        tickets: stats?.totalRequests ?? normalizedRequests.length,
        revenue: 0,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
