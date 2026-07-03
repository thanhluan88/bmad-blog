import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          ページが見つかりません
        </h1>
        <p className="mt-2 text-muted">このページは存在しません。</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          ホームに戻る
        </Link>
      </main>
    </div>
  );
}
