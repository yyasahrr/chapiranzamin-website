import type { NextRequest } from "next/server";
import {
  fetchPhpJsonFromRequest,
  notImplementedPhpRoute,
  phpBackendConfigured,
} from "@/lib/php-backend";

type PhpUser = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
};

type PhpRequest = {
  id: number;
  tracking_code: string;
  request_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string | null;
  meeting_scheduled_at?: string | null;
  desired_delivery_date?: string | null;
  shipping_method?: "pickup" | "courier" | "post";
  delivery_address?: string | null;
  shipping_tracking_code?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  estimated_total?: string | number | null;
  final_total?: string | number | null;
  item_count?: number | string;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!phpBackendConfigured()) {
    return notImplementedPhpRoute(
      "داشبورد مشتریان به بک‌اند PHP متصل نیست. متغیر PHP_API_BASE_URL را تنظیم کنید."
    );
  }

  const me = await fetchPhpJsonFromRequest<{ user?: PhpUser }>(
    request,
    "/api/auth/me"
  );
  if (!me?.user) {
    return Response.json({ message: "ابتدا وارد شوید." }, { status: 401 });
  }
  if (me.user.role !== "customer") {
    return Response.json(
      { message: "این داشبورد مخصوص مشتریان است." },
      { status: 403 }
    );
  }

  const requestPayload = await fetchPhpJsonFromRequest<{ requests: PhpRequest[] }>(
    request,
    "/api/requests"
  );
  const orders =
    requestPayload?.requests?.map((item) => ({
      id: item.id,
      trackingCode: item.tracking_code,
      requestType: item.request_type,
      status: item.status,
      priority: item.priority,
      createdAt: item.created_at,
      meetingScheduledAt: item.meeting_scheduled_at ?? null,
      itemCount: Number(item.item_count) || 0,
      messageCount: 0,
      estimatedTotal: String(item.estimated_total ?? 0),
      finalTotal:
        item.final_total === null || item.final_total === undefined
          ? null
          : String(item.final_total),
      desiredDeliveryDate: item.desired_delivery_date ?? null,
      shippingMethod: item.shipping_method ?? "pickup",
      deliveryAddress: item.delivery_address ?? null,
      shippingTrackingCode: item.shipping_tracking_code ?? null,
      shippedAt: item.shipped_at ?? null,
      deliveredAt: item.delivered_at ?? null,
    })) ?? [];

  const activeOrders = orders.filter(
    (order) => !["completed", "delivered", "cancelled"].includes(order.status)
  );
  const totalValue = orders.reduce(
    (sum, order) => sum + Number(order.finalTotal ?? order.estimatedTotal ?? 0),
    0
  );

  return Response.json(
    {
      user: {
        ...me.user,
        emailOptIn: false,
        phoneVerified: false,
        emailVerified: false,
      },
      orders,
      invoices: [],
      notifications: [],
      upcomingMeetings: orders
        .filter((order) => order.meetingScheduledAt)
        .slice(0, 5)
        .map((order) => ({
          id: order.id,
          trackingCode: order.trackingCode,
          meetingScheduledAt: order.meetingScheduledAt as string,
        })),
      recentMessages: [],
      metrics: {
        activeOrders: activeOrders.length,
        completedOrders: orders.filter((order) =>
          ["completed", "delivered"].includes(order.status)
        ).length,
        totalValue,
        unpaidInvoices: 0,
        unreadNotifications: 0,
      },
    },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
