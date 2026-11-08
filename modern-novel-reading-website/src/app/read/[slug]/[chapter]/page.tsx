import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Reader from "@/components/Reader";
import { getCurrentUser } from "@/lib/auth";
import { getChapter, getChapterList, getNovelBySlug, getUserNovelState, incrementViews } from "@/lib/queries";

type Props = { params: Promise<{ slug: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter } = await params;
  const n = await getNovelBySlug(slug);
  return { title: n ? `${n.title} — Chapter ${chapter}` : "Reading" };
}

export default async function ReadPage({ params }: Props) {
  const { slug, chapter } = await params;
  const num = Number(chapter);
  if (!Number.isInteger(num) || num < 1) notFound();
  const user = await getCurrentUser();
  const novel = await getNovelBySlug(slug, user?.role === "admin");
  if (!novel) notFound();
  const [ch, list, state] = await Promise.all([
    getChapter(novel.id, num),
    getChapterList(novel.id),
    user ? getUserNovelState(user.id, novel.id) : Promise.resolve(null),
  ]);
  if (!ch) notFound();
  incrementViews(novel.id).catch(() => {});

  const idx = list.findIndex((c) => c.number === num);
  const prev = idx > 0 ? list[idx - 1].number : null;
  const next = idx >= 0 && idx < list.length - 1 ? list[idx + 1].number : null;

  return (
    <Reader
      novel={{ id: novel.id, slug: novel.slug, title: novel.title, author: novel.author }}
      chapter={{ number: ch.number, title: ch.title, content: ch.content, updatedAt: ch.updatedAt.toISOString() }}
      chapters={list.map((c) => ({ number: c.number, title: c.title }))}
      prev={prev}
      next={next}
      loggedIn={!!user}
      bookmarkChapter={state?.bookmarkChapter ?? null}
      savedPercent={state?.progress?.chapterNumber === num ? state.progress.percent : null}
    />
  );
}
