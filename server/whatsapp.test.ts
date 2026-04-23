import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

describe("sendWhatsAppMessage", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("sends a Meta template message in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.WHATSAPP_META_ACCESS_TOKEN = "meta-token";
    process.env.WHATSAPP_META_PHONE_NUMBER_ID = "123456789";
    process.env.WHATSAPP_META_CLIENT_PAYMENT_TEMPLATE_NAME = "client_payment_template";
    process.env.WHATSAPP_META_OWNER_PAYMENT_TEMPLATE_NAME = "owner_payment_template";
    process.env.WHATSAPP_META_TEMPLATE_LANGUAGE_CODE = "es_AR";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue(JSON.stringify({ messages: [{ id: "wamid.1" }] })),
    });

    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    const { sendWhatsAppMessage } = await import("./whatsapp");
    const sent = await sendWhatsAppMessage({
      to: "+54 9 11 1234-5678",
      body: "ignored-body",
      type: "payment_confirmation",
      bookingId: 42,
      template: {
        name: "client_payment_template",
        languageCode: "es_AR",
        bodyParameters: ["Juan", "Masaje relajante"],
      },
    });

    expect(sent).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v23.0/123456789/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer meta-token",
          "Content-Type": "application/json",
        }),
      })
    );

    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.to).toBe("5491112345678");
    expect(payload.type).toBe("template");
    expect(payload.template.name).toBe("client_payment_template");
    expect(payload.template.components[0].parameters).toEqual([
      { type: "text", text: "Juan" },
      { type: "text", text: "Masaje relajante" },
    ]);
  });

  it("fails cleanly in production when Meta credentials are missing", async () => {
    process.env.NODE_ENV = "production";

    const fetchMock = vi.fn();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", fetchMock);

    const { sendWhatsAppMessage } = await import("./whatsapp");
    const sent = await sendWhatsAppMessage({
      to: "+5491112345678",
      body: "ignored-body",
      type: "payment_confirmation",
      bookingId: 43,
      template: {
        name: "client_payment_template",
        languageCode: "es_AR",
        bodyParameters: ["Juan"],
      },
    });

    expect(sent).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
