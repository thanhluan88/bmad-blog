"use client";

import Link from "next/link";
import { HeaderMenuButton } from "@/components/HeaderMenuButton";
import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function BlogHeader() {
  const { chromeVisible, showChrome, scheduleHideChrome } = useBlogMenu();

  return (
    <header
      onMouseEnter={showChrome}
      onMouseLeave={scheduleHideChrome}
      className={`top-0 z-[15] border-b border-border bg-surface/90 backdrop-blur-md transition-transform duration-300 ease-out ${
        chromeVisible
          ? "sticky translate-y-0 md:pl-64"
          : "pointer-events-none fixed right-0 left-0 -translate-y-full md:pl-0"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <HeaderMenuButton />
          <Link
            href="/"
            className="truncate text-base font-semibold tracking-tight text-foreground hover:text-accent md:text-lg"
          >
            Thanh Luan
          </Link>
        </div>
        <nav className="flex shrink-0 items-center gap-5">
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            ホーム
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            管理
          </Link>
        </nav>
      </div>
    </header>
  );
}
