import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import type { BusinessProfile, User } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { realEstateProfile } from "../client/src/lib/realEstateDemo";
import {
  addGalleryImage,
  archiveBooking,
  createBooking,
  createBusinessPageWithLocalAdmin,
  createNotification,
  createPaymentTransaction,
  deleteGalleryImage,
  deleteService,
  getServiceById,
  getAllBookings,
  getAllServices,
  getAvailability,
  getBlockedDates,
  getBookingById,
  getBookingsByDate,
  getPaymentByBookingId,
  getPaymentByExternalReference,
  getPaymentByPreferenceId,
  getPublicBusinessProfile,
  getBusinessProfileById,
  listAllBusinessProfiles,
  getPublicServices,
  getBusinessProfile,
  reorderGalleryImages,
  restoreBooking,
  updateBookingStatus,
  updatePaymentTransactionById,
  updateService,
  upsertAvailability,
  upsertBusinessProfile,
  createService,
  getGalleryImages,
  getNotificationByBookingAndType,
  getNotificationByBookingTypeAndRecipient,
  getLocalAdminCredentialByUserId,
upsertLocalAdminCredential,
} from "./db";
import { createMercadoPagoPreference } from "./mercadopago";
import {
  addStoredPropertyImage,
  createStoredProperty,
  deleteStoredPropertyImage,
  getPublicProperty,
  listPublicProperties,
  listStoredProperties,
  mapStoredPropertyToPublic,
  reorderStoredPropertyImages,
  setStoredPropertyPrimaryImage,
  storagePut,
  updateStoredProperty,
} from "./storage";
import {
  buildClientPaymentConfirmationTemplate,
  buildOwnerPaymentConfirmationTemplate,
  generateBookingCancelledMessage,
  generateBookingConfirmationMessage,
  generateOwnerPaymentConfirmationMessage,
  generateBookingReminderMessage,
  sendWhatsAppMessage,
} from "./whatsapp";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug inválido: solo letras minúsculas, números y guiones");

const demoVisitRequests: Array<{
  reference: string;
  slug: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  whatsapp: string;
  email?: string;
  message: string;
  createdAt: string;
}> = [];

const propertyOperationSchema = z.enum(["sale", "rent"]);
const propertyStatusSchema = z.enum(["available", "reserved", "sold", "rented", "hidden"]);
const propertyInputSchema = z.object({
  title: z.string().min(1).max(240),
  operation: propertyOperationSchema,
  status: propertyStatusSchema,
  price: z.string().min(1).max(120),
  location: z.string().min(1).max(160),
  address: z.string().min(1).max(240),
  propertyType: z.string().min(1).max(120),
  bedrooms: z.number().int().min(0).max(20).nullable().optional(),
  bathrooms: z.number().int().min(0).max(20).nullable().optional(),
  areaM2: z.number().int().min(0).max(50000).nullable().optional(),
  features: z.array(z.string().min(1).max(100)).max(30).default([]),
  description: z.string().min(1).max(4000),
  featured: z.boolean().default(false),
});

const propertyImageSchema = z.object({
  propertyId: z.string().min(1).max(160),
});

const propertyImageUploadSchema = propertyImageSchema.extend({
  base64: z.string().min(1),
  mimeType: z.string().min(1).max(120),
  caption: z.string().max(240).optional(),
});

const propertyImageReorderSchema = propertyImageSchema.extend({
  imageIds: z.array(z.string().min(1).max(200)).min(1),
});

const propertyPrimaryImageSchema = propertyImageSchema.extend({
  imageId: z.string().min(1).max(200),
});

function buildLocalBusinessProfile(userId: number): BusinessProfile {
  const now = new Date();

  return {
    id: 0,
    userId,
    slug: realEstateProfile.slug,
    businessName: realEstateProfile.name,
    tagline: realEstateProfile.tagline,
    description: realEstateProfile.description,
    ownerName: "",
    ownerTitle: "",
    ownerBio: null,
    ownerImageUrl: null,
    logoUrl: null,
    heroImageUrl: null,
    phone: realEstateProfile.phone,
    whatsapp: realEstateProfile.whatsapp,
    email: realEstateProfile.email,
    address: realEstateProfile.address,
    instagram: realEstateProfile.instagram,
    facebook: "",
    primaryColor: "#000000",
    accentColor: "#c9a96e",
    paymentMpAccessToken: null,
    depositPercentage: 30,
    currency: "ARS",
    createdAt: now,
    updatedAt: now,
  };
}

