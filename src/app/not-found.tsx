import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Page not found
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-zinc-600 hover:text-zinc-900 focus:outline focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
