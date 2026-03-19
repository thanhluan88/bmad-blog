import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PostCover } from "@/components/PostCover";
import { db } from "@/lib/db";

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to home
        </Link>
        <article>
          {coverUrl && (
            <PostCover coverImageUrl={coverUrl} alt={post.title || "Cover"} />
          )}
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {post.title}
          </h1>
          <div className="mt-8">
            <MarkdownBody content={post.contentMd} />
          </div>
        </article>
      </main>
    </div>
  );
}
