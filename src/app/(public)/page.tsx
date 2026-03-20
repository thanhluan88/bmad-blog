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
      <header className="relative flex h-24 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 dark:from-amber-950 dark:via-amber-900 dark:to-stone-950 md:h-28">
        <div className="absolute inset-0 bg-[url('/cover.jpg')] bg-cover bg-center bg-no-repeat opacity-30" />
        <h1 className="relative z-10 text-xl font-bold tracking-tight text-amber-50 drop-shadow-lg md:text-2xl">
          Welcome to Thanh Luan&apos;s Blog
        </h1>
      </header>

      <div className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50/80 p-12 text-center shadow-sm dark:border-amber-800/50 dark:bg-amber-950/50">
          <p className="text-amber-900/80 dark:text-amber-200/80">
            Chọn bài viết từ menu bên trái để đọc.
          </p>
          {latestSlug && (
            <Link
              href={`/p/${latestSlug}`}
              className="mt-6 inline-block text-sm font-medium text-amber-800 underline hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
            >
              Đọc bài mới nhất →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
