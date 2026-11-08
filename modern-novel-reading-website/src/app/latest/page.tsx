import type { Metadata } from "next";
import Link from "next/link";
import Cover from "@/components/Cover";
import { NovelGrid } from "@/components/NovelCard";
import { ChapterUpdates, PageHeader, SectionHeading } from "@/components/Sections";
import { getCurrentUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getLatestChapters, getNewNovels, getUpdatedNovels, getUserBookmarkedIds } from "@/lib/queries";

export const metadata: Metadata = { title: "Latest Updates" };

export default async function LatestPage() {
  const user = await getCurrentUser();
  const [chapters, newest, updated, bookmarkedIds] = await Promise.all([
    getLatestChapters(15),
    getNewNovels(8),
    getUpdatedNovels(6),
    user ? getUserBookmarkedIds(user.id) : Promise.resolve([] as number[]),
  ]);

  return (
    <>
      <PageHeader eyebrow="Live feed" title="Latest Updates" subtitle="Newly published novels, freshly added chapters and recently updated stories — updated automatically the moment they go live." />
      <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:px-8">
        <section className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionHeading eyebrow="New chapters" title="Recently Added Chapters" />
            <ChapterUpdates items={chapters} />
          </div>
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Fresh edits" title="Updated Novels" />
            <div className="grid gap-3">
              {updated.map((n) => (
                <Link key={n.id} href={`/novel/${n.slug}`} className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-coal p-3 transition hover:border-sea/40">
                  <Cover src={n.coverUrl} title={n.title} className="h-20 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold group-hover:text-mint">{n.title}</p>
                    <p className="text-sm text-mist">{n.chapterCount} chapters · {n.genre}</p>
                    <p className="text-xs text-sea">Updated {timeAgo(n.updatedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section>
          <SectionHeading eyebrow="Just published" title="New Stories" href="/explore" />
          <NovelGrid novels={newest} bookmarkedIds={bookmarkedIds} />
        </section>
      </div>
    </>
  );
}
