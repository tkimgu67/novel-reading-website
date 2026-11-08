/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { BookOpen, Compass, Sparkles, Infinity as InfinityIcon, ShieldCheck, PlayCircle } from "lucide-react";
import { NovelGrid } from "@/components/NovelCard";
import { CategoryGrid, ChapterUpdates, SectionHeading } from "@/components/Sections";
import Cover from "@/components/Cover";
import ContinueReading from "@/components/ContinueReading";
import { getCurrentUser } from "@/lib/auth";
import {
  getFeaturedNovels,
  getGenreCounts,
  getLatestChapters,
  getNewNovels,
  getPopularNovels,
  getUserBookmarkedIds,
  getUserLibrary,
} from "@/lib/queries";

export default async function Home({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [featured, popular, newest, latest, counts] = await Promise.all([
    getFeaturedNovels(8),
    getPopularNovels(4),
    getNewNovels(4),
    getLatestChapters(6),
    getGenreCounts(),
  ]);
  const bookmarkedIds = user ? await getUserBookmarkedIds(user.id) : [];
  const history = user ? (await getUserLibrary(user.id)).history.slice(0, 4) : [];
  const firstNovel = featured[0] ?? popular[0];
  const floating = (featured.length ? featured : popular).slice(0, 4);

  return (
    <>
      {sp.denied && (
        <div className="fixed left-1/2 top-24 z-40 -translate-x-1/2 animate-fade-up rounded-full border border-red-400/30 bg-red-950/80 px-5 py-2 text-sm text-red-200 backdrop-blur">
          That area is restricted to administrators.
        </div>
      )}

      {/* HERO */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden">
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 animate-glow rounded-full bg-sea/25 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-10 h-80 w-80 animate-glow rounded-full bg-mint/15 blur-[120px] [animation-delay:2s]" />
        {/* particles */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-1 animate-float-slow rounded-full bg-mint/70 shadow-[0_0_10px_2px_rgba(141,229,214,0.6)]"
              style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%`, animationDelay: `${i * 0.6}s`, opacity: 0.3 + ((i * 7) % 6) / 10 }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-32 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <span className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-sea/30 bg-sea/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-mint">
              <Sparkles size={14} /> 100% Free Reading
            </span>
            <h1 className="mt-6 animate-fade-up font-display text-5xl font-extrabold leading-[1.05] [animation-delay:80ms] sm:text-6xl lg:text-7xl">
              Enter a World <span className="text-gradient italic">Beyond Imagination</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-mist [animation-delay:160ms]">
              Discover beautiful stories, unforgettable characters and endless adventures. Read your favorite novels for FREE.
            </p>
            <div className="mt-10 flex animate-fade-up flex-wrap gap-4 [animation-delay:240ms]">
              <Link href="/explore" className="btn-primary !px-7 !py-3.5 text-base">
                <Compass size={20} /> Explore Novels
              </Link>
              <Link href={firstNovel ? `/read/${firstNovel.slug}/1` : "/explore"} className="btn-ghost !px-7 !py-3.5 text-base">
                <PlayCircle size={20} /> Start Reading
              </Link>
            </div>
            <div className="mt-12 flex animate-fade-up flex-wrap gap-8 text-sm text-mist [animation-delay:320ms]">
              <span className="inline-flex items-center gap-2"><InfinityIcon size={18} className="text-sea" /> Unlimited chapters</span>
              <span className="inline-flex items-center gap-2"><BookOpen size={18} className="text-sea" /> Beautiful reader</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={18} className="text-sea" /> No paywalls</span>
            </div>
          </div>

          <div className="relative hidden h-[520px] lg:block" aria-hidden>
            {floating.map((n, i) => {
              const pos = [
                "left-[18%] top-[6%] w-52 [--r:-8deg] z-20",
                "right-[6%] top-[0%] w-44 [--r:7deg] z-10",
                "left-[2%] bottom-[2%] w-40 [--r:6deg] z-10",
                "right-[16%] bottom-[0%] w-48 [--r:-5deg] z-30",
              ][i];
              return (
                <Link
                  key={n.id}
                  href={`/novel/${n.slug}`}
                  tabIndex={-1}
                  className={`absolute ${pos} animate-float overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_80px_-20px_rgba(32,178,170,0.55)] transition hover:border-mint`}
                  style={{ animationDelay: `${i * 1.3}s` }}
                >
                  <Cover src={n.coverUrl} title={n.title} eager className="aspect-[3/4] w-full" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-28 px-4 sm:px-6 lg:px-8">
        {history.length > 0 && (
          <section>
            <SectionHeading eyebrow="Welcome back" title="Continue Reading" href="/library" linkLabel="My Library" />
            <ContinueReading items={history} />
          </section>
        )}

        <section id="featured">
          <SectionHeading eyebrow="Hand-picked" title="Featured Novels" href="/explore" />
          {featured.length ? (
            <NovelGrid novels={featured} bookmarkedIds={bookmarkedIds} />
          ) : (
            <p className="text-mist">No featured novels yet.</p>
          )}
        </section>

        <section>
          <SectionHeading eyebrow="Find your genre" title="Novel Categories" href="/categories" />
          <CategoryGrid counts={counts} />
        </section>

        <section className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <SectionHeading eyebrow="Fresh off the press" title="Latest Chapters" href="/latest" />
            <ChapterUpdates items={latest} />
          </div>
          <div className="lg:col-span-2">
            <SectionHeading eyebrow="Just arrived" title="New Stories" />
            <div className="grid gap-4">
              {newest.map((n) => (
                <Link key={n.id} href={`/novel/${n.slug}`} className="group flex gap-4 rounded-2xl border border-white/5 bg-coal p-3 transition hover:border-sea/40">
                  <Cover src={n.coverUrl} title={n.title} className="h-24 w-[4.5rem] shrink-0 rounded-xl" />
                  <div className="min-w-0 py-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-sea">{n.genre}</p>
                    <p className="truncate font-display text-lg font-semibold group-hover:text-mint">{n.title}</p>
                    <p className="text-sm text-mist">by {n.author} · {n.chapterCount} ch.</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHeading eyebrow="Readers love these" title="Most Popular" href="/explore?sort=popular" />
          <NovelGrid novels={popular} bookmarkedIds={bookmarkedIds} />
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-sea/20 bg-gradient-to-br from-coal via-coal-2 to-ink px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-sea/25 blur-[100px]" />
          <h2 className="relative font-display text-3xl font-bold sm:text-5xl">Your next favorite story is waiting</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-mist">
            Create a free account to build your library, bookmark chapters and pick up exactly where you left off — on any device.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link href="/library" className="btn-primary">Open My Library</Link>
            ) : (
              <Link href="/signup" className="btn-primary">Create Free Account</Link>
            )}
            <Link href="/explore" className="btn-ghost">Browse Novels</Link>
          </div>
        </section>
      </div>
    </>
  );
}
