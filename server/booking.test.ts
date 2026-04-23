import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter, handleMercadoPagoWebhook } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import * as mercadopago from "./mercadopago";
import * as whatsapp from "./whatsapp";

// ─── Mock DB ──────────────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  // Negocio 1: luna-masajes (userId=1)
  getPublicBusinessProfile: vi.fn().mockImplementation(async (slug: string) => {
    if (slug === "luna-masajes") {
      return {
        id: 1, businessName: "Luna Masajes", slug: "luna-masajes",
        tagline: "Bienestar real", description: "Masajes profesionales",
        currency: "ARS", depositPercentage: 30,
        phone: null, whatsapp: null, email: null, address: null,
        instagram: null, facebook: null, heroImageUrl: null, logoUrl: null,
        ownerName: null, ownerTitle: null, ownerBio: null, ownerImageUrl: null,
      };
    }
    if (slug === "corte-y-estilo") {
      return {
        id: 2, businessName: "Corte & Estilo", slug: "corte-y-estilo",
        tagline: "Tu imagen, nuestra pasión", description: "Peluquería profesional",
        currency: "ARS", depositPercentage: 30,
        phone: null, whatsapp: null, email: null, address: null,
        instagram: null, facebook: null, heroImageUrl: null, logoUrl: null,
        ownerName: null, ownerTitle: null, ownerBio: null, ownerImageUrl: null,
      };
    }
    // Slug inexistente → null (no fallback engañoso)
    return null;
  }),
  getPublicServices: vi.fn().mockImplementation(async (businessId: number) => {
    if (businessId === 1) return [{ id: 1, businessId: 1, name: "Masaje relajante", description: "", price: "5000", duration: 60, isActive: true, sortOrder: 0 }];
    if (businessId === 2) return [{ id: 4, businessId: 2, name: "Corte de cabello", description: "", price: "3000", duration: 45, isActive: true, sortOrder: 0 }];
    return [];
  }),
  getGalleryImages: vi.fn().mockResolvedValue([]),
  getAvailability: vi.fn().mockImplementation(async (businessId: number) => {
    if (businessId === 1) return [{ id: 1, businessId: 1, dayOfWeek: 1, startTime: "09:00", endTime: "18:00", slotDuration: 60, isActive: true }];
    if (businessId === 2) return [{ id: 5, businessId: 2, dayOfWeek: 2, startTime: "10:00", endTime: "19:00", slotDuration: 45, isActive: true }];
    return [];
  }),
  getBookingsByDate: vi.fn().mockResolvedValue([]),
  createBooking: vi.fn().mockResolvedValue({
    id: 42, businessId: 1, serviceId: 1, clientName: "Juan Pérez",
    clientEmail: "juan@test.com", clientPhone: "+5491112345678",
    bookingDate: "2026-04-01", bookingTime: "10:00", status: "pending",
    totalAmount: "5000", depositAmount: "1500", paymentType: "deposit", notes: null,
  }),
  getBookingById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 42) return { id: 42, businessId: 1, serviceId: 1, clientName: "Juan Pérez", clientEmail: "juan@test.com", clientPhone: "+5491112345678", bookingDate: "2026-04-01", bookingTime: "10:00", status: "pending", totalAmount: "5000", depositAmount: "1500", paymentType: "deposit", notes: null };
    return null;
  }),
  getAllBookings: vi.fn().mockResolvedValue([]),
  getAllServices: vi.fn().mockResolvedValue([]),
  // getBusinessProfile: resuelve por userId del usuario autenticado
  getBusinessProfile: vi.fn().mockImplementation(async (userId: number) => {
    if (userId === 1) return { id: 1, businessName: "Luna Masajes", slug: "luna-masajes" };
    if (userId === 2) return { id: 2, businessName: "Corte & Estilo", slug: "corte-y-estilo" };
    return null; // userId=999 → sin negocio
  }),
  getBusinessProfileById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) {
      return {
        id: 1,
        businessName: "Luna Masajes",
        slug: "luna-masajes",
        currency: "ARS",
        phone: "+5491111111111",
        whatsapp: "+5491187654321",
      };
    }
    if (id === 2) {
      return {
        id: 2,
        businessName: "Corte & Estilo",
        slug: "corte-y-estilo",
        currency: "ARS",
        phone: "+5491122222222",
        whatsapp: "+5491176543210",
      };
    }
    return null;
  }),
  getServiceById: vi.fn().mockImplementation(async (id: number) => {
    if (id === 1) return { id: 1, businessId: 1, name: "Masaje relajante", isActive: true };
    if (id === 4) return { id: 4, businessId: 2, name: "Corte de cabello", isActive: true };
    return null;
  }),
  updateBookingStatus: vi.fn().mockResolvedValue(undefined),
  upsertBusinessProfile: vi.fn().mockResolvedValue({ id: 1, businessName: "Test" }),
  createService: vi.fn().mockResolvedValue({ id: 1, name: "Test" }),
  updateService: vi.fn().mockResolvedValue(undefined),
  deleteService: vi.fn().mockResolvedValue(undefined),
  upsertAvailability: vi.fn().mockResolvedValue(undefined),
  getBlockedDates: vi.fn().mockResolvedValue([]),
  addGalleryImage: vi.fn().mockResolvedValue({ id: 1, url: "https://example.com/img.jpg" }),
  deleteGalleryImage: vi.fn().mockResolvedValue(undefined),
  reorderGalleryImages: vi.fn().mockResolvedValue(undefined),
  createPaymentTransaction: vi.fn().mockResolvedValue({ id: 1 }),
  getPaymentByBookingId: vi.fn().mockResolvedValue(null),
  getPaymentByPreferenceId: vi.fn().mockResolvedValue(null),
  getPaymentByExternalReference: vi.fn().mockResolvedValue(null),
  updatePaymentTransactionById: vi.fn().mockResolvedValue(undefined),
  updatePaymentStatus: vi.fn().mockResolvedValue(undefined),
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
  getNotificationByBookingAndType: vi.fn().mockResolvedValue(null),
  getNotificationByBookingTypeAndRecipient: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  listAllBusinessProfiles: vi.fn().mockResolvedValue([]),
}));

