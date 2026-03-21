import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { isValidImageUrl } from "@/lib/image-url";

type MarkdownBodyProps = {
  content: string;
  className?: string;
};

/** Extract YouTube video ID from URL. Supports watch?v=, youtu.be/, embed/ */
function getYoutubeVideoId(href: string): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

export function MarkdownBody({ content, className = "" }: MarkdownBodyProps) {
  return (
    <div
      className={`prose prose-stone dark:prose-invert max-w-none font-sans ${className}`}
      data-markdown-body
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mt-6 mb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-amber-900/85 dark:text-amber-200/85 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 text-amber-900/85 dark:text-amber-200/85">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 text-amber-900/85 dark:text-amber-200/85">
              {children}
            </ol>
          ),
          code: ({ children, className: langClass }) =>
            langClass ? (
              <code
                className={`block p-4 rounded-md bg-amber-100 dark:bg-amber-900/50 text-sm overflow-x-auto font-mono ${langClass}`}
              >
                {children}
              </code>
            ) : (
              <code className="rounded bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 text-sm font-mono">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-md bg-amber-100 dark:bg-amber-900/50 p-4">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => {
            if (typeof src !== "string" || !isValidImageUrl(src)) return null;
            return (
              <span className="my-6 block">
                {/* eslint-disable-next-line @next/next/no-img-element -- allow arbitrary blog image URLs */}
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                  className="max-h-[min(70vh,720px)] w-auto max-w-full rounded-lg border-2 border-amber-200/70 object-contain shadow-sm dark:border-amber-800/50"
                />
              </span>
            );
          },
          a: ({ href, children }) => {
            const videoId = href ? getYoutubeVideoId(href) : null;
            if (videoId) {
              return (
                <div className="my-6 aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube動画"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              );
            }
            return (
              <a
                href={href}
                className="text-amber-800 underline hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-amber-400 dark:border-amber-700 pl-4 my-4 text-amber-800/80 dark:text-amber-300/80 italic font-sans">
              {children}
            </blockquote>
          ),
          // GFM: tables
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full border border-amber-300 dark:border-amber-700 rounded-md">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-amber-100 dark:bg-amber-900/50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-amber-200 dark:divide-amber-800">
              {children}
            </tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-sm font-semibold text-amber-900 dark:text-amber-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-sm text-amber-900/85 dark:text-amber-200/85">
              {children}
            </td>
          ),
          // GFM: strikethrough
          del: ({ children }) => (
            <del className="text-amber-700/70 dark:text-amber-400/70 line-through">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
