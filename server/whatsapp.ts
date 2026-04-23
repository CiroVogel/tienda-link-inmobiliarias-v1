/**
 * WhatsApp Notification Integration
 * Uses Meta WhatsApp Cloud API in production and mock mode in development.
 */

import { ENV } from "./_core/env";

type WhatsAppMessageType =
  | "booking_confirmation"
  | "payment_confirmation"
  | "reminder_24h"
  | "booking_cancelled";

interface WhatsAppTemplate {
  name: string;
  languageCode?: string;
  bodyParameters?: string[];
}

interface WhatsAppMessage {
  to: string;
  body: string;
  type: WhatsAppMessageType;
  bookingId: number;
  template?: WhatsAppTemplate;
}

interface BookingNotificationData {
  clientName: string;
  clientPhone?: string;
  serviceName: string;
  bookingDate: string;
  bookingTime: string;
  paidAmount?: string;
  paymentType?: "deposit" | "full";
  currency: string;
  bookingId: number;
  businessName: string;
  businessPhone?: string;
}

const DEFAULT_META_API_BASE_URL = "https://graph.facebook.com";
const DEFAULT_META_GRAPH_VERSION = "v23.0";
const DEFAULT_TEMPLATE_LANGUAGE_CODE = "es_AR";

function sanitizeTemplateText(value: string | undefined): string {
  const normalized = (value ?? "").replace(/\s+/g, " ").trim();
  return normalized || "-";
}

function formatPaidAmount(data: BookingNotificationData): string {
  if (!data.paidAmount) return "-";
  return `${data.currency} ${data.paidAmount}`;
}

function buildBusinessFooter(data: BookingNotificationData): string {
  return `${data.businessName}${data.businessPhone ? ` | ${data.businessPhone}` : ""}`;
}

function normalizeMetaRecipient(phone: string): string | null {
  let normalized = phone.trim();
  if (!normalized) return null;

  normalized = normalized.replace(/[^\d+]/g, "");
  if (normalized.startsWith("00")) {
    normalized = normalized.slice(2);
  }
  if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (!/^\d{8,15}$/.test(normalized)) {
    return null;
  }

  return normalized;
}

function getMetaConfig() {
  return {
    accessToken: ENV.whatsappMetaAccessToken,
    phoneNumberId: ENV.whatsappMetaPhoneNumberId,
    apiBaseUrl: ENV.whatsappMetaApiBaseUrl || DEFAULT_META_API_BASE_URL,
    graphVersion: ENV.whatsappMetaGraphVersion || DEFAULT_META_GRAPH_VERSION,
    templateLanguageCode:
      ENV.whatsappMetaTemplateLanguageCode || DEFAULT_TEMPLATE_LANGUAGE_CODE,
  };
}

function buildMetaMessagePayload(msg: WhatsAppMessage, recipient: string) {
  const { templateLanguageCode } = getMetaConfig();

  if (msg.template) {
    const parameters =
      msg.template.bodyParameters?.map((value) => ({
        type: "text" as const,
        text: sanitizeTemplateText(value),
      })) ?? [];

    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: msg.template.name,
        language: {
          code: msg.template.languageCode || templateLanguageCode,
          policy: "deterministic",
        },
        ...(parameters.length > 0
          ? {
              components: [
                {
                  type: "body",
                  parameters,
                },
              ],
            }
          : {}),
      },
    };
  }

  return {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
    type: "text",
    text: {
      body: msg.body,
      preview_url: false,
    },
  };
}

export function generateBookingConfirmationMessage(data: BookingNotificationData): string {
  const amountLabel = data.paymentType === "deposit" ? "Sena pagada" : "Pago realizado";
  const amountLine = data.paidAmount ? `- ${amountLabel}: ${formatPaidAmount(data)}` : "";

  return `Reserva confirmada

Hola ${data.clientName}. Tu reserva fue confirmada exitosamente.

Detalle:
- Servicio: ${data.serviceName}
- Fecha: ${data.bookingDate}
- Hora: ${data.bookingTime}
${amountLine}
- Referencia: #${data.bookingId}

${buildBusinessFooter(data)}

Te esperamos.`;
}

export function buildClientPaymentConfirmationTemplate(
  data: BookingNotificationData
): WhatsAppTemplate {
  return {
    name: ENV.whatsappMetaClientPaymentTemplateName,
    languageCode: ENV.whatsappMetaTemplateLanguageCode || DEFAULT_TEMPLATE_LANGUAGE_CODE,
    bodyParameters: [
      data.clientName,
      data.serviceName,
      data.bookingDate,
      data.bookingTime,
      formatPaidAmount(data),
      String(data.bookingId),
      data.businessName,
      data.businessPhone ?? "-",
    ],
  };
}

