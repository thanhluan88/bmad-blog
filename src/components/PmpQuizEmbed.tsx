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
        className="w-full max-w-md rounded-xl border border-amber-200/80 bg-white p-6 shadow-sm dark:border-amber-800/50 dark:bg-zinc-900"
      >
        <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Nhập tên người dùng để vào luyện tập PMP. Thống kê và ôn câu sai được
          lưu riêng theo từng người.
        </p>
        <label className="mt-4 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Tên người dùng
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: thanh_luan"
            autoFocus
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base dark:border-zinc-600 dark:bg-zinc-800"
          />
        </label>
        <button
          type="submit"
          className="mt-4 w-full rounded-lg bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          Vào luyện tập
        </button>
      </form>
    </div>
  );
}

export function PmpQuizEmbed({ htmlPath, title }: Props) {
  const { chromeVisible } = useBlogMenu();
  const [user, setUser] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  useEffect(() => {
    const stored = readStoredUser(htmlPath);
    if (stored) {
      setUser(stored);
      setIframeSrc(buildPmpQuizUrl(htmlPath, { user: stored }));
    }
  }, [htmlPath]);

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
    <div className="flex max-md:min-h-[calc(100dvh-4.5rem)] flex-1 flex-col overflow-hidden md:rounded-xl md:border-2 md:border-amber-200/70 md:shadow-sm dark:md:border-amber-800/50">
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        title={title}
        className="block max-md:min-h-0 w-full flex-1 border-0 bg-white md:min-h-[calc(100vh-12rem)]"
      />
    </div>
  );
}
