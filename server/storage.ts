import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import type { BusinessProfile } from "../drizzle/schema";
import {
  demoProperties,
  realEstateProfile,
  type DemoProperty,
  type PropertyOperation,
  type PropertyStatus,
} from "../client/src/lib/realEstateDemo";
import {
  ensureUploadsDir,
  getUploadDiskPath,
  getUploadPublicUrl,
} from "./uploads";

function toBuffer(data: Buffer | Uint8Array | string) {
  if (typeof data === "string") return Buffer.from(data);
  return Buffer.isBuffer(data) ? data : Buffer.from(data);
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  _contentType = "application/octet-stream",
) {
  ensureUploadsDir();
  const { key, diskPath } = getUploadDiskPath(relKey);
  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  await fs.promises.writeFile(diskPath, toBuffer(data));
  return { key, url: getUploadPublicUrl(key) };
}

export async function storageGet(relKey: string) {
  const { key } = getUploadDiskPath(relKey);
  return { key, url: getUploadPublicUrl(key) };
}

export async function storageDelete(relKey: string) {
  const { diskPath } = getUploadDiskPath(relKey);

  try {
    await fs.promises.unlink(diskPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}

export type StoredPropertyImage = {
  id: string;
  url: string;
  caption?: string;
  fileKey?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
};

export type StoredProperty = {
  id: string;
  slug: string;
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;
  features: string[];
  description: string;
  featured: boolean;
  images: StoredPropertyImage[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PropertyMutationInput = {
  title: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  price: string;
  location: string;
  address: string;
  propertyType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaM2?: number | null;
  features?: string[];
  description: string;
  featured?: boolean;
};

export type PropertyImageMutationInput = {
  url: string;
  caption?: string;
  fileKey?: string;
};

type PropertyStore = {
  version: 1;
  slug: string;
  updatedAt: string;
  properties: StoredProperty[];
};

export type StoredVisitRequestStatus =
  | "new"
  | "contacted"
  | "visited"
  | "negotiating"
  | "closed"
  | "not_interested";

export type StoredVisitRequestNote = {
  id: string;
  text: string;
  createdAt: string;
};

export type StoredVisitRequestTimelineEntry = {
  id: string;
  type: "created" | "status_changed" | "note_added";
  title: string;
  description?: string;
  status?: StoredVisitRequestStatus;
  noteId?: string;
  createdAt: string;
};

export type StoredVisitRequest = {
  id: string;
  reference: string;
  slug: string;
  propertyId: string;
  propertyTitle: string;
  name: string;
  whatsapp: string;
  email: string | null;
  message: string;
  status: StoredVisitRequestStatus;
  notes: StoredVisitRequestNote[];
  timeline: StoredVisitRequestTimelineEntry[];
  createdAt: string;
  updatedAt: string;
};

export type VisitRequestMutationInput = {
  propertyId: string;
  propertyTitle: string;
  name: string;
  whatsapp: string;
  email?: string;
  message: string;
};

type VisitRequestStore = {
  version: 1;
  slug: string;
  updatedAt: string;
  requests: StoredVisitRequest[];
};

export type StoredBusinessImageField = "heroImageUrl" | "logoUrl" | "ownerImageUrl";

export type StoredBusinessImageAsset = {
  url: string;
  fileKey?: string;
  updatedAt: string;
};

type BusinessMediaStore = {
  version: 1;
  slug: string;
  updatedAt: string;
  fields: Partial<Record<StoredBusinessImageField, StoredBusinessImageAsset | null>>;
};

type BusinessProfileStore = {
  version: 1;
  slug: string;
  updatedAt: string;
  profile: BusinessProfile;
};

export type StoredLocalAdminCredential = {
  slug: string;
  openId: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

type LocalAdminCredentialStore = {
  version: 1;
  updatedAt: string;
  credentials: StoredLocalAdminCredential[];
};

export type StoredBusinessDirectoryEntry = {
  slug: string;
  businessName: string;
  archivedAt: string | null;
  updatedAt: string;
};

type BusinessDirectoryStore = {
  version: 1;
  updatedAt: string;
  entries: StoredBusinessDirectoryEntry[];
};

const STORE_VERSION = 1 as const;
const VISIT_REQUEST_STATUS_LABELS: Record<StoredVisitRequestStatus, string> = {
  new: "Nueva",
  contacted: "Contactado",
  visited: "Visitó",
  negotiating: "En negociación",
  closed: "Cerrado",
  not_interested: "No interesado",
};

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function buildStoreKey(slug: string) {
  return `real-estate/${normalizeSlug(slug)}/properties.json`;
}

function buildVisitRequestStoreKey(slug: string) {
  return `real-estate/${normalizeSlug(slug)}/visit-requests.json`;
}

function buildBusinessMediaStoreKey(slug: string) {
  return `real-estate/${normalizeSlug(slug)}/business-media.json`;
}

function buildBusinessProfileStoreKey(slug: string) {
  return `real-estate/${normalizeSlug(slug)}/business-profile.json`;
}

function buildLocalAdminCredentialStoreKey() {
  return "real-estate/local-admin-credentials.json";
}

function buildBusinessDirectoryStoreKey() {
  return "real-estate/business-directory.json";
}

function sortImages(images: StoredPropertyImage[]) {
  return [...images].sort((a, b) => {
    if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
    return a.sortOrder - b.sortOrder;
  });
}

function normalizeImages(images: StoredPropertyImage[] = []) {
  const sorted = sortImages(images).map((image, index) => ({
    ...image,
    sortOrder: index,
  }));

  if (sorted.length > 0 && !sorted.some((image) => image.isPrimary)) {
    sorted[0] = { ...sorted[0], isPrimary: true };
  }

  return sorted;
}

function normalizeProperty(property: StoredProperty): StoredProperty {
  return {
    ...property,
    slug: normalizeSlug(property.slug),
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    areaM2: property.areaM2 ?? null,
    features: (property.features ?? []).map((feature) => feature.trim()).filter(Boolean),
    featured: Boolean(property.featured),
    images: normalizeImages(property.images),
  };
}

function buildStoredBusinessProfileFromSource(
  slug: string,
  source: Partial<BusinessProfile> & {
    businessName: string;
  },
): BusinessProfile {
  const now = new Date();
  const normalizedSlug = normalizeSlug(slug);
  const cityOrAddress = source.address?.trim() || "";
  const createdAt =
    source.createdAt instanceof Date
      ? source.createdAt
      : source.createdAt
      ? new Date(source.createdAt)
      : now;
  const updatedAt =
    source.updatedAt instanceof Date
      ? source.updatedAt
      : source.updatedAt
      ? new Date(source.updatedAt)
      : now;

  return {
    id: source.id ?? 0,
    userId: source.userId ?? 0,
    slug: normalizedSlug,
    businessName: source.businessName.trim(),
    tagline: source.tagline?.trim() || "",
    description: source.description?.trim() || "",
    ownerName: source.ownerName?.trim() || "",
    ownerTitle: source.ownerTitle?.trim() || "",
    ownerBio: source.ownerBio?.trim() || null,
    ownerImageUrl: source.ownerImageUrl ?? null,
    logoUrl: source.logoUrl ?? null,
    heroImageUrl: source.heroImageUrl ?? null,
    phone: source.phone?.trim() || "",
    whatsapp: source.whatsapp?.trim() || "",
    email: source.email?.trim() || "",
    address: cityOrAddress,
    instagram: source.instagram?.trim() || "",
    facebook: source.facebook?.trim() || "",
    primaryColor: source.primaryColor?.trim() || "#000000",
    accentColor: source.accentColor?.trim() || "#c9a96e",
    paymentMpAccessToken: source.paymentMpAccessToken ?? null,
    depositPercentage: source.depositPercentage ?? 30,
    currency: source.currency?.trim() || "ARS",
    createdAt,
    updatedAt,
  };
}

function buildDemoStoredBusinessProfile() {
  return buildStoredBusinessProfileFromSource(realEstateProfile.slug, {
    businessName: realEstateProfile.name,
    tagline: realEstateProfile.tagline,
    description: realEstateProfile.description,
    phone: realEstateProfile.phone,
    whatsapp: realEstateProfile.whatsapp,
    email: realEstateProfile.email,
    address: realEstateProfile.address,
    instagram: realEstateProfile.instagram,
  });
}

function seedProperty(property: DemoProperty, slug: string, sortOrder: number): StoredProperty {
  const now = new Date().toISOString();
  return {
    id: property.id,
    slug,
    title: property.title,
    operation: property.operation,
    status: property.status,
    price: property.price,
    location: property.location,
    address: property.address,
    propertyType: property.propertyType,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    areaM2: property.areaM2 ?? null,
    features: [...property.features],
    description: property.description,
    featured: Boolean(property.featured),
    images: property.images.map((url, index) => ({
      id: `${property.id}-image-${index + 1}`,
      url,
      sortOrder: index,
      isPrimary: index === 0,
      createdAt: now,
    })),
    sortOrder,
    createdAt: now,
    updatedAt: now,
  };
}

function buildInitialStore(slug: string): PropertyStore {
  const normalizedSlug = normalizeSlug(slug);
  return {
    version: STORE_VERSION,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
    properties:
      normalizedSlug === normalizeSlug(realEstateProfile.slug)
        ? demoProperties.map((property, index) => seedProperty(property, normalizedSlug, index))
        : [],
  };
}

async function writeStore(slug: string, store: PropertyStore) {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildStoreKey(normalizedSlug));
  const nextStore: PropertyStore = {
    version: STORE_VERSION,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
    properties: [...store.properties]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((property, index) => normalizeProperty({ ...property, slug: normalizedSlug, sortOrder: index })),
  };
  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readStore(slug: string): Promise<PropertyStore> {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildStoreKey(normalizedSlug));

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as PropertyStore;
    return {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      properties: (parsed.properties ?? []).map((property) =>
        normalizeProperty({ ...property, slug: normalizedSlug }),
      ),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const initialStore = buildInitialStore(normalizedSlug);
    await writeStore(normalizedSlug, initialStore);
    return initialStore;
  }
}

async function writeBusinessDirectoryStore(store: BusinessDirectoryStore) {
  ensureUploadsDir();
  const { diskPath } = getUploadDiskPath(buildBusinessDirectoryStoreKey());
  const nextStore: BusinessDirectoryStore = {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    entries: [...store.entries]
      .map((entry) => ({
        slug: normalizeSlug(entry.slug),
        businessName: entry.businessName.trim(),
        archivedAt: entry.archivedAt ?? null,
        updatedAt: entry.updatedAt,
      }))
      .sort((left, right) => left.slug.localeCompare(right.slug)),
  };

  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readBusinessDirectoryStore(): Promise<BusinessDirectoryStore> {
  ensureUploadsDir();
  const { diskPath } = getUploadDiskPath(buildBusinessDirectoryStoreKey());

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as BusinessDirectoryStore;
    return {
      version: STORE_VERSION,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      entries: (parsed.entries ?? []).map((entry) => ({
        slug: normalizeSlug(entry.slug),
        businessName: entry.businessName?.trim() || normalizeSlug(entry.slug),
        archivedAt: entry.archivedAt ?? null,
        updatedAt: entry.updatedAt ?? new Date().toISOString(),
      })),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      entries: [],
    };
  }
}

async function writeVisitRequestStore(slug: string, store: VisitRequestStore) {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildVisitRequestStoreKey(normalizedSlug));
  const nextStore: VisitRequestStore = {
    version: STORE_VERSION,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
    requests: [...store.requests].map((request) =>
      normalizeVisitRequest({
        ...request,
        slug: normalizedSlug,
      }),
    ),
  };

  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readVisitRequestStore(slug: string): Promise<VisitRequestStore> {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildVisitRequestStoreKey(normalizedSlug));

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as VisitRequestStore;

    return {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      requests: (parsed.requests ?? []).map((request) =>
        normalizeVisitRequest({
          ...request,
          slug: normalizedSlug,
        }),
      ),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

    const initialStore: VisitRequestStore = {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: new Date().toISOString(),
      requests: [],
    };

    await writeVisitRequestStore(normalizedSlug, initialStore);
    return initialStore;
  }
}

async function writeBusinessMediaStore(slug: string, store: BusinessMediaStore) {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildBusinessMediaStoreKey(normalizedSlug));
  const nextStore: BusinessMediaStore = {
    version: STORE_VERSION,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
    fields: { ...store.fields },
  };

  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readBusinessMediaStore(slug: string): Promise<BusinessMediaStore> {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildBusinessMediaStoreKey(normalizedSlug));

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as BusinessMediaStore;

    return {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      fields: { ...(parsed.fields ?? {}) },
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

    const initialStore: BusinessMediaStore = {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: new Date().toISOString(),
      fields: {},
    };

    await writeBusinessMediaStore(normalizedSlug, initialStore);
    return initialStore;
  }
}

async function writeBusinessProfileStore(slug: string, profile: BusinessProfile) {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildBusinessProfileStoreKey(normalizedSlug));
  const nextProfile = buildStoredBusinessProfileFromSource(normalizedSlug, {
    ...profile,
    slug: normalizedSlug,
  });
  const nextStore: BusinessProfileStore = {
    version: STORE_VERSION,
    slug: normalizedSlug,
    updatedAt: new Date().toISOString(),
    profile: nextProfile,
  };

  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readBusinessProfileStore(slug: string): Promise<BusinessProfileStore | null> {
  ensureUploadsDir();
  const normalizedSlug = normalizeSlug(slug);
  const { diskPath } = getUploadDiskPath(buildBusinessProfileStoreKey(normalizedSlug));

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as BusinessProfileStore;

    return {
      version: STORE_VERSION,
      slug: normalizedSlug,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      profile: buildStoredBusinessProfileFromSource(normalizedSlug, {
        ...parsed.profile,
        slug: normalizedSlug,
      }),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return null;
  }
}

async function writeLocalAdminCredentialStore(store: LocalAdminCredentialStore) {
  ensureUploadsDir();
  const { diskPath } = getUploadDiskPath(buildLocalAdminCredentialStoreKey());
  const nextStore: LocalAdminCredentialStore = {
    version: STORE_VERSION,
    updatedAt: new Date().toISOString(),
    credentials: [...store.credentials].map((credential) => ({
      ...credential,
      slug: normalizeSlug(credential.slug),
      openId: credential.openId,
      email: credential.email.trim().toLowerCase(),
    })),
  };

  await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
  const tempPath = `${diskPath}.tmp`;
  await fs.promises.writeFile(tempPath, JSON.stringify(nextStore, null, 2), "utf8");
  await fs.promises.rename(tempPath, diskPath);
}

async function readLocalAdminCredentialStore(): Promise<LocalAdminCredentialStore> {
  ensureUploadsDir();
  const { diskPath } = getUploadDiskPath(buildLocalAdminCredentialStoreKey());

  try {
    const raw = await fs.promises.readFile(diskPath, "utf8");
    const parsed = JSON.parse(raw) as LocalAdminCredentialStore;

    return {
      version: STORE_VERSION,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      credentials: (parsed.credentials ?? []).map((credential) => ({
        ...credential,
        slug: normalizeSlug(credential.slug),
        email: credential.email.trim().toLowerCase(),
      })),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;

    const initialStore: LocalAdminCredentialStore = {
      version: STORE_VERSION,
      updatedAt: new Date().toISOString(),
      credentials: [],
    };

    await writeLocalAdminCredentialStore(initialStore);
    return initialStore;
  }
}

function buildVisitRequestId() {
  return `visit-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

function buildVisitRequestReference() {
  return `CU-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
}

function buildVisitRequestNoteId() {
  return `note-${Date.now().toString(36)}-${randomBytes(2).toString("hex")}`;
}

function buildVisitRequestTimelineId() {
  return `timeline-${Date.now().toString(36)}-${randomBytes(2).toString("hex")}`;
}

function normalizeVisitRequestStatus(status?: string | null): StoredVisitRequestStatus {
  switch (status) {
    case "contacted":
    case "visited":
    case "negotiating":
    case "closed":
    case "not_interested":
      return status;
    case "new":
    default:
      return "new";
  }
}

function buildVisitRequestCreatedEntry(request: {
  name: string;
  propertyTitle: string;
  createdAt: string;
}): StoredVisitRequestTimelineEntry {
  return {
    id: buildVisitRequestTimelineId(),
    type: "created",
    title: "Consulta recibida",
    description: `${request.name.trim()} consultó por ${request.propertyTitle.trim()}.`,
    createdAt: request.createdAt,
  };
}

function buildVisitRequestStatusEntry(
  status: StoredVisitRequestStatus,
  createdAt: string,
): StoredVisitRequestTimelineEntry {
  return {
    id: buildVisitRequestTimelineId(),
    type: "status_changed",
    title: `Estado actualizado a ${VISIT_REQUEST_STATUS_LABELS[status]}`,
    status,
    createdAt,
  };
}

function buildVisitRequestNoteEntry(
  note: StoredVisitRequestNote,
): StoredVisitRequestTimelineEntry {
  return {
    id: buildVisitRequestTimelineId(),
    type: "note_added",
    title: "Nota agregada",
    description: note.text,
    noteId: note.id,
    createdAt: note.createdAt,
  };
}

function normalizeVisitRequest(request: StoredVisitRequest): StoredVisitRequest {
  const normalizedStatus = normalizeVisitRequestStatus(request.status);
  const notes = (request.notes ?? [])
    .map((note) => ({
      id: note.id,
      text: note.text.trim(),
      createdAt: note.createdAt,
    }))
    .filter((note) => note.text);

  const fallbackTimeline: StoredVisitRequestTimelineEntry[] = [
    buildVisitRequestCreatedEntry({
      name: request.name,
      propertyTitle: request.propertyTitle,
      createdAt: request.createdAt,
    }),
  ];

  if (normalizedStatus !== "new") {
    fallbackTimeline.push(buildVisitRequestStatusEntry(normalizedStatus, request.updatedAt));
  }

  notes.forEach((note) => {
    fallbackTimeline.push(buildVisitRequestNoteEntry(note));
  });

  const timeline = (request.timeline ?? fallbackTimeline)
    .map((entry) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title.trim(),
      description: entry.description?.trim() || undefined,
      status: entry.status ? normalizeVisitRequestStatus(entry.status) : undefined,
      noteId: entry.noteId,
      createdAt: entry.createdAt,
    }))
    .filter((entry) => entry.title)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  return {
    ...request,
    email: request.email?.trim() || null,
    status: normalizedStatus,
    notes,
    timeline,
  };
}

function buildPropertyId(existingIds: Set<string>, title: string) {
  const baseId =
    title
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "propiedad";

  let nextId = baseId;
  let suffix = 2;
  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return nextId;
}

function buildPropertyImageId(propertyId: string, existingIds: Set<string>) {
  let suffix = existingIds.size + 1;
  let nextId = `${propertyId}-image-${suffix}`;

  while (existingIds.has(nextId)) {
    suffix += 1;
    nextId = `${propertyId}-image-${suffix}`;
  }

  return nextId;
}

async function updateStoredPropertyRecord(
  slug: string,
  propertyId: string,
  updater: (property: StoredProperty) => StoredProperty,
): Promise<StoredProperty> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readStore(normalizedSlug);
  const propertyIndex = store.properties.findIndex((property) => property.id === propertyId);
  if (propertyIndex === -1) throw new Error("Property not found");

  const currentProperty = normalizeProperty(store.properties[propertyIndex]!);
  const nextProperty = normalizeProperty(updater(currentProperty));
  const nextProperties = [...store.properties];
  nextProperties[propertyIndex] = nextProperty;

  await writeStore(normalizedSlug, {
    ...store,
    properties: nextProperties,
  });

  return nextProperty;
}

