/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ChevronRight, Eye, Layers, Pencil, User } from "lucide-react";
import Cover from "@/components/Cover";
import BookmarkButton from "@/components/BookmarkButton";
import { ChapterList, StartReadingButton } from "@/components/NovelClient";
import { NovelGrid, formatNum } from "@/components/NovelCard";
import { SectionHeading } from "@/components/Sections";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { genreSlug } from "@/lib/genres";
import { getChapterList, getNovelBySlug, getUserNovelState, searchNovels } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const n = await getNovelBySlug(slug);
  return n ? { title: n.title, description: n.description.slice(0, 160) } : { title: "Novel not found" };
}

export default async function NovelPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const novel = await getNovelBySlug(slug, isAdmin);
  if (!novel) notFound();
  const [chapterList, state, related] = await Promise.all([
    getChapterList(novel.id),
    user ? getUserNovelState(user.id, novel.id) : Promise.resolve(null),
    searchNovels({ genre: novel.genre, sort: "popular" }),
  ]);
  const more = related.filter((r) => r.id !== novel.id).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden pt-28">
        {novel.coverUrl && <img src={novel.coverUrl} alt="" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/80 to-ink" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-1 text-sm text-mist">
            <Link href="/" className="hover:text-mint">Home</Link>
            <ChevronRight size={14} />
            <Link href={`/categories/${genreSlug(novel.genre)}`} className="hover:text-mint">{novel.genre}</Link>
            <ChevronRight size={14} />
            <span className="truncate text-white">{novel.title}</span>
          </nav>

          {!novel.published && (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Draft preview — this novel is unpublished and only visible to administrators.
            </div>
          )}

          <div className="grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] lg:gap-14">
            <div className="mx-auto w-60 animate-fade-up md:w-full">
              <div className="overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_100px_-30px_rgba(32,178,170,0.6)]">
                <Cover src={novel.coverUrl} title={novel.title} eager className="aspect-[3/4] w-full" />
              </div>
            </div>
            <div className="animate-fade-up [animation-delay:100ms]">
              <Link href={`/categories/${genreSlug(novel.genre)}`} className="inline-block rounded-full border border-sea/40 bg-sea/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-mint hover:bg-sea/20">
                {novel.genre}
              </Link>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{novel.title}</h1>
              <p className="mt-3 inline-flex items-center gap-2 text-lg text-mist">
                <User size={18} className="text-sea" /> by <span className="font-semibold text-white">{novel.author}</span>
              </p>

              <div className="mt-6 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { icon: Layers, label: "Chapters", value: String(novel.chapterCount) },
                  { icon: Eye, label: "Reads", value: formatNum(novel.views) },
                  { icon: CalendarDays, label: "Published", value: novel.publishedAt ? new Date(novel.publishedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Draft" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl border border-white/5 bg-coal/80 p-4 text-center">
                    <s.icon size={18} className="mx-auto text-sea" />
                    <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
                    <p className="text-xs text-mist">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <StartReadingButton slug={novel.slug} serverChapter={state?.progress?.chapterNumber ?? null} hasChapters={chapterList.length > 0} />
                <BookmarkButton novelId={novel.id} initial={state?.bookmarked ?? false} variant="full" />
                <BookmarkButton novelId={novel.id} initial={state?.favorited ?? false} kind="favorite" variant="full" />
                {isAdmin && (
                  <Link href={`/admin/novels/${novel.id}`} className="btn-ghost">
                    <Pencil size={18} /> Edit
                  </Link>
                )}
              </div>

              <div className="mt-10">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-sea">Synopsis</h2>
                <div className="max-w-3xl space-y-4 font-read text-lg leading-relaxed text-mist">
                  {novel.description.split(/\n+/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <p className="mt-6 text-sm text-mist/70">First published {formatDate(novel.publishedAt ?? novel.createdAt)} · Last updated {formatDate(novel.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-4 sm:px-6 lg:px-8">
        <section id="chapters">
          <SectionHeading eyebrow={`${chapterList.length} chapters · free`} title="Table of Contents" />
          <ChapterList
            slug={novel.slug}
            chapters={chapterList.map((c) => ({ ...c, createdAt: c.createdAt.toISOString(), words: c.words || 0 }))}
            current={state?.progress?.chapterNumber ?? null}
            bookmarkChapter={state?.bookmarkChapter ?? null}
          />
        </section>
        {more.length > 0 && (
          <section>
            <SectionHeading eyebrow="You may also like" title={`More ${novel.genre}`} href={`/categories/${genreSlug(novel.genre)}`} />
            <NovelGrid novels={more} />
          </section>
        )}
      </div>
    </>
  );
}
