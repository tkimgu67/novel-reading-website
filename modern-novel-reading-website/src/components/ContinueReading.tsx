import Link from "next/link";
import { PlayCircle } from "lucide-react";
import Cover from "./Cover";
import { timeAgo } from "@/lib/format";

type Item = {
  id: number;
  slug: string;
  title: string;
  author: string;
  coverUrl: string | null;
  chapterCount: number;
  chapterNumber: number;
  percent: number;
  readAt: Date;
};

export default function ContinueReading({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((n) => {
        const overall = n.chapterCount ? Math.min(100, Math.round(((n.chapterNumber - 1 + n.percent / 100) / n.chapterCount) * 100)) : 0;
        return (
          <Link
            key={n.id}
            href={`/read/${n.slug}/${n.chapterNumber}`}
            className="group flex gap-4 rounded-2xl border border-white/5 bg-coal p-3 transition hover:-translate-y-1 hover:border-sea/40"
          >
            <div className="relative shrink-0">
              <Cover src={n.coverUrl} title={n.title} className="h-28 w-20 rounded-xl" />
              <PlayCircle className="absolute inset-0 m-auto text-white opacity-0 drop-shadow-lg transition group-hover:opacity-100" size={32} />
            </div>
            <div className="flex min-w-0 flex-1 flex-col py-1">
              <p className="truncate font-display text-lg font-semibold group-hover:text-mint">{n.title}</p>
              <p className="text-sm text-mist">Chapter {n.chapterNumber} of {n.chapterCount}</p>
              <p className="text-xs text-mist/60">{timeAgo(n.readAt)}</p>
              <div className="mt-auto">
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-sea to-mint" style={{ width: `${overall}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-mint">{overall}% complete</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