vi.mock("./mercadopago", () => ({
  createMercadoPagoPreference: vi.fn(),
  getMercadoPagoPaymentDetails: vi.fn(),
}));

vi.mock("./whatsapp", () => ({
  buildClientPaymentConfirmationTemplate: vi.fn().mockReturnValue({
    name: "client_payment_template",
    languageCode: "es_AR",
    bodyParameters: ["x"],
  }),
  buildOwnerPaymentConfirmationTemplate: vi.fn().mockReturnValue({
    name: "owner_payment_template",
    languageCode: "es_AR",
    bodyParameters: ["x"],
  }),
  generateBookingCancelledMessage: vi.fn().mockReturnValue("booking-cancelled"),
  generateBookingConfirmationMessage: vi.fn().mockReturnValue("client-payment-confirmation"),
  generateOwnerPaymentConfirmationMessage: vi.fn().mockReturnValue("owner-payment-confirmation"),
  generateBookingReminderMessage: vi.fn().mockReturnValue("booking-reminder"),
  sendWhatsAppMessage: vi.fn().mockResolvedValue(true),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(userId = 1, role: "admin" | "user" = "admin"): TrpcContext {
  return {
    user: {
      id: userId, openId: `owner-${userId}`, email: `admin${userId}@test.com`,
      name: "Admin", loginMethod: "manus", role,
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  process.env.MERCADO_PAGO_ACCESS_TOKEN = "test-access-token";
  vi.mocked(db.getPaymentByPreferenceId).mockResolvedValue(null);
  vi.mocked(db.getPaymentByExternalReference).mockResolvedValue(null);
  vi.mocked(db.updatePaymentTransactionById).mockResolvedValue(undefined);
  vi.mocked(whatsapp.sendWhatsAppMessage).mockResolvedValue(true);
});

// ─── 1. Slug inexistente → null, no fallback ──────────────────────────────────

describe("business.getPublic — slug inexistente", () => {
  it("returns null for a non-existent slug (no fallback engañoso)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.business.getPublic({ slug: "slug-que-no-existe-xyz" });
    expect(result).toBeNull();
  });
});

// ─── 2. Aislamiento multi-sitio ───────────────────────────────────────────────

describe("multi-sitio: aislamiento por slug", () => {
  it("luna-masajes devuelve su propio perfil", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.business.getPublic({ slug: "luna-masajes" });
    expect(result?.businessName).toBe("Luna Masajes");
    expect(result?.slug).toBe("luna-masajes");
  });

  it("corte-y-estilo devuelve su propio perfil", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.business.getPublic({ slug: "corte-y-estilo" });
    expect(result?.businessName).toBe("Corte & Estilo");
    expect(result?.slug).toBe("corte-y-estilo");
  });

  it("luna-masajes devuelve sus propios servicios", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.services.listPublic({ slug: "luna-masajes" });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Masaje relajante");
  });

  it("corte-y-estilo devuelve sus propios servicios", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.services.listPublic({ slug: "corte-y-estilo" });
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Corte de cabello");
  });

  it("luna-masajes devuelve su propia disponibilidad", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.availability.getPublic({ slug: "luna-masajes" });
    expect(result[0].dayOfWeek).toBe(1);
    expect(result[0].slotDuration).toBe(60);
  });

  it("corte-y-estilo devuelve su propia disponibilidad", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.availability.getPublic({ slug: "corte-y-estilo" });
    expect(result[0].dayOfWeek).toBe(2);
    expect(result[0].slotDuration).toBe(45);
  });
});

