import { notFound } from "next/navigation";
import { eq, max } from "drizzle-orm";
import ChapterEditor from "@/components/admin/ChapterEditor";
import { db } from "@/db";
import { chapters, novels } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

export default async function NewChapterPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved } = await searchParams;
  const nid = Number(id);
  if (!Number.isInteger(nid)) notFound();
  const [novel] = await db.select({ id: novels.id, title: novels.title }).from(novels).where(eq(novels.id, nid)).limit(1);
  if (!novel) notFound();
  const [{ m }] = await db.select({ m: max(chapters.number) }).from(chapters).where(eq(chapters.novelId, nid));
  const next = (m ?? 0) + 1;

  return (
    <div className="rounded-3xl border border-white/5 bg-coal p-6 sm:p-8">
      {saved && <div className="mb-6 rounded-2xl border border-sea/30 bg-sea/10 px-5 py-3 text-sm text-mint">Chapter {saved} published! Keep the momentum going.</div>}
      <ChapterEditor key={next} novelId={novel.id} novelTitle={novel.title} suggestedNumber={next} />
    </div>
  );
}
