import { put } from "@vercel/blob";

/**
 * Builds object path for cover upload: covers/{postId}/{timestamp}-{sanitizedFilename}
 */
export function buildCoverObjectPath(postId: string, filename: string): string {
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "image";
  const ext = sanitized.includes(".") ? sanitized.slice(sanitized.lastIndexOf(".")) : "";
  const base = sanitized.includes(".") ? sanitized.slice(0, sanitized.lastIndexOf(".")) : sanitized;
  const timestamp = Date.now();
  const safeFilename = `${base}-${timestamp}${ext}`;
  return `covers/${postId}/${safeFilename}`;
}

export type UploadCoverResult = {
  objectPath: string;
  publicUrl: string;
};

/**
 * Uploads a cover image to Vercel Blob.
 * Requires BLOB_READ_WRITE_TOKEN in env (set when Blob store is created in Vercel).
 */
export async function uploadCoverToBlob(
  body: Blob | ArrayBuffer | ReadableStream,
  pathname: string,
  contentType: string
): Promise<UploadCoverResult> {
  const blob = await put(pathname, body, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return {
    objectPath: blob.pathname,
    publicUrl: blob.url,
  };
}
