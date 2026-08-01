import assert from "node:assert/strict";
import test from "node:test";
import {
  createGatewayPayment,
  paymentProviderName,
  verifyGatewayPayment,
} from "../src/lib/payment-gateway.ts";

test("local payment adapter creates a replaceable redirect flow", async () => {
  const previous = process.env.PAYMENT_PROVIDER;
  process.env.PAYMENT_PROVIDER = "mock";
  try {
    const payment = await createGatewayPayment({
      amount: 125_000,
      invoiceId: 7,
      callbackUrl: "http://localhost:3000/api/payments/callback",
    });
    assert.equal(paymentProviderName(), "mock");
    assert.match(payment.authority, /^[0-9a-f-]{36}$/);
    assert.match(payment.redirectUrl, /^\/payment\/mock\?authority=/);
    const verification = await verifyGatewayPayment({
      authority: payment.authority,
      amount: 125_000,
    });
    assert.equal(verification.ok, true);
    assert.match(String(verification.referenceId), /^LOCAL-/);
  } finally {
    if (previous === undefined) delete process.env.PAYMENT_PROVIDER;
    else process.env.PAYMENT_PROVIDER = previous;
  }
});
