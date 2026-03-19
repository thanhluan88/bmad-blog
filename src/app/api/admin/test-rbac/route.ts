import { requireAuth, requireRole, unauthorizedResponse } from "@/lib/rbac";

/**
 * GET /api/admin/test-rbac
 * Verifies RBAC helpers. Requires authenticated user with ADMIN role.
 * Returns 200 { ok: true } if authorized; 401 or 403 otherwise.
 */
export async function GET() {
  const authResult = await requireAuth();
  if (!authResult) return unauthorizedResponse();

  const roleResult = requireRole(authResult.user, "ADMIN");
  if (roleResult !== true) return roleResult;

  return Response.json({ ok: true });
}
