import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePostOwnership, unauthorizedResponse } from "@/lib/rbac";
import { uploadCoverToBlob, buildCoverObjectPath } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB (Vercel has 4.5MB request limit)
const POST_ID_SAFE_REGEX = /^[a-zA-Z0-9_-]+$/;

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult) return unauthorizedResponse();

  const { user } = authResult;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[uploads/cover] Missing BLOB_READ_WRITE_TOKEN", {
      route: "/api/uploads/cover",
      errorCode: "CONFIG_ERROR",
    });
    return NextResponse.json(
      { error: { code: "CONFIG_ERROR", message: "Upload not configured" } },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Invalid form data" } },
      { status: 422 }
    );
  }

  const postId = formData.get("postId");
  const file = formData.get("file");

  if (typeof postId !== "string" || !postId.trim()) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Post ID is required" } },
      { status: 422 }
    );
  }

  if (!POST_ID_SAFE_REGEX.test(postId)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid post ID format" } },
      { status: 422 }
    );
  }

  const ownershipResult = await requirePostOwnership(user, postId);
  if ("response" in ownershipResult) return ownershipResult.response;

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "File is required" } },
      { status: 422 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `File type must be one of: ${ALLOWED_TYPES.join(", ")}`,
        },
      },
      { status: 422 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: `File size must not exceed ${MAX_SIZE_BYTES / 1024 / 1024}MB`,
        },
      },
      { status: 422 }
    );
  }

  const objectPath = buildCoverObjectPath(postId, file.name);

  let body: ArrayBuffer;
  try {
    body = await file.arrayBuffer();
  } catch {
    return NextResponse.json(
      { error: { code: "STORAGE_ERROR", message: "Failed to read file" } },
      { status: 500 }
    );
  }

  try {
    const { objectPath: storedPath, publicUrl } = await uploadCoverToBlob(
      body,
      objectPath,
      file.type,
      token
    );

    return NextResponse.json({
      objectPath: storedPath,
      publicUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[uploads/cover] Blob upload error", {
      route: "/api/uploads/cover",
      errorCode: "STORAGE_ERROR",
      postId,
      message: msg,
    });
    return NextResponse.json(
      {
        error: {
          code: "STORAGE_ERROR",
          message: "Unable to upload file",
          details: process.env.NODE_ENV === "development" ? msg : undefined,
        },
      },
      { status: 500 }
    );
  }
}
