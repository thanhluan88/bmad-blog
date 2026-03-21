"use client";

import Link from "next/link";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { formatUpdatedAt } from "@/lib/format";

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
  const { isOpen, setIsOpen, isVisible, showMenu, hideMenu, closeOnNavigate } =
    useBlogMenu();

  return (
    <>
      {/* オーバーレイ — クリックで開いたときのみ（PCホバーでは表示しない） */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        className={`fixed inset-0 bg-stone-900/30 transition-opacity duration-300 md:hidden ${
          isOpen ? "z-[24] opacity-100" : "pointer-events-none z-10 opacity-0"
        }`}
        aria-hidden="true"
      />

      <aside
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
        className={`fixed left-0 top-0 h-full w-64 border-r-2 border-amber-900/30 bg-amber-50/98 shadow-xl transition-transform duration-300 ease-out dark:border-amber-800/40 dark:bg-amber-950/98 md:z-[12] md:translate-x-0 ${
          isVisible
            ? "max-md:z-[25] max-md:translate-x-0"
            : "max-md:z-10 max-md:-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col p-4 pt-4 md:pt-24">
          <Link
            href="/"
            onClick={closeOnNavigate}
            className="mb-4 text-lg font-semibold text-amber-900 hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300"
          >
            Menu
          </Link>
          <nav className="flex-1 overflow-y-auto">
            {posts.length === 0 ? (
              <p className="text-sm text-amber-800/70 dark:text-amber-300/70">
                記事がありません
              </p>
            ) : (
              <ul className="space-y-1">
                {posts.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/p/${post.slug}`}
                      onClick={closeOnNavigate}
                      className="block rounded-lg px-3 py-2 text-sm text-amber-900/90 transition-colors hover:bg-amber-200/60 dark:text-amber-200/90 dark:hover:bg-amber-900/50"
                    >
                      <span className="line-clamp-2">{post.title}</span>
                      <time
                        dateTime={
                          post.publishedAt
                            ? typeof post.publishedAt === "string"
                              ? post.publishedAt
                              : post.publishedAt.toISOString()
                            : ""
                        }
                        className="mt-0.5 block text-xs text-amber-800/60 dark:text-amber-400/60"
                      >
                        {post.publishedAt
                          ? formatUpdatedAt(post.publishedAt)
                          : "—"}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
