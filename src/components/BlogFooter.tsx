"use client";

import Link from "next/link";
import { useBlogMenu } from "@/components/MenuInteractionProvider";

type Props = {
  /** Total public page views; omitted or null hides the counter */
  visitCount?: number | null;
};

export function BlogFooter({ visitCount }: Props) {
  const { chromeVisible, showChrome, scheduleHideChrome } = useBlogMenu();
  const year = new Date().getFullYear();

  return (
    <footer
      onMouseEnter={showChrome}
      onMouseLeave={scheduleHideChrome}
      className={`border-t-2 border-amber-200/80 bg-amber-100/50 py-8 transition-transform duration-300 ease-out dark:border-amber-800/50 dark:bg-amber-950/50 ${
        chromeVisible
          ? "mt-auto translate-y-0 md:pl-64"
          : "pointer-events-none fixed right-0 bottom-0 left-0 translate-y-full md:pl-0"
      }`}
    >
      <div className="mx-auto max-w-5xl px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:flex-wrap">
          <p className="text-sm text-amber-800/80 dark:text-amber-300/80">
            © {year} Thanh Luanのブログ. All rights reserved.
          </p>
          {visitCount != null && (
            <p
              className="text-sm text-amber-800/80 dark:text-amber-300/80"
              aria-live="polite"
            >
              累計アクセス{" "}
              <span className="font-semibold tabular-nums text-amber-900 dark:text-amber-200">
                {visitCount.toLocaleString("ja-JP")}
              </span>{" "}
              回
            </p>
          )}
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
