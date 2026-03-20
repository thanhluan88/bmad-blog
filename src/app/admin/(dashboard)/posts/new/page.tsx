import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";

export default async function AdminPostsNewPage() {
  const authResult = await requireAuth();
  if (!authResult) redirect("/admin/login");
  const { user } = authResult;

  try {
    const post = await db.post.create({
      data: {
        title: "無題",
        slug: `draft-${randomUUID().replace(/-/g, "").slice(0, 8)}`,
        contentMd: "",
        status: "DRAFT",
        authorId: user.id,
      },
    });
    redirect(`/admin/posts/${post.id}/edit`);
  } catch {
    redirect("/admin/posts?error=create_failed");
  }
}
