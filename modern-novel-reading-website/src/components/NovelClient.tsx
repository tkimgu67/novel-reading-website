"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, BookOpen, Bookmark, PlayCircle, Search } from "lucide-react";

export function StartReadingButton({
  slug,
  serverChapter,
  hasChapters,
}: {
  slug: string;
  serverChapter: number | null;
  hasChapters: boolean;
}) {
  const [last, setLast] = useState<number | null>(serverChapter);
  useEffect(() => {
    if (serverChapter) return;
    try {
      const v = localStorage.getItem(`hnw:last:${slug}`);
      if (v) setLast(Number(JSON.parse(v).chapter) || null);
    } catch {}
  }, [slug, serverChapter]);

  if (!hasChapters) return <button disabled className="btn-primary">No chapters yet</button>;
  return last && last > 1 ? (
    <Link href={`/read/${slug}/${last}`} className="btn-primary !px-7">
      <PlayCircle size={18} /> Continue · Ch. {last}
    </Link>
  ) : (
    <Link href={`/read/${slug}/1`} className="btn-primary !px-7">
      <BookOpen size={18} /> Start Reading
    </Link>
  );
}

type Ch = { id: number; number: number; title: string; createdAt: string; words: number };

export function ChapterList({
  slug,
  chapters,
  current,
  bookmarkChapter,
}: {
  slug: string;
  chapters: Ch[];
  current: number | null;
  bookmarkChapter: number | null;
}) {
  const [desc, setDesc] = useState(false);
  const [filter, setFilter] = useState("");
  const [localCurrent, setLocalCurrent] = useState<number | null>(current);

  useEffect(() => {
    if (current) return;
    try {
      const v = localStorage.getItem(`hnw:last:${slug}`);
      if (v) setLocalCurrent(Number(JSON.parse(v).chapter) || null);
    } catch {}
  }, [slug, current]);

  const list = useMemo(() => {
    const f = filter.trim().toLowerCase();
    const l = chapters.filter((c) => !f || c.title.toLowerCase().includes(f) || String(c.number) === f);
    return desc ? [...l].reverse() : l;
  }, [chapters, desc, filter]);

  if (!chapters.length) {
    return <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-mist">Chapters are coming soon. Bookmark this novel to find it easily later.</div>;
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sea" />
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Find a chapter…" className="input !rounded-full !pl-10" />
        </div>
        <button onClick={() => setDesc((v) => !v)} className="btn-ghost !py-2.5 text-sm">
          <ArrowDownUp size={16} /> {desc ? "Newest first" : "Oldest first"}
        </button>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((c) => {
          const isCurrent = localCurrent === c.number;
          return (
            <li key={c.id}>
              <Link
                href={`/read/${slug}/${c.number}`}
                className={`group flex items-center gap-4 rounded-2xl border p-4 transition hover:border-sea/50 hover:bg-white/[0.03] ${
                  isCurrent ? "border-sea/50 bg-sea/5" : "border-white/5 bg-coal"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink font-semibold text-sea">{c.number}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium group-hover:text-mint">{c.title}</p>
                  <p className="text-xs text-mist/70">
                    {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {Math.max(1, Math.round(c.words / 220))} min read
                  </p>
                </div>
                {bookmarkChapter === c.number && <Bookmark size={16} className="text-mint" fill="currentColor" />}
                {isCurrent && <span className="rounded-full bg-sea px-2 py-0.5 text-[10px] font-bold uppercase text-ink">Reading</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      {!list.length && <p className="p-6 text-center text-mist">No chapters match &ldquo;{filter}&rdquo;.</p>}
    </div>
  );
}
