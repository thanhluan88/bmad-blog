import { db } from "@/lib/db";
import { incrementPageViewsAndGetTotal } from "@/lib/site-stats";
import { SidebarMenu } from "@/components/SidebarMenu";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogFooter } from "@/components/BlogFooter";

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
      <BlogHeader />
      <SidebarMenu posts={posts} />
      <main className="flex-1">
        {children}
      </main>
      <BlogFooter visitCount={visitCount} />
    </div>
  );
}
