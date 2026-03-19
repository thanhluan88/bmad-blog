import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth, requirePostOwnership } from "@/lib/rbac";
import { db } from "@/lib/db";
import { PostEditorForm } from "./PostEditorForm";

export default async function AdminPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const authResult = await requireAuth();
  if (!authResult) redirect("/admin/login");
  const { user } = authResult;

  const ownershipResult = await requirePostOwnership(user, id);
  if ("response" in ownershipResult) {
    if (ownershipResult.response.status === 404) notFound();
    redirect("/admin/posts");
  }

  const post = await db.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      contentMd: true,
      updatedAt: true,
      coverImageUrl: true,
      coverObject: true,
    },
  });
  if (!post) notFound();

  const postData = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    status: post.status,
    contentMd: post.contentMd,
    updatedAt: post.updatedAt,
    coverImageUrl: post.coverImageUrl,
    coverObject: post.coverObject,
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Edit post
        </h1>
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to posts
        </Link>
      </div>

      <PostEditorForm post={postData} />
    </div>
  );
}
