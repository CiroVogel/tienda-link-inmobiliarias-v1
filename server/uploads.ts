import fs from "fs";
import path from "path";

export const UPLOADS_PUBLIC_PREFIX = "/uploads";

function resolveUploadsDir() {
  const explicitUploadsDir = process.env.UPLOADS_DIR?.trim();
  if (explicitUploadsDir) {
    return path.resolve(explicitUploadsDir);
  }

  const railwayVolumeMountPath = process.env.RAILWAY_VOLUME_MOUNT_PATH?.trim();
  if (railwayVolumeMountPath) {
    return path.resolve(railwayVolumeMountPath);
  }

  return path.resolve(process.cwd(), "uploads");
}

export const UPLOADS_DIR = resolveUploadsDir();

export function ensureUploadsDir() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function normalizeUploadKey(relKey: string) {
  const normalized = relKey.replace(/\\/g, "/");
  const safe = path.posix
    .normalize(normalized)
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..")
    .join("/");

  if (!safe) {
    throw new Error("Invalid storage key");
  }

  return safe;
}

export function getUploadDiskPath(relKey: string) {
  const key = normalizeUploadKey(relKey);
  const diskPath = path.resolve(UPLOADS_DIR, key);

  if (diskPath !== UPLOADS_DIR && !diskPath.startsWith(`${UPLOADS_DIR}${path.sep}`)) {
    throw new Error("Invalid storage path");
  }

  return { key, diskPath };
}

export function getUploadPublicUrl(relKey: string) {
  const key = normalizeUploadKey(relKey);
  const encodedKey = key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${UPLOADS_PUBLIC_PREFIX}/${encodedKey}`;
}