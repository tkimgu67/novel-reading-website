import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import Cover from "./Cover";
import { GENRES } from "@/lib/genres";
import { timeAgo } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-sea">{eyebrow}</p>}
        <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 text-sm font-medium text-mint hover:text-white">
          {linkLabel} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="relative overflow-hidden pb-12 pt-32 sm:pt-36">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[48rem] -translate-x-1/2 rounded-full bg-sea/20 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-sea">{eyebrow}</p>}
        <h1 className="animate-fade-up font-display text-4xl font-bold sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl animate-fade-up text-lg text-mist [animation-delay:100ms]">{subtitle}</p>}
      </div>
    </section>
  );
}

export function CategoryGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {GENRES.map((g) => (
        <Link
          key={g.slug}
          href={`/categories/${g.slug}`}
          className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${g.gradient} p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sea/50 hover:shadow-[0_15px_40px_-15px_rgba(32,178,170,0.5)]`}
        >
          <div className="absolute inset-0 bg-coal/70 transition-colors group-hover:bg-coal/50" />
          <div className="relative">
            <span className="text-3xl transition-transform duration-300 group-hover:scale-125 inline-block">{g.emoji}</span>
            <h3 className="mt-3 font-display text-lg font-semibold">{g.name}</h3>
            <p className="mt-1 text-xs text-mist">{g.blurb}</p>
            <p className="mt-3 text-xs font-semibold text-mint">
              {counts[g.name] ?? 0} {(counts[g.name] ?? 0) === 1 ? "novel" : "novels"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export type ChapterUpdate = {
  id: number;
  number: number;
  title: string;
  createdAt: Date;
  novelSlug: string;
  novelTitle: string;
  novelCover: string | null;
  genre: string;
  author: string;
};

export function ChapterUpdates({ items }: { items: ChapterUpdate[] }) {
  if (!items.length) return <p className="text-mist">No chapters published yet.</p>;
  return (
    <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/5 bg-coal">
      {items.map((c) => (
        <li key={c.id}>
          <Link href={`/read/${c.novelSlug}/${c.number}`} className="group flex items-center gap-4 p-4 transition hover:bg-white/[0.03] sm:p-5">
            <Cover src={c.novelCover} title={c.novelTitle} className="h-16 w-12 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold group-hover:text-mint">{c.novelTitle}</p>
              <p className="truncate text-sm text-mist">
                <span className="text-sea">Chapter {c.number}</span> · {c.title}
              </p>
            </div>
            <div className="hidden shrink-0 text-right sm:block">
              <span className="rounded-full bg-sea/10 px-2.5 py-1 text-[11px] font-medium text-mint">{c.genre}</span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-mist/70">
              <Clock size={12} /> {timeAgo(c.createdAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-coal/50 px-6 py-16 text-center">
      <div className="text-5xl">📚</div>
      <h3 className="mt-4 font-display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-mist">{text}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
