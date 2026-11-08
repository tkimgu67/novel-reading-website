import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ExploreFilters from "@/components/ExploreFilters";
import { NovelGrid } from "@/components/NovelCard";
import { EmptyState, PageHeader } from "@/components/Sections";
import { getCurrentUser } from "@/lib/auth";
import { GENRES, genreBySlug } from "@/lib/genres";
import { getUserBookmarkedIds, searchNovels } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string; by?: string; sort?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const g = genreBySlug(slug);
  return { title: g ? `${g.name} Novels` : "Category" };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const genre = genreBySlug(slug);
  if (!genre) notFound();
  const user = await getCurrentUser();
  const [results, bookmarkedIds] = await Promise.all([
    searchNovels({ q: sp.q, by: sp.by, sort: sp.sort, genre: genre.name }),
    user ? getUserBookmarkedIds(user.id) : Promise.resolve([] as number[]),
  ]);

  return (
    <>
      <PageHeader eyebrow={`${genre.emoji} Category`} title={`${genre.name} Novels`} subtitle={`${genre.blurb}. ${results.length} published ${results.length === 1 ? "story" : "stories"} to explore.`} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="-mt-4 mb-8 flex gap-2 overflow-x-auto pb-2">
          {GENRES.map((g) => (
            <Link
              key={g.slug}
              href={`/categories/${g.slug}`}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
                g.slug === slug ? "border-sea bg-sea text-ink font-semibold" : "border-white/10 text-mist hover:border-sea hover:text-mint"
              }`}
            >
              {g.emoji} {g.name}
            </Link>
          ))}
        </div>
        <Suspense fallback={<div className="skeleton mb-10 h-16 rounded-3xl" />}>
          <ExploreFilters hideGenre />
        </Suspense>
        {results.length ? (
          <NovelGrid novels={results} bookmarkedIds={bookmarkedIds} />
        ) : (
          <EmptyState
            title={`No ${genre.name} novels yet`}
            text="New stories are added regularly. Check back soon or explore other genres."
            action={<Link href="/explore" className="btn-primary">Explore all novels</Link>}
          />
        )}
      </div>
    </>
  );
}
