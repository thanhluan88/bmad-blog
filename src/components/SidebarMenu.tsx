"use client";

import Link from "next/link";
import { formatUpdatedAt } from "@/lib/format";
import { useState, useRef } from "react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMenu = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const hideMenu = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      hideTimeoutRef.current = null;
    }, 150);
  };

  const isVisible = isOpen || isHovered;

  return (
    <>
      {/* Hamburger - mobile only */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed left-4 top-4 flex h-10 w-10 md:hidden items-center justify-center rounded-lg border-2 border-amber-900/40 bg-amber-50/95 shadow-md transition-colors hover:bg-amber-100/95 dark:border-amber-700/50 dark:bg-amber-950/95 dark:hover:bg-amber-900/95 ${
          isOpen ? "z-[26]" : "z-20"
        }`}
        aria-label={isOpen ? "メニューを閉じる" : "メニューを開く"}
      >
        {isOpen ? (
          <svg
            className="h-5 w-5 text-amber-900 dark:text-amber-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <span
            className="text-xl font-semibold leading-none text-amber-900 dark:text-amber-200 [font-family:ui-sans-serif,system-ui,'Segoe_UI','Yu_Gothic_UI','Meiryo','Hiragino_Sans','PingFang_SC',sans-serif]"
            aria-hidden
          >
            三
          </span>
        )}
      </button>

      {/* Hover strip: desktop only; above aside when closed so 三 stays visible */}
      <div
        className="fixed bottom-0 left-0 top-28 z-[12] hidden w-8 cursor-default select-none items-center justify-center border-r border-amber-900/30 bg-amber-50/90 md:flex dark:border-amber-700/40 dark:bg-amber-950/80"
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
        aria-hidden
      >
        <span className="text-base font-semibold text-amber-900/90 dark:text-amber-200/90 [font-family:ui-sans-serif,system-ui,'Segoe_UI','Yu_Gothic_UI','Meiryo','Hiragino_Sans','PingFang_SC',sans-serif] [writing-mode:vertical-rl]">
          三
        </span>
      </div>

      {/* Overlay when menu is open (mobile) */}
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

      {/* Sidebar - hover to show on desktop, click on mobile */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 border-r-2 border-amber-900/30 bg-amber-50/98 shadow-xl transition-transform duration-300 ease-out dark:border-amber-800/40 dark:bg-amber-950/98 ${
          isVisible ? "z-[25] translate-x-0" : "z-10 -translate-x-full"
        }`}
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
      >
        <div className="flex h-full flex-col p-4 pt-16 md:pt-4">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="mb-4 text-lg font-semibold text-amber-900 hover:text-amber-700 dark:text-amber-100 dark:hover:text-amber-300"
          >
            Blog
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
                      onClick={() => setIsOpen(false)}
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
