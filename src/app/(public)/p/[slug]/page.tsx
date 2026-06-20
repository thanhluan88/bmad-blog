import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PmpQuizEmbed } from "@/components/PmpQuizEmbed";
import { PostCover } from "@/components/PostCover";
import { db } from "@/lib/db";
import { PMP_QUIZ_SLUG } from "@/lib/pmp-quiz";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PublicPostPage({ params }: Props) {
  const { slug } = await params;

  const post = await db.post.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { id: true, title: true, contentMd: true, coverImageUrl: true },
  });

  if (!post) {
    notFound();
  }

  const coverUrl = post.coverImageUrl?.trim();
  const isPmpQuiz = slug === PMP_QUIZ_SLUG;

  if (isPmpQuiz) {
    return (
      <div className="flex min-h-0 flex-1 flex-col md:mx-auto md:max-w-5xl md:px-8 md:py-6">
        <PmpQuizEmbed />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
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
    </div>
  );
}
