import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, PlusCircle, Globe, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin Dashboard", robots: { index: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-28 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-sea/20 bg-gradient-to-r from-coal to-coal-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sea/15 text-mint"><ShieldCheck size={22} /></span>
          <div>
            <p className="font-display text-xl font-bold">Admin Studio</p>
            <p className="text-xs text-mist">Signed in as {admin.email}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link href="/admin" className="btn-ghost !px-4 !py-2 text-sm"><LayoutDashboard size={16} /> Dashboard</Link>
          <Link href="/admin/novels/new" className="btn-primary !px-4 !py-2 text-sm"><PlusCircle size={16} /> New Novel</Link>
          <Link href="/" className="btn-ghost !px-4 !py-2 text-sm"><Globe size={16} /> View Site</Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