// ─── 3. Ownership: cada admin solo modifica sus propios datos ─────────────────

describe("services.delete — ownership", () => {
  it("lanza FORBIDDEN si el servicio no pertenece al negocio del usuario", async () => {
    // userId=2 (Corte & Estilo) intenta eliminar servicio id=1 (Luna Masajes)
    const caller = appRouter.createCaller(makeAdminCtx(2));
    await expect(caller.services.delete({ id: 1 })).rejects.toThrow();
  });

  it("lanza NOT_FOUND si el usuario no tiene negocio configurado", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(999));
    await expect(caller.services.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("services.update — ownership", () => {
  it("lanza FORBIDDEN si el servicio no pertenece al negocio del usuario", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(2));
    await expect(caller.services.update({ id: 1, name: "Hack" })).rejects.toThrow();
  });
});

describe("bookings.updateStatus — ownership", () => {
  it("lanza FORBIDDEN si la reserva no pertenece al negocio del usuario", async () => {
    // userId=2 intenta cambiar estado de reserva id=42 (que es de businessId=1)
    const caller = appRouter.createCaller(makeAdminCtx(2));
    await expect(caller.bookings.updateStatus({ id: 42, status: "confirmed" })).rejects.toThrow();
  });
});

describe("gallery.delete — ownership", () => {
  it("lanza FORBIDDEN si la imagen no pertenece al negocio del usuario", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(999));
    await expect(caller.gallery.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("gallery.reorder — ownership", () => {
  it("lanza FORBIDDEN si las imágenes no pertenecen al negocio del usuario", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(999));
    await expect(caller.gallery.reorder({ ids: [1, 2, 3] })).rejects.toThrow();
  });
});

// ─── 4. Control de acceso: role guard ────────────────────────────────────────

describe("admin procedures — role guard", () => {
  it("bloquea a usuarios con role=user en bookings.list", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(1, "user"));
    await expect(caller.bookings.list()).rejects.toThrow();
  });

  it("bloquea a usuarios con role=user en services.list", async () => {
    const caller = appRouter.createCaller(makeAdminCtx(1, "user"));
    await expect(caller.services.list()).rejects.toThrow();
  });
});

// ─── 5. Flujo de reserva pública ──────────────────────────────────────────────

describe("bookings.create", () => {
  it("crea una reserva con slug y datos válidos", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.bookings.create({
      slug: "luna-masajes",
      serviceId: 1,
      clientName: "Juan Pérez",
      clientEmail: "juan@test.com",
      clientPhone: "+5491112345678",
      bookingDate: "2026-04-01",
      bookingTime: "10:00",
      paymentType: "deposit",
    });
    expect(result.booking.id).toBe(42);
    expect(result.booking.clientName).toBe("Juan Pérez");
  });
});

