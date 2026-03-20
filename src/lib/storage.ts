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
 * Requires BLOB_READ_WRITE_TOKEN (passed explicitly for serverless reliability).
 */
export async function uploadCoverToBlob(
  body: Blob | ArrayBuffer | ReadableStream,
  pathname: string,
  contentType: string,
  token: string
): Promise<UploadCoverResult> {
  const blob = await put(pathname, body, {
    access: "private",
    contentType,
    addRandomSuffix: true,
    token,
    multipart: true, // Better for larger files on serverless
  });

  // Private store: serve via proxy route (blob.url requires auth)
  const publicUrl = `/api/blob?pathname=${encodeURIComponent(blob.pathname)}`;

  return {
    objectPath: blob.pathname,
    publicUrl,
  };
}
