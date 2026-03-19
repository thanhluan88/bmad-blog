export default function AdminPostEditLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-3">
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-5 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="mb-1 h-4 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div>
            <div className="mb-1 h-4 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-10 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div>
            <div className="mb-1 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-64 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <div className="h-10 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
