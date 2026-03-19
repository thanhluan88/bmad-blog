import { Storage } from "@google-cloud/storage";

const DEFAULT_EXPIRES_IN_SECONDS = 900; // 15 minutes

const storage = new Storage();

export type GenerateSignedUploadUrlParams = {
  bucket: string;
  objectPath: string;
  contentType: string;
  expiresInSeconds?: number;
};

export type GenerateSignedUploadUrlResult = {
  uploadUrl: string;
  publicUrl: string;
};

/**
 * Generates a GCS V4 signed URL for direct client upload (write action).
 * Returns uploadUrl (client PUTs here) and publicUrl (for coverImageUrl).
 * Never log signed URLs or secrets.
 */
export async function generateSignedUploadUrl(
  params: GenerateSignedUploadUrlParams
): Promise<GenerateSignedUploadUrlResult> {
  const {
    bucket,
    objectPath,
    contentType,
    expiresInSeconds = DEFAULT_EXPIRES_IN_SECONDS,
  } = params;

  const file = storage.bucket(bucket).file(objectPath);

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + expiresInSeconds * 1000,
    contentType,
  });

  const publicUrl = `https://storage.googleapis.com/${bucket}/${objectPath}`;

  return { uploadUrl, publicUrl };
}

/**
 * Builds object path for cover upload: covers/{postId}/{timestamp}-{sanitizedFilename}
 */
export function buildCoverObjectPath(
  postId: string,
  filename: string
): string {
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