export function generateOwnerPaymentConfirmationMessage(data: BookingNotificationData): string {
  const amountLabel = data.paymentType === "deposit" ? "Sena cobrada" : "Pago cobrado";
  const amountLine = data.paidAmount ? `- ${amountLabel}: ${formatPaidAmount(data)}` : "";
  const clientPhoneLine = data.clientPhone ? `- WhatsApp cliente: ${data.clientPhone}` : "";

  return `Pago aprobado

Se confirmo una reserva en ${data.businessName}.

Detalle:
- Cliente: ${data.clientName}
- Servicio: ${data.serviceName}
- Fecha: ${data.bookingDate}
- Hora: ${data.bookingTime}
${amountLine}
${clientPhoneLine}
- Referencia: #${data.bookingId}`;
}

export function buildOwnerPaymentConfirmationTemplate(
  data: BookingNotificationData
): WhatsAppTemplate {
  return {
    name: ENV.whatsappMetaOwnerPaymentTemplateName,
    languageCode: ENV.whatsappMetaTemplateLanguageCode || DEFAULT_TEMPLATE_LANGUAGE_CODE,
    bodyParameters: [
      data.businessName,
      data.clientName,
      data.clientPhone ?? "-",
      data.serviceName,
      data.bookingDate,
      data.bookingTime,
      formatPaidAmount(data),
      String(data.bookingId),
    ],
  };
}

export function generateBookingCancelledMessage(data: BookingNotificationData): string {
  return `Reserva cancelada

Hola ${data.clientName}. Tu reserva fue cancelada.

Detalle:
- Servicio: ${data.serviceName}
- Fecha: ${data.bookingDate}
- Hora: ${data.bookingTime}
- Referencia: #${data.bookingId}

${buildBusinessFooter(data)}

Si necesitas reprogramar, escribinos por este medio.`;
}

export function generateBookingReminderMessage(data: BookingNotificationData): string {
  return `Recordatorio de turno

Hola ${data.clientName}. Te recordamos tu reserva para manana.

Detalle:
- Servicio: ${data.serviceName}
- Fecha: ${data.bookingDate}
- Hora: ${data.bookingTime}
- Referencia: #${data.bookingId}

${buildBusinessFooter(data)}

Te esperamos.`;
}

export async function sendWhatsAppMessage(msg: WhatsAppMessage): Promise<boolean> {
  if (!ENV.isProduction) {
    console.log(`[WhatsApp MOCK] To: ${msg.to}`);
    console.log(`[WhatsApp MOCK] Type: ${msg.type}`);
    console.log(`[WhatsApp MOCK] Body:\n${msg.body}`);
    return true;
  }

  const recipient = normalizeMetaRecipient(msg.to);
  if (!recipient) {
    console.error(
      `[WhatsApp] Invalid recipient phone format for booking ${msg.bookingId}: ${msg.to}`
    );
    return false;
  }

  const metaConfig = getMetaConfig();
  if (!metaConfig.accessToken || !metaConfig.phoneNumberId) {
    console.error(
      "[WhatsApp] Meta Cloud API credentials missing: set WHATSAPP_META_ACCESS_TOKEN and WHATSAPP_META_PHONE_NUMBER_ID"
    );
    return false;
  }

  if (msg.template && !msg.template.name.trim()) {
    console.error(
      `[WhatsApp] Missing Meta template name for message type ${msg.type} on booking ${msg.bookingId}`
    );
    return false;
  }

  try {
    const res = await fetch(
      `${metaConfig.apiBaseUrl}/${metaConfig.graphVersion}/${metaConfig.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${metaConfig.accessToken}`,
        },
        body: JSON.stringify(buildMetaMessagePayload(msg, recipient)),
      }
    );

    const rawResponse = await res.text();
    let responseData: { messages?: Array<{ id?: string }> } | null = null;
    if (rawResponse) {
      try {
        responseData = JSON.parse(rawResponse) as { messages?: Array<{ id?: string }> };
      } catch {
        responseData = null;
      }
    }

    if (!res.ok) {
      console.error(
        `[WhatsApp] Meta send failed for booking ${msg.bookingId}: ${rawResponse || res.statusText}`
      );
      return false;
    }

    const messageId = responseData?.messages?.[0]?.id;
    console.info(
      `[WhatsApp] Meta message sent for booking ${msg.bookingId}: type=${msg.type} to=${recipient}${messageId ? ` id=${messageId}` : ""}`
    );
    return true;
  } catch (error) {
    console.error("[WhatsApp] Error sending message:", error);
    return false;
  }
}
