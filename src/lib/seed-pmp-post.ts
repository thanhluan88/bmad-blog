import type { PrismaClient } from "@prisma/client";
import { PMP_QUIZ_SLUG } from "@/lib/pmp-quiz";

export const PMP_POST_TITLE = "PMP Full Questions — Luyện tập trắc nghiệm";

export const PMP_POST_CONTENT_MD = "PMP quiz.";

export async function seedPmpPost(db: PrismaClient) {
  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  if (!admin) {
    console.log("Skip PMP post seed: no ADMIN user.");
    return;
  }

  const existing = await db.post.findUnique({
    where: { slug: PMP_QUIZ_SLUG },
    select: { id: true },
  });

  if (existing) {
    await db.post.update({
      where: { id: existing.id },
      data: {
        title: PMP_POST_TITLE,
        contentMd: PMP_POST_CONTENT_MD,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    console.log(`Updated PMP post: /p/${PMP_QUIZ_SLUG}`);
    return;
  }

  await db.post.create({
    data: {
      title: PMP_POST_TITLE,
      slug: PMP_QUIZ_SLUG,
      contentMd: PMP_POST_CONTENT_MD,
      status: "PUBLISHED",
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  console.log(`Created PMP post: /p/${PMP_QUIZ_SLUG} (author: ${admin.email})`);
}
