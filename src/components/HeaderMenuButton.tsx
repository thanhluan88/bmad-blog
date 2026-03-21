"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function HeaderMenuButton() {
  const { isOpen, setIsOpen, showMenu, hideMenu } = useBlogMenu();

  return (
    <div
      className="relative z-[16] flex shrink-0 items-center self-start md:hidden"
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-amber-900/40 bg-amber-50/95 shadow-md transition-colors hover:bg-amber-100/95 dark:border-amber-700/50 dark:bg-amber-950/95 dark:hover:bg-amber-900/95"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        {isOpen ? (
          <svg
            className="h-5 w-5 text-amber-900 dark:text-amber-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span
            className="text-xl font-semibold leading-none text-amber-900 dark:text-amber-200 [font-family:ui-sans-serif,system-ui,'Segoe_UI','Yu_Gothic_UI','Meiryo','Hiragino_Sans','PingFang_SC',sans-serif]"
            aria-hidden
          >
            三
          </span>
        )}
      </button>
    </div>
  );
}
