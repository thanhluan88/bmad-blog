"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const { chromeVisible } = useBlogMenu();

  return (
    <div
      className={`flex flex-col bg-amber-50/50 dark:bg-amber-950/30 ${
        chromeVisible ? "min-h-screen" : "h-[100dvh] overflow-hidden"
      }`}
    >
      {children}
    </div>
  );
}
