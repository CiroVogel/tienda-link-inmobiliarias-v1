/**
 * Mercado Pago Sandbox Integration
 * Handles preference creation, payment details retrieval, and webhook validation.
 */

const MP_API_BASE = "https://api.mercadopago.com";

interface MPPreferenceItem {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

interface MPPreferenceInput {
  items: MPPreferenceItem[];
  payer?: {
    name?: string;
    email?: string;
    phone?: { number?: string };
  };
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: "approved" | "all";
  external_reference: string;
  notification_url?: string;
  metadata?: Record<string, unknown>;
}

interface MPPreferenceResponse {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export async function createMercadoPagoPreference(
  input: MPPreferenceInput,
  accessToken: string
): Promise<MPPreferenceResponse> {
  const res = await fetch(`${MP_API_BASE}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Mercado Pago preference creation failed: ${error}`);
  }

  return res.json() as Promise<MPPreferenceResponse>;
}

export async function getMercadoPagoPaymentDetails(
  paymentId: string,
  accessToken: string
): Promise<Record<string, unknown>> {
  const res = await fetch(`${MP_API_BASE}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Mercado Pago payment fetch failed: ${error}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

export function validateMercadoPagoWebhook(
  signature: string | undefined,
  _body: string
): boolean {
  // In sandbox mode, accept all webhooks.
  // In production, implement HMAC-SHA256 validation with MP_WEBHOOK_SECRET.
  if (process.env.NODE_ENV !== "production") return true;
  return !!signature;
}
