import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Local Admin Credentials ────────────────────────────────────────────────

export const localAdminCredentials = mysqlTable("local_admin_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LocalAdminCredential = typeof localAdminCredentials.$inferSelect;
export type InsertLocalAdminCredential = typeof localAdminCredentials.$inferInsert;

// ─── Business Profile ─────────────────────────────────────────────────────────

export const businessProfile = mysqlTable("business_profile", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Slug público único para multi-sitio
  slug: varchar("slug", { length: 100 }).notNull().unique().default(""),
  // Identidad
  businessName: varchar("businessName", { length: 200 }).notNull().default("Mi Negocio"),
  tagline: varchar("tagline", { length: 300 }).default(""),
  description: text("description"),
  // Propietario / Profesional
  ownerName: varchar("ownerName", { length: 200 }).default(""),
  ownerTitle: varchar("ownerTitle", { length: 200 }).default(""),
  ownerBio: text("ownerBio"),
  ownerImageUrl: text("ownerImageUrl"),
  // Imágenes
  logoUrl: text("logoUrl"),
  heroImageUrl: text("heroImageUrl"),
  // Contacto
  phone: varchar("phone", { length: 30 }).default(""),
  whatsapp: varchar("whatsapp", { length: 30 }).default(""),
  email: varchar("email", { length: 320 }).default(""),
  address: text("address"),
  // Redes sociales
  instagram: varchar("instagram", { length: 200 }).default(""),
  facebook: varchar("facebook", { length: 200 }).default(""),
  // Configuración visual
  primaryColor: varchar("primaryColor", { length: 20 }).default("#000000"),
  accentColor: varchar("accentColor", { length: 20 }).default("#c9a96e"),
  // Configuración de pagos
  paymentMpAccessToken: text("paymentMpAccessToken"),
  depositPercentage: int("depositPercentage").default(30),
  currency: varchar("currency", { length: 10 }).default("ARS"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BusinessProfile = typeof businessProfile.$inferSelect;
export type InsertBusinessProfile = typeof businessProfile.$inferInsert;

// ─── Services ─────────────────────────────────────────────────────────────────

export const services = mysqlTable("services", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull().default("0"),
  duration: int("duration").notNull().default(60), // minutos
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// ─── Service Availability ─────────────────────────────────────────────────────

export const serviceAvailability = mysqlTable("service_availability", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0=Dom, 1=Lun, ..., 6=Sab
  startTime: varchar("startTime", { length: 5 }).notNull(), // "09:00"
  endTime: varchar("endTime", { length: 5 }).notNull(), // "18:00"
  slotDuration: int("slotDuration").default(60).notNull(), // minutos
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceAvailability = typeof serviceAvailability.$inferSelect;
export type InsertServiceAvailability = typeof serviceAvailability.$inferInsert;

// ─── Blocked Dates ────────────────────────────────────────────────────────────

export const blockedDates = mysqlTable("blocked_dates", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // "YYYY-MM-DD"
  reason: varchar("reason", { length: 200 }).default(""),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlockedDate = typeof blockedDates.$inferSelect;

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  serviceId: int("serviceId").notNull(),
  // Datos del cliente
  clientName: varchar("clientName", { length: 200 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 30 }).notNull(),
  // Fecha y hora
  bookingDate: varchar("bookingDate", { length: 10 }).notNull(), // "YYYY-MM-DD"
  bookingTime: varchar("bookingTime", { length: 5 }).notNull(), // "HH:MM"
  // Estado
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"])
    .default("pending")
    .notNull(),
  // Pago
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("depositAmount", { precision: 10, scale: 2 }).default("0"),
  paymentType: mysqlEnum("paymentType", ["deposit", "full"]).default("full").notNull(),
  // Notas
  notes: text("notes"),
  archivedAt: timestamp("archivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

// ─── Payment Transactions ─────────────────────────────────────────────────────

export const paymentTransactions = mysqlTable("payment_transactions", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  // Mercado Pago
  preferenceId: varchar("preferenceId", { length: 200 }),
  paymentId: varchar("paymentId", { length: 200 }),
  externalReference: varchar("externalReference", { length: 200 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled", "refunded"])
    .default("pending")
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("ARS"),
  // Metadata
  rawData: json("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ─── Gallery Images ───────────────────────────────────────────────────────────

export const galleryImages = mysqlTable("gallery_images", {
  id: int("id").autoincrement().primaryKey(),
  businessId: int("businessId").notNull(),
  url: text("url").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  caption: varchar("caption", { length: 300 }).default(""),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  type: mysqlEnum("type", [
    "booking_confirmation",
    "payment_confirmation",
    "reminder_24h",
    "booking_cancelled",
  ]).notNull(),
  channel: mysqlEnum("channel", ["whatsapp", "email"]).default("whatsapp").notNull(),
  recipient: varchar("recipient", { length: 50 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["sent", "failed", "pending"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;