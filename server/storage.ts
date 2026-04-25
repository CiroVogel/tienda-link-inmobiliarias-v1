import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
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
