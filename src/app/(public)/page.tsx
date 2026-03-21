import Link from "next/link";
import { MarkdownBody } from "@/components/MarkdownBody";
import { PostCover } from "@/components/PostCover";
import { db } from "@/lib/db";

export default async function HomePage() {
  let latest: {
    title: string;
    contentMd: string;
    coverImageUrl: string | null;
    slug: string;
  } | null = null;

  try {
    latest = await db.post.findFirst({
      where: { status: "PUBLISHED" },
      select: {
        title: true,
        contentMd: true,
        coverImageUrl: true,
        slug: true,
      },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // DB 未設定時など
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-12">
        <p className="text-amber-800 dark:text-amber-200">記事がありません。</p>
      </div>
    );
  }

  const coverUrl = latest.coverImageUrl?.trim();

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <article>
        {coverUrl && (
          <PostCover coverImageUrl={coverUrl} alt={latest.title || "カバー"} />
        )}
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">
          {latest.title}
        </h1>
        <div className="mt-8">
          <MarkdownBody content={latest.contentMd} />
        </div>
        <p className="mt-10 text-center text-sm text-amber-800/80 dark:text-amber-300/80">
          <Link
            href={`/p/${latest.slug}`}
            className="font-medium text-amber-800 underline hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
          >
            この記事の固定リンク →
          </Link>
        </p>
      </article>
    </div>
  );
}
