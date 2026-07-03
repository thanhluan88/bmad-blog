"use client";

import Link from "next/link";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { formatUpdatedAt } from "@/lib/format";
import { PMP_HUB_SLUG } from "@/lib/pmp-quiz";
import { PMP_HUB_POST_TITLE } from "@/lib/seed-pmp-post";

type Post = {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | string | null;
};

type Props = {
  posts: Post[];
};

export function SidebarMenu({ posts }: Props) {
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
          <p className="mb-4 text-xs font-medium text-muted">Điều hướng</p>
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1">
              <li>
                <Link
                  href={`/p/${PMP_HUB_SLUG}`}
                  onClick={closeOnNavigate}
                  className="block rounded-xl bg-accent px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  {PMP_HUB_POST_TITLE}
                </Link>
              </li>
            </ul>
            {posts.length > 0 && (
              <ul className="mt-6 space-y-0.5">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/p/${post.slug}`}
                      onClick={closeOnNavigate}
                      className="block rounded-lg px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-surface-elevated"
                    >
                      <span className="line-clamp-2 leading-snug">{post.title}</span>
                      <time
                        dateTime={
                          post.publishedAt
                            ? typeof post.publishedAt === "string"
                              ? post.publishedAt
                              : post.publishedAt.toISOString()
                            : ""
                        }
                        className="mt-1 block text-xs text-muted"
                      >
                        {post.publishedAt
                          ? formatUpdatedAt(post.publishedAt)
                          : "Chưa có ngày"}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {posts.length === 0 && (
              <p className="mt-6 px-3 text-sm text-muted">Chưa có bài viết khác</p>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
