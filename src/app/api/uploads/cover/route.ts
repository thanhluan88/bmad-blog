import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requirePostOwnership, unauthorizedResponse } from "@/lib/rbac";
import {
  requestSignedUploadSchema,
  type RequestSignedUploadInput,
} from "@/lib/validation";
import {
  generateSignedUploadUrl,
  buildCoverObjectPath,
} from "@/lib/storage";

export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult) return unauthorizedResponse();

  const { user } = authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Invalid JSON body" } },
      { status: 422 }
    );
  }

  const parsed = requestSignedUploadSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      field: issue.path.join(".") || "body",
      message: issue.message,
    }));
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: errors,
        },
      },
      { status: 422 }
    );
  }

  const { postId, filename, contentType } = parsed.data as RequestSignedUploadInput;

  const ownershipResult = await requirePostOwnership(user, postId);
  if ("response" in ownershipResult) return ownershipResult.response;

  const bucket = process.env.GCS_BUCKET;
  if (!bucket) {
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[uploads/cover] Missing GCS_BUCKET", {
      route: "/api/uploads/cover",
      errorCode: "CONFIG_ERROR",
    });
    return NextResponse.json(
      { error: { code: "CONFIG_ERROR", message: "Upload not configured" } },
      { status: 500 }
    );
  }

  const objectPath = buildCoverObjectPath(postId, filename);

  try {
    const { uploadUrl, publicUrl } = await generateSignedUploadUrl({
      bucket,
      objectPath,
      contentType,
    });

    return NextResponse.json({
      uploadUrl,
      objectPath,
      publicUrl,
    });
  } catch {
    console.error("[uploads/cover] GCS error", {
      route: "/api/uploads/cover",
      errorCode: "STORAGE_ERROR",
      postId,
    });
    return NextResponse.json(
      { error: { code: "STORAGE_ERROR", message: "Unable to generate upload URL" } },
      { status: 500 }
    );
  }
}