export function mapStoredPropertyToPublic(property: StoredProperty): DemoProperty {
  const normalized = normalizeProperty(property);
  return {
    id: normalized.id,
    title: normalized.title,
    operation: normalized.operation,
    status: normalized.status,
    price: normalized.price,
    location: normalized.location,
    address: normalized.address,
    propertyType: normalized.propertyType,
    bedrooms: normalized.bedrooms ?? undefined,
    bathrooms: normalized.bathrooms ?? undefined,
    areaM2: normalized.areaM2 ?? undefined,
    features: normalized.features,
    description: normalized.description,
    images: sortImages(normalized.images).map((image) => image.url),
    featured: normalized.featured,
  };
}

export async function listStoredProperties(slug: string): Promise<StoredProperty[]> {
  const store = await readStore(slug);
  return [...store.properties]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((property) => normalizeProperty(property));
}

export async function getStoredProperty(slug: string, propertyId: string): Promise<StoredProperty | null> {
  const properties = await listStoredProperties(slug);
  return properties.find((property) => property.id === propertyId) ?? null;
}

export async function listPublicProperties(slug: string): Promise<DemoProperty[]> {
  const properties = await listStoredProperties(slug);
  return properties
    .filter((property) => property.status !== "hidden")
    .map(mapStoredPropertyToPublic);
}

