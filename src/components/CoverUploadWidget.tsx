"use client";

import { useRef, useState } from "react";

const MAX_SIZE_BYTES = 4 * 1024 * 1024; // 4MB (Vercel request limit)
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type CoverUploadWidgetProps = {
  postId: string;
  initialCoverUrl?: string | null;
  onCoverAttached: (objectPath: string, publicUrl: string) => void;
  /** When false, upload is disabled and a setup hint is shown */
  uploadConfigured?: boolean;
};

type UploadState = "idle" | "uploading" | "success" | "failure";

export function CoverUploadWidget({
  postId,
  initialCoverUrl,
  onCoverAttached,
  uploadConfigured = true,
}: CoverUploadWidgetProps) {
  const [state, setState] = useState<UploadState>(initialCoverUrl ? "success" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(initialCoverUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setState("failure");
      setErrorMessage("File must be JPEG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setState("failure");
      setErrorMessage("File must be 4MB or less.");
      return;
    }

    setState("uploading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("postId", postId);
      formData.append("file", file);

      const res = await fetch("/api/uploads/cover", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.error?.message ?? (res.status === 401 ? "Please log in again." : "Upload failed. Try again.");
        const details = data?.error?.details;
        setState("failure");
        setErrorMessage(details ? `${msg} (${details})` : msg);
        return;
      }

      const { objectPath, publicUrl } = data;

      setCoverUrl(publicUrl);
      setState("success");
      onCoverAttached(objectPath, publicUrl);
    } catch {
      setState("failure");
      setErrorMessage("Upload failed. Check your connection and try again.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRetry = () => {
    setState("idle");
    setErrorMessage(null);
    fileInputRef.current?.click();
  };

  if (!uploadConfigured) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cover image
        </label>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Upload not configured. Create a Blob store in Vercel Dashboard → Storage, then add{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">BLOB_READ_WRITE_TOKEN</code> to{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">.env.local</code>. Run{" "}
          <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">vercel env pull</code> to copy from Vercel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Cover image
      </label>
      <div className="flex flex-wrap items-start gap-4">
        {state === "success" && coverUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- external Blob URL, thumbnail preview */}
            <img
              src={coverUrl}
              alt="Cover preview"
              className="h-24 w-40 rounded-md border border-zinc-200 object-cover dark:border-zinc-700"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(",")}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Choose cover image"
          />
          {state === "uploading" && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400">Uploading…</span>
          )}
          {state === "failure" && (
            <>
              <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-sm font-medium text-zinc-900 underline hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
              >
                Retry
              </button>
            </>
          )}
          {(state === "idle" || state === "success") && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {state === "success" ? "Replace cover" : "Upload cover"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
