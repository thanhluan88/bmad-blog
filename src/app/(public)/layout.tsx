import { db } from "@/lib/db";
import { incrementPageViewsAndGetTotal } from "@/lib/site-stats";
import { MenuInteractionProvider } from "@/components/MenuInteractionProvider";
import { SidebarMenu } from "@/components/SidebarMenu";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogFooter } from "@/components/BlogFooter";

/** Counter + DB reads must run every request; static cache would show a stale 累計アクセス value. */
export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let posts: { id: string; title: string; slug: string; publishedAt: Date | null }[] = [];
  try {
    posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    // Sidebar empty on error
  }

  const visitCount = await incrementPageViewsAndGetTotal();

  return (
    <div className="flex min-h-screen flex-col bg-amber-50/50 dark:bg-amber-950/30">
      <MenuInteractionProvider>
        <BlogHeader />
        <SidebarMenu posts={posts} />
        <main className="flex-1 md:pl-64">
          {children}
        </main>
      </MenuInteractionProvider>
      <BlogFooter visitCount={visitCount} />
    </div>
  );
}
