import { and, asc, desc, eq, ne } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  BlockedDate,
  Booking,
  BusinessProfile,
  GalleryImage,
  InsertBooking,
  InsertBusinessProfile,
  InsertGalleryImage,
  InsertLocalAdminCredential,
  InsertPaymentTransaction,
  InsertService,
  InsertServiceAvailability,
  InsertUser,
  LocalAdminCredential,
  Notification,
  PaymentTransaction,
  Service,
  ServiceAvailability,
  User,
  blockedDates,
  bookings,
  businessProfile,
  galleryImages,
  localAdminCredentials,
  notifications,
  paymentTransactions,
  serviceAvailability,
  services,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export function buildLocalAdminOpenId(slug: string) {
  return `local-admin:${normalizeSlug(slug)}`;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

// ─── Local Admin Credentials ─────────────────────────────────────────────────

export async function getLocalAdminCredentialByEmail(
  email: string
): Promise<LocalAdminCredential | null> {
  const db = await getDb();
  if (!db) return null;

  const normalizedEmail = normalizeEmail(email);
  const result = await db
    .select()
    .from(localAdminCredentials)
    .where(eq(localAdminCredentials.email, normalizedEmail))
    .limit(1);

  return result[0] ?? null;
}

export async function getLocalAdminCredentialByUserId(
  userId: number
): Promise<LocalAdminCredential | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(localAdminCredentials)
    .where(eq(localAdminCredentials.userId, userId))
    .limit(1);

  return result[0] ?? null;
}

export async function upsertLocalAdminCredential(
  userId: number,
  data: Omit<InsertLocalAdminCredential, "userId">
): Promise<LocalAdminCredential> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const email = normalizeEmail(data.email);

  const existingByUser = await getLocalAdminCredentialByUserId(userId);
  if (existingByUser) {
    await db
      .update(localAdminCredentials)
      .set({
        email,
        passwordHash: data.passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(localAdminCredentials.userId, userId));

    return (await getLocalAdminCredentialByUserId(userId))!;
  }

  await db.insert(localAdminCredentials).values({
    userId,
    email,
    passwordHash: data.passwordHash,
  });

  return (await getLocalAdminCredentialByUserId(userId))!;
}

type CreateBusinessPageInput = {
  businessName: string;
  slug: string;
  city: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  description?: string;
  tagline?: string;
  adminEmail: string;
  passwordHash: string;
};

export async function createBusinessPageWithLocalAdmin(
  input: CreateBusinessPageInput
): Promise<{
  user: User;
  profile: BusinessProfile;
  credential: LocalAdminCredential;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const businessName = input.businessName.trim();
  const slug = normalizeSlug(input.slug);
  const city = input.city.trim();
  const adminEmail = normalizeEmail(input.adminEmail);
  const whatsapp = input.whatsapp?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const address = input.address?.trim() || city;
  const description = input.description?.trim() ?? "";
  const tagline = input.tagline?.trim() ?? "";

  if (!businessName) throw new Error("El nombre del negocio es obligatorio");
  if (!slug) throw new Error("El slug es obligatorio");
  if (!city) throw new Error("La ciudad o zona principal es obligatoria");
  if (!adminEmail) throw new Error("El email admin es obligatorio");
  if (!input.passwordHash) throw new Error("La contraseña es obligatoria");

  const existingSlug = await getPublicBusinessProfile(slug);
  if (existingSlug) {
    throw new Error("Ese slug ya existe");
  }

  const existingCredential = await getLocalAdminCredentialByEmail(adminEmail);
  if (existingCredential) {
    throw new Error("Ese email admin ya existe");
  }

  const openId = buildLocalAdminOpenId(slug);
  const existingUser = await getUserByOpenId(openId);
  if (existingUser) {
    throw new Error("Ya existe un usuario para ese slug");
  }

  return db.transaction(async (tx) => {
    await tx.insert(users).values({
      openId,
      name: businessName,
      email: adminEmail,
      loginMethod: "local",
      role: "admin",
      lastSignedIn: new Date(),
    });

    const createdUser = await tx.select().from(users).where(eq(users.openId, openId)).limit(1);
    const user = createdUser[0];

    if (!user) {
      throw new Error("No se pudo crear el usuario admin");
    }

    await tx.insert(businessProfile).values({
      userId: user.id,
      slug,
      businessName,
      whatsapp,
      email,
      address,
      description:
        description || `Inmobiliaria enfocada en propiedades de ${city}.`,
      tagline: tagline || `Propiedades en venta y alquiler en ${city}.`,
    });

    await tx.insert(localAdminCredentials).values({
      userId: user.id,
      email: adminEmail,
      passwordHash: input.passwordHash,
    });

    const createdProfile = await tx
      .select()
      .from(businessProfile)
      .where(eq(businessProfile.userId, user.id))
      .limit(1);

    const createdCredential = await tx
      .select()
      .from(localAdminCredentials)
      .where(eq(localAdminCredentials.userId, user.id))
      .limit(1);

    if (!createdProfile[0] || !createdCredential[0]) {
      throw new Error("No se pudo completar el alta mínima");
    }

    return {
      user,
      profile: createdProfile[0],
      credential: createdCredential[0],
    };
  });
}