async function getAdminBusinessProfile(user: User): Promise<BusinessProfile | null> {
  const profile = await getBusinessProfile(user.id);
  if (profile) {
    return profile;
  }

  if (user.openId === "local-admin") {
    return buildLocalBusinessProfile(user.id);
  }

  return null;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  if (!trimmed) return trimmed;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}
function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const computed = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");

  if (computed.length !== original.length) return false;

  return timingSafeEqual(computed, original);
}

function getPaidAmountForBooking(booking: NonNullable<Awaited<ReturnType<typeof getBookingById>>>): string {
  return booking.paymentType === "deposit"
    ? String(booking.depositAmount ?? booking.totalAmount)
    : String(booking.totalAmount);
}

async function buildBookingNotificationContext(bookingId: number) {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  const profile = await getBusinessProfileById(booking.businessId);
  if (!profile) return null;

  const servicesList = await getPublicServices(profile.id);
  const service = servicesList.find((s) => s.id === booking.serviceId);

  return { booking, profile, service };
}

async function sendPaymentConfirmationNotification(bookingId: number): Promise<boolean> {
  const context = await buildBookingNotificationContext(bookingId);
  if (!context) {
    throw new Error(`[Webhook] Missing booking notification context for booking ${bookingId}`);
  }

  const { booking, profile, service } = context;
  const clientPhone = normalizePhone(booking.clientPhone);
  if (!clientPhone) {
    throw new Error(`[Webhook] Booking ${bookingId} has no client phone for payment confirmation`);
  }

  const baseMessageData = {
    clientName: booking.clientName,
    clientPhone,
    serviceName: service?.name ?? "Servicio",
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    paidAmount: getPaidAmountForBooking(booking),
    paymentType: booking.paymentType,
    currency: profile.currency ?? "ARS",
    bookingId: booking.id,
    businessName: profile.businessName,
    businessPhone: profile.phone ?? undefined,
  } as const;

  const clientExisting = await getNotificationByBookingTypeAndRecipient(
    bookingId,
    "payment_confirmation",
    clientPhone
  );
  let clientStatus: "sent" | "already_sent" = "already_sent";

  if (clientExisting?.status !== "sent") {
    const clientMessage = generateBookingConfirmationMessage(baseMessageData);
    const clientTemplate = buildClientPaymentConfirmationTemplate(baseMessageData);
    const clientSent = await sendWhatsAppMessage({
      to: clientPhone,
      body: clientMessage,
      type: "payment_confirmation",
      bookingId: booking.id,
      template: clientTemplate,
    });

    await createNotification({
      bookingId: booking.id,
      type: "payment_confirmation",
      channel: "whatsapp",
      recipient: clientPhone,
      message: clientMessage,
      status: clientSent ? "sent" : "failed",
    });

    if (!clientSent) {
      throw new Error(`[Webhook] Client WhatsApp delivery failed for booking ${bookingId}`);
    }

    clientStatus = "sent";
  }

  const ownerPhone = normalizePhone(profile.whatsapp ?? "");
  let ownerStatus: "sent" | "already_sent" | "skipped_no_whatsapp" = "skipped_no_whatsapp";

  if (ownerPhone) {
    const ownerExisting = await getNotificationByBookingTypeAndRecipient(
      bookingId,
      "payment_confirmation",
      ownerPhone
    );

    if (ownerExisting?.status !== "sent") {
      const ownerMessage = generateOwnerPaymentConfirmationMessage(baseMessageData);
      const ownerTemplate = buildOwnerPaymentConfirmationTemplate(baseMessageData);
      const ownerSent = await sendWhatsAppMessage({
        to: ownerPhone,
        body: ownerMessage,
        type: "payment_confirmation",
        bookingId: booking.id,
        template: ownerTemplate,
      });

      await createNotification({
        bookingId: booking.id,
        type: "payment_confirmation",
        channel: "whatsapp",
        recipient: ownerPhone,
        message: ownerMessage,
        status: ownerSent ? "sent" : "failed",
      });

      if (!ownerSent) {
        throw new Error(`[Webhook] Owner WhatsApp delivery failed for booking ${bookingId}`);
      }

      ownerStatus = "sent";
    } else {
      ownerStatus = "already_sent";
    }
  } else {
    console.warn(
      `[WhatsApp] Owner WhatsApp not configured for business ${profile.businessName} (booking ${bookingId})`
    );
  }

  console.info(
    `[Webhook] Payment confirmation notifications processed for booking ${bookingId}. client=${clientStatus} owner=${ownerStatus}`
  );

  return true;
}

