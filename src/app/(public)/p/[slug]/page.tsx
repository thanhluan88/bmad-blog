import { notFound } from "next/navigation";
import { ChromeAwarePageFrame } from "@/components/ChromeAwarePageFrame";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PmpQuizEmbed } from "@/components/PmpQuizEmbed";
import { PmpQuizPicker } from "@/components/PmpQuizPicker";
import { PostCover } from "@/components/PostCover";
import { db } from "@/lib/db";
import {
  getPmpQuizHtmlPath,
  isPmpQuizSlug,
  PMP_EXAM_LATEST_SLUG,
  PMP_HUB_SLUG,
  PMP_QUIZ_SLUG,
} from "@/lib/pmp-quiz";
import { getPmpPostFallback } from "@/lib/pmp-post-fallback";

type Props = {
  params: Promise<{ slug: string }>;
};

const QUIZ_TITLES: Record<string, string> = {
  [PMP_QUIZ_SLUG]: "PMP Full Questions",
  [PMP_EXAM_LATEST_SLUG]: "PMP Exam Latest",
};

export default async function PublicPostPage({ params }: Props) {
  const { slug } = await params;

  const dbPost = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, title: true, contentMd: true, coverImageUrl: true },
  });

  const fallback = getPmpPostFallback(slug);
  const post = dbPost ?? fallback;

  if (!post) {
    notFound();
  }

  const coverUrl = post.coverImageUrl?.trim() || undefined;

  if (slug === PMP_HUB_SLUG) {
    return (
      <ChromeAwarePageFrame>
        <article>
          {coverUrl && (
            <PostCover coverImageUrl={coverUrl} alt={post.title || "カバー"} />
          )}
          <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
            {post.title}
          </h1>
          <div className="mt-8">
            <MarkdownBody content={post.contentMd} />
          </div>
          <div className="mt-10 border-t border-amber-200/80 pt-8 dark:border-amber-800/50">
            <PmpQuizPicker />
          </div>
        </article>
      </ChromeAwarePageFrame>
    );
  }

  if (isPmpQuizSlug(slug)) {
    return (
      <ChromeAwarePageFrame variant="quiz">
        <PmpQuizEmbed
          htmlPath={getPmpQuizHtmlPath(slug)}
          title={QUIZ_TITLES[slug] ?? post.title}
        />
      </ChromeAwarePageFrame>
    );
  }

  return (
    <ChromeAwarePageFrame>
      <article>
        {coverUrl && (
          <PostCover coverImageUrl={coverUrl} alt={post.title || "カバー"} />
        )}
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
          {post.title}
        </h1>
        <div className="mt-8">
          <MarkdownBody content={post.contentMd} />
        </div>
      </article>
    </ChromeAwarePageFrame>
  );
}
