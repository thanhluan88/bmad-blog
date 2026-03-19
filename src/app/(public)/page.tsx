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
      {/* Cover banner */}
      <header className="relative flex h-24 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-900 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-950 md:h-28">
        <div className="absolute inset-0 bg-[url('/cover.jpg')] bg-cover bg-center bg-no-repeat opacity-40" />
        <h1 className="relative z-10 text-xl font-bold tracking-tight text-white drop-shadow-lg md:text-2xl">
          Welcome to Thanh Luan&apos;s Blog
        </h1>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            Chọn bài viết từ menu bên trái để đọc.
          </p>
          {latestSlug && (
            <Link
              href={`/p/${latestSlug}`}
              className="mt-6 inline-block text-sm font-medium text-zinc-900 underline hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Đọc bài mới nhất →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
