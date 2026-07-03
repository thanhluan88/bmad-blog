"use client";

import { useEffect, useRef, useState } from "react";
import { isValidImageUrl } from "@/lib/image-url";

type PostCoverProps = {
  coverImageUrl: string;
  alt?: string;
  className?: string;
};

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
    <figure
      className={`mb-8 overflow-hidden rounded-2xl border border-border ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverImageUrl}
        alt={alt}
        className="aspect-[16/9] w-full object-cover"
        onError={handleError}
      />
    </figure>
  );
}
