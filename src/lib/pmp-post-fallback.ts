import {
  isPmpRouteSlug,
  PMP_EXAM_LATEST_SLUG,
  PMP_HUB_SLUG,
  PMP_QUIZ_SLUG,
} from "@/lib/pmp-quiz";
import {
  PMP_EXAM_LATEST_POST_CONTENT_MD,
  PMP_EXAM_LATEST_POST_TITLE,
  PMP_HUB_POST_CONTENT_MD,
  PMP_HUB_POST_TITLE,
  PMP_POST_CONTENT_MD,
  PMP_POST_TITLE,
} from "@/lib/seed-pmp-post";

export type PmpPostView = {
  title: string;
  contentMd: string;
  coverImageUrl: string | null;
};

const FALLBACKS: Record<string, PmpPostView> = {
  [PMP_HUB_SLUG]: {
    title: PMP_HUB_POST_TITLE,
    contentMd: PMP_HUB_POST_CONTENT_MD,
    coverImageUrl: null,
  },
  [PMP_QUIZ_SLUG]: {
    title: PMP_POST_TITLE,
    contentMd: PMP_POST_CONTENT_MD,
    coverImageUrl: null,
  },
  [PMP_EXAM_LATEST_SLUG]: {
    title: PMP_EXAM_LATEST_POST_TITLE,
    contentMd: PMP_EXAM_LATEST_POST_CONTENT_MD,
    coverImageUrl: null,
  },
};

export function getPmpPostFallback(slug: string): PmpPostView | null {
  if (!isPmpRouteSlug(slug)) return null;
  return FALLBACKS[slug] ?? null;
}
