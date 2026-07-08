"use client";

import { FormEvent, useEffect, useState } from "react";
import { useBlogMenu } from "@/components/MenuInteractionProvider";
import { buildPmpQuizUrl, getPmpQuizUserStorageKey } from "@/lib/pmp-quiz";

type Props = {
  htmlPath: string;
  title: string;
};

function readStoredUser(htmlPath: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(getPmpQuizUserStorageKey(htmlPath))?.trim() || null;
}

function storeUser(htmlPath: string, user: string) {
  sessionStorage.setItem(getPmpQuizUserStorageKey(htmlPath), user);
}

function UserGate({
  title,
  onSubmit,
}: {
  title: string;
  onSubmit: (user: string) => void;
}) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Vui lòng nhập tên người dùng");
      return;
    }
    onSubmit(trimmed);
  }

  return (
    <div className="flex min-h-[50vh] flex-1 items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Nhập tên người dùng để vào luyện tập PMP. Thống kê và ôn câu sai được lưu riêng
          theo từng người và đồng bộ giữa các thiết bị.
        </p>
        <label className="mt-5 block text-sm font-medium text-foreground">
          Tên người dùng
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: ABC123456"
            autoFocus
            className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none ring-ring focus:border-accent focus:ring-2"
          />
        </label>
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          Vào luyện tập
        </button>
      </form>
    </div>
  );
}

export function PmpQuizEmbed({ htmlPath, title }: Props) {
  const { chromeVisible, hideChrome, showChrome } = useBlogMenu();
  const [user, setUser] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredUser(htmlPath);
    if (stored) {
      setUser(stored);
      setIframeSrc(buildPmpQuizUrl(htmlPath, { user: stored }));
    }
  }, [htmlPath]);

  useEffect(() => {
    if (!user || !iframeSrc) return;
    hideChrome();
    return () => {
      showChrome();
    };
  }, [user, iframeSrc, hideChrome, showChrome]);

  function handleUserSubmit(name: string) {
    storeUser(htmlPath, name);
    setUser(name);
    setIframeSrc(buildPmpQuizUrl(htmlPath, { user: name }));
  }

  if (!user || !iframeSrc) {
    return <UserGate title={title} onSubmit={handleUserSubmit} />;
  }

  if (!chromeVisible) {
    return (
      <div className="flex h-full min-h-[100dvh] flex-1 flex-col overflow-hidden">
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title={title}
          className="block h-full min-h-0 w-full flex-1 border-0 bg-white"
        />
      </div>
    );
  }

  return (
    <div className="flex max-md:min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:rounded-2xl md:border md:border-border">
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        className="block max-md:min-h-0 w-full flex-1 border-0 bg-white md:min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
