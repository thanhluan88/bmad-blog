import Link from "next/link";
import { PMP_QUIZ_OPTIONS } from "@/lib/pmp-quiz";

export function PmpQuizPicker() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 sm:text-3xl">
        PMP — Luyện tập trắc nghiệm
      </h1>
      <p className="mt-2 text-sm text-amber-800/85 sm:text-base dark:text-amber-200/80">
        Chọn bộ đề để bắt đầu. Mỗi bộ lưu thống kê và câu sai riêng theo tên
        người dùng.
      </p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {PMP_QUIZ_OPTIONS.map((option) => (
          <li key={option.slug}>
            <Link
              href={option.href}
              className="group flex h-full flex-col rounded-xl border-2 border-amber-200/80 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:shadow-md dark:border-amber-800/50 dark:bg-amber-950/40 dark:hover:border-amber-600"
            >
              <h2 className="text-lg font-semibold text-amber-900 group-hover:text-amber-700 dark:text-amber-100 dark:group-hover:text-amber-300">
                {option.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {option.description}
              </p>
              <span className="mt-4 text-sm font-medium text-amber-700 dark:text-amber-400">
                Vào luyện tập →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
