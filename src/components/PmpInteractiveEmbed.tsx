"use client";

import { useEffect } from "react";
import { useBlogMenu } from "@/components/MenuInteractionProvider";

type Props = {
  htmlPath: string;
  title: string;
};

export function PmpInteractiveEmbed({ htmlPath, title }: Props) {
  const { chromeVisible, showChrome, hideChrome, scheduleHideChrome } = useBlogMenu();

  useEffect(() => {
    hideChrome();
    return () => {
      showChrome();
    };
  }, [hideChrome, showChrome]);

  if (!chromeVisible) {
    return (
      <div className="fixed inset-0 z-[10] flex flex-col overflow-hidden bg-[#0f1419]">
        <iframe
          src={htmlPath}
          title={title}
          className="block h-full min-h-0 w-full flex-1 border-0 bg-[#0f1419]"
        />
        <button
          type="button"
          onClick={showChrome}
          className="absolute right-4 bottom-4 z-[15] rounded-full border border-white/15 bg-[#1a2332]/90 px-4 py-2 text-sm font-medium text-[#e8edf4] shadow-lg backdrop-blur-sm transition-transform active:scale-[0.98] hover:border-[#e94560]/50 hover:text-white"
        >
          Menu
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:min-h-[calc(100vh-8rem)]">
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={hideChrome}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent active:scale-[0.98]"
        >
          Toàn màn hình
        </button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border md:min-h-[calc(100vh-12rem)]">
        <iframe
          src={htmlPath}
          title={title}
          className="block h-full min-h-0 w-full flex-1 border-0 bg-[#0f1419]"
        />
      </div>
    </div>
  );
}
