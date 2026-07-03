"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

type Props = {
  children: React.ReactNode;
  variant?: "article" | "quiz" | "wide";
};

export function ChromeAwarePageFrame({ children, variant = "article" }: Props) {
  const { chromeVisible } = useBlogMenu();

  if (variant === "quiz") {
    return (
      <div
        className={
          chromeVisible
            ? "flex min-h-0 flex-1 flex-col md:mx-auto md:max-w-6xl md:px-8 md:py-6"
            : "flex h-full min-h-0 flex-1 flex-col"
        }
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={
        chromeVisible
          ? variant === "wide"
            ? "mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14"
            : "mx-auto w-full max-w-3xl px-4 py-10 md:px-8 md:py-14"
          : "min-h-full w-full max-w-none px-4 py-4 sm:px-6 md:px-8"
      }
    >
      {children}
    </div>
  );
}