async function sendBookingCancelledNotification(bookingId: number): Promise<boolean> {
  const existing = await getNotificationByBookingAndType(bookingId, "booking_cancelled");
  if (existing?.status === "sent") return false;

  const context = await buildBookingNotificationContext(bookingId);
  if (!context) return false;

  const { booking, profile, service } = context;
  const phone = normalizePhone(booking.clientPhone);
  if (!phone) return false;

  const message = generateBookingCancelledMessage({
    clientName: booking.clientName,
    serviceName: service?.name ?? "Servicio",
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    currency: profile.currency ?? "ARS",
    bookingId: booking.id,
    businessName: profile.businessName,
    businessPhone: profile.phone ?? undefined,
  });

  const sent = await sendWhatsAppMessage({
    to: phone,
    body: message,
    type: "booking_cancelled",
    bookingId: booking.id,
  });

  await createNotification({
    bookingId: booking.id,
    type: "booking_cancelled",
    channel: "whatsapp",
    recipient: phone,
    message,
    status: sent ? "sent" : "failed",
  });

  return sent;
}

async function sendReminder24hNotification(bookingId: number): Promise<boolean> {
  const existing = await getNotificationByBookingAndType(bookingId, "reminder_24h");
  if (existing?.status === "sent") return false;

  const context = await buildBookingNotificationContext(bookingId);
  if (!context) return false;

  const { booking, profile, service } = context;
  if (booking.status !== "confirmed") return false;

  const phone = normalizePhone(booking.clientPhone);
  if (!phone) return false;

  const message = generateBookingReminderMessage({
    clientName: booking.clientName,
    serviceName: service?.name ?? "Servicio",
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    currency: profile.currency ?? "ARS",
    bookingId: booking.id,
    businessName: profile.businessName,
    businessPhone: profile.phone ?? undefined,
  });

  const sent = await sendWhatsAppMessage({
    to: phone,
    body: message,
    type: "reminder_24h",
    bookingId: booking.id,
  });

  await createNotification({
    bookingId: booking.id,
    type: "reminder_24h",
    channel: "whatsapp",
    recipient: phone,
    message,
    status: sent ? "sent" : "failed",
  });

  return sent;
}

function parseBookingDateTime(bookingDate: string, bookingTime: string): Date {
  return new Date(`${bookingDate}T${bookingTime}:00-03:00`);
}

export async function processDueBookingReminders(now: Date = new Date()) {
  const profiles = await listAllBusinessProfiles();

const confirmedBookings = (
  await Promise.all(
    profiles.map(async (profile) => {
      const bookings = await getAllBookings(profile.id);
      return bookings.filter((booking) => booking.status === "confirmed");
    })
  )
).flat();

let sent = 0;

for (const booking of confirmedBookings) {
  const bookingAt = parseBookingDateTime(booking.bookingDate, booking.bookingTime);
  const diffMinutes = (bookingAt.getTime() - now.getTime()) / 60000;

  if (diffMinutes < 23 * 60 + 45 || diffMinutes > 24 * 60 + 15) {
    continue;
  }

  const wasSent = await getNotificationByBookingAndType(booking.id, "reminder_24h");
  if (wasSent?.status === "sent") {
    continue;
  }

  const delivered = await sendReminder24hNotification(booking.id);
  if (delivered) sent += 1;
}

return { checked: confirmedBookings.length, sent };
}

// ─── Guards ──────────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acceso solo para administradores" });
  }
  return next({ ctx });
});

