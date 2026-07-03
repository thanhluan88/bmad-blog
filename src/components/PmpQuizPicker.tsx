import Image from "next/image";
import Link from "next/link";
import { PMP_QUIZ_OPTIONS } from "@/lib/pmp-quiz";

type Props = {
  showIntro?: boolean;
};

export function PmpQuizPicker({ showIntro = true }: Props) {
  const [primary, secondary] = PMP_QUIZ_OPTIONS;

  return (
    <div className="w-full">
      {showIntro && (
        <p className="max-w-[65ch] text-base leading-relaxed text-muted">
          Chọn bộ đề để bắt đầu luyện tập. Thống kê được lưu riêng theo từng bộ và từng
          người dùng.
        </p>
      )}

      <div className={`grid gap-4 ${showIntro ? "mt-6" : ""} lg:grid-cols-12`}>
        <Link
          href={primary.href}
          className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent active:scale-[0.99] lg:col-span-7 lg:min-h-[220px]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-soft/80 via-transparent to-transparent dark:from-accent-soft/30" />
          <div className="relative">
            <p className="font-mono text-xs text-accent">{primary.title}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground group-hover:text-accent">
              {primary.title}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {primary.description}
            </p>
            <span className="mt-6 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-accent-hover">
              Vào luyện tập
            </span>
          </div>
        </Link>

        <Link
          href={secondary.href}
          className="group flex flex-col justify-between rounded-2xl border border-border bg-surface-elevated p-6 transition-all hover:border-accent active:scale-[0.99] lg:col-span-5"
        >
          <div>
            <p className="font-mono text-xs text-muted">ExamTopics</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground group-hover:text-accent">
              {secondary.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {secondary.description}
            </p>
          </div>
          <span className="mt-6 text-sm font-medium text-accent">Mở bộ đề</span>
        </Link>
      </div>
    </div>
  );
}

export function PmpHubHero() {
  return (
    <section className="animate-rise-in mb-12 grid gap-8 lg:grid-cols-2 lg:items-center">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Luyện PMP
          <span className="block text-accent">theo nhịp của bạn</span>
        </h1>
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-muted">
          Hai bộ đề trắc nghiệm, thi thử 180 câu, ôn câu sai và đồng bộ tiến độ giữa các
          thiết bị.
        </p>
        <Link
          href="#chon-bo-de"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
        >
          Chọn bộ đề
        </Link>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-surface-elevated">
        <Image
          src="https://picsum.photos/seed/pmp-study-focus/1200/900"
          alt="Không gian học tập tập trung"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/35 to-transparent" />
      </div>
    </section>
  );
}
