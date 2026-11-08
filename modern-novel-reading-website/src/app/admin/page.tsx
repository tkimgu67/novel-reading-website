import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";
import { BookOpen, Eye, FileText, PlusCircle, Users } from "lucide-react";
import Cover from "@/components/Cover";
import { FlagToggle, RowActions } from "@/components/admin/NovelRowActions";
import { formatNum } from "@/components/NovelCard";
import { db } from "@/db";
import { chapters, contactMessages, novels, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import { chapterCountSql } from "@/lib/queries";
import { ensureSeeded } from "@/lib/seed";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  await ensureSeeded();
  const sp = await searchParams;
  const [list, [{ chapterTotal }], [{ userTotal }]] = await Promise.all([
    db
      .select({
        id: novels.id,
        slug: novels.slug,
        title: novels.title,
        author: novels.author,
        genre: novels.genre,
        coverUrl: novels.coverUrl,
        published: novels.published,
        featured: novels.featured,
        views: novels.views,
        updatedAt: novels.updatedAt,
        chapterCount: chapterCountSql,
      })
      .from(novels)
      .orderBy(desc(novels.updatedAt)),
    db.select({ chapterTotal: count() }).from(chapters),
    db.select({ userTotal: count() }).from(users).where(eq(users.role, "reader")),
  ]);
  const messages = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(5);
  const views = list.reduce((a, n) => a + n.views, 0);
  const q = sp.q?.toLowerCase().trim();
  const filtered = list.filter(
    (n) =>
      (!q || n.title.toLowerCase().includes(q) || n.author.toLowerCase().includes(q)) &&
      (!sp.status || (sp.status === "published" ? n.published : sp.status === "draft" ? !n.published : sp.status === "featured" ? n.featured : true)),
  );

  const stats = [
    { label: "Total novels", value: list.length, sub: `${list.filter((n) => n.published).length} published`, icon: BookOpen },
    { label: "Chapters", value: chapterTotal, sub: "across all novels", icon: FileText },
    { label: "Readers", value: userTotal, sub: "registered accounts", icon: Users },
    { label: "Total reads", value: formatNum(views), sub: "chapter views", icon: Eye },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-white/5 bg-coal p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-mist">{s.label}</p>
              <s.icon size={18} className="text-sea" />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">{s.value}</p>
            <p className="text-xs text-mist/70">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/5 bg-coal">
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-display text-2xl font-bold">Manage Novels</h2>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input name="q" defaultValue={sp.q} placeholder="Search title or author…" className="input !rounded-full !py-2 sm:w-64" />
            <select name="status" defaultValue={sp.status ?? ""} className="input !rounded-full !py-2 sm:w-40">
              <option value="">All</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              <option value="featured">Featured</option>
            </select>
            <button className="btn-ghost !py-2 text-sm">Filter</button>
          </form>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-mist">No novels found.</p>
            <Link href="/admin/novels/new" className="btn-primary mt-4"><PlusCircle size={16} /> Add your first novel</Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((n) => (
              <li key={n.id} className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center">
                <Link href={`/admin/novels/${n.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <Cover src={n.coverUrl} title={n.title} className="h-20 w-14 shrink-0 rounded-lg" />
                  <div className="min-w-0">
                    <p className="truncate font-display text-lg font-semibold hover:text-mint">{n.title}</p>
                    <p className="truncate text-sm text-mist">{n.author} · <span className="text-sea">{n.genre}</span></p>
                    <p className="text-xs text-mist/60">{n.chapterCount} chapters · {formatNum(n.views)} reads · updated {timeAgo(n.updatedAt)}</p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <FlagToggle id={n.id} flag="published" value={n.published} />
                  <FlagToggle id={n.id} flag="featured" value={n.featured} />
                </div>
                <RowActions id={n.id} title={n.title} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-white/5 bg-coal p-5 sm:p-6">
        <h2 className="mb-4 font-display text-2xl font-bold">Recent Messages</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-mist">No contact messages yet.</p>
        ) : (
          <ul className="grid gap-3">
            {messages.map((m) => (
              <li key={m.id} className="rounded-2xl border border-white/5 bg-ink/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold">{m.name} <a href={`mailto:${m.email}`} className="font-normal text-sea hover:underline">{m.email}</a></span>
                  <span className="text-xs text-mist/70">{m.subject} · {timeAgo(m.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-mist">{m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