const platformAdminProcedure = adminProcedure.use(({ ctx, next }) => {
  if (ctx.user.openId !== "local-admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Acceso solo para administración central",
    });
  }
  return next({ ctx });
});

// ─── App Router ──────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  passwordStatus: protectedProcedure.query(async ({ ctx }) => {
    const credential = await getLocalAdminCredentialByUserId(ctx.user.id);

    return {
      email: credential?.email ?? ctx.user.email ?? null,
      hasCredential: Boolean(credential),
    };
  }),

  setMyPassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1).optional(),
        newPassword: z.string().min(8).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const credential = await getLocalAdminCredentialByUserId(ctx.user.id);
      const email = (credential?.email ?? ctx.user.email ?? "").trim().toLowerCase();

      if (!email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No hay un email admin asociado a esta cuenta",
        });
      }

      if (credential) {
        if (!input.currentPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Ingresá tu contraseña actual",
          });
        }

        const validPassword = verifyPassword(
          input.currentPassword,
          credential.passwordHash
        );

        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "La contraseña actual es incorrecta",
          });
        }
      }

      await upsertLocalAdminCredential(ctx.user.id, {
        email,
        passwordHash: hashPassword(input.newPassword),
      });

      return {
        success: true,
        email,
      };
    }),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
}),

  visitRequests: router({
    create: publicProcedure
      .input(
        z.object({
          slug: slugSchema,
          propertyId: z.string().min(1).max(160),
          propertyTitle: z.string().min(1).max(240),
          name: z.string().min(1).max(200),
          whatsapp: z.string().min(6).max(40),
          email: z.string().email().max(320).optional(),
          message: z.string().min(1).max(800),
        })
      )
      .mutation(async ({ input }) => {
        const reference = `CU-${Date.now().toString(36).toUpperCase()}`;

        demoVisitRequests.push({
          reference,
          ...input,
          createdAt: new Date().toISOString(),
        });

        return {
          ok: true,
          reference,
        };
      }),
  }),

  properties: router({
    listPublic: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        return listPublicProperties(input.slug);
      }),

    getPublic: publicProcedure
      .input(
        z.object({
          slug: slugSchema,
          id: z.string().min(1).max(160),
        }),
      )
      .query(async ({ input }) => {
        return getPublicProperty(input.slug, input.id);
      }),

    list: adminProcedure.query(async ({ ctx }) => {
      const profile = await getAdminBusinessProfile(ctx.user);
      if (!profile) return [];
      return listStoredProperties(profile.slug);
    }),

    create: adminProcedure
      .input(propertyInputSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        const property = await createStoredProperty(profile.slug, input);
        return property;
      }),

    update: adminProcedure
      .input(
        propertyInputSchema.extend({
          id: z.string().min(1).max(160),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        const { id, ...payload } = input;
        const property = await updateStoredProperty(profile.slug, id, payload);
        return property;
      }),

    uploadImage: adminProcedure
      .input(propertyImageUploadSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        const buffer = Buffer.from(input.base64, "base64");
        const rawExtension = input.mimeType.split("/")[1] ?? "jpg";
        const extension = rawExtension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const key = `real-estate/${profile.slug}/properties/${input.propertyId}/${Date.now()}-${randomBytes(4).toString("hex")}.${extension}`;
        const { url, key: fileKey } = await storagePut(key, buffer, input.mimeType);

        return addStoredPropertyImage(profile.slug, input.propertyId, {
          url,
          fileKey,
          caption: input.caption,
        });
      }),

    reorderImages: adminProcedure
      .input(propertyImageReorderSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        return reorderStoredPropertyImages(profile.slug, input.propertyId, input.imageIds);
      }),

    setPrimaryImage: adminProcedure
      .input(propertyPrimaryImageSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        return setStoredPropertyPrimaryImage(profile.slug, input.propertyId, input.imageId);
      }),

    deleteImage: adminProcedure
      .input(propertyPrimaryImageSchema)
      .mutation(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        return deleteStoredPropertyImage(profile.slug, input.propertyId, input.imageId);
      }),

    getAdminPreview: adminProcedure
      .input(z.object({ id: z.string().min(1).max(160) }))
      .query(async ({ ctx, input }) => {
        const profile = await getAdminBusinessProfile(ctx.user);
        if (!profile) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });
        }

        const properties = await listStoredProperties(profile.slug);
        const property = properties.find((item) => item.id === input.id);

        if (!property) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Propiedad no encontrada" });
        }

        return mapStoredPropertyToPublic(property);
      }),
  }),

  business: router({
    getPublic: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        return getPublicBusinessProfile(input.slug);
      }),

    listAll: publicProcedure.query(async () => {
      return listAllBusinessProfiles();
    }),

    get: protectedProcedure.query(async ({ ctx }) => {
      return getAdminBusinessProfile(ctx.user);
    }),

    createPage: platformAdminProcedure
      .input(
        z.object({
          businessName: z.string().min(1).max(200),
          slug: slugSchema,
          whatsapp: z.string().max(30).optional(),
          tagline: z.string().max(300).optional(),
          adminEmail: z.string().email(),
          adminPassword: z.string().min(6).max(100),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createBusinessPageWithLocalAdmin({
          businessName: input.businessName,
          slug: input.slug,
          whatsapp: input.whatsapp,
          tagline: input.tagline,
          adminEmail: input.adminEmail,
          passwordHash: hashPassword(input.adminPassword),
        });

        return {
          success: true,
          businessId: result.profile.id,
          userId: result.user.id,
          slug: result.profile.slug,
          businessName: result.profile.businessName,
          adminEmail: result.credential.email,
          publicPath: `/${result.profile.slug}`,
          adminLoginPath: "/admin-login",
        };
      }),

    update: adminProcedure
      .input(
        z.object({
          slug: slugSchema.optional(),
          businessName: z.string().min(1).max(200).optional(),
          tagline: z.string().max(300).optional(),
          description: z.string().optional(),
          ownerName: z.string().max(200).optional(),
          ownerTitle: z.string().max(200).optional(),
          ownerBio: z.string().optional(),
          ownerImageUrl: z.string().optional(),
          logoUrl: z.string().optional(),
          heroImageUrl: z.string().optional(),
          phone: z.string().max(30).optional(),
          whatsapp: z.string().max(30).optional(),
          email: z.string().max(320).optional(),
          address: z.string().optional(),
          instagram: z.string().max(200).optional(),
          facebook: z.string().max(200).optional(),
          primaryColor: z.string().max(20).optional(),
          accentColor: z.string().max(20).optional(),
          depositPercentage: z.number().min(0).max(100).optional(),
          currency: z.string().max(10).optional(),
          paymentMpAccessToken: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return upsertBusinessProfile(ctx.user.id, input);
      }),

    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          field: z.enum(["heroImageUrl", "logoUrl", "ownerImageUrl"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `business/${ctx.user.id}/${input.field}-${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await upsertBusinessProfile(ctx.user.id, { [input.field]: url });
        return { url };
      }),

    removeImage: adminProcedure
      .input(
        z.object({
          field: z.enum(["heroImageUrl", "ownerImageUrl"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });

        const { getDb } = await import("./db");
        const { businessProfile: bpTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(bpTable).set({ [input.field]: null }).where(eq(bpTable.userId, ctx.user.id));
        return { success: true };
      }),
  }),

  services: router({
    listPublic: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) return [];
        return getPublicServices(profile.id);
      }),

    list: adminProcedure.query(async ({ ctx }) => {
      const profile = await getBusinessProfile(ctx.user.id);
      if (!profile) return [];
      return getAllServices(profile.id);
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1).max(200),
          description: z.string().optional(),
          price: z.number().min(0),
          duration: z.number().min(15).max(480),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });

        return createService({
          businessId: profile.id,
          name: input.name,
          description: input.description,
          price: String(input.price),
          duration: input.duration,
        });
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(200).optional(),
          description: z.string().optional(),
          price: z.number().min(0).optional(),
          duration: z.number().min(15).max(480).optional(),
          isActive: z.boolean().optional(),
          sortOrder: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });

        const service = await getServiceById(input.id);
        if (!service || service.businessId !== profile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No autorizado para modificar este servicio",
          });
        }

        const { id, price, ...rest } = input;
        await updateService(id, {
          ...rest,
          ...(price !== undefined ? { price: String(price) } : {}),
        });

        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Perfil no encontrado" });

        const service = await getServiceById(input.id);
        if (!service || service.businessId !== profile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No autorizado para eliminar este servicio",
          });
        }

        await deleteService(input.id);
        return { success: true };
      }),
  }),

  availability: router({
    getPublic: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) return [];
        return getAvailability(profile.id);
      }),

    get: adminProcedure.query(async ({ ctx }) => {
      const profile = await getBusinessProfile(ctx.user.id);
      if (!profile) return [];
      return getAvailability(profile.id);
    }),

    upsert: adminProcedure
      .input(
        z.object({
          dayOfWeek: z.number().min(0).max(6),
          startTime: z.string().regex(/^\d{2}:\d{2}$/),
          endTime: z.string().regex(/^\d{2}:\d{2}$/),
          slotDuration: z.number().min(15).max(240),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        await upsertAvailability(profile.id, input.dayOfWeek, {
          startTime: input.startTime,
          endTime: input.endTime,
          slotDuration: input.slotDuration,
          isActive: input.isActive,
        });

        return { success: true };
      }),

    getBlockedDates: adminProcedure.query(async ({ ctx }) => {
      const profile = await getBusinessProfile(ctx.user.id);
      if (!profile) return [];
      return getBlockedDates(profile.id);
    }),

    getBookedSlots: publicProcedure
      .input(z.object({ slug: slugSchema, date: z.string() }))
      .query(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) return [];
        const bookingsList = await getBookingsByDate(profile.id, input.date);
        return bookingsList.filter((b) => b.status !== "cancelled").map((b) => b.bookingTime);
      }),
  }),

  bookings: router({
    create: publicProcedure
      .input(
        z.object({
          slug: slugSchema,
          serviceId: z.number(),
          clientName: z.string().min(1).max(200),
          clientEmail: z.string().email(),
          clientPhone: z.string().min(6).max(30),
          bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          bookingTime: z.string().regex(/^\d{2}:\d{2}$/),
          paymentType: z.enum(["deposit", "full"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Negocio no encontrado" });

        const servicesList = await getPublicServices(profile.id);
        const service = servicesList.find((s) => s.id === input.serviceId);
        if (!service) throw new TRPCError({ code: "NOT_FOUND", message: "Servicio no encontrado" });

        const price = parseFloat(String(service.price));
        const depositPct = profile.depositPercentage ?? 30;
        const depositAmount = input.paymentType === "deposit" ? (price * depositPct) / 100 : price;
        const totalAmount = price;

        const booking = await createBooking({
          businessId: profile.id,
          serviceId: input.serviceId,
          clientName: input.clientName,
          clientEmail: input.clientEmail,
          clientPhone: input.clientPhone,
          bookingDate: input.bookingDate,
          bookingTime: input.bookingTime,
          status: "pending",
          totalAmount: String(totalAmount),
          depositAmount: String(depositAmount),
          paymentType: input.paymentType,
          notes: input.notes,
        });

        return { booking, profile };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number(), slug: slugSchema }))
      .query(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Negocio no encontrado" });

        const booking = await getBookingById(input.id);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada" });

        if (booking.businessId !== profile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Esta reserva no pertenece a este negocio",
          });
        }

        return booking;
      }),

    list: adminProcedure.query(async ({ ctx }) => {
      const profile = await getBusinessProfile(ctx.user.id);
      if (!profile) return [];

      const bookingsList = await getAllBookings(profile.id);
      const servicesList = await getAllServices(profile.id);
      const serviceMap = new Map(servicesList.map((s) => [s.id, s]));

      return bookingsList.map((b) => ({
        ...b,
        serviceName: serviceMap.get(b.serviceId)?.name ?? "Servicio eliminado",
      }));
    }),

    updateStatus: adminProcedure
  .input(
    z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const profile = await getBusinessProfile(ctx.user.id);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

    const booking = await getBookingById(input.id);
    if (!booking || booking.businessId !== profile.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No autorizado para modificar esta reserva",
      });
    }

    await updateBookingStatus(input.id, input.status);
    return { success: true };
  }),

archive: adminProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const profile = await getBusinessProfile(ctx.user.id);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

    const booking = await getBookingById(input.id);
    if (!booking || booking.businessId !== profile.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No autorizado para archivar esta reserva",
      });
    }

    if (booking.status !== "cancelled" && booking.status !== "completed") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Solo se pueden archivar reservas canceladas o completadas",
      });
    }

    await archiveBooking(input.id);
    return { success: true };
  }),

restore: adminProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ ctx, input }) => {
    const profile = await getBusinessProfile(ctx.user.id);
    if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

    const booking = await getBookingById(input.id);
    if (!booking || booking.businessId !== profile.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No autorizado para restaurar esta reserva",
      });
    }

    await restoreBooking(input.id);
    return { success: true };
  }),
  }),

  payments: router({
    createPreference: publicProcedure
      .input(
        z.object({
          slug: slugSchema,
          bookingId: z.number(),
          paymentType: z.enum(["deposit", "full"]),
          origin: z.string().url(),
        })
      )
      .mutation(async ({ input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new TRPCError({ code: "NOT_FOUND", message: "Reserva no encontrada" });

        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND", message: "Negocio no encontrado" });
        if (booking.businessId !== profile.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Esta reserva no pertenece a este negocio",
          });
        }

        const accessToken = profile.paymentMpAccessToken?.trim() || process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!accessToken) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Mercado Pago no configurado",
          });
        }

        const servicesList = await getPublicServices(profile.id);
        const service = servicesList.find((s) => s.id === booking.serviceId);

        const amount =
          input.paymentType === "deposit"
            ? parseFloat(String(booking.depositAmount))
            : parseFloat(String(booking.totalAmount));

        const preference = await createMercadoPagoPreference(
          {
            items: [
              {
                id: String(booking.serviceId),
                title: service?.name ?? "Reserva de servicio",
                quantity: 1,
                unit_price: amount,
                currency_id: profile.currency ?? "ARS",
              },
            ],
            payer: {
              name: booking.clientName,
              email: booking.clientEmail,
              phone: { number: booking.clientPhone },
            },
            back_urls: {
              success: `${input.origin}/${input.slug}/booking/success`,
              failure: `${input.origin}/${input.slug}/booking/failure`,
              pending: `${input.origin}/${input.slug}/booking/pending`,
            },
            auto_return: "approved",
            external_reference: `booking-${booking.id}`,
            notification_url: `${input.origin}/api/webhooks/mercado-pago?slug=${encodeURIComponent(input.slug)}`,
            metadata: { bookingId: booking.id, paymentType: input.paymentType },
          },
          accessToken
        );

        await createPaymentTransaction({
          bookingId: booking.id,
          preferenceId: preference.id,
          externalReference: `booking-${booking.id}`,
          status: "pending",
          amount: String(amount),
          currency: profile.currency ?? "ARS",
        });

        return {
          preferenceId: preference.id,
          initPoint: preference.init_point,
          sandboxInitPoint: preference.sandbox_init_point,
        };
      }),

    getByBookingId: publicProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return getPaymentByBookingId(input.bookingId);
      }),
  }),

  gallery: router({
    listPublic: publicProcedure
      .input(z.object({ slug: slugSchema }))
      .query(async ({ input }) => {
        const profile = await getPublicBusinessProfile(input.slug);
        if (!profile) return [];
        return getGalleryImages(profile.id);
      }),

    list: adminProcedure.query(async ({ ctx }) => {
      const profile = await getBusinessProfile(ctx.user.id);
      if (!profile) return [];
      return getGalleryImages(profile.id);
    }),

    upload: adminProcedure
      .input(
        z.object({
          base64: z.string(),
          mimeType: z.string(),
          caption: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { storagePut } = await import("./storage");
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        const buffer = Buffer.from(input.base64, "base64");
        const ext = input.mimeType.split("/")[1] ?? "jpg";
        const key = `gallery/${profile.id}/${Date.now()}.${ext}`;
        const { url } = await storagePut(key, buffer, input.mimeType);

        const image = await addGalleryImage({
          businessId: profile.id,
          url,
          fileKey: key,
          caption: input.caption,
        });

        return image;
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        const images = await getGalleryImages(profile.id);
        if (!images.find((img) => img.id === input.id)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No autorizado para eliminar esta imagen",
          });
        }

        await deleteGalleryImage(input.id);
        return { success: true };
      }),

    reorder: adminProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getBusinessProfile(ctx.user.id);
        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        const images = await getGalleryImages(profile.id);
        const ownedIds = new Set(images.map((img) => img.id));
        if (input.ids.some((id) => !ownedIds.has(id))) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No autorizado para reordenar estas imágenes",
          });
        }

        await reorderGalleryImages(input.ids);
        return { success: true };
      }),
  }),
});

// ─── Webhook Handler ─────────────────────────────────────────────────────────

export async function handleMercadoPagoWebhook(
  body: Record<string, unknown>,
  options?: { slug?: string }
): Promise<void> {
  const topic = body.topic as string | undefined;
  const type = body.type as string | undefined;

  if (topic !== "payment" && type !== "payment") {
    console.info(`[Webhook] Ignoring non-payment event topic=${topic ?? "<empty>"} type=${type ?? "<empty>"}`);
    return;
  }

  const resourceUrl = body.resource as string | undefined;
  const dataId = (body.data as Record<string, unknown>)?.id as string | undefined;
  const paymentId = dataId ?? resourceUrl?.split("/").pop();

  if (!paymentId) {
    throw new Error("[Webhook] Missing paymentId in Mercado Pago webhook payload");
  }

  const profile = options?.slug ? await getPublicBusinessProfile(options.slug) : null;
  const accessToken = profile?.paymentMpAccessToken?.trim() || process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      `[Webhook] Mercado Pago access token not configured for slug ${options?.slug ?? "<missing-slug>"}`
    );
  }

  const { getMercadoPagoPaymentDetails } = await import("./mercadopago");
  const payment = await getMercadoPagoPaymentDetails(paymentId, accessToken);

  const externalRef = payment.external_reference as string | undefined;
  const status = payment.status as string | undefined;

  if (!externalRef) {
    throw new Error(`[Webhook] Payment ${paymentId} missing external_reference`);
  }

  if (!status) {
    throw new Error(`[Webhook] Payment ${paymentId} missing status`);
  }

  const bookingIdStr = externalRef.replace("booking-", "");
  const bookingId = parseInt(bookingIdStr, 10);
  if (isNaN(bookingId)) {
    throw new Error(`[Webhook] Invalid booking reference received: ${externalRef}`);
  }

  const mpStatus =
    status === "approved"
      ? "approved"
      : status === "rejected"
        ? "rejected"
        : status === "cancelled"
          ? "cancelled"
          : "pending";

  const preferenceId = payment.preference_id as string | undefined;
  let matchedTransaction = null;
  let matchedBy: "preference_id" | "external_reference" | null = null;

  if (preferenceId) {
    matchedTransaction = await getPaymentByPreferenceId(preferenceId);
    if (matchedTransaction) {
      matchedBy = "preference_id";
    }
  }

  if (!matchedTransaction) {
    matchedTransaction = await getPaymentByExternalReference(externalRef);
    if (matchedTransaction) {
      matchedBy = "external_reference";
    }
  }

  if (matchedTransaction && matchedBy) {
    await updatePaymentTransactionById(matchedTransaction.id, {
      status: mpStatus,
      paymentId,
      preferenceId: preferenceId ?? matchedTransaction.preferenceId ?? undefined,
      rawData: payment,
    });
    console.info(
      `[Webhook] Payment transaction matched by ${matchedBy} for booking ${bookingId}: transaction=${matchedTransaction.id} status=${mpStatus}`
    );
  } else {
    console.warn(
      `[Webhook] Payment transaction not matched for booking ${bookingId}: preference_id=${preferenceId ?? "<missing>"} external_reference=${externalRef}`
    );
  }

  if (status === "approved") {
    await updateBookingStatus(bookingId, "confirmed");
    console.info(`[Webhook] Booking ${bookingId} marked as confirmed from approved payment ${paymentId}`);
    await sendPaymentConfirmationNotification(bookingId);
  }
}

export type AppRouter = typeof appRouter;