export async function getPublicProperty(slug: string, propertyId: string): Promise<DemoProperty | null> {
  const property = await getStoredProperty(slug, propertyId);
  if (!property || property.status === "hidden") return null;
  return mapStoredPropertyToPublic(property);
}

export async function createStoredProperty(slug: string, input: PropertyMutationInput): Promise<StoredProperty> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readStore(normalizedSlug);
  const now = new Date().toISOString();
  const nextProperty = normalizeProperty({
    id: buildPropertyId(new Set(store.properties.map((property) => property.id)), input.title),
    slug: normalizedSlug,
    title: input.title.trim(),
    operation: input.operation,
    status: input.status,
    price: input.price.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    propertyType: input.propertyType.trim(),
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    areaM2: input.areaM2 ?? null,
    features: (input.features ?? []).map((feature) => feature.trim()).filter(Boolean),
    description: input.description.trim(),
    featured: Boolean(input.featured),
    images: [],
    sortOrder: store.properties.length,
    createdAt: now,
    updatedAt: now,
  });

  await writeStore(normalizedSlug, {
    ...store,
    properties: [...store.properties, nextProperty],
  });

  return nextProperty;
}

export async function updateStoredProperty(
  slug: string,
  propertyId: string,
  input: PropertyMutationInput,
): Promise<StoredProperty> {
  return updateStoredPropertyRecord(slug, propertyId, (currentProperty) => ({
    ...currentProperty,
    title: input.title.trim(),
    operation: input.operation,
    status: input.status,
    price: input.price.trim(),
    location: input.location.trim(),
    address: input.address.trim(),
    propertyType: input.propertyType.trim(),
    bedrooms: input.bedrooms ?? null,
    bathrooms: input.bathrooms ?? null,
    areaM2: input.areaM2 ?? null,
    features: (input.features ?? []).map((feature) => feature.trim()).filter(Boolean),
    description: input.description.trim(),
    featured: Boolean(input.featured),
    updatedAt: new Date().toISOString(),
  }));
}

