"use client";

import { usePathname } from "next/navigation";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { isPmpImmersivePath } from "@/lib/pmp-quiz";

export function PublicMainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { chromeVisible, scheduleHideChrome } = useBlogMenu();
  const immersive = isPmpImmersivePath(pathname);

  return (
    <main
      onMouseEnter={immersive ? scheduleHideChrome : undefined}
      className={
        immersive && !chromeVisible
          ? "fixed inset-0 z-[5] h-[100dvh] w-full overflow-hidden transition-[padding] duration-300 ease-out"
          : chromeVisible
            ? "flex-1 transition-[padding] duration-300 ease-out md:pl-64"
            : "flex-1 transition-[padding] duration-300 ease-out"
      }
    >
      {children}
    </main>
  );
}
