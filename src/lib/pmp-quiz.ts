export const PMP_QUIZ_SLUG = "pmp-full-questions";
export const PMP_QUIZ_HTML_PATH = "/pmp/pmp-full-questions.html";

export const PMP_MOCK_EXAM = {
  questionCount: 180,
  durationMinutes: 240,
  durationSeconds: 240 * 60,
} as const;

export type PmpQuizMode = "practice" | "mock-exam";

export function buildPmpQuizUrl(options?: { mode?: PmpQuizMode }): string {
  if (options?.mode === "mock-exam") {
    return `${PMP_QUIZ_HTML_PATH}?exam=1`;
  }
  return PMP_QUIZ_HTML_PATH;
}

export function startPmpMockExam(): string {
  return buildPmpQuizUrl({ mode: "mock-exam" });
}
