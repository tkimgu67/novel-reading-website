import type { Metadata } from "next";
import Link from "next/link";
import { Bookmark, Clock, Heart, PlayCircle } from "lucide-react";
import ContinueReading from "@/components/ContinueReading";
import Cover from "@/components/Cover";
import { NovelGrid } from "@/components/NovelCard";
import { EmptyState, PageHeader } from "@/components/Sections";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getUserLibrary } from "@/lib/queries";

export const metadata: Metadata = { title: "My Library" };

const TABS = [
  { key: "continue", label: "Continue Reading", icon: PlayCircle },
  { key: "bookmarks", label: "Bookmarks", icon: Bookmark },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "history", label: "Reading History", icon: Clock },
] as const;

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser("/library");
  const { tab = "continue" } = await searchParams;
  const lib = await getUserLibrary(user.id);
  const inProgress = lib.history.filter((h) => !(h.chapterNumber >= h.chapterCount && h.percent >= 95));
  const counts: Record<string, number> = {
    continue: inProgress.length,
    bookmarks: lib.bookmarks.length,
    favorites: lib.favorites.length,
    history: lib.history.length,
  };
  const bookmarkedIds = lib.bookmarks.map((b) => b.id);

  return (
    <>
      <PageHeader eyebrow={`Hello, ${user.name}`} title="My Library" subtitle="Your bookmarks, favorites and reading progress — synced to your account." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex gap-2 overflow-x-auto pb-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/library?tab=${t.key}`}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                tab === t.key ? "border-sea bg-sea text-ink" : "border-white/10 text-mist hover:border-sea hover:text-mint"
              }`}
            >
              <t.icon size={16} /> {t.label}
              <span className={`rounded-full px-2 text-xs ${tab === t.key ? "bg-ink/20" : "bg-white/5"}`}>{counts[t.key]}</span>
            </Link>
          ))}
        </div>

        {tab === "continue" &&
          (inProgress.length ? (
            <ContinueReading items={inProgress} />
          ) : (
            <EmptyState title="Nothing in progress" text="Start reading any novel and we'll remember exactly where you stopped." action={<Link href="/explore" className="btn-primary">Explore Novels</Link>} />
          ))}

        {tab === "bookmarks" &&
          (lib.bookmarks.length ? (
            <div className="space-y-10">
              {lib.bookmarks.some((b) => b.bookmarkChapter) && (
                <div className="flex flex-wrap gap-3">
                  {lib.bookmarks.filter((b) => b.bookmarkChapter).map((b) => (
                    <Link key={b.id} href={`/read/${b.slug}/${b.bookmarkChapter}`} className="inline-flex items-center gap-2 rounded-full border border-sea/30 bg-sea/10 px-4 py-2 text-sm text-mint hover:bg-sea/20">
                      <Bookmark size={14} fill="currentColor" /> {b.title} · Ch. {b.bookmarkChapter}
                    </Link>
                  ))}
                </div>
              )}
              <NovelGrid novels={lib.bookmarks} bookmarkedIds={bookmarkedIds} />
            </div>
          ) : (
            <EmptyState title="No bookmarks yet" text="Tap the bookmark icon on any novel or chapter to save it here." action={<Link href="/explore" className="btn-primary">Find novels</Link>} />
          ))}

        {tab === "favorites" &&
          (lib.favorites.length ? (
            <NovelGrid novels={lib.favorites} bookmarkedIds={bookmarkedIds} />
          ) : (
            <EmptyState title="No favorites yet" text="Use the Favorite button on a novel's page to keep your most-loved stories close." action={<Link href="/explore" className="btn-primary">Discover stories</Link>} />
          ))}

        {tab === "history" &&
          (lib.history.length ? (
            <ul className="divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/5 bg-coal">
              {lib.history.map((h) => (
                <li key={h.id}>
                  <Link href={`/read/${h.slug}/${h.chapterNumber}`} className="group flex items-center gap-4 p-4 transition hover:bg-white/[0.03]">
                    <Cover src={h.coverUrl} title={h.title} className="h-16 w-12 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold group-hover:text-mint">{h.title}</p>
                      <p className="text-sm text-mist">Chapter {h.chapterNumber} of {h.chapterCount} · {h.percent}% of chapter</p>
                    </div>
                    <span className="text-xs text-mist/70">{timeAgo(h.readAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No reading history" text="Chapters you read will appear here." action={<Link href="/explore" className="btn-primary">Start reading</Link>} />
          ))}
      </div>
    </>
  );
}
