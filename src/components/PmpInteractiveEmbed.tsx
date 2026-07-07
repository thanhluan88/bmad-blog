"use client";

import { useBlogMenu } from "@/components/MenuInteractionProvider";

type Props = {
  htmlPath: string;
  title: string;
};

export function PmpInteractiveEmbed({ htmlPath, title }: Props) {
  const { chromeVisible } = useBlogMenu();

  if (!chromeVisible) {
    return (
      <div className="flex h-full min-h-[100dvh] flex-1 flex-col overflow-hidden">
        <iframe
          src={htmlPath}
          title={title}
          className="block h-full min-h-0 w-full flex-1 border-0 bg-[#0f1419]"
        />
      </div>
    );
  }

  return (
    <div className="flex max-md:min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:rounded-2xl md:border md:border-border">
      <iframe
        src={htmlPath}
        title={title}
        className="block max-md:min-h-0 w-full flex-1 border-0 bg-[#0f1419] md:min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
