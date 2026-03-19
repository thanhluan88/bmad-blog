import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/** Session user shape from auth() */
export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

/**
 * Standard error shape per architecture.
 * Use in route handlers for 401/403/404 responses.
 */
export function unauthorizedResponse(
  message = "Authentication required"
): NextResponse {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}

export function forbiddenResponse(
  message = "Forbidden"
): NextResponse {
  return NextResponse.json(
    { error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}

export function notFoundResponse(
  message = "Not found"
): NextResponse {
  return NextResponse.json(
    { error: { code: "NOT_FOUND", message } },
    { status: 404 }
  );
}

/**
 * Requires authentication. Returns user or null.
 * Caller should return unauthorizedResponse() when null.
 *
 * @example
 * const authResult = await requireAuth();
 * if (!authResult) return unauthorizedResponse();
 * const { user } = authResult;
 */
export async function requireAuth(): Promise<{
  user: SessionUser;
} | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? "",
      role: session.user.role ?? "",
    },
  };
}

/**
 * Requires user to have ADMIN role.
 * Returns true if authorized; returns NextResponse (403) if not.
 *
 * @example
 * const roleResult = requireRole(user, "ADMIN");
 * if (roleResult !== true) return roleResult;
 */
export function requireRole(
  user: SessionUser,
  role: "ADMIN"
): true | NextResponse {
  if (user.role === "ADMIN") return true;
  return forbiddenResponse("Admin role required");
}

/**
 * Requires user to own the post (or be ADMIN).
 * Returns { post } if authorized; returns { response } (404 or 403) if not.
 *
 * @example
 * const result = await requirePostOwnership(user, postId);
 * if ("response" in result) return result.response;
 * const { post } = result;
 */
export async function requirePostOwnership(
  user: SessionUser,
  postId: string
): Promise<
  | { post: { id: string; authorId: string; [key: string]: unknown } }
  | { response: NextResponse }
> {
  let post;
  try {
    post = await db.post.findUnique({ where: { id: postId } });
  } catch (err) {
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[requirePostOwnership] DB error", { postId, userId: user.id });
    return {
      response: NextResponse.json(
        { error: { code: "INTERNAL_ERROR", message: "An error occurred" } },
        { status: 500 }
      ),
    };
  }
  if (!post) return { response: notFoundResponse("Post not found") };
  if (user.role === "ADMIN") return { post };
  if (post.authorId !== user.id) return { response: forbiddenResponse() };
  return { post };
}
