import { randomUUID } from "node:crypto";

export type PaymentProvider = "mock" | "webhook";

function provider(): PaymentProvider {
  return process.env.PAYMENT_PROVIDER === "webhook" ? "webhook" : "mock";
}

export function paymentProviderName() {
  return provider();
}

export async function createGatewayPayment(input: {
  amount: number;
  invoiceId: number;
  callbackUrl: string;
}) {
  if (provider() === "mock") {
    if (process.env.NODE_ENV === "production" && process.env.PAYMENT_ALLOW_MOCK !== "true")
      throw new Error("PAYMENT_NOT_CONFIGURED");
    const authority = randomUUID();
    return {
      authority,
      redirectUrl: `/payment/mock?authority=${encodeURIComponent(authority)}`,
    };
  }

  const endpoint = process.env.PAYMENT_CREATE_URL?.trim();
  if (!endpoint) throw new Error("PAYMENT_NOT_CONFIGURED");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.PAYMENT_API_KEY
        ? { Authorization: `Bearer ${process.env.PAYMENT_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) throw new Error(`PAYMENT_PROVIDER_${response.status}`);
  const data = (await response.json()) as { authority?: string; redirectUrl?: string };
  if (!data.authority || !data.redirectUrl) throw new Error("PAYMENT_PROVIDER_RESPONSE");
  return { authority: data.authority, redirectUrl: data.redirectUrl };
}

export async function verifyGatewayPayment(input: {
  authority: string;
  amount: number;
}) {
  if (provider() === "mock")
    return { ok: true, referenceId: `LOCAL-${Date.now()}` };

  const endpoint = process.env.PAYMENT_VERIFY_URL?.trim();
  if (!endpoint) throw new Error("PAYMENT_NOT_CONFIGURED");
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.PAYMENT_API_KEY
        ? { Authorization: `Bearer ${process.env.PAYMENT_API_KEY}` }
        : {}),
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) return { ok: false, referenceId: null };
  const data = (await response.json()) as { ok?: boolean; referenceId?: string };
  return { ok: data.ok === true, referenceId: data.referenceId ?? null };
}
