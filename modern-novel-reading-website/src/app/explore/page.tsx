import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ExploreFilters from "@/components/ExploreFilters";
import { NovelGrid } from "@/components/NovelCard";
import { EmptyState, PageHeader } from "@/components/Sections";
import { getCurrentUser } from "@/lib/auth";
import { getUserBookmarkedIds, searchNovels } from "@/lib/queries";
import { GENRE_NAMES } from "@/lib/genres";

export const metadata: Metadata = { title: "Explore Novels" };

type SP = { q?: string; by?: string; genre?: string; sort?: string };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const genre = sp.genre && GENRE_NAMES.includes(sp.genre) ? sp.genre : undefined;
  const user = await getCurrentUser();
  const [results, bookmarkedIds] = await Promise.all([
    searchNovels({ q: sp.q, by: sp.by, genre, sort: sp.sort }),
    user ? getUserBookmarkedIds(user.id) : Promise.resolve([] as number[]),
  ]);

  return (
    <>
      <PageHeader eyebrow="Discover" title="Explore Novels" subtitle="Browse every published story on HeyNovelWorld. Search, filter by genre, and sort to find your next obsession." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="skeleton mb-10 h-16 rounded-3xl" />}>
          <ExploreFilters />
        </Suspense>
        <p className="mb-6 text-sm text-mist">
          {results.length} {results.length === 1 ? "novel" : "novels"} found
          {sp.q ? <> for &ldquo;<span className="text-mint">{sp.q}</span>&rdquo;</> : null}
          {genre ? <> in <span className="text-mint">{genre}</span></> : null}
        </p>
        {results.length ? (
          <NovelGrid novels={results} bookmarkedIds={bookmarkedIds} />
        ) : (
          <EmptyState
            title="No novels found"
            text="We couldn't find any published novels matching your search. Try a different keyword or genre."
            action={<Link href="/explore" className="btn-primary">Clear filters</Link>}
          />
        )}
      </div>
    </>
  );
}
