import { db } from "@/lib/db";
import {
  PMP_EXAM_PREP_HTML_PATH,
  PMP_EXAM_PREP_SLUG,
  shouldShowInSidebarNav,
} from "@/lib/pmp-quiz";

export type SidebarNavItem = {
  id: string;
  title: string;
  href: string;
  publishedAt: Date | null;
};

const SIDEBAR_HREF_OVERRIDES: Record<string, string> = {
  [PMP_EXAM_PREP_SLUG]: PMP_EXAM_PREP_HTML_PATH,
};

export async function getSidebarNavItems(): Promise<SidebarNavItem[]> {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, publishedAt: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });

  return posts
    .filter((post) => shouldShowInSidebarNav(post.slug))
    .map((post) => ({
      id: post.id,
      title: post.title,
      href: SIDEBAR_HREF_OVERRIDES[post.slug] ?? `/p/${post.slug}`,
      publishedAt: post.publishedAt,
    }));
}
