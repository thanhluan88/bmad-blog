import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { isValidImageUrl } from "@/lib/image-url";

type MarkdownBodyProps = {
  content: string;
  className?: string;
};

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
    <div className={`max-w-none font-sans ${className}`} data-markdown-body>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 text-xl font-semibold tracking-tight text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold text-foreground">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 max-w-[65ch] text-base leading-relaxed text-muted">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-inside list-disc space-y-1 text-muted">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-inside list-decimal space-y-1 text-muted">
              {children}
            </ol>
          ),
          code: ({ children, className: langClass }) =>
            langClass ? (
              <code
                className={`block overflow-x-auto rounded-xl bg-surface-elevated p-4 font-mono text-sm ${langClass}`}
              >
                {children}
              </code>
            ) : (
              <code className="rounded bg-surface-elevated px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            ),
          pre: ({ children }) => (
            <pre className="mb-4 overflow-x-auto rounded-xl bg-surface-elevated p-4">
              {children}
            </pre>
          ),
          img: ({ src, alt }) => {
            if (typeof src !== "string" || !isValidImageUrl(src)) return null;
            return (
              <span className="my-6 block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={alt ?? ""}
                  loading="lazy"
                  className="max-h-[min(70vh,720px)] w-auto max-w-full rounded-xl border border-border object-contain"
                />
              </span>
            );
          },
          a: ({ href, children }) => {
            const videoId = href ? getYoutubeVideoId(href) : null;
            if (videoId) {
              return (
                <div className="my-6 aspect-video w-full overflow-hidden rounded-xl border border-border">
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
                className="font-medium text-accent underline-offset-2 hover:underline"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-accent pl-4 text-muted italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border">
              <table className="min-w-full">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-elevated">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-muted">{children}</td>
          ),
          del: ({ children }) => (
            <del className="text-muted line-through">{children}</del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
