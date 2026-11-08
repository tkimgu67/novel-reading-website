import Link from "next/link";
import { BookOpen, Eye, Layers } from "lucide-react";
import Cover from "./Cover";
import BookmarkButton from "./BookmarkButton";
import type { NovelCardData } from "@/lib/queries";
import { genreSlug } from "@/lib/genres";

export function formatNum(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

export default function NovelCard({ novel, bookmarked = false }: { novel: NovelCardData; bookmarked?: boolean }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-coal transition-all duration-500 hover:-translate-y-2 hover:border-sea/40 hover:shadow-[0_25px_60px_-20px_rgba(32,178,170,0.45)]">
      <Link href={`/novel/${novel.slug}`} className="relative block aspect-[3/4] overflow-hidden">
        <Cover src={novel.coverUrl} title={novel.title} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-coal via-coal/10 to-transparent" />
        <div className="absolute inset-0 bg-sea/0 transition-colors duration-500 group-hover:bg-sea/10" />
      </Link>
      <div className="absolute left-3 top-3">
        <Link
          href={`/categories/${genreSlug(novel.genre)}`}
          className="rounded-full border border-mint/20 bg-ink/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-mint backdrop-blur-md hover:border-mint"
        >
          {novel.genre}
        </Link>
      </div>
      <div className="absolute right-3 top-3">
        <BookmarkButton novelId={novel.id} initial={bookmarked} />
      </div>
      <div className="relative -mt-14 flex flex-1 flex-col p-5">
        <Link href={`/novel/${novel.slug}`}>
          <h3 className="font-display text-xl font-bold leading-tight text-white transition-colors group-hover:text-mint">{novel.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-sea">by {novel.author}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-mist">{novel.description}</p>
        <div className="mt-4 flex items-center gap-4 text-xs text-mist/80">
          <span className="inline-flex items-center gap-1.5"><Layers size={14} className="text-sea" /> {novel.chapterCount} chapters</span>
          <span className="inline-flex items-center gap-1.5"><Eye size={14} className="text-sea" /> {formatNum(novel.views)}</span>
        </div>
        <div className="mt-auto pt-5">
          <Link href={`/novel/${novel.slug}`} className="btn-primary w-full !py-2.5 text-sm">
            <BookOpen size={16} /> Read Now
          </Link>
        </div>
      </div>
    </article>
  );
}

export function NovelGrid({ novels, bookmarkedIds = [] }: { novels: NovelCardData[]; bookmarkedIds?: number[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {novels.map((n, i) => (
        <div key={n.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <NovelCard novel={n} bookmarked={bookmarkedIds.includes(n.id)} />
        </div>
      ))}
    </div>
  );
}
