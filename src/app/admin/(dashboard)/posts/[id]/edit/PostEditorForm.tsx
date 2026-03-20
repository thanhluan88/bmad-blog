"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarkdownBody } from "@/components/MarkdownBody";
import { CoverUploadWidget } from "@/components/CoverUploadWidget";
import { formatUpdatedAt } from "@/lib/format";
import {
  checkSlugAvailability,
  publishPost,
  unpublishPost,
  updateDraftPost,
  type FormState,
} from "./actions";

function SaveStateIndicator({ state }: { state: FormState }) {
  const { pending } = useFormStatus();
  if (pending) return <span className="text-sm text-zinc-500 dark:text-zinc-400">Saving…</span>;
  if (state.success) return <span className="text-sm text-green-600 dark:text-green-400">Saved</span>;
  if (state.errors && !state.success) return <span className="text-sm text-red-600 dark:text-red-400">Failed—retry</span>;
  return null;
}

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  contentMd: string;
  updatedAt: Date | string;
  coverImageUrl?: string | null;
  coverObject?: string | null;
};

type SlugCheckStatus = "idle" | "checking" | "available" | "taken" | "invalid";

const SLUG_DEBOUNCE_MS = 400;

export function PostEditorForm({ post, uploadConfigured = true }: { post: Post; uploadConfigured?: boolean }) {
  const router = useRouter();
  const actionWithId = updateDraftPost.bind(null, post.id);
  const [state, formAction] = useActionState(actionWithId, {} as FormState);

  const [slugValue, setSlugValue] = useState(post.slug);
  const [slugCheck, setSlugCheck] = useState<SlugCheckStatus>("idle");
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const [titleValue, setTitleValue] = useState(post.title);
  const [contentMd, setContentMd] = useState(post.contentMd);
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [unpublishDialogOpen, setUnpublishDialogOpen] = useState(false);
  const [publishResult, setPublishResult] = useState<{ success: true; slug: string } | null>(null);
  const [publishPending, setPublishPending] = useState(false);
  const [unpublishPending, setUnpublishPending] = useState(false);
  const [publishErrors, setPublishErrors] = useState<FormState["errors"] | null>(null);
  const [coverObject, setCoverObject] = useState<string | null>(post.coverObject ?? null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(post.coverImageUrl ?? null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugValueRef = useRef(slugValue);

  slugValueRef.current = slugValue;

  const canPublish =
    slugCheck !== "taken" &&
    slugCheck !== "invalid" &&
    slugValue.trim().length > 0 &&
    titleValue.trim().length > 0 &&
    contentMd.trim().length > 0;

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishPending(true);
    setPublishErrors(null);
    const result = await publishPost(post.id, {
      title: titleValue.trim(),
      slug: slugValue.trim().toLowerCase(),
      contentMd,
      coverObject,
      coverImageUrl,
    });
    setPublishPending(false);
    setPublishDialogOpen(false);
    if (result.success) {
      setPublishResult({ success: true, slug: result.slug });
      setPublishErrors(null);
      router.refresh();
    } else {
      setPublishErrors(result.errors ?? { title: "Unable to publish" });
    }
  };

  const openPublishDialog = () => {
    setPublishErrors(null);
    setPublishDialogOpen(true);
  };

  const handleUnpublish = async () => {
    setUnpublishPending(true);
    const result = await unpublishPost(post.id);
    setUnpublishPending(false);
    setUnpublishDialogOpen(false);
    if (result.success) {
      setPublishResult(null);
      router.refresh();
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = slugValue.trim().toLowerCase();
    if (!trimmed) {
      setSlugCheck("idle");
      setSuggestedSlugs([]);
      return;
    }
    if (trimmed === post.slug) {
      setSlugCheck("available");
      setSuggestedSlugs([]);
      return;
    }

    setSlugCheck("checking");
    setSuggestedSlugs([]);

    debounceRef.current = setTimeout(async () => {
      debounceRef.current = null;
      const result = await checkSlugAvailability(trimmed, post.id);
      const currentTrimmed = slugValueRef.current.trim().toLowerCase();
      if (currentTrimmed !== trimmed) return;
      if ("invalidFormat" in result && result.invalidFormat) {
        setSlugCheck("invalid");
        return;
      }
      if (result.available) {
        setSlugCheck("available");
        setSuggestedSlugs([]);
      } else {
        setSlugCheck("taken");
        setSuggestedSlugs("suggested" in result ? result.suggested : []);
      }
    }, SLUG_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slugValue, post.slug, post.id]);

  const isPublished = post.status === "PUBLISHED";
  const statusLabel = isPublished ? "PUBLISHED (public)" : "DRAFT (private)";
  const statusClass =
    isPublished
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";

  const slugError = state.errors?.slug ?? publishErrors?.slug;
  const slugCheckError = slugCheck === "taken" || slugCheck === "invalid";

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="coverObject" value={coverObject ?? ""} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl ?? ""} />
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
            Post details
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Last updated: {formatUpdatedAt(post.updatedAt)}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <CoverUploadWidget
            postId={post.id}
            initialCoverUrl={coverImageUrl ?? post.coverImageUrl}
            onCoverAttached={(obj, url) => {
              setCoverObject(obj);
              setCoverImageUrl(url);
            }}
            uploadConfigured={uploadConfigured}
          />
          <div>
            <label
              htmlFor="title"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              aria-invalid={!!state.errors?.title || !!publishErrors?.title}
              aria-describedby={state.errors?.title || publishErrors?.title ? "title-error" : undefined}
            />
            {(state.errors?.title || publishErrors?.title) && (
              <p id="title-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors?.title ?? publishErrors?.title}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slugValue}
              onChange={(e) => setSlugValue(e.target.value)}
              className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              aria-invalid={!!slugError || slugCheckError}
              aria-describedby={
                slugError || slugCheckError
                  ? "slug-error slug-suggestions"
                  : undefined
              }
            />
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {slugCheck === "checking" && (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  checking…
                </span>
              )}
              {slugCheck === "available" && slugValue.trim() && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  available
                </span>
              )}
              {slugCheck === "taken" && (
                <span className="text-sm text-red-600 dark:text-red-400">
                  already used
                </span>
              )}
              {slugCheck === "invalid" && slugValue.trim() && (
                <span className="text-sm text-amber-600 dark:text-amber-400">
                  invalid format (letters, numbers, hyphens only)
                </span>
              )}
            </div>
            {(slugError || slugCheck === "taken" || publishErrors?.slug) && (
              <div id="slug-error" className="mt-1 space-y-1">
                {(slugError || slugCheck === "taken" || publishErrors?.slug) && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {slugError ?? publishErrors?.slug ?? "Slug already in use"}
                  </p>
                )}
                {slugCheck === "taken" && suggestedSlugs.length > 0 && (
                  <p id="slug-suggestions" className="text-sm text-zinc-600 dark:text-zinc-400">
                    Try:{" "}
                    {suggestedSlugs.map((s, i) => (
                      <span key={s}>
                        {i > 0 && ", "}
                        <button
                          type="button"
                          onClick={() => setSlugValue(s)}
                          className="font-mono text-zinc-900 underline hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
                        >
                          {s}
                        </button>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="contentMd"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Content (Markdown)
              </label>
              <div className="flex rounded-md border border-zinc-300 dark:border-zinc-700 p-0.5">
                <button
                  type="button"
                  onClick={() => setEditorMode("write")}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-zinc-500 dark:focus:ring-offset-zinc-900 ${
                    editorMode === "write"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                  aria-pressed={editorMode === "write"}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 dark:focus:ring-zinc-500 dark:focus:ring-offset-zinc-900 ${
                    editorMode === "preview"
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                  aria-pressed={editorMode === "preview"}
                >
                  Preview
                </button>
              </div>
            </div>
            {editorMode === "write" ? (
              <textarea
                id="contentMd"
                name="contentMd"
                rows={16}
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                aria-invalid={!!state.errors?.contentMd}
                aria-describedby={state.errors?.contentMd ? "contentMd-error" : undefined}
              />
            ) : (
              <>
                <input type="hidden" name="contentMd" value={contentMd} />
                <div
                  className="min-h-[384px] w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 font-sans"
                  aria-hidden="true"
                >
                  <MarkdownBody content={contentMd} className="py-2" />
                </div>
              </>
            )}
            {(state.errors?.contentMd || publishErrors?.contentMd) && (
              <p id="contentMd-error" className="mt-1 text-sm text-red-600 dark:text-red-400">
                {state.errors?.contentMd ?? publishErrors?.contentMd}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Save
        </button>
        {!isPublished && (
          <button
            type="button"
            onClick={openPublishDialog}
            disabled={!canPublish}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-700 dark:hover:bg-green-800"
          >
            Publish
          </button>
        )}
        {isPublished && (
          <button
            type="button"
            onClick={() => setUnpublishDialogOpen(true)}
            className="rounded-md border border-amber-600 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:border-amber-500 dark:text-amber-500 dark:hover:bg-amber-950/50"
          >
            Unpublish
          </button>
        )}
        {publishResult?.success && (
          <Link
            href={`/p/${publishResult.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            View public post
          </Link>
        )}
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Back to posts
        </Link>
        <SaveStateIndicator state={state} />
      </div>

      {publishDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-dialog-title"
        >
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 id="publish-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Publish post
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This will make the post public at <code className="font-mono">/p/{slugValue.trim() || "..."}</code>
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPublishDialogOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishPending || !canPublish}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-800"
              >
                {publishPending ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      )}

      {unpublishDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unpublish-dialog-title"
        >
          <div className="mx-4 max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 id="unpublish-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Unpublish post
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This will make the post private. It will no longer be visible at the public URL.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnpublishDialogOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={unpublishPending}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-800"
              >
                {unpublishPending ? "Unpublishing…" : "Unpublish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
