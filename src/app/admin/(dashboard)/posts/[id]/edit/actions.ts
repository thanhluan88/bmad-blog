"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAuth, requirePostOwnership } from "@/lib/rbac";
import { db } from "@/lib/db";
import { draftPostSchema, publishPostSchema, slugSchema } from "@/lib/validation";

export type FormState = {
  success?: boolean;
  code?: string;
  errors?: { title?: string; slug?: string; contentMd?: string };
};

export async function updateDraftPost(
  postId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const authResult = await requireAuth();
  if (!authResult) return { success: false, errors: { title: "ログインが必要です" } };

  const { user } = authResult;

  const ownershipResult = await requirePostOwnership(user, postId);
  if ("response" in ownershipResult) {
    return { success: false, errors: { title: "アクセスが拒否されました" } };
  }

  const raw = {
    title: (formData.get("title") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    contentMd: (formData.get("contentMd") as string) ?? "",
    coverObject: (formData.get("coverObject") as string) || undefined,
    coverImageUrl: (formData.get("coverImageUrl") as string) || undefined,
  };

  const parsed = draftPostSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: FormState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as keyof typeof fieldErrors;
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  const { title, slug, contentMd } = parsed.data;
  const coverObject = raw.coverObject || null;
  const coverImageUrl = raw.coverImageUrl || null;

  try {
    const existing = await db.post.findFirst({
      where: { slug, NOT: { id: postId } },
    });
    if (existing) {
      return { success: false, code: "SLUG_TAKEN", errors: { slug: "このスラッグは既に使用されています" } };
    }

    await db.post.update({
      where: { id: postId },
      data: { title, slug, contentMd, coverObject, coverImageUrl },
    });

    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePath("/admin/posts");
    return { success: true };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, code: "SLUG_TAKEN", errors: { slug: "このスラッグは既に使用されています" } };
    }
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[admin/posts/edit] DB error", { route: "admin/posts/edit", errorCode: "DB_ERROR" });
    return { success: false, errors: { title: "保存できませんでした。もう一度お試しください。" } };
  }
}

export type SlugCheckResult =
  | { available: true }
  | { available: false; invalidFormat: true }
  | { available: false; suggested: string[] };

export async function checkSlugAvailability(
  slug: string,
  excludePostId?: string
): Promise<SlugCheckResult> {
  const authResult = await requireAuth();
  if (!authResult) return { available: false, invalidFormat: true };

  const parsed = slugSchema.safeParse(slug);
  if (!parsed.success) {
    return { available: false, invalidFormat: true };
  }
  const normalizedSlug = parsed.data;

  const existing = await db.post.findFirst({
    where: {
      slug: normalizedSlug,
      ...(excludePostId ? { NOT: { id: excludePostId } } : {}),
    },
  });

  if (!existing) {
    return { available: true };
  }

  const suggested: string[] = [];
  for (let i = 1; i <= 5; i++) {
    const candidate = `${normalizedSlug}-${i}`;
    const taken = await db.post.findFirst({
      where: {
        slug: candidate,
        ...(excludePostId ? { NOT: { id: excludePostId } } : {}),
      },
    });
    if (!taken) {
      suggested.push(candidate);
      if (suggested.length >= 2) break;
    }
  }
  return { available: false, suggested: suggested.length > 0 ? suggested : [normalizedSlug + "-1"] };
}

export type PublishResult =
  | { success: true; slug: string }
  | { success: false; errors?: { title?: string; slug?: string; contentMd?: string } };

export async function publishPost(
  postId: string,
  data: {
    title: string;
    slug: string;
    contentMd: string;
    coverObject?: string | null;
    coverImageUrl?: string | null;
  }
): Promise<PublishResult> {
  const authResult = await requireAuth();
  if (!authResult) return { success: false, errors: { title: "ログインが必要です" } };

  const ownershipResult = await requirePostOwnership(authResult.user, postId);
  if ("response" in ownershipResult) {
    return { success: false, errors: { title: "アクセスが拒否されました" } };
  }

  const parsed = publishPostSchema.safeParse(data);
  if (!parsed.success) {
    const fieldErrors: { title?: string; slug?: string; contentMd?: string } = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] as "title" | "slug" | "contentMd";
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  const { title, slug, contentMd } = parsed.data;
  const coverObject = data.coverObject?.trim() || null;
  const coverImageUrl = data.coverImageUrl?.trim() || null;

  try {
    const existing = await db.post.findFirst({
      where: { slug, NOT: { id: postId } },
    });
    if (existing) {
      return { success: false, errors: { slug: "Slug already in use" } };
    }

    await db.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        contentMd,
        coverObject,
        coverImageUrl,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });

    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePath("/admin/posts");
    revalidatePath("/");
    revalidatePath(`/p/${slug}`);
    return { success: true, slug };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, errors: { slug: "Slug already in use" } };
    }
    return { success: false, errors: { title: "公開できませんでした。もう一度お試しください。" } };
  }
}

export async function unpublishPost(postId: string): Promise<{ success: boolean; error?: string }> {
  const authResult = await requireAuth();
  if (!authResult) return { success: false, error: "Authentication required" };

  const ownershipResult = await requirePostOwnership(authResult.user, postId);
  if ("response" in ownershipResult) {
    return { success: false, error: "Access denied" };
  }

  try {
    const post = await db.post.findUnique({ where: { id: postId }, select: { slug: true } });
    await db.post.update({
      where: { id: postId },
      data: { status: "DRAFT" },
    });

    revalidatePath(`/admin/posts/${postId}/edit`);
    revalidatePath("/admin/posts");
    revalidatePath("/");
    if (post?.slug) revalidatePath(`/p/${post.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Unable to unpublish. Please try again." };
  }
}
