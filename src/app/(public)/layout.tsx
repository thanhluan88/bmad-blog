import { db } from "@/lib/db";
import { shouldShowPostInSidebar } from "@/lib/pmp-quiz";
import { incrementPageViewsAndGetTotal } from "@/lib/site-stats";
import { MenuInteractionProvider } from "@/components/MenuInteractionProvider";
import { SidebarMenu } from "@/components/SidebarMenu";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogFooter } from "@/components/BlogFooter";
import { PublicMainShell } from "@/components/PublicMainShell";
import { PublicLayoutShell } from "@/components/PublicLayoutShell";
import { BlogChromeHotzones } from "@/components/BlogChromeHotzones";

/** Counter + DB reads must run every request; static cache would show a stale 累計アクセス value. */
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let posts: { id: string; title: string; slug: string; publishedAt: Date | null }[] = [];
  try {
    const allPosts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
    posts = allPosts.filter((post) => shouldShowPostInSidebar(post.slug));
  } catch {
    // Sidebar empty on error
  }

  const visitCount = await incrementPageViewsAndGetTotal();

  return (
    <MenuInteractionProvider>
      <PublicLayoutShell>
        <BlogChromeHotzones />
        <BlogHeader />
        <SidebarMenu posts={posts} />
        <PublicMainShell>{children}</PublicMainShell>
        <BlogFooter visitCount={visitCount} />
      </PublicLayoutShell>
    </MenuInteractionProvider>
  );
}
