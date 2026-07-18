import type { PrismaClient } from "@prisma/client";
import {
  PMP_EXAM_LATEST_SLUG,
  PMP_HUB_SLUG,
  PMP_MINDSET_SLUG,
  PMP_QUIZ_SLUG,
} from "@/lib/pmp-quiz";

export const PMP_HUB_POST_TITLE = "PMP — Luyện tập trắc nghiệm";
export const PMP_HUB_POST_CONTENT_MD = `Trang này giúp bạn chọn bộ đề PMP phù hợp. Mỗi bộ đề chạy riêng; thống kê **Đã làm / Sai** và chế độ **Ôn câu sai** được lưu theo **tên người dùng** (không dùng chung giữa hai bộ).

## Bài giảng PMP

Trước khi drill hàng trăm câu, nên đọc:

- **[Bài giảng PMP — PMBOK 8](/pmp/pmp-exam-prep-lecture.html)** (bộ Full 1.123 câu): format đề thi, 7 Domains, 6 Principles, Practice & Patterns Full Bank.
- **[Index bài giảng Full Bank (1.123 câu)](/pmp/pmp-teach-full-series-index.html)** — mỗi câu có phân tích PMBOK 8, quiz, flashcard và cheat sheet.
- **[50 exam mindset principles](/pmp/pmp-teach-50-principles.html)** — heuristics chọn đáp án tình huống (FIRST/NEXT, CR, PO backlog, servant leader…).
- **[Pattern Full Bank (26+other)](/pmp/pmp-teach-full-bank-patterns.html)** — trap-pattern PMI trên toàn bộ 1.123 câu.
- **[26+ pattern từng sai](/pmp/pmp-teach-last-wrong-patterns.html)** — \`lastWrongAttempt >= 1\`, sort giảm dần ([index 415 câu](/pmp/pmp-teach-full-last-wrong-index.html)).
- **[Pattern Sai:1 (22+other)](/pmp/pmp-teach-sai1-patterns.html)** — ôn mindset từ 135 câu Sai:1 đang mở (Full Bank).
- **[Index ôn Sai:1 (135 câu)](/pmp/pmp-teach-full-sai1-index.html)** — drill từng câu trong filter Ôn câu sai.
- **[Bài phân tích ExamTopics](/pmp/pmp-exam-latest-prep-lecture.html)** (bộ Latest 1.417 câu): phân tích *PMP Exam - Lasted version 1*, thống kê domain, FIRST/NEXT, 100 câu đầu có link luyện đề.

## Hai bộ đề

| Bộ đề | Số câu | Ghi chú |
| --- | ---: | --- |
| [PMP Full Questions](/p/pmp-full-questions) | 1123 | Bộ gốc, đủ loại câu (MCQ, kéo-thả, …) |
| [PMP Exam Latest](/p/pmp-exam-latest) | 1417 | ExamTopics — *PMP Exam Lasted version 1* |

## Cách dùng

1. Chọn một bộ đề bên dưới (hoặc dùng link trong bảng).
2. Nhập **tên người dùng** khi được hỏi.
3. Luyện tập từng trang, **Kiểm tra** đáp án, hoặc **Thi thử** 180 câu / 240 phút.
4. Bấm **Ôn câu sai** để chỉ xem các câu bạn đã trả lời sai (sắp xếp sai nhiều nhất trước).

> Mẹo: dùng cùng tên người dùng trên cùng một bộ đề để giữ lịch sử luyện tập. Đổi bộ đề bằng menu **PMP** bên trái hoặc quay lại trang này.
`;

export const PMP_POST_TITLE = "PMP Full Questions — Luyện tập trắc nghiệm";
export const PMP_EXAM_LATEST_POST_TITLE =
  "PMP Exam Latest — Luyện tập trắc nghiệm (ExamTopics)";

export const PMP_POST_CONTENT_MD = "PMP quiz.";
export const PMP_EXAM_LATEST_POST_CONTENT_MD =
  "PMP Exam Latest — 1417 câu từ ExamTopics (PMP Exam - Lasted version 1).";

export const PMP_MINDSET_POST_TITLE = "PMP Mindset — Drill tình huống";
export const PMP_MINDSET_POST_CONTENT_MD = `Bài học tương tác giúp bạn luyện **PMI mindset** trước khi làm đề lớn.

## Nội dung

1. **Mindset cốt lõi** — quy trình 7 bước trả lời, vai trò PM theo PMI
2. **Nhận diện pattern** — Do First / Do Next, Risk vs Issue, Process Group
3. **PMI vs Thực tế** — bẫy đề thi theo Knowledge Area, Predictive / Agile / Hybrid
4. **Flashcard** — lật thẻ ôn nhanh
5. **Drill 10 câu** — scenario tiếng Anh (exam-style)
6. **Cheat sheet** — tóm tắt mindset theo từng KA

> Mẹo: hoàn thành drill 10 câu trong bài học, sau đó chuyển sang [luyện đề đầy đủ](/p/pmp).
`;

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
    PMP_HUB_SLUG,
    PMP_HUB_POST_TITLE,
    PMP_HUB_POST_CONTENT_MD,
    admin.id,
    admin.email,
  );

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

  await upsertQuizPost(
    db,
    PMP_MINDSET_SLUG,
    PMP_MINDSET_POST_TITLE,
    PMP_MINDSET_POST_CONTENT_MD,
    admin.id,
    admin.email,
  );
}
