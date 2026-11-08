"use server";

import bcrypt from "bcryptjs";
import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { chapters, contactMessages, libraryEntries, novels, readingProgress, users } from "@/db/schema";
import { createSession, destroySession, getAdmin, getCurrentUser } from "./auth";
import { GENRE_NAMES, slugify } from "./genres";
import { ensureSeeded } from "./seed";

export type FormState = { error?: string; ok?: string } | undefined;

function safeNext(next: unknown) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/library";
}

/* ---------------- Auth ---------------- */

export async function signupAction(_: FormState, fd: FormData): Promise<FormState> {
  await ensureSeeded();
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (name.length < 2) return { error: "Please enter your name (at least 2 characters)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (exists.length) return { error: "An account with this email already exists. Try logging in." };
  const hash = await bcrypt.hash(password, 10);
  // Public sign-ups are ALWAYS readers. Admin role can never be self-assigned.
  const [u] = await db.insert(users).values({ name, email, passwordHash: hash, role: "reader" }).returning({ id: users.id });
  await createSession(u.id);
  redirect(safeNext(fd.get("next")));
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  await ensureSeeded();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  if (!email || !password) return { error: "Please enter your email and password." };
  const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) return { error: "Incorrect email or password." };
  await createSession(u.id);
  const next = fd.get("next");
  redirect(u.role === "admin" && !next ? "/admin" : safeNext(next));
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in." };
  const name = String(fd.get("name") || "").trim();
  if (name.length < 2) return { error: "Name must be at least 2 characters." };
  await db.update(users).set({ name }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return { ok: "Profile updated." };
}

/* ---------------- Library ---------------- */

export async function toggleLibraryAction(novelId: number, kind: "bookmark" | "favorite", chapterNumber?: number | null) {
  const user = await getCurrentUser();
  if (!user) return { error: "login" as const };
  if (kind !== "bookmark" && kind !== "favorite") return { error: "invalid" as const };
  const where = and(eq(libraryEntries.userId, user.id), eq(libraryEntries.novelId, novelId), eq(libraryEntries.kind, kind));
  const existing = await db.select({ id: libraryEntries.id, ch: libraryEntries.chapterNumber }).from(libraryEntries).where(where).limit(1);
  // If a chapter is provided and bookmark exists for a different chapter, move it instead of removing.
  if (existing.length && chapterNumber != null && existing[0].ch !== chapterNumber) {
    await db.update(libraryEntries).set({ chapterNumber }).where(eq(libraryEntries.id, existing[0].id));
    revalidatePath("/library");
    return { active: true };
  }
  if (existing.length) {
    await db.delete(libraryEntries).where(where);
    revalidatePath("/library");
    return { active: false };
  }
  await db.insert(libraryEntries).values({ userId: user.id, novelId, kind, chapterNumber: chapterNumber ?? null }).onConflictDoNothing();
  revalidatePath("/library");
  return { active: true };
}

export async function saveProgressAction(novelId: number, chapterNumber: number, percent: number) {
  const user = await getCurrentUser();
  if (!user) return;
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  await db
    .insert(readingProgress)
    .values({ userId: user.id, novelId, chapterNumber, percent: p, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [readingProgress.userId, readingProgress.novelId],
      set: { chapterNumber, percent: p, updatedAt: new Date() },
    });
}

/* ---------------- Admin ---------------- */

function revalidateAll() {
  revalidatePath("/", "layout");
}

function readNovelForm(fd: FormData) {
  return {
    title: String(fd.get("title") || "").trim(),
    author: String(fd.get("author") || "").trim(),
    genre: String(fd.get("genre") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    coverUrl: String(fd.get("coverUrl") || "").trim() || null,
    published: fd.get("published") === "on",
    featured: fd.get("featured") === "on",
  };
}

function validateNovel(n: ReturnType<typeof readNovelForm>) {
  if (n.title.length < 1) return "Title is required.";
  if (n.author.length < 1) return "Author name is required.";
  if (!GENRE_NAMES.includes(n.genre)) return "Please select a valid category.";
  if (n.description.length < 10) return "Description should be at least 10 characters.";
  if (n.coverUrl && !(n.coverUrl.startsWith("/") || /^https?:\/\//.test(n.coverUrl))) return "Invalid cover image URL.";
  return null;
}

async function uniqueSlug(title: string, excludeId?: number) {
  const base = slugify(title) || "novel";
  let slug = base;
  for (let i = 2; i < 500; i++) {
    const rows = await db.select({ id: novels.id }).from(novels).where(eq(novels.slug, slug)).limit(1);
    if (!rows.length || rows[0].id === excludeId) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function createNovelAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await getAdmin())) return { error: "Only administrators can publish novels." };
  const n = readNovelForm(fd);
  const err = validateNovel(n);
  if (err) return { error: err };
  const slug = await uniqueSlug(n.title);
  const [row] = await db
    .insert(novels)
    .values({ ...n, slug, publishedAt: n.published ? new Date() : null })
    .returning({ id: novels.id });
  revalidateAll();
  redirect(`/admin/novels/${row.id}?created=1`);
}

export async function updateNovelAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await getAdmin())) return { error: "Only administrators can edit novels." };
  const id = Number(fd.get("id"));
  const n = readNovelForm(fd);
  const err = validateNovel(n);
  if (err) return { error: err };
  const [current] = await db.select().from(novels).where(eq(novels.id, id)).limit(1);
  if (!current) return { error: "Novel not found." };
  const slug = current.title === n.title ? current.slug : await uniqueSlug(n.title, id);
  await db
    .update(novels)
    .set({
      ...n,
      slug,
      updatedAt: new Date(),
      publishedAt: n.published ? current.publishedAt ?? new Date() : current.publishedAt,
    })
    .where(eq(novels.id, id));
  revalidateAll();
  return { ok: "Novel saved successfully." };
}

