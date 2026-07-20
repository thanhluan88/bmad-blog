import { db } from "@/lib/db";
import { shouldShowPostInSidebar } from "@/lib/pmp-quiz";

export async function getLatestHomePostSlug(): Promise<string | null> {
  const posts = await db.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, publishedAt: true },
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
  });
  const latest = posts.find((post) => shouldShowPostInSidebar(post.slug));
  return latest?.slug ?? null;
}
