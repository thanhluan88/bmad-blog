import type { PrismaClient } from "@prisma/client";
import {
  PMP_EXAM_LATEST_SLUG,
  PMP_QUIZ_SLUG,
} from "@/lib/pmp-quiz";

export const PMP_POST_TITLE = "PMP Full Questions — Luyện tập trắc nghiệm";
export const PMP_EXAM_LATEST_POST_TITLE =
  "PMP Exam Latest — Luyện tập trắc nghiệm (ExamTopics)";

export const PMP_POST_CONTENT_MD = "PMP quiz.";
export const PMP_EXAM_LATEST_POST_CONTENT_MD =
  "PMP Exam Latest — 1417 câu từ ExamTopics (PMP Exam - Lasted version 1).";

async function upsertQuizPost(
  db: PrismaClient,
  slug: string,
  title: string,
  contentMd: string,
  authorId: string,
  authorEmail: string,
) {
  const existing = await db.post.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (existing) {
    await db.post.update({
      where: { id: existing.id },
      data: {
        title,
        contentMd,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
    console.log(`Updated PMP post: /p/${slug}`);
    return;
  }

  await db.post.create({
    data: {
      title,
      slug,
      contentMd,
      status: "PUBLISHED",
      authorId,
      publishedAt: new Date(),
    },
  });

  console.log(`Created PMP post: /p/${slug} (author: ${authorEmail})`);
}

export async function seedPmpPost(db: PrismaClient) {
  const admin = await db.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  if (!admin) {
    console.log("Skip PMP post seed: no ADMIN user.");
    return;
  }

  await upsertQuizPost(
    db,
    PMP_QUIZ_SLUG,
    PMP_POST_TITLE,
    PMP_POST_CONTENT_MD,
    admin.id,
    admin.email,
  );

  await upsertQuizPost(
    db,
    PMP_EXAM_LATEST_SLUG,
    PMP_EXAM_LATEST_POST_TITLE,
    PMP_EXAM_LATEST_POST_CONTENT_MD,
    admin.id,
    admin.email,
  );
}
