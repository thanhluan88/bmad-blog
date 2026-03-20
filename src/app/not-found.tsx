import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-amber-50/50 dark:bg-amber-950/30">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold text-amber-900 dark:text-amber-100">
          Page not found
        </h1>
        <p className="mt-2 text-amber-800/80 dark:text-amber-200/80">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-amber-700 hover:text-amber-900 focus:outline focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:text-amber-400 dark:hover:text-amber-100"
        >
          ← Back to home
        </Link>
      </main>
    </div>
  );
}
