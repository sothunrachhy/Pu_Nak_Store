"use server";

import { put, del } from "@vercel/blob";
import { requireAuth } from "@/lib/auth";
import { isOurBlobUrl } from "@/lib/blobUrl";

const MAX_IMAGE_BYTES = 2_000_000; // ~2MB, well above our resized client-side images
const SAFE_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadItemImage(dataUrl: string): Promise<string> {
  await requireAuth();

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image");
  const [, contentType, base64] = match;
  const ext = SAFE_CONTENT_TYPES[contentType];
  if (!ext) throw new Error("Invalid image");

  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_IMAGE_BYTES) throw new Error("Image is too large");

  const blob = await put(`items/${crypto.randomUUID()}.${ext}`, buffer, {
    access: "public",
    contentType,
  });

  return blob.url;
}

export async function deleteItemImage(url: string) {
  await requireAuth();
  if (!isOurBlobUrl(url)) return;
  await del(url).catch(() => {});
}
