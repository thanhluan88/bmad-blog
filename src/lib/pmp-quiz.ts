export const PMP_HUB_SLUG = "pmp";

export const PMP_QUIZ_SLUG = "pmp-full-questions";
export const PMP_QUIZ_HTML_PATH = "/pmp/pmp-full-questions.html";

export const PMP_EXAM_LATEST_SLUG = "pmp-exam-latest";
export const PMP_EXAM_LATEST_HTML_PATH = "/pmp/pmp-exam-latest.html";

export const PMP_MINDSET_SLUG = "pmp-mindset";
export const PMP_MINDSET_HTML_PATH = "/pmp/pmp-mindset-teach.html";

export const PMP_QUIZ_SLUGS = [PMP_QUIZ_SLUG, PMP_EXAM_LATEST_SLUG] as const;
export type PmpQuizSlug = (typeof PMP_QUIZ_SLUGS)[number];

export const PMP_QUIZ_OPTIONS = [
  {
    slug: PMP_QUIZ_SLUG,
    title: "PMP Full Questions",
    description: "1123 câu — bộ đề gốc, luyện tập và thi thử.",
    href: `/p/${PMP_QUIZ_SLUG}`,
  },
  {
    slug: PMP_EXAM_LATEST_SLUG,
    title: "PMP Exam Latest",
    description: "1417 câu — ExamTopics (Lasted version 1).",
    href: `/p/${PMP_EXAM_LATEST_SLUG}`,
  },
] as const;

export function shouldShowPostInSidebar(slug: string): boolean {
  if (slug === PMP_HUB_SLUG) return false;
  return !(PMP_QUIZ_SLUGS as readonly string[]).includes(slug);
}

export function isPmpMindsetSlug(slug: string): boolean {
  return slug === PMP_MINDSET_SLUG;
}

export function isPmpRouteSlug(slug: string): boolean {
  return slug === PMP_HUB_SLUG || isPmpQuizSlug(slug) || isPmpMindsetSlug(slug);
}

const QUIZ_HTML_BY_SLUG: Record<PmpQuizSlug, string> = {
  [PMP_QUIZ_SLUG]: PMP_QUIZ_HTML_PATH,
  [PMP_EXAM_LATEST_SLUG]: PMP_EXAM_LATEST_HTML_PATH,
};

const _examQuestions = parseInt(process.env.NEXT_PUBLIC_PMP_EXAM_QUESTIONS ?? "180");
const _examMinutes = parseInt(process.env.NEXT_PUBLIC_PMP_EXAM_MINUTES ?? "240");

export const PMP_MOCK_EXAM = {
  questionCount: _examQuestions,
  durationMinutes: _examMinutes,
  durationSeconds: _examMinutes * 60,
} as const;

export type PmpQuizMode = "practice" | "mock-exam";

export function isPmpQuizSlug(slug: string): slug is PmpQuizSlug {
  return (PMP_QUIZ_SLUGS as readonly string[]).includes(slug);
}

export function getPmpQuizHtmlPath(slug: PmpQuizSlug): string {
  return QUIZ_HTML_BY_SLUG[slug];
}

export function getPmpQuizUserStorageKey(htmlPath: string): string {
  return `pmp-quiz-user:${htmlPath}`;
}

export function buildPmpQuizUrl(
  htmlPath: string = PMP_QUIZ_HTML_PATH,
  options?: { mode?: PmpQuizMode; user?: string },
): string {
  const params = new URLSearchParams();
  if (options?.mode === "mock-exam") params.set("exam", "1");
  params.set("size", String(PMP_MOCK_EXAM.questionCount));
  params.set("minutes", String(PMP_MOCK_EXAM.durationMinutes));
  const user = options?.user?.trim();
  if (user) params.set("user", user);
  return `${htmlPath}?${params.toString()}`;
}

export function startPmpMockExam(htmlPath: string = PMP_QUIZ_HTML_PATH): string {
  return buildPmpQuizUrl(htmlPath, { mode: "mock-exam" });
}
