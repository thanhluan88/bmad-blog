import Link from "next/link";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";

export function BlogHeader() {
  return (
    <header className="sticky top-0 z-[15] border-b-2 border-amber-200/80 bg-amber-50/95 shadow-sm backdrop-blur-sm dark:border-amber-800/50 dark:bg-amber-950/95 md:pl-64">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-2 sm:gap-3 sm:py-3 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex min-w-0 flex-1 items-start gap-3 md:items-center">
          <HeaderMenuButton />
          <div className="min-w-0 flex-1">
          <Link
            href="/"
            className="block text-lg font-bold text-amber-900 hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300"
          >
            Welcome to Thanh Luan's Blog
          </Link>
          <p className="mt-1 max-w-2xl text-xs leading-snug text-amber-800/85 sm:text-sm dark:text-amber-200/80">
            Thanh Luanの個人ブログです。日常生活や仕事のなかで抱いた個人的な思いを、ここで綴っています。
          </p>
          </div>
        </div>
        <nav className="flex shrink-0 items-center gap-6 self-start md:self-center">
          <Link
            href="/"
            className="text-sm font-medium text-amber-800 hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
          >
            ホーム
          </Link>
          <Link
            href="/admin"
            className="text-sm text-amber-700/80 hover:text-amber-600 dark:text-amber-400/80 dark:hover:text-amber-300"
          >
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
