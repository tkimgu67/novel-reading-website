import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExternalLink, FilePlus2, Pencil } from "lucide-react";
import NovelForm from "@/components/admin/NovelForm";
import ChapterDelete from "@/components/admin/ChapterDelete";
import { FlagToggle, RowActions } from "@/components/admin/NovelRowActions";
import { db } from "@/db";
import { novels } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { getChapterList } from "@/lib/queries";

export default async function EditNovelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; chapterSaved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;
  const nid = Number(id);
  if (!Number.isInteger(nid)) notFound();
  const [novel] = await db.select().from(novels).where(eq(novels.id, nid)).limit(1);
  if (!novel) notFound();
  const list = await getChapterList(nid);

  return (
    <div className="space-y-8">
      {sp.created && <div className="rounded-2xl border border-sea/30 bg-sea/10 px-5 py-3 text-sm text-mint">Novel created! Now add your first chapter below.</div>}
      {sp.chapterSaved && <div className="rounded-2xl border border-sea/30 bg-sea/10 px-5 py-3 text-sm text-mint">Chapter {sp.chapterSaved} saved successfully.</div>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-sea">Editing novel</p>
          <h1 className="font-display text-3xl font-bold">{novel.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FlagToggle id={novel.id} flag="published" value={novel.published} />
          <FlagToggle id={novel.id} flag="featured" value={novel.featured} />
          <Link href={`/novel/${novel.slug}`} className="btn-ghost !px-4 !py-2 text-sm" target="_blank"><ExternalLink size={14} /> View</Link>
          <RowActions id={novel.id} title={novel.title} />
        </div>
      </div>

      <section className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">Chapters <span className="text-base font-normal text-mist">({list.length})</span></h2>
          <Link href={`/admin/novels/${novel.id}/chapters/new`} className="btn-primary !py-2.5 text-sm"><FilePlus2 size={16} /> Add chapter</Link>
        </div>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-mist">
            No chapters yet. <Link href={`/admin/novels/${novel.id}/chapters/new`} className="text-mint underline">Write the first one</Link>.
          </div>
        ) : (
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
            {list.map((c) => (
              <li key={c.id} className="flex items-center gap-4 bg-ink/40 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-coal font-semibold text-sea">{c.number}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.title}</p>
                  <p className="text-xs text-mist/70">{(c.words || 0).toLocaleString()} words · added {timeAgo(c.createdAt)}</p>
                </div>
                <Link href={`/read/${novel.slug}/${c.number}`} target="_blank" className="hidden h-9 w-9 place-items-center rounded-full border border-white/10 text-mist hover:border-sea hover:text-mint sm:grid" title="Preview">
                  <ExternalLink size={15} />
                </Link>
                <Link href={`/admin/novels/${novel.id}/chapters/${c.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-mist hover:border-sea hover:text-mint" title="Edit chapter">
                  <Pencil size={15} />
                </Link>
                <ChapterDelete id={c.id} label={`Chapter ${c.number}: ${c.title}`} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
        <h2 className="mb-6 font-display text-2xl font-bold">Novel details</h2>
        <NovelForm
          key={novel.updatedAt.toISOString()}
          novel={{
            id: novel.id,
            title: novel.title,
            author: novel.author,
            genre: novel.genre,
            description: novel.description,
            coverUrl: novel.coverUrl,
            published: novel.published,
            featured: novel.featured,
          }}
        />
      </section>
    </div>
  );
}
