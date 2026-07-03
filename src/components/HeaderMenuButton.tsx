"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function HeaderMenuButton() {
  const { isOpen, setIsOpen, showMenu, hideMenu, showChrome, scheduleHideChrome } =
    useBlogMenu();

  return (
    <div
      className="relative z-[16] flex shrink-0 items-center md:hidden"
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <button
        type="button"
        onClick={() => {
          setIsOpen((open) => {
            const next = !open;
            if (next) {
              showChrome();
            } else {
              scheduleHideChrome();
            }
            return next;
          });
        }}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-accent hover:text-accent active:scale-[0.98]"
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        {isOpen ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span className="text-lg font-semibold leading-none" aria-hidden>
            ≡
          </span>
        )}
      </button>
    </div>
  );
}
