import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const COOKIE = "hnw_session";
const SESSION_DAYS = 30;

export type SessionUser = { id: number; name: string; email: string; role: string };

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const rows = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function requireUser(next = "/library") {
  const u = await getCurrentUser();
  if (!u) redirect(`/login?next=${encodeURIComponent(next)}`);
  return u;
}

export async function requireAdmin() {
  const u = await getCurrentUser();
  if (!u) redirect("/login?next=/admin");
  if (u.role !== "admin") redirect("/?denied=1");
  return u;
}

/** For API routes / server actions: returns admin user or null. */
export async function getAdmin() {
  const u = await getCurrentUser();
  return u && u.role === "admin" ? u : null;
}
