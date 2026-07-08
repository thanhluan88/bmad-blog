"use client";

import { usePathname } from "next/navigation";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { isPmpImmersivePath } from "@/lib/pmp-quiz";

export function PublicLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { chromeVisible } = useBlogMenu();
  const immersive = isPmpImmersivePath(pathname);

  return (
    <div
      className={`flex flex-col bg-background ${
        immersive && !chromeVisible
          ? "h-[100dvh] overflow-hidden"
          : "min-h-screen"
      }`}
    >
      {children}
    </div>
  );
}