// ─── Business Profile ─────────────────────────────────────────────────────────

export async function getBusinessProfile(userId: number): Promise<BusinessProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.userId, userId))
    .limit(1);
  return result[0] ?? null;
}

export async function getPublicBusinessProfile(slug: string): Promise<BusinessProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(businessProfile)
    .where(eq(businessProfile.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

export async function getBusinessProfileById(id: number): Promise<BusinessProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(businessProfile).where(eq(businessProfile.id, id)).limit(1);
  return result[0] ?? null;
}

export async function listAllBusinessProfiles(): Promise<BusinessProfile[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(businessProfile)
    .where(ne(businessProfile.slug, ""))
    .orderBy(asc(businessProfile.businessName));
}

export async function upsertBusinessProfile(
  userId: number,
  data: Partial<InsertBusinessProfile>
): Promise<BusinessProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getBusinessProfile(userId);
  if (existing) {
    await db
      .update(businessProfile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(businessProfile.userId, userId));
    return (await getBusinessProfile(userId))!;
  } else {
    await db.insert(businessProfile).values({ userId, businessName: "Mi Negocio", ...data });
    return (await getBusinessProfile(userId))!;
  }
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getPublicServices(businessId: number): Promise<Service[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(services)
    .where(and(eq(services.businessId, businessId), eq(services.isActive, true)))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));
}

export async function getAllServices(businessId: number): Promise<Service[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(services)
    .where(eq(services.businessId, businessId))
    .orderBy(asc(services.sortOrder), asc(services.createdAt));
}

export async function getServiceById(id: number): Promise<Service | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createService(data: InsertService): Promise<Service> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(services).values(data);
  const result = await db
    .select()
    .from(services)
    .where(and(eq(services.businessId, data.businessId), eq(services.name, data.name)))
    .orderBy(desc(services.createdAt))
    .limit(1);
  return result[0]!;
}

export async function updateService(id: number, data: Partial<InsertService>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(services).set({ ...data, updatedAt: new Date() }).where(eq(services.id, id));
}

export async function deleteService(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(services).set({ isActive: false, updatedAt: new Date() }).where(eq(services.id, id));
}

// ─── Service Availability ─────────────────────────────────────────────────────

export async function getAvailability(businessId: number): Promise<ServiceAvailability[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(serviceAvailability)
    .where(and(eq(serviceAvailability.businessId, businessId), eq(serviceAvailability.isActive, true)))
    .orderBy(asc(serviceAvailability.dayOfWeek));
}

export async function upsertAvailability(
  businessId: number,
  dayOfWeek: number,
  data: Partial<InsertServiceAvailability>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(serviceAvailability)
    .where(and(eq(serviceAvailability.businessId, businessId), eq(serviceAvailability.dayOfWeek, dayOfWeek)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(serviceAvailability)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(serviceAvailability.id, existing[0].id));
  } else {
    await db.insert(serviceAvailability).values({
      businessId,
      dayOfWeek,
      startTime: "09:00",
      endTime: "18:00",
      slotDuration: 60,
      ...data,
    });
  }
}

export async function getBlockedDates(businessId: number): Promise<BlockedDate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blockedDates).where(eq(blockedDates.businessId, businessId));
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(data: InsertBooking): Promise<Booking> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(bookings).values(data);
  const result = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.businessId, data.businessId),
        eq(bookings.clientEmail, data.clientEmail),
        eq(bookings.bookingDate, data.bookingDate),
        eq(bookings.bookingTime, data.bookingTime)
      )
    )
    .orderBy(desc(bookings.createdAt))
    .limit(1);
  return result[0]!;
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllBookings(businessId: number): Promise<Booking[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.businessId, businessId))
    .orderBy(desc(bookings.createdAt));
}

