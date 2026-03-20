import Link from "next/link";

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-[5] border-b-2 border-amber-200/80 bg-amber-50/95 shadow-sm backdrop-blur-sm dark:border-amber-800/50 dark:bg-amber-950/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 md:px-8">
        <Link
          href="/"
          className="text-lg font-bold text-amber-900 hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300"
        >
          Thanh Luan&apos;s Blog
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-amber-800 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
          >
            Trang chủ
          </Link>
          <Link
            href="/admin"
            className="text-sm text-amber-700/80 hover:text-amber-600 dark:text-amber-400/80 dark:hover:text-amber-300"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
