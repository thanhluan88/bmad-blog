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
        className="fixed left-4 top-4 z-20 flex h-10 w-10 md:hidden items-center justify-center rounded-lg border-2 border-amber-900/40 bg-amber-50/95 shadow-md transition-colors hover:bg-amber-100/95 dark:border-amber-700/50 dark:bg-amber-950/95 dark:hover:bg-amber-900/95"
        aria-label={isOpen ? "Đóng menu" : "Mở menu"}
      >
        <svg
          className="h-5 w-5 text-amber-900 dark:text-amber-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Hover trigger strip - desktop only, thin strip on left edge */}
      <div
        className="fixed left-0 top-0 z-10 hidden h-full w-3 md:block"
        onMouseEnter={showMenu}
        onMouseLeave={hideMenu}
        aria-hidden
      />

      {/* Overlay when menu is open (mobile) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
        className={`fixed inset-0 z-10 bg-stone-900/30 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden="true"
      />

      {/* Sidebar - hover to show on desktop, click on mobile */}
      <aside
        className={`fixed left-0 top-0 z-10 h-full w-64 border-r-2 border-amber-900/30 bg-amber-50/98 shadow-xl transition-transform duration-300 ease-out dark:border-amber-800/40 dark:bg-amber-950/98 ${
          isVisible ? "translate-x-0" : "-translate-x-full"
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
                Chưa có bài viết
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
