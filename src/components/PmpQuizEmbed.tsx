"use client";

import { useState } from "react";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import {
  buildPmpQuizUrl,
  PMP_MOCK_EXAM,
  startPmpMockExam,
} from "@/lib/pmp-quiz";

export function PmpQuizEmbed() {
  const { chromeVisible } = useBlogMenu();
  const [iframeSrc, setIframeSrc] = useState(buildPmpQuizUrl());
  const isMockExam = iframeSrc.includes("exam=1");


  if (!chromeVisible) {
    return (
      <div className="flex h-full min-h-[100dvh] flex-1 flex-col overflow-hidden">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title="PMP Full Questions"
          className="block h-full min-h-0 w-full flex-1 border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex max-md:min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:rounded-xl md:border-2 md:border-amber-200/70 md:shadow-sm dark:md:border-amber-800/50">
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title="PMP Full Questions"
        className="block max-md:min-h-0 w-full flex-1 border-0 bg-white md:min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
