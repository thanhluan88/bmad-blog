export const PMP_QUIZ_SLUG = "pmp-full-questions";
export const PMP_QUIZ_HTML_PATH = "/pmp/pmp-full-questions.html";

const _examQuestions = parseInt(process.env.NEXT_PUBLIC_PMP_EXAM_QUESTIONS ?? "180");
const _examMinutes = parseInt(process.env.NEXT_PUBLIC_PMP_EXAM_MINUTES ?? "240");

export const PMP_MOCK_EXAM = {
  questionCount: _examQuestions,
  durationMinutes: _examMinutes,
  durationSeconds: _examMinutes * 60,
} as const;

export type PmpQuizMode = "practice" | "mock-exam";

export function buildPmpQuizUrl(options?: { mode?: PmpQuizMode }): string {
  const params = new URLSearchParams();
  if (options?.mode === "mock-exam") params.set("exam", "1");
  params.set("size", String(PMP_MOCK_EXAM.questionCount));
  params.set("minutes", String(PMP_MOCK_EXAM.durationMinutes));
  return `${PMP_QUIZ_HTML_PATH}?${params.toString()}`;
}

export function startPmpMockExam(): string {
  return buildPmpQuizUrl({ mode: "mock-exam" });
}
