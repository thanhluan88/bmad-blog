import { notFound } from "next/navigation";
import { ChromeAwarePageFrame } from "@/components/ChromeAwarePageFrame";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PmpInteractiveEmbed } from "@/components/PmpInteractiveEmbed";
import { PmpQuizEmbed } from "@/components/PmpQuizEmbed";
import { PmpHubHero, PmpQuizPicker } from "@/components/PmpQuizPicker";
import { PostCover } from "@/components/PostCover";
import { db } from "@/lib/db";
import {
  getPmpQuizHtmlPath,
  isPmpMindsetSlug,
  isPmpQuizSlug,
  PMP_EXAM_LATEST_SLUG,
  PMP_HUB_SLUG,
  PMP_MINDSET_HTML_PATH,
  PMP_MINDSET_SLUG,
  PMP_QUIZ_SLUG,
} from "@/lib/pmp-quiz";
import { getPmpPostFallback } from "@/lib/pmp-post-fallback";

type Props = {
  params: Promise<{ slug: string }>;
};

const QUIZ_TITLES: Record<string, string> = {
  [PMP_QUIZ_SLUG]: "PMP Full Questions",
  [PMP_EXAM_LATEST_SLUG]: "PMP Exam Latest",
  [PMP_MINDSET_SLUG]: "PMP Mindset",
};

export default async function PublicPostPage({ params }: Props) {
  const { slug } = await params;

  const dbPost = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, title: true, contentMd: true, coverImageUrl: true },
  });

  const fallback = getPmpPostFallback(slug);
  const post =
    dbPost && fallback
      ? { ...dbPost, title: fallback.title, contentMd: fallback.contentMd }
      : dbPost ?? fallback;

  if (!post) {
    notFound();
  }

  const coverUrl = post.coverImageUrl?.trim() || undefined;

  if (slug === PMP_HUB_SLUG) {
    return (
      <ChromeAwarePageFrame variant="wide">
        <article>
          {coverUrl && (
            <PostCover coverImageUrl={coverUrl} alt={post.title || "カバー"} />
          )}
          <PmpHubHero />
          <div className="animate-rise-in border-t border-border pt-10">
            <MarkdownBody content={post.contentMd} />
          </div>
          <div id="chon-bo-de" className="animate-rise-in mt-14 border-t border-border pt-10">
            <PmpQuizPicker showIntro={false} />
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

  if (isPmpMindsetSlug(slug)) {
    return (
      <ChromeAwarePageFrame variant="quiz">
        <PmpInteractiveEmbed
          htmlPath={PMP_MINDSET_HTML_PATH}
          title={QUIZ_TITLES[slug] ?? post.title}
        />
      </ChromeAwarePageFrame>
    );
  }

  return (
    <ChromeAwarePageFrame>
      <article className="animate-rise-in">
        {coverUrl && (
          <PostCover coverImageUrl={coverUrl} alt={post.title || "カバー"} />
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {post.title}
        </h1>
        <div className="mt-8">
          <MarkdownBody content={post.contentMd} />
        </div>
      </article>
    </ChromeAwarePageFrame>
  );
}