describe("bookings.getById", () => {
  it("devuelve la reserva cuando slug y bookingId pertenecen al mismo negocio", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // booking id=42 tiene businessId=1, slug luna-masajes tiene id=1 → match
    const result = await caller.bookings.getById({ id: 42, slug: "luna-masajes" });
    expect(result.id).toBe(42);
    expect(result.businessId).toBe(1);
    expect(result.status).toBe("pending");
  });

  it("lanza FORBIDDEN cuando el slug no corresponde al negocio de la reserva", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // booking id=42 tiene businessId=1, corte-y-estilo tiene id=2 → no match
    await expect(
      caller.bookings.getById({ id: 42, slug: "corte-y-estilo" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lanza NOT_FOUND cuando el slug no existe", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.bookings.getById({ id: 42, slug: "slug-inexistente" })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

// ─── 6. Auth ──────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("limpia la cookie de sesión y retorna success", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});

describe("handleMercadoPagoWebhook", () => {
  it("actualiza el pago, confirma la reserva y envia WhatsApp al cliente y al dueno", async () => {
    const paymentPayload = {
      external_reference: "booking-42",
      status: "approved",
      preference_id: "pref-123",
    };
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      vi.mocked(mercadopago.getMercadoPagoPaymentDetails).mockResolvedValue(paymentPayload as never);
      vi.mocked(db.getPaymentByPreferenceId).mockResolvedValue({
        id: 91,
        bookingId: 42,
        preferenceId: "pref-123",
        paymentId: null,
        externalReference: "booking-42",
        status: "pending",
        amount: "1500",
        currency: "ARS",
        rawData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await handleMercadoPagoWebhook(
        {
          type: "payment",
          data: { id: "payment-abc" },
        },
        { slug: "luna-masajes" }
      );

      expect(db.updatePaymentTransactionById).toHaveBeenCalledWith(91, {
        status: "approved",
        paymentId: "payment-abc",
        preferenceId: "pref-123",
        rawData: paymentPayload,
      });
      expect(db.getPaymentByExternalReference).not.toHaveBeenCalled();
      expect(infoSpy).toHaveBeenCalledWith(
        "[Webhook] Payment transaction matched by preference_id for booking 42: transaction=91 status=approved"
      );
      expect(db.updateBookingStatus).toHaveBeenCalledWith(42, "confirmed");
      expect(whatsapp.sendWhatsAppMessage).toHaveBeenCalledTimes(2);
      expect(whatsapp.sendWhatsAppMessage).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          to: "+5491112345678",
          type: "payment_confirmation",
        })
      );
      expect(whatsapp.sendWhatsAppMessage).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          to: "+5491187654321",
          type: "payment_confirmation",
        })
      );
      expect(db.createNotification).toHaveBeenCalledTimes(2);
    } finally {
      infoSpy.mockRestore();
    }
  });

  it("matchea por external_reference cuando Mercado Pago no trae preference_id", async () => {
    const paymentPayload = {
      external_reference: "booking-42",
      status: "approved",
    };
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      vi.mocked(mercadopago.getMercadoPagoPaymentDetails).mockResolvedValue(paymentPayload as never);
      vi.mocked(db.getPaymentByExternalReference).mockResolvedValue({
        id: 92,
        bookingId: 42,
        preferenceId: "pref-fallback",
        paymentId: null,
        externalReference: "booking-42",
        status: "pending",
        amount: "1500",
        currency: "ARS",
        rawData: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await handleMercadoPagoWebhook(
        {
          topic: "payment",
          data: { id: "payment-no-pref" },
        },
        { slug: "luna-masajes" }
      );

      expect(db.getPaymentByPreferenceId).not.toHaveBeenCalled();
      expect(db.getPaymentByExternalReference).toHaveBeenCalledWith("booking-42");
      expect(db.updatePaymentTransactionById).toHaveBeenCalledWith(92, {
        status: "approved",
        paymentId: "payment-no-pref",
        preferenceId: "pref-fallback",
        rawData: paymentPayload,
      });
      expect(infoSpy).toHaveBeenCalledWith(
        "[Webhook] Payment transaction matched by external_reference for booking 42: transaction=92 status=approved"
      );
    } finally {
      infoSpy.mockRestore();
    }
  });

  it("deja warning claro si no puede matchear la transaccion", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    try {
      vi.mocked(mercadopago.getMercadoPagoPaymentDetails).mockResolvedValue({
        external_reference: "booking-42",
        status: "pending",
      } as never);

      await handleMercadoPagoWebhook(
        {
          type: "payment",
          data: { id: "payment-unmatched" },
        },
        { slug: "luna-masajes" }
      );

      expect(db.updatePaymentTransactionById).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        "[Webhook] Payment transaction not matched for booking 42: preference_id=<missing> external_reference=booking-42"
      );
    } finally {
      warnSpy.mockRestore();
    }
  });

  it("falla visiblemente si el WhatsApp al dueno no se puede enviar", async () => {
    vi.mocked(mercadopago.getMercadoPagoPaymentDetails).mockResolvedValue({
      external_reference: "booking-42",
      status: "approved",
      preference_id: "pref-456",
    } as never);
    vi.mocked(db.getPaymentByPreferenceId).mockResolvedValue({
      id: 93,
      bookingId: 42,
      preferenceId: "pref-456",
      paymentId: null,
      externalReference: "booking-42",
      status: "pending",
      amount: "1500",
      currency: "ARS",
      rawData: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    vi.mocked(whatsapp.sendWhatsAppMessage)
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(
      handleMercadoPagoWebhook(
        {
          topic: "payment",
          data: { id: "payment-def" },
        },
        { slug: "luna-masajes" }
      )
    ).rejects.toThrow("Owner WhatsApp delivery failed");

    expect(db.updateBookingStatus).toHaveBeenCalledWith(42, "confirmed");
    expect(db.updatePaymentTransactionById).toHaveBeenCalledWith(93, {
      status: "approved",
      paymentId: "payment-def",
      preferenceId: "pref-456",
      rawData: {
        external_reference: "booking-42",
        status: "approved",
        preference_id: "pref-456",
      },
    });
    expect(db.createNotification).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        recipient: "+5491187654321",
        status: "failed",
      })
    );
  });

  it("rechaza el webhook si no llega paymentId", async () => {
    await expect(
      handleMercadoPagoWebhook(
        {
          type: "payment",
        },
        { slug: "luna-masajes" }
      )
    ).rejects.toThrow("Missing paymentId");

    expect(db.updatePaymentTransactionById).not.toHaveBeenCalled();
    expect(db.updateBookingStatus).not.toHaveBeenCalled();
    expect(whatsapp.sendWhatsAppMessage).not.toHaveBeenCalled();
  });
});
