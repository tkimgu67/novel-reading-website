import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import ChapterEditor from "@/components/admin/ChapterEditor";
import { db } from "@/db";
import { chapters, novels } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function EditChapterPage({ params }: { params: Promise<{ id: string; chapterId: string }> }) {
  await requireAdmin();
  const { id, chapterId } = await params;
  const nid = Number(id);
  const cid = Number(chapterId);
  if (!Number.isInteger(nid) || !Number.isInteger(cid)) notFound();
  const [novel] = await db.select({ id: novels.id, title: novels.title }).from(novels).where(eq(novels.id, nid)).limit(1);
  const [ch] = await db.select().from(chapters).where(and(eq(chapters.id, cid), eq(chapters.novelId, nid))).limit(1);
  if (!novel || !ch) notFound();

  return (
    <div className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
      <ChapterEditor
        novelId={novel.id}
        novelTitle={novel.title}
        suggestedNumber={ch.number}
        chapter={{ id: ch.id, number: ch.number, title: ch.title, content: ch.content }}
      />
    </div>
  );
}