export async function getBookingsByStatus(status: Booking["status"]): Promise<Booking[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bookings)
    .where(eq(bookings.status, status))
    .orderBy(asc(bookings.bookingDate), asc(bookings.bookingTime), asc(bookings.createdAt));
}

export async function getBookingsByDate(businessId: number, date: string): Promise<Booking[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(bookings)
    .where(and(eq(bookings.businessId, businessId), eq(bookings.bookingDate, date)));
}

export async function updateBookingStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const nextData: {
    status: "pending" | "confirmed" | "cancelled" | "completed";
    updatedAt: Date;
    archivedAt?: Date | null;
  } = {
    status,
    updatedAt: new Date(),
  };

  if (status === "pending" || status === "confirmed") {
    nextData.archivedAt = null;
  }

  await db.update(bookings).set(nextData).where(eq(bookings.id, id));
}

export async function archiveBooking(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bookings)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(eq(bookings.id, id));
}

export async function restoreBooking(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(bookings)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(bookings.id, id));
}

// ─── Payment Transactions ─────────────────────────────────────────────────────

export async function createPaymentTransaction(data: InsertPaymentTransaction): Promise<PaymentTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(paymentTransactions).values(data);
  const result = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.bookingId, data.bookingId))
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(1);
  return result[0]!;
}

export async function getPaymentByPreferenceId(preferenceId: string): Promise<PaymentTransaction | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.preferenceId, preferenceId))
    .limit(1);
  return result[0] ?? null;
}

export async function getPaymentByExternalReference(
  externalReference: string
): Promise<PaymentTransaction | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.externalReference, externalReference))
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getPaymentByBookingId(bookingId: number): Promise<PaymentTransaction | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.bookingId, bookingId))
    .orderBy(desc(paymentTransactions.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function updatePaymentTransactionById(
  id: number,
  data: {
    status: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
    paymentId?: string;
    preferenceId?: string;
    rawData?: unknown;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(paymentTransactions)
    .set({
      status: data.status,
      paymentId: data.paymentId ?? undefined,
      preferenceId: data.preferenceId ?? undefined,
      rawData: data.rawData ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(paymentTransactions.id, id));
}

export async function updatePaymentStatus(
  preferenceId: string,
  status: "pending" | "approved" | "rejected" | "cancelled" | "refunded",
  paymentId?: string,
  rawData?: unknown
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(paymentTransactions)
    .set({
      status,
      paymentId: paymentId ?? undefined,
      rawData: rawData ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(paymentTransactions.preferenceId, preferenceId));
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export async function getGalleryImages(businessId: number): Promise<GalleryImage[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(galleryImages)
    .where(and(eq(galleryImages.businessId, businessId), eq(galleryImages.isActive, true)))
    .orderBy(asc(galleryImages.sortOrder), asc(galleryImages.createdAt));
}

export async function addGalleryImage(data: InsertGalleryImage): Promise<GalleryImage> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(galleryImages).values(data);
  const result = await db
    .select()
    .from(galleryImages)
    .where(and(eq(galleryImages.businessId, data.businessId), eq(galleryImages.url, data.url)))
    .orderBy(desc(galleryImages.createdAt))
    .limit(1);
  return result[0]!;
}

export async function deleteGalleryImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(galleryImages).set({ isActive: false }).where(eq(galleryImages.id, id));
}

export async function reorderGalleryImages(ids: number[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < ids.length; i++) {
    await db.update(galleryImages).set({ sortOrder: i }).where(eq(galleryImages.id, ids[i]!));
  }
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function createNotification(data: {
  bookingId: number;
  type: Notification["type"];
  channel: Notification["channel"];
  recipient: string;
  message: string;
  status: Notification["status"];
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values({
    ...data,
    sentAt: data.status === "sent" ? new Date() : undefined,
  });
}

export async function getNotificationByBookingAndType(
  bookingId: number,
  type: Notification["type"]
): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(notifications)
    .where(and(eq(notifications.bookingId, bookingId), eq(notifications.type, type)))
    .orderBy(desc(notifications.createdAt))
    .limit(1);
  return result[0] ?? null;
}

export async function getNotificationByBookingTypeAndRecipient(
  bookingId: number,
  type: Notification["type"],
  recipient: string
): Promise<Notification | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.bookingId, bookingId),
        eq(notifications.type, type),
        eq(notifications.recipient, recipient)
      )
    )
    .orderBy(desc(notifications.createdAt))
    .limit(1);

  return result[0] ?? null;
}
