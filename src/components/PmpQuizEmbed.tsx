"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { PMP_QUIZ_HTML_PATH } from "@/lib/pmp-quiz";

export function PmpQuizEmbed() {
  const { chromeVisible } = useBlogMenu();

  if (!chromeVisible) {
    return (
      <div className="flex h-full min-h-[100dvh] flex-1 flex-col overflow-hidden">
        <iframe
          src={PMP_QUIZ_HTML_PATH}
          title="PMP Full Questions"
          className="block h-full min-h-[100dvh] w-full flex-1 border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex max-md:min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:rounded-xl md:border-2 md:border-amber-200/70 md:shadow-sm dark:md:border-amber-800/50">
      <iframe
        src={PMP_QUIZ_HTML_PATH}
        title="PMP Full Questions"
        className="block max-md:min-h-[calc(100dvh-4.5rem)] w-full flex-1 border-0 bg-white md:min-h-[calc(100vh-10rem)]"
      />
    </div>
  );
}
