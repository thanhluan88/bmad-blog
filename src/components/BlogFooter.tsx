"use client";

import Link from "next/link";
import { useBlogMenu } from "@/components/MenuInteractionProvider";

type Props = {
  visitCount?: number | null;
};

export function BlogFooter({ visitCount }: Props) {
  const { chromeVisible, showChrome, scheduleHideChrome } = useBlogMenu();
  const year = new Date().getFullYear();

  return (
    <footer
      onMouseEnter={showChrome}
      onMouseLeave={scheduleHideChrome}
      className={`mt-auto border-t border-border bg-surface-elevated/60 py-8 transition-transform duration-300 ease-out ${
        chromeVisible
          ? "translate-y-0 md:pl-64"
          : "pointer-events-none fixed right-0 bottom-0 left-0 translate-y-full md:pl-0"
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 md:flex-row md:items-center md:px-8">
        <p className="text-sm text-muted">
          © {year} Thanh Luan. Ghi chép cá nhân và luyện PMP.
        </p>
        {visitCount != null && (
          <p className="text-sm text-muted" aria-live="polite">
            Lượt truy cập{" "}
            <span className="font-mono font-medium text-foreground">
              {visitCount.toLocaleString("ja-JP")}
            </span>
          </p>
        )}
        <div className="flex gap-5">
          <Link href="/" className="text-sm text-muted hover:text-accent">
            ホーム
          </Link>
          <Link href="/admin" className="text-sm text-muted hover:text-accent">
            管理
          </Link>
        </div>
      </div>
    </footer>
  );
}