export async function addStoredPropertyImage(
  slug: string,
  propertyId: string,
  input: PropertyImageMutationInput,
): Promise<StoredProperty> {
  const now = new Date().toISOString();

  return updateStoredPropertyRecord(slug, propertyId, (currentProperty) => {
    const nextImage: StoredPropertyImage = {
      id: buildPropertyImageId(
        currentProperty.id,
        new Set(currentProperty.images.map((image) => image.id)),
      ),
      url: input.url,
      caption: input.caption?.trim() || undefined,
      fileKey: input.fileKey,
      sortOrder: currentProperty.images.length,
      isPrimary: currentProperty.images.length === 0,
      createdAt: now,
    };

    return {
      ...currentProperty,
      images: [...currentProperty.images, nextImage],
      updatedAt: now,
    };
  });
}

export async function reorderStoredPropertyImages(
  slug: string,
  propertyId: string,
  imageIds: string[],
): Promise<StoredProperty> {
  return updateStoredPropertyRecord(slug, propertyId, (currentProperty) => {
    const currentImages = sortImages(currentProperty.images);
    if (imageIds.length !== currentImages.length) {
      throw new Error("Image list mismatch");
    }

    const imageMap = new Map(currentImages.map((image) => [image.id, image]));
    const reorderedImages = imageIds.map((imageId, index) => {
      const image = imageMap.get(imageId);
      if (!image) throw new Error("Image not found");
      return {
        ...image,
        sortOrder: index,
      };
    });

    return {
      ...currentProperty,
      images: reorderedImages,
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function setStoredPropertyPrimaryImage(
  slug: string,
  propertyId: string,
  imageId: string,
): Promise<StoredProperty> {
  return updateStoredPropertyRecord(slug, propertyId, (currentProperty) => {
    if (!currentProperty.images.find((image) => image.id === imageId)) {
      throw new Error("Image not found");
    }

    return {
      ...currentProperty,
      images: currentProperty.images.map((image) => ({
        ...image,
        isPrimary: image.id === imageId,
      })),
      updatedAt: new Date().toISOString(),
    };
  });
}

export async function deleteStoredPropertyImage(
  slug: string,
  propertyId: string,
  imageId: string,
): Promise<StoredProperty> {
  let deletedFileKey: string | undefined;

  const updatedProperty = await updateStoredPropertyRecord(slug, propertyId, (currentProperty) => {
    const deletedImage = currentProperty.images.find((image) => image.id === imageId);
    if (!deletedImage) throw new Error("Image not found");
    deletedFileKey = deletedImage.fileKey;

    return {
      ...currentProperty,
      images: currentProperty.images.filter((image) => image.id !== imageId),
      updatedAt: new Date().toISOString(),
    };
  });

  if (deletedFileKey) {
    await storageDelete(deletedFileKey);
  }

  return updatedProperty;
}

export async function listStoredVisitRequests(slug: string): Promise<StoredVisitRequest[]> {
  const store = await readVisitRequestStore(slug);
  return [...store.requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getStoredVisitRequest(
  slug: string,
  requestId: string,
): Promise<StoredVisitRequest | null> {
  const requests = await listStoredVisitRequests(slug);
  return requests.find((request) => request.id === requestId) ?? null;
}

async function updateStoredVisitRequestRecord(
  slug: string,
  requestId: string,
  updater: (request: StoredVisitRequest) => StoredVisitRequest,
): Promise<StoredVisitRequest> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readVisitRequestStore(normalizedSlug);
  const requestIndex = store.requests.findIndex((request) => request.id === requestId);

  if (requestIndex === -1) {
    throw new Error("Visit request not found");
  }

  const currentRequest = normalizeVisitRequest(store.requests[requestIndex]!);
  const nextRequest = normalizeVisitRequest(updater(currentRequest));
  const nextRequests = [...store.requests];
  nextRequests[requestIndex] = nextRequest;

  await writeVisitRequestStore(normalizedSlug, {
    ...store,
    requests: nextRequests,
  });

  return nextRequest;
}

export async function createStoredVisitRequest(
  slug: string,
  input: VisitRequestMutationInput,
): Promise<StoredVisitRequest> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readVisitRequestStore(normalizedSlug);
  const now = new Date().toISOString();

  const nextRequest: StoredVisitRequest = {
    id: buildVisitRequestId(),
    reference: buildVisitRequestReference(),
    slug: normalizedSlug,
    propertyId: input.propertyId,
    propertyTitle: input.propertyTitle.trim(),
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    email: input.email?.trim() || null,
    message: input.message.trim(),
    status: "new",
    notes: [],
    timeline: [],
    createdAt: now,
    updatedAt: now,
  };

  nextRequest.timeline = [
    buildVisitRequestCreatedEntry({
      name: nextRequest.name,
      propertyTitle: nextRequest.propertyTitle,
      createdAt: now,
    }),
  ];

  await writeVisitRequestStore(normalizedSlug, {
    ...store,
    requests: [nextRequest, ...store.requests],
  });

  return nextRequest;
}

export async function updateStoredVisitRequestStatus(
  slug: string,
  requestId: string,
  status: StoredVisitRequestStatus,
): Promise<StoredVisitRequest> {
  return updateStoredVisitRequestRecord(slug, requestId, (currentRequest) => {
    if (currentRequest.status === status) {
      return currentRequest;
    }

    const now = new Date().toISOString();
    return {
      ...currentRequest,
      status,
      updatedAt: now,
      timeline: [
        ...currentRequest.timeline,
        buildVisitRequestStatusEntry(status, now),
      ],
    };
  });
}

export async function addStoredVisitRequestNote(
  slug: string,
  requestId: string,
  text: string,
): Promise<StoredVisitRequest> {
  return updateStoredVisitRequestRecord(slug, requestId, (currentRequest) => {
    const now = new Date().toISOString();
    const nextNote: StoredVisitRequestNote = {
      id: buildVisitRequestNoteId(),
      text: text.trim(),
      createdAt: now,
    };

    return {
      ...currentRequest,
      updatedAt: now,
      notes: [nextNote, ...currentRequest.notes],
      timeline: [
        ...currentRequest.timeline,
        buildVisitRequestNoteEntry(nextNote),
      ],
    };
  });
}

export async function getStoredBusinessImageOverrides(slug: string) {
  const store = await readBusinessMediaStore(slug);
  return { ...store.fields };
}

export async function setStoredBusinessImage(
  slug: string,
  field: StoredBusinessImageField,
  asset: { url: string; fileKey?: string },
) {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readBusinessMediaStore(normalizedSlug);
  const currentAsset = store.fields[field];

  if (
    currentAsset &&
    currentAsset.fileKey &&
    currentAsset.fileKey !== asset.fileKey
  ) {
    await storageDelete(currentAsset.fileKey);
  }

  const nextAsset: StoredBusinessImageAsset = {
    url: asset.url,
    fileKey: asset.fileKey,
    updatedAt: new Date().toISOString(),
  };

  await writeBusinessMediaStore(normalizedSlug, {
    ...store,
    fields: {
      ...store.fields,
      [field]: nextAsset,
    },
  });

  return nextAsset;
}

export async function removeStoredBusinessImage(
  slug: string,
  field: StoredBusinessImageField,
) {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readBusinessMediaStore(normalizedSlug);
  const currentAsset = store.fields[field];

  if (currentAsset && currentAsset.fileKey) {
    await storageDelete(currentAsset.fileKey);
  }

  await writeBusinessMediaStore(normalizedSlug, {
    ...store,
    fields: {
      ...store.fields,
      [field]: null,
    },
  });

  return { success: true } as const;
}

export async function initializeRealEstateTenant(slug: string) {
  const normalizedSlug = normalizeSlug(slug);
  await Promise.all([
    readStore(normalizedSlug),
    readVisitRequestStore(normalizedSlug),
    readBusinessMediaStore(normalizedSlug),
  ]);

  return { slug: normalizedSlug } as const;
}

export function buildStoredLocalAdminOpenId(slug: string) {
  return `local-admin:${normalizeSlug(slug)}`;
}

export async function getStoredBusinessProfile(slug: string): Promise<BusinessProfile | null> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readBusinessProfileStore(normalizedSlug);

  if (store) {
    return store.profile;
  }

  if (normalizedSlug === normalizeSlug(realEstateProfile.slug)) {
    return buildDemoStoredBusinessProfile();
  }

  return null;
}

export async function upsertStoredBusinessProfile(
  slug: string,
  input: Partial<BusinessProfile>,
): Promise<BusinessProfile> {
  const normalizedSlug = normalizeSlug(slug);
  const existingProfile = await getStoredBusinessProfile(normalizedSlug);
  const baseProfile =
    existingProfile ??
    buildStoredBusinessProfileFromSource(normalizedSlug, {
      businessName: input.businessName?.trim() || "Mi inmobiliaria",
      address: input.address?.trim() || "",
    });

  const nextProfile = buildStoredBusinessProfileFromSource(normalizedSlug, {
    ...baseProfile,
    ...input,
    slug: normalizedSlug,
    businessName: input.businessName?.trim() || baseProfile.businessName,
    updatedAt: new Date(),
  });

  await writeBusinessProfileStore(normalizedSlug, nextProfile);
  return nextProfile;
}

export async function getStoredLocalAdminCredentialByEmail(email: string) {
  const store = await readLocalAdminCredentialStore();
  const normalizedEmail = email.trim().toLowerCase();
  return store.credentials.find((credential) => credential.email === normalizedEmail) ?? null;
}

export async function getStoredLocalAdminCredentialByOpenId(openId: string) {
  const store = await readLocalAdminCredentialStore();
  return store.credentials.find((credential) => credential.openId === openId) ?? null;
}

export async function listStoredBusinessDirectoryEntries(): Promise<StoredBusinessDirectoryEntry[]> {
  const store = await readBusinessDirectoryStore();
  return [...store.entries];
}

export async function isStoredBusinessArchived(slug: string): Promise<boolean> {
  const normalizedSlug = normalizeSlug(slug);
  const store = await readBusinessDirectoryStore();
  const entry = store.entries.find((item) => item.slug === normalizedSlug);
  return Boolean(entry?.archivedAt);
}

export async function setStoredBusinessArchivedState(input: {
  slug: string;
  businessName?: string;
  archived: boolean;
}) {
  const normalizedSlug = normalizeSlug(input.slug);
  const store = await readBusinessDirectoryStore();
  const now = new Date().toISOString();
  const existingIndex = store.entries.findIndex((entry) => entry.slug === normalizedSlug);
  const previousEntry = existingIndex >= 0 ? store.entries[existingIndex]! : null;

  const nextEntry: StoredBusinessDirectoryEntry = {
    slug: normalizedSlug,
    businessName:
      input.businessName?.trim() ||
      previousEntry?.businessName ||
      normalizedSlug,
    archivedAt: input.archived ? previousEntry?.archivedAt ?? now : null,
    updatedAt: now,
  };

  const nextEntries = [...store.entries];
  if (existingIndex >= 0) {
    nextEntries[existingIndex] = nextEntry;
  } else {
    nextEntries.push(nextEntry);
  }

  await writeBusinessDirectoryStore({
    ...store,
    entries: nextEntries,
  });

  return nextEntry;
}

export async function setStoredLocalAdminCredential(input: {
  slug: string;
  email: string;
  passwordHash: string;
}) {
  const store = await readLocalAdminCredentialStore();
  const normalizedSlug = normalizeSlug(input.slug);
  const normalizedEmail = input.email.trim().toLowerCase();

  const duplicateEmail = store.credentials.find(
    (credential) =>
      credential.email === normalizedEmail && credential.slug !== normalizedSlug,
  );
  if (duplicateEmail) {
    throw new Error("Ese email admin ya existe");
  }

  const now = new Date().toISOString();
  const openId = buildStoredLocalAdminOpenId(normalizedSlug);
  const existingIndex = store.credentials.findIndex(
    (credential) => credential.slug === normalizedSlug,
  );

  const nextCredential: StoredLocalAdminCredential = {
    slug: normalizedSlug,
    openId,
    email: normalizedEmail,
    passwordHash: input.passwordHash,
    createdAt:
      existingIndex >= 0 ? store.credentials[existingIndex]!.createdAt : now,
    updatedAt: now,
  };

  const nextCredentials = [...store.credentials];
  if (existingIndex >= 0) {
    nextCredentials[existingIndex] = nextCredential;
  } else {
    nextCredentials.push(nextCredential);
  }

  await writeLocalAdminCredentialStore({
    ...store,
    credentials: nextCredentials,
  });

  return nextCredential;
}

export async function createStoredBusinessPage(input: {
  businessName: string;
  slug: string;
  city: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  description?: string;
  adminEmail: string;
  passwordHash: string;
}) {
  const normalizedSlug = normalizeSlug(input.slug);
  if (!normalizedSlug) {
    throw new Error("El slug es obligatorio");
  }

  if (normalizedSlug === normalizeSlug(realEstateProfile.slug)) {
    throw new Error("Ese slug ya existe");
  }

  const existingProfile = await readBusinessProfileStore(normalizedSlug);
  if (existingProfile) {
    throw new Error("Ese slug ya existe");
  }

  const existingCredential = await getStoredLocalAdminCredentialByEmail(input.adminEmail);
  if (existingCredential) {
    throw new Error("Ese email admin ya existe");
  }

  const profile = buildStoredBusinessProfileFromSource(normalizedSlug, {
    businessName: input.businessName.trim(),
    whatsapp: input.whatsapp?.trim() || "",
    email: input.email?.trim() || "",
    address: input.address?.trim() || input.city.trim(),
    description:
      input.description?.trim() ||
      `Inmobiliaria enfocada en propiedades de ${input.city.trim()}.`,
    tagline: `Propiedades en venta y alquiler en ${input.city.trim()}.`,
  });

  await writeBusinessProfileStore(normalizedSlug, profile);
  const credential = await setStoredLocalAdminCredential({
    slug: normalizedSlug,
    email: input.adminEmail,
    passwordHash: input.passwordHash,
  });
  await initializeRealEstateTenant(normalizedSlug);
  await setStoredBusinessArchivedState({
    slug: normalizedSlug,
    businessName: input.businessName.trim(),
    archived: false,
  });

  return {
    profile,
    credential,
  };
}

export async function listStoredBusinessProfiles(): Promise<BusinessProfile[]> {
  ensureUploadsDir();
  const baseDir = path.join(process.cwd(), "uploads", "real-estate");

  let entries: fs.Dirent[] = [];
  try {
    entries = await fs.promises.readdir(baseDir, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const profiles: BusinessProfile[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const profile = await getStoredBusinessProfile(entry.name);
    if (profile) {
      profiles.push(profile);
    }
  }

  return profiles.sort((left, right) =>
    left.businessName.localeCompare(right.businessName),
  );
}
