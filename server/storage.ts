import fs from "fs";
import path from "path";
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

const STORE_VERSION = 1 as const;

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function buildStoreKey(slug: string) {
  return `real-estate/${normalizeSlug(slug)}/properties.json`;
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
