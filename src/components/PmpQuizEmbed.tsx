"use client";

import { PMP_QUIZ_HTML_PATH } from "@/lib/pmp-quiz";

export function PmpQuizEmbed() {
  return (
    <div
      className="flex flex-1 flex-col overflow-hidden max-md:min-h-[calc(100dvh-4.5rem)] md:rounded-xl md:border-2 md:border-amber-200/70 md:shadow-sm dark:md:border-amber-800/50"
    >
      <iframe
        src={PMP_QUIZ_HTML_PATH}
        title="PMP Full Questions"
        className="block w-full flex-1 border-0 bg-white max-md:min-h-[calc(100dvh-4.5rem)] md:min-h-[calc(100vh-10rem)]"
      />
    </div>
  );
}
