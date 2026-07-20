import { getSidebarNavItems } from "@/lib/sidebar-nav";
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
  let items: Awaited<ReturnType<typeof getSidebarNavItems>> = [];
  try {
    items = await getSidebarNavItems();
  } catch {
    // Sidebar empty on error
  }

  const visitCount = await incrementPageViewsAndGetTotal();

  return (
    <MenuInteractionProvider>
      <PublicLayoutShell>
        <BlogChromeHotzones />
        <BlogHeader />
        <SidebarMenu items={items} />
        <PublicMainShell>{children}</PublicMainShell>
        <BlogFooter visitCount={visitCount} />
      </PublicLayoutShell>
    </MenuInteractionProvider>
  );
}
