import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
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

const getPublishedPost = cache(async (slug: string) => {
  const dbPost = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, title: true, contentMd: true, coverImageUrl: true },
  });

  const fallback = getPmpPostFallback(slug);
  const post =
    dbPost && fallback
      ? { ...dbPost, title: fallback.title, contentMd: fallback.contentMd }
      : dbPost ?? fallback;

  return post;
});

function getPostDescription(contentMd: string): string {
  const text = contentMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~`|=-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "Ghi chép cá nhân và luyện thi PMP";
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) return {};

  const description = getPostDescription(post.contentMd);
  const coverUrl = post.coverImageUrl?.trim() || undefined;
  const canonicalPath = `/p/${slug}`;

  return {
    title: post.title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonicalPath,
      images: coverUrl ? [{ url: coverUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      images: coverUrl ? [coverUrl] : undefined,
    },
  };
}

export default async function PublicPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

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
