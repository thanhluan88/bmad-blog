"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function PublicMainShell({ children }: { children: React.ReactNode }) {
  const { chromeVisible, scheduleHideChrome } = useBlogMenu();

  return (
    <main
      onMouseEnter={scheduleHideChrome}
      className={
        chromeVisible
          ? "flex-1 transition-[padding] duration-300 ease-out md:pl-64"
          : "fixed inset-0 z-[5] h-[100dvh] w-full overflow-hidden transition-[padding] duration-300 ease-out"
      }
    >
      {children}
    </main>
  );
}
