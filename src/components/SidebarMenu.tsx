"use client";

import Link from "next/link";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { formatUpdatedAt } from "@/lib/format";
import type { SidebarNavItem } from "@/lib/sidebar-nav";

type Props = {
  items: SidebarNavItem[];
};

const postLinkClass =
  "block rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-surface-elevated";

export function SidebarMenu({ items }: Props) {
  const {
    isOpen,
    setIsOpen,
    isVisible,
    chromeVisible,
    showMenu,
    hideMenu,
    showChrome,
    scheduleHideChrome,
    closeOnNavigate,
  } = useBlogMenu();

  const sidebarVisible = chromeVisible && (isVisible || isOpen);

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        className={`fixed inset-0 bg-zinc-950/40 transition-opacity duration-300 md:hidden ${
          isOpen ? "z-[24] opacity-100" : "pointer-events-none z-10 opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        onMouseEnter={() => {
          showChrome();
          showMenu();
        }}
        onMouseLeave={() => {
          hideMenu();
          scheduleHideChrome();
        }}
        className={`fixed top-0 left-0 h-full w-64 border-r border-border bg-surface transition-transform duration-300 ease-out md:z-[12] ${
          !chromeVisible
            ? "-translate-x-full max-md:z-10 md:-translate-x-full"
            : sidebarVisible
              ? "max-md:z-[25] max-md:translate-x-0 md:translate-x-0"
              : "max-md:z-10 max-md:-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col p-5 pt-5 md:pt-20">
          <p className="mb-4 text-xs font-medium text-muted">Menu</p>
          <nav className="flex-1 overflow-y-auto">
            {items.length > 0 ? (
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={closeOnNavigate}
                      className={postLinkClass}
                    >
                      <span className="line-clamp-2 leading-snug">{item.title}</span>
                      <time
                        dateTime={
                          item.publishedAt
                            ? typeof item.publishedAt === "string"
                              ? item.publishedAt
                              : item.publishedAt.toISOString()
                            : ""
                        }
                        className="mt-1 block text-xs text-muted"
                      >
                        {item.publishedAt
                          ? formatUpdatedAt(item.publishedAt)
                          : "Chưa có ngày"}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 text-sm text-muted">Chưa có bài viết</p>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