export async function deleteNovelAction(id: number) {
  if (!(await getAdmin())) return { error: "Unauthorized" };
  await db.delete(novels).where(eq(novels.id, id));
  revalidateAll();
  return { ok: true };
}

export async function toggleNovelFlagAction(id: number, flag: "published" | "featured") {
  if (!(await getAdmin())) return { error: "Unauthorized" };
  const [n] = await db.select().from(novels).where(eq(novels.id, id)).limit(1);
  if (!n) return { error: "Not found" };
  if (flag === "published") {
    const published = !n.published;
    await db
      .update(novels)
      .set({ published, publishedAt: published ? n.publishedAt ?? new Date() : n.publishedAt, updatedAt: published ? new Date() : n.updatedAt })
      .where(eq(novels.id, id));
  } else {
    await db.update(novels).set({ featured: !n.featured }).where(eq(novels.id, id));
  }
  revalidateAll();
  return { ok: true };
}

export async function saveChapterAction(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await getAdmin())) return { error: "Only administrators can edit chapters." };
  const novelId = Number(fd.get("novelId"));
  const chapterId = fd.get("chapterId") ? Number(fd.get("chapterId")) : null;
  const title = String(fd.get("title") || "").trim();
  const content = String(fd.get("content") || "").replace(/\r\n/g, "\n").trim();
  let number = Number(fd.get("number"));
  const intent = String(fd.get("intent") || "save");
  if (!title) return { error: "Chapter title is required." };
  if (content.length < 20) return { error: "Chapter content is too short (minimum 20 characters)." };
  const [novel] = await db.select({ id: novels.id }).from(novels).where(eq(novels.id, novelId)).limit(1);
  if (!novel) return { error: "Novel not found." };
  if (!Number.isInteger(number) || number < 1) {
    const [{ m }] = await db.select({ m: max(chapters.number) }).from(chapters).where(eq(chapters.novelId, novelId));
    number = (m ?? 0) + 1;
  }
  const clash = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.novelId, novelId), eq(chapters.number, number)))
    .limit(1);
  if (clash.length && clash[0].id !== chapterId) return { error: `Chapter number ${number} already exists for this novel.` };

  if (chapterId) {
    await db.update(chapters).set({ title, content, number, updatedAt: new Date() }).where(eq(chapters.id, chapterId));
  } else {
    await db.insert(chapters).values({ novelId, title, content, number });
  }
  await db.update(novels).set({ updatedAt: new Date() }).where(eq(novels.id, novelId));
  revalidateAll();
  if (intent === "another") redirect(`/admin/novels/${novelId}/chapters/new?saved=${number}`);
  redirect(`/admin/novels/${novelId}?chapterSaved=${number}`);
}

export async function deleteChapterAction(id: number) {
  if (!(await getAdmin())) return { error: "Unauthorized" };
  const [ch] = await db.select({ novelId: chapters.novelId }).from(chapters).where(eq(chapters.id, id)).limit(1);
  await db.delete(chapters).where(eq(chapters.id, id));
  if (ch) await db.update(novels).set({ updatedAt: new Date() }).where(eq(novels.id, ch.novelId));
  revalidateAll();
  return { ok: true };
}

/* ---------------- Contact ---------------- */

export async function contactAction(_: FormState, fd: FormData): Promise<FormState> {
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const email = String(fd.get("email") || "").trim().slice(0, 255);
  const subject = String(fd.get("subject") || "").trim().slice(0, 200) || "General enquiry";
  const message = String(fd.get("message") || "").trim().slice(0, 5000);
  if (name.length < 2) return { error: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };
  if (message.length < 10) return { error: "Your message should be at least 10 characters." };
  await db.insert(contactMessages).values({ name, email, subject, message });
  return { ok: "Thank you! Your message has been sent. We'll get back to you soon." };
}
