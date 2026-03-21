"use client";

import { useRef, useState, type RefObject } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type Props = {
  postId: string;
  uploadConfigured: boolean;
  contentMd: string;
  setContentMd: (value: string) => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  /** Insert requires the markdown textarea to be mounted */
  canInsert: boolean;
};

function insertMarkdownImageAtCursor(
  markdownLine: string,
  contentMd: string,
  textarea: HTMLTextAreaElement,
  setContentMd: (v: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = contentMd.slice(0, start);
  const after = contentMd.slice(end);
  const prefix = before.length > 0 && !before.endsWith("\n") ? "\n" : "";
  const suffix = after.length > 0 && !after.startsWith("\n") ? "\n" : "";
  const insert = `${prefix}${markdownLine}${suffix}`;
  const next = before + insert + after;
  const cursor = start + insert.length;
  setContentMd(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
  });
}

export function MarkdownImageInsert({
  postId,
  uploadConfigured,
  contentMd,
  setContentMd,
  textareaRef,
  canInsert,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickFile = () => {
    if (!canInsert) return;
    setError(null);
    inputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ta = textareaRef.current;
    if (!ta || !canInsert) return;

    setBusy(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("file", file);

      const res = await fetch("/api/uploads/markdown-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error?.message ??
          (res.status === 401 ? "再度ログインしてください。" : "アップロードに失敗しました。");
        setError(msg);
        return;
      }

      const url = data.publicUrl as string;
      const line = `![画像](${url})`;
      insertMarkdownImageAtCursor(line, contentMd, ta, setContentMd);
    } catch {
      setError("アップロードに失敗しました。接続を確認してください。");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  if (!uploadConfigured) {
    return (
      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        本文への画像挿入には Vercel Blob（<code className="rounded bg-zinc-100 px-0.5 dark:bg-zinc-800">BLOB_READ_WRITE_TOKEN</code>
        ）が必要です。
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        aria-hidden
        onChange={onFileChange}
      />
      <button
        type="button"
        onClick={pickFile}
        disabled={busy || !canInsert}
        title={!canInsert ? "編集モードに切り替えてください" : undefined}
        className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {busy ? "アップロード中…" : "画像をMarkdownに挿入"}
      </button>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">JPEG / PNG / WebP / GIF（4MB以下）</span>
      {!canInsert && (
        <span className="text-xs text-amber-700 dark:text-amber-400">（プレビュー中は挿入できません）</span>
      )}
      {error && <p className="w-full text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
