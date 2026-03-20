import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/rbac";
import { db } from "@/lib/db";
import { formatUpdatedAt } from "@/lib/format";

export default async function AdminPostsPage() {
  const authResult = await requireAuth();
  if (!authResult) redirect("/admin/login");
  const { user } = authResult;

  let posts: { id: string; title: string; slug: string; status: string; updatedAt: Date }[];
  try {
    posts = await db.post.findMany({
      where: user.role === "ADMIN" ? {} : { authorId: user.id },
      select: { id: true, title: true, slug: true, status: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (err) {
    // eslint-disable-next-line no-console -- intentional server-side error logging
    console.error("[admin/posts] DB error", { route: "admin/posts", errorCode: "DB_ERROR" });
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          記事を読み込めませんでした。もう一度お試しください。
        </p>
        <Link
          href="/admin/posts"
          className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
        >
          再試行
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          記事一覧
        </h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          新規記事
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">記事がまだありません。</p>
          <Link
            href="/admin/posts/new"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            新規記事
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  タイトル
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  ステータス
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-50"
                >
                  更新日時
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {posts.map((post) => (
                <tr key={post.id}>
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-normal"
                  >
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-300"
                    >
                      {post.title}
                    </Link>
                  </th>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        post.status === "PUBLISHED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatUpdatedAt(post.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
