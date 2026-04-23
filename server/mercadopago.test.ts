/**
 * Mercado Pago credential validation test.
 * Calls the MP API with the configured ACCESS_TOKEN to verify it's valid.
 */
import { describe, it, expect } from "vitest";
import { getMercadoPagoPaymentDetails } from "./mercadopago";

describe("Mercado Pago credentials", () => {
  it("ACCESS_TOKEN is set in environment", () => {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    expect(token).toBeDefined();
    expect(token).not.toBe("");
    // Must start with TEST- (sandbox) or APP_USR- (production)
    expect(token).toMatch(/^(TEST-|APP_USR-)/);
  });

  it("ACCESS_TOKEN can authenticate against MP API", async () => {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) {
      console.warn("Skipping: MERCADO_PAGO_ACCESS_TOKEN not set");
      return;
    }
    // Call the /users/me endpoint to validate the token
    const res = await fetch("https://api.mercadopago.com/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const data = (await res.json()) as { id?: number; site_id?: string };
    expect(data.id).toBeDefined();
    console.log(`[MP] Token valid. User ID: ${data.id}, Site: ${data.site_id}`);
  });
});
