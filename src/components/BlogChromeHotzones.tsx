"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function BlogChromeHotzones() {
  const { chromeVisible, showChrome, setIsOpen } = useBlogMenu();

  if (chromeVisible) return null;

  return (
    <>
      <div
        className="fixed top-0 right-0 left-0 z-[30] h-5"
        onMouseEnter={showChrome}
        onTouchStart={showChrome}
        aria-hidden="true"
      />
      <div
        className="fixed right-0 bottom-0 left-0 z-[30] h-5"
        onMouseEnter={showChrome}
        onTouchStart={showChrome}
        aria-hidden="true"
      />
      <div
        className="fixed top-0 left-0 z-[30] h-full w-5"
        onMouseEnter={showChrome}
        onTouchStart={showChrome}
        aria-hidden="true"
      />
      <button
        type="button"
        className="fixed top-2 left-2 z-[35] flex h-10 w-10 items-center justify-center rounded-lg border-2 border-amber-900/40 bg-amber-50/95 shadow-md md:hidden dark:border-amber-700/50 dark:bg-amber-950/95"
        onClick={() => {
          showChrome();
          setIsOpen(true);
        }}
        aria-label="Mở menu"
      >
        <span className="text-xl font-semibold leading-none text-amber-900 dark:text-amber-200">
          三
        </span>
      </button>
    </>
  );
}
