import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { Bookmark, Clock, Heart, LayoutDashboard, LogOut } from "lucide-react";
import ProfileForm from "@/components/ProfileForm";
import { PageHeader } from "@/components/Sections";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logoutAction } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { getUserLibrary } from "@/lib/queries";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const [[row], lib] = await Promise.all([
    db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, user.id)).limit(1),
    getUserLibrary(user.id),
  ]);
  const stats = [
    { label: "Bookmarks", value: lib.bookmarks.length, icon: Bookmark, href: "/library?tab=bookmarks" },
    { label: "Favorites", value: lib.favorites.length, icon: Heart, href: "/library?tab=favorites" },
    { label: "Novels started", value: lib.history.length, icon: Clock, href: "/library?tab=history" },
  ];

  return (
    <>
      <PageHeader eyebrow="Account" title="Your Profile" />
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-3xl border border-white/5 bg-coal p-8 text-center lg:row-span-2">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-sea to-mint font-display text-4xl font-bold text-ink shadow-[0_0_50px_-10px_rgba(32,178,170,0.8)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">{user.name}</h2>
          <p className="text-sm text-mist">{user.email}</p>
          <span className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${user.role === "admin" ? "bg-sea text-ink" : "bg-white/5 text-mint"}`}>
            {user.role === "admin" ? "Administrator" : "Reader"}
          </span>
          <p className="mt-4 text-xs text-mist/70">Member since {formatDate(row?.createdAt)}</p>
          <div className="mt-6 grid gap-2">
            {user.role === "admin" && (
              <Link href="/admin" className="btn-primary w-full"><LayoutDashboard size={16} /> Admin Dashboard</Link>
            )}
            <form action={logoutAction}>
              <button className="btn-ghost w-full !text-red-300"><LogOut size={16} /> Log out</button>
            </form>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 lg:col-span-2">
          {stats.map((s) => (
            <Link key={s.label} href={s.href} className="rounded-3xl border border-white/5 bg-coal p-5 text-center transition hover:border-sea/40">
              <s.icon className="mx-auto text-sea" size={22} />
              <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
              <p className="text-xs text-mist">{s.label}</p>
            </Link>
          ))}
        </div>
        <div className="rounded-3xl border border-white/5 bg-coal p-6 lg:col-span-2">
          <h3 className="mb-4 font-display text-xl font-semibold">Edit profile</h3>
          <ProfileForm name={user.name} />
        </div>
      </div>
    </>
  );
}
