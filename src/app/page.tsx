import Link from "next/link";
import { db } from "@/lib/db";
import { formatUpdatedAt } from "@/lib/format";

export default async function HomePage() {
  let posts: { id: string; title: string; slug: string; publishedAt: Date | null }[];
  try {
    posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[public/home] DB error", { route: "/", errorCode: "DB_ERROR" });
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <main className="mx-auto max-w-2xl px-6 py-16">
          <p className="text-zinc-600 dark:text-zinc-400">
            Unable to load posts. Please try again later.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Try again
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Blog
        </h1>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-zinc-600 dark:text-zinc-400">
              No posts published yet.
            </p>
          </div>
        ) : (
          <ul className="mt-8 space-y-6">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/p/${post.slug}`}
                  className="block rounded-lg border border-zinc-200 bg-white p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/50"
                >
                  <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    {post.title}
                  </h2>
                  <time
                    dateTime={post.publishedAt?.toISOString() ?? ""}
                    className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400"
                  >
                    {post.publishedAt
                      ? formatUpdatedAt(post.publishedAt)
                      : "—"}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
