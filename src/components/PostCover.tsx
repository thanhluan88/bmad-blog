"use client";

import { useEffect, useRef, useState } from "react";

type PostCoverProps = {
  coverImageUrl: string;
  alt?: string;
  className?: string;
};

/** Whitelist https/http and relative /api/blob; reject javascript:, data:, vbscript:, protocol-relative. */
function isValidImageUrl(url: string): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("//")
  ) {
    return false;
  }
  if (lower.startsWith("https://") || lower.startsWith("http://")) return true;
  if (lower.startsWith("/api/blob")) return true;
  return false;
}

/**
 * Renders a post cover image with graceful fallback.
 * On load error (404, CORS, network), hides the image to keep layout intact.
 */
export function PostCover({ coverImageUrl, alt = "Cover", className = "" }: PostCoverProps) {
  const [hasError, setHasError] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setHasError(false);
  }, [coverImageUrl]);

  if (!coverImageUrl?.trim()) return null;
  if (!isValidImageUrl(coverImageUrl)) return null;
  if (hasError) return null;

  const handleError = () => {
    if (mountedRef.current) setHasError(true);
  };

  return (
    <figure className={`mb-8 overflow-hidden rounded-lg border-2 border-amber-200/60 dark:border-amber-800/50 shadow-md ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- Intentional: onError fallback for graceful cover load failure per story 4.3 */}
      <img
        src={coverImageUrl}
        alt={alt}
        className="w-full aspect-[16/9] object-cover"
        onError={handleError}
      />
    </figure>
  );
}
