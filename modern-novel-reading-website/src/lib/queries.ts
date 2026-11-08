import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { chapters, libraryEntries, novels, readingProgress } from "@/db/schema";
import { ensureSeeded } from "./seed";

export const chapterCountSql = sql<number>`(select count(*) from chapters c where c.novel_id = ${novels.id})`.mapWith(Number);
export const lastChapterAtSql = sql<Date | null>`(select max(c.created_at) from chapters c where c.novel_id = ${novels.id})`;

export const novelCardFields = {
  id: novels.id,
  slug: novels.slug,
  title: novels.title,
  author: novels.author,
  genre: novels.genre,
  description: novels.description,
  coverUrl: novels.coverUrl,
  views: novels.views,
  featured: novels.featured,
  publishedAt: novels.publishedAt,
  updatedAt: novels.updatedAt,
  chapterCount: chapterCountSql,
};

export type NovelCardData = {
  id: number;
  slug: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  coverUrl: string | null;
  views: number;
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  chapterCount: number;
};

export async function getFeaturedNovels(limit = 8): Promise<NovelCardData[]> {
  await ensureSeeded();
  return db
    .select(novelCardFields)
    .from(novels)
    .where(and(eq(novels.published, true), eq(novels.featured, true)))
    .orderBy(desc(novels.updatedAt))
    .limit(limit);
}

export async function getPopularNovels(limit = 6): Promise<NovelCardData[]> {
  await ensureSeeded();
  return db.select(novelCardFields).from(novels).where(eq(novels.published, true)).orderBy(desc(novels.views)).limit(limit);
}

export async function getNewNovels(limit = 6): Promise<NovelCardData[]> {
  await ensureSeeded();
  return db
    .select(novelCardFields)
    .from(novels)
    .where(eq(novels.published, true))
    .orderBy(desc(sql`coalesce(${novels.publishedAt}, ${novels.createdAt})`))
    .limit(limit);
}

export async function getUpdatedNovels(limit = 6): Promise<NovelCardData[]> {
  await ensureSeeded();
  return db.select(novelCardFields).from(novels).where(eq(novels.published, true)).orderBy(desc(novels.updatedAt)).limit(limit);
}

export type SearchOptions = { q?: string; by?: string; genre?: string; sort?: string };

export async function searchNovels(opts: SearchOptions): Promise<NovelCardData[]> {
  await ensureSeeded();
  const conds: SQL[] = [eq(novels.published, true)];
  const q = opts.q?.trim();
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    if (opts.by === "title") conds.push(ilike(novels.title, like));
    else if (opts.by === "author") conds.push(ilike(novels.author, like));
    else conds.push(or(ilike(novels.title, like), ilike(novels.author, like), ilike(novels.genre, like))!);
  }
  if (opts.genre) conds.push(eq(novels.genre, opts.genre));
  const order =
    opts.sort === "popular"
      ? [desc(novels.views)]
      : opts.sort === "az"
        ? [asc(novels.title)]
        : opts.sort === "za"
          ? [desc(novels.title)]
          : [desc(novels.updatedAt)];
  return db.select(novelCardFields).from(novels).where(and(...conds)).orderBy(...order).limit(100);
}

export async function getGenreCounts(): Promise<Record<string, number>> {
  await ensureSeeded();
  const rows = await db
    .select({ genre: novels.genre, c: sql<number>`count(*)`.mapWith(Number) })
    .from(novels)
    .where(eq(novels.published, true))
    .groupBy(novels.genre);
  return Object.fromEntries(rows.map((r) => [r.genre, r.c]));
}

export async function getNovelBySlug(slug: string, includeUnpublished = false) {
  await ensureSeeded();
  const rows = await db
    .select({ ...novelCardFields, published: novels.published, createdAt: novels.createdAt })
    .from(novels)
    .where(includeUnpublished ? eq(novels.slug, slug) : and(eq(novels.slug, slug), eq(novels.published, true)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getChapterList(novelId: number) {
  return db
    .select({
      id: chapters.id,
      number: chapters.number,
      title: chapters.title,
      createdAt: chapters.createdAt,
      words: sql<number>`array_length(regexp_split_to_array(trim(${chapters.content}), '\\s+'), 1)`.mapWith(Number),
    })
    .from(chapters)
    .where(eq(chapters.novelId, novelId))
    .orderBy(asc(chapters.number));
}

export async function getChapter(novelId: number, number: number) {
  const rows = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.novelId, novelId), eq(chapters.number, number)))
    .limit(1);
  return rows[0] ?? null;
}

export async function incrementViews(novelId: number) {
  await db.update(novels).set({ views: sql`${novels.views} + 1` }).where(eq(novels.id, novelId));
}

export async function getLatestChapters(limit = 12) {
  await ensureSeeded();
  return db
    .select({
      id: chapters.id,
      number: chapters.number,
      title: chapters.title,
      createdAt: chapters.createdAt,
      novelSlug: novels.slug,
      novelTitle: novels.title,
      novelCover: novels.coverUrl,
      genre: novels.genre,
      author: novels.author,
    })
    .from(chapters)
    .innerJoin(novels, eq(novels.id, chapters.novelId))
    .where(eq(novels.published, true))
    .orderBy(desc(chapters.createdAt))
    .limit(limit);
}

export async function getUserNovelState(userId: number, novelId: number) {
  const [entries, progress] = await Promise.all([
    db
      .select({ kind: libraryEntries.kind, chapterNumber: libraryEntries.chapterNumber })
      .from(libraryEntries)
      .where(and(eq(libraryEntries.userId, userId), eq(libraryEntries.novelId, novelId))),
    db
      .select({ chapterNumber: readingProgress.chapterNumber, percent: readingProgress.percent })
      .from(readingProgress)
      .where(and(eq(readingProgress.userId, userId), eq(readingProgress.novelId, novelId)))
      .limit(1),
  ]);
  const bookmark = entries.find((e) => e.kind === "bookmark");
  return {
    bookmarked: !!bookmark,
    bookmarkChapter: bookmark?.chapterNumber ?? null,
    favorited: entries.some((e) => e.kind === "favorite"),
    progress: progress[0] ?? null,
  };
}

export async function getUserBookmarkedIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ novelId: libraryEntries.novelId })
    .from(libraryEntries)
    .where(and(eq(libraryEntries.userId, userId), eq(libraryEntries.kind, "bookmark")));
  return rows.map((r) => r.novelId);
}

export async function getUserLibrary(userId: number) {
  const libRows = await db
    .select({ ...novelCardFields, kind: libraryEntries.kind, bookmarkChapter: libraryEntries.chapterNumber, addedAt: libraryEntries.createdAt })
    .from(libraryEntries)
    .innerJoin(novels, eq(novels.id, libraryEntries.novelId))
    .where(and(eq(libraryEntries.userId, userId), eq(novels.published, true)))
    .orderBy(desc(libraryEntries.createdAt));
  const history = await db
    .select({ ...novelCardFields, chapterNumber: readingProgress.chapterNumber, percent: readingProgress.percent, readAt: readingProgress.updatedAt })
    .from(readingProgress)
    .innerJoin(novels, eq(novels.id, readingProgress.novelId))
    .where(and(eq(readingProgress.userId, userId), eq(novels.published, true)))
    .orderBy(desc(readingProgress.updatedAt))
    .limit(50);
  return {
    bookmarks: libRows.filter((r) => r.kind === "bookmark"),
    favorites: libRows.filter((r) => r.kind === "favorite"),
    history,
  };
}
