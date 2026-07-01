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

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2 border-b border-amber-200/70 bg-amber-50/90 px-3 py-2.5 dark:border-amber-800/50 dark:bg-amber-950/50">
      <button
        type="button"
        onClick={() => setIframeSrc(buildPmpQuizUrl())}
        aria-pressed={!isMockExam}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          !isMockExam
            ? "border-amber-600 bg-amber-600 text-white"
            : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
        }`}
      >
        Luyện tập
      </button>
      <button
        type="button"
        onClick={() => setIframeSrc(startPmpMockExam())}
        aria-pressed={isMockExam}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          isMockExam
            ? "border-amber-600 bg-amber-600 text-white"
            : "border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 dark:hover:bg-amber-900"
        }`}
      >
        Thi thử {PMP_MOCK_EXAM.questionCount} câu ({PMP_MOCK_EXAM.durationMinutes}{" "}
        phút)
      </button>
    </div>
  );

  if (!chromeVisible) {
    return (
      <div className="flex h-full min-h-[100dvh] flex-1 flex-col overflow-hidden">
        {toolbar}
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
      {toolbar}
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title="PMP Full Questions"
        className="block max-md:min-h-0 w-full flex-1 border-0 bg-white md:min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
