import { db } from "@/lib/db";
import { SidebarMenu } from "@/components/SidebarMenu";

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

  return (
    <div className="min-h-screen bg-amber-50/50 dark:bg-amber-950/30">
      <SidebarMenu posts={posts} />
      <main className="min-h-screen pt-14 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
