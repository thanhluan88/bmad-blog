import Link from "next/link";
import { db } from "@/lib/db";

export default async function HomePage() {
  let latestSlug: string | null = null;
  try {
    const latest = await db.post.findFirst({
      where: { status: "PUBLISHED" },
      select: { slug: true },
      orderBy: { publishedAt: "desc" },
    });
    latestSlug = latest?.slug ?? null;
  } catch {
    // Ignore
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/80 p-12 text-center shadow-sm dark:border-amber-800/50 dark:bg-amber-950/50">
          <p className="text-amber-900/80 dark:text-amber-200/80">
            メニューを開く（左端にマウスを乗せる / モバイルでは三ボタン）で記事を選択できます。
          </p>
          {latestSlug && (
            <Link
              href={`/p/${latestSlug}`}
              className="mt-6 inline-block text-sm font-medium text-amber-800 underline hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              最新記事を読む →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
