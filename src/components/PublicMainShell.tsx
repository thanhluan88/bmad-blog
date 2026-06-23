"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

export function PublicMainShell({ children }: { children: React.ReactNode }) {
  const { chromeVisible, scheduleHideChrome } = useBlogMenu();

  return (
    <main
      onMouseEnter={scheduleHideChrome}
      className={`flex-1 transition-[padding] duration-300 ease-out ${
        chromeVisible ? "md:pl-64" : "md:pl-0"
      }`}
    >
      {children}
    </main>
  );
}
