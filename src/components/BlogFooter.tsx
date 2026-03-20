import Link from "next/link";

export function BlogFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 border-amber-200/80 bg-amber-100/50 py-8 dark:border-amber-800/50 dark:bg-amber-950/50">
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
            © {year} Thanh Luanのブログ. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-sm text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
            >
              ホーム
            </Link>
            <Link
              href="/admin"
              className="text-sm text-amber-700 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300"
            >
              管理
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
