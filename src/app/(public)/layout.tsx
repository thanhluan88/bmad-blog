import Link from "next/link";
import { db } from "@/lib/db";
import { formatUpdatedAt } from "@/lib/format";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let posts: { id: string; title: string; slug: string; publishedAt: Date | null }[] = [];
  try {
    posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // Sidebar empty on error
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <aside className="fixed left-0 top-0 z-10 h-full w-64 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex h-full flex-col p-4">
          <Link
            href="/"
            className="mb-4 text-lg font-semibold text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Blog
          </Link>
          <nav className="flex-1 overflow-y-auto">
            {posts.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Chưa có bài viết
              </p>
            ) : (
              <ul className="space-y-1">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/p/${post.slug}`}
                      className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      <span className="line-clamp-2">{post.title}</span>
                      <time
                        dateTime={post.publishedAt?.toISOString() ?? ""}
                        className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400"
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
          </nav>
        </div>
      </aside>
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
