"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { PMP_QUIZ_HTML_PATH } from "@/lib/pmp-quiz";

export function PmpQuizEmbed() {
  const { chromeVisible } = useBlogMenu();
  const mobileHeight = chromeVisible
    ? "max-md:min-h-[calc(100dvh-4.5rem)]"
    : "max-md:min-h-[100dvh]";

  return (
    <div
      className={`flex flex-1 flex-col overflow-hidden ${mobileHeight} md:rounded-xl md:border-2 md:border-amber-200/70 md:shadow-sm dark:md:border-amber-800/50`}
    >
      <iframe
        src={PMP_QUIZ_HTML_PATH}
        title="PMP Full Questions"
        className={`block w-full flex-1 border-0 bg-white ${mobileHeight} md:min-h-[calc(100vh-10rem)]`}
      />
    </div>
  );
}
