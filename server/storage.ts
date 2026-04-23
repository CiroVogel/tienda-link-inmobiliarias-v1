import fs from "fs";
import path from "path";
import {
  ensureUploadsDir,
  getUploadDiskPath,
  getUploadPublicUrl,
} from "./uploads";

function toBuffer(data: Buffer | Uint8Array | string) {
  if (typeof data === "string") {
    return Buffer.from(data);
  }

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

  return {
    key,
    url: getUploadPublicUrl(key),
  };
}

export async function storageGet(relKey: string) {
  const { key } = getUploadDiskPath(relKey);

  return {
    key,
    url: getUploadPublicUrl(key),
  };
}
